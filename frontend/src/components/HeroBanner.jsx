import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react';

const trustBadges = [
  { icon: Zap,       label: 'AI-Powered Recovery' },
  { icon: TrendingUp, label: '10K+ Orders Recovered' },
  { icon: Shield,    label: 'Secure Checkout' },
];

const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden min-h-[90vh] flex flex-col justify-center bg-gradient-hero">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] animate-pulse-glow"
          style={{ background: 'var(--gradient-glow)' }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 flex flex-col items-center justify-center py-20 text-center">
        
        {/* The Neon 'X' Logo */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-8 mx-auto animate-float flex items-center justify-center">
          {/* Outer glow rings for the X */}
          <div className="absolute inset-0 bg-gradient-neon rounded-full blur-3xl opacity-30 animate-pulse-glow" />
          
          {/* CSS 'X' Construction mimicking the image */}
          <div className="relative w-full h-full">
            {/* Cyan Stroke 1 */}
            <div className="absolute top-1/2 left-1/2 w-[120%] h-2 sm:h-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full shadow-[0_0_15px_var(--color-neon-cyan)]"
                 style={{ background: 'var(--color-neon-cyan)' }} />
            {/* Pink Stroke 2 */}
            <div className="absolute top-1/2 left-1/2 w-[120%] h-2 sm:h-3 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full shadow-[0_0_15px_var(--color-neon-pink)]"
                 style={{ background: 'var(--color-neon-pink)' }} />
                 
            {/* Outline layers for depth */}
            <div className="absolute top-1/2 left-1/2 w-[110%] h-[2px] sm:h-[3px] -translate-x-1/2 -translate-y-[calc(50%+12px)] rotate-45 rounded-full shadow-[0_0_8px_var(--color-neon-cyan)]"
                 style={{ background: 'var(--color-neon-cyan)', opacity: 0.7 }} />
            <div className="absolute top-1/2 left-1/2 w-[110%] h-[2px] sm:h-[3px] -translate-x-1/2 -translate-y-[calc(50%-12px)] rotate-45 rounded-full shadow-[0_0_8px_var(--color-neon-cyan)]"
                 style={{ background: 'var(--color-neon-cyan)', opacity: 0.7 }} />
                 
            <div className="absolute top-1/2 left-1/2 w-[110%] h-[2px] sm:h-[3px] -translate-x-1/2 -translate-y-[calc(50%+12px)] -rotate-45 rounded-full shadow-[0_0_8px_var(--color-neon-pink)]"
                 style={{ background: 'var(--color-neon-pink)', opacity: 0.7 }} />
            <div className="absolute top-1/2 left-1/2 w-[110%] h-[2px] sm:h-[3px] -translate-x-1/2 -translate-y-[calc(50%-12px)] -rotate-45 rounded-full shadow-[0_0_8px_var(--color-neon-pink)]"
                 style={{ background: 'var(--color-neon-pink)', opacity: 0.7 }} />
          </div>
        </div>

        {/* Text Logo */}
        <h1 className="text-5xl sm:text-7xl font-black mb-8 tracking-[0.2em] uppercase"
            style={{ 
              color: '#fff',
              textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px var(--color-neon-cyan), 0 0 40px var(--color-neon-pink)'
            }}>
          REVIVE X
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          The next generation of AI-powered E-Commerce. Experience seamless shopping, autonomous revenue recovery, and cyberpunk aesthetics.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-md mx-auto">
          <Link
            to="/login"
            className="group relative overflow-hidden flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 w-full sm:w-auto"
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--color-neon-cyan)',
              boxShadow: '0 0 15px rgba(0, 243, 255, 0.3), inset 0 0 10px rgba(0, 243, 255, 0.1)'
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 243, 255, 0.6), inset 0 0 15px rgba(0, 243, 255, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 243, 255, 0.3), inset 0 0 10px rgba(0, 243, 255, 0.1)'}
          >
            <ShoppingBag size={18} />
            ENTER SHOP
          </Link>

          <Link
            to="/login"
            className="group relative overflow-hidden flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 w-full sm:w-auto"
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--color-neon-pink)',
              boxShadow: '0 0 15px rgba(255, 0, 255, 0.3), inset 0 0 10px rgba(255, 0, 255, 0.1)'
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 0, 255, 0.6), inset 0 0 15px rgba(255, 0, 255, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.3), inset 0 0 10px rgba(255, 0, 255, 0.1)'}
          >
            EXPLORE
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Trust Badges Bar - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t"
           style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(0, 243, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            {trustBadges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-slate-300"
                     style={{ textShadow: i % 2 === 0 ? '0 0 5px var(--color-neon-cyan)' : '0 0 5px var(--color-neon-pink)' }}>
                  <Icon size={16} color={i % 2 === 0 ? 'var(--color-neon-cyan)' : 'var(--color-neon-pink)'} />
                  <span className="text-xs font-bold tracking-widest uppercase">{badge.label}</span>
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
