import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowRightLeft } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import Button from '../common/Button';

const CompareWidget = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border shadow-[0_-10px_30px_rgba(0,0,0,0.1)] p-4 md:p-6"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {compareItems.map((item) => (
              <div key={item._id || item.id} className="relative w-14 h-18 sm:w-16 sm:h-20 md:w-20 md:h-24 rounded-lg overflow-hidden border border-border flex-shrink-0 group">
                <img 
                  src={(item.images && item.images.length > 0) ? item.images[0] : (item.image || '/demo-saree.jpg')} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromCompare(item._id || item.id)}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 sm:p-0.5 hover:bg-red-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-sm"
                  aria-label="Remove item"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {/* Placeholders for remaining slots */}
            {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className="w-14 h-18 sm:w-16 sm:h-20 md:w-20 md:h-24 rounded-lg border border-dashed border-border flex items-center justify-center flex-shrink-0 bg-background/50">
                <span className="text-text-muted text-[10px] sm:text-xs">Add</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text">{compareItems.length} / 4</span>
              <button 
                onClick={clearCompare}
                className="text-xs text-red-500 hover:text-red-600 underline underline-offset-2"
              >
                Clear
              </button>
            </div>
            <Link to="/compare" className="flex-grow md:flex-grow-0">
              <Button className="w-full md:w-auto bg-primary text-background flex items-center justify-center gap-2 px-6">
                <ArrowRightLeft size={16} />
                COMPARE
              </Button>
            </Link>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompareWidget;
