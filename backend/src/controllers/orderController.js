import * as orderService from '../services/orderCancellationService.js';
import mongoose from 'mongoose';

export const createOrder = async (req, res, next) => {
  try {
    const { orderId, items, totalAmount, paymentMethod, shippingAddress } = req.body;
    const userId = req.user ? req.user._id : req.body.userId;

    if (!orderId || !userId || !items || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'orderId, userId, items, and totalAmount are required fields',
      });
    }

    const payload = {
      orderId,
      userId,
      items,
      totalAmount: parseFloat(totalAmount),
      paymentMethod: paymentMethod || 'Credit/Debit Card',
      shippingAddress: shippingAddress || {},
      status: 'PROCESSING',
    };

    const newOrder = await orderService.createOrder(payload);
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await orderService.getOrdersByUserId(userId);
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId parameter is required' });
    }

    const result = await orderService.cancelOrderAndCreateRisk(
      orderId,
      reason || 'User requested cancellation'
    );

    res.json({
      success: true,
      message: `Order '${orderId}' status updated to CANCELLED`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
