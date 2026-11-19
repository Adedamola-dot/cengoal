import { Notification } from '../models/Notification.js';
import type { INotification } from '../models/Notification.js';

export class NotificationRepository {
  async create(data: Partial<INotification>): Promise<INotification> {
    return Notification.create(data);
  }

  // Fetch notifications for a specific user OR global broadcasts
  async findByUser(userId: string): Promise<INotification[]> {
    return Notification.find({
      $or: [{ user: userId }, { user: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .limit(20); // Only get the latest 20
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );
  }
}

export const notificationRepository = new NotificationRepository();