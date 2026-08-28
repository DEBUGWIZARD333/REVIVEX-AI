import Order from '../../models/Order.js';
import { LangGraphLogger } from '../utils/logger.js';

export const fetchCustomerHistoryNode = async (state) => {
  const startTime = Date.now();
  LangGraphLogger.logNodeEntry('fetchCustomerHistoryNode', state);

  try {
    const userId = state.userId;
    let customerHistory = { totalOrders: 0, totalSpent: 0, isVIP: false, cancelledCount: 0 };
    let previousPurchases = [];

    if (userId) {
      const userOrders = await Order.find({ userId }).sort({ createdAt: -1 });
      
      const totalOrders = userOrders.length;
      const totalSpent = userOrders
        .filter((o) => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const cancelledCount = userOrders.filter((o) => o.status === 'CANCELLED').length;
      const isVIP = totalSpent > 300 || totalOrders >= 3;

      customerHistory = {
        totalOrders,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        cancelledCount,
        isVIP,
      };

      previousPurchases = userOrders.slice(0, 5).map((o) => ({
        orderId: o.orderId,
        totalAmount: o.totalAmount,
        status: o.status,
        date: o.createdAt,
      }));
    }

    const duration = Date.now() - startTime;
    const logMsg = `Fetched customer history for user ${userId || 'guest'}: ${customerHistory.totalOrders} orders, $${customerHistory.totalSpent} spent`;
    LangGraphLogger.logNodeExit('fetchCustomerHistoryNode', { customerHistory, previousPurchases }, duration);

    return {
      customerHistory,
      previousPurchases,
      logs: [logMsg],
      status: 'PROCESSING',
    };
  } catch (err) {
    LangGraphLogger.logWorkflowError('fetchCustomerHistoryNode', err);
    return {
      error: err.message,
      logs: [`Error in fetchCustomerHistoryNode: ${err.message}`],
    };
  }
};
