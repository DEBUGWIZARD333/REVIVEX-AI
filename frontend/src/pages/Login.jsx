import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Shield, User, Zap, BarChart3, TrendingUp, Bell, Eye, EyeOff } from 'lucide-react';

const features = [
  { icon: BarChart3, text: 'Real-time revenue analytics' },
  { icon: TrendingUp, text: 'AI-powered cart recovery' },
  { icon: Bell,       text: 'Instant recovery alerts' },
  { icon: Shield,     text: 'Enterprise-grade security' },
];

const Login = () => {
  const [roleCategory, setRoleCategory] = useState('admin');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setRoleCategory(role);
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('123456');
    } else {
      setEmail('user@example.com');
      setPassword('123456');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      const userRole = data?.user?.role || (email.toLowerCase().includes('admin') ? 'admin' : 'user');
      navigate(userRole === 'admin' ? '/analytics' : '/shop');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex">

      {/* ── LEFT PANEL — Brand ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 60%, #1a1a3e 100%)' }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 blob"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
        />
        <div
          className="absolute bottom-10 -right-20 w-64 h-64 rounded-full opacity-15 blob-delayed"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }}
        />

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Zap size={20} className="text-white" fill="currentColor" />
          </div>
          <div>
            <span
              className="text-2xl font-extrabold tracking-tight"
              style={{
                background: 'linear-gradient(90deg, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              ReviveX
            </span>
            <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase -mt-0.5">AI Commerce</p>
          </div>
        </div>

        {/* Middle: Headline */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Recover Lost Revenue{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #818cf8, #e879f9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Automatically
              </span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Our AI monitors every cart, detects abandonment, and sends personalised recovery messages across SMS, Email, and WhatsApp — instantly.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{ animation: `slide-up 0.4s ease ${i * 100}ms both` }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}
                >
                  <Icon size={15} className="text-indigo-300" />
                </div>
                <span className="text-sm text-slate-300 font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Stats pill */}
          <div
            className="inline-flex items-center gap-4 px-5 py-3 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {[
              { value: '94%', label: 'Recovery Rate' },
              { value: '₹2.4M', label: 'Revenue Saved' },
              { value: '10K+', label: 'Users' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-lg font-extrabold text-indigo-300">{s.value}</div>
                <div className="text-[10px] text-slate-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} ReviveX AI Commerce
        </p>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white lg:bg-slate-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              <Zap size={17} className="text-white" fill="currentColor" />
            </div>
            <span
              className="text-2xl font-extrabold"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              ReviveX
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Select Role</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: 'admin', label: 'System Admin', sub: 'Full Analytics Access', Icon: Shield, color: '#6366f1' },
                { role: 'user',  label: 'Customer',     sub: 'E-Commerce Shopping',  Icon: User,   color: '#8b5cf6' },
              ].map(({ role, label, sub, Icon, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className="p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all duration-200"
                  style={
                    roleCategory === role
                      ? {
                          borderColor: color,
                          background: `${color}0d`,
                          boxShadow: `0 0 0 3px ${color}20`
                        }
                      : {
                          borderColor: '#e2e8f0',
                          background: '#f8fafc'
                        }
                  }
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: roleCategory === role ? color : '#e2e8f0',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={15} style={{ color: roleCategory === role ? '#fff' : '#64748b' }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input-premium"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input-premium pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl text-white font-bold text-sm transition-all duration-200 mt-2 disabled:opacity-70"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.35)'
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.5)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)';
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in as {roleCategory === 'admin' ? 'Admin' : 'Customer'}
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            New to ReviveX?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
