import mongoose from 'mongoose';

export const RISK_EVENT_TYPES = ['CART_ABANDONED', 'PAYMENT_FAILED', 'ORDER_CANCELLED'];
export const RISK_STATUSES = ['OPEN', 'REVIEWED', 'RESOLVED'];
export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const riskEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    eventType: {
      type: String,
      required: [true, 'eventType is required for RiskEvent'],
      enum: {
        values: RISK_EVENT_TYPES,
        message: '{VALUE} is not a valid risk event type. Allowed: CART_ABANDONED, PAYMENT_FAILED, ORDER_CANCELLED',
      },
      trim: true,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: [0, 'riskScore cannot be negative'],
    },
    riskLevel: {
      type: String,
      enum: {
        values: RISK_LEVELS,
        message: '{VALUE} is not a valid risk level',
      },
      default: 'LOW',
    },
    riskAmount: {
      type: Number,
      default: 0,
      min: [0, 'riskAmount cannot be negative'],
    },
    riskReason: {
      type: String,
      default: '',
      trim: true,
    },
    relatedOrderId: {
      type: String,
      default: null,
      trim: true,
    },
    relatedCartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
      default: null,
    },
    status: {
      type: String,
      required: [true, 'status is required'],
      enum: {
        values: RISK_STATUSES,
        message: '{VALUE} is not a valid risk status. Allowed: OPEN, REVIEWED, RESOLVED',
      },
      default: 'OPEN',
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Indexes on userId and eventType as required
riskEventSchema.index({ userId: 1 });
riskEventSchema.index({ eventType: 1 });
riskEventSchema.index({ userId: 1, eventType: 1 });
riskEventSchema.index({ status: 1 });
riskEventSchema.index({ detectedAt: -1 });

const RiskEvent = mongoose.model('RiskEvent', riskEventSchema);

export default RiskEvent;
