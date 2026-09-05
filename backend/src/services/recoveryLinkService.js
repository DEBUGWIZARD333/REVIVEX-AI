import crypto from 'crypto';
import mongoose from 'mongoose';
import RecoveryToken from '../models/RecoveryToken.js';
import Cart from '../models/Cart.js';
import * as agentLogService from './agentLogService.js';

const CLIENT_APP_URL = process.env.CLIENT_APP_URL || 'http://localhost:5176';

/**
 * Generate Secure Recovery Link
 * 
 * Input:
 * - userId
 * - cartId
 * - options (expiresInHours, recoveryAmount)
 * 
 * Output:
 * - recoveryLink (e.g. http://localhost:5173/recover/cart/{token})
 */
export const generateRecoveryLink = async (userId, cartId, options = {}) => {
  // 1. Input Validation
  let validUserId = null;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    validUserId = userId;
  }

  let validCartId = null;
  if (cartId && mongoose.Types.ObjectId.isValid(cartId)) {
    validCartId = cartId;
  }

  const expiresInHours = options.expiresInHours ? parseInt(options.expiresInHours, 10) : 24;
  const recoveryAmount = options.recoveryAmount ? parseFloat(options.recoveryAmount) : 0;

  // 2. Capture snapshot of user's active cart items
  let cartSnapshot = [];
  if (validUserId) {
    const activeCart = await Cart.find({ userId: validUserId }).populate('productId', 'name price category image');
    cartSnapshot = activeCart.map(item => ({
      _id: item._id,
      product: item.productId,
      quantity: item.quantity,
    }));
  }

  // 3. Generate Unique Cryptographic Token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  // 4. Format Output Recovery Link (e.g., http://localhost:5173/recover/cart/{token})
  const recoveryLink = `${CLIENT_APP_URL}/recover/cart/${token}`;

  // 5. Save Token to Database with Cart Snapshot
  const tokenDoc = new RecoveryToken({
    token,
    userId: validUserId,
    cartId: validCartId,
    recoveryAmount,
    cartItems: cartSnapshot,
    expiresAt,
    isRedeemed: false,
  });
  await tokenDoc.save();

  // 6. Audit Logging
  console.log(`[RecoveryLinkService] Generated secure recovery URL for user ${validUserId || 'guest'}: ${recoveryLink}`);
  
  await agentLogService.createAgentLog({
    agentName: 'RecoveryLinkGenerator',
    eventType: 'GENERATE_RECOVERY_LINK',
    status: 'COMPLETED',
    message: `Generated recovery URL (Expires in ${expiresInHours}h): ${recoveryLink}`,
    processedAt: new Date(),
  });

  return {
    success: true,
    token,
    recoveryLink,
    expiresAt,
    userId: validUserId,
    cartId: validCartId,
    recoveryAmount,
  };
};

/**
 * Validate and Redeem Recovery Token
 */
export const validateAndRedeemToken = async (token) => {
  if (!token || typeof token !== 'string') {
    return {
      valid: false,
      message: 'Recovery token is required',
    };
  }

  // Find token document
  const tokenDoc = await RecoveryToken.findOne({ token: token.trim() })
    .populate('userId', 'name email')
    .populate('cartId');

  if (!tokenDoc) {
    return {
      valid: false,
      message: 'Invalid recovery link. Token not found.',
    };
  }

  // Check if token has already been redeemed
  if (tokenDoc.isRedeemed) {
    return {
      valid: false,
      isRedeemed: true,
      message: 'This recovery link has already been used.',
      redeemedAt: tokenDoc.redeemedAt,
    };
  }

  // Check if token has expired
  const now = new Date();
  if (now > tokenDoc.expiresAt) {
    return {
      valid: false,
      isExpired: true,
      message: 'This recovery link has expired.',
      expiresAt: tokenDoc.expiresAt,
    };
  }

  // Mark token as redeemed
  tokenDoc.isRedeemed = true;
  tokenDoc.redeemedAt = now;
  await tokenDoc.save();

  // Fetch restored cart items: check live DB cart first, fallback to token snapshot
  let cartItems = [];
  if (tokenDoc.userId) {
    const liveCart = await Cart.find({ userId: tokenDoc.userId._id || tokenDoc.userId }).populate(
      'productId',
      'name price category image'
    );
    if (liveCart && liveCart.length > 0) {
      cartItems = liveCart;
    } else if (tokenDoc.cartItems && tokenDoc.cartItems.length > 0) {
      cartItems = tokenDoc.cartItems;
    }
  } else if (tokenDoc.cartItems && tokenDoc.cartItems.length > 0) {
    cartItems = tokenDoc.cartItems;
  }

  // Generate authentication token so customer is automatically logged in
  let authToken = null;
  if (tokenDoc.userId) {
    try {
      const { generateToken } = await import('../utils/jwt.js');
      authToken = generateToken(tokenDoc.userId._id || tokenDoc.userId);
    } catch (e) {
      console.warn('[RecoveryLinkService] JWT generate warning:', e.message);
    }
  }

  console.log(`[RecoveryLinkService] Successfully validated and redeemed recovery token ${token}`);

  await agentLogService.createAgentLog({
    agentName: 'RecoveryLinkGenerator',
    eventType: 'REDEEM_RECOVERY_LINK',
    status: 'COMPLETED',
    message: `Redeemed recovery token ${token} for user ${tokenDoc.userId?.email || 'guest'}`,
    processedAt: now,
  });

  return {
    valid: true,
    message: 'Recovery link successfully validated and redeemed.',
    token: tokenDoc.token,
    authToken,
    user: tokenDoc.userId,
    cartId: tokenDoc.cartId,
    cartItems,
    recoveryAmount: tokenDoc.recoveryAmount,
    redeemedAt: tokenDoc.redeemedAt,
  };
};
