import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import {
  LogOut, User as UserIcon, ShoppingCart, Search, X,
  Zap, ChartBar, DollarSign, Brain, FlaskConical, Menu, ChevronDown,
  Shield, Bell
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const adminRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (adminRef.current && !adminRef.current.contains(e.target)) {
        setAdminOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAdminOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const adminLinks = [
    { to: '/analytics',          label: 'Analytics',      icon: ChartBar,    color: '#6366f1' },
    { to: '/revenue-recovery',   label: 'Revenue',        icon: DollarSign,  color: '#10b981' },
    { to: '/decision-dashboard', label: 'Decision AI',    icon: Brain,       color: '#8b5cf6' },
    { to: '/risk-dashboard',     label: 'Risk Monitor',   icon: Shield,      color: '#ef4444' },
    { to: '/testing-dashboard',  label: 'Testing Hub',    icon: FlaskConical, color: '#06b6d4' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-2xl shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.08)]'
            : 'bg-white/95 backdrop-blur-xl border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  <Zap size={16} className="text-white" fill="currentColor" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xl font-extrabold tracking-tight text-gradient" style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    ReviveX
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 tracking-[0.12em] uppercase -mt-0.5">
                    AI Commerce
                  </span>
                </div>
              </Link>

              {/* Nav Links */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/shop"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive('/shop')
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Shop
                </Link>
              </div>
            </div>

            {/* ── Right Controls ── */}
            <div className="flex items-center gap-2">

              {/* Search */}
              {showSearch ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                  <div className="relative animate-slide-up" style={{ animation: 'slide-up 0.2s ease forwards' }}>
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-52 sm:w-72 pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white transition-all"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
                  title="Search"
                >
                  <Search size={19} />
                </button>
              )}
                                               
              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200"
                title="Cart"
              >
                <ShoppingCart size={19} />
                {totalCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-extrabold text-white rounded-full animate-pulse-glow"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: '10px', padding: '0 4px' }}
                  >
                    {totalCount}
                  </span>
                )}
              </Link>

              {/* Notification Bell */}
              <NotificationBell />

              {/* Admin Dropdown */}
              {user?.role === 'admin' && (
                <div className="relative hidden md:block" ref={adminRef}>
                  <button
                    onClick={() => setAdminOpen(!adminOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      adminOpen
                        ? 'bg-brand-50 text-brand-600 shadow-sm'
                        : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                      <ChartBar size={11} className="text-white" />
                    </div>
                    Admin
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${adminOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {adminOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden shadow-xl border border-slate-100 bg-white"
                      style={{ animation: 'slide-down 0.2s ease forwards' }}
                    >
                      <div className="p-1.5">
                        {adminLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.to}
                              to={link.to}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                                isActive(link.to) ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: `${link.color}18` }}
                              >
                                <Icon size={14} style={{ color: link.color }} />
                              </div>
                              <span>{link.label}</span>
                              {isActive(link.to) && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                      <div className="h-px bg-slate-100 mx-3" />
                      <div className="p-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150"
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50">
                            <LogOut size={14} className="text-red-500" />
                          </div>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Auth — Customer User */}
              {user && user.role !== 'admin' && (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold transition-all duration-200"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="max-w-[80px] truncate">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut size={17} />
                  </button>
                </div>
              )}

              {/* Auth — Not logged in */}
              {!user && (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-bold text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Hamburger — Mobile */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-all"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Drawer ── */}
        {mobileOpen && (
          <div
            className="md:hidden border-t border-slate-100 bg-white"
            style={{ animation: 'slide-down 0.2s ease forwards' }}
          >
            <div className="px-4 py-4 space-y-1">
              <Link
                to="/shop"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                <ShoppingCart size={16} className="text-brand-500" />
                Shop All
              </Link>

              {user?.role === 'admin' && (
                <>
                  <div className="pt-2 pb-1 px-4">
                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Admin Panel</span>
                  </div>
                  {adminLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                      >
                        <Icon size={15} style={{ color: link.color }} />
                        {link.label}
                      </Link>
                    );
                  })}
                </>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-1">
                {user ? (
                  <>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
                      <UserIcon size={15} className="text-brand-500" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <Link to="/login" className="flex-1 text-center py-2.5 text-sm font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all">
                      Log in
                    </Link>
                    <Link to="/register" className="flex-1 text-center py-2.5 text-sm font-bold text-white rounded-xl transition-all"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
