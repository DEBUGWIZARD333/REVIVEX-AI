import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as cartService from '../services/cartService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Promo code state
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountFlat, setDiscountFlat] = useState(0);

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

  const saveGuestCart = (items) => {
    setCartItems(items);
    localStorage.setItem('guestCart', JSON.stringify(items));
  };

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

  // Promo Code Handler
  const applyPromoCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'REVENUE10') {
      setDiscountCode('REVENUE10');
      setDiscountPercent(10);
      setDiscountFlat(0);
      showNotification('Promo code REVENUE10 applied (10% OFF)!');
      return { success: true, message: '10% discount applied!' };
    } else if (cleanCode === 'WELCOME20') {
      setDiscountCode('WELCOME20');
      setDiscountPercent(20);
      setDiscountFlat(0);
      showNotification('Promo code WELCOME20 applied (20% OFF)!');
      return { success: true, message: '20% discount applied!' };
    } else if (cleanCode === 'SAVE15') {
      setDiscountCode('SAVE15');
      setDiscountPercent(0);
      setDiscountFlat(15);
      showNotification('Promo code SAVE15 applied ($15 OFF)!');
      return { success: true, message: '$15 flat discount applied!' };
    } else {
      showNotification('Invalid promo code. Try REVENUE10 or WELCOME20', 'error');
      return { success: false, message: 'Invalid promo code' };
    }
  };

  const removePromoCode = () => {
    setDiscountCode('');
    setDiscountPercent(0);
    setDiscountFlat(0);
    showNotification('Promo code removed');
  };

  // Calculations
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const shippingFee = subtotal > 100 || cartItems.length === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const discountAmount = discountPercent > 0
    ? (subtotal * discountPercent) / 100
    : Math.min(discountFlat, subtotal);
    
  const grandTotal = Math.max(0, subtotal + shippingFee + tax - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        notification,
        totalCount,
        subtotal,
        shippingFee,
        tax,
        discountCode,
        discountAmount,
        grandTotal,
        applyPromoCode,
        removePromoCode,
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
