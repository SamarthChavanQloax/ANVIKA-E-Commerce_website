import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialMediaBar, WhatsAppIcon } from '../common/SocialIcons';

const messages = [
  "FREE SHIPPING ON ALL ORDERS ABOVE ₹1999",
  "NEW SEASON | THE FESTIVE EDIT IS LIVE",
  "DISCOVER THE ART OF INDIAN DRESSING"
];

const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside
      aria-label="Announcement"
      className={`w-full ${
        isAuthPage ? 'bg-black/35 backdrop-blur-md' : 'bg-[#121212]'
      } text-white/90 h-[38px] relative overflow-hidden border-b border-white/10 select-none px-4 sm:px-8 transition-colors duration-300`}
    >
      <div className="max-w-[90rem] mx-auto h-full flex items-center justify-between relative">
        
        {/* Left: Social Media Platforms with hover zoom */}
        <div className="hidden md:flex items-center gap-2 z-10">
          <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase mr-1">Follow:</span>
          <SocialMediaBar size={13} className="flex items-center gap-2.5" itemClassName="text-white/70 hover:text-accent transition-colors" />
        </div>

        {/* Center: Cycling Announcements */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex items-center justify-center"
            >
              <span className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-medium text-center truncate pointer-events-auto">
                {messages[currentIndex]}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Quick Concierge Link */}
        <div className="hidden lg:flex items-center gap-3 z-10 text-[10px] tracking-widest text-white/70">
          <motion.a 
            href="https://wa.me/919876543210" 
            target="_blank" 
            rel="noopener noreferrer"
            whileHover={{ scale: 1.08 }}
            className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors uppercase font-medium"
          >
            <WhatsAppIcon size={12} className="text-emerald-400" />
            <span>VIP Styling Concierge</span>
          </motion.a>
        </div>

      </div>
    </aside>
  );
};

export default AnnouncementBar;
