import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import OrderSummary from '../components/OrderSummary';
import WhatsAppChatWidget from '../components/WhatsAppChatWidget';
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus, MessageSquare, CheckCircle2 } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalCount, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [whatsappSending, setWhatsappSending] = useState(false);
  const [whatsappAlert, setWhatsappAlert] = useState(null);

  const handleSimulateCartAbandonment = async () => {
    try {
      setWhatsappSending(true);
      setWhatsappAlert(null);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/recovery-agent/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          actionType: 'WHATSAPP',
          userId: user?._id,
          cartValue: totalAmount || 199.99,
          details: {
            eventType: 'CART_ABANDONED',
            phone: user?.phone || '+918825553110',
            customerName: user?.name || 'Valued Customer',
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWhatsappAlert({
          phone: data.data?.details?.phone || user?.phone || '+918825553110',
          text: data.data?.details?.text,
          url: data.data?.details?.whatsappWebUrl,
        });
      }
    } catch (err) {
      console.error('WhatsApp cart abandonment error:', err);
    } finally {
      setWhatsappSending(false);
    }
  };

  // Visual helper gradient for missing images
  const getGradient = (category) => {
    switch (category?.toLowerCase()) {
      case 'electronics': return 'from-blue-400 to-indigo-500';
      case 'clothing': return 'from-pink-400 to-rose-500';
      case 'home': return 'from-amber-400 to-orange-500';
      default: return 'from-brand-400 to-brand-600';
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 mb-6">
              <ShoppingBag size={48} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Your Shopping Cart is Empty</h2>
            <p className="text-slate-500 max-w-md mb-8">
              Looks like you haven't added anything to your cart yet. Explore our products and discover great deals!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md transition-all hover:scale-105"
            >
              <ArrowLeft size={18} className="mr-2" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Shopping Cart</h1>
            <p className="mt-1 text-sm text-slate-500">
              You have <span className="font-semibold text-brand-600">{totalCount} item{totalCount > 1 ? 's' : ''}</span> in your cart.
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {user?.role === 'admin' && (
              <button
                onClick={handleSimulateCartAbandonment}
                disabled={whatsappSending}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-xs shadow-md transition disabled:opacity-50"
              >
                <MessageSquare size={15} className={`mr-1.5 ${whatsappSending ? 'animate-bounce' : ''}`} />
                {whatsappSending ? 'Sending WhatsApp...' : 'Test WhatsApp Cart Abandonment Text'}
              </button>
            )}

            <button
              onClick={clearCart}
              className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors bg-white px-3 py-2 rounded-xl border border-slate-200"
            >
              <Trash2 size={14} className="mr-1.5" /> Clear Cart
            </button>
          </div>
        </div>

        {/* WhatsApp Dispatch Banner */}
        {whatsappAlert && (
          <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-950 rounded-3xl p-6 text-white shadow-xl border border-green-700 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-green-300 text-xs font-bold uppercase tracking-wider">
                <MessageSquare size={16} />
                <span>WhatsApp Text Recovery Sent to Registered Mobile Number</span>
              </div>
              <p className="text-sm font-semibold">
                Customer Phone: <strong className="text-green-200">{whatsappAlert.phone}</strong>
              </p>
              <p className="text-xs text-green-100 bg-white/10 p-3 rounded-xl font-mono max-w-2xl">
                "{whatsappAlert.text}"
              </p>
            </div>
            {whatsappAlert.url && (
              <a
                href={whatsappAlert.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-5 py-3 bg-green-500 hover:bg-green-400 text-slate-950 font-extrabold rounded-2xl text-xs shadow-lg transition flex-shrink-0"
              >
                <MessageSquare size={16} className="mr-2" /> Open Web WhatsApp Chat &rarr;
              </a>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Item List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const product = item.product || {};
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 transition hover:shadow-md"
                >
                  {/* Image & Product Info */}
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <Link
                      to={`/products/${product._id || product.id}`}
                      className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative flex items-center justify-center"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${getGradient(product.category)} opacity-80 flex items-center justify-center`}>
                          <span className="text-white text-xs font-bold uppercase">{product.category}</span>
                        </div>
                      )}
                    </Link>

                    <div>
                      <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 hover:text-brand-600 transition">
                        <Link to={`/products/${product._id || product.id}`}>
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-slate-500 font-semibold text-sm mt-0.5">
                        ${product.price?.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls & Total */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Quantity adjuster */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1.5 font-semibold text-sm text-slate-900 min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Subtotal for item */}
                    <p className="text-base font-bold text-slate-900 min-w-[5rem] text-right">
                      ${((product.price || 0) * item.quantity).toFixed(2)}
                    </p>

                    {/* Remove item button */}
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-slate-400 hover:text-red-500 transition p-2 rounded-lg hover:bg-red-50"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-4">
              <Link
                to="/shop"
                className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 transition"
              >
                <ArrowLeft size={16} className="mr-1.5" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Reusable Order Summary Component */}
          <div className="lg:col-span-4">
            <OrderSummary
              actionButtonText="Proceed to Checkout"
              onActionButtonClick={() => navigate('/checkout')}
              showPromoInput={true}
            />
          </div>

        </div>

        {/* WhatsApp Live Recovery Chat Facility (Admin View) */}
        {user?.role === 'admin' && (
          <div className="mt-12">
            <WhatsAppChatWidget defaultAmount={totalAmount} />
          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;
