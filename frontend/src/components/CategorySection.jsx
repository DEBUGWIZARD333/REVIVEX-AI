import { Monitor, Shirt, Home, Watch, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 1, name: 'Electronics', icon: Monitor, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, name: 'Clothing', icon: Shirt, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 3, name: 'Home & Kitchen', icon: Home, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 4, name: 'Accessories', icon: Watch, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const CategorySection = () => {
  return (
    <div className="bg-slate-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-baseline sm:justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Shop by Category</h2>
          <Link to="/categories" className="hidden sm:block text-sm font-semibold text-brand-600 hover:text-brand-500 transition-colors">
            Browse all categories <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-xl ${category.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`${category.color}`} size={28} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-brand-600 transition-colors">
                  <span className="absolute inset-0" />
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500 flex items-center">
                  Shop now <ArrowRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 sm:hidden">
          <Link to="/categories" className="block text-sm font-semibold text-brand-600 hover:text-brand-500">
            Browse all categories <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
