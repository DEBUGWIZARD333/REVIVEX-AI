import Coupon from '../models/Coupon.js';
import mongoose from 'mongoose';
import * as agentLogService from './agentLogService.js';

/**
 * 1. Calculate Discount Percentage based on Risk Score Rule:
 * - Risk Score < 50  -> 5% Discount
 * - Risk Score 50-80 -> 10% Discount
 * - Risk Score > 80  -> 20% Discount
 */
export const calculateDiscountByRiskScore = (riskScore) => {
  const score = parseFloat(riskScore) || 0;
  if (score < 50) return 5;
  if (score <= 80) return 10;
  return 20;
};

/**
 * 2. Generate Unique Coupon Code String
 */
const generateUniqueCode = async (discountPercentage) => {
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    code = `REVIVE${discountPercentage}-${randomSuffix}`;
    const existing = await Coupon.findOne({ code });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

/**
 * 3. Generate Coupon Service Function
 * 
 * Input:
 * - riskScore
 * - userId (optional)
 * - riskEventId (optional)
 * - validForHours (default 48)
 * 
 * Output:
 * - Coupon Code
 * - Discount Percentage
 * - Expiry Date
 */
export const generateCoupon = async ({
  riskScore = 0,
  userId = null,
  riskEventId = null,
  validForHours = 48,
}) => {
  // Determine discount percentage according to risk score rules
  const discountPercentage = calculateDiscountByRiskScore(riskScore);

  // Generate unique coupon code
  const code = await generateUniqueCode(discountPercentage);

  // Calculate expiry date
  const hours = parseInt(validForHours, 10) || 48;
  const expiryDate = new Date(Date.now() + hours * 60 * 60 * 1000);

  // Clean ObjectId references
  const validUserId = userId && mongoose.Types.ObjectId.isValid(userId) ? userId : null;
  const validRiskEventId = riskEventId && mongoose.Types.ObjectId.isValid(riskEventId) ? riskEventId : null;

  // Persist Coupon in MongoDB
  const couponDoc = new Coupon({
    code,
    discountPercentage,
    riskScore: parseFloat(riskScore) || 0,
    userId: validUserId,
    riskEventId: validRiskEventId,
    expiryDate,
    isUsed: false,
  });

  const savedCoupon = await couponDoc.save();

  // Audit Logging
  console.log(`[CouponService] Generated ${discountPercentage}% coupon [${code}] for Risk Score: ${riskScore} (Expires: ${expiryDate.toISOString()})`);

  await agentLogService.createAgentLog({
    agentName: 'CouponGenerationService',
    eventType: 'GENERATE_COUPON',
    status: 'COMPLETED',
    message: `Generated ${discountPercentage}% discount coupon [${code}] for Risk Score: ${riskScore}`,
    processedAt: new Date(),
  });

  return {
    couponCode: savedCoupon.code,
    discountPercentage: savedCoupon.discountPercentage,
    expiryDate: savedCoupon.expiryDate,
    _id: savedCoupon._id,
    riskScore: savedCoupon.riskScore,
    isUsed: savedCoupon.isUsed,
    createdAt: savedCoupon.createdAt,
  };
};

/**
 * 4. Validate Coupon Code
 */
export const validateCoupon = async (code) => {
  if (!code || typeof code !== 'string') {
    return { valid: false, message: 'Coupon code is required' };
  }

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

  if (!coupon) {
    return { valid: false, message: 'Invalid promo code' };
  }

  if (coupon.isUsed) {
    return { valid: false, message: 'This promo code has already been used' };
  }

  if (new Date() > coupon.expiryDate) {
    return { valid: false, message: 'This promo code has expired' };
  }

  return {
    valid: true,
    message: `${coupon.discountPercentage}% discount code applied successfully`,
    code: coupon.code,
    discountPercentage: coupon.discountPercentage,
    expiryDate: coupon.expiryDate,
  };
};

/**
 * 5. Redeem Coupon Code
 */
export const redeemCoupon = async (code, userId = null) => {
  const validation = await validateCoupon(code);
  if (!validation.valid) {
    return validation;
  }

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  coupon.isUsed = true;
  coupon.usedAt = new Date();
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    coupon.userId = userId;
  }
  await coupon.save();

  return {
    valid: true,
    message: `Coupon ${coupon.code} redeemed successfully!`,
    discountPercentage: coupon.discountPercentage,
    redeemedAt: coupon.usedAt,
  };
};

/**
 * 6. Get Coupons List with Pagination
 */
export const getCouponsPaginated = async ({ page = 1, limit = 10 }) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (p - 1) * l;

  const total = await Coupon.countDocuments({});
  const data = await Coupon.find({})
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
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
