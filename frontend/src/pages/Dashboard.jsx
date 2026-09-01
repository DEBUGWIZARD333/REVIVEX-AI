import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, Phone, Mail, ArrowRight, ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { cartItems, totalAmount, totalCount } = useCart();

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Valued Customer'}!
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your shopping cart, checkout payment, and registered WhatsApp mobile phone number.
            </p>
          </div>

          <Link
            to="/profile"
            className="inline-flex items-center px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition"
          >
            <User size={16} className="mr-2" /> View & Edit Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8 cols): My Shopping Cart Items & Payment Checkout */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Shopping Cart Items Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
                    <ShoppingCart size={22} className="mr-2.5 text-brand-600" /> My Saved Cart Items ({totalCount})
                  </h2>
                  <p className="text-xs text-slate-400">Reserved items ready for checkout</p>
                </div>
                <Link
                  to="/cart"
                  className="text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center"
                >
                  Manage Cart <ArrowRight size={14} className="ml-1" />
                </Link>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingCart size={24} />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">Your shopping cart is currently empty.</p>
                  <Link
                    to="/shop"
                    className="inline-flex items-center px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs"
                  >
                    Browse Shop Catalog &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-slate-100">
                    {cartItems.map((item) => {
                      const product = item.productId || {};
                      return (
                        <div key={item._id} className="py-3.5 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                              alt={product.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{product.name || 'Product Item'}</p>
                              <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right font-extrabold text-slate-900 text-xs">
                            ${((product.price || 0) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Cart Amount</span>
                      <div className="text-2xl font-extrabold text-brand-600">${totalAmount.toFixed(2)}</div>
                    </div>

                    <Link
                      to="/checkout"
                      className="inline-flex items-center px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
                    >
                      <CreditCard size={16} className="mr-2" /> Proceed to Checkout & Pay &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Payment & Order Status Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <CreditCard size={18} className="mr-2 text-emerald-600" /> Checkout & Payment Status
              </h3>
              <p className="text-xs text-slate-500">
                All cart transactions are processed securely. If any checkout payment is interrupted, instant 1-click payment recovery links and coupons will be dispatched to your registered WhatsApp mobile phone number.
              </p>
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 w-fit">
                <CheckCircle2 size={16} className="mr-1 text-emerald-600" />
                <span>Protected by ReviveX 1-Click Payment Recovery</span>
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Registered Customer Profile Summary */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center">
                  <User size={18} className="mr-2 text-brand-600" /> Registered Profile
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                  {user?.role || 'User'}
                </span>
              </div>

              <div className="space-y-4 text-xs font-medium">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider block">Full Name</span>
                  <span className="text-slate-900 font-bold text-sm">{user?.name || 'Customer'}</span>
                </div>

                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider block">Email Address</span>
                  <span className="text-slate-900 font-mono flex items-center">
                    <Mail size={13} className="mr-1 text-slate-400" /> {user?.email || 'customer@example.com'}
                  </span>
                </div>

                <div className="bg-green-50 p-4 rounded-2xl border border-green-200 space-y-1">
                  <span className="text-green-800 uppercase text-[10px] font-extrabold tracking-wider block flex items-center">
                    <Phone size={13} className="mr-1 text-green-600" /> WhatsApp Mobile Number
                  </span>
                  <span className="text-green-950 font-extrabold text-sm font-mono block">
                    {user?.phone || '+1 (555) 234-5678'}
                  </span>
                  <p className="text-[10px] text-green-700 font-medium">
                    WhatsApp text messages will be delivered to this number for abandoned carts and payment retry links.
                  </p>
                </div>
              </div>

              <Link
                to="/profile"
                className="w-full flex items-center justify-center py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
              >
                Update Mobile Number & Profile &rarr;
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
