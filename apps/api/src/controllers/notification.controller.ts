import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notificationService } from '../services/notification.service.js';

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const notifications = await notificationService.getMyNotifications(userId);

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: { notifications },
  });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  await notificationService.markAsRead(userId);

  res.status(200).json({
    status: 'success',
    message: 'Notifications marked as read',
  });
});