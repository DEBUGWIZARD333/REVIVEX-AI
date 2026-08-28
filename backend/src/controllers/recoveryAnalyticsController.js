import * as recoveryAnalyticsService from '../services/recoveryAnalyticsService.js';
import mongoose from 'mongoose';

export const getRecoveryEvents = async (req, res, next) => {
  try {
    const {
      actionType,
      status,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};

    if (actionType) filter.actionType = actionType.toUpperCase();
    if (status) filter.status = status.toUpperCase();
    if (userId && mongoose.Types.ObjectId.isValid(userId)) filter.userId = userId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const result = await recoveryAnalyticsService.getRecoveryEventsPaginated({
      filter,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    res.json({
      success: true,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecoveryMetrics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const metrics = await recoveryAnalyticsService.getRecoveryMetrics({ startDate, endDate });

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecoverySummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await recoveryAnalyticsService.getRecoverySummary({ startDate, endDate });

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
