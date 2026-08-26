import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShieldCheck, Tag, ArrowRight, X, Check } from 'lucide-react';

const OrderSummary = ({
  actionButtonText = 'Proceed to Checkout',
  onActionButtonClick,
  showPromoInput = true,
  showItemsList = false,
  disabled = false,
}) => {
  const {
    cartItems,
    subtotal,
    shippingFee,
    tax,
    discountCode,
    discountAmount,
    grandTotal,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyPromoCode(inputCode);
    if (res.success) {
      setInputCode('');
      setPromoError('');
    } else {
      setPromoError(res.message);
    }
  };

  // Gradient generator for missing images
  const getGradient = (category) => {
    switch (category?.toLowerCase()) {
      case 'electronics': return 'from-blue-400 to-indigo-500';
      case 'clothing': return 'from-pink-400 to-rose-500';
      case 'home': return 'from-amber-400 to-orange-500';
      default: return 'from-brand-400 to-brand-600';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 sticky top-24">
      <h2 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
        <span>Order Summary</span>
        <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
          {cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items
        </span>
      </h2>

      {/* Optional Items List Preview */}
      {showItemsList && cartItems.length > 0 && (
        <div className="space-y-4 max-h-60 overflow-y-auto pr-1 mb-6 border-b border-slate-100 pb-6">
          {cartItems.map((item) => {
            const product = item.product || {};
            return (
              <div key={item._id} className="flex items-center space-x-3 text-sm">
                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getGradient(product.category)} opacity-80 flex items-center justify-center`}>
                      <span className="text-white text-[9px] font-bold uppercase">{product.category}</span>
                    </div>
                  )}
                  <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">{product.name}</h4>
                  <p className="text-xs text-slate-500">${(product.price || 0).toFixed(2)} each</p>
                </div>
                <div className="font-bold text-slate-900">
                  ${((product.price || 0) * item.quantity).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Promo / Discount Code Input */}
      {showPromoInput && (
        <div className="mb-6 pb-6 border-b border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center">
            <Tag size={14} className="mr-1.5 text-brand-600" /> Promo Code
          </label>
          
          {discountCode ? (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl text-sm font-semibold">
              <span className="flex items-center">
                <Check size={16} className="mr-1.5 text-emerald-600" />
                Code <span className="uppercase ml-1 underline">{discountCode}</span> Applied
              </span>
              <button
                type="button"
                onClick={removePromoCode}
                className="text-emerald-500 hover:text-red-500 transition p-1"
                title="Remove Promo Code"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. REVENUE10"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition"
              >
                Apply
              </button>
            </form>
          )}

          {promoError && (
            <p className="text-xs text-red-500 mt-1 font-medium">{promoError}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1.5">Try using <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold">REVENUE10</code> or <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-bold">WELCOME20</code></p>
        </div>
      )}

      {/* Financial Calculations breakdown */}
      <div className="space-y-3.5 text-sm text-slate-600 border-b border-slate-100 pb-6">
        <div className="flex justify-between items-center">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span>Shipping Fee</span>
          <span>
            {shippingFee === 0 ? (
              <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-xs">FREE</span>
            ) : (
              `$${shippingFee.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>Estimated Tax (8%)</span>
          <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-emerald-600 font-semibold">
            <span>Discount ({discountCode})</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Grand Total Display */}
      <div className="flex justify-between items-center py-6 border-b border-slate-100 mb-6">
        <div>
          <span className="text-lg font-bold text-slate-900 block">Final Amount</span>
          <span className="text-xs text-slate-400">Total payable (incl. taxes)</span>
        </div>
        <span className="text-3xl font-extrabold text-brand-600">${grandTotal.toFixed(2)}</span>
      </div>

      {/* Action Button */}
      {onActionButtonClick && (
        <button
          type="button"
          onClick={onActionButtonClick}
          disabled={disabled || cartItems.length === 0}
          className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
        >
          <span>{actionButtonText}</span>
          <ArrowRight size={18} />
        </button>
      )}

      <div className="mt-5 flex items-center justify-center space-x-2 text-xs text-slate-400">
        <ShieldCheck size={16} className="text-emerald-500" />
        <span>Real-time Secure Calculation</span>
      </div>
    </div>
  );
};

export default OrderSummary;
