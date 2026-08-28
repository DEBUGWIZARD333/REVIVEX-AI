import express from 'express';
import {
  generateCoupon,
  validateCoupon,
  redeemCoupon,
  getCoupons,
} from '../controllers/couponController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Generate coupon dynamically (Risk score rule based)
router.post('/generate', optionalAuth, generateCoupon);

// Validate promo code
router.get('/validate/:code', validateCoupon);

// Redeem promo code
router.post('/redeem', optionalAuth, redeemCoupon);

// List generated coupons
router.get('/', protect, getCoupons);

export default router;
