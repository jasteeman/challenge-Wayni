import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | { message: string } = 'Ha ocurrido un error interno en el servidor.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      message = (responseBody as { message: string } | string) || message;
      this.logger.warn(`HTTP Exception ${status} en ${request.method} ${request.url}: ${JSON.stringify(message)}`); // Logueamos el objeto completo para ver su estructura
    } else if (exception instanceof Error) {
      this.logger.error(`Error no manejado en ${request.method} ${request.url}: ${exception.message}`, exception.stack);
      message = 'Error interno del servidor.';
    } else {
      this.logger.error(`Excepción desconocida en ${request.method} ${request.url}: ${exception}`);
      message = 'Error interno del servidor.';
    }

    // Asegurarse de que message sea siempre una cadena para la respuesta JSON
    const responseMessage = typeof message === 'string' ? message : message.message || 'Error interno del servidor.';

    response.status(status).json({
      statusCode: status,
      message: responseMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}