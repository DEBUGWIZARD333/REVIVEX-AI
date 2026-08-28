import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountPercentage: {
      type: Number,
      required: [true, 'discountPercentage is required'],
      enum: {
        values: [5, 10, 20],
        message: '{VALUE} is not a valid discount percentage. Allowed: 5, 10, 20',
      },
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    riskEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RiskEvent',
      default: null,
    },
    expiryDate: {
      type: Date,
      required: [true, 'expiryDate is required'],
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
couponSchema.index({ userId: 1 });
couponSchema.index({ isUsed: 1 });
couponSchema.index({ expiryDate: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
