import { RevealOnScroll } from '../animations/RevealOnScroll';
import { Scissors, ShieldCheck, Sparkles } from 'lucide-react';

const Craftsmanship = () => {
  const pillars = [
    {
      icon: <Scissors size={32} strokeWidth={1} />,
      title: "CRAFT",
      desc: "Thoughtful details inspired by India's rich textile traditions, woven by master artisans."
    },
    {
      icon: <ShieldCheck size={32} strokeWidth={1} />,
      title: "QUALITY",
      desc: "Selected fabrics and carefully considered finishing for pieces that last generations."
    },
    {
      icon: <Sparkles size={32} strokeWidth={1} />,
      title: "STYLE",
      desc: "Traditional influences designed effortlessly for the modern woman's wardrobe."
    }
  ];

  return (
    <section className="section-space px-4 sm:px-6 lg:px-12 bg-background border-t border-border/50">
      <div className="max-w-[80rem] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {pillars.map((pillar, idx) => (
            <RevealOnScroll key={pillar.title} delay={idx * 0.2} className="flex flex-col items-center text-center group">
              <div className="mb-6 text-primary transform transition-transform duration-500 group-hover:-translate-y-2">
                {pillar.icon}
              </div>
              <h3 className="text-sm tracking-[0.2em] uppercase font-medium text-text mb-4">
                {pillar.title}
              </h3>
              <p className="text-text-muted font-light leading-relaxed text-sm">
                {pillar.desc}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Craftsmanship;
