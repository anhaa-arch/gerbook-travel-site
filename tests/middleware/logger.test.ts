import { Request, Response, NextFunction } from 'express';
import logger from '../../middleware/logger';

describe('Logger Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock request object
    mockRequest = {
      method: 'GET',
      protocol: 'http',
      host: 'example.com',
      originalUrl: '/api/users'
    };

    // Mock response object
    mockResponse = {};

    // Mock next function
    nextFunction = jest.fn();

    // Spy on console.log
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    // Restore console.log
    consoleLogSpy.mockRestore();
  });

  it('should log the request details', () => {
    // Call the middleware
    logger(mockRequest as Request, mockResponse as Response, nextFunction);

    // Check that console.log was called with the expected message
    expect(consoleLogSpy).toHaveBeenCalledWith('GET:http://example.com/api/users');
  });

  it('should call the next middleware', () => {
    // Call the middleware
    logger(mockRequest as Request, mockResponse as Response, nextFunction);

    // Check that next was called
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should log different request methods and URLs', () => {
    // Test with POST request
    mockRequest.method = 'POST';
    mockRequest.originalUrl = '/api/auth/login';
    
    // Call the middleware
    logger(mockRequest as Request, mockResponse as Response, nextFunction);

    // Check that console.log was called with the expected message
    expect(consoleLogSpy).toHaveBeenCalledWith('POST:http://example.com/api/auth/login');

    // Test with PUT request
    mockRequest.method = 'PUT';
    mockRequest.originalUrl = '/api/users/123';
    
    // Call the middleware
    logger(mockRequest as Request, mockResponse as Response, nextFunction);

    // Check that console.log was called with the expected message
    expect(consoleLogSpy).toHaveBeenCalledWith('PUT:http://example.com/api/users/123');
  });
});