import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

// Mock data until API is fully wired
const mockProducts = [
  {
    id: '1',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Experience premium sound quality with active noise cancellation and 30-hour battery life.',
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
    description: 'Control your entire home with this vibrant 10-inch smart display with built-in voice assistant.',
    price: 129.99,
    category: 'Home',
    rating: 4.5,
    reviews: 256,
  },
  {
    id: '4',
    name: 'Titanium Chronograph Watch',
    description: 'Ultra-lightweight titanium case, scratch-resistant sapphire crystal, and precise quartz movement.',
    price: 195.00,
    category: 'Accessories',
    rating: 4.7,
    reviews: 42,
  }
];

const FeaturedProducts = () => {
  const [products, setProducts] = useState(mockProducts);
  const [loading, setLoading] = useState(false);

  // In the future, we will fetch from API here:
  // useEffect(() => { ... fetch('/api/products') }, []);

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left md:flex md:items-baseline md:justify-between mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Trending Now</h2>
          <p className="mt-4 text-sm text-slate-500 md:mt-0">
            Our most popular products based on sales. Updated hourly.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedProducts;
