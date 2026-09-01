import Razorpay from 'razorpay';
import crypto from 'crypto';

// Use a mock fallback if environment variables are not set
const getRazorpayInstance = () => {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return null; // Signals we are in mock mode
};

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'USD', receipt = 'receipt_1' } = req.body;

    const instance = getRazorpayInstance();
    
    if (instance) {
      const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit
        currency,
        receipt,
      };
      const order = await instance.orders.create(options);
      res.json(order);
    } else {
      // Mock response for development when keys aren't set
      console.log('Using mock Razorpay order creation');
      res.json({
        id: `mock_order_${Math.random().toString(36).substring(7)}`,
        entity: 'order',
        amount: Math.round(amount * 100),
        currency,
        receipt,
        status: 'created',
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000)
      });
    }
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
        // Mock verification
        console.log('Using mock Razorpay payment verification');
        return res.json({ message: 'Payment verified successfully (Mock Mode)', success: true });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      res.json({ message: 'Payment verified successfully', success: true });
    } else {
      res.status(400).json({ message: 'Invalid payment signature', success: false });
    }
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};
