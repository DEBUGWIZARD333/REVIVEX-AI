import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = ['IN_APP', 'BROWSER'];
export const NOTIFICATION_CATEGORIES = ['CART_ABANDONED', 'PAYMENT_FAILED', 'COUPON_AVAILABLE'];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required for Notification'],
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: 'IN_APP',
    },
    category: {
      type: String,
      required: [true, 'category is required'],
      enum: NOTIFICATION_CATEGORIES,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    actionUrl: {
      type: String,
      default: '',
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
