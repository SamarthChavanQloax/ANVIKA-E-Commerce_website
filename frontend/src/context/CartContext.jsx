import { createContext, useContext, useState, useEffect } from 'react';

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

  const addToCart = (product, qty = 1, selectedSize = '', selectedColor = '', variantId = null) => {
    const sizeToUse = selectedSize || product.variants?.[0]?.size || 'Standard';
    const colorToUse = selectedColor || product.variants?.[0]?.color || '';
    const itemKey = `${product._id}_${sizeToUse}_${colorToUse}`;

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
          selectedColor: colorToUse,
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

  const applyCoupon = (code) => {
    const upper = code.trim().toUpperCase();
    if (upper === 'ANVIKA10' || upper === 'FESTIVE10') {
      setAppliedCoupon({ code: upper, discountPercent: 10 });
      return { success: true, message: '10% discount applied successfully!' };
    }
    if (upper === 'ROYAL15') {
      setAppliedCoupon({ code: upper, discountPercent: 15 });
      return { success: true, message: '15% Royal discount applied!' };
    }
    return { success: false, message: 'Invalid coupon code. Try ANVIKA10' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercent) / 100) : 0;
  const shippingFee = subtotal >= 10000 || subtotal === 0 ? 0 : 450;
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
