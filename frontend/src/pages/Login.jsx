import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Shield, User } from 'lucide-react';

const Login = () => {
  const [roleCategory, setRoleCategory] = useState('admin'); // default to 'admin'
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setRoleCategory(role);
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('123456');
    } else if (role === 'user') {
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
      if (userRole === 'admin') {
        navigate('/analytics');
      } else {
        navigate('/shop');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please verify email & password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            Sign in to ReviveX
          </h2>
          <p className="mt-2 text-center text-xs text-slate-500">
            Select your account role category below to get started.
          </p>
        </div>

        {/* Role Category Selector Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
            Select Role Category
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`p-3 rounded-2xl border-2 transition text-left flex items-center space-x-2.5 ${
                roleCategory === 'admin'
                  ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  roleCategory === 'admin' ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Shield size={18} />
              </div>
              <div>
                <p className="text-xs font-extrabold">System Admin</p>
                <p className="text-[10px] text-slate-500">Full Analytics</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('user')}
              className={`p-3 rounded-2xl border-2 transition text-left flex items-center space-x-2.5 ${
                roleCategory === 'user'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  roleCategory === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <User size={18} />
              </div>
              <div>
                <p className="text-xs font-extrabold">Customer / User</p>
                <p className="text-[10px] text-slate-500">E-Commerce</p>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-medium"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-medium"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 transition shadow-md"
          >
            <LogIn className="h-4 w-4 mr-2" />
            {loading ? 'Signing in...' : `Sign in as ${roleCategory === 'admin' ? 'Admin' : 'Customer'}`}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Need a new customer account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-500">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
