import { Link } from 'react-router-dom';
import { RevealOnScroll } from '../animations/RevealOnScroll';
import Button from '../common/Button';

const SareeFeature = () => {
  return (
    <section className="py-12 sm:py-16 md:py-24 w-full bg-surface">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full min-h-[340px] sm:min-h-[420px] aspect-auto md:aspect-[21/9] lg:aspect-[2.5/1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm flex items-center justify-center">
          
          <RevealOnScroll className="absolute inset-0 w-full h-full">
            <img 
              src="/products/saree-pink-gold.jpg" 
              alt="The Saree Edit"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/40" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-8">
              <span className="text-white text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-3 sm:mb-6 block font-medium">
                THE SAREE EDIT
              </span>
              <h2 className="text-white text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-light tracking-wide mb-3 sm:mb-6 leading-tight max-w-3xl">
                Timeless drapes for <br className="hidden sm:block"/>
                moments worth remembering.
              </h2>
              <div className="w-12 sm:w-16 h-[1px] bg-white/70 mb-5 sm:mb-8" />
              <Link to="/category/sarees">
                <Button className="bg-white text-black hover:bg-white/90 px-6 sm:px-10 text-xs tracking-widest uppercase">
                  SHOP SAREES
                </Button>
              </Link>
            </div>
          </RevealOnScroll>
          
        </div>
      </div>
    </section>
  );
};

export default SareeFeature;
