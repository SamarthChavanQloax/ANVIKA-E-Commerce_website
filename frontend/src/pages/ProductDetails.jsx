import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Truck, RefreshCw, ChevronDown, Check, Star, ShieldCheck, Sparkles, ArrowRight, ChevronLeft, ChevronRight, ArrowRightLeft } from 'lucide-react';
import Button from '../components/common/Button';
import { FadeIn, RevealOnScroll } from '../components/animations/RevealOnScroll';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import ProductCard from '../components/product/ProductCard';
import { getProductBadges } from '../utils/productBadges';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useCompare();
  const { userInfo } = useAuth();

  // Look up product from central catalog, fallback gracefully
  const product = products.find(p => p._id === id || p.slug === id) || products[0];

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Free Size');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    setSelectedSize(product.sizes?.[0] || 'Free Size');
    setSelectedImageIdx(0);
    setQuantity(1);
    setIsAdded(false);
    api.get(`/products/${product._id}/reviews`).then(({ data }) => setReviews(data)).catch(() => setReviews([]));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, product]);

  const images = product.images?.length > 0 ? product.images : [product.image || '/demo-saree.jpg'];
<<<<<<< HEAD
  const { isNew, hasDiscount, discountPercentage } = getProductBadges(product);
  const isFavorited = isInWishlist(product._id);
=======
  const isFavorited = isInWishlist(product);
>>>>>>> origin/main
  const isCompared = isInCompare(product._id);

  // Related products from same category or others
  const relatedProducts = products
    .filter(p => p._id !== product._id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize);
    openCart();
  };

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post(`/products/${product._id}/reviews`, { rating: reviewRating, text: reviewText });
      setReviews((current) => [data, ...current]);
      setReviewText('');
      setReviewMessage('Review submitted.');
    } catch (error) { setReviewMessage(error.response?.data?.message || 'Unable to submit review.'); }
  };

  return (
    <div className="w-full py-8 md:py-12 bg-background">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background text-text border border-border/80 shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedImageIdx(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background text-text border border-border/80 shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
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

              {(isNew || hasDiscount) && (
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {isNew && (
                    <span className="bg-background/90 text-text text-[11px] font-semibold tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md">
                      New
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="bg-accent text-white text-[11px] font-semibold tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md">
                      -{discountPercentage}%
                    </span>
                  )}
                </div>
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
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
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

              {/* Size Selector */}
              {product.sizes?.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center text-xs mb-3">
                    <span className="font-semibold text-text uppercase tracking-wider">Select Size</span>
                    <span className="text-accent cursor-pointer hover:underline text-[11px]">Size & Fit Guide</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          selectedSize === size
                            ? 'bg-primary text-background shadow-md ring-2 ring-primary/20'
                            : 'bg-surface hover:bg-surface/80 text-text border border-border'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Actions */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-8">
                {/* Quantity Stepper */}
                <div className="flex items-center justify-between border border-border rounded-xl bg-surface px-2 h-14 sm:w-36 flex-shrink-0">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center text-text hover:text-accent transition-colors text-lg"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-text">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-full flex items-center justify-center text-text hover:text-accent transition-colors text-lg"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag CTA */}
                <Button 
                  onClick={handleAddToCart}
                  className={`flex-1 h-14 uppercase tracking-widest text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isAdded ? 'bg-emerald-600 text-white' : 'bg-primary text-background hover:opacity-95'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={18} /> ADDED TO BAG
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> ADD TO SHOPPING BAG
                    </>
                  )}
                </Button>

                {/* Compare Button */}
                <button
                  onClick={() => toggleCompare(product)}
                  className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl border transition-all ${
                    isCompared
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-surface hover:bg-surface/80 text-text'
                  }`}
                  aria-label="Add to compare"
                >
                  <motion.div whileTap={{ scale: 0.8 }}>
                    <ArrowRightLeft size={22} />
                  </motion.div>
                </button>

                {/* Like / Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl border transition-all ${
                    isFavorited
                      ? 'border-red-500 bg-red-50 text-red-500 dark:bg-red-950/50 shadow-sm'
                      : 'border-border bg-surface hover:bg-surface/80 text-text'
                  }`}
                  aria-label="Add to wishlist"
                >
                  <motion.div whileTap={{ scale: 0.8 }}>
                    <Heart size={22} className={isFavorited ? 'fill-red-500 stroke-red-500' : ''} />
                  </motion.div>
                </button>
              </div>

              {/* Instant Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 mb-8 rounded-xl border border-primary text-primary font-medium tracking-widest text-xs uppercase hover:bg-primary hover:text-background transition-all flex items-center justify-center gap-2"
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

        <section className="mt-12 border-t border-border pt-10" aria-labelledby="reviews-heading">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div><span className="text-xs uppercase tracking-[0.25em] text-accent font-medium">Client Notes</span><h2 id="reviews-heading" className="text-3xl font-serif mt-2">Reviews & Ratings</h2></div>
            <span className="text-sm text-text-muted">{reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
          </div>
          <div className="space-y-4 mb-8">{reviews.map((review) => <article key={review._id} className="border-b border-border pb-4"><div className="flex justify-between text-sm"><strong>{review.user?.name || 'Verified customer'}</strong><span className="text-accent">{'★'.repeat(review.rating)}</span></div><p className="text-sm text-text-muted mt-2">{review.text}</p></article>)}{reviews.length === 0 && <p className="text-sm text-text-muted">No reviews yet.</p>}</div>
          {userInfo && <form onSubmit={submitReview} className="grid sm:grid-cols-[8rem_1fr_auto] gap-3 items-end"><label className="text-sm">Rating<select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))} className="mt-1 w-full px-3 py-2 bg-surface border border-border rounded-lg">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label><label className="text-sm">Your review<textarea required value={reviewText} onChange={(event) => setReviewText(event.target.value)} className="mt-1 w-full px-3 py-2 bg-surface border border-border rounded-lg" rows="2" /></label><Button type="submit" size="sm">Submit</Button></form>}
          {reviewMessage && <p className="text-sm text-text-muted mt-3">{reviewMessage}</p>}
        </section>

        {/* You May Also Like Section */}
        <div className="mt-16 md:mt-20 border-t border-border pt-12">
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
