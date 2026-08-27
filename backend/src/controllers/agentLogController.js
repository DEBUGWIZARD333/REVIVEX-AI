import * as agentLogService from '../services/agentLogService.js';
import { AGENT_LOG_STATUS } from '../models/AgentLog.js';
import mongoose from 'mongoose';

export const createLog = async (req, res, next) => {
  try {
    const { agentName, eventId, eventType, status, message, processedAt } = req.body;

    if (!agentName || !eventId || !eventType || !status) {
      return res.status(400).json({
        message: 'agentName, eventId, eventType, and status are required fields',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid eventId format' });
    }

    if (!AGENT_LOG_STATUS.includes(status)) {
      return res.status(400).json({
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
    res.status(201).json(savedLog);
  } catch (error) {
    next(error);
  }
};

export const getLogs = async (req, res, next) => {
  try {
    const { agentName, eventId, eventType, status, limit, skip } = req.query;
    const filter = {};

    if (agentName) filter.agentName = agentName;
    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;
    if (eventId && mongoose.Types.ObjectId.isValid(eventId)) filter.eventId = eventId;

    const parsedLimit = parseInt(limit, 10) || 50;
    const parsedSkip = parseInt(skip, 10) || 0;

    const logs = await agentLogService.getAgentLogs(filter, parsedLimit, parsedSkip);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

export const getLogsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid eventId format' });
    }

    const logs = await agentLogService.getLogsByEventId(eventId);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
