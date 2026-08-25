import { Star, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  // Mock image based on category for visual placeholder
  const getGradient = (category) => {
    switch (category?.toLowerCase()) {
      case 'electronics': return 'from-blue-400 to-indigo-500';
      case 'clothing': return 'from-pink-400 to-rose-500';
      case 'home': return 'from-amber-400 to-orange-500';
      default: return 'from-brand-400 to-brand-600';
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Image Container */}
      <Link to={`/products/${product._id || product.id}`} className="relative h-64 w-full bg-slate-100 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getGradient(product.category)} opacity-80 flex items-center justify-center group-hover:opacity-100 group-hover:scale-105 transition-all duration-500`}>
            <span className="text-white font-bold text-xl mix-blend-overlay">{product.category || 'Product'}</span>
          </div>
        )}
        
        {/* Quick Add overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-gradient-to-t from-black/50 to-transparent">
          <button className="w-full bg-white text-slate-900 font-semibold py-2 rounded-lg flex items-center justify-center hover:bg-brand-50 transition-colors">
            <ShoppingCart size={18} className="mr-2" /> Quick Add
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">{product.category}</p>
            <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-1">
              <Link to={`/products/${product._id || product.id}`}>
                {product.name}
              </Link>
            </h3>
          </div>
          <p className="text-lg font-bold text-slate-900">${product.price?.toFixed(2)}</p>
        </div>
        
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        <div className="flex items-center mt-auto">
          <div className="flex items-center">
            {[0, 1, 2, 3, 4].map((rating) => (
              <Star
                key={rating}
                size={16}
                className={rating < Math.round(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-slate-200'}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 ml-2">({product.reviews || Math.floor(Math.random() * 100 + 1)})</span>
        </div>
        
        <Link 
          to={`/products/${product._id || product.id}`}
          className="mt-4 w-full block text-center bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold py-2.5 rounded-lg transition-colors border border-brand-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
