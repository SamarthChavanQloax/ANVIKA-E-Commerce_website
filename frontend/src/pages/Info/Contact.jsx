import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { FadeIn, RevealOnScroll } from '../../components/animations/RevealOnScroll';
import { WhatsAppIcon } from '../../components/common/SocialIcons';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    }, 1200);
  };

  return (
    <div className="w-full pt-8 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-accent font-medium block mb-3">
              Concierge & Client Care
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text font-light tracking-wide mb-6">
              Connect With Anvika
            </h1>
            <p className="text-text-muted text-sm sm:text-base font-light leading-relaxed">
              Whether you require bespoke bridal styling, bespoke blouse customisation, or guidance on our handwoven weaves, our atelier stylists are here to assist you.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Contact Details & Flagship Ateliers */}
          <div className="lg:col-span-5 space-y-8">
            <RevealOnScroll>
              <div className="bg-surface/50 border border-border/80 rounded-3xl p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-serif text-text font-light mb-4">Direct Styling Desk</h3>
                  <div className="space-y-4 text-sm text-text-muted">
                    <a href="mailto:care@anvika.com" className="flex items-center gap-3.5 hover:text-accent transition-colors">
                      <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-accent border border-border flex-shrink-0">
                        <Mail size={18} />
                      </div>
                      <div>
                        <span className="block text-xs text-text-muted/70 uppercase tracking-wider">Email Us</span>
                        <span className="text-text font-medium">care@anvika.com</span>
                      </div>
                    </a>

                    <a href="tel:+919876543210" className="flex items-center gap-3.5 hover:text-accent transition-colors">
                      <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-accent border border-border flex-shrink-0">
                        <Phone size={18} />
                      </div>
                      <div>
                        <span className="block text-xs text-text-muted/70 uppercase tracking-wider">Client Support</span>
                        <span className="text-text font-medium">+91 (0) 98765 43210</span>
                      </div>
                    </a>

                    <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3.5 hover:text-emerald-500 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 flex-shrink-0">
                        <WhatsAppIcon size={18} />
                      </div>
                      <div>
                        <span className="block text-xs text-text-muted/70 uppercase tracking-wider">WhatsApp Concierge</span>
                        <span className="text-text font-medium">+91 98765 43210 (10 AM - 8 PM IST)</span>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-6">
                  <h4 className="text-xs uppercase tracking-[0.25em] text-text font-semibold mb-4">Flagship Atelier Locations</h4>
                  <div className="space-y-4 text-xs text-text-muted leading-relaxed">
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-text font-medium block">New Delhi Atelier:</strong>
                        14, Mehrauli Heritage Quarter, Kalka Das Marg, New Delhi 110030
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-text font-medium block">Mumbai Experience Suite:</strong>
                        Galleria Luxe, Kala Ghoda, Fort, Mumbai 400001
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock size={16} className="text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-text font-medium block">Opening Hours:</strong>
                        Monday – Saturday: 10:30 AM – 7:30 PM IST (Sundays by private appointment)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <RevealOnScroll delay={0.1}>
              <div className="bg-surface/30 border border-border/80 rounded-3xl p-8 sm:p-10 shadow-sm">
                <h3 className="text-2xl font-serif text-text font-light mb-2">Send an Inquiry</h3>
                <p className="text-text-muted text-xs sm:text-sm font-light mb-8 leading-relaxed">
                  Our dedicated stylists review all queries and respond within 24 business hours.
                </p>

                {submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mx-auto mb-4">
                      <CheckCircle2 size={36} />
                    </div>
                    <h4 className="text-2xl font-serif text-text mb-2">Message Received</h4>
                    <p className="text-text-muted text-sm max-w-sm mx-auto mb-6">
                      Thank you for contacting Anvika. A bespoke stylist will reach out to you shortly.
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="outline" className="text-xs uppercase tracking-widest">
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-text font-medium mb-2">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Radhika Sharma"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-text font-medium mb-2">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="radhika@example.com"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-text font-medium mb-2">Contact Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-text font-medium mb-2">Subject</label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text focus:outline-none focus:border-accent transition-colors"
                        >
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Bridal Appointment">Bespoke Bridal Appointment</option>
                          <option value="Custom Blouse Stitching">Custom Saree Blouse Stitching</option>
                          <option value="Order & Tracking">Order & Shipping Status</option>
                          <option value="Exchanges & Returns">Exchange or Return Assistance</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-text font-medium mb-2">Your Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us how we may assist you with your wardrobe or event..."
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text focus:outline-none focus:border-accent transition-colors resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-primary text-background uppercase tracking-widest text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-95"
                    >
                      {isSubmitting ? (
                        <span className="animate-pulse">Transmitting Message...</span>
                      ) : (
                        <>
                          <Send size={15} /> TRANSMIT INQUIRY
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </RevealOnScroll>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
