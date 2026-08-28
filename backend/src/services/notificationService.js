import Notification from '../models/Notification.js';
import * as agentLogService from './agentLogService.js';
import mongoose from 'mongoose';

/**
 * 1. Notification Template Library
 * Supported Categories: CART_ABANDONED, PAYMENT_FAILED, COUPON_AVAILABLE
 */
export const NOTIFICATION_TEMPLATES = {
  CART_ABANDONED: {
    category: 'CART_ABANDONED',
    title: "Don't lose your items in your cart!",
    message: "Hi {{customerName}}, your cart items worth \${{cartTotal}} are saved. Finish your order before items sell out!",
    actionUrl: '/cart',
  },

  PAYMENT_FAILED: {
    category: 'PAYMENT_FAILED',
    title: 'Payment Attempt Failed',
    message: 'Hi {{customerName}}, your checkout payment failed. Click here to retry your purchase in 1-click.',
    actionUrl: '/checkout',
  },

  COUPON_AVAILABLE: {
    category: 'COUPON_AVAILABLE',
    title: 'Special Discount Coupon Unlocked!',
    message: 'Use promo code {{couponCode}} to get {{discountPercentage}}% off your active order today!',
    actionUrl: '/checkout',
  },
};

/**
 * 2. Notification Template Renderer
 */
export const renderNotificationTemplate = (category, variables = {}) => {
  const template = NOTIFICATION_TEMPLATES[category?.toUpperCase()] || NOTIFICATION_TEMPLATES.CART_ABANDONED;

  const defaults = {
    customerName: variables.customerName || variables.name || 'Valued Customer',
    cartTotal: variables.cartTotal ? parseFloat(variables.cartTotal).toFixed(2) : '0.00',
    couponCode: variables.couponCode || 'SAVE10',
    discountPercentage: variables.discountPercentage || '10',
    recoveryLink: variables.recoveryLink || template.actionUrl,
  };

  let title = template.title;
  let message = template.message;
  let actionUrl = variables.recoveryLink || template.actionUrl;

  Object.entries(defaults).forEach(([key, val]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    title = title.replace(regex, val);
    message = message.replace(regex, val);
  });

  return {
    category: template.category,
    title,
    message,
    actionUrl,
    variables: defaults,
  };
};

/**
 * 3. Send Notification (In-App & Browser)
 */
export const sendNotification = async ({
  userId,
  category,
  type = 'IN_APP',
  variables = {},
}) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Valid userId is required to dispatch notification');
  }

  const rendered = renderNotificationTemplate(category, variables);

  const notificationDoc = new Notification({
    userId,
    type: ['IN_APP', 'BROWSER'].includes(type) ? type : 'IN_APP',
    category: rendered.category,
    title: rendered.title,
    message: rendered.message,
    actionUrl: rendered.actionUrl,
    data: variables,
    isRead: false,
  });

  const saved = await notificationDoc.save();

  // Audit Logging
  console.log(`[NotificationService] Dispatched ${type} notification [${rendered.category}] to user ${userId}: "${rendered.title}"`);

  await agentLogService.createAgentLog({
    agentName: 'NotificationService',
    eventType: `NOTIFICATION_${rendered.category}`,
    status: 'COMPLETED',
    message: `Dispatched ${type} notification to user ${userId}: "${rendered.title}"`,
    processedAt: new Date(),
  });

  return saved;
};

/**
 * 4. Get User Notifications (Real-Time Polling Feed)
 */
export const getUserNotifications = async (userId, options = {}) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { unreadCount: 0, notifications: [] };
  }

  const limit = parseInt(options.limit, 10) || 20;
  const filter = { userId };
  if (options.unreadOnly === 'true' || options.unreadOnly === true) {
    filter.isRead = false;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return {
    unreadCount,
    totalCount: notifications.length,
    notifications,
  };
};

/**
 * 5. Mark Single Notification as Read
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) return null;

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

/**
 * 6. Mark All User Notifications as Read
 */
export const markAllNotificationsAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return result;
};
