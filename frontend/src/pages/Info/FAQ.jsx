import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { FadeIn, RevealOnScroll } from '../../components/animations/RevealOnScroll';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const FAQ_DATA = [
  {
    category: 'Orders & Payments',
    questions: [
      {
        q: 'What payment methods does Anvika accept?',
        a: 'We accept all major credit and debit cards (Visa, MasterCard, American Express), UPI (Google Pay, PhonePe, Paytm), Net Banking across 50+ Indian banks, and Cash on Delivery (COD) for orders up to ₹25,000 within India.'
      },
      {
        q: 'Can I pay in international currencies?',
        a: 'Yes, our international gateway seamlessly processes USD, GBP, EUR, CAD, AED, and SGD. Currency conversion is calculated automatically at real-time bank exchange rates at checkout.'
      },
      {
        q: 'How can I check the status of my order?',
        a: 'Once your order is dispatched, you will receive an automated tracking link via SMS and email. You can also contact our concierge desk at care@anvika.com with your Order ID for real-time concierge updates.'
      }
    ]
  },
  {
    category: 'Sarees, Silks & Authenticity',
    questions: [
      {
        q: 'Are all your sarees certified with genuine Silk Mark?',
        a: 'Yes, 100% of our silk sarees (including Katan Banarasi, Chanderi, Kanchipuram, and Tussar) bear government-authorized Silk Mark tags verifying genuine mulberry and natural silk fibers without synthetic adulteration.'
      },
      {
        q: 'Do sarees come with an unstitched blouse piece?',
        a: 'Yes, all our sarees include a matching 80cm to 100cm running or contrast unstitched designer blouse piece attached to the inner drape.'
      },
      {
        q: 'Do you provide Fall and Pico stitching?',
        a: 'Complimentary fall and edge pico finishing can be provided upon request before dispatch. Simply indicate your preference in the order notes or notify our concierge immediately after placing your order.'
      }
    ]
  },
  {
    category: 'Sizing & Blouse Stitching',
    questions: [
      {
        q: 'How does custom blouse stitching work?',
        a: 'After selecting custom blouse stitching, our master tailor team will send you a digital measurement guide via WhatsApp or email. You can submit your exact measurements, and our artisan tailors will craft the blouse to your specifications.'
      },
      {
        q: 'What if the blouse does not fit perfectly?',
        a: 'We provide complimentary alterations on all custom-stitched garments. If adjustments are required, our courier will pick up the piece from your doorstep and our master tailors will alter it free of charge.'
      }
    ]
  },
  {
    category: 'Shipping & Exchanges',
    questions: [
      {
        q: 'How long does domestic shipping take?',
        a: 'Ready-to-ship orders are dispatched within 24 to 48 hours. Metro deliveries arrive in 2-3 business days, while other Indian cities typically take 3-5 business days.'
      },
      {
        q: 'Do you accept returns?',
        a: 'We offer a 7-day hassle-free doorstep exchange or return policy for all standard unworn pieces with tags intact. Please visit our Returns & Exchanges page for instructions.'
      }
    ]
  }
];

const FAQ = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}_${questionIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const categories = ['All', ...FAQ_DATA.map(f => f.category)];

  const displayedSections = activeTab === 'All'
    ? FAQ_DATA
    : FAQ_DATA.filter(f => f.category === activeTab);

  return (
    <div className="w-full page-shell bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto page-heading">
            <span className="text-xs uppercase tracking-[0.3em] text-accent font-medium block mb-3">
              Help Center & Advice
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-text font-light tracking-wide mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-text-muted text-sm sm:text-base font-light leading-relaxed">
              Find answers regarding our handloom sourcing, sizing, international delivery, and atelier services.
            </p>
          </div>
        </FadeIn>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-6 mb-12 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all whitespace-nowrap ${
                activeTab === cat
                  ? 'bg-primary text-background shadow-md'
                  : 'bg-surface hover:bg-surface/80 text-text border border-border/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-12">
          {displayedSections.map((section, catIdx) => (
            <div key={section.category} className="space-y-4">
              <h2 className="text-xl font-serif text-text font-medium pb-2 border-b border-border">
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.questions.map((item, qIdx) => {
                  const key = `${catIdx}_${qIdx}`;
                  const isOpen = openItems[key];

                  return (
                    <div
                      key={item.q}
                      className="border border-border/80 rounded-2xl overflow-hidden bg-surface/30 transition-colors hover:border-accent/40"
                    >
                      <button
                        onClick={() => toggleItem(catIdx, qIdx)}
                        className="flex items-center justify-between w-full p-5 text-left text-sm font-medium text-text"
                      >
                        <span className="pr-4">{item.q}</span>
                        <ChevronDown
                          size={18}
                          className={`text-accent flex-shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-5 pb-5 text-xs sm:text-sm text-text-muted leading-relaxed font-light border-t border-border/40 pt-3"
                          >
                            {item.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions? */}
        <div className="mt-16 text-center p-10 bg-surface/50 rounded-3xl border border-border/80">
          <HelpCircle size={32} className="text-accent mx-auto mb-3" />
          <h3 className="text-2xl font-serif text-text font-light mb-2">Still need guidance?</h3>
          <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto mb-6">
            Our atelier specialists are available 6 days a week to answer fabric, styling, and order questions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button className="text-xs uppercase tracking-widest px-8 bg-primary text-background">
                Contact Concierge
              </Button>
            </Link>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="text-xs uppercase tracking-widest px-8">
                WhatsApp Chat
              </Button>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FAQ;
