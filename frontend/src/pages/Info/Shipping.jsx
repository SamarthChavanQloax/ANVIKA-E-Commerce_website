import { Truck, ShieldCheck, Clock, Globe, Package, CheckCircle2 } from 'lucide-react';
import { FadeIn, RevealOnScroll } from '../../components/animations/RevealOnScroll';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const Shipping = () => {
  return (
    <div className="w-full py-8 md:py-12 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-accent font-medium block mb-3">
              Delivery Logistics & Care
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-text font-light tracking-wide mb-6">
              Shipping & Delivery
            </h1>
            <p className="text-text-muted text-sm sm:text-base font-light leading-relaxed">
              Every Anvika creation is inspected by master archivists and packed in archival keepsake boxes to guarantee pristine transit to your doorstep.
            </p>
          </div>
        </FadeIn>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <RevealOnScroll>
            <div className="p-6 bg-surface/50 border border-border/80 rounded-2xl text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Truck size={22} />
              </div>
              <h3 className="font-serif text-lg text-text font-medium mb-2">Complimentary Domestic</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Free fully insured express transit across India on all orders exceeding ₹1,999.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <div className="p-6 bg-surface/50 border border-border/80 rounded-2xl text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Globe size={22} />
              </div>
              <h3 className="font-serif text-lg text-text font-medium mb-2">Global Air Express</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Dispatched worldwide via DHL Express & FedEx Priority to over 50 countries.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.2}>
            <div className="p-6 bg-surface/50 border border-border/80 rounded-2xl text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Package size={22} />
              </div>
              <h3 className="font-serif text-lg text-text font-medium mb-2">Archival Packaging</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Packaged in luxury dust bags and hard-cased keepsake boxes with tamper seals.
              </p>
            </div>
          </RevealOnScroll>
        </div>

        {/* Policy Details */}
        <div className="space-y-8 text-sm text-text-muted font-light leading-relaxed">
          <RevealOnScroll>
            <section className="bg-surface/30 p-8 sm:p-10 rounded-3xl border border-border/80 space-y-4">
              <h2 className="text-2xl font-serif text-text font-medium">1. Domestic Transit (India)</h2>
              <p>
                All ready-to-ship sarees, dupattas, and unstitched fabrics are dispatched within <strong>24 to 48 hours</strong> of order verification. Customized blouses or bespoke hemmed pieces undergo artisan tailor fitting and dispatch within 4 to 6 business days.
              </p>
              <ul className="list-disc pl-5 space-y-2 pt-2 text-xs sm:text-sm">
                <li><strong>Metro Cities (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata):</strong> 2–3 business days.</li>
                <li><strong>Rest of India Tier 1 & 2 Cities:</strong> 3–5 business days.</li>
                <li><strong>Remote or North-East Pincodes:</strong> 5–7 business days via BlueDart Air or SpeedPost.</li>
              </ul>
            </section>
          </RevealOnScroll>

          <RevealOnScroll>
            <section className="bg-surface/30 p-8 sm:p-10 rounded-3xl border border-border/80 space-y-4">
              <h2 className="text-2xl font-serif text-text font-medium">2. International Worldwide Shipping</h2>
              <p>
                Anvika ships internationally to the United States, United Kingdom, Canada, UAE, Singapore, Australia, and 45+ other countries.
              </p>
              <ul className="list-disc pl-5 space-y-2 pt-2 text-xs sm:text-sm">
                <li><strong>Delivery Timeline:</strong> 4 to 7 business days from date of dispatch via DHL Express Worldwide.</li>
                <li><strong>Customs & Import Duties:</strong> Duties and local sales taxes are levied by the destination country&apos;s customs authorities and are the responsibility of the recipient upon delivery.</li>
              </ul>
            </section>
          </RevealOnScroll>

          <RevealOnScroll>
            <section className="bg-surface/30 p-8 sm:p-10 rounded-3xl border border-border/80 space-y-4">
              <h2 className="text-2xl font-serif text-text font-medium">3. Order Tracking & Real-Time Updates</h2>
              <p>
                Once your order leaves our New Delhi fulfillment atelier, you will receive an automatic SMS and email notification containing your live AWB tracking number. You may track your package in real-time on our courier partner portals.
              </p>
            </section>
          </RevealOnScroll>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center pt-8 border-t border-border">
          <p className="text-sm text-text-muted mb-4">Have an urgent celebration or destination wedding date?</p>
          <Link to="/contact">
            <Button variant="outline" className="text-xs uppercase tracking-widest px-8">
              Request Priority Dispatch
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Shipping;
