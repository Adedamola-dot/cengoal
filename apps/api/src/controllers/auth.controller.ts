import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

const sendRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  sendRefreshTokenCookie(res, refreshToken);
  res.status(201).json({ status: 'success', data: { user, accessToken } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  sendRefreshTokenCookie(res, refreshToken);
  res.status(200).json({ status: 'success', data: { user, accessToken } });
});

// 🔥 NEW: Refresh Token Route
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    res.status(401).json({ status: 'fail', message: 'No refresh token' });
    return;
  }

  const { user, accessToken, refreshToken } = await authService.refresh(token);
  sendRefreshTokenCookie(res, refreshToken); // Rotate the refresh token
  res.status(200).json({ status: 'success', data: { user, accessToken } });
});

// 🔥 NEW: Logout Route
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie('refreshToken', '', { maxAge: 1, httpOnly: true });
  res.status(200).json({ status: 'success', message: 'Logged out' });
});