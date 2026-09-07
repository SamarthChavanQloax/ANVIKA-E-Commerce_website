import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const WishlistDrawer = () => {
  const { wishlistItems, isWishlistOpen, closeWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
    closeWishlist();
    openCart();
  };

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-background z-50 shadow-2xl flex flex-col border-l border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface/50">
              <div className="flex items-center gap-3">
                <Heart size={20} className="text-red-500 fill-red-500" />
                <h3 className="font-serif text-xl tracking-wide text-text font-medium">Your Wishlist</h3>
                <span className="text-xs bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full">
                  {wishlistItems.length}
                </span>
              </div>
              <button 
                onClick={closeWishlist} 
                className="p-2 rounded-full hover:bg-surface text-text-muted hover:text-text transition-colors"
                aria-label="Close wishlist"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            {wishlistItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-text-muted mb-4">
                  <Heart size={28} strokeWidth={1.2} />
                </div>
                <h4 className="font-serif text-2xl text-text font-light mb-2">No Saved Items</h4>
                <p className="text-text-muted text-sm max-w-xs mb-6">
                  Save your favorite sarees, dresses, and bridal lehengas to view them later.
                </p>
                <Link to="/shop" onClick={closeWishlist}>
                  <Button variant="outline" className="text-xs uppercase tracking-widest px-8">
                    Explore Collection
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border/60">
                  {wishlistItems.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="py-4 flex gap-4 items-center"
                    >
                      <img
                        src={item.image || '/demo-saree.jpg'}
                        alt={item.name}
                        className="w-20 h-24 object-cover rounded-xl bg-surface border border-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-accent font-medium uppercase tracking-wider block mb-1">
                              {item.category}
                            </span>
                            <h4 className="font-serif text-sm text-text font-medium line-clamp-1">
                              {item.name}
                            </h4>
                          </div>
                          <button
                            onClick={() => removeFromWishlist(item._id)}
                            className="text-text-muted hover:text-red-500 transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-semibold text-text">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>

                          <button
                            onClick={() => handleMoveToCart(item)}
                            className="flex items-center gap-1.5 text-xs bg-primary text-background font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                          >
                            <ShoppingBag size={13} />
                            <span>Move to Bag</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-6 border-t border-border bg-surface/30">
                  <Link to="/shop" onClick={closeWishlist} className="block">
                    <Button variant="outline" className="w-full text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      Continue Shopping
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;
