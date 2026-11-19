import { Router } from 'express';
import { getMyNotifications, markAsRead } from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect); // All notification routes require login

router.get('/', getMyNotifications);
router.patch('/read', markAsRead);

export const notificationRoutes = router;