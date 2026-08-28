import * as couponService from '../services/couponService.js';

export const generateCoupon = async (req, res, next) => {
  try {
    const { riskScore, userId, riskEventId, validForHours } = req.body;

    const result = await couponService.generateCoupon({
      riskScore,
      userId,
      riskEventId,
      validForHours,
    });

    res.status(201).json({
      success: true,
      message: `${result.discountPercentage}% discount coupon generated successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await couponService.validateCoupon(code);

    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const redeemCoupon = async (req, res, next) => {
  try {
    const { code, userId } = req.body;
    const result = await couponService.redeemCoupon(code, userId || req.user?._id);

    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await couponService.getCouponsPaginated({ page, limit });

    res.json({
      success: true,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};
