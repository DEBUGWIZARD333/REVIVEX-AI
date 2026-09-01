import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const categoryGradients = {
  electronics: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  clothing:    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  home:        'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  accessories: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  default:     'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
};

const getGradient = (category) =>
  categoryGradients[category?.toLowerCase()] || categoryGradients.default;

const badge = (index) => {
  if (index === 0) return { label: 'HOT', color: 'linear-gradient(135deg, #f97316, #ef4444)' };
  if (index === 1) return { label: 'NEW', color: 'linear-gradient(135deg, #6366f1, #8b5cf6)' };
  if (index === 2) return { label: 'SALE', color: 'linear-gradient(135deg, #10b981, #059669)' };
  return null;
};

const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addToCart(product, 1);
    setTimeout(() => setAdding(false), 1000);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(!wishlisted);
  };

  const productBadge = badge(index);
  const rating = product.rating || 4.2;
  const reviews = product.reviews || Math.floor(Math.random() * 80 + 10);
  const originalPrice = product.originalPrice || (product.price * 1.2).toFixed(2);

  return (
    <div
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 transition-all duration-300"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(99,102,241,0.15), 0 4px 12px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Image Container */}
      <Link
        to={`/products/${product._id || product.id}`}
        className="relative h-60 w-full overflow-hidden flex-shrink-0"
        style={{ background: '#f8fafc' }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500"
            style={{ background: getGradient(product.category), opacity: 0.85 }}
          >
            <ShoppingCart size={40} className="text-white opacity-40" />
          </div>
        )}

        {/* Badge */}
        {productBadge && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[10px] font-extrabold tracking-wider z-10"
            style={{ background: productBadge.color }}
          >
            {productBadge.label}
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transform: 'scale(0)',
          }}
          ref={el => {
            if (el) {
              el.style.transform = 'scale(1)';
            }
          }}
        >
          <Heart
            size={15}
            className="transition-colors duration-200"
            style={{ color: wishlisted ? '#ef4444' : '#94a3b8' }}
            fill={wishlisted ? '#ef4444' : 'none'}
          />
        </button>

        {/* Quick actions overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}>
          <button
            onClick={handleQuickAdd}
            className="w-full py-2.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background: adding
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'rgba(255,255,255,0.95)',
              color: adding ? '#fff' : '#1e1b4b',
              backdropFilter: 'blur(8px)'
            }}
          >
            <ShoppingCart size={15} />
            {adding ? 'Added to Cart!' : 'Quick Add'}
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[11px] font-bold text-brand-500 uppercase tracking-widest mb-1.5">
          {product.category}
        </p>

        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 mb-1.5">
          <Link to={`/products/${product._id || product.id}`} className="hover:text-brand-600 transition-colors">
            {product.name}
          </Link>
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex items-center gap-0.5">
            {[0,1,2,3,4].map(i => (
              <Star
                key={i}
                size={13}
                style={{
                  color: i < Math.floor(rating) ? '#fbbf24' : '#e2e8f0',
                  fill: i < Math.floor(rating) ? '#fbbf24' : 'none'
                }}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {rating.toFixed(1)} <span className="font-normal text-slate-400">({reviews})</span>
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-xl font-extrabold text-slate-900">
              ${product.price?.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 line-through ml-2">
              ${parseFloat(originalPrice).toFixed(2)}
            </span>
          </div>
          <Link
            to={`/products/${product._id || product.id}`}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-200"
            style={{
              background: 'rgba(99,102,241,0.08)',
              color: '#6366f1',
              border: '1px solid rgba(99,102,241,0.15)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#6366f1';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
              e.currentTarget.style.color = '#6366f1';
            }}
          >
            <Eye size={13} />
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
