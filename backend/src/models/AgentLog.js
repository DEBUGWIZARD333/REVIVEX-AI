import mongoose from 'mongoose';

export const AGENT_LOG_STATUS = ['RECEIVED', 'PROCESSING', 'COMPLETED', 'FAILED'];

const agentLogSchema = new mongoose.Schema(
  {
    agentName: {
      type: String,
      required: [true, 'agentName is required'],
      trim: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'eventId is required'],
    },
    eventType: {
      type: String,
      required: [true, 'eventType is required'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'status is required'],
      enum: {
        values: AGENT_LOG_STATUS,
        message: '{VALUE} is not a valid status. Allowed: RECEIVED, PROCESSING, COMPLETED, FAILED',
      },
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Indexes
agentLogSchema.index({ eventId: 1 });
agentLogSchema.index({ agentName: 1 });
agentLogSchema.index({ status: 1 });
agentLogSchema.index({ processedAt: -1 });
agentLogSchema.index({ eventId: 1, agentName: 1 });

const AgentLog = mongoose.model('AgentLog', agentLogSchema);

export default AgentLog;
