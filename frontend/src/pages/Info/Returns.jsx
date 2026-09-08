import { RefreshCw, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { FadeIn, RevealOnScroll } from '../../components/animations/RevealOnScroll';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const Returns = () => {
  return (
    <div className="w-full page-shell bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto page-heading">
            <span className="text-xs uppercase tracking-[0.3em] text-accent font-medium block mb-3">
              Guaranteed Satisfaction
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-text font-light tracking-wide mb-6">
              Returns & Exchanges
            </h1>
            <p className="text-text-muted text-sm sm:text-base font-light leading-relaxed">
              We want you to feel complete grace and joy in every Anvika garment. If an item does not exceed your expectations, our 7-day seamless return protocol ensures peace of mind.
            </p>
          </div>
        </FadeIn>

        {/* 3 Steps Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <RevealOnScroll>
            <div className="p-8 bg-surface/50 border border-border/80 rounded-3xl h-full flex flex-col justify-between">
              <div>
                <span className="text-2xl font-serif text-accent font-semibold mb-3 block">01</span>
                <h3 className="font-serif text-lg text-text font-medium mb-2">Request Exchange</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Email us at <strong className="text-text">care@anvika.com</strong> or WhatsApp our concierge within 7 days of delivery with your order ID.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <div className="p-8 bg-surface/50 border border-border/80 rounded-3xl h-full flex flex-col justify-between">
              <div>
                <span className="text-2xl font-serif text-accent font-semibold mb-3 block">02</span>
                <h3 className="font-serif text-lg text-text font-medium mb-2">Complimentary Pickup</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Our courier partner will schedule a complimentary reverse doorstep pickup at your preferred address.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.2}>
            <div className="p-8 bg-surface/50 border border-border/80 rounded-3xl h-full flex flex-col justify-between">
              <div>
                <span className="text-2xl font-serif text-accent font-semibold mb-3 block">03</span>
                <h3 className="font-serif text-lg text-text font-medium mb-2">Swift Resolution</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Upon quality audit at our atelier, your exchange item is dispatched or store credit / bank refund is credited within 48 hours.
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        {/* Policy Guidelines */}
        <div className="space-y-8 text-sm text-text-muted font-light leading-relaxed">
          <RevealOnScroll>
            <div className="bg-surface/30 p-8 sm:p-10 rounded-3xl border border-border/80 space-y-4">
              <h2 className="text-2xl font-serif text-text font-medium">Eligible Return Criteria</h2>
              <ul className="space-y-3 pt-2 text-xs sm:text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Items must be completely unworn, unwashed, unaltered, and free of perfume, makeup, or stains.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>All original brand tags, Silk Mark cert seals, and protective packaging must be intact.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Sarees must not have fallen cuts or custom fall/pico already stitched upon customer request.</span>
                </li>
              </ul>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="bg-surface/30 p-8 sm:p-10 rounded-3xl border border-border/80 space-y-4">
              <h2 className="text-2xl font-serif text-text font-medium">Custom Blouses & Made-to-Order Pieces</h2>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-text-muted">
                <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p>
                  Because bespoke blouses and tailored lehengas are customized to individual client body measurements, they are eligible for <strong>complimentary alterations</strong> rather than direct returns. We gladly provide free doorstep tailoring adjustments until the fit is impeccable.
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        {/* Action Button */}
        <div className="mt-16 text-center pt-8 border-t border-border">
          <p className="text-sm text-text-muted mb-4">Need help initiating an exchange or have questions about a recent order?</p>
          <Link to="/contact">
            <Button className="text-xs uppercase tracking-widest px-8 bg-primary text-background">
              Contact Returns Concierge
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Returns;
