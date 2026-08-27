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

export const getRiskStats = async () => {
  const aggregation = await RiskEvent.aggregate([
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        totalAmountAtRisk: { $sum: '$riskAmount' },
        avgRiskScore: { $avg: '$riskScore' },
      },
    },
  ]);

  const openCount = await RiskEvent.countDocuments({ status: 'OPEN' });
  const totalCount = await RiskEvent.countDocuments({});

  return {
    openRiskEvents: openCount,
    totalRiskEventsTracked: totalCount,
    breakdown: aggregation,
  };
};
