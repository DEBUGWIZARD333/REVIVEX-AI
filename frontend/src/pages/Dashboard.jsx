import { useAuth } from '../hooks/useAuth';
import { Activity, Users, DollarSign, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
            Welcome back, {user?.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Role: <span className="font-medium capitalize text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{user?.role}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-slate-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Recovered</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-slate-900">$0.00</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200">
            <div className="text-sm">
              <a href="#" className="font-medium text-brand-600 hover:text-brand-900">
                View details
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Active Cases</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-slate-900">0</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200">
            <div className="text-sm">
              <a href="#" className="font-medium text-brand-600 hover:text-brand-900">
                View all cases
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-slate-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Success Rate</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-slate-900">0%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200">
            <div className="text-sm">
              <a href="#" className="font-medium text-brand-600 hover:text-brand-900">
                View analytics
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Admin specific section placeholder */}
      {user?.role === 'admin' && (
        <div className="bg-brand-50 border-l-4 border-brand-500 p-4 rounded-r-md mt-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Activity className="h-5 w-5 text-brand-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-brand-800">Admin Controls Access</h3>
              <div className="mt-2 text-sm text-brand-700">
                <p>You have access to global system settings, user management, and advanced reporting features.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
