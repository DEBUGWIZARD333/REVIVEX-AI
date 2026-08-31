import * as decisionService from '../services/decisionService.js';
import { DECISION_TYPES } from '../models/DecisionEvent.js';
import { globalDecisionAgentValidator } from '../services/decisionAgentValidator.js';
import mongoose from 'mongoose';

export const createDecision = async (req, res, next) => {
  try {
    const { userId, riskEventId, decisionType, confidenceScore, riskReason, actionTaken, status } = req.body;

    if (!decisionType || !DECISION_TYPES.includes(decisionType)) {
      return res.status(400).json({
        success: false,
        message: `decisionType is required and must be one of: ${DECISION_TYPES.join(', ')}`,
      });
    }

    const payload = {
      userId: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : null,
      riskEventId: riskEventId && mongoose.Types.ObjectId.isValid(riskEventId) ? riskEventId : null,
      decisionType,
      confidenceScore: parseFloat(confidenceScore) || 0.85,
      riskReason: riskReason || '',
      actionTaken: actionTaken || `Action executed for ${decisionType}`,
      status: status || 'EXECUTED',
      cartValue: req.body.cartValue || 0,
      customerHistory: req.body.customerHistory || {},
    };

    const saved = await decisionService.createDecisionEvent(payload);

    res.status(201).json({
      success: true,
      message: 'Decision event logged successfully',
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

export const getDecisions = async (req, res, next) => {
  try {
    const {
      decisionType,
      status,
      userId,
      minConfidence,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};

    if (decisionType) filter.decisionType = decisionType.toUpperCase();
    if (status) filter.status = status.toUpperCase();
    if (userId && mongoose.Types.ObjectId.isValid(userId)) filter.userId = userId;

    if (minConfidence) {
      filter.confidenceScore = { $gte: parseFloat(minConfidence) };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const result = await decisionService.getDecisionsPaginated({
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

export const getDecisionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Decision ID format' });
    }

    const decision = await decisionService.getDecisionById(id);

    if (!decision) {
      return res.status(404).json({ success: false, message: 'Decision not found' });
    }

    res.json({
      success: true,
      data: decision,
    });
  } catch (error) {
    next(error);
  }
};

export const getDecisionStats = async (req, res, next) => {
  try {
    const stats = await decisionService.getDecisionStats();
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
    const report = await globalDecisionAgentValidator.runDecisionTestSuite();
    res.json({
      success: true,
      message: 'Ran Decision Agent testing & explainability validation suite',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
