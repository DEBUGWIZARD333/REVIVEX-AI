import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required to create a cart item'],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required for a cart item'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity cannot be less than 1'],
      default: 1,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Optional: Ensure a user can only have one cart entry per specific product
// If they add the same product again, the quantity should just increment 
// (which we will handle in the controller, but this index prevents accidental duplicates)
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
