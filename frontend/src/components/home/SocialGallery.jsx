import { RevealOnScroll } from '../animations/RevealOnScroll';
import { motion } from 'framer-motion';
import { InstagramIcon } from '../common/SocialIcons';

const images = [
  "/products/saree-pink-gold.jpg",
  "/products/baby-cherry-yellow.jpg",
  "/products/dress-cream-mustard-suit.jpg",
  "/products/saree-silver-silk.jpg",
  "/products/dress-magenta-designer-suit.jpg",
  "/products/baby-little-bloom.jpg"
];

const SocialGallery = () => {
  return (
    <section className="py-16 md:py-20 bg-surface">
      <RevealOnScroll>
        <div className="text-center mb-16 flex flex-col items-center px-4">
          <motion.a
            href="https://instagram.com/anvikaboutique"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background border border-border/80 text-accent text-[11px] tracking-[0.25em] uppercase mb-4 font-medium shadow-sm hover:border-accent transition-colors"
          >
            <InstagramIcon size={14} />
            <span>@ANVIKABOUTIQUE</span>
          </motion.a>
          <h2 className="text-4xl md:text-5xl font-serif text-text font-light tracking-wide mb-4">Follow Our Story</h2>
          <p className="text-text-muted text-sm font-light">See how our community wears the collection across the globe.</p>
        </div>
      </RevealOnScroll>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full">
        {images.map((src, idx) => (
          <RevealOnScroll key={idx} delay={idx * 0.1} className="relative aspect-square group overflow-hidden cursor-pointer bg-background">
            <motion.a
              href="https://instagram.com/anvikaboutique"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full relative"
            >
              <motion.img 
                src={src} 
                alt="Social Post"
                className="w-full h-full object-cover transition-transform duration-700 ease-[0.25,0.1,0.25,1] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 pointer-events-none" />
            </motion.a>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
};

export default SocialGallery;
