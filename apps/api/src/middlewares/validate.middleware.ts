import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { AnyZodObject } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate the request body against the schema
      await schema.parseAsync({
        body: req.body,
      });
      next(); // If validation passes, move to the controller
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into a readable string
        const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new AppError(message, 400));
      } else {
        next(error);
      }
    }
  };
};