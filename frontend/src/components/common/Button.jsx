import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { forwardRef } from 'react';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  isLoading, 
  disabled, 
  ...props 
}, ref) => {
  // Softer rounded corners (rounded-full for a more elegant, feminine look)
  // Thinner font weight (font-normal or just tracking-wide)
  const baseStyles = "inline-flex items-center justify-center cursor-pointer font-sans text-sm tracking-wide transition-colors focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed rounded-full";
  
  const variants = {
    primary: "bg-primary text-background hover:bg-opacity-90 shadow-sm",
    secondary: "bg-surface text-text hover:bg-border shadow-sm",
    outline: "border border-border text-text hover:bg-surface",
    ghost: "text-text hover:bg-surface hover:text-primary",
  };

  const sizes = {
    sm: "h-9 px-5 text-xs uppercase",
    md: "h-12 px-8 text-sm uppercase",
    lg: "h-14 px-10 text-sm uppercase",
    icon: "h-12 w-12",
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
