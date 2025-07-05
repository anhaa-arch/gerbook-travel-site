import { Request, Response, NextFunction } from 'express';
import errorHandler from '../../middleware/error';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Mock request object
    mockRequest = {};

    // Mock response object with json and status methods
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock next function
    nextFunction = jest.fn();
  });

  it('should handle generic errors with 500 status code', () => {
    // Create a generic error
    const error = new Error('Something went wrong');
    
    // Call the middleware
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Check that status was called with 500
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    
    // Check that json was called with the error
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        message: 'Something went wrong'
      })
    });
  });

  it('should handle errors with custom status codes', () => {
    // Create an error with a custom status code
    const error = new Error('Not found') as any;
    error.statusCode = 404;
    
    // Call the middleware
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Check that status was called with the custom status code
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    
    // Check that json was called with the error
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        message: 'Not found',
        statusCode: 404
      })
    });
  });

  it('should handle CastError with 400 status code', () => {
    // Create a CastError
    const error = new Error('Cast to ObjectId failed') as any;
    error.name = 'CastError';
    
    // Call the middleware
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Check that status was called with 400
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    
    // Check that json was called with the error and custom message
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        message: 'Энэ ID буруу бүтэцтэй ID байна!',
        statusCode: 400
      })
    });
  });

  it('should handle duplicate key errors with 400 status code', () => {
    // Create a duplicate key error
    const error = new Error('Duplicate key error') as any;
    error.code = 11000;
    
    // Call the middleware
    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Check that status was called with 400
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    
    // Check that json was called with the error and custom message
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        message: 'Энэ талбарын утгыг давхардуулж өгч болохгүй!',
        statusCode: 400
      })
    });
  });
});