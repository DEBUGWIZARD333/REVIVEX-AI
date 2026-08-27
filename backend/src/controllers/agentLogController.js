import * as agentLogService from '../services/agentLogService.js';
import { AGENT_LOG_STATUS } from '../models/AgentLog.js';
import mongoose from 'mongoose';

export const createLog = async (req, res, next) => {
  try {
    const { agentName, eventId, eventType, status, message, processedAt } = req.body;

    if (!agentName || !eventId || !eventType || !status) {
      return res.status(400).json({
        success: false,
        message: 'agentName, eventId, eventType, and status are required fields',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid eventId format' });
    }

    if (!AGENT_LOG_STATUS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${AGENT_LOG_STATUS.join(', ')}`,
      });
    }

    const logPayload = {
      agentName,
      eventId,
      eventType,
      status,
      message: message || '',
      processedAt: processedAt ? new Date(processedAt) : new Date(),
    };

    const savedLog = await agentLogService.createAgentLog(logPayload);
    res.status(201).json({
      success: true,
      message: 'Agent log created successfully',
      data: savedLog,
    });
  } catch (error) {
    next(error);
  }
};

export const getLogs = async (req, res, next) => {
  try {
    const {
      agentName,
      eventId,
      eventType,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'processedAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};

    if (agentName) filter.agentName = agentName;
    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;
    if (eventId && mongoose.Types.ObjectId.isValid(eventId)) filter.eventId = eventId;

    if (startDate || endDate) {
      filter.processedAt = {};
      if (startDate) filter.processedAt.$gte = new Date(startDate);
      if (endDate) filter.processedAt.$lte = new Date(endDate);
    }

    const result = await agentLogService.getAgentLogsPaginated({
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

export const getLogsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid eventId format' });
    }

    const logs = await agentLogService.getLogsByEventId(eventId);
    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
