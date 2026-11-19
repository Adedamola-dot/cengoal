import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

// Helper function to set the refresh token cookie
const sendRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true, // Prevents frontend JS from reading the cookie (XSS protection)
    secure: env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax', 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  // Set the refresh token as a secure cookie
  sendRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    status: 'success',
    data: {
      user,
      accessToken, // Frontend stores this in memory (Zustand)
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);

  // Set the refresh token as a secure cookie
  sendRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    status: 'success',
    data: {
      user,
      accessToken, // Frontend stores this in memory (Zustand)
    },
  });
});