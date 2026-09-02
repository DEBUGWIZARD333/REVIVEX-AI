import * as notificationService from '../services/notificationService.js';
import { sendDirectCellularSMS } from '../services/smsService.js';
import { sendEmailWithRetry } from '../services/emailService.js';
import User from '../models/User.js';

export const sendNotification = async (req, res, next) => {
  try {
    const { userId, category, type, variables } = req.body;
    const targetUserId = userId || req.user?._id;

    const result = await notificationService.sendNotification({
      userId: targetUserId,
      category,
      type,
      variables,
    });

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.query.userId;
    const { unreadOnly, limit } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      unreadOnly,
      limit,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const result = await notificationService.markNotificationAsRead(id, userId);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const result = await notificationService.markAllNotificationsAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const sendTestAlerts = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const phone = user.phone || '+918825553110';
    const email = user.email;

    // 1. Send SMS
    let smsResult = null;
    try {
      smsResult = await sendDirectCellularSMS({
        userId,
        phone,
        message: `ReviveX Test: Hello ${user.name}! Your SMS and Pushbullet connection is working perfectly.`,
      });
    } catch (err) {
      console.warn('SMS Test Alert Failed:', err.message);
    }

    // 2. Send Email
    let emailResult = null;
    try {
      emailResult = await sendEmailWithRetry({
        to: email,
        templateName: 'CART_REMINDER',
        variables: {
          customerName: user.name,
          cartTotal: '99.99',
          recoveryLink: `${process.env.CLIENT_APP_URL || 'http://localhost:5173'}/cart?recovery=true`,
        },
      });
    } catch (err) {
      console.warn('Email Test Alert Failed:', err.message);
    }

    res.json({
      success: true,
      message: 'Test alerts dispatched successfully',
      data: {
        sms: smsResult,
        email: emailResult,
      }
    });

  } catch (error) {
    next(error);
  }
};
