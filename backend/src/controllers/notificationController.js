import * as notificationService from '../services/notificationService.js';

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
