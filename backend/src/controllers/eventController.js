import * as eventService from '../services/eventService.js';
import { EVENT_TYPES } from '../models/Event.js';
import mongoose from 'mongoose';

export const logEvent = async (req, res, next) => {
  try {
    const { eventType, sessionId, productId, metadata, timestamp } = req.body;
    
    // Extract userId from authenticated request if present, or from body
    const userId = req.user ? req.user._id : req.body.userId || null;

    if (!eventType) {
      return res.status(400).json({ message: 'eventType is required' });
    }

    if (!EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({
        message: `Invalid eventType. Allowed types: ${EVENT_TYPES.join(', ')}`,
      });
    }

    // Validate productId format if provided
    let validProductId = null;
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      validProductId = productId;
    }

    const eventPayload = {
      eventType,
      userId: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : null,
      sessionId: sessionId || req.headers['x-session-id'] || null,
      productId: validProductId,
      metadata: metadata || {},
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    };

    const savedEvent = await eventService.createEvent(eventPayload);
    res.status(201).json(savedEvent);
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const { eventType, userId, limit, skip } = req.query;
    const filter = {};

    if (eventType) {
      filter.eventType = eventType;
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = userId;
    }

    const parsedLimit = parseInt(limit, 10) || 50;
    const parsedSkip = parseInt(skip, 10) || 0;

    const events = await eventService.getEvents(filter, parsedLimit, parsedSkip);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getUserEvents = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }

    const events = await eventService.getEventsByUserId(userId);
    res.json(events);
  } catch (error) {
    next(error);
  }
};
