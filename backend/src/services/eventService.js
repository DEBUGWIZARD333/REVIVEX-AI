import Event from '../models/Event.js';

export const createEvent = async (eventData) => {
  const event = new Event(eventData);
  return await event.save();
};

export const getEventsPaginated = async ({
  filter = {},
  page = 1,
  limit = 10,
  sortBy = 'timestamp',
  sortOrder = 'desc',
}) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (parsedPage - 1) * parsedLimit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const total = await Event.countDocuments(filter);
  const data = await Event.find(filter)
    .populate('userId', 'name email')
    .populate('productId', 'name price category')
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

export const getEventsByUserId = async (userId, limit = 50) => {
  return await Event.find({ userId })
    .populate('productId', 'name price category')
    .sort({ timestamp: -1 })
    .limit(limit);
};

export const getEventStats = async (filter = {}) => {
  // Aggregate counts for required stats: Product Views, Cart Adds, Checkout Starts, Payment Failures, Successful Payments
  const statsAggregation = await Event.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
      },
    },
  ]);

  const countsMap = {
    PRODUCT_VIEWED: 0,
    ADD_TO_CART: 0,
    REMOVE_CART_ITEM: 0,
    CHECKOUT_STARTED: 0,
    PAYMENT_INITIATED: 0,
    PAYMENT_FAILED: 0,
    PAYMENT_SUCCESS: 0,
  };

  statsAggregation.forEach((item) => {
    if (countsMap.hasOwnProperty(item._id)) {
      countsMap[item._id] = item.count;
    }
  });

  const totalEvents = await Event.countDocuments(filter);

  // Conversion rate percentage = (successfulPayments / checkoutStarts) * 100
  const checkoutStarts = countsMap.CHECKOUT_STARTED || 0;
  const successfulPayments = countsMap.PAYMENT_SUCCESS || 0;
  const conversionRate = checkoutStarts > 0 ? (successfulPayments / checkoutStarts) * 100 : 0;

  return {
    productViews: countsMap.PRODUCT_VIEWED,
    cartAdds: countsMap.ADD_TO_CART,
    checkoutStarts: countsMap.CHECKOUT_STARTED,
    paymentFailures: countsMap.PAYMENT_FAILED,
    successfulPayments: countsMap.PAYMENT_SUCCESS,
    conversionRatePercentage: parseFloat(conversionRate.toFixed(2)),
    totalEventsTracked: totalEvents,
  };
};
