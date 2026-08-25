import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ArrowLeft, ShoppingCart, Check, X } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    // Placeholder for actual cart functionality
    alert(`Added ${quantity} of ${product.name} to cart!`);
  };

  // Mock image generator based on category if no image exists
  const getGradient = (category) => {
    switch (category?.toLowerCase()) {
      case 'electronics': return 'from-blue-400 to-indigo-500';
      case 'clothing': return 'from-pink-400 to-rose-500';
      case 'home': return 'from-amber-400 to-orange-500';
      default: return 'from-brand-400 to-brand-600';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-600"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-8 max-w-md w-full text-center shadow-sm">
          <p className="font-semibold text-lg mb-6">{error}</p>
          <button 
            onClick={() => navigate('/shop')}
            className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md font-medium transition w-full"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const inStock = product.stock > 0;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back Button */}
        <Link to="/shop" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to products
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12">
            
            {/* Image Section */}
            <div className="relative h-96 md:h-full min-h-[400px] bg-slate-100 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(product.category)} opacity-80 flex items-center justify-center`}>
                  <span className="text-white/80 font-bold text-4xl mix-blend-overlay tracking-widest uppercase">
                    {product.category || 'Product'}
                  </span>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <div className="mb-2">
                <span className="text-sm font-semibold tracking-wider text-brand-600 uppercase">
                  {product.category}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <Star
                      key={rating}
                      size={20}
                      className={rating < Math.round(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-slate-200'}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-500 ml-3 font-medium">
                  {product.rating?.toFixed(1) || '0.0'} ({product.reviews || Math.floor(Math.random() * 100 + 1)} reviews)
                </span>
              </div>

              <p className="text-3xl font-bold text-slate-900 mb-6">
                ${product.price?.toFixed(2)}
              </p>

              <div className="prose prose-slate prose-sm text-slate-500 mb-8">
                <p>{product.description}</p>
              </div>

              <div className="border-t border-slate-100 pt-8 mb-8">
                <div className="flex items-center mb-6">
                  {inStock ? (
                    <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full text-sm">
                      <Check size={16} className="mr-1" /> In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full text-sm">
                      <X size={16} className="mr-1" /> Out of Stock
                    </span>
                  )}
                </div>

                {/* Quantity and Add to Cart */}
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!inStock}
                      className="px-4 py-3 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition"
                    >
                      -
                    </button>
                    <span className="px-4 py-3 font-medium text-slate-900 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={!inStock || quantity >= product.stock}
                      className="px-4 py-3 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="flex-1 flex items-center justify-center px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <ShoppingCart size={20} className="mr-2" />
                    {inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
