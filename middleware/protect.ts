import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from '../middleware/asyncHandler';

// Extend the Request interface to include userId and userRole
interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

// Interface for JWT token payload
interface TokenPayload {
  Id: string;
  role: string;
  iat: number;
  exp: number;
}

// Middleware to protect routes that require authentication
export const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check if an authorization header is present
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        msg: "Та эхлээд нэвтрэнэ үү ",
      });
    }
    const token = req.headers.authorization.split(" ")[1];

    // Check if the token exists
    if (!token) {
      return res.status(400).json({
        success: false,
        msg: "Токен хоосон байна",
      });
    }
    // Verify the token and extract user information
    const tokenObj = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
    console.log(tokenObj);
    req.userId = tokenObj.Id;
    req.userRole = tokenObj.role;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      msg: "Токен хоосон байна.  Та эхлээд нэвтрэнэ үү !",
    });
  }
});

// Middleware to authorize specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check if the user role is included in the allowed roles
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        msg: `Энэ үйлдэлийг хийхэд таны эрх хүрэлцэхгүй байна : [${req.userRole}].`,
      });
    }
    next();
  };
};
