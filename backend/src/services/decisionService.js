import DecisionEvent from '../models/DecisionEvent.js';
import DecisionLog from '../models/DecisionLog.js';

export const createDecisionEvent = async (data) => {
  const decision = new DecisionEvent(data);
  const savedDecision = await decision.save();

  // Create audit trail log entry
  await DecisionLog.create({
    decisionId: savedDecision._id,
    status: data.status || 'EXECUTED',
    actionTaken: data.actionTaken || `Executed decision ${data.decisionType}`,
    timestamp: new Date(),
  });

  return savedDecision;
};

export const getDecisionsPaginated = async ({
  filter = {},
  page = 1,
  limit = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (parsedPage - 1) * parsedLimit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const total = await DecisionEvent.countDocuments(filter);
  const data = await DecisionEvent.find(filter)
    .populate('userId', 'name email')
    .populate('riskEventId')
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(parsedLimit);

  const pages = Math.ceil(total / parsedLimit) || 1;

  // Format objects to clearly present all required fields
  const formattedData = data.map((d) => ({
    _id: d._id,
    userId: d.userId,
    riskEventId: d.riskEventId,
    decisionType: d.decisionType,
    confidenceScore: d.confidenceScore,
    riskReason: d.riskReason,
    actionTaken: d.actionTaken || `Executed action for ${d.decisionType}`,
    workflowStatus: d.status || 'EXECUTED',
    cartValue: d.cartValue,
    customerHistory: d.customerHistory,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

  return {
    total,
    page: parsedPage,
    limit: parsedLimit,
    pages,
    data: formattedData,
  };
};

export const getDecisionById = async (id) => {
  const d = await DecisionEvent.findById(id)
    .populate('userId', 'name email')
    .populate('riskEventId');

  if (!d) return null;

  // Fetch associated decision execution logs
  const logs = await DecisionLog.find({ decisionId: d._id }).sort({ timestamp: -1 });

  return {
    _id: d._id,
    userId: d.userId,
    riskEventId: d.riskEventId,
    decisionType: d.decisionType,
    confidenceScore: d.confidenceScore,
    riskReason: d.riskReason,
    actionTaken: d.actionTaken || `Executed action for ${d.decisionType}`,
    workflowStatus: d.status || 'EXECUTED',
    cartValue: d.cartValue,
    customerHistory: d.customerHistory,
    previousPurchases: d.previousPurchases,
    executionLogs: logs,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
};

export const getDecisionStats = async () => {
  const totalDecisions = await DecisionEvent.countDocuments({});

  const typeAggregation = await DecisionEvent.aggregate([
    {
      $group: {
        _id: '$decisionType',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidenceScore' },
      },
    },
  ]);

  const avgConfidenceAggregation = await DecisionEvent.aggregate([
    {
      $group: {
        _id: null,
        avgConfidenceScore: { $avg: '$confidenceScore' },
      },
    },
  ]);

  const executedCount = await DecisionEvent.countDocuments({
    status: { $in: ['EXECUTED', 'COMPLETED'] },
  });

  const decisionsByType = {
    REMINDER: 0,
    COUPON: 0,
    RETRY_PAYMENT: 0,
    ESCALATION: 0,
  };

  typeAggregation.forEach((item) => {
    if (item._id) {
      decisionsByType[item._id] = item.count;
    }
  });

  const avgConfidenceScore = parseFloat(
    (avgConfidenceAggregation[0]?.avgConfidenceScore || 0.85).toFixed(2)
  );

  const executionSuccessRate = totalDecisions > 0
    ? parseFloat(((executedCount / totalDecisions) * 100).toFixed(1))
    : 100.0;

  return {
    totalDecisions,
    actionsExecutedCount: executedCount,
    executionSuccessRate,
    avgConfidenceScore,
    decisionsByType,
    breakdown: typeAggregation,
  };
};
