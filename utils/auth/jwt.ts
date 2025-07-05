import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

// Type for the JWT payload
interface JwtPayload {
  id: string;
  role: string;
}

// Generate a JWT token for a user
export const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    id: user.id,
    role: user.role
  };

  // @ts-ignore
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'default_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Verify a JWT token and return the decoded payload
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_jwt_secret'
    ) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Extract token from authorization header
export const extractToken = (authHeader: string): string => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header must be provided and start with Bearer');
  }
  
  return authHeader.split(' ')[1];
};

// Get user ID from request context
export const getUserId = (context: any): string => {
  const authHeader = context.req.headers.authorization;
  if (!authHeader) {
    throw new Error('Not authenticated');
  }

  const token = extractToken(authHeader);
  const { id } = verifyToken(token);
  
  return id;
};

// Check if user has admin role
export const isAdmin = (context: any): boolean => {
  const authHeader = context.req.headers.authorization;
  if (!authHeader) {
    return false;
  }

  try {
    const token = extractToken(authHeader);
    const { role } = verifyToken(token);
    
    return role === 'ADMIN';
  } catch (error) {
    return false;
  }
};