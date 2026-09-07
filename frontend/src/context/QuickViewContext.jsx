import { createContext, useContext, useState } from 'react';

const QuickViewContext = createContext();

export const QuickViewProvider = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openQuickView = (product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const closeQuickView = () => {
    setIsOpen(false);
    setSelectedProduct(null);
  };

  return (
    <QuickViewContext.Provider value={{
      selectedProduct,
      isOpen,
      openQuickView,
      closeQuickView
    }}>
      {children}
    </QuickViewContext.Provider>
  );
};

export const useQuickView = () => useContext(QuickViewContext);
