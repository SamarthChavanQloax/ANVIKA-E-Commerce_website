import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const FREE_SHIPPING_THRESHOLD = 10000;

const CartDrawer = () => {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    updateQty, 
    removeFromCart, 
    clearCart,
    subtotal, 
    discountAmount, 
    shippingFee, 
    orderTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon 
  } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);

  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput) return;
    const result = await applyCoupon(couponInput);
    setCouponFeedback(result);
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-background z-50 shadow-2xl flex flex-col border-l border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface/50">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-accent" />
                <h3 className="font-serif text-xl tracking-wide text-text font-medium">Your Shopping Bag</h3>
                <span className="text-xs bg-accent/10 text-accent font-semibold px-2 py-0.5 rounded-full">
                  {cartItems.reduce((sum, item) => sum + item.qty, 0)}
                </span>
              </div>
              <button 
                onClick={closeCart} 
                className="p-2 rounded-full hover:bg-surface text-text-muted hover:text-text transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Meter */}
            <div className="bg-surface/30 px-6 py-3 border-b border-border text-xs">
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <CheckCircle2 size={16} />
                  <span>Congratulations! You qualify for complimentary insured shipping.</span>
                </div>
              ) : (
                <div>
                  <p className="text-text-muted mb-1.5">
                    Add <span className="font-semibold text-text">₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</span> more to unlock <span className="text-accent font-medium">Free Express Shipping</span>
                  </p>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Content Area */}
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-text-muted mb-4">
                  <ShoppingBag size={30} strokeWidth={1.2} />
                </div>
                <h4 className="font-serif text-2xl text-text font-light mb-2">Your Bag is Empty</h4>
                <p className="text-text-muted text-sm max-w-xs mb-6">
                  Discover our timeless handcrafted sarees and contemporary ethnic ensembles.
                </p>
                <Link to="/shop" onClick={closeCart}>
                  <Button variant="outline" className="text-xs uppercase tracking-widest px-8">
                    Discover Collection
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border/60">
                  {cartItems.map((item) => (
                    <motion.div 
                      key={item.cartKey}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="py-4 flex gap-4 items-start"
                    >
                      <img 
                        src={item.image || '/demo-saree.jpg'} 
                        alt={item.name} 
                        className="w-20 h-24 object-cover rounded-xl bg-surface border border-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif text-sm text-text font-medium line-clamp-1">
                            {item.name}
                          </h4>
                          <button 
                            onClick={() => removeFromCart(item.cartKey)}
                            className="text-text-muted hover:text-red-500 transition-colors p-1 -mr-1"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <p className="text-[11px] text-text-muted mt-1 uppercase tracking-wider">
                          Size: <span className="text-text font-medium">{item.selectedSize}</span>
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-semibold text-text">
                            ₹{(item.price * item.qty).toLocaleString('en-IN')}
                          </span>

                          <div className="flex items-center border border-border rounded-lg bg-surface/40 overflow-hidden">
                            <button
                              onClick={() => updateQty(item.cartKey, item.qty - 1)}
                              className="p-1.5 hover:bg-surface text-text-muted hover:text-text transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-8 text-center text-xs font-medium text-text">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.cartKey, item.qty + 1)}
                              className="p-1.5 hover:bg-surface text-text-muted hover:text-text transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer Section */}
                <div className="border-t border-border p-6 bg-surface/30 space-y-4">
                  {/* Promo Code Input */}
                  {!appliedCoupon ? (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                          type="text"
                          placeholder="Promo code (e.g. ANVIKA10)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-xs uppercase tracking-wider text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent"
                        />
                      </div>
                      <Button type="submit" variant="secondary" className="text-xs px-4 py-2">
                        Apply
                      </Button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-xs">
                      <div className="flex items-center gap-2 text-emerald-600 font-medium">
                        <CheckCircle2 size={14} />
                        <span>Code <strong>{appliedCoupon.code}</strong> applied</span>
                      </div>
                      <button 
                        onClick={removeCoupon} 
                        className="text-text-muted hover:text-text text-[11px] underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {couponFeedback && !appliedCoupon && (
                    <p className={`text-xs ${couponFeedback.success ? 'text-emerald-600' : 'text-red-500'}`}>
                      {couponFeedback.message}
                    </p>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="space-y-2 text-xs text-text-muted pt-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-text font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount</span>
                        <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>
                        {shippingFee === 0 ? (
                          <span className="text-emerald-600 font-medium uppercase tracking-wider">FREE</span>
                        ) : (
                          `₹${shippingFee.toLocaleString('en-IN')}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-semibold text-text pt-2 border-t border-border">
                      <span>Estimated Total</span>
                      <span>₹{orderTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <Button 
                    onClick={handleCheckout}
                    className="w-full py-3.5 bg-primary text-background font-medium tracking-widest text-xs uppercase flex items-center justify-center gap-2 group hover:opacity-90 transition-opacity"
                  >
                    PROCEED TO CHECKOUT
                    <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-text-muted">
                    <ShieldCheck size={14} className="text-accent" />
                    <span>100% Authentic Indian Silks • Secure Encrypted Checkout</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
