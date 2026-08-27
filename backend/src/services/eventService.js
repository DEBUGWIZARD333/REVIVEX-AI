import Event from '../models/Event.js';

export const createEvent = async (eventData) => {
  const event = new Event(eventData);
  return await event.save();
};

export const getEvents = async (filter = {}, limit = 50, skip = 0) => {
  return await Event.find(filter)
    .populate('userId', 'name email')
    .populate('productId', 'name price category')
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

export const getEventsByUserId = async (userId, limit = 50) => {
  return await Event.find({ userId })
    .populate('productId', 'name price category')
    .sort({ timestamp: -1 })
    .limit(limit);
};

export const getEventsByType = async (eventType, limit = 50) => {
  return await Event.find({ eventType })
    .populate('userId', 'name email')
    .populate('productId', 'name price category')
    .sort({ timestamp: -1 })
    .limit(limit);
};
