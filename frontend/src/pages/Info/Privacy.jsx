import { FadeIn, RevealOnScroll } from '../../components/animations/RevealOnScroll';
import { ShieldCheck, Lock, Eye, Bell, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="w-full page-shell bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <FadeIn>
          <div className="mb-14">
            <span className="text-xs uppercase tracking-[0.3em] text-accent font-medium block mb-3">
              Client Data Protection
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-text font-light tracking-wide mb-4">
              Privacy Policy
            </h1>
            <p className="text-text-muted text-xs uppercase tracking-widest">
              Last Updated: January 2026 • Compliant with Indian DPDP Act 2023 & Global Data Standards
            </p>
          </div>
        </FadeIn>

        {/* Security Highlights */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 p-6 bg-surface/60 border border-border rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-text">256-Bit SSL Encrypted</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Bank-grade encryption guarantees that your payment transactions and identity remain secure.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-text">Zero Data Selling</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  We never sell, rent, or lease your private personal details to third-party brokers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-text">Total Consent Control</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Request access, amendment, or erasure of your account data at any point via email.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Content */}
        <div className="space-y-10 text-sm text-text-muted font-light leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-serif text-text font-medium">1. Introduction & Overview</h2>
            <p>
              At <strong>Anvika Luxury Crafts Pvt. Ltd.</strong> ("Anvika", "we", "us", or "our"), we place the highest priority on preserving your privacy and safeguarding your personal information. This Privacy Policy details how we collect, use, disclose, and protect the data you share with us when you explore our boutique website, create an account, purchase our artisanal garments, or communicate with our atelier concierge.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-text font-medium">2. Information We Collect</h2>
            <p>We may collect information in several distinct ways:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-text-muted">
              <li>
                <strong className="text-text">Personal Identification Data:</strong> Full name, billing and residential shipping addresses, telephone number, and email address provided during order placement or newsletter subscription.
              </li>
              <li>
                <strong className="text-text">Bespoke Fit Profiles:</strong> Custom measurements and sizing preferences provided for tailored saree blouse stitching and bridal couture consultations.
              </li>
              <li>
                <strong className="text-text">Transaction Details:</strong> Payment method tokenization, billing records, and order transaction IDs. <em>Note: Anvika does not store raw credit card numbers or banking PINs; all payments are routed through PCI-DSS Level 1 compliant gateway partners (Razorpay, Stripe).</em>
              </li>
              <li>
                <strong className="text-text">Technical & Usage Information:</strong> IP address, device hardware identifiers, browser preferences, referral URLs, and interactions with our catalog for performance monitoring and curation refinement.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-text font-medium">3. How We Use Your Data</h2>
            <p>Your information allows us to provide an effortless, personalized luxury experience:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-text-muted">
              <li>Facilitate order processing, archival packaging, and secure door-to-door courier dispatch.</li>
              <li>Provide instant order tracking notifications, SMS airway bill alerts, and WhatsApp customer care updates.</li>
              <li>Refine tailor measurement consultations and provide bespoke sizing recommendations.</li>
              <li>Deliver curated invitations to private trunk shows, heirloom saree previews, and seasonal festive launch collections (with simple 1-click unsubscribe options).</li>
              <li>Safeguard against fraudulent transactions and unauthorized account access.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-text font-medium">4. Cookies & Tracking Technologies</h2>
            <p>
              We utilize essential cookies to retain your shopping bag selections, active currency preference, and account authentication sessions across visits. Analytical cookies (e.g., anonymized Google Analytics) assist our visual curators in understanding which loom traditions and weaves resonate most with our audience. You may disable cookies in your browser settings at any time, though some shopping bag functionalities may be impaired.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-text font-medium">5. Data Sharing & Third Parties</h2>
            <p>
              We do not monetize your personal data. We only disclose essential data to vetted logistical and technological partners essential for business operations:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-text-muted">
              <li><strong className="text-text">Logistics Partners:</strong> Blue Dart, DHL Express, and FedEx for the sole purpose of parcel shipping and transit insurance.</li>
              <li><strong className="text-text">Payment Processors:</strong> Certified payment gateways for cryptographic verification and dispute settlement.</li>
              <li><strong className="text-text">Statutory Authorities:</strong> When required by statutory Indian laws, subpoenas, or legal directives.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-text font-medium">6. Your Rights & Data Erasure</h2>
            <p>
              Under global data privacy frameworks and India's Digital Personal Data Protection (DPDP) Act 2023, you retain full rights to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-text-muted">
              <li>Request a copy of the personal records associated with your profile.</li>
              <li>Rectify inaccurate contact coordinates or measurement details.</li>
              <li>Instruct the complete deletion and erasure of your Anvika client account and marketing subscription.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif text-text font-medium">7. Contact the Data Protection Officer</h2>
            <p>
              If you have any questions or wish to exercise your data rights, please contact our designated Data Protection & Privacy Grievance Officer:
            </p>
            <div className="p-4 rounded-lg bg-surface/50 border border-border text-xs text-text space-y-1">
              <p><strong>Grievance Officer:</strong> Priyadarshini Mehta</p>
              <p><strong>Email:</strong> <a href="mailto:privacy@anvika.com" className="text-accent underline">privacy@anvika.com</a></p>
              <p><strong>Office:</strong> Anvika Luxury Crafts Pvt. Ltd., Mehrauli Heritage Quarter, New Delhi – 110030, India</p>
            </div>
          </section>

          <section className="pt-6 border-t border-border text-xs flex flex-wrap items-center justify-between gap-4">
            <p>
              Review our <Link to="/terms" className="text-accent underline">Terms of Service</Link> or contact our <Link to="/contact" className="text-accent underline">Client Concierge</Link>.
            </p>
            <p className="text-text-muted">© 2026 Anvika Luxury Crafts Pvt. Ltd.</p>
          </section>
        </div>

      </div>
    </div>
  );
};

export default Privacy;
