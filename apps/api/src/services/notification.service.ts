import { notificationRepository } from '../repositories/notification.repository.js';

export class NotificationService {
  async getMyNotifications(userId: string) {
    return notificationRepository.findByUser(userId);
  }

  async markAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  }

  async broadcast(title: string, message: string, type: 'material' | 'assignment' | 'system', link?: string) {
    // A broadcast has no specific user attached
    return notificationRepository.create({ title, message, type, link });
  }
}

export const notificationService = new NotificationService();