import { RevealOnScroll } from '../animations/RevealOnScroll';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CollectionGrid = () => {
  return (
    <section className="section-space px-4 sm:px-6 lg:px-12 max-w-[90rem] mx-auto bg-background">
      <RevealOnScroll>
        <div className="text-center mb-16 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-serif text-text font-light tracking-wide">Shop By Collection</h2>
          <div className="w-12 h-[1px] bg-accent mt-8"></div>
        </div>
      </RevealOnScroll>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-[400px] lg:auto-rows-[500px]">
        
        {/* Large Featured Collection */}
        <RevealOnScroll className="lg:col-span-2 group relative overflow-hidden rounded-2xl bg-surface cursor-pointer">
          <Link to="/collections" className="block w-full h-full">
            <motion.img 
              src="/saree-bridal.png" 
              alt="Festive Edit"
              className="w-full h-full object-cover transition-transform duration-1000 ease-[0.25,0.1,0.25,1] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-700" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <span className="text-white text-[10px] tracking-[0.3em] uppercase mb-4 block font-medium">The Celebration Collection</span>
              <h3 className="text-white text-5xl md:text-6xl font-serif font-light tracking-wide">Festive Edit</h3>
            </div>
          </Link>
        </RevealOnScroll>

        {/* Small Collection 1 */}
        <RevealOnScroll delay={0.2} className="group relative overflow-hidden rounded-2xl bg-surface cursor-pointer">
          <Link to="/collections" className="block w-full h-full">
            <motion.img 
              src="/saree-lavender.png" 
              alt="Everyday Elegance"
              className="w-full h-full object-cover transition-transform duration-1000 ease-[0.25,0.1,0.25,1] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-700" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <h3 className="text-white text-3xl font-serif font-light tracking-wide">Everyday <br/> Elegance</h3>
            </div>
          </Link>
        </RevealOnScroll>

        {/* Small Collection 2 */}
        <RevealOnScroll delay={0.1} className="group relative overflow-hidden rounded-2xl bg-surface cursor-pointer">
          <Link to="/collections" className="block w-full h-full">
            <motion.img 
              src="/saree-emerald.png" 
              alt="Saree Stories"
              className="w-full h-full object-cover transition-transform duration-1000 ease-[0.25,0.1,0.25,1] group-hover:scale-105 object-top"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-700" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <h3 className="text-white text-3xl font-serif font-light tracking-wide">Saree <br/> Stories</h3>
            </div>
          </Link>
        </RevealOnScroll>

        {/* Medium Collection 3 */}
        <RevealOnScroll delay={0.2} className="md:col-span-2 lg:col-span-2 group relative overflow-hidden rounded-2xl bg-surface cursor-pointer">
          <Link to="/collections" className="block w-full h-full">
            <motion.img 
              src="/saree-rust.png" 
              alt="New Season"
              className="w-full h-full object-cover transition-transform duration-1000 ease-[0.25,0.1,0.25,1] group-hover:scale-105 object-top"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-700" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <span className="text-white text-[10px] tracking-[0.3em] uppercase mb-4 block font-medium">Just Landed</span>
              <h3 className="text-white text-4xl md:text-5xl font-serif font-light tracking-wide">The Summer Edit</h3>
            </div>
          </Link>
        </RevealOnScroll>

      </div>
    </section>
  );
};

export default CollectionGrid;
