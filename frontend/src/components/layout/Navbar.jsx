import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, Heart, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import SearchModal from '../search/SearchModal';
import AnnouncementBar from '../home/AnnouncementBar';
import { SocialMediaBar } from '../common/SocialIcons';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartItems, openCart } = useCart();
  const { wishlistItems, openWishlist } = useWishlist();
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'New Arrivals', path: '/shop?filter=new', badge: 'New' },
    { name: 'Sarees', path: '/category/sarees' },
    { name: 'Women', path: '/category/women' },
    { name: 'Dresses', path: '/category/dresses' },
    { name: 'Ethnic Wear', path: '/category/ethnic' },
    { name: 'Baby & Kids', path: '/category/kids' },
    { name: 'Collections', path: '/collections' }
  ];

  // Determine styling based on scroll state and route
  const navClasses = isHome 
    ? (isScrolled 
        ? "bg-background/95 backdrop-blur-md border-b border-border text-text shadow-sm" 
        : "bg-black/25 backdrop-blur-[2px] text-white border-b border-white/10")
    : "bg-background/95 backdrop-blur-md border-b border-border text-text shadow-sm";

  return (
    <header className="fixed top-0 left-0 w-full z-40">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />
      
      {/* 2. Main Navigation Bar */}
      <div className={`transition-all duration-300 ${navClasses}`}>
        <div className={`max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-10 transition-all duration-300 ${isScrolled || !isHome ? 'py-3.5' : 'py-5'}`}>
          <div className="flex items-center justify-between h-full">
          
            {/* Left - Hamburger Menu */}
            <div className="flex items-center w-1/3 justify-start">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center gap-2 p-2 -ml-2 rounded-full hover:opacity-80 transition-all focus:outline-none"
                aria-label="Open menu"
              >
                <Menu size={22} strokeWidth={1.5} />
                <span className="hidden sm:inline-block text-[11px] font-medium tracking-[0.22em] uppercase">
                  Menu
                </span>
              </motion.button>
            </div>

            {/* Center - ANVIKA Brand Logo */}
            <div className="flex items-center justify-center w-1/3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Link 
                  to="/" 
                  onClick={handleHomeClick}
                  className="text-2xl sm:text-3xl font-serif tracking-[0.16em] leading-none inline-block text-center font-normal"
                >
                  ANVIKA
                </Link>
              </motion.div>
            </div>

            {/* Right - Icons (Search, Wishlist, Account, Cart) */}
            <div className="flex items-center justify-end gap-3 sm:gap-5 w-1/3">
              <motion.button 
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                onClick={() => setIsSearchOpen(true)}
                className="p-1 hover:text-accent transition-colors" 
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.5} />
              </motion.button>

              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="hidden sm:block"
              >
                <Link to="/login" className="p-1 hover:text-accent transition-colors block" aria-label="Account">
                  <User size={20} strokeWidth={1.5} />
                </Link>
              </motion.div>

              <motion.button 
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                onClick={openWishlist}
                className="p-1 hover:text-accent transition-colors hidden sm:block relative group" 
                aria-label="Wishlist"
              >
                <Heart size={20} strokeWidth={1.5} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center bg-red-500 text-white">
                    {wishlistItems.length}
                  </span>
                )}
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                onClick={openCart}
                className="p-1 hover:text-accent transition-colors relative group" 
                aria-label="Cart"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartItems.length > 0 && (
                  <span className={`absolute -top-1 -right-1 text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center transition-colors ${isHome && !isScrolled ? 'bg-white text-black' : 'bg-primary text-background'}`}>
                    {cartItems.reduce((total, i) => total + (i.qty || 1), 0)}
                  </span>
                )}
              </motion.button>
            </div>

          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Full Hamburger Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Menu Panel */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 w-full sm:w-[420px] max-w-[90vw] h-full bg-background text-text z-50 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-border">
                <Link 
                  to="/" 
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleHomeClick();
                  }}
                  className="text-xl font-serif tracking-[0.15em]"
                >
                  ANVIKA
                </Link>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="p-2 -mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-border/40">
                <div className="pb-4 space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-text-muted font-semibold block mb-3">
                    Explore Collections
                  </span>
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + idx * 0.03 }}
                    >
                      <Link 
                        to={link.path}
                        onClick={() => {
                          setIsMenuOpen(false);
                          if (link.path === '/') handleHomeClick();
                        }}
                        className="group flex items-center justify-between py-2.5 text-base sm:text-lg font-serif tracking-wide hover:text-accent transition-colors"
                      >
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {link.name}
                        </span>
                        <div className="flex items-center gap-2">
                          {link.badge && (
                            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent font-sans font-semibold">
                              {link.badge}
                            </span>
                          )}
                          <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Account Links */}
                <div className="py-5 space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-text-muted font-semibold block mb-2">
                    Account & Preferences
                  </span>
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="flex items-center gap-3 py-1.5 text-sm tracking-widest uppercase hover:text-accent transition-colors"
                  >
                    <User size={16} strokeWidth={1.5} /> My Account
                  </Link>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      openWishlist();
                    }} 
                    className="flex items-center gap-3 py-1.5 text-sm tracking-widest uppercase hover:text-accent transition-colors w-full text-left"
                  >
                    <Heart size={16} strokeWidth={1.5} /> Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
                  </button>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      openCart();
                    }} 
                    className="flex items-center gap-3 py-1.5 text-sm tracking-widest uppercase hover:text-accent transition-colors w-full text-left"
                  >
                    <ShoppingBag size={16} strokeWidth={1.5} /> Shopping Bag {cartItems.length > 0 && `(${cartItems.length})`}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border bg-black/[0.02] dark:bg-white/[0.02]">
                <span className="text-[10px] uppercase tracking-[0.25em] text-text-muted font-medium block mb-3">
                  Follow Our Journey
                </span>
                <SocialMediaBar 
                  size={18} 
                  className="flex items-center gap-4" 
                  itemClassName="text-text hover:text-accent transition-colors" 
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
