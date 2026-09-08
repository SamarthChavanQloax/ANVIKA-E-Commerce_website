import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RevealOnScroll } from '../animations/RevealOnScroll';
import { ArrowRight } from 'lucide-react';

const FeaturedCategories = () => {
  const categories = [
    { 
      name: 'SAREES', 
      desc: 'Timeless drapes, reimagined.', 
      image: '/products/saree-pink-gold.jpg',
      link: '/category/sarees'
    },
    { 
      name: 'WOMEN', 
      desc: 'Modern silhouettes for everyday grace.', 
      image: '/products/dress-plum-dhoti-set.jpg',
      link: '/category/women'
    },
    { 
      name: 'DRESSES', 
      desc: 'Flowing cuts & contemporary elegance.', 
      image: '/products/dress-cream-mustard-suit.jpg',
      link: '/category/dresses'
    },
    { 
      name: 'ETHNIC WEAR', 
      desc: 'Artisanal kurtas & festive sets.', 
      image: '/products/dress-magenta-designer-suit.jpg',
      link: '/category/ethnic'
    },
    { 
      name: 'BABY & KIDS', 
      desc: 'Little looks, made with love.', 
      image: '/products/baby-cherry-yellow.jpg',
      link: '/category/kids'
    },
    { 
      name: 'COLLECTIONS', 
      desc: 'Curated edits for every celebration.', 
      image: '/products/saree-silver-silk.jpg',
      link: '/collections'
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-12 max-w-[90rem] mx-auto bg-background">
      <RevealOnScroll>
        <div className="text-center mb-10 sm:mb-16 flex flex-col items-center">
          <span className="text-text-muted text-[10px] sm:text-xs tracking-[0.2em] uppercase mb-3 sm:mb-4 block font-medium">From everyday elegance to unforgettable occasions</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-text font-light tracking-wide">Explore The Categories</h2>
          <div className="w-12 h-[1px] bg-accent mt-6 sm:mt-8"></div>
        </div>
      </RevealOnScroll>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
        {categories.map((category, idx) => (
          <RevealOnScroll key={category.name} delay={idx * 0.1}>
            <Link to={category.link} className="group relative aspect-[3/4] overflow-hidden rounded-xl sm:rounded-2xl bg-surface flex cursor-pointer block">
              <motion.img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-1000 ease-[0.25,0.1,0.25,1] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-700 opacity-70 group-hover:opacity-85" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-3.5 sm:p-6 md:p-8">
                <div className="transform transition-transform duration-700 ease-[0.25,0.1,0.25,1] group-hover:-translate-y-1 sm:group-hover:-translate-y-2">
                  <h3 className="text-white text-base sm:text-2xl md:text-3xl font-serif tracking-wide font-light mb-1 sm:mb-2 leading-tight">
                    {category.name}
                  </h3>
                  <p className="text-white/80 text-[11px] sm:text-sm font-light mb-2 sm:mb-4 tracking-wide line-clamp-1 sm:line-clamp-2">
                    {category.desc}
                  </p>
                  
                  <div className="flex items-center text-white text-[10px] sm:text-xs tracking-widest uppercase font-medium overflow-hidden">
                    <motion.div 
                      initial={{ x: -10, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      className="flex items-center gap-1.5 sm:gap-2 transform transition-all duration-300 group-hover:gap-3 sm:group-hover:gap-4"
                    >
                      EXPLORE <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </Link>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
