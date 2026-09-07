import { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState(() => {
    try {
      const saved = localStorage.getItem('anvika_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('anvika_compare', JSON.stringify(compareItems));
  }, [compareItems]);

  const isInCompare = (productId) => {
    return compareItems.some(item => (item._id || item.id) === (productId || ''));
  };

  const toggleCompare = (product) => {
    setCompareItems(prev => {
      const productId = product._id || product.id;
      const exists = prev.some(item => (item._id || item.id) === productId);
      if (exists) {
        return prev.filter(item => (item._id || item.id) !== productId);
      }
      if (prev.length >= 4) {
        alert('You can only compare up to 4 items at a time.');
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId) => {
    setCompareItems(prev => prev.filter(item => (item._id || item.id) !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  return (
    <CompareContext.Provider value={{
      compareItems,
      isInCompare,
      toggleCompare,
      removeFromCompare,
      clearCompare
    }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
