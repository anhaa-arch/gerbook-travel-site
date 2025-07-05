import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncHandler = (fn: AsyncFunction) => 
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (error) {
      next(error);
    }
  };

export default asyncHandler;