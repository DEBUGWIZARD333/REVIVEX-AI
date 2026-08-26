import Cart from '../models/Cart.js';

export const getCartByUserId = async (userId) => {
  return await Cart.find({ userId }).populate('productId');
};

export const addItemToCart = async (userId, productId, quantity = 1) => {
  let cartItem = await Cart.findOne({ userId, productId });

  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    cartItem = await Cart.create({
      userId,
      productId,
      quantity,
    });
  }

  return await Cart.findById(cartItem._id).populate('productId');
};

export const updateCartItemQuantity = async (userId, cartItemId, quantity) => {
  if (quantity <= 0) {
    return await Cart.findOneAndDelete({ _id: cartItemId, userId });
  }

  const cartItem = await Cart.findOneAndUpdate(
    { _id: cartItemId, userId },
    { quantity },
    { new: true }
  ).populate('productId');

  return cartItem;
};

export const removeItemFromCart = async (userId, cartItemId) => {
  return await Cart.findOneAndDelete({ _id: cartItemId, userId });
};

export const clearUserCart = async (userId) => {
  return await Cart.deleteMany({ userId });
};
