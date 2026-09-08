import { Link } from 'react-router-dom';
import { RevealOnScroll } from '../animations/RevealOnScroll';
import Button from '../common/Button';

const BrandStory = () => {
  return (
    <section className="section-space px-4 sm:px-6 lg:px-12 max-w-[90rem] mx-auto bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        
        {/* Story Content */}
        <div className="flex flex-col justify-center order-2 lg:order-1">
          <RevealOnScroll direction="right">
            <span className="text-accent text-[10px] tracking-[0.25em] uppercase mb-4 block font-medium">
              CRAFTED WITH HEART
            </span>
            <h2 className="text-4xl md:text-5xl font-serif leading-[1.2] mb-6 text-text font-light">
              Born from a love for Indian craftsmanship.
            </h2>
            <div className="space-y-4 text-text-muted font-light text-base leading-relaxed tracking-wide mb-8">
              <p>
                Anvika was founded with a singular vision: to create clothing that feels as beautiful as it looks. As a female-founded brand, we understand the nuances of the modern woman's lifestyle.
              </p>
              <p>
                We collaborate directly with artisans across India to bring you thoughtful silhouettes, selecting only the finest fabrics and ensuring every finish meets our exacting standards.
              </p>
            </div>
            <Link to="/about">
              <Button variant="outline" className="rounded-full tracking-widest text-xs px-10 border-border hover:bg-surface">
                OUR STORY
              </Button>
            </Link>
          </RevealOnScroll>
        </div>

        {/* Story Image */}
        <RevealOnScroll direction="left" className="h-[50vh] lg:h-[70vh] rounded-3xl overflow-hidden shadow-sm order-1 lg:order-2">
          <img 
            src="/products/saree-pink-gold.jpg" 
            alt="Craftsmanship and Fabric" 
            className="w-full h-full object-cover object-center"
          />
        </RevealOnScroll>

      </div>
    </section>
  );
};

export default BrandStory;
