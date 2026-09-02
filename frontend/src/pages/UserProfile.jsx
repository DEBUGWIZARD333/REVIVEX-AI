import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Phone, User, Mail, Save, CheckCircle2, ShieldCheck, MessageSquare } from 'lucide-react';

const UserProfile = () => {
  const { user, updateUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+1 (555) 234-5678',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      await updateUserProfile({
        name: formData.name,
        phone: formData.phone,
      });
      setSuccessMsg('Profile and Mobile Number updated successfully! WhatsApp text recovery messages will be sent to this number.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAlerts = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    setTestLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/test-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(`Test alerts dispatched! Check your phone (${formData.phone}) and email (${formData.email}).`);
      } else {
        setErrorMsg(data.message || 'Failed to dispatch test alerts');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error triggering test alerts');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center">
                <User className="mr-3 text-brand-600" size={32} /> Customer Profile
              </h1>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200 flex items-center">
                <MessageSquare size={14} className="mr-1" /> WhatsApp Recovery Active
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Manage your profile credentials and registered WhatsApp mobile phone number.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold text-2xl">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
          </div>
        </div>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-2xl flex items-center space-x-3 text-xs font-semibold text-emerald-800 shadow-sm">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-2xl text-xs font-semibold text-rose-700 shadow-sm">
            {errorMsg}
          </div>
        )}

        {/* Profile Edit Form Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
            Account & WhatsApp Settings
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 text-sm font-medium"
                  placeholder="Your Full Name"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address (Account ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl text-sm font-medium cursor-not-allowed"
                />
              </div>
            </div>

            {/* Registered Mobile / WhatsApp Number */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-green-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>WhatsApp Mobile Phone Number</span>
                <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-md font-mono border border-green-200">
                  Used for Cart & Payment Text Recovery
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-green-600">
                  <Phone size={18} />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-green-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-green-500 text-sm font-extrabold font-mono"
                  placeholder="+1 (555) 234-5678"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Enter your mobile number with country code (e.g. <code>+91 9876543210</code> or <code>+1 555 234 5678</code>). If your cart or checkout payment is abandoned, WhatsApp recovery links and coupons will be sent directly to this number.
              </p>
            </div>

            {/* Account Role Badge */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <ShieldCheck size={16} className="text-brand-600" />
                <span>Account Role:</span>
                <span className="uppercase px-2.5 py-0.5 rounded-full text-[10px] bg-brand-100 text-brand-800">
                  {user?.role || 'user'}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-6 border border-transparent text-sm font-extrabold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition shadow-md disabled:opacity-70"
            >
              <Save size={18} className="mr-2" />
              {loading ? 'Saving Changes...' : 'Save Profile & Mobile Phone Number'}
            </button>
          </form>
        </div>

        {/* Test Communication Channels Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Test Communication Channels</h2>
              <p className="text-sm text-slate-500 mt-1">
                Instantly trigger a test SMS (via Pushbullet/Fast2SMS) and Email (via SMTP) to your registered credentials.
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <MessageSquare size={24} />
            </div>
          </div>
          
          <button
            onClick={handleTestAlerts}
            disabled={testLoading}
            className="w-full flex items-center justify-center py-3.5 px-6 border border-transparent text-sm font-extrabold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-md disabled:opacity-70"
          >
            {testLoading ? 'Dispatching Test Alerts...' : 'Send Test SMS & Email Now'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
