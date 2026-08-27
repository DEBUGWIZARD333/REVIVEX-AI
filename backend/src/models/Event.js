import mongoose from 'mongoose';

export const EVENT_TYPES = [
  'PRODUCT_VIEWED',
  'ADD_TO_CART',
  'REMOVE_CART_ITEM',
  'CHECKOUT_STARTED',
  'PAYMENT_INITIATED',
  'PAYMENT_FAILED',
  'PAYMENT_SUCCESS',
];

const eventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: {
        values: EVENT_TYPES,
        message: '{VALUE} is not a valid event type',
      },
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sessionId: {
      type: String,
      trim: true,
      default: null,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isProcessed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes on userId, eventType, and isProcessed for optimized query performance
eventSchema.index({ userId: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ isProcessed: 1 });
eventSchema.index({ userId: 1, eventType: 1 });
eventSchema.index({ timestamp: -1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
