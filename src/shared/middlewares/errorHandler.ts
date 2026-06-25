import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import logger from '@shared/logger';
import config from '@config/index';

/**
 * Global Express error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  // Log error with Winston
  logger.error(`${req.method} ${req.originalUrl} - Error: ${message}`, err);

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
