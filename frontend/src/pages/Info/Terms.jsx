import { FadeIn, RevealOnScroll } from '../../components/animations/RevealOnScroll';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="w-full pt-8 pb-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <FadeIn>
          <div className="mb-14">
            <span className="text-xs uppercase tracking-[0.3em] text-accent font-medium block mb-3">
              Legal & Compliance
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-text font-light tracking-wide mb-4">
              Terms of Service
            </h1>
            <p className="text-text-muted text-xs uppercase tracking-widest">
              Last Updated: January 2026 • Anvika Luxury Crafts Pvt. Ltd.
            </p>
          </div>
        </FadeIn>

        {/* Content */}
        <div className="space-y-10 text-sm text-text-muted font-light leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-serif text-text font-medium">1. Acceptance of Terms</h2>
            <p>
              Welcome to Anvika. By accessing, browsing, or making a purchase on <strong>anvika.com</strong>, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please refrain from using our digital services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-text font-medium">2. Handcrafted Variations & Artisanal Authenticity</h2>
            <p>
              Our collections are predominantly handwoven, hand-dyed, and hand-embroidered by independent artisans across India. Minor irregularities in weave slubs, zari luster, or print registration are not defects, but the hallmark of authentic human craftsmanship that distinguishes genuine handlooms from mechanized replicas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-text font-medium">3. Pricing & Currency</h2>
            <p>
              All prices listed on the domestic Indian portal are in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST). For international shoppers, prices may be displayed in equivalent foreign currencies (USD, GBP, EUR, AED) based on live currency conversion rates. We reserve the right to amend pricing at any time without prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-text font-medium">4. Orders, Cancellations & Bespoke Orders</h2>
            <p>
              Standard ready-to-ship orders may be cancelled within <strong>12 hours</strong> of placement by contacting our concierge desk. Once dispatch has occurred or fabric cutting has commenced for custom-stitched blouse orders, cancellations can no longer be processed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-text font-medium">5. Intellectual Property Rights</h2>
            <p>
              All visual trademarks, brand signatures, logo typography, product photography, editorial styling, and website code are the exclusive intellectual property of Anvika Luxury Crafts Pvt. Ltd. Any reproduction, distribution, or commercial exploitation without prior written consent is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-text font-medium">6. Governing Law & Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal disputes or claims arising out of the use of this website shall fall under the exclusive jurisdiction of the competent courts in New Delhi, India.
            </p>
          </section>

          <section className="pt-6 border-t border-border text-xs">
            <p>
              Questions regarding these Terms of Service should be directed to our legal and compliance desk at <strong className="text-text">legal@anvika.com</strong>.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};

export default Terms;
