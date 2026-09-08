import { Link } from 'react-router-dom';
import { RevealOnScroll } from '../animations/RevealOnScroll';
import Button from '../common/Button';

const SareeFeature = () => {
  return (
    <section className="section-space w-full bg-surface">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full aspect-square md:aspect-[21/9] lg:aspect-[2.5/1] rounded-3xl overflow-hidden shadow-sm">
          
          <RevealOnScroll className="absolute inset-0 w-full h-full">
            <img 
              src="/products/saree-pink-gold.jpg" 
              alt="The Saree Edit"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/30" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <span className="text-white text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-6 block font-medium">
                THE SAREE EDIT
              </span>
              <h2 className="text-white text-5xl md:text-7xl font-serif font-light tracking-wide mb-6">
                Timeless drapes for <br className="hidden sm:block"/>
                moments worth remembering.
              </h2>
              <div className="w-16 h-[1px] bg-white/70 mb-10" />
              <Link to="/category/sarees">
                <Button className="bg-white text-black hover:bg-white/90 px-10">
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
