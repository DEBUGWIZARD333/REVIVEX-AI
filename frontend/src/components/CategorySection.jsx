import { Monitor, Shirt, House, Watch, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 1,
    name: 'Electronics',
    sub: 'Phones, Laptops & More',
    icon: Monitor,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    lightBg: 'rgba(102,126,234,0.08)',
    border: 'rgba(102,126,234,0.15)',
    count: '2.4K+ items',
  },
  {
    id: 2,
    name: 'Clothing',
    sub: 'Fashion & Apparel',
    icon: Shirt,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    lightBg: 'rgba(240,147,251,0.08)',
    border: 'rgba(240,147,251,0.15)',
    count: '1.8K+ items',
  },
  {
    id: 3,
    name: 'Home & Kitchen',
    sub: 'Décor, Appliances',
    icon: House,
    gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    lightBg: 'rgba(247,151,30,0.08)',
    border: 'rgba(247,151,30,0.15)',
    count: '3.1K+ items',
  },
  {
    id: 4,
    name: 'Accessories',
    sub: 'Watches, Bags & More',
    icon: Watch,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    lightBg: 'rgba(17,153,142,0.08)',
    border: 'rgba(17,153,142,0.15)',
    count: '950+ items',
  },
];

const CategorySection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="section-label">
              <Sparkles size={10} />
              Collections
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="mt-2 text-slate-500 text-sm">
              Explore our hand-picked categories with the best deals
            </p>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors group flex-shrink-0"
          >
            Browse all
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group relative flex flex-col p-6 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer"
                style={{
                  background: cat.lightBg,
                  borderColor: cat.border,
                  animation: `slide-up 0.4s ease ${i * 80}ms both`
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Glow blob */}
                <div
                  className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-2xl"
                  style={{ background: cat.gradient }}
                />

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: cat.gradient }}
                >
                  <Icon size={26} className="text-white" />
                </div>

                {/* Text */}
                <h3 className="text-lg font-extrabold text-slate-900 mb-1 group-hover:text-slate-800">
                  {cat.name}
                </h3>
                <p className="text-sm text-slate-500 mb-4">{cat.sub}</p>

                {/* Count + arrow */}
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{cat.count}</span>
                  <div
                    className="flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300"
                    style={{ color: '#6366f1' }}
                  >
                    Explore
                    <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
