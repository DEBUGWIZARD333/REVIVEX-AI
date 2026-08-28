import RiskEvent from '../models/RiskEvent.js';

export const createRiskEvent = async (data) => {
  const riskEvent = new RiskEvent(data);
  return await riskEvent.save();
};

export const getRiskEventsPaginated = async ({
  filter = {},
  page = 1,
  limit = 10,
  sortBy = 'detectedAt',
  sortOrder = 'desc',
}) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (parsedPage - 1) * parsedLimit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const total = await RiskEvent.countDocuments(filter);
  const data = await RiskEvent.find(filter)
    .populate('userId', 'name email')
    .populate('relatedCartId')
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

export const getRiskEventById = async (id) => {
  return await RiskEvent.findById(id)
    .populate('userId', 'name email')
    .populate('relatedCartId');
};

export const updateRiskEventStatus = async (id, status) => {
  return await RiskEvent.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate('userId', 'name email');
};

/**
 * Aggregated statistics for Risk Dashboard
 * Returns Total Risk Events, Total Risk Amount, High Risk Events, Critical Risk Events, and Revenue Leakage Summary.
 */
export const getRiskStats = async () => {
  const totalRiskEvents = await RiskEvent.countDocuments({});
  
  // Total Risk Amount across all events
  const totalAmountAggregation = await RiskEvent.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$riskAmount' },
      },
    },
  ]);
  const totalRiskAmount = totalAmountAggregation[0]?.totalAmount || 0;

  // High Risk Events (score >= 66 or riskLevel === 'HIGH')
  const highRiskEvents = await RiskEvent.countDocuments({
    $or: [{ riskLevel: 'HIGH' }, { riskScore: { $gte: 66, $lt: 86 } }],
  });

  // Critical Risk Events (score >= 86 or riskLevel === 'CRITICAL')
  const criticalRiskEvents = await RiskEvent.countDocuments({
    $or: [{ riskLevel: 'CRITICAL' }, { riskScore: { $gte: 86 } }],
  });

  // Revenue Leakage Summary broken down by eventType
  const leakageAggregation = await RiskEvent.aggregate([
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        totalLeakageAmount: { $sum: '$riskAmount' },
      },
    },
  ]);

  let abandonedCartValue = 0;
  let failedPaymentValue = 0;
  let cancelledOrderValue = 0;

  leakageAggregation.forEach((item) => {
    if (item._id === 'CART_ABANDONED') abandonedCartValue = item.totalLeakageAmount;
    if (item._id === 'PAYMENT_FAILED') failedPaymentValue = item.totalLeakageAmount;
    if (item._id === 'ORDER_CANCELLED') cancelledOrderValue = item.totalLeakageAmount;
  });

  const totalRevenueLeakage = parseFloat(
    (abandonedCartValue + failedPaymentValue + cancelledOrderValue).toFixed(2)
  );

  return {
    totalRiskEvents,
    totalRiskAmount: parseFloat(totalRiskAmount.toFixed(2)),
    highRiskEvents,
    criticalRiskEvents,
    revenueLeakageSummary: {
      abandonedCartValue: parseFloat(abandonedCartValue.toFixed(2)),
      failedPaymentValue: parseFloat(failedPaymentValue.toFixed(2)),
      cancelledOrderValue: parseFloat(cancelledOrderValue.toFixed(2)),
      totalRevenueLeakage,
    },
    breakdownByEventType: leakageAggregation,
  };
};
