import mongoose from 'mongoose';

const recoveryTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
      default: null,
    },
    recoveryAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: true,
    },
    isRedeemed: {
      type: Boolean,
      default: false,
    },
    redeemedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance
recoveryTokenSchema.index({ userId: 1 });
recoveryTokenSchema.index({ expiresAt: 1 });

const RecoveryToken = mongoose.model('RecoveryToken', recoveryTokenSchema);

export default RecoveryToken;
