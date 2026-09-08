import { Link } from 'react-router-dom';
import { RevealOnScroll } from '../animations/RevealOnScroll';
import Button from '../common/Button';

const EditorialSplit = () => {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-12 max-w-[90rem] mx-auto overflow-hidden bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center h-auto lg:h-[80vh]">
        
        {/* Left: Large Lifestyle Image */}
        <RevealOnScroll direction="right" className="h-[60vh] lg:h-full rounded-2xl overflow-hidden shadow-sm relative group">
          <img 
            src="/products/saree-silver-silk.jpg" 
            alt="The Art of Indian Dressing" 
            className="w-full h-full object-cover object-top transition-transform duration-1000 ease-[0.25,0.1,0.25,1] group-hover:scale-105"
          />
        </RevealOnScroll>

        {/* Right: Typography and Story */}
        <div className="flex flex-col justify-center lg:pl-8">
          <RevealOnScroll direction="left">
            <span className="text-accent text-[10px] tracking-[0.25em] uppercase mb-6 block font-medium">
              THE ART OF INDIAN DRESSING
            </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.1] mb-8 text-text font-light">
              Where heritage <br/>
              meets the <br/>
              modern wardrobe.
            </h2>
            <p className="text-text-muted mb-12 leading-relaxed font-light text-lg max-w-lg tracking-wide">
              Our collections celebrate Indian craftsmanship through contemporary silhouettes, thoughtful details, and effortless styling. Designed for the woman who honors her roots while embracing the world.
            </p>
            <Link to="/shop">
              <Button variant="outline" className="rounded-full tracking-widest text-xs px-10 border-border hover:bg-surface">
                DISCOVER THE COLLECTION
              </Button>
            </Link>
          </RevealOnScroll>
        </div>

      </div>
    </section>
  );
};

export default EditorialSplit;
