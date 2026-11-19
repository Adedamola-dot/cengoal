import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  if (env.NODE_ENV === 'development') {
    console.error('💥 ERROR:', err);
  }

  // 1. Handle Mongoose Duplicate Key Error (e.g., email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`Duplicate field value: ${field}. Please use another value.`, 400);
  }

  // 2. Handle Mongoose Validation Error (e.g., missing required field)
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    error = new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
  }

  // 3. Handle Zod Validation Error
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    error = new AppError(`Validation failed: ${errors.join(', ')}`, 400);
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  res.status(statusCode).json({
    status,
    message: error.message || 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};