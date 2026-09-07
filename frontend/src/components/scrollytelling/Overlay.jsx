import { motion, useTransform } from 'framer-motion';

const Overlay = ({ smoothProgress }) => {
  // Section 1: Brand Hero (0% -> 20%)
  const opacity1 = useTransform(smoothProgress, [0, 0.08, 0.16, 0.22], [1, 1, 0.2, 0]);
  const y1 = useTransform(smoothProgress, [0, 0.22], [0, -60]);
  const scale1 = useTransform(smoothProgress, [0, 0.22], [1, 0.96]);

  // Section 2: Narrative Focus (26% -> 52%)
  const opacity2 = useTransform(smoothProgress, [0.24, 0.32, 0.44, 0.52], [0, 1, 1, 0]);
  const y2 = useTransform(smoothProgress, [0.24, 0.36, 0.44, 0.52], [40, 0, 0, -40]);

  // Section 3: Craft & Grand Finale (58% -> 88%)
  const opacity3 = useTransform(smoothProgress, [0.58, 0.68, 0.80, 0.90], [0, 1, 1, 0]);
  const y3 = useTransform(smoothProgress, [0.58, 0.70, 0.80, 0.90], [40, 0, 0, -40]);

  // Scroll indicator hint (fades quickly on scroll)
  const indicatorOpacity = useTransform(smoothProgress, [0, 0.05], [1, 0]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 font-sans text-white">

      {/* Section 1 - Intro Title */}
      <motion.div
        style={{ opacity: opacity1, y: y1, scale: scale1 }}
        className="fixed inset-0 flex flex-col items-center justify-center text-center px-6 select-none"
      >
        <span className="text-xs uppercase tracking-[0.35em] text-gold-300 font-medium mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Artisanal Heritage Drapes
        </span>
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-light tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          Anvika
        </h1>
        <p className="text-base sm:text-lg md:text-xl mt-4 tracking-[0.25em] uppercase font-light text-white/90 max-w-md drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          Pure Silk &bull; Handwoven Grace
        </p>

        {/* Scroll helper */}
        <motion.div 
          style={{ opacity: indicatorOpacity }}
          className="absolute bottom-12 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/70 drop-shadow-md">Scroll to Explore</span>
          <div className="w-5 h-8 border border-white/40 rounded-full flex justify-center pt-1.5 drop-shadow-md">
            <div className="w-1 h-2 bg-gold-400 rounded-full animate-bounce" />
          </div>
        </motion.div>
      </motion.div>

      {/* Section 2 - Narrative Left */}
      <motion.div
        style={{ opacity: opacity2, y: y2 }}
        className="fixed inset-0 flex flex-col items-start justify-center px-8 sm:px-16 md:px-24 select-none"
      >
        <div className="max-w-xl">
          <span className="text-xs uppercase tracking-[0.35em] text-gold-400 font-semibold block mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            The Weave
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-light leading-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            Drape your <br />
            <span className="italic font-serif text-gold-300">timeless elegance.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/90 leading-relaxed font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            Every thread spun with pure Banarasi zari, crafted by master weavers over hundreds of meticulous hours.
          </p>
        </div>
      </motion.div>

      {/* Section 3 - Craft Right */}
      <motion.div
        style={{ opacity: opacity3, y: y3 }}
        className="fixed inset-0 flex flex-col items-end justify-center px-8 sm:px-16 md:px-24 text-right select-none"
      >
        <div className="max-w-xl flex flex-col items-end">
          <span className="text-xs uppercase tracking-[0.35em] text-gold-400 font-semibold block mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            The Legacy
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-light leading-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            Made to drape. <br />
            <span className="italic font-serif text-gold-300">Made to remember.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/90 leading-relaxed font-light max-w-md drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            A celebration of royal silhouettes, designed for momentous occasions and celebrations.
          </p>
        </div>
      </motion.div>

    </div>
  );
};

export default Overlay;
