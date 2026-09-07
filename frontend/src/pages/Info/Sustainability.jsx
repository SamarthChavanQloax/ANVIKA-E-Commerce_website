import { Leaf, Droplets, Recycle, ShieldCheck, HeartHandshake } from 'lucide-react';
import { FadeIn, RevealOnScroll } from '../../components/animations/RevealOnScroll';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const Sustainability = () => {
  return (
    <div className="w-full pt-8 pb-24 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-accent font-medium block mb-3">
              Conscious Luxury & Ecology
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-text font-light tracking-wide mb-6">
              Sustainability & Conscious Craft
            </h1>
            <p className="text-text-muted text-sm sm:text-base font-light leading-relaxed">
              At Anvika, true luxury is rooted in responsibility. We believe honoring Indian handlooms inherently means protecting the earth, air, and artisan livelihoods that make our creations possible.
            </p>
          </div>
        </FadeIn>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <RevealOnScroll>
            <div className="p-8 bg-surface/40 rounded-3xl border border-border/80 h-full">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
                <Leaf size={22} />
              </div>
              <h3 className="font-serif text-xl text-text font-medium mb-3">100% Biodegradable Natural Fibers</h3>
              <p className="text-sm text-text-muted leading-relaxed font-light">
                We work strictly with pure natural fibers: Mulberry Katan silk, organic cotton mulmul, and raw linen. We completely reject polyester blends, nylon, and synthetic microfibers that pollute waterways.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <div className="p-8 bg-surface/40 rounded-3xl border border-border/80 h-full">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6">
                <Droplets size={22} />
              </div>
              <h3 className="font-serif text-xl text-text font-medium mb-3">Azo-Free & Herbal Dyes</h3>
              <p className="text-sm text-text-muted leading-relaxed font-light">
                Our dyers utilize certified non-toxic, azo-free colorants and botanical infusions derived from pomegranate rinds, madder root, indigo, and marigold. Water effluent is filtered before safe agricultural disposal.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.2}>
            <div className="p-8 bg-surface/40 rounded-3xl border border-border/80 h-full">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6">
                <Recycle size={22} />
              </div>
              <h3 className="font-serif text-xl text-text font-medium mb-3">Zero-Waste Pattern Drafting</h3>
              <p className="text-sm text-text-muted leading-relaxed font-light">
                Traditional Indian sarees are naturally zero-waste—woven seamlessly on the loom without cutting. For stitched anarkalis and dresses, textile offcuts are collected to create handcrafted hair ties, potli bags, and keepsake tassels.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.3}>
            <div className="p-8 bg-surface/40 rounded-3xl border border-border/80 h-full">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-6">
                <HeartHandshake size={22} />
              </div>
              <h3 className="font-serif text-xl text-text font-medium mb-3">Living Wages for Artisans</h3>
              <p className="text-sm text-text-muted leading-relaxed font-light">
                We contract with weaver collectives on an upfront, ethical payment model that protects them from market volatility. 100% of our production supports intergenerational rural crafts families.
              </p>
            </div>
          </RevealOnScroll>
        </div>

        {/* Commitment Statement */}
        <RevealOnScroll>
          <div className="bg-surface/30 p-8 sm:p-12 rounded-3xl border border-border/80 text-center">
            <h2 className="text-2xl sm:text-3xl font-serif text-text font-light mb-4">
              &ldquo;The future of luxury is slow, conscious, and deeply human.&rdquo;
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto mb-8 font-light leading-relaxed">
              When you invest in an Anvika saree, you are casting a vote for rural craftsmanship, cultural memory, and conscious, enduring fashion.
            </p>
            <Link to="/shop">
              <Button variant="outline" className="text-xs uppercase tracking-widest px-8">
                Explore Sustainable Weaves
              </Button>
            </Link>
          </div>
        </RevealOnScroll>

      </div>
    </div>
  );
};

export default Sustainability;
