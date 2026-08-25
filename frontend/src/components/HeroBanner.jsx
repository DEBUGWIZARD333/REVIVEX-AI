import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';

const HeroBanner = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Premium products for</span>{' '}
                <span className="block text-brand-600 xl:inline">modern living</span>
              </h1>
              <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Discover our curated collection of high-quality essentials designed to elevate your everyday experience. Free shipping on orders over $50.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link
                    to="/shop"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 md:py-4 md:text-lg md:px-10 transition-colors duration-300"
                  >
                    <ShoppingBag className="mr-2" size={20} />
                    Shop Now
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="/categories"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-brand-700 bg-brand-100 hover:bg-brand-200 md:py-4 md:text-lg md:px-10 transition-colors duration-300"
                  >
                    View Categories
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-brand-50 flex items-center justify-center overflow-hidden">
        {/* Placeholder for an attractive abstract hero graphic */}
        <div className="relative w-full h-64 sm:h-72 md:h-96 lg:h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-700 opacity-20"></div>
            <div className="w-64 h-64 md:w-96 md:h-96 bg-gradient-to-tr from-brand-300 to-brand-600 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute w-48 h-48 md:w-72 md:h-72 bg-gradient-to-bl from-pink-300 to-brand-400 rounded-full blur-3xl opacity-40 mix-blend-multiply top-1/4 right-1/4"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
