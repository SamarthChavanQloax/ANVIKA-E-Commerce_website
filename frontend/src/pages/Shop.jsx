import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X, RefreshCw } from 'lucide-react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/common/Button';
import { FadeIn, RevealOnScroll } from '../components/animations/RevealOnScroll';
import { products as allProducts } from '../data/products';

const CATEGORIES = [
  { id: 'all', label: 'All Pieces' },
  { id: 'sarees', label: 'Sarees', match: ['Sarees'] },
  { id: 'women', label: "Women's Wear", match: ['Women', "Women's Wear"] },
  { id: 'dresses', label: 'Dresses', match: ['Dresses'] },
  { id: 'ethnic', label: 'Ethnic Wear', match: ['Ethnic Wear'] },
  { id: 'kids', label: 'Baby & Kids', match: ['Baby & Kids'] },
];

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'rating', label: 'Customer Rating' },
];

const Shop = () => {
  const { categoryName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const searchParam = searchParams.get('search');

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Sync category from URL
  useEffect(() => {
    if (categoryName) {
      const matched = CATEGORIES.find(c => c.id === categoryName.toLowerCase());
      if (matched && matched.id !== 'all') {
        setSelectedCategories([matched.id]);
      } else {
        setSelectedCategories([]);
      }
    } else {
      setSelectedCategories([]);
    }
  }, [categoryName]);

  const toggleCategory = (catId) => {
    if (catId === 'all') {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(c => c !== catId)
        : [...prev, catId]
    );
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
    if (searchParam) {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      // Search filter
      if (searchParam) {
        const query = searchParam.toLowerCase();
        const matchesSearch = 
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.fabric?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // New arrivals filter
      if (filterParam === 'new' && !p.isNew) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        const matchingCategoryDefs = CATEGORIES.filter(c => selectedCategories.includes(c.id));
        const matchedLabels = matchingCategoryDefs.flatMap(c => c.match || [c.label]);
        const matchesCategory = matchedLabels.some(label => 
          p.category.toLowerCase().includes(label.toLowerCase())
        );
        if (!matchesCategory) return false;
      }

      // Price filter
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0; // featured default
    });
  }, [selectedCategories, minPrice, maxPrice, sortBy, searchParam, filterParam]);

  const activeSortLabel = SORT_OPTIONS.find(s => s.id === sortBy)?.label || 'Featured';
  const hasActiveFilters = selectedCategories.length > 0 || minPrice !== '' || maxPrice !== '' || !!searchParam;

  return (
    <div className="w-full pt-8 pb-24 bg-background">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <FadeIn>
          <div className="text-xs text-text-muted mb-3 uppercase tracking-widest flex items-center gap-2">
            <Link to="/" className="hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <span className="text-text font-medium">Shop</span>
            {categoryName && (
              <>
                <span>/</span>
                <span className="capitalize text-accent font-medium">{categoryName}</span>
              </>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif text-text mb-4 font-light tracking-wide">
            {categoryName ? `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Collection` : 'Shop the Collection'}
          </h1>
          <p className="text-text-muted max-w-2xl text-sm font-light leading-relaxed">
            Explore our thoughtfully curated collection of timeless Indian sarees, anarkalis, and occasion wear. Each piece is hand-crafted with intention.
          </p>

          {searchParam && (
            <div className="mt-4 inline-flex items-center gap-2 bg-surface px-4 py-1.5 rounded-full text-xs text-text border border-border">
              <span>Search results for: <strong>&ldquo;{searchParam}&rdquo;</strong></span>
              <button onClick={() => { searchParams.delete('search'); setSearchParams(searchParams); }} className="p-0.5 hover:text-accent">
                <X size={14} />
              </button>
            </div>
          )}
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-32 space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-serif text-2xl text-text font-light">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-accent hover:underline font-medium flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Clear all
                </button>
              )}
            </div>
            
            {/* Categories */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-text mb-4">Categories</h4>
              <div className="flex flex-col gap-3 text-sm text-text-muted">
                {CATEGORIES.map(cat => (
                  <label 
                    key={cat.id} 
                    className="flex items-center gap-3 cursor-pointer hover:text-text transition-colors"
                  >
                    <input 
                      type="checkbox"
                      checked={cat.id === 'all' ? selectedCategories.length === 0 : selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="accent-accent w-4 h-4 rounded" 
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-text mb-4">Price Range (₹)</h4>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-border bg-surface rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-accent" 
                />
                <span className="text-text-muted text-xs">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-border bg-surface rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-accent" 
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-grow">
          {/* Controls Bar: Mobile Filter Toggle & Sort */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border relative">
            <button 
              className="lg:hidden flex items-center gap-2 text-text text-sm font-medium border border-border px-4 py-2 rounded-xl"
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal size={16} /> Filters {hasActiveFilters && '(Active)'}
            </button>

            <div className="text-text-muted text-xs">
              Showing <span className="font-semibold text-text">{filteredProducts.length}</span> piece{filteredProducts.length !== 1 ? 's' : ''}
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2 text-xs font-medium text-text bg-surface px-4 py-2 rounded-xl border border-border hover:border-accent/50 transition-colors"
              >
                <span>Sort by: <strong>{activeSortLabel}</strong></span>
                <ChevronDown size={14} className={`text-text-muted transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isSortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-2xl shadow-xl z-20 py-2"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                          sortBy === opt.id ? 'text-accent font-semibold bg-surface' : 'text-text hover:bg-surface/50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-[11px] text-text-muted uppercase tracking-wider">Active:</span>
              {selectedCategories.map(catId => {
                const label = CATEGORIES.find(c => c.id === catId)?.label;
                return (
                  <span 
                    key={catId}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-xs text-text"
                  >
                    {label}
                    <button onClick={() => toggleCategory(catId)} className="hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-full text-xs text-text">
                  ₹{minPrice || 0} - ₹{maxPrice || 'Any'}
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              )}
              <button onClick={handleClearAll} className="text-xs text-accent hover:underline ml-2">
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center">
              <h3 className="font-serif text-3xl text-text font-light mb-3">No matching pieces</h3>
              <p className="text-text-muted text-sm max-w-sm mx-auto mb-6">
                We couldn&apos;t find any items matching your selected criteria. Try adjusting your filters.
              </p>
              <Button onClick={handleClearAll} variant="outline" className="text-xs tracking-widest uppercase">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {filteredProducts.map((product, idx) => (
                <RevealOnScroll key={product._id} delay={(idx % 4) * 0.08}>
                  <ProductCard product={product} />
                </RevealOnScroll>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-background z-50 p-6 shadow-2xl flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <h3 className="font-serif text-2xl text-text font-light">Filters</h3>
                <button onClick={() => setIsFilterOpen(false)} className="text-text-muted hover:text-text">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto space-y-8">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-text mb-4">Categories</h4>
                  <div className="flex flex-col gap-3 text-sm text-text-muted">
                    {CATEGORIES.map(cat => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={cat.id === 'all' ? selectedCategories.length === 0 : selectedCategories.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="accent-accent w-4 h-4 rounded" 
                        />
                        <span>{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-text mb-4">Price Range</h4>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full border border-border bg-surface rounded-xl px-3 py-2 text-xs text-text focus:outline-none" 
                    />
                    <span className="text-text-muted">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full border border-border bg-surface rounded-xl px-3 py-2 text-xs text-text focus:outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border mt-auto flex gap-3">
                <Button variant="outline" className="w-full text-xs uppercase" onClick={handleClearAll}>
                  Reset
                </Button>
                <Button className="w-full text-xs uppercase bg-primary text-background" onClick={() => setIsFilterOpen(false)}>
                  Apply
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
