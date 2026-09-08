import { RevealOnScroll } from '../animations/RevealOnScroll';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

const BabyFeature = () => {
  return (
    <section className="section-space w-full bg-surface/50">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface border border-border rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden">
          
          {/* Left Text Content */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[11px] uppercase tracking-[0.3em] text-accent font-semibold block">
              ANVIKA JUNIOR • BABY & KIDS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-text font-light leading-tight">
              Pure love, woven for <br />
              little moments.
            </h2>
            <p className="text-text-muted text-sm sm:text-base font-light leading-relaxed">
              Crafted with delicate attention to skin sensitivity — our baby and kids collections feature 100% breathable organic cotton, gentle mulmul linings, and hypoallergenic threads designed for playful discovery and memorable family celebrations.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/category/kids">
                <Button className="rounded-full px-8 text-xs tracking-widest uppercase">
                  Explore Kids Collection
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image Collage */}
          <div className="lg:col-span-7 grid grid-cols-12 gap-4 h-full items-center">
            <RevealOnScroll className="col-span-7 aspect-[3/4] rounded-2xl overflow-hidden shadow-md group">
              <img 
                src="/baby-1.png" 
                alt="Baby & Kids Fashion" 
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
            </RevealOnScroll>
            <div className="col-span-5 flex flex-col gap-4">
              <RevealOnScroll delay={0.1} className="aspect-square rounded-2xl overflow-hidden shadow-sm group">
                <img 
                  src="/baby-3.png" 
                  alt="Baby Embroidered Dress" 
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </RevealOnScroll>
              <RevealOnScroll delay={0.2} className="aspect-square rounded-2xl overflow-hidden shadow-sm group">
                <img 
                  src="/baby-5.png" 
                  alt="Celebration Baby Dress" 
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              </RevealOnScroll>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BabyFeature;
