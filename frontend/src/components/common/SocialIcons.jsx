import { motion } from 'framer-motion';

export const InstagramIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const FacebookIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const PinterestIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0a12 12 0 0 0-4.37 23.18c-.05-.98-.09-2.5.02-3.58.1-.98.66-6.42.66-6.42s-.17-.34-.17-.84c0-.79.46-1.38 1.03-1.38.48 0 .72.36.72.8 0 .49-.31 1.22-.48 1.9-.14.56.28 1.02.83 1.02 1 0 1.77-1.06 1.77-2.58 0-1.35-.97-2.3-2.36-2.3-1.6 0-2.55 1.2-2.55 2.45 0 .49.19 1 .42 1.29.05.06.05.11.04.17-.04.17-.13.54-.15.62-.03.11-.1.15-.22.1-.8-.37-1.3-1.54-1.3-2.48 0-2.02 1.47-3.87 4.23-3.87 2.22 0 3.95 1.58 3.95 3.7 0 2.2-1.39 3.98-3.32 3.98-.65 0-1.26-.34-1.47-.74l-.4 1.53c-.15.56-.54 1.26-.81 1.7A12 12 0 1 0 12 0z"/>
  </svg>
);

export const YoutubeIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
  </svg>
);

export const WhatsAppIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const SOCIAL_LINKS = [
  { name: 'Instagram', icon: InstagramIcon, url: 'https://instagram.com/anvikaboutique', label: 'Follow on Instagram' },
  { name: 'Facebook', icon: FacebookIcon, url: 'https://facebook.com/anvikaboutique', label: 'Follow on Facebook' },
  { name: 'Pinterest', icon: PinterestIcon, url: 'https://pinterest.com/anvikaboutique', label: 'Explore on Pinterest' },
  { name: 'YouTube', icon: YoutubeIcon, url: 'https://youtube.com/@anvikaboutique', label: 'Watch on YouTube' },
  { name: 'WhatsApp', icon: WhatsAppIcon, url: 'https://wa.me/919876543210', label: 'Chat on WhatsApp' },
];

export const SocialMediaBar = ({ size = 15, className = "flex items-center gap-3.5", itemClassName = "text-white/80 hover:text-accent transition-colors" }) => {
  return (
    <div className={className}>
      {SOCIAL_LINKS.map((item) => {
        const Icon = item.icon;
        return (
          <motion.a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            whileHover={{ scale: 1.25 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 450, damping: 17 }}
            className={`inline-flex items-center justify-center p-1 rounded-full ${itemClassName}`}
          >
            <Icon size={size} />
          </motion.a>
        );
      })}
    </div>
  );
};
