import mongoose from 'mongoose';

export const DECISION_TYPES = ['REMINDER', 'COUPON', 'RETRY_PAYMENT', 'ESCALATION'];

const decisionEventSchema = new mongoose.Schema(
  {
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
    customerHistory: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    cartValue: {
      type: Number,
      default: 0,
      min: [0, 'cartValue cannot be negative'],
    },
    riskReason: {
      type: String,
      default: '',
      trim: true,
    },
    previousPurchases: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    decisionType: {
      type: String,
      required: [true, 'decisionType is required'],
      enum: {
        values: DECISION_TYPES,
        message: '{VALUE} is not a valid decision type. Allowed: REMINDER, COUPON, RETRY_PAYMENT, ESCALATION',
      },
      trim: true,
    },
    confidenceScore: {
      type: Number,
      default: 0.85,
      min: [0.0, 'confidenceScore cannot be less than 0.0'],
      max: [1.0, 'confidenceScore cannot be greater than 1.0'],
    },
    actionTaken: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['RECEIVED', 'PROCESSING', 'EXECUTED', 'COMPLETED', 'FAILED'],
      default: 'EXECUTED',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Performance Indexes
decisionEventSchema.index({ userId: 1 });
decisionEventSchema.index({ riskEventId: 1 });
decisionEventSchema.index({ decisionType: 1 });
decisionEventSchema.index({ userId: 1, decisionType: 1 });
decisionEventSchema.index({ createdAt: -1 });

const DecisionEvent = mongoose.model('DecisionEvent', decisionEventSchema);

export default DecisionEvent;
