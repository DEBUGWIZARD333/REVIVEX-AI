import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import * as productService from '../services/productService';
import { Search, Filter, RefreshCw } from 'lucide-react';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const categories = ['All', 'Electronics', 'Clothing', 'Home', 'Books'];

  useEffect(() => {
    const querySearch = searchParams.get('search') || '';
    const queryCategory = searchParams.get('category') || 'All';
    setSearchTerm(querySearch);
    setSelectedCategory(queryCategory);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let data;
        const currentSearch = searchParams.get('search');

        if (currentSearch) {
          data = await productService.searchProducts(currentSearch);
        } else {
          data = await productService.getProducts();
        }

        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set('search', searchTerm.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat !== 'All') {
      newParams.set('category', cat);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSearchParams({});
  };

  // Filter local array by category if needed
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (searchTerm && !searchParams.get('search')) {
      const term = searchTerm.toLowerCase();
      return (
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {searchParams.get('search') ? `Search Results for "${searchParams.get('search')}"` : 'All Products'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Discover our full collection of top-rated items with competitive pricing.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search by name, category or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <button
              type="submit"
              className="absolute right-2 top-1.5 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2 overflow-x-auto py-1">
            <Filter size={16} className="text-slate-400 mr-2 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {(searchParams.get('search') || selectedCategory !== 'All' || searchTerm) && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-600 transition"
            >
              <RefreshCw size={14} className="mr-1" /> Reset Filters
            </button>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-600"></div>
            <p className="mt-4 text-slate-500 font-medium">Loading products...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-center shadow-sm">
            <p className="font-semibold text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium transition text-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              We couldn't find any products matching your search or filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl text-sm shadow-sm hover:bg-brand-700 transition"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
