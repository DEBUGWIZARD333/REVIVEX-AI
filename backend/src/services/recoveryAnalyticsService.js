import RecoveryEvent from '../models/RecoveryEvent.js';
import RiskEvent from '../models/RiskEvent.js';
import DecisionEvent from '../models/DecisionEvent.js';
import Event from '../models/Event.js';

/**
 * 1. Get Paginated Recovery Events Feed with Filters & Sorting
 */
export const getRecoveryEventsPaginated = async ({
  filter = {},
  page = 1,
  limit = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (p - 1) * l;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const total = await RecoveryEvent.countDocuments(filter);
  const data = await RecoveryEvent.find(filter)
    .populate('userId', 'name email')
    .populate('riskEventId')
    .populate('decisionId')
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(l);

  return {
    total,
    page: p,
    limit: l,
    pages: Math.ceil(total / l) || 1,
    data,
  };
};

/**
 * 2. Get Core Recovery Metrics
 * Metrics:
 * - Revenue At Risk
 * - Recovered Revenue
 * - Failed Payments Count
 * - Abandoned Carts Count
 * - Agent Decisions Count
 * - Recovery Rate (%)
 */
export const getRecoveryMetrics = async (dateFilter = {}) => {
  const matchCriteria = {};
  if (dateFilter.startDate || dateFilter.endDate) {
    matchCriteria.createdAt = {};
    if (dateFilter.startDate) matchCriteria.createdAt.$gte = new Date(dateFilter.startDate);
    if (dateFilter.endDate) matchCriteria.createdAt.$lte = new Date(dateFilter.endDate);
  }

  // 1. Revenue At Risk (Sum of riskAmount from RiskEvent)
  const revenueAtRiskAgg = await RiskEvent.aggregate([
    { $match: matchCriteria },
    { $group: { _id: null, total: { $sum: '$riskAmount' } } },
  ]);
  const revenueAtRisk = revenueAtRiskAgg[0]?.total || 0;

  // 2. Recovered Revenue (Sum of recoveryAmount from COMPLETED/SENT RecoveryEvents)
  const recoveredRevenueAgg = await RecoveryEvent.aggregate([
    {
      $match: {
        ...matchCriteria,
        status: { $in: ['COMPLETED', 'SENT'] },
      },
    },
    { $group: { _id: null, total: { $sum: '$recoveryAmount' } } },
  ]);
  const recoveredRevenue = recoveredRevenueAgg[0]?.total || 0;

  // 3. Failed Payments Count
  const failedPayments = await Event.countDocuments({
    ...matchCriteria,
    eventType: 'PAYMENT_FAILED',
  });

  // 4. Abandoned Carts Count
  const abandonedCarts = await Event.countDocuments({
    ...matchCriteria,
    eventType: 'CART_ABANDONED',
  });

  // 5. Agent Decisions Count
  const agentDecisions = await DecisionEvent.countDocuments(matchCriteria);

  // Recovery Rate calculation
  const recoveryRate = revenueAtRisk > 0
    ? parseFloat(((recoveredRevenue / revenueAtRisk) * 100).toFixed(1))
    : 0.0;

  return {
    revenueAtRisk: parseFloat(revenueAtRisk.toFixed(2)),
    recoveredRevenue: parseFloat(recoveredRevenue.toFixed(2)),
    recoveryRate,
    failedPayments,
    abandonedCarts,
    agentDecisions,
  };
};

/**
 * 3. Get Comprehensive Recovery Summary with Action Breakdown
 */
export const getRecoverySummary = async (dateFilter = {}) => {
  const metrics = await getRecoveryMetrics(dateFilter);

  const matchCriteria = {};
  if (dateFilter.startDate || dateFilter.endDate) {
    matchCriteria.createdAt = {};
    if (dateFilter.startDate) matchCriteria.createdAt.$gte = new Date(dateFilter.startDate);
    if (dateFilter.endDate) matchCriteria.createdAt.$lte = new Date(dateFilter.endDate);
  }

  // Breakdown by Action Type (EMAIL, COUPON, RECOVERY_LINK, NOTIFICATION)
  const actionTypeBreakdownAgg = await RecoveryEvent.aggregate([
    { $match: matchCriteria },
    {
      $group: {
        _id: '$actionType',
        count: { $sum: 1 },
        totalAmount: { $sum: '$recoveryAmount' },
      },
    },
  ]);

  // Breakdown by Status (PENDING, SENT, COMPLETED, FAILED)
  const statusBreakdownAgg = await RecoveryEvent.aggregate([
    { $match: matchCriteria },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const byActionType = {
    EMAIL: 0,
    COUPON: 0,
    RECOVERY_LINK: 0,
    NOTIFICATION: 0,
  };

  actionTypeBreakdownAgg.forEach((item) => {
    if (item._id) byActionType[item._id] = item.count;
  });

  const byStatus = {
    PENDING: 0,
    SENT: 0,
    COMPLETED: 0,
    FAILED: 0,
  };

  statusBreakdownAgg.forEach((item) => {
    if (item._id) byStatus[item._id] = item.count;
  });

  return {
    metrics,
    breakdown: {
      byActionType,
      byStatus,
      rawActionBreakdown: actionTypeBreakdownAgg,
      rawStatusBreakdown: statusBreakdownAgg,
    },
  };
};
