import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Zap, TrendingUp, Shield } from 'lucide-react';

const trustBadges = [
  { icon: Zap,       label: 'AI-Powered Recovery' },
  { icon: TrendingUp, label: '10K+ Orders Recovered' },
  { icon: Shield,    label: 'Secure Checkout' },
  { icon: ShoppingBag, label: 'Free Shipping ₹999+' },
];

const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #1a1a3e 100%)' }}>
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="blob absolute -top-40 -left-40 w-96 h-96 opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
        />
        <div
          className="blob-delayed absolute top-1/2 -right-40 w-80 h-80 opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-64 h-64 opacity-10 animate-float"
          style={{
            background: 'radial-gradient(circle, #06b6d4, transparent 70%)',
            animationDelay: '1s'
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 py-20 lg:py-28">

          {/* ── Left: Text Content ── */}
          <div className="flex-1 text-center lg:text-left">
            {/* Label pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#a5b4fc'
              }}>
              <Zap size={12} fill="currentColor" />
              AI-Powered E-Commerce Platform
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Premium Products for{' '}
              <span
                className="block mt-1"
                style={{
                  background: 'linear-gradient(90deg, #818cf8 0%, #a78bfa 40%, #e879f9 70%, #c084fc 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmer 4s linear infinite'
                }}
              >
                Modern Living
              </span>
            </h1>

            <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Discover our AI-curated collection of high-quality essentials designed to elevate your everyday experience.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/shop"
                className="btn btn-primary group relative overflow-hidden text-base px-8 py-4 rounded-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  color: '#fff', textDecoration: 'none', fontWeight: 700,
                  fontSize: '15px', borderRadius: '16px', padding: '14px 32px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.55)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.4)';
                }}
              >
                <ShoppingBag size={18} />
                Shop Now
                <ArrowRight size={16} style={{ marginLeft: '2px' }} />
              </Link>

              <Link
                to="/shop"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  color: '#c7d2fe', textDecoration: 'none', fontWeight: 600,
                  fontSize: '15px', borderRadius: '16px', padding: '14px 28px',
                  border: '1px solid rgba(165,180,252,0.25)',
                  background: 'rgba(255,255,255,0.04)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(165,180,252,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(165,180,252,0.25)';
                }}
              >
                View Categories
              </Link>
            </div>
          </div>

          {/* ── Right: Visual Card ── */}
          <div className="flex-1 w-full max-w-lg">
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '32px',
                backdropFilter: 'blur(20px)'
              }}
            >
              {/* Floating stat cards */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { value: '₹2.4M', label: 'Revenue Recovered', color: '#10b981' },
                  { value: '94%',   label: 'Recovery Rate',      color: '#6366f1' },
                  { value: '10K+',  label: 'Happy Customers',    color: '#8b5cf6' },
                  { value: '< 2s',  label: 'Alert Speed',        color: '#06b6d4' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl text-center"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      animation: `slide-up 0.5s ease ${i * 100}ms both`
                    }}
                  >
                    <div
                      className="text-2xl font-extrabold mb-1"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Live recovery status */}
              <div
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)'
                }}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 opacity-30 scale-150" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-400">Live AI Recovery Active</p>
                  <p className="text-xs text-slate-400">Monitoring cart abandonment in real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust Badges Bar ── */}
      <div
        className="relative border-t"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderColor: 'rgba(255,255,255,0.06)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {trustBadges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-slate-400">
                  <Icon size={15} className="text-brand-400" />
                  <span className="text-xs font-semibold tracking-wide">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
