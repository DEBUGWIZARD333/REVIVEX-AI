import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { LogOut, User as UserIcon, ShoppingCart, Search, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Main Nav Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-extrabold text-brand-600 tracking-tight">Agennt</span>
            </Link>
            <div className="hidden md:flex space-x-6 items-center">
              <Link to="/shop" className="text-slate-600 hover:text-brand-600 font-medium transition">
                Shop All
              </Link>
            </div>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center space-x-5">
            
            {/* Search Input / Toggle */}
            {showSearch ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 sm:w-64 pl-3 pr-8 py-1.5 text-sm bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-200"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="text-slate-500 hover:text-brand-600 transition p-1.5 rounded-lg hover:bg-slate-100"
                title="Search products"
              >
                <Search size={20} />
              </button>
            )}

            {/* Shopping Cart Icon */}
            <Link
              to="/cart"
              className="text-slate-500 hover:text-brand-600 transition relative p-1.5 rounded-lg hover:bg-slate-100"
              title="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* Auth Actions */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="hidden sm:block text-slate-600 hover:text-brand-600 font-medium text-sm transition"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2 text-slate-700 bg-slate-100 px-3 py-1 rounded-full text-sm">
                  <UserIcon size={16} />
                  <span className="font-semibold">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-slate-500 hover:text-red-600 transition text-sm"
                >
                  <LogOut size={18} className="mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded-lg font-semibold transition shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
