import * as eventService from '../services/eventService.js';
import { EVENT_TYPES } from '../models/Event.js';
import mongoose from 'mongoose';

export const logEvent = async (req, res, next) => {
  try {
    const { eventType, sessionId, productId, metadata, timestamp } = req.body;
    
    // Extract userId from authenticated token if present, or from request body
    const userId = req.user ? req.user._id : req.body.userId || null;

    // Payload validation
    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: 'eventType is required in request body',
      });
    }

    if (!EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid eventType '${eventType}'. Allowed types: ${EVENT_TYPES.join(', ')}`,
      });
    }

    // Validate userId format if provided
    let validUserId = null;
    if (userId) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        validUserId = userId;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid userId format. Must be a valid 24-character hex ObjectId string',
        });
      }
    }

    // Validate productId format if provided
    let validProductId = null;
    if (productId) {
      if (mongoose.Types.ObjectId.isValid(productId)) {
        validProductId = productId;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid productId format. Must be a valid 24-character hex ObjectId string',
        });
      }
    }

    const eventPayload = {
      eventType,
      userId: validUserId,
      sessionId: sessionId || req.headers['x-session-id'] || null,
      productId: validProductId,
      metadata: metadata || {},
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    };

    // Save event in MongoDB Event collection
    const savedEvent = await eventService.createEvent(eventPayload);

    // Return structured success response
    res.status(201).json({
      success: true,
      message: 'Event tracked successfully',
      data: savedEvent,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const {
      eventType,
      userId,
      sessionId,
      isProcessed,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};

    if (eventType) {
      filter.eventType = eventType;
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = userId;
    }

    if (sessionId) {
      filter.sessionId = sessionId;
    }

    if (isProcessed !== undefined) {
      filter.isProcessed = isProcessed === 'true';
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const result = await eventService.getEventsPaginated({
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

export const getEventStats = async (req, res, next) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = userId;
    }

    const stats = await eventService.getEventStats(filter);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserEvents = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID format' });
    }

    const events = await eventService.getEventsByUserId(userId);
    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};
