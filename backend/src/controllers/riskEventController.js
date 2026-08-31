import * as riskEventService from '../services/riskEventService.js';
import { RISK_EVENT_TYPES, RISK_STATUSES } from '../models/RiskEvent.js';
import { globalRiskDetectionValidator } from '../services/riskDetectionValidator.js';
import mongoose from 'mongoose';

export const createRiskEvent = async (req, res, next) => {
  try {
    const {
      userId,
      eventType,
      riskScore,
      riskAmount,
      riskReason,
      relatedOrderId,
      relatedCartId,
      status,
      detectedAt,
    } = req.body;

    const currentUserId = req.user ? req.user._id : userId || null;

    if (!eventType || !RISK_EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: `eventType is required and must be one of: ${RISK_EVENT_TYPES.join(', ')}`,
      });
    }

    if (status && !RISK_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${RISK_STATUSES.join(', ')}`,
      });
    }

    let validUserId = null;
    if (currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)) {
      validUserId = currentUserId;
    }

    let validCartId = null;
    if (relatedCartId && mongoose.Types.ObjectId.isValid(relatedCartId)) {
      validCartId = relatedCartId;
    }

    const payload = {
      userId: validUserId,
      eventType,
      riskScore: parseFloat(riskScore) || 0,
      riskAmount: parseFloat(riskAmount) || 0,
      riskReason: riskReason || '',
      relatedOrderId: relatedOrderId || null,
      relatedCartId: validCartId,
      status: status || 'OPEN',
      detectedAt: detectedAt ? new Date(detectedAt) : new Date(),
    };

    const savedRiskEvent = await riskEventService.createRiskEvent(payload);

    res.status(201).json({
      success: true,
      message: 'Risk event created successfully',
      data: savedRiskEvent,
    });
  } catch (error) {
    next(error);
  }
};

export const getRiskEvents = async (req, res, next) => {
  try {
    const {
      eventType,
      riskLevel,
      status,
      userId,
      minRiskScore,
      maxRiskScore,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'detectedAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};

    if (eventType) filter.eventType = eventType;
    if (riskLevel) filter.riskLevel = riskLevel.toUpperCase();
    if (status) filter.status = status.toUpperCase();
    if (userId && mongoose.Types.ObjectId.isValid(userId)) filter.userId = userId;

    if (minRiskScore || maxRiskScore) {
      filter.riskScore = {};
      if (minRiskScore) filter.riskScore.$gte = parseFloat(minRiskScore);
      if (maxRiskScore) filter.riskScore.$lte = parseFloat(maxRiskScore);
    }

    if (startDate || endDate) {
      filter.detectedAt = {};
      if (startDate) filter.detectedAt.$gte = new Date(startDate);
      if (endDate) filter.detectedAt.$lte = new Date(endDate);
    }

    const result = await riskEventService.getRiskEventsPaginated({
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

export const getRiskEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Risk Event ID format' });
    }

    const riskEvent = await riskEventService.getRiskEventById(id);

    if (!riskEvent) {
      return res.status(404).json({ success: false, message: 'Risk event not found' });
    }

    res.json({
      success: true,
      data: riskEvent,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Risk Event ID format' });
    }

    if (!status || !RISK_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status is required and must be one of: ${RISK_STATUSES.join(', ')}`,
      });
    }

    const updated = await riskEventService.updateRiskEventStatus(id, status);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Risk event not found' });
    }

    res.json({
      success: true,
      message: `Risk event status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getRiskStats = async (req, res, next) => {
  try {
    const stats = await riskEventService.getRiskStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const validateAccuracy = async (req, res, next) => {
  try {
    const report = await globalRiskDetectionValidator.runRiskDetectionTestSuite();
    res.json({
      success: true,
      message: 'Ran risk detection accuracy testing suite',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
