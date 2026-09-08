import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { userInfo } = useAuth();
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
  const [loadingCart, setLoadingCart] = useState(false);
  const hasSyncedGuestCart = useRef(false);

  // Helper to format backend cart response into frontend cartItem format
  const formatBackendCart = (cartData) => {
    if (!cartData || !Array.isArray(cartData.items)) return [];
    return cartData.items.map((item) => {
      const productId = item.product?._id || item.product;
      const size = item.variant?.size || 'Standard';
      return {
        _id: productId,
        cartItemId: item._id,
        name: item.name || item.product?.name || 'Product',
        image: item.image || item.product?.image || '/saree-lavender.png',
        price: item.price,
        qty: item.quantity,
        selectedSize: size,
        variant: item.variant,
        cartKey: `${productId}_${size}`,
        stock: item.product?.stock,
        category: item.product?.category,
      };
    });
  };

  // Sync with MongoDB backend when logged in
  const fetchBackendCart = useCallback(async () => {
    if (!userInfo?.token) return;

    try {
      setLoadingCart(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        withCredentials: true,
      };
      const { data } = await axios.get('/api/cart', config);
      const formatted = formatBackendCart(data);
      setCartItems(formatted);
    } catch (err) {
      console.error('Failed to fetch backend cart:', err.message);
    } finally {
      setLoadingCart(false);
    }
  }, [userInfo?.token]);

  // Merge guest cart items into backend cart on login
  useEffect(() => {
    if (userInfo?.token) {
      const mergeGuestItems = async () => {
        try {
          const guestCartRaw = localStorage.getItem('anvika_cart');
          const guestItems = guestCartRaw ? JSON.parse(guestCartRaw) : [];

          if (guestItems.length > 0 && !hasSyncedGuestCart.current) {
            hasSyncedGuestCart.current = true;
            const config = {
              headers: { Authorization: `Bearer ${userInfo.token}` },
              withCredentials: true,
            };

            for (const item of guestItems) {
              await axios.post(
                '/api/cart',
                {
                  productId: item._id,
                  quantity: item.qty || 1,
                  variant: { size: item.selectedSize || 'Free Size' },
                },
                config
              ).catch(() => {});
            }
          }
        } catch (e) {
          console.error('Error merging guest cart:', e);
        } finally {
          fetchBackendCart();
        }
      };

      mergeGuestItems();
    } else {
      hasSyncedGuestCart.current = false;
    }
  }, [userInfo?.token, fetchBackendCart]);

  // Persist to localStorage for guests
  useEffect(() => {
    if (!userInfo) {
      localStorage.setItem('anvika_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, userInfo]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = async (product, qty = 1, selectedSize = '', selectedColor = '', variantId = null) => {
    const sizeToUse = selectedSize || product.variants?.[0]?.size || product.sizes?.[0] || 'Standard';
    const colorToUse = selectedColor || product.variants?.[0]?.color || '';
    const itemKey = `${product._id}_${sizeToUse}_${colorToUse}`;

    // If authenticated, sync with MongoDB backend
    if (userInfo?.token) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          withCredentials: true,
        };
        const { data } = await axios.post(
          '/api/cart',
          {
            productId: product._id,
            quantity: qty,
            variant: { size: sizeToUse, color: colorToUse },
          },
          config
        );

        setCartItems(formatBackendCart(data));
        setIsCartOpen(true);
        return;
      } catch (err) {
        console.error('Backend addToCart error:', err.response?.data?.message || err.message);
      }
    }

    // Fallback for guest or offline mode
    setCartItems((prev) => {
      const existIndex = prev.findIndex((item) => item.cartKey === itemKey);
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
          qty,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const updateQty = async (cartKey, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartKey);
      return;
    }

    const targetItem = cartItems.find((item) => item.cartKey === cartKey);

    if (userInfo?.token && targetItem?.cartItemId) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          withCredentials: true,
        };
        const { data } = await axios.put(
          `/api/cart/${targetItem.cartItemId}`,
          { quantity: newQty },
          config
        );
        setCartItems(formatBackendCart(data));
        return;
      } catch (err) {
        console.error('Backend updateQty error:', err.response?.data?.message || err.message);
      }
    }

    // Fallback / guest update
    setCartItems((prev) =>
      prev.map((item) => (item.cartKey === cartKey ? { ...item, qty: newQty } : item))
    );
  };

  const removeFromCart = async (cartKey) => {
    const targetItem = cartItems.find((item) => item.cartKey === cartKey);

    if (userInfo?.token && targetItem?.cartItemId) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          withCredentials: true,
        };
        const { data } = await axios.delete(`/api/cart/${targetItem.cartItemId}`, config);
        setCartItems(formatBackendCart(data));
        return;
      } catch (err) {
        console.error('Backend removeFromCart error:', err.response?.data?.message || err.message);
      }
    }

    // Fallback / guest update
    setCartItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const clearCart = async () => {
    if (userInfo?.token) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          withCredentials: true,
        };
        await axios.delete('/api/cart', config);
      } catch (err) {
        console.error('Backend clearCart error:', err.response?.data?.message || err.message);
      }
    }

    setCartItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('anvika_cart');
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

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercent) / 100) : 0;
  const shippingFee = subtotal >= 10000 || subtotal === 0 ? 0 : 450;
  const orderTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider
      value={{
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
        orderTotal,
        loadingCart,
        refreshCart: fetchBackendCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
