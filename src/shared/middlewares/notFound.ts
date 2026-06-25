import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

/**
 * Fallback middleware for unhandled route paths (404)
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};

export default notFoundHandler;
