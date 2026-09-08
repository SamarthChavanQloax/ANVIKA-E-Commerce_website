import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RevealOnScroll } from '../animations/RevealOnScroll';
import { Star } from 'lucide-react';

const reviews = [
  {
    id: 1,
    text: "Beautiful fabric, perfect fitting and even better in person. The craftsmanship is truly exceptional.",
    name: "Priya Sharma",
    verified: true
  },
  {
    id: 2,
    text: "I wore the Rosewood Banarasi for my sister's wedding and received so many compliments. Incredible quality.",
    name: "Ananya Patel",
    verified: true
  },
  {
    id: 3,
    text: "Finally, a brand that understands modern silhouettes without losing the traditional touch. Will definitely buy again.",
    name: "Sneha Reddy",
    verified: true
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-12 bg-surface">
      <RevealOnScroll className="max-w-4xl mx-auto text-center">
        <span className="text-accent text-[10px] tracking-[0.25em] uppercase mb-12 block font-medium">
          WHAT OUR CUSTOMERS SAY
        </span>
        
        <div className="h-[200px] flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="absolute w-full"
            >
              <div className="flex justify-center gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-accent stroke-accent" />
                ))}
              </div>
              <p className="text-2xl md:text-3xl lg:text-4xl font-serif text-text font-light leading-relaxed mb-8">
                "{reviews[currentIndex].text}"
              </p>
              <div className="flex flex-col items-center justify-center">
                <span className="text-text font-medium tracking-wide text-sm">{reviews[currentIndex].name}</span>
                {reviews[currentIndex].verified && (
                  <span className="text-text-muted text-xs tracking-widest uppercase mt-1">Verified Buyer</span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-12">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                idx === currentIndex ? 'bg-primary w-6' : 'bg-border'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
};

export default Testimonials;
