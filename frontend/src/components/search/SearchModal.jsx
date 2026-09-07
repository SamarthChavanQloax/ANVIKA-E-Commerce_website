import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Star } from 'lucide-react';
import { products } from '../../data/products';
import { useQuickView } from '../../context/QuickViewContext';
import { useNavigate } from 'react-router-dom';

const POPULAR_SEARCHES = ['Banarasi Silk', 'Anarkali Set', 'Chanderi', 'Bridal Lehenga', 'Mulmul Dress', 'Kids Kurta'];

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const { openQuickView } = useQuickView();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filteredProducts = query.trim() === ''
    ? []
    : products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q)
        );
      });

  const handleSelectProduct = (product) => {
    onClose();
    openQuickView(product);
  };

  const handlePopularSearch = (term) => {
    setQuery(term);
  };

  const handleViewAllResults = () => {
    onClose();
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-16 sm:pt-24 px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
          />

          {/* Search Container */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-3xl bg-background rounded-3xl shadow-2xl z-10 border border-border overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Input Bar */}
            <div className="flex items-center px-6 py-5 border-b border-border bg-surface/40">
              <Search size={22} className="text-accent flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search sarees, anarkalis, bridal lehengas, fabrics..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent pl-4 pr-3 text-base sm:text-lg text-text placeholder:text-text-muted/60 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1.5 rounded-full hover:bg-surface text-text-muted hover:text-text transition-colors mr-2"
                >
                  <X size={18} />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-xs tracking-widest uppercase font-medium text-text-muted hover:text-text px-3 py-1.5 rounded-xl hover:bg-surface transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Popular Searches */}
            <div className="px-6 py-3 bg-surface/20 border-b border-border flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-text-muted whitespace-nowrap font-medium text-[11px] uppercase tracking-wider">
                Trending:
              </span>
              <div className="flex gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => handlePopularSearch(term)}
                    className="px-3 py-1 bg-surface hover:bg-surface/80 rounded-full text-text text-[11px] whitespace-nowrap transition-colors border border-border/50"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {query.trim() === '' ? (
                <div className="py-12 text-center text-text-muted">
                  <p className="text-sm font-light">Type something to explore our curated couture and handloom collections.</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-text font-serif text-lg mb-1">No products found for &ldquo;{query}&rdquo;</p>
                  <p className="text-text-muted text-xs">Try searching for Banarasi, Chanderi, Anarkali, or Silk.</p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-text-muted uppercase tracking-wider">
                      Found {filteredProducts.length} piece{filteredProducts.length > 1 ? 's' : ''}
                    </span>
                    <button 
                      onClick={handleViewAllResults}
                      className="text-xs text-accent font-medium hover:underline flex items-center gap-1"
                    >
                      View All in Shop <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => handleSelectProduct(product)}
                        className="flex gap-4 p-3 rounded-2xl bg-surface/40 hover:bg-surface border border-border/60 hover:border-accent/40 cursor-pointer transition-all group"
                      >
                        <img
                          src={product.image || '/demo-saree.jpg'}
                          alt={product.name}
                          className="w-16 h-20 object-cover rounded-xl bg-surface flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <span className="text-[10px] text-accent font-medium uppercase tracking-wider block mb-0.5">
                            {product.category}
                          </span>
                          <h4 className="font-serif text-sm text-text font-medium line-clamp-1 group-hover:text-accent transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold text-text">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="text-xs text-text-muted line-through">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-amber-500 mt-1">
                            <Star size={11} className="fill-amber-500" />
                            <span>{product.rating || '4.9'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
