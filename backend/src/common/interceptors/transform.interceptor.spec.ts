import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  const mockData = { id: 1, name: 'Test' };

  beforeEach(() => {
    interceptor = new TransformInterceptor();
    mockExecutionContext = {} as ExecutionContext;
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(mockData)),
    };
  });

  it('should transform the response by wrapping it in a data key', async () => {
    const result = await interceptor.intercept(mockExecutionContext, mockCallHandler).toPromise();
    expect(result).toEqual({ data: mockData });
  });

  it('should handle null data', async () => {
    (mockCallHandler.handle as jest.Mock).mockReturnValueOnce(of(null));
    const result = await interceptor.intercept(mockExecutionContext, mockCallHandler).toPromise();
    expect(result).toEqual({ data: null });
  });

  it('should handle undefined data', async () => {
    (mockCallHandler.handle as jest.Mock).mockReturnValueOnce(of(undefined));
    const result = await interceptor.intercept(mockExecutionContext, mockCallHandler).toPromise();
    expect(result).toEqual({ data: undefined });
  });

  it('should work with different types of data', async () => {
    const mockArrayData = [1, 2, 3];
    (mockCallHandler.handle as jest.Mock).mockReturnValueOnce(of(mockArrayData));
    let result = await interceptor.intercept(mockExecutionContext, mockCallHandler).toPromise();
    expect(result).toEqual({ data: mockArrayData });

    const mockStringData = 'Hello';
    (mockCallHandler.handle as jest.Mock).mockReturnValueOnce(of(mockStringData));
    result = await interceptor.intercept(mockExecutionContext, mockCallHandler).toPromise();
    expect(result).toEqual({ data: mockStringData });
  });
});