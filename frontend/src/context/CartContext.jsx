import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('anvika_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem('anvika_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product, qty = 1, selectedSize = null) => {
    const sizeToUse = selectedSize || product.sizes?.[0] || 'Standard';
    const itemKey = `${product._id}_${sizeToUse}`;

    setCartItems(prev => {
      const existIndex = prev.findIndex(item => item.cartKey === itemKey);
      if (existIndex > -1) {
        return prev.map((item, idx) => 
          idx === existIndex ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [
        ...prev, 
        { 
          ...product, 
          cartKey: itemKey, 
          selectedSize: sizeToUse, 
          qty 
        }
      ];
    });

    // Auto open drawer to provide tactile shopping confirmation
    setIsCartOpen(true);
  };

  const updateQty = (cartKey, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems(prev => 
      prev.map(item => item.cartKey === cartKey ? { ...item, qty: newQty } : item)
    );
  };

  const removeFromCart = (cartKey) => {
    setCartItems(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code) => {
    try {
      const { data } = await api.post('/coupons/validate', { code, subtotal });
      setAppliedCoupon({ ...data, discountAmount: data.discount });
      return { success: true, message: `${data.code} applied successfully.` };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Invalid coupon code.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const shippingFee = subtotal - discountAmount >= 10000 || subtotal === 0 ? 0 : 450;
  const orderTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      isCartOpen, 
      openCart, 
      closeCart, 
      addToCart, 
      updateQty, 
      removeFromCart, 
      clearCart,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      subtotal,
      totalItems,
      discountAmount,
      shippingFee,
      orderTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
