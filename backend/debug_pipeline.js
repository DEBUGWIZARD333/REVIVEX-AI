import connectDB from './src/config/db.js';
import Cart from './src/models/Cart.js';
import Event from './src/models/Event.js';
import RiskEvent from './src/models/RiskEvent.js';
import riskConfigService from './src/services/riskConfigService.js';
import dotenv from 'dotenv';
dotenv.config();

async function debugAbandonmentPipeline() {
  await connectDB();
  const minutes = 0.01;
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - minutes * 60 * 1000);

  const idleCartGroups = await Cart.aggregate([
    { $match: { updatedAt: { $lte: cutoffDate } } },
    { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'productDetails' } },
    { $unwind: '$productDetails' },
    {
      $group: {
        _id: '$userId',
        cartItems: { $push: { cartId: '$_id', quantity: '$quantity', price: '$productDetails.price', productName: '$productDetails.name', updatedAt: '$updatedAt' } },
        totalQuantity: { $sum: '$quantity' },
        cartTotalAmount: { $sum: { $multiply: ['$quantity', '$productDetails.price'] } },
        lastActivityDate: { $max: '$updatedAt' },
      },
    },
  ]);

  console.log('Idle Cart Groups found:', idleCartGroups.length);
  if (idleCartGroups.length > 0) {
    const group = idleCartGroups[0];
    const userId = group._id;
    console.log('User ID:', userId);
    
    const recentPaymentSuccess = await Event.findOne({
      userId,
      eventType: 'PAYMENT_SUCCESS',
      timestamp: { $gte: group.lastActivityDate },
    });
    console.log('Recent payment success:', recentPaymentSuccess);

    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const existingOpenRiskEvent = await RiskEvent.findOne({
      userId,
      eventType: 'CART_ABANDONED',
      status: { $in: ['OPEN', 'REVIEWED'] },
      detectedAt: { $gte: yesterday },
    });
    console.log('Existing open risk event:', existingOpenRiskEvent);

    const evalResult = await riskConfigService.evaluateAndCreateRiskEvent({
      userId,
      eventType: 'CART_ABANDONED',
      riskAmount: group.cartTotalAmount,
      riskReason: 'Test cart idle',
      relatedCartId: group.cartItems[0]?.cartId,
      idleMinutes: 1,
      detectedAt: now,
    });
    console.log('Eval Result:', JSON.stringify(evalResult, null, 2));
  }
  process.exit(0);
}
debugAbandonmentPipeline();
