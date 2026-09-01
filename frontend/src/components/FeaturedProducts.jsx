import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight } from 'lucide-react';

const mockProducts = [
  {
    id: '1',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Experience premium sound with active noise cancellation and 30-hour battery life.',
    price: 299.99,
    category: 'Electronics',
    rating: 4.8,
    reviews: 124,
  },
  {
    id: '2',
    name: 'Minimalist Leather Backpack',
    description: 'Handcrafted full-grain leather backpack with laptop compartment and water-resistant lining.',
    price: 145.00,
    category: 'Clothing',
    rating: 4.9,
    reviews: 89,
  },
  {
    id: '3',
    name: 'Smart Home Hub Display',
    description: 'Control your entire home with this vibrant 10-inch smart display with voice assistant.',
    price: 129.99,
    category: 'Home',
    rating: 4.5,
    reviews: 256,
  },
  {
    id: '4',
    name: 'Titanium Chronograph Watch',
    description: 'Ultra-lightweight titanium case, scratch-resistant sapphire crystal, precise quartz movement.',
    price: 195.00,
    category: 'Accessories',
    rating: 4.7,
    reviews: 42,
  },
];

const FILTER_TABS = ['All', 'Electronics', 'Clothing', 'Home', 'Accessories'];

const FeaturedProducts = () => {
  const [products] = useState(mockProducts);
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All'
    ? products
    : products.filter(p => p.category?.toLowerCase().includes(activeTab.toLowerCase()));

  return (
    <section className="py-20" style={{ background: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="section-label">
              <TrendingUp size={10} />
              Trending Now
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Top Picks For You
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Our most popular products · Updated hourly
            </p>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors group flex-shrink-0"
          >
            View all products
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border"
              style={
                activeTab === tab
                  ? {
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff',
                      border: '1px solid transparent',
                      boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                    }
                  : {
                      background: '#fff',
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                    }
              }
              onMouseEnter={e => {
                if (activeTab !== tab) {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.color = '#6366f1';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== tab) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product.id || product._id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 font-medium">
            No products in this category yet.
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <TrendingUp size={18} />
            Explore All Products
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
