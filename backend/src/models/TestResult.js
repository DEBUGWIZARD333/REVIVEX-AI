import mongoose from 'mongoose';

const logEntrySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  level: {
    type: String,
    enum: ['INFO', 'WARN', 'ERROR', 'SUCCESS'],
    default: 'INFO',
  },
  message: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
});

const testResultSchema = new mongoose.Schema(
  {
    suiteRunId: {
      type: String,
      required: true,
      index: true,
    },
    scenarioId: {
      type: String,
      required: true,
      enum: [
        'MOCK_CUSTOMER_EVENTS',
        'CART_ABANDONMENT',
        'PAYMENT_FAILURE',
        'COUPON_RECOVERY',
        'REVENUE_RECOVERY',
        'ALL_AGENT_WORKFLOWS',
        'RISK_DETECTION_TESTING',
      ],
    },
    scenarioName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    logs: [logEntrySchema],
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    errorDetails: {
      message: String,
      stack: String,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const TestResult = mongoose.model('TestResult', testResultSchema);

export default TestResult;
