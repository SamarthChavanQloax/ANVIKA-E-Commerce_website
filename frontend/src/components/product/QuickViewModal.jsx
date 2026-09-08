import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star, Check, Truck, ShieldCheck, Sparkles, ChevronLeft, ChevronRight, ArrowRightLeft } from 'lucide-react';
import { useQuickView } from '../../context/QuickViewContext';
import { getProductBadges } from '../../utils/productBadges';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const QuickViewModal = () => {
  const { selectedProduct, isOpen, closeQuickView } = useQuickView();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setSelectedSize(selectedProduct.sizes?.[0] || 'Free Size');
      setActiveImageIdx(0);
      setQuantity(1);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const images = selectedProduct.images?.length > 0 
    ? selectedProduct.images 
    : [selectedProduct.image || '/demo-saree.jpg'];
  const { isNew, hasDiscount, discountPercentage } = getProductBadges(selectedProduct);

  const isFavorited = isInWishlist(selectedProduct);
  const isCompared = isInCompare(selectedProduct._id);

  const handleAddToCart = () => {
    setAddedAnimation(true);
    addToCart(selectedProduct, quantity, selectedSize);
    setTimeout(() => {
      setAddedAnimation(false);
      closeQuickView();
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeQuickView}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-background rounded-3xl overflow-hidden shadow-2xl z-10 border border-border flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={closeQuickView}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/80 backdrop-blur-md text-text-muted hover:text-text hover:bg-surface transition-colors shadow-sm"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Left: Product Images */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-surface/30 border-b md:border-b-0 md:border-r border-border">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-surface shadow-inner group">
                <img
                  src={images[activeImageIdx] || '/demo-saree.jpg'}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />

                {/* Prev / Next Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIdx(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 hover:bg-background text-text border border-border shadow backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Previous view"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setActiveImageIdx(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 hover:bg-background text-text border border-border shadow backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Next view"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {/* Angle Label Badge */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full border border-border text-[11px] text-text flex items-center gap-1.5 shadow-sm pointer-events-none">
                    <span className="font-medium text-accent">
                      {selectedProduct.imageLabels?.[activeImageIdx] || `Angle ${activeImageIdx + 1}`}
                    </span>
                    <span className="text-text-muted text-[10px]">
                      ({activeImageIdx + 1}/{images.length})
                    </span>
                  </div>
                )}

                {(isNew || hasDiscount) && (
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {isNew && (
                      <span className="bg-background/90 text-text text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full shadow-sm">
                        New
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="bg-accent text-white text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full shadow-sm">
                        -{discountPercentage}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Thumbnail Selector */}
              {images.length > 1 && (
                <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative aspect-[3/4] w-14 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIdx === idx ? 'border-accent scale-105 shadow-sm ring-2 ring-accent/20' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      {selectedProduct.imageLabels?.[idx] && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] text-white text-center py-0.5 uppercase truncate px-0.5">
                          {selectedProduct.imageLabels[idx].split(' ')[0]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details */}
            <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
              <div>
                {/* Category & Rating */}
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-[10px] tracking-[0.25em] text-accent uppercase font-medium">
                    {selectedProduct.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-amber-500">
                    <Star size={14} className="fill-amber-500" />
                    <span className="font-semibold text-text">{selectedProduct.rating || '4.9'}</span>
                    <span className="text-text-muted">({selectedProduct.reviewsCount || '32'})</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-serif text-text font-light mb-3 leading-tight">
                  {selectedProduct.name}
                </h3>

                {/* Pricing */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-2xl font-semibold text-text">
                    ₹{selectedProduct.price.toLocaleString('en-IN')}
                  </span>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-base text-text-muted line-through">
                      ₹{selectedProduct.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs text-emerald-600 font-medium">Taxes included</span>
                </div>

                {/* Description */}
                <p className="text-sm text-text-muted leading-relaxed font-light mb-6">
                  {selectedProduct.description || 'Crafted with royal heritage techniques, this exquisite piece radiates timeless grace for celebrations and memorable occasions.'}
                </p>

                {/* Fabric & Details Spec */}
                <div className="bg-surface/50 rounded-2xl p-4 mb-6 space-y-2 text-xs border border-border/60">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Fabric</span>
                    <span className="font-medium text-text">{selectedProduct.fabric || 'Pure Artisan Silk'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Care Guide</span>
                    <span className="font-medium text-text">{selectedProduct.care || 'Dry Clean Recommended'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Delivery</span>
                    <span className="font-medium text-emerald-600">Dispatched in 2-3 business days</span>
                  </div>
                </div>

                {/* Size Selection */}
                {selectedProduct.sizes?.length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between text-xs mb-2.5">
                      <span className="font-medium text-text">Select Size</span>
                      <span className="text-accent cursor-pointer hover:underline">Size Guide</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                            selectedSize === size
                              ? 'bg-primary text-background shadow-sm ring-2 ring-primary/20'
                              : 'bg-surface hover:bg-surface/80 text-text border border-border'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 bg-primary text-background text-xs tracking-widest uppercase font-medium flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
                  >
                    {addedAnimation ? (
                      <>
                        <Check size={16} /> ADDED TO BAG
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> ADD TO SHOPPING BAG
                      </>
                    )}
                  </Button>

                  <button
                    onClick={() => toggleCompare(selectedProduct)}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCompared
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface hover:bg-surface/80 text-text'
                    }`}
                    aria-label="Add to compare"
                  >
                    <ArrowRightLeft size={20} />
                  </button>

                  <button
                    onClick={() => toggleWishlist(selectedProduct)}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isFavorited
                        ? 'border-red-500 bg-red-50 text-red-500 dark:bg-red-950/30'
                        : 'border-border bg-surface hover:bg-surface/80 text-text'
                    }`}
                    aria-label="Add to wishlist"
                  >
                    <Heart size={20} className={isFavorited ? 'fill-red-500' : ''} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
                  <div className="flex items-center gap-1.5">
                    <Truck size={14} className="text-accent" />
                    <span>Complimentary Shipping over ₹10,000</span>
                  </div>
                  <Link 
                    to={`/product/${selectedProduct._id}`}
                    onClick={closeQuickView}
                    className="text-accent hover:underline font-medium"
                  >
                    Full Product Details →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
