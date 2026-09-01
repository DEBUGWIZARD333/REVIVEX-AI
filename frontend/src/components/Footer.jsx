import { Link } from 'react-router-dom';
import { Zap, Mail, ArrowRight, Shield, CreditCard, Truck, Globe, MessageSquare, Link2 } from 'lucide-react';

const footerLinks = {
  Shop: [
    { label: 'Electronics',    to: '/shop?category=Electronics' },
    { label: 'Clothing',       to: '/shop?category=Clothing' },
    { label: 'Home & Kitchen', to: '/shop?category=Home' },
    { label: 'Accessories',    to: '/shop?category=Accessories' },
    { label: 'New Arrivals',   to: '/shop?sort=new' },
    { label: 'Sale Items',     to: '/shop?sale=true' },
  ],
  Company: [
    { label: 'About Us',  to: '/' },
    { label: 'Blog',      to: '/' },
    { label: 'Careers',   to: '/' },
    { label: 'Press',     to: '/' },
    { label: 'Partners',  to: '/' },
  ],
  Support: [
    { label: 'Help Center',    to: '/' },
    { label: 'Shipping Info',  to: '/' },
    { label: 'Returns',        to: '/' },
    { label: 'Order Tracking', to: '/' },
    { label: 'Contact Us',     to: '/' },
  ],
};

const trustBadges = [
  { icon: Shield,     label: 'SSL Secured' },
  { icon: CreditCard, label: 'Safe Payment' },
  { icon: Truck,      label: 'Fast Delivery' },
];

/* Inline SVG social icons to avoid lucide version issues */
const SocialIcon = ({ children, href, label }) => (
  <a
    href={href}
    aria-label={label}
    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group"
    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'rgba(99,102,241,0.2)';
      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
    }}
  >
    {children}
  </a>
);

const Footer = () => {
  return (
    <footer style={{ background: '#0f172a' }}>
      {/* Main footer body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 w-fit">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <Zap size={18} className="text-white" fill="currentColor" />
              </div>
              <div>
                <span
                  className="text-xl font-extrabold tracking-tight block"
                  style={{
                    background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  ReviveX
                </span>
                <span className="text-[9px] text-slate-500 font-semibold tracking-widest uppercase block -mt-0.5">
                  AI Commerce
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              AI-powered e-commerce platform with intelligent cart recovery, real-time analytics, and personalized shopping.
            </p>

            {/* Social Icons using inline SVGs */}
            <div className="flex items-center gap-3 mb-8">
              <SocialIcon href="#" label="Twitter/X">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l16 16M4 20L20 4"/>
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="#94a3b8"/>
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="LinkedIn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="Website">
                <Globe size={15} className="text-slate-400" />
              </SocialIcon>
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Get exclusive deals
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e2e8f0',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                  />
                </div>
                <button
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-extrabold text-slate-200 mb-5 tracking-wide">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 hover:text-indigo-400 transition-colors duration-200 block"
                      style={{ paddingLeft: '0', transition: 'all 0.2s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.paddingLeft = '4px'; }}
                      onMouseLeave={e => { e.currentTarget.style.paddingLeft = '0'; }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} ReviveX AI Commerce. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon size={13} className="text-slate-600" />
                  {label}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link to="/" className="hover:text-slate-300 transition-colors">Privacy</Link>
              <Link to="/" className="hover:text-slate-300 transition-colors">Terms</Link>
              <Link to="/" className="hover:text-slate-300 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
