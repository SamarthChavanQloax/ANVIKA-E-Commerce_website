import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Truck, RefreshCw, ChevronDown, Check, Star, ShieldCheck, Sparkles, ArrowRight, ChevronLeft, ChevronRight, ArrowRightLeft } from 'lucide-react';
import Button from '../components/common/Button';
import { FadeIn, RevealOnScroll } from '../components/animations/RevealOnScroll';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import ProductCard from '../components/product/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const { products, getProductById } = useProducts();
  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();

  const [apiProduct, setApiProduct] = useState(null);

  useEffect(() => {
    if (id) {
      const t = Date.now();
      axios.get(`/api/products/${id}?_t=${t}`)
        .then((res) => {
          if (res.data) setApiProduct(res.data);
        })
        .catch(() => {
          axios.get(`/api/products/slug/${id}?_t=${t}`)
            .then((res) => {
              if (res.data) setApiProduct(res.data);
            })
            .catch(() => {});
        });
    }
  }, [id, products]);

  // Look up product from central catalog and live API, syncing real-time updates
  const contextProduct = getProductById(id) || products.find(p => p._id === id || p.slug === id);
  const product = (contextProduct && apiProduct)
    ? { ...apiProduct, ...contextProduct }
    : (apiProduct || contextProduct || products[0]);

  const defaultVariant = product?.variants?.[0];
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(defaultVariant?.size || '');
  const [selectedColor, setSelectedColor] = useState(defaultVariant?.color || '');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('description');

  useEffect(() => {
    if (product) {
      const firstVariant = product.variants?.[0];
      setSelectedSize(firstVariant?.size || '');
      setSelectedColor(firstVariant?.color || '');
      setSelectedImageIdx(0);
      setQuantity(1);
      setIsAdded(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id, product?._id]);

  if (!product) {
    return null;
  }

  const images = product.images?.length > 0 ? product.images : [product.image || '/demo-saree.jpg'];
  const isFavorited = isInWishlist(product._id);
  const isCompared = isInCompare(product._id);

  // Related products from same category or others
  const relatedProducts = products
    .filter(p => p._id !== product._id)
    .slice(0, 4);

  // Get unique colors and sizes
  const availableColors = [...new Set(product.variants?.map(v => v.color).filter(Boolean) || [])];
  const availableSizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean) || [])];

  const activeVariant = product.variants?.find(v => v.size === selectedSize && v.color === selectedColor) || product.variants?.[0];

  // If variants have distinct differentiated pricing (e.g. S is ₹15,000, L is ₹15,500), use activeVariant price;
  // Otherwise, always prioritize product.price so admin edits (e.g. 4999 -> 3999) reflect instantly.
  const hasDifferentiatedVariantPrices = product.variants?.length > 1 &&
    new Set(product.variants.map(v => Number(v.price))).size > 1;

  const displayPrice = hasDifferentiatedVariantPrices
    ? (Number(activeVariant?.price) || Number(product.price) || 0)
    : (Number(product.price) || Number(activeVariant?.price) || 0);

  const displayStock = activeVariant && activeVariant.stock !== undefined ? activeVariant.stock : (product.stock || 0);

  const handleAddToCart = () => {
    if (displayStock < quantity) {
      alert('Not enough stock!');
      return;
    }
    addToCart({ ...product, price: displayPrice }, quantity, selectedSize, selectedColor, activeVariant?._id);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (displayStock < quantity) {
      alert('Not enough stock!');
      return;
    }
    addToCart({ ...product, price: displayPrice }, quantity, selectedSize, selectedColor, activeVariant?._id);
    openCart();
  };

  return (
    <div className="w-full pt-8 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs text-text-muted mb-8 uppercase tracking-widest flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-text transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-text transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-text transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-text font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4 lg:sticky top-36">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:w-24 flex-shrink-0 pb-2 md:pb-0 hide-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`group relative aspect-[3/4] w-16 md:w-full overflow-hidden rounded-xl border-2 transition-all text-left ${
                      selectedImageIdx === idx 
                        ? 'border-accent scale-105 shadow-sm ring-2 ring-accent/20' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} preview ${idx + 1}`} className="w-full h-full object-cover" />
                    {product.imageLabels?.[idx] && (
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-[2px] text-[8px] text-white py-0.5 text-center truncate px-1 uppercase tracking-wider">
                        {product.imageLabels[idx].split(' ')[0]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image */}
            <div className="relative flex-grow bg-surface rounded-2xl overflow-hidden group aspect-[3/4] border border-border/80 shadow-sm">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImageIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={images[selectedImageIdx] || '/demo-saree.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                />
              </AnimatePresence>

              {/* Prev / Next Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIdx(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-2 rounded-full bg-background/80 hover:bg-background text-text border border-border/80 shadow-md backdrop-blur-md opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedImageIdx(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-2 rounded-full bg-background/80 hover:bg-background text-text border border-border/80 shadow-md backdrop-blur-md opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Angle Label Pill */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border text-xs text-text flex items-center gap-2 shadow-sm pointer-events-none">
                  <span className="font-medium text-[11px] tracking-wider uppercase text-accent">
                    {product.imageLabels?.[selectedImageIdx] || `View ${selectedImageIdx + 1}`}
                  </span>
                  <span className="text-text-muted text-[10px]">
                    ({selectedImageIdx + 1} / {images.length})
                  </span>
                </div>
              )}

              {product.discount > 0 && (
                <span className="absolute top-4 left-4 bg-accent text-white text-[11px] font-semibold tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md">
                  {product.discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Product Details & Purchase Actions */}
          <div className="flex flex-col py-2">
            <FadeIn>
              {/* Category & Ratings */}
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-xs tracking-[0.25em] text-accent uppercase font-medium">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-amber-500 bg-surface/60 px-3 py-1 rounded-full border border-border">
                  <Star size={14} className="fill-amber-500" />
                  <span className="font-semibold text-text">{product.rating || '4.9'}</span>
                  <span className="text-text-muted">({product.reviewsCount || '32'} Reviews)</span>
                </div>
              </div>

              {/* Product Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-text font-light mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-semibold text-text">
                  ₹{displayPrice.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > displayPrice && (
                  <span className="text-lg text-text-muted line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Short Bio */}
              <p className="text-sm text-text-muted leading-relaxed font-light mb-8">
                {product.description}
              </p>

              {/* Stock Info */}
              <div className="mb-4 text-sm font-medium">
                {displayStock > 0 ? (
                  <span className="text-emerald-600">In Stock: {displayStock}</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </div>

              {/* Color Selector */}
              {availableColors.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center text-xs mb-3">
                    <span className="font-semibold text-text uppercase tracking-wider">Select Color</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          selectedColor === color
                            ? 'bg-primary text-background shadow-md ring-2 ring-primary/20'
                            : 'bg-surface hover:bg-surface/80 text-text border border-border'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {availableSizes.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center text-xs mb-3">
                    <span className="font-semibold text-text uppercase tracking-wider">Select Size</span>
                    <span className="text-accent cursor-pointer hover:underline text-[11px]">Size & Fit Guide</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {availableSizes.map((size) => {
                      const variantExists = product.variants.some(v => v.size === size && v.color === selectedColor && v.stock > 0);
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          disabled={!variantExists}
                          className={`px-5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            selectedSize === size
                              ? 'bg-primary text-background shadow-md ring-2 ring-primary/20'
                              : !variantExists
                              ? 'bg-surface opacity-50 cursor-not-allowed text-text-muted border border-border/50'
                              : 'bg-surface hover:bg-surface/80 text-text border border-border'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add to Cart Actions */}
              <div className="flex flex-col gap-3 mb-8">
                {/* Row 1: Quantity Stepper & Add to Bag */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between border border-border rounded-xl bg-surface px-2 h-13 sm:h-14 w-28 sm:w-36 flex-shrink-0">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 sm:w-10 h-full flex items-center justify-center text-text hover:text-accent transition-colors text-lg"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-8 sm:w-10 text-center text-sm font-semibold text-text">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 sm:w-10 h-full flex items-center justify-center text-text hover:text-accent transition-colors text-lg"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag CTA */}
                  <Button 
                    onClick={handleAddToCart}
                    disabled={displayStock === 0}
                    className={`flex-1 h-13 sm:h-14 uppercase tracking-wider sm:tracking-widest text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isAdded ? 'bg-emerald-600 text-white' : displayStock === 0 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-primary text-background hover:opacity-95'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={18} /> ADDED TO BAG
                      </>
                    ) : displayStock === 0 ? (
                      <>
                         OUT OF STOCK
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> ADD TO SHOPPING BAG
                      </>
                    )}
                  </Button>
                </div>

                {/* Row 2: Secondary Quick Actions (Compare & Wishlist) side-by-side on all screens */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    onClick={() => toggleCompare(product)}
                    className={`h-11 sm:h-12 flex items-center justify-center gap-2 rounded-xl border text-xs tracking-wider uppercase font-medium transition-all ${
                      isCompared
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface hover:bg-surface/80 text-text'
                    }`}
                    aria-label="Add to compare"
                  >
                    <ArrowRightLeft size={16} />
                    <span className="truncate">{isCompared ? 'In Compare' : 'Compare'}</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`h-11 sm:h-12 flex items-center justify-center gap-2 rounded-xl border text-xs tracking-wider uppercase font-medium transition-all ${
                      isFavorited
                        ? 'border-red-500 bg-red-50 text-red-500 dark:bg-red-950/50 shadow-sm'
                        : 'border-border bg-surface hover:bg-surface/80 text-text'
                    }`}
                    aria-label="Add to wishlist"
                  >
                    <Heart size={16} className={isFavorited ? 'fill-red-500 stroke-red-500' : ''} />
                    <span className="truncate">{isFavorited ? 'Wishlisted' : 'Add to Wishlist'}</span>
                  </button>
                </div>
              </div>

              {/* Instant Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={displayStock === 0}
                className={`w-full py-3.5 mb-8 rounded-xl border font-medium tracking-widest text-xs uppercase transition-all flex items-center justify-center gap-2 ${
                  displayStock === 0 ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-primary text-primary hover:bg-primary hover:text-background'
                }`}
              >
                BUY NOW WITH 1-CLICK CHECKOUT <ArrowRight size={14} />
              </button>

              {/* Trust Badges & Service Perks */}
              <div className="grid grid-cols-2 gap-4 py-6 border-y border-border mb-8 text-xs text-text-muted">
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-accent flex-shrink-0" />
                  <span>Complimentary Shipping Over ₹10,000</span>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw size={18} className="text-accent flex-shrink-0" />
                  <span>7-Day Bespoke Exchanges</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-accent flex-shrink-0" />
                  <span>Silk Mark Certified 100% Pure Silks</span>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-accent flex-shrink-0" />
                  <span>Authentic Master Artisans of India</span>
                </div>
              </div>

              {/* Accordions */}
              <div className="space-y-3">
                {/* Description Accordion */}
                <div className="border border-border/80 rounded-2xl overflow-hidden bg-surface/30">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'description' ? null : 'description')}
                    className="flex items-center justify-between w-full p-4 text-left text-xs font-semibold uppercase tracking-wider text-text"
                  >
                    <span>Artisanal Craft & Details</span>
                    <ChevronDown size={16} className={`transition-transform ${activeAccordion === 'description' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'description' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 text-xs text-text-muted leading-relaxed font-light"
                      >
                        {product.description}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Fabric & Care Accordion */}
                <div className="border border-border/80 rounded-2xl overflow-hidden bg-surface/30">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'fabric' ? null : 'fabric')}
                    className="flex items-center justify-between w-full p-4 text-left text-xs font-semibold uppercase tracking-wider text-text"
                  >
                    <span>Fabric & Wash Care</span>
                    <ChevronDown size={16} className={`transition-transform ${activeAccordion === 'fabric' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'fabric' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 text-xs text-text-muted leading-relaxed font-light space-y-1.5"
                      >
                        <p><strong>Fabric Composition:</strong> {product.fabric || '100% Pure Silk'}</p>
                        <p><strong>Wash Care:</strong> {product.care || 'Strictly dry clean recommended to preserve zari luster.'}</p>
                        <p><strong>Country of Origin:</strong> Crafted with pride in India.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Shipping & Delivery Accordion */}
                <div className="border border-border/80 rounded-2xl overflow-hidden bg-surface/30">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                    className="flex items-center justify-between w-full p-4 text-left text-xs font-semibold uppercase tracking-wider text-text"
                  >
                    <span>Shipping, Delivery & Returns</span>
                    <ChevronDown size={16} className={`transition-transform ${activeAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'shipping' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 text-xs text-text-muted leading-relaxed font-light space-y-1.5"
                      >
                        <p><strong>Domestic Dispatch:</strong> Dispatched in 2-3 business days via insured express courier.</p>
                        <p><strong>Packaging:</strong> Delivered in Anvika luxury keepsake box with moisture protection.</p>
                        <p><strong>Returns:</strong> 7-day doorstep pickup exchange available across all serviceable pincodes.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* You May Also Like Section */}
        <div className="mt-28 border-t border-border pt-16">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-medium block mb-2">Curated Pairings</span>
              <h2 className="text-3xl md:text-4xl font-serif text-text font-light tracking-wide">You May Also Admire</h2>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((relProduct, idx) => (
              <RevealOnScroll key={relProduct._id} delay={idx * 0.1}>
                <ProductCard product={relProduct} />
              </RevealOnScroll>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
