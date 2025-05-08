import { HttpException, HttpStatus } from '@nestjs/common'; 
import { ArgumentsHost } from '@nestjs/common/interfaces';
import { Response, Request } from 'express';
import { Mock } from 'jest-mock';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockArgumentsHost: ArgumentsHost;
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: mockStatus,
    };
    mockRequest = {
      url: '/test',
      method: 'GET',
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }) as Mock<(...args: any[]) => any>,
      switchToRpc: jest.fn() as Mock<(...args: any[]) => any>,
      switchToWs: jest.fn() as Mock<(...args: any[]) => any>,
      getArgs: jest.fn() as Mock<(...args: any[]) => any>,
      getArgByIndex: jest.fn() as Mock<(index: number) => any>,
      getType: jest.fn().mockReturnValue('http') as () => any, // Aserción de tipo más precisa
    };
    mockJson.mockClear();
    mockStatus.mockClear();
  });

  it('should catch HttpException and format the response', () => {
    const exception = new HttpException({ message: 'Test Error', statusCode: HttpStatus.BAD_REQUEST }, HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Test Error',
      timestamp: expect.any(String),
      path: '/test',
    });
  });
  it('should catch HttpException with string response and format the response', () => {
    const exception = new HttpException('Simple Test Error', HttpStatus.UNAUTHORIZED);
    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Simple Test Error',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should catch a generic Error and format the response as internal server error', () => {
    const exception = new Error('Generic Error');
    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor.',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should catch an unknown exception and format the response as internal server error', () => {
    const exception = 'Unknown Exception';
    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor.',
      timestamp: expect.any(String),
      path: '/test',
    });
  });
});