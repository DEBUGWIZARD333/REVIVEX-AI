import mongoose from 'mongoose';

export const RECOVERY_ACTION_TYPES = ['RECOVERY_LINK', 'COUPON', 'EMAIL', 'NOTIFICATION'];
export const RECOVERY_STATUSES = ['PENDING', 'SENT', 'COMPLETED', 'FAILED'];

const recoveryEventSchema = new mongoose.Schema(
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
    decisionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DecisionEvent',
      default: null,
    },
    actionType: {
      type: String,
      required: [true, 'actionType is required for RecoveryEvent'],
      enum: {
        values: RECOVERY_ACTION_TYPES,
        message: '{VALUE} is not a valid actionType. Allowed: RECOVERY_LINK, COUPON, EMAIL, NOTIFICATION',
      },
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'status is required for RecoveryEvent'],
      enum: {
        values: RECOVERY_STATUSES,
        message: '{VALUE} is not a valid status. Allowed: PENDING, SENT, COMPLETED, FAILED',
      },
      default: 'PENDING',
    },
    recoveryAmount: {
      type: Number,
      default: 0,
      min: [0, 'recoveryAmount cannot be negative'],
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Performance Indexes
recoveryEventSchema.index({ userId: 1 });
recoveryEventSchema.index({ riskEventId: 1 });
recoveryEventSchema.index({ decisionId: 1 });
recoveryEventSchema.index({ actionType: 1 });
recoveryEventSchema.index({ status: 1 });
recoveryEventSchema.index({ executedAt: -1 });

const RecoveryEvent = mongoose.model('RecoveryEvent', recoveryEventSchema);

export default RecoveryEvent;
