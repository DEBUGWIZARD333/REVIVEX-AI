import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserPlus, Shield, User } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+1 (555) 234-5678',
    password: '',
    confirmPassword: '',
    role: 'user', // default to customer user
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });
      if (formData.role === 'admin') {
        navigate('/analytics');
      } else {
        navigate('/shop');
      }
    } catch (err) {
      console.error('Registration Error Details:', err.response?.data || err.message);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(serverMsg || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-500">
              Sign in
            </Link>
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
            Register Account Category
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleSelect('user')}
              className={`p-3 rounded-2xl border-2 transition text-left flex items-center space-x-2.5 ${
                formData.role === 'user'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  formData.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <User size={18} />
              </div>
              <div>
                <p className="text-xs font-extrabold">Customer</p>
                <p className="text-[10px] text-slate-500">Shopper Account</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`p-3 rounded-2xl border-2 transition text-left flex items-center space-x-2.5 ${
                formData.role === 'admin'
                  ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  formData.role === 'admin' ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Shield size={18} />
              </div>
              <div>
                <p className="text-xs font-extrabold">Admin</p>
                <p className="text-[10px] text-slate-500">System Admin</p>
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
              <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number (for WhatsApp Text Recovery)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                placeholder="+1 (555) 234-5678"
                value={formData.phone}
                onChange={handleChange}
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
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                placeholder="Password (min 6 chars)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 transition shadow-md"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {loading ? 'Creating Account...' : `Register ${formData.role === 'admin' ? 'Admin' : 'Customer'} Account`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
