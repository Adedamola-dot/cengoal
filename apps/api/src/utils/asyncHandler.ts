import type { Request, Response, NextFunction, RequestHandler } from 'express';

// This higher-order function takes a standard Express controller 
// and wraps it in a Promise.resolve().catch(next)
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};