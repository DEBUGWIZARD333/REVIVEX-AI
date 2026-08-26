import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as cartService from '../services/cartService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Show auto-hiding notification toast
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load cart either from backend (if logged in) or localStorage (if guest)
  const loadCart = useCallback(async () => {
    if (user) {
      try {
        setLoading(true);
        const backendCart = await cartService.fetchCart();
        // Normalize cart structure
        const formatted = backendCart.map((item) => ({
          _id: item._id,
          product: item.productId,
          quantity: item.quantity,
        }));
        setCartItems(formatted);
      } catch (err) {
        console.error('Failed to fetch backend cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      const localCart = localStorage.getItem('guestCart');
      if (localCart) {
        try {
          setCartItems(JSON.parse(localCart));
        } catch {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Save guest cart to local storage
  const saveGuestCart = (items) => {
    setCartItems(items);
    localStorage.setItem('guestCart', JSON.stringify(items));
  };

  // Add product to cart
  const addToCart = async (product, quantity = 1) => {
    const productId = product._id || product.id;

    if (user) {
      try {
        setLoading(true);
        await cartService.addToCartAPI(productId, quantity);
        await loadCart();
        showNotification(`Added "${product.name}" to cart!`);
      } catch (err) {
        console.error('Add to cart failed:', err);
        showNotification(err.response?.data?.message || 'Failed to add item to cart', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      // Guest cart handling
      const existingIndex = cartItems.findIndex(
        (item) => (item.product._id || item.product.id) === productId
      );

      let updated;
      if (existingIndex > -1) {
        updated = [...cartItems];
        updated[existingIndex].quantity += quantity;
      } else {
        updated = [
          ...cartItems,
          {
            _id: `guest_${Date.now()}_${Math.random()}`,
            product,
            quantity,
          },
        ];
      }
      saveGuestCart(updated);
      showNotification(`Added "${product.name}" to cart!`);
    }
  };

  // Update item quantity
  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return removeFromCart(cartItemId);

    if (user) {
      try {
        setLoading(true);
        await cartService.updateCartItemAPI(cartItemId, quantity);
        await loadCart();
      } catch (err) {
        console.error('Failed to update quantity:', err);
        showNotification('Could not update quantity', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      const updated = cartItems.map((item) =>
        item._id === cartItemId ? { ...item, quantity } : item
      );
      saveGuestCart(updated);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    if (user) {
      try {
        setLoading(true);
        await cartService.removeFromCartAPI(cartItemId);
        await loadCart();
        showNotification('Item removed from cart');
      } catch (err) {
        console.error('Failed to remove item:', err);
        showNotification('Could not remove item', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      const updated = cartItems.filter((item) => item._id !== cartItemId);
      saveGuestCart(updated);
      showNotification('Item removed from cart');
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (user) {
      try {
        setLoading(true);
        await cartService.clearCartAPI();
        setCartItems([]);
        showNotification('Cart cleared');
      } catch (err) {
        console.error('Failed to clear cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      saveGuestCart([]);
      showNotification('Cart cleared');
    }
  };

  // Derived metrics
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        notification,
        totalCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        loadCart,
        showNotification,
      }}
    >
      {children}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3 rounded-xl shadow-xl text-white font-medium flex items-center space-x-2 ${
              notification.type === 'error' ? 'bg-red-600' : 'bg-brand-600'
            }`}
          >
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
