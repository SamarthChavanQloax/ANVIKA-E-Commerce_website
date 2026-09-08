import { RevealOnScroll } from '../animations/RevealOnScroll';
import Button from '../common/Button';

const Newsletter = () => {
  return (
    <section className="section-space px-4 sm:px-6 bg-primary text-background flex justify-center text-center">
      <RevealOnScroll className="max-w-2xl w-full">
        <span className="text-accent text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-4 block font-medium">
          BE THE FIRST TO KNOW
        </span>
        <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide mb-4">
          Join the Anvika Society
        </h2>
        <p className="text-background/80 font-light text-base tracking-wide mb-8 max-w-lg mx-auto">
          New collections, exclusive edits, and stories from our world, delivered straight to your inbox.
        </p>
        
        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Email Address" 
            className="flex-1 bg-transparent border-b border-background/30 text-background px-4 py-3 focus:outline-none focus:border-background transition-colors placeholder:text-background/50 font-light tracking-wide text-center sm:text-left"
            required
          />
          <Button type="submit" className="bg-background text-primary hover:bg-background/90 rounded-full px-8 shrink-0">
            SUBSCRIBE
          </Button>
        </form>
      </RevealOnScroll>
    </section>
  );
};

export default Newsletter;
