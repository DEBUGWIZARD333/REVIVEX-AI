import AgentLog from '../models/AgentLog.js';

export const createAgentLog = async (logData) => {
  const log = new AgentLog(logData);
  return await log.save();
};

export const getAgentLogs = async (filter = {}, limit = 50, skip = 0) => {
  return await AgentLog.find(filter)
    .populate({
      path: 'eventId',
      populate: [
        { path: 'userId', select: 'name email' },
        { path: 'productId', select: 'name price category' },
      ],
    })
    .sort({ processedAt: -1 })
    .limit(limit)
    .skip(skip);
};

export const getLogsByEventId = async (eventId) => {
  return await AgentLog.find({ eventId })
    .populate('eventId')
    .sort({ processedAt: -1 });
};

export const getLogsByAgentName = async (agentName, limit = 50) => {
  return await AgentLog.find({ agentName })
    .populate('eventId')
    .sort({ processedAt: -1 })
    .limit(limit);
};
