import { motion } from 'framer-motion';
import { FadeIn, RevealOnScroll } from '../../components/animations/RevealOnScroll';
import { Sparkles, Heart, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const About = () => {
  return (
    <div className="w-full page-shell bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Hero */}
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto page-heading">
            <span className="text-xs uppercase tracking-[0.3em] text-accent font-medium block mb-3">
              The Heritage of Anvika
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-text font-light tracking-wide mb-6 leading-tight">
              Crafting Royalty for the Contemporary Woman
            </h1>
            <p className="text-text-muted text-base sm:text-lg font-light leading-relaxed">
              Born from an enduring reverence for India&apos;s master handloom traditions and a modern design sensibility that celebrates effortless feminine strength.
            </p>
          </div>
        </FadeIn>

        {/* Big Editorial Feature Banner */}
        <div className="relative aspect-[21/9] rounded-3xl overflow-hidden mb-16 shadow-md">
          <img
            src="/saree-bridal.png"
            alt="Anvika Saree Heritage"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center text-center p-6">
            <div className="max-w-xl">
              <span className="text-white text-xs uppercase tracking-[0.3em] font-medium block mb-3">Est. 2021 • New Delhi</span>
              <h2 className="text-white text-3xl sm:text-5xl font-serif font-light leading-snug">
                Every thread carries the soul of the artisan.
              </h2>
            </div>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center mb-20">
          <RevealOnScroll>
            <div className="space-y-6 text-sm sm:text-base text-text-muted font-light leading-relaxed">
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-semibold block">Our Origins</span>
              <h3 className="text-3xl sm:text-4xl font-serif text-text font-light leading-snug">
                Preserving generational handloom dynasties.
              </h3>
              <p>
                Anvika was founded with a singular, uncompromising ambition: to bridge centuries-old Indian handloom weaving with silhouettes tailored for modern global women.
              </p>
              <p>
                In an era dominated by fast fashion and synthetic powerlooms, we choose the patient rhythm of the wooden pit loom. A single Anvika bridal Banarasi saree often demands between 180 to 300 hours of painstaking kadhwa weaving by master generational craftsmen in Varanasi.
              </p>
              <p>
                Every fold reflects pure silk yarns, authentic zari filaments dipped in silver and gold, and motifs inspired by Mughal flora, temple architecture, and sacred river ghats.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.15}>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg border border-border">
              <img
                src="/saree-emerald.png"
                alt="Master Weaver Craftsmanship"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-background/80 backdrop-blur-md rounded-2xl border border-border/80">
                <span className="text-xs text-accent uppercase tracking-widest font-semibold block mb-1">Direct Artisan Impact</span>
                <p className="text-xs text-text-muted leading-relaxed">
                  Working directly with over 450+ weaver households across Varanasi, Chanderi, and Bengal without intermediaries.
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        {/* Core Pillars */}
        <div className="border-t border-border pt-16 mb-20">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.25em] text-accent font-medium block mb-2">Our Guiding Values</span>
            <h2 className="text-3xl md:text-4xl font-serif text-text font-light tracking-wide">The Anvika Standard</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <RevealOnScroll>
              <div className="p-6 bg-surface/40 rounded-2xl border border-border/80 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <Award size={22} />
                </div>
                <h4 className="font-serif text-lg text-text font-medium mb-2">Silk Mark Certified</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Every saree is government laboratory tested for 100% genuine silk purity.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              <div className="p-6 bg-surface/40 rounded-2xl border border-border/80 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <Users size={22} />
                </div>
                <h4 className="font-serif text-lg text-text font-medium mb-2">Fair Wage Ethical</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Direct artisan compensation well above fair-trade cooperative benchmarks.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <div className="p-6 bg-surface/40 rounded-2xl border border-border/80 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <Sparkles size={22} />
                </div>
                <h4 className="font-serif text-lg text-text font-medium mb-2">Heirloom Quality</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Designed to endure for generations and become cherished family heirlooms.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.3}>
              <div className="p-6 bg-surface/40 rounded-2xl border border-border/80 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <Heart size={22} />
                </div>
                <h4 className="font-serif text-lg text-text font-medium mb-2">Female Founded</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Designed by women who understand the modern lifestyle and desire for grace.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-12 bg-surface/30 rounded-3xl border border-border/80">
          <h3 className="text-3xl font-serif text-text font-light mb-4">Experience the Handloom Majesty</h3>
          <p className="text-text-muted text-sm max-w-lg mx-auto mb-8">
            Explore our latest arrivals and discover a drape that honors your roots while celebrating your future.
          </p>
          <Link to="/shop">
            <Button className="text-xs uppercase tracking-widest px-8 bg-primary text-background">
              Discover The Collection
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default About;
