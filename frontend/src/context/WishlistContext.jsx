import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const WishlistContext = createContext();

// Helper to normalize ID from any item or string
const getItemId = (item) => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item._id || item.id || item.productId || '';
};

export const WishlistProvider = ({ children }) => {
  const { userInfo } = useAuth();
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('anvika_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const hasMergedGuestWishlist = useRef(false);

  // Always keep localStorage updated as immediate fallback
  useEffect(() => {
    try {
      localStorage.setItem('anvika_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {}
  }, [wishlistItems]);

  // Sync wishlist from MongoDB backend when logged in
  const fetchBackendWishlist = useCallback(async () => {
    if (!userInfo?.token) return;

    try {
      setLoadingWishlist(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        withCredentials: true,
      };
      const { data } = await axios.get('/api/wishlist', config);
      if (Array.isArray(data) && data.length > 0) {
        setWishlistItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch backend wishlist:', err.response?.data?.message || err.message);
    } finally {
      setLoadingWishlist(false);
    }
  }, [userInfo?.token]);

  // Merge any guest wishlist items into backend upon user login
  useEffect(() => {
    if (userInfo?.token) {
      const mergeGuestWishlist = async () => {
        try {
          const guestRaw = localStorage.getItem('anvika_wishlist');
          const guestItems = guestRaw ? JSON.parse(guestRaw) : [];

          if (guestItems.length > 0 && !hasMergedGuestWishlist.current) {
            hasMergedGuestWishlist.current = true;
            const config = {
              headers: { Authorization: `Bearer ${userInfo.token}` },
              withCredentials: true,
            };

            for (const item of guestItems) {
              const pid = getItemId(item);
              if (pid) {
                await axios.post(`/api/wishlist/${pid}`, { product: item }, config).catch(() => {});
              }
            }
          }
        } catch (e) {
          console.error('Error merging guest wishlist:', e);
        } finally {
          fetchBackendWishlist();
        }
      };

      mergeGuestWishlist();
    } else {
      hasMergedGuestWishlist.current = false;
    }
  }, [userInfo?.token, fetchBackendWishlist]);

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  // Robust check: matches by ID, productId, slug, or title
  const isInWishlist = (productOrId) => {
    if (!productOrId) return false;
    const targetId = typeof productOrId === 'object'
      ? String(getItemId(productOrId))
      : String(productOrId);
    const targetSlug = typeof productOrId === 'object' ? productOrId.slug : null;
    const targetName = typeof productOrId === 'object' && productOrId.name
      ? productOrId.name.toLowerCase().trim()
      : null;

    return wishlistItems.some(item => {
      if (!item) return false;
      const id = String(getItemId(item));
      if (id && id === targetId) return true;
      if (targetSlug && item.slug && item.slug === targetSlug) return true;
      if (targetName && item.name && item.name.toLowerCase().trim() === targetName) return true;
      return false;
    });
  };

  const toggleWishlist = async (product) => {
    if (!product) return;
    const productId = getItemId(product);
    if (!productId) return;

    const exists = isInWishlist(product);

    if (exists) {
      // Remove from wishlist
      setWishlistItems(prev => prev.filter(item => {
        const id = String(getItemId(item));
        const slugMatch = product.slug && item.slug === product.slug;
        const nameMatch = product.name && item.name?.toLowerCase().trim() === product.name.toLowerCase().trim();
        return id !== String(productId) && !slugMatch && !nameMatch;
      }));

      if (userInfo?.token) {
        try {
          const config = {
            headers: { Authorization: `Bearer ${userInfo.token}` },
            withCredentials: true,
          };
          const { data } = await axios.delete(`/api/wishlist/${productId}`, config);
          if (Array.isArray(data)) setWishlistItems(data);
        } catch (err) {
          console.error('Backend removeFromWishlist error:', err.response?.data?.message || err.message);
        }
      }
    } else {
      // Add to wishlist
      setWishlistItems(prev => {
        const already = prev.some(item => {
          const id = String(getItemId(item));
          const slugMatch = product.slug && item.slug === product.slug;
          const nameMatch = product.name && item.name?.toLowerCase().trim() === product.name.toLowerCase().trim();
          return id === String(productId) || slugMatch || nameMatch;
        });
        if (already) return prev;
        return [...prev, product];
      });

      // Provide immediate tactile shopping feedback by opening the Wishlist Drawer
      setIsWishlistOpen(true);

      if (userInfo?.token) {
        try {
          const config = {
            headers: { Authorization: `Bearer ${userInfo.token}` },
            withCredentials: true,
          };
          const { data } = await axios.post(`/api/wishlist/${productId}`, { product }, config);
          if (Array.isArray(data)) setWishlistItems(data);
        } catch (err) {
          console.error('Backend addToWishlist error:', err.response?.data?.message || err.message);
        }
      }
    }
  };

  const removeFromWishlist = async (productOrId) => {
    if (!productOrId) return;
    const targetId = typeof productOrId === 'object' ? String(getItemId(productOrId)) : String(productOrId);

    setWishlistItems(prev => prev.filter(item => {
      const id = String(getItemId(item));
      return id !== targetId;
    }));

    if (userInfo?.token) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
          withCredentials: true,
        };
        const { data } = await axios.delete(`/api/wishlist/${targetId}`, config);
        if (Array.isArray(data)) setWishlistItems(data);
      } catch (err) {
        console.error('Backend removeFromWishlist error:', err.response?.data?.message || err.message);
      }
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      isWishlistOpen,
      openWishlist,
      closeWishlist,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      loadingWishlist,
      refreshWishlist: fetchBackendWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
