import { useEffect, useRef, useState, useCallback } from 'react';
import { useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import Overlay from './Overlay';

const FRAME_COUNT = 150;

const ScrollyCanvas = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastRenderedIndexRef = useRef(-1);

  // Preload images with progress tracking
  useEffect(() => {
    const loadedImages = [];
    let count = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const frameNum = i.toString().padStart(3, '0');
      img.src = `/indiansarii/ezgif-frame-${frameNum}.png`;

      img.onload = () => {
        count++;
        setLoadedCount(count);
        if (count === FRAME_COUNT) {
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        count++;
        setLoadedCount(count);
        if (count === FRAME_COUNT) {
          setIsLoaded(true);
        }
      };

      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Raw scroll progress tied directly to the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Spring physics for buttery smooth inertial scrolling
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 32,
    stiffness: 220,
    mass: 0.2,
    restDelta: 0.0001
  });

  const frameIndex = useTransform(smoothProgress, [0, 1], [0, FRAME_COUNT - 1]);

  // High-performance canvas drawing helper with object-fit cover & DPR support
  const drawFrame = useCallback((targetIndex) => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;

    const clampedIndex = Math.min(Math.max(Math.round(targetIndex), 0), FRAME_COUNT - 1);
    const img = images[clampedIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    // Ensure canvas internal pixel buffer matches DPR
    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Object fit cover calculations in CSS pixel space
    const hRatio = displayWidth / img.naturalWidth;
    const vRatio = displayHeight / img.naturalHeight;
    const ratio = Math.max(hRatio, vRatio);
    const renderWidth = img.naturalWidth * ratio;
    const renderHeight = img.naturalHeight * ratio;
    const centerShiftX = (displayWidth - renderWidth) / 2;
    const centerShiftY = (displayHeight - renderHeight) / 2;

    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    ctx.drawImage(img, centerShiftX, centerShiftY, renderWidth, renderHeight);
    ctx.restore();

    lastRenderedIndexRef.current = clampedIndex;
  }, [images]);

  // Render on spring frame change
  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (!isLoaded) return;
    const nextIdx = Math.round(latest);
    if (nextIdx !== lastRenderedIndexRef.current) {
      requestAnimationFrame(() => drawFrame(latest));
    }
  });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        lastRenderedIndexRef.current = -1; // force redraw
        drawFrame(frameIndex.get());
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame, frameIndex]);

  // Initial draw once loaded
  useEffect(() => {
    if (isLoaded && canvasRef.current && images[0]) {
      drawFrame(frameIndex.get());
    }
  }, [isLoaded, images, drawFrame, frameIndex]);

  const loadPercent = Math.min(Math.round((loadedCount / FRAME_COUNT) * 100), 100);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full" 
      style={{ height: '700vh', backgroundColor: '#121212' }}
    >
      {/* Smooth Loading Indicator */}
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#121212] text-white">
          <div className="w-12 h-12 border-2 border-white/20 border-t-gold-400 rounded-full animate-spin mb-4"></div>
          <p className="font-serif tracking-widest text-xs text-gold-400 uppercase">Loading Experience</p>
          <div className="w-36 h-[2px] bg-white/10 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gold-400 to-amber-200 transition-all duration-150" 
              style={{ width: `${loadPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-white/40 mt-1">{loadPercent}%</span>
        </div>
      )}

      {/* Sticky Canvas & Smooth Sync Overlay */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="w-full h-full block"
          style={{ willChange: 'transform' }}
        />
        <Overlay smoothProgress={smoothProgress} />
      </div>
    </div>
  );
};

export default ScrollyCanvas;
