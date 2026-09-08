import { motion } from 'framer-motion';
import Button from '../common/Button';

const HeroSection = () => {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-background">
      {/* 
        Scroll Parallax Effect:
        Using sticky positioning and standard framer-motion variants instead of complex scroll listeners
        to keep performance high.
      */}
      <div className="absolute inset-0 w-full h-full">
        <motion.img 
          initial={{ scale: 1.05, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="/demo-saree.jpg" 
          alt="Premium Indian Fashion Campaign"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>
      
      {/* Content Container */}
      <div className="relative h-full flex flex-col justify-center max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Staggered Content Container */}
        <div className="max-w-xl text-left mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-4"
          >
            <span className="text-white text-[10px] sm:text-xs tracking-[0.3em] uppercase block font-medium">
              THE NEW EDIT
            </span>
            <div className="h-[1px] w-12 bg-white/50 mt-4" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.1] font-light drop-shadow-md tracking-wide"
          >
            Elegance, <br/>
            Reimagined.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-white/90 mt-6 text-base md:text-lg max-w-sm font-light leading-relaxed tracking-wide"
          >
            Discover timeless Indian silhouettes designed for the woman of today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button className="bg-white text-black hover:bg-white/90">
              SHOP THE COLLECTION
            </Button>
            <Button className="border border-white text-white bg-transparent hover:bg-white/10 backdrop-blur-sm">
              EXPLORE SAREES
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-3 hidden md:flex"
      >
        <span className="text-white text-[9px] tracking-[0.3em] uppercase font-medium">SCROLL TO EXPLORE</span>
        <div className="w-[1px] h-12 bg-white/30 relative overflow-hidden">
          <motion.div 
            animate={{ y: [-48, 48] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-full bg-white absolute top-0 left-0"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
