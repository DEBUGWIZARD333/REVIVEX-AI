import AgentLog from '../models/AgentLog.js';

export const createAgentLog = async (logData) => {
  const log = new AgentLog(logData);
  return await log.save();
};

export const getAgentLogsPaginated = async ({
  filter = {},
  page = 1,
  limit = 10,
  sortBy = 'processedAt',
  sortOrder = 'desc',
}) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (parsedPage - 1) * parsedLimit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const total = await AgentLog.countDocuments(filter);
  const data = await AgentLog.find(filter)
    .populate({
      path: 'eventId',
      populate: [
        { path: 'userId', select: 'name email' },
        { path: 'productId', select: 'name price category' },
      ],
    })
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(parsedLimit);

  const pages = Math.ceil(total / parsedLimit) || 1;

  return {
    total,
    page: parsedPage,
    limit: parsedLimit,
    pages,
    data,
  };
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
