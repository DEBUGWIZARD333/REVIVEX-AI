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
    <section className="py-20" style={{ background: 'var(--color-surface-darker)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="section-label" style={{ background: 'rgba(255,0,255,0.1)', borderColor: 'rgba(255,0,255,0.3)', color: 'var(--color-neon-pink)' }}>
              <TrendingUp size={10} />
              Trending Now
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight" style={{ textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
              Top Picks For You
            </h2>
            <p className="mt-2 text-sm text-slate-400">
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
                      background: 'rgba(255,0,255,0.1)',
                      color: 'var(--color-neon-pink)',
                      border: '1px solid var(--color-neon-pink)',
                      boxShadow: '0 0 15px rgba(255,0,255,0.3), inset 0 0 10px rgba(255,0,255,0.1)',
                      textShadow: '0 0 5px var(--color-neon-pink)'
                    }
                  : {
                      background: 'rgba(255,255,255,0.03)',
                      color: '#94a3b8',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }
              }
              onMouseEnter={e => {
                if (activeTab !== tab) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== tab) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = '#94a3b8';
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
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-300 relative group overflow-hidden"
            style={{ 
              background: 'transparent',
              border: '1px solid var(--color-neon-pink)',
              boxShadow: '0 0 15px rgba(255,0,255,0.2)' 
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 25px rgba(255,0,255,0.5), inset 0 0 15px rgba(255,0,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 15px rgba(255,0,255,0.2)'}
          >
            <TrendingUp size={18} className="group-hover:text-neon-pink" />
            Explore All Products
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
