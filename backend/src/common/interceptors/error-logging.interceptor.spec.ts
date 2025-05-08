import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLoggingInterceptor } from './error-logging.interceptor';

describe('ErrorLoggingInterceptor', () => {
  let interceptor: ErrorLoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockLogger: Logger;
  const mockError = new Error('Test Error Stack');

  beforeEach(() => {
    mockLogger = { error: jest.fn() } as any;
    interceptor = new ErrorLoggingInterceptor();
    (interceptor as any).logger = mockLogger;
    mockRequest = {
      method: 'GET',
      url: '/test',
    };
    mockResponse = {
      statusCode: 400,
    };
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as any; // Casteamos a any para simplificar el mock

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(throwError(mockError)), // Simula un error lanzado por el controlador
    };
  });

  it('should log an error with request details and status code when an exception is thrown', async () => {
    try {
      await interceptor.intercept(mockExecutionContext, mockCallHandler).toPromise();
    } catch (error) {
      // No necesitamos hacer nada con el error aquí, solo verificar el log
    }

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error en la petición GET /test',
      mockError.stack,
      'Status: 400',
    );
  });

  it('should handle different HTTP methods and URLs', async () => {
    mockRequest.method = 'POST';
    mockRequest.url = '/users';
    mockResponse.statusCode = 500;
    (mockCallHandler.handle as jest.Mock).mockReturnValueOnce(throwError(new Error('Another Error')));

    try {
      await interceptor.intercept(mockExecutionContext, mockCallHandler).toPromise();
    } catch (error) {
      // No necesitamos hacer nada con el error aquí
    }

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error en la petición POST /users',
      expect.any(String), // No verificamos el stack específico aquí
      'Status: 500',
    );
  });

  it('should not log anything if no error is thrown', async () => {
    (mockCallHandler.handle as jest.Mock).mockReturnValueOnce(new Observable((subscriber) => subscriber.complete()));
    await interceptor.intercept(mockExecutionContext, mockCallHandler).toPromise();
    expect(mockLogger.error).not.toHaveBeenCalled();
  });
});