import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import logger from '../utils/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: number;                       // MongoDB error code (e.g. 11000 = duplicate key)
  keyValue?: Record<string, unknown>;  // MongoDB duplicate key fields
  path?: string;                       // Mongoose CastError field
  value?: unknown;                     // Mongoose CastError value
}

// ─── Error Transformers ───────────────────────────────────────────────────────

const handleMongooseCastError = (err: MongooseError.CastError) => ({
  statusCode: 400,
  message: `Invalid value "${String(err.value)}" for field "${err.path}".`,
});

const handleMongooseValidationError = (err: MongooseError.ValidationError) => ({
  statusCode: 422,
  message: 'Validation failed.',
  errors: Object.values(err.errors).reduce<Record<string, string>>((acc, e) => {
    acc[e.path] = e.message;
    return acc;
  }, {}),
});

const handleDuplicateKeyError = (err: AppError) => {
  const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
  return {
    statusCode: 409,
    message: `A record with this ${field} already exists.`,
  };
};

// ─── Global Error Handler ─────────────────────────────────────────────────────

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ── Structured Logging ─────────────────────────────────────────────────────
  logger.error('Request error', {
    message: err.message,
    statusCode: err.statusCode ?? 500,
    stack: err.stack,
  });

  // ── Defaults ───────────────────────────────────────────────────────────────
  let statusCode = err.statusCode ?? 500;
  let message = err.message ?? 'An unexpected error occurred.';
  let errors: Record<string, string> | undefined;

  // ── Mongoose: CastError (invalid ObjectId) ─────────────────────────────────
  if (err instanceof MongooseError.CastError) {
    const transformed = handleMongooseCastError(err);
    statusCode = transformed.statusCode;
    message = transformed.message;
  }

  // ── Mongoose: ValidationError ──────────────────────────────────────────────
  else if (err instanceof MongooseError.ValidationError) {
    const transformed = handleMongooseValidationError(err);
    statusCode = transformed.statusCode;
    message = transformed.message;
    errors = transformed.errors;
  }

  // ── MongoDB: Duplicate Key ─────────────────────────────────────────────────
  else if (err.code === 11000) {
    const transformed = handleDuplicateKeyError(err);
    statusCode = transformed.statusCode;
    message = transformed.message;
  }

  // ── JWT Errors ─────────────────────────────────────────────────────────────
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // ── 4xx: Fail response ─────────────────────────────────────────────────────
  if (statusCode < 500) {
    res.status(statusCode).json({
      status: 'fail',
      message,
      ...(errors && { errors }),
    });
    return;
  }

  // ── 5xx: Error response (never leak internals in production) ──────────────
  res.status(statusCode).json({
    status: 'error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : message,
  });
};
