import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { products as initialProducts } from '../data/products';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      // Cache-busting timestamp ensures the browser always fetches live MongoDB data
      const { data } = await axios.get(`/api/products?limit=150&_t=${Date.now()}`);
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        // Ensure standard fields for frontend compatibility
        const formatted = data.products.map((p) => ({
          ...p,
          reviewsCount: p.numReviews || p.reviewsCount || 0,
          inStock: (p.stock || 0) > 0,
        }));
        setProducts(formatted);
      }
    } catch (err) {
      console.warn('ProductContext: Failed to fetch products from API, using cached data.', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/categories?_t=${Date.now()}`);
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      }
    } catch (err) {
      console.warn('ProductContext: Failed to fetch categories from API.', err.message);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Auto-refresh when tab receives focus (e.g. user returns from Admin tab to Storefront)
    const handleFocus = () => {
      fetchProducts();
    };
    window.addEventListener('focus', handleFocus);

    // Light periodic poll (every 6 seconds) so side-by-side tabs reflect admin changes in real-time
    const pollInterval = setInterval(() => {
      fetchProducts();
    }, 6000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollInterval);
    };
  }, [fetchProducts, fetchCategories]);

  const refreshProducts = () => {
    return Promise.all([fetchProducts(), fetchCategories()]);
  };

  const getProductById = (id) => {
    if (!id) return null;
    return products.find(
      (p) =>
        p._id === id ||
        p.slug === id ||
        (p.name && p.name.toLowerCase() === id.toLowerCase()) ||
        (p.slug && p.slug.toLowerCase() === id.toLowerCase())
    ) || null;
  };

  return (
    <ProductContext.Provider value={{
      products,
      categories,
      loading,
      error,
      refreshProducts,
      getProductById,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
