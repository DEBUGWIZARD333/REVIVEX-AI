import express from 'express';
import { createOrder, getOrders, cancelOrder } from '../controllers/orderController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/', protect, getOrders);
router.put('/:orderId/cancel', protect, cancelOrder);

export default router;
