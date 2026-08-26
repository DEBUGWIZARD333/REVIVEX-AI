import * as cartService from '../services/cartService.js';
import mongoose from 'mongoose';

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cartItems = await cartService.getCartByUserId(userId);
    res.json(cartItems);
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Valid product ID is required' });
    }

    const qty = parseInt(quantity, 10) || 1;
    const cartItem = await cartService.addItemToCart(userId, productId, qty);
    res.status(201).json(cartItem);
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid cart item ID' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty)) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const updatedCartItem = await cartService.updateCartItemQuantity(userId, id, qty);

    if (!updatedCartItem && qty > 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json(updatedCartItem || { message: 'Cart item removed' });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid cart item ID' });
    }

    const deletedItem = await cartService.removeItemFromCart(userId, id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item removed successfully', id });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await cartService.clearUserCart(userId);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    next(error);
  }
};
