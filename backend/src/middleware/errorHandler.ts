import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/responseHelper';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response => {
  // Custom application errors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path }, 'Internal Server Error');
    } else {
      logger.warn({ err, path: req.path }, `AppError: ${err.message}`);
    }
    return errorResponse(res, err.statusCode, err.message);
  }

  // Zod Validation Errors
  if (err instanceof ZodError) {
    logger.warn({ err: err.issues, path: req.path }, 'Validation Error');
    return errorResponse(res, 400, 'Validation Error', err.format());
  }

  // Mongoose duplicate key error (11000)
  if ((err as any).code === 11000) {
    logger.warn({ err, path: req.path }, 'Conflict Database Error');
    const fields = Object.keys((err as any).keyValue || {});
    return errorResponse(
      res,
      409,
      `Conflict: Duplicate field value for ${fields.join(', ')}`
    );
  }

  // Unhandled standard errors
  logger.error({ err, path: req.path, stack: err.stack }, 'Unhandled error occurred');
  return errorResponse(
    res,
    500,
    'Internal Server Error',
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};
