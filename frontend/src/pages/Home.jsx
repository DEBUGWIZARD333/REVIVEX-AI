import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, BarChart } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
              <span className="block">Recover Revenue with</span>
              <span className="block text-brand-600">Agentic AI Power</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-slate-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Automate your debt collection and revenue recovery processes with intelligent, empathetic, and effective AI agents.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 md:py-4 md:text-lg md:px-10 transition"
                >
                  Get started <ArrowRight className="ml-2" size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-100">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-brand-100 text-brand-600 mb-4">
                  <Zap size={24} />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Automated Workflows</h3>
                <p className="mt-2 text-slate-500">Set it and forget it. Our AI agents handle follow-ups automatically.</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-100">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-brand-100 text-brand-600 mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Secure & Compliant</h3>
                <p className="mt-2 text-slate-500">Enterprise-grade security built in for your peace of mind.</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-100">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-brand-100 text-brand-600 mb-4">
                  <BarChart size={24} />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Advanced Analytics</h3>
                <p className="mt-2 text-slate-500">Track recovery rates and agent performance in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
