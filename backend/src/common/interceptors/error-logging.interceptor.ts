import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        tap(null, (exception) => {
          const ctx = context.switchToHttp();
          const request = ctx.getRequest();
          const response = ctx.getResponse();
          this.logger.error(
            `Error en la petición ${request.method} ${request.url}`,
            exception.stack,
            `Status: ${response.statusCode}`,
          );
        }),
      );
  }
}