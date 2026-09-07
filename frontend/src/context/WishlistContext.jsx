import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('anvika_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('anvika_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => (item._id || item.id) === (productId || ''));
  };

  const toggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.some(item => item._id === product._id);
      if (exists) {
        return prev.filter(item => item._id !== product._id);
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prev => prev.filter(item => item._id !== productId));
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      isWishlistOpen,
      openWishlist,
      closeWishlist,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
