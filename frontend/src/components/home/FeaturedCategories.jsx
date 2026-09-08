import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RevealOnScroll } from '../animations/RevealOnScroll';
import { ArrowRight } from 'lucide-react';

const FeaturedCategories = () => {
  const categories = [
    { 
      name: 'SAREES', 
      desc: 'Timeless drapes, reimagined.', 
      image: '/saree-emerald.png',
      link: '/category/sarees'
    },
    { 
      name: 'WOMEN', 
      desc: 'Modern silhouettes for everyday grace.', 
      image: '/saree-purple.png',
      link: '/category/women'
    },
    { 
      name: 'DRESSES', 
      desc: 'Flowing cuts & contemporary elegance.', 
      image: '/dress-beige-front.jpg',
      link: '/category/dresses'
    },
    { 
      name: 'ETHNIC WEAR', 
      desc: 'Artisanal kurtas & festive sets.', 
      image: '/saree-gold.jpg',
      link: '/category/ethnic'
    },
    { 
      name: 'BABY & KIDS', 
      desc: 'Little looks, made with love.', 
      image: '/baby-1.png',
      link: '/category/kids'
    },
    { 
      name: 'COLLECTIONS', 
      desc: 'Curated edits for every celebration.', 
      image: '/saree-plum.png',
      link: '/collections'
    },
  ];

  return (
    <section className="section-space px-4 sm:px-6 lg:px-12 max-w-[90rem] mx-auto bg-background">
      <RevealOnScroll>
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-text-muted text-[10px] sm:text-xs tracking-[0.2em] uppercase mb-4 block font-medium">From everyday elegance to unforgettable occasions</span>
          <h2 className="text-4xl md:text-5xl font-serif text-text font-light tracking-wide">Explore The Categories</h2>
          <div className="w-12 h-[1px] bg-accent mt-8"></div>
        </div>
      </RevealOnScroll>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
        {categories.map((category, idx) => (
          <RevealOnScroll key={category.name} delay={idx * 0.1}>
            <Link to={category.link} className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface flex cursor-pointer block">
              <motion.img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-1000 ease-[0.25,0.1,0.25,1] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-700 opacity-60 group-hover:opacity-80" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="transform transition-transform duration-700 ease-[0.25,0.1,0.25,1] group-hover:-translate-y-2">
                  <h3 className="text-white text-3xl font-serif tracking-wide font-light mb-2">
                    {category.name}
                  </h3>
                  <p className="text-white/80 text-sm font-light mb-4 tracking-wide">
                    {category.desc}
                  </p>
                  
                  <div className="flex items-center text-white text-xs tracking-widest uppercase font-medium overflow-hidden">
                    <motion.div 
                      initial={{ x: -10, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      className="flex items-center gap-2 transform transition-all duration-300 group-hover:gap-4"
                    >
                      EXPLORE <ArrowRight size={14} />
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
