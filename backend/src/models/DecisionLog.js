import mongoose from 'mongoose';

export const DECISION_LOG_STATUSES = ['RECEIVED', 'PROCESSING', 'EXECUTED', 'FAILED'];

const decisionLogSchema = new mongoose.Schema(
  {
    decisionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DecisionEvent',
      required: [true, 'decisionId is required for DecisionLog'],
    },
    status: {
      type: String,
      required: [true, 'status is required for DecisionLog'],
      enum: {
        values: DECISION_LOG_STATUSES,
        message: '{VALUE} is not a valid DecisionLog status. Allowed: RECEIVED, PROCESSING, EXECUTED, FAILED',
      },
      default: 'RECEIVED',
    },
    actionTaken: {
      type: String,
      default: '',
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Performance Indexes
decisionLogSchema.index({ decisionId: 1 });
decisionLogSchema.index({ status: 1 });
decisionLogSchema.index({ timestamp: -1 });

const DecisionLog = mongoose.model('DecisionLog', decisionLogSchema);

export default DecisionLog;
