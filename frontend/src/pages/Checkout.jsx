import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  trackCheckoutStarted,
  trackPaymentInitiated,
  trackPaymentSuccess,
  trackPaymentFailed,
} from '../services/eventTracker';
import {
  ShieldCheck,
  ArrowLeft,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ShoppingBag,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Check,
} from 'lucide-react';

const Checkout = () => {
  const { cartItems, subtotal, clearCart, totalCount } = useCart();
  const navigate = useNavigate();

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const shippingCost = subtotal > 100 || cartItems.length === 0 ? 0 : 9.99;
  const taxCost = subtotal * 0.08;
  const grandTotal = subtotal + shippingCost + taxCost;

  // Track CHECKOUT_STARTED event on mount
  useEffect(() => {
    if (cartItems.length > 0) {
      trackCheckoutStarted({ itemCount: cartItems.length, subtotal, grandTotal });
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      shipping_fullName: '',
      shipping_mobile: '',
      shipping_email: '',
      shipping_address1: '',
      shipping_address2: '',
      shipping_city: '',
      shipping_state: '',
      shipping_pincode: '',

      billing_fullName: '',
      billing_mobile: '',
      billing_email: '',
      billing_address1: '',
      billing_address2: '',
      billing_city: '',
      billing_state: '',
      billing_pincode: '',
    },
  });

  const onSubmit = (data) => {
    setIsSubmitting(true);
    
    // Track PAYMENT_INITIATED event with deduplication
    trackPaymentInitiated({ paymentMethod, amount: grandTotal });

    // Simulate payment processing & order creation
    setTimeout(() => {
      try {
        const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        const orderData = {
          orderId,
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          shipping: {
            fullName: data.shipping_fullName,
            mobile: data.shipping_mobile,
            email: data.shipping_email,
            address1: data.shipping_address1,
            address2: data.shipping_address2,
            city: data.shipping_city,
            state: data.shipping_state,
            pincode: data.shipping_pincode,
          },
          billing: sameAsShipping
            ? {
                fullName: data.shipping_fullName,
                mobile: data.shipping_mobile,
                email: data.shipping_email,
                address1: data.shipping_address1,
                address2: data.shipping_address2,
                city: data.shipping_city,
                state: data.shipping_state,
                pincode: data.shipping_pincode,
              }
            : {
                fullName: data.billing_fullName,
                mobile: data.billing_mobile,
                email: data.billing_email,
                address1: data.billing_address1,
                address2: data.billing_address2,
                city: data.billing_city,
                state: data.billing_state,
                pincode: data.billing_pincode,
              },
          paymentMethod,
          items: [...cartItems],
          totalAmount: grandTotal,
        };

        // Track PAYMENT_SUCCESS event
        trackPaymentSuccess({ orderId, totalAmount: grandTotal, paymentMethod });

        setOrderDetails(orderData);
        setIsSubmitting(false);
        setOrderComplete(true);
        clearCart();
      } catch (err) {
        // Track PAYMENT_FAILED event
        trackPaymentFailed({ reason: err.message, amount: grandTotal });
        setIsSubmitting(false);
      }
    }, 1500);
  };

  // Helper gradients for image placeholders
  const getGradient = (category) => {
    switch (category?.toLowerCase()) {
      case 'electronics': return 'from-blue-400 to-indigo-500';
      case 'clothing': return 'from-pink-400 to-rose-500';
      case 'home': return 'from-amber-400 to-orange-500';
      default: return 'from-brand-400 to-brand-600';
    }
  };

  if (orderComplete && orderDetails) {
    return (
      <div className="bg-slate-50 min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Order Confirmed!</h1>
            <p className="text-slate-500 mb-6">
              Thank you for your purchase. We've sent an order confirmation email to{' '}
              <span className="font-semibold text-slate-800">{orderDetails.shipping.email}</span>.
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase">Order Number</span>
                  <p className="text-lg font-extrabold text-brand-600">{orderDetails.orderId}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Date</span>
                  <p className="text-sm font-semibold text-slate-700">{orderDetails.date}</p>
                </div>
              </div>

              {/* Order Items */}
              <h3 className="text-sm font-bold text-slate-900 mb-3">Order Items</h3>
              <div className="space-y-3 mb-6">
                {orderDetails.items.map((item) => (
                  <div key={item._id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-bold text-xs">
                        {item.quantity}x
                      </span>
                      <span className="font-medium text-slate-800">{item.product?.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Shipping Destination</h4>
                <p className="text-sm font-semibold text-slate-800">{orderDetails.shipping.fullName}</p>
                <p className="text-sm text-slate-600">{orderDetails.shipping.address1}{orderDetails.shipping.address2 ? `, ${orderDetails.shipping.address2}` : ''}</p>
                <p className="text-sm text-slate-600">{orderDetails.shipping.city}, {orderDetails.shipping.state} - {orderDetails.shipping.pincode}</p>
                <p className="text-sm text-slate-600">Mobile: {orderDetails.shipping.mobile}</p>
              </div>

              {/* Total Paid */}
              <div className="pt-4 border-t border-slate-200 mt-4 flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">Total Paid</span>
                <span className="text-2xl font-extrabold text-brand-600">${orderDetails.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition shadow-sm"
              >
                Continue Shopping
              </Link>
              <Link
                to="/dashboard"
                className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 mb-6">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">No Items to Checkout</h2>
            <p className="text-slate-500 max-w-md mb-8">
              Your cart is empty. Please add items to your cart before proceeding to checkout.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md transition"
            >
              <ArrowLeft size={18} className="mr-2" /> Explore Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/cart" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-brand-600 mb-2 transition">
              <ArrowLeft size={16} className="mr-2" /> Back to Cart
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Checkout</h1>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <Lock size={14} />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Addresses & Payment */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Shipping Address Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Shipping Address</h2>
                    <p className="text-xs text-slate-500">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="John Doe"
                        {...register('shipping_fullName', {
                          required: 'Full name is required',
                          minLength: { value: 3, message: 'Name must be at least 3 characters' },
                        })}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                          errors.shipping_fullName ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-brand-500'
                        }`}
                      />
                      <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                    {errors.shipping_fullName && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{errors.shipping_fullName.message}</p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="9876543210"
                        {...register('shipping_mobile', {
                          required: 'Mobile number is required',
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: 'Enter a valid 10-digit mobile number',
                          },
                        })}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                          errors.shipping_mobile ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-brand-500'
                        }`}
                      />
                      <Phone size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                    {errors.shipping_mobile && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{errors.shipping_mobile.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="john@example.com"
                        {...register('shipping_email', {
                          required: 'Email address is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                          errors.shipping_email ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-brand-500'
                        }`}
                      />
                      <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                    {errors.shipping_email && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{errors.shipping_email.message}</p>
                    )}
                  </div>

                  {/* Address Line 1 */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Address Line 1 *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="House / Flat No., Building Name, Street"
                        {...register('shipping_address1', {
                          required: 'Address Line 1 is required',
                        })}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                          errors.shipping_address1 ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-brand-500'
                        }`}
                      />
                      <MapPin size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                    {errors.shipping_address1 && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{errors.shipping_address1.message}</p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Address Line 2 (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Landmark, Area, Sector"
                        {...register('shipping_address2')}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                      />
                      <Building size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, New York"
                      {...register('shipping_city', {
                        required: 'City is required',
                      })}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                        errors.shipping_city ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-brand-500'
                      }`}
                    />
                    {errors.shipping_city && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{errors.shipping_city.message}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maharashtra, California"
                      {...register('shipping_state', {
                        required: 'State is required',
                      })}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                        errors.shipping_state ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-brand-500'
                      }`}
                    />
                    {errors.shipping_state && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{errors.shipping_state.message}</p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Pincode / ZIP Code *
                    </label>
                    <input
                      type="text"
                      placeholder="6-digit pincode e.g. 400001"
                      {...register('shipping_pincode', {
                        required: 'Pincode is required',
                        pattern: {
                          value: /^\d{6}$/,
                          message: 'Pincode must be a 6-digit number',
                        },
                      })}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                        errors.shipping_pincode ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 focus:ring-brand-500'
                      }`}
                    />
                    {errors.shipping_pincode && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{errors.shipping_pincode.message}</p>
                    )}
                  </div>

                </div>
              </div>

              {/* Billing Address Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900">Billing Address</h2>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                    />
                    <span className="text-sm font-semibold text-slate-700">Same as shipping address</span>
                  </label>
                </div>

                {!sameAsShipping && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {/* Billing Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                        Billing Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        {...register('billing_fullName', {
                          required: !sameAsShipping ? 'Billing full name is required' : false,
                        })}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                          errors.billing_fullName ? 'border-red-400' : 'border-slate-200'
                        }`}
                      />
                      {errors.billing_fullName && (
                        <p className="text-xs text-red-500 mt-1">{errors.billing_fullName.message}</p>
                      )}
                    </div>

                    {/* Billing Mobile */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        {...register('billing_mobile', {
                          required: !sameAsShipping ? 'Mobile number is required' : false,
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: 'Enter a valid 10-digit mobile number',
                          },
                        })}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                          errors.billing_mobile ? 'border-red-400' : 'border-slate-200'
                        }`}
                      />
                      {errors.billing_mobile && (
                        <p className="text-xs text-red-500 mt-1">{errors.billing_mobile.message}</p>
                      )}
                    </div>

                    {/* Billing Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        {...register('billing_email', {
                          required: !sameAsShipping ? 'Email address is required' : false,
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                          errors.billing_email ? 'border-red-400' : 'border-slate-200'
                        }`}
                      />
                      {errors.billing_email && (
                        <p className="text-xs text-red-500 mt-1">{errors.billing_email.message}</p>
                      )}
                    </div>

                    {/* Billing Address 1 */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        placeholder="House / Flat No., Street"
                        {...register('billing_address1', {
                          required: !sameAsShipping ? 'Address Line 1 is required' : false,
                        })}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                          errors.billing_address1 ? 'border-red-400' : 'border-slate-200'
                        }`}
                      />
                      {errors.billing_address1 && (
                        <p className="text-xs text-red-500 mt-1">{errors.billing_address1.message}</p>
                      )}
                    </div>

                    {/* Billing Address 2 */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Landmark, Area"
                        {...register('billing_address2')}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                      />
                    </div>

                    {/* Billing City */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        placeholder="City"
                        {...register('billing_city', {
                          required: !sameAsShipping ? 'City is required' : false,
                        })}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                          errors.billing_city ? 'border-red-400' : 'border-slate-200'
                        }`}
                      />
                      {errors.billing_city && (
                        <p className="text-xs text-red-500 mt-1">{errors.billing_city.message}</p>
                      )}
                    </div>

                    {/* Billing State */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        placeholder="State"
                        {...register('billing_state', {
                          required: !sameAsShipping ? 'State is required' : false,
                        })}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                          errors.billing_state ? 'border-red-400' : 'border-slate-200'
                        }`}
                      />
                      {errors.billing_state && (
                        <p className="text-xs text-red-500 mt-1">{errors.billing_state.message}</p>
                      )}
                    </div>

                    {/* Billing Pincode */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        placeholder="6-digit pincode"
                        {...register('billing_pincode', {
                          required: !sameAsShipping ? 'Pincode is required' : false,
                          pattern: {
                            value: /^\d{6}$/,
                            message: 'Pincode must be a 6-digit number',
                          },
                        })}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                          errors.billing_pincode ? 'border-red-400' : 'border-slate-200'
                        }`}
                      />
                      {errors.billing_pincode && (
                        <p className="text-xs text-red-500 mt-1">{errors.billing_pincode.message}</p>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Payment Option</h2>
                    <p className="text-xs text-slate-500">Select how you want to pay</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border rounded-2xl cursor-pointer flex items-center justify-between transition ${
                      paymentMethod === 'card'
                        ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard size={22} className={paymentMethod === 'card' ? 'text-brand-600' : 'text-slate-400'} />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Credit / Debit Card</p>
                        <p className="text-xs text-slate-500">Visa, Mastercard, Amex</p>
                      </div>
                    </div>
                    {paymentMethod === 'card' && <Check size={18} className="text-brand-600" />}
                  </label>

                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 border rounded-2xl cursor-pointer flex items-center justify-between transition ${
                      paymentMethod === 'cod'
                        ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Truck size={22} className={paymentMethod === 'cod' ? 'text-brand-600' : 'text-slate-400'} />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Cash on Delivery</p>
                        <p className="text-xs text-slate-500">Pay when order arrives</p>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && <Check size={18} className="text-brand-600" />}
                  </label>
                </div>
              </div>

            </div>

            {/* Right Column: Order Review */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100 flex justify-between items-center">
                <span>Order Review</span>
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                  {totalCount} item{totalCount > 1 ? 's' : ''}
                </span>
              </h2>

              {/* Cart Items List */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1 mb-6 border-b border-slate-100 pb-6">
                {cartItems.map((item) => {
                  const product = item.product || {};
                  return (
                    <div key={item._id} className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${getGradient(product.category)} opacity-80 flex items-center justify-center`}>
                            <span className="text-white text-[10px] font-bold uppercase">{product.category}</span>
                          </div>
                        )}
                        <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{product.name}</h4>
                        <p className="text-xs text-slate-400">{product.category}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ${(product.price || 0).toFixed(2)} × {item.quantity}
                        </p>
                      </div>

                      <div className="text-right font-bold text-sm text-slate-900">
                        ${((product.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial Calculation breakdown */}
              <div className="space-y-3 text-sm text-slate-600 border-b border-slate-100 pb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-xs">FREE</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-slate-900">${taxCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-6 border-b border-slate-100 mb-6">
                <span className="text-lg font-bold text-slate-900">Total Amount</span>
                <span className="text-2xl font-extrabold text-brand-600">${grandTotal.toFixed(2)}</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Order...</span>
                  </div>
                ) : (
                  <>
                    <span>Place Order & Pay ${grandTotal.toFixed(2)}</span>
                    <ShieldCheck size={18} />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-slate-400">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>30-Day Money Back Guarantee</span>
              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
};

export default Checkout;
