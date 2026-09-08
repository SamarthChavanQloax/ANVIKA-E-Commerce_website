import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Scissors, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Clock,
  Award,
  CheckCircle2
} from 'lucide-react';
import { SocialMediaBar } from '../common/SocialIcons';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const trustPillars = [
    {
      icon: Award,
      title: "Silk Mark Certified",
      description: "100% pure authentic handloom silks certified by the Silk Mark Organisation of India."
    },
    {
      icon: Scissors,
      title: "Custom Tailoring & Pico",
      description: "Complimentary fall & pico edging with made-to-measure blouse stitching services."
    },
    {
      icon: Truck,
      title: "Worldwide Express Shipping",
      description: "Fast, insured doorstep delivery across India and to over 80+ countries worldwide."
    },
    {
      icon: ShieldCheck,
      title: "Secure Payments & Easy Returns",
      description: "Encrypted transactions via UPI, cards, net banking, and hassle-free 7-day exchanges."
    }
  ];

  return (
    <footer className="bg-surface text-text border-t border-border">
      {/* 1. Trust Pillars / Value Proposition Bar */}
      <div className="border-b border-border/80 bg-background/50">
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {trustPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 text-accent mt-0.5">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-medium tracking-wide mb-1 text-text">
                      {pillar.title}
                    </h4>
                    <p className="text-xs text-text-muted leading-relaxed font-light">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Atelier Club / Newsletter Signup Strip */}
      <div className="border-b border-border/80 bg-gradient-to-b from-transparent to-background/30">
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-12 py-14">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-surface p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-2">
                <Sparkles size={14} /> The ANVIKA Privilege
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-light text-text">
                Join our Inner Circle of Connoisseurs
              </h3>
              <p className="text-sm text-text-muted font-light mt-2 leading-relaxed">
                Receive private previews of rare handloom drops, bridal trunk show invitations, and complimentary bespoke styling.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3.5 rounded-full text-sm font-medium">
                  <CheckCircle2 size={18} />
                  <span>Welcome to the Atelier. A welcome gift code has been sent.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full sm:w-[460px]">
                  <div className="relative flex-1">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-full text-sm focus:outline-none focus:border-accent text-text transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-7 py-3 bg-primary text-background hover:bg-accent hover:text-white rounded-full text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    <span>Subscribe</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Footer Links & Information Grid */}
      <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 mb-12">
          
          {/* Col 1: Brand & Heritage (4 cols) */}
          <div className="lg:col-span-4 pr-0 lg:pr-8">
            <Link to="/" className="text-3xl font-serif tracking-[0.16em] uppercase block mb-4">
              ANVIKA
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-6 font-light">
              Celebrating centuries of Indian handloom heritage through contemporary luxury. Each piece is crafted by master artisans across Varanasi, Kanchipuram, Chanderi, and Paithan, honoring time-honored weaving traditions.
            </p>

            <div className="space-y-3 text-xs text-text-muted">
              <div className="flex items-center gap-3">
                <MapPin size={15} className="text-accent flex-shrink-0" />
                <span>Flagship Atelier: 14 Heritage Square, Kala Ghoda, Mumbai 400001</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={15} className="text-accent flex-shrink-0" />
                <span>Concierge & WhatsApp: +91 98200 12345 (Mon - Sat, 10 AM - 7 PM IST)</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={15} className="text-accent flex-shrink-0" />
                <span>Private Styling Appointments available online & in-boutique</span>
              </div>
            </div>
          </div>
          
          {/* Col 2: The Collections (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif text-base tracking-wider uppercase mb-5 text-text border-b border-border/60 pb-2">
              Collections
            </h4>
            <ul className="space-y-3 text-sm text-text-muted font-light">
              <li><Link to="/category/sarees" className="hover:text-accent transition-colors block">Pure Banarasi Silks</Link></li>
              <li><Link to="/category/sarees" className="hover:text-accent transition-colors block">Kanjivaram Bridal Sarees</Link></li>
              <li><Link to="/category/sarees" className="hover:text-accent transition-colors block">Tissue & Organza Drapes</Link></li>
              <li><Link to="/category/women" className="hover:text-accent transition-colors block">Artisanal Kurtas & Sets</Link></li>
              <li><Link to="/category/ethnic" className="hover:text-accent transition-colors block">Festive Lehengas</Link></li>
              <li><Link to="/category/dresses" className="hover:text-accent transition-colors block">Contemporary Dresses</Link></li>
              <li><Link to="/category/kids" className="hover:text-accent transition-colors block">Baby & Kids Heirloom</Link></li>
              <li><Link to="/shop?filter=new" className="hover:text-accent transition-colors block text-accent font-normal">New Season Arrivals &rarr;</Link></li>
            </ul>
          </div>
          
          {/* Col 3: Bespoke Services & Craft (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif text-base tracking-wider uppercase mb-5 text-text border-b border-border/60 pb-2">
              Bespoke & Craft
            </h4>
            <ul className="space-y-3 text-sm text-text-muted font-light">
              <li><Link to="/about" className="hover:text-accent transition-colors block">The Weaving Clusters</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-colors block">Master Weaver Stories</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors block">Custom Blouse Stitching</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors block">Virtual Saree Styling</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors block">Silk Mark Authentication</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors block">Silk Care & Preservation</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-colors block">Sustainable Handloom</Link></li>
            </ul>
          </div>

          {/* Col 4: Client Concierge (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif text-base tracking-wider uppercase mb-5 text-text border-b border-border/60 pb-2">
              Client Care
            </h4>
            <ul className="space-y-3 text-sm text-text-muted font-light">
              <li><Link to="/contact" className="hover:text-accent transition-colors block">Track Your Order</Link></li>
              <li><Link to="/shipping" className="hover:text-accent transition-colors block">Shipping & Delivery Rates</Link></li>
              <li><Link to="/returns" className="hover:text-accent transition-colors block">Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors block">Size & Measurement Chart</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors block">Bespoke Bridal Inquiries</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors block">Gift Cards & Packaging</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors block">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Col 5: Flagship Boutiques (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-serif text-base tracking-wider uppercase mb-5 text-text border-b border-border/60 pb-2">
              Boutiques
            </h4>
            <div className="space-y-4 text-xs text-text-muted font-light">
              <div>
                <p className="font-medium text-text">Mumbai Flagship</p>
                <p className="text-[11px] mt-0.5">Kala Ghoda, Fort</p>
              </div>
              <div>
                <p className="font-medium text-text">New Delhi</p>
                <p className="text-[11px] mt-0.5">The Qutub Boulevard, Mehrauli</p>
              </div>
              <div>
                <p className="font-medium text-text">Bengaluru</p>
                <p className="text-[11px] mt-0.5">100ft Road, Indiranagar</p>
              </div>
              <div>
                <p className="font-medium text-text">Hyderabad</p>
                <p className="text-[11px] mt-0.5">Road No. 36, Jubilee Hills</p>
              </div>
            </div>
          </div>

        </div>

        {/* 4. Bottom Legal & Payment Security Strip */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-text-muted font-light">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <p>&copy; {new Date().getFullYear()} ANVIKA Luxury Handlooms Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
              <span>&bull;</span>
              <Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
              <span>&bull;</span>
              <Link to="/shipping" className="hover:text-accent transition-colors">Shipping Policy</Link>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <span className="text-[11px] uppercase tracking-widest text-text-muted">Follow</span>
            <SocialMediaBar 
              size={16} 
              className="flex items-center gap-2.5" 
              itemClassName="text-text-muted hover:text-accent transition-colors bg-background p-2 rounded-full border border-border/80 hover:border-accent/50 shadow-sm" 
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
