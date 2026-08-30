import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  RefreshCw,
  Lock,
} from 'lucide-react';

const RecoveryLinkHandler = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setCartItems } = useCart();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'valid', 'expired', 'redeemed', 'invalid'
  const [errorMsg, setErrorMsg] = useState('');
  const [recoveryData, setRecoveryData] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus('invalid');
        setErrorMsg('No recovery token provided.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/recovery-link/validate/${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setStatus('valid');
          setRecoveryData(data);

          // If cart items were restored, update local cart state
          if (data.cartItems && Array.isArray(data.cartItems) && data.cartItems.length > 0) {
            setCartItems(data.cartItems);
          }
        } else {
          if (data.isExpired) {
            setStatus('expired');
            setErrorMsg(data.message || 'This recovery link has expired.');
          } else if (data.isRedeemed) {
            setStatus('redeemed');
            setErrorMsg(data.message || 'This recovery link has already been used.');
          } else {
            setStatus('invalid');
            setErrorMsg(data.message || 'Invalid recovery link.');
          }
        }
      } catch (err) {
        setStatus('invalid');
        setErrorMsg('Failed to validate recovery token. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, setCartItems]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <RefreshCw size={32} className="animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Validating Recovery Link...</h2>
          <p className="text-xs text-slate-500">Restoring your cart session and verifying secure token.</p>
        </div>
      </div>
    );
  }

  if (status === 'valid') {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} />
          </div>

          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 mb-3">
            <ShieldCheck size={14} />
            <span>Secure 1-Click Recovery Active</span>
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            Cart Session Restored!
          </h1>

          <p className="text-sm text-slate-600 mb-6">
            We've verified your recovery link and securely restored your cart items worth{' '}
            <span className="font-extrabold text-brand-600">
              ${(recoveryData?.recoveryAmount || 0).toFixed(2)}
            </span>.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Recovery Token:</span>
              <span className="font-mono text-slate-700 font-bold">{token.substring(0, 12)}...</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Redeemed At:</span>
              <span className="text-slate-700 font-semibold">
                {new Date(recoveryData?.redeemedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/checkout')}
              className="flex-1 py-3.5 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
            <Link
              to="/cart"
              className="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition text-sm flex items-center justify-center space-x-2"
            >
              <ShoppingBag size={16} />
              <span>View Cart</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Expired, Redeemed, or Invalid states
  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-16 px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center border border-slate-100 shadow-sm">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            status === 'expired'
              ? 'bg-amber-50 text-amber-500'
              : 'bg-red-50 text-red-500'
          }`}
        >
          {status === 'expired' ? <Clock size={44} /> : <AlertCircle size={44} />}
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
          {status === 'expired'
            ? 'Recovery Link Expired'
            : status === 'redeemed'
            ? 'Recovery Link Already Used'
            : 'Invalid Recovery Link'}
        </h1>

        <p className="text-sm text-slate-500 mb-8">{errorMsg}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/shop"
            className="py-3.5 px-8 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition text-sm"
          >
            Continue Shopping
          </Link>
          <Link
            to="/cart"
            className="py-3.5 px-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition text-sm"
          >
            Go to Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecoveryLinkHandler;
