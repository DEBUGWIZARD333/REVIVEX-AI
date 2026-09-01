import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MessageSquare, Send, Phone, User, ExternalLink, CheckCircle2, ShoppingBag, ShieldCheck } from 'lucide-react';

const WhatsAppChatWidget = ({ defaultAmount = 199.99 }) => {
  const { user } = useAuth();

  const [phone, setPhone] = useState('+91 8825553110');
  const [customerName, setCustomerName] = useState('Valued Customer');
  const [customMsg, setCustomMsg] = useState('');
  const [discountCode, setDiscountCode] = useState('SAVE20-REVIVEX');
  const [whatsappUrl, setWhatsappUrl] = useState('');

  useEffect(() => {
    if (user) {
      if (user.phone) setPhone(user.phone);
      if (user.name) setCustomerName(user.name);
    }
  }, [user]);

  useEffect(() => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const defaultText = `🛒 *ReviveX Cart Recovery*\n\nHi ${customerName},\nYou left items valued at *$${defaultAmount.toFixed(
      2
    )}* in your shopping cart!\n🎁 Use Code *${discountCode}* for *20% OFF* at checkout!\n\n👉 Complete your order here:\nhttp://localhost:5173/checkout?recovery=true\n\nItems reserved for a limited time.`;

    const textToSend = customMsg.trim() || defaultText;
    const encoded = encodeURIComponent(textToSend);
    setWhatsappUrl(`https://wa.me/${cleanPhone}?text=${encoded}`);
  }, [phone, customerName, defaultAmount, discountCode, customMsg]);

  const handleLaunchWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-emerald-800/80 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/60 pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <MessageSquare size={26} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold tracking-tight text-white">
                WhatsApp Live Recovery Chat Facility
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                Connected
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Directly target the registered mobile phone number of the logged-in customer.
            </p>
          </div>
        </div>

        <div className="bg-emerald-900/60 px-4 py-2 rounded-2xl border border-emerald-700/60 flex items-center space-x-2 text-xs font-mono text-emerald-200">
          <Phone size={14} className="text-emerald-400" />
          <span className="font-extrabold">{phone || '+91 8825553110'}</span>
        </div>
      </div>

      {/* Grid: Recipient Info & Live Chat Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Logged-in Recipient Details */}
        <div className="lg:col-span-5 space-y-4 bg-white/5 p-5 rounded-2xl border border-white/10 text-xs">
          <h3 className="font-extrabold text-emerald-300 uppercase tracking-wider text-[11px] flex items-center">
            <User size={14} className="mr-1.5" /> Logged-In Customer Target Profile
          </h3>

          <div className="space-y-3 font-medium">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer Name</span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs mt-1"
              />
            </div>

            <div>
              <span className="text-emerald-400 block text-[10px] uppercase font-bold">
                Registered WhatsApp Mobile Number
              </span>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800 border border-emerald-500/50 rounded-xl px-3 py-2 text-green-300 font-mono font-extrabold text-xs mt-1"
                placeholder="+91 8825553110"
              />
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Dynamic Discount Coupon</span>
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-extrabold text-xs mt-1"
              />
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Live Interactive Chat Bubble & Launch Action */}
        <div className="lg:col-span-7 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>WhatsApp Message Preview</span>
              <span className="text-emerald-400 flex items-center">
                <CheckCircle2 size={12} className="mr-1" /> Target: {phone}
              </span>
            </div>

            {/* Chat Bubble Mockup */}
            <div className="bg-emerald-950/90 text-emerald-100 p-4 rounded-2xl border border-emerald-800/80 text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-inner relative">
              <div className="absolute top-2 right-2 text-[9px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-md">
                WhatsApp Format
              </div>
              🛒 *ReviveX Cart Recovery*
              {'\n\n'}Hi {customerName},
              {'\n'}You left items valued at *${defaultAmount.toFixed(2)}* in your shopping cart!
              {'\n'}🎁 Use Code *{discountCode}* for *20% OFF* at checkout!
              {'\n\n'}👉 Complete your order here:
              {'\n'}http://localhost:5173/checkout?recovery=true
              {'\n\n'}Items reserved for a limited time.
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleLaunchWhatsApp}
            className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition flex items-center justify-center space-x-2"
          >
            <Send size={16} />
            <span>Send WhatsApp Message to {phone} &rarr;</span>
            <ExternalLink size={14} className="ml-1" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default WhatsAppChatWidget;
