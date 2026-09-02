import express from 'express';
import {
  sendNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendTestAlerts
} from '../controllers/notificationController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Get user notifications feed
router.get('/', getNotifications);

// Send notification
router.post('/send', optionalAuth, sendNotification);

// Send explicit test SMS & Email
router.post('/test-alerts', sendTestAlerts);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Mark single notification as read
router.put('/:id/read', markAsRead);

export default router;
