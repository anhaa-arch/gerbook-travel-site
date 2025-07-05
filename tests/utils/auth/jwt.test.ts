import jwt from 'jsonwebtoken';
import { generateToken, verifyToken, extractToken, getUserId, isAdmin } from '../../../utils/auth/jwt';
import { User } from '@prisma/client';

// Mock jwt library
jest.mock('jsonwebtoken');

describe('JWT Utilities', () => {
  // Mock environment variables
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_EXPIRE = '1h';
  });
  
  afterAll(() => {
    process.env = originalEnv;
  });
  
  describe('generateToken', () => {
    it('should generate a token with user id and role', () => {
      // Mock user
      const user = {
        id: 'user123',
        role: 'USER',
      } as User;
      
      // Mock jwt.sign to return a test token
      (jwt.sign as jest.Mock).mockReturnValue('test_token');
      
      const token = generateToken(user);
      
      // Check that jwt.sign was called with correct parameters
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user123', role: 'USER' },
        'test_secret',
        { expiresIn: '1h' }
      );
      
      // Check that the function returns the token from jwt.sign
      expect(token).toBe('test_token');
    });
    
    it('should use default values if environment variables are not set', () => {
      // Remove environment variables
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXPIRE;
      
      // Mock user
      const user = {
        id: 'user123',
        role: 'USER',
      } as User;
      
      // Mock jwt.sign to return a test token
      (jwt.sign as jest.Mock).mockReturnValue('test_token');
      
      const token = generateToken(user);
      
      // Check that jwt.sign was called with default parameters
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user123', role: 'USER' },
        'default_jwt_secret',
        { expiresIn: '30d' }
      );
    });
  });
  
  describe('verifyToken', () => {
    it('should verify a token and return the payload', () => {
      // Mock payload
      const payload = { id: 'user123', role: 'USER' };
      
      // Mock jwt.verify to return the payload
      (jwt.verify as jest.Mock).mockReturnValue(payload);
      
      const result = verifyToken('test_token');
      
      // Check that jwt.verify was called with correct parameters
      expect(jwt.verify).toHaveBeenCalledWith('test_token', 'test_secret');
      
      // Check that the function returns the payload from jwt.verify
      expect(result).toEqual(payload);
    });
    
    it('should throw an error if token verification fails', () => {
      // Mock jwt.verify to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Token verification failed');
      });
      
      // Check that the function throws an error
      expect(() => verifyToken('invalid_token')).toThrow('Invalid or expired token');
    });
  });
  
  describe('extractToken', () => {
    it('should extract token from authorization header', () => {
      const authHeader = 'Bearer test_token';
      const token = extractToken(authHeader);
      
      expect(token).toBe('test_token');
    });
    
    it('should throw an error if authorization header is missing', () => {
      expect(() => extractToken('')).toThrow(
        'Authorization header must be provided and start with Bearer'
      );
    });
    
    it('should throw an error if authorization header does not start with Bearer', () => {
      expect(() => extractToken('Token test_token')).toThrow(
        'Authorization header must be provided and start with Bearer'
      );
    });
  });
  
  describe('getUserId', () => {
    it('should extract user id from context', () => {
      // Mock context
      const context = {
        req: {
          headers: {
            authorization: 'Bearer test_token'
          }
        }
      };
      
      // Mock jwt.verify to return a payload with id
      (jwt.verify as jest.Mock).mockReturnValue({ id: 'user123', role: 'USER' });
      
      const userId = getUserId(context);
      
      expect(userId).toBe('user123');
    });
    
    it('should throw an error if authorization header is missing', () => {
      // Mock context without authorization header
      const context = {
        req: {
          headers: {}
        }
      };
      
      expect(() => getUserId(context)).toThrow('Not authenticated');
    });
  });
  
  describe('isAdmin', () => {
    it('should return true if user has admin role', () => {
      // Mock context
      const context = {
        req: {
          headers: {
            authorization: 'Bearer test_token'
          }
        }
      };
      
      // Mock jwt.verify to return a payload with admin role
      (jwt.verify as jest.Mock).mockReturnValue({ id: 'admin123', role: 'ADMIN' });
      
      const result = isAdmin(context);
      
      expect(result).toBe(true);
    });
    
    it('should return false if user does not have admin role', () => {
      // Mock context
      const context = {
        req: {
          headers: {
            authorization: 'Bearer test_token'
          }
        }
      };
      
      // Mock jwt.verify to return a payload with user role
      (jwt.verify as jest.Mock).mockReturnValue({ id: 'user123', role: 'USER' });
      
      const result = isAdmin(context);
      
      expect(result).toBe(false);
    });
    
    it('should return false if authorization header is missing', () => {
      // Mock context without authorization header
      const context = {
        req: {
          headers: {}
        }
      };
      
      const result = isAdmin(context);
      
      expect(result).toBe(false);
    });
    
    it('should return false if token verification fails', () => {
      // Mock context
      const context = {
        req: {
          headers: {
            authorization: 'Bearer invalid_token'
          }
        }
      };
      
      // Mock jwt.verify to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Token verification failed');
      });
      
      const result = isAdmin(context);
      
      expect(result).toBe(false);
    });
  });
});