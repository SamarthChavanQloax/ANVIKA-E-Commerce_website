import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const Compare = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToCart, openCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product, 1, product.sizes?.[0] || 'Free Size');
    openCart();
  };

  if (compareItems.length === 0) {
    return (
      <div className="w-full pt-16 pb-24 bg-background min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif text-text font-light mb-4">Compare Products</h1>
        <p className="text-text-muted mb-8 text-center max-w-md">
          Your comparison list is empty. Add up to 4 products to see them side-by-side.
        </p>
        <Link to="/shop">
          <Button className="bg-primary text-background px-8">CONTINUE SHOPPING</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full page-shell bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <nav aria-label="Breadcrumb" className="text-xs text-text-muted mb-2 uppercase tracking-widest flex items-center gap-2 flex-wrap">
              <Link to="/" className="hover:text-text transition-colors">Home</Link>
              <span>/</span>
              <span className="text-text font-medium">Compare</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-serif text-text font-light">Compare Products</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={clearCompare}
              className="text-xs text-red-500 hover:text-red-600 font-medium tracking-wider uppercase underline underline-offset-4"
            >
              Clear All
            </button>
            <Link to="/shop">
              <Button variant="outline" className="text-xs py-2">Add More</Button>
            </Link>
          </div>
        </div>

        {/* Comparison Table wrapper for horizontal scroll on mobile */}
        <div className="overflow-x-auto pb-8 hide-scrollbar">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="w-48 p-4 text-left border-b border-border bg-surface/30 align-top">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Product</span>
                </th>
                {compareItems.map((item) => (
                  <th key={item._id || item.id} className="w-64 p-4 border-b border-border text-center align-top relative group">
                    <button
                      onClick={() => removeFromCompare(item._id || item.id)}
                      className="absolute top-4 right-4 p-2 bg-surface hover:bg-red-50 text-text-muted hover:text-red-500 rounded-full transition-colors z-10"
                      aria-label="Remove from compare"
                    >
                      <Trash2 size={16} />
                    </button>
                    <Link to={`/product/${item._id || item.slug || item.id}`} className="block">
                      <div className="aspect-[3/4] w-full rounded-xl overflow-hidden mb-4 bg-surface border border-border">
                        <img 
                          src={(item.images && item.images.length > 0) ? item.images[0] : (item.image || '/demo-saree.jpg')} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="font-serif text-lg text-text font-medium leading-tight mb-2 hover:text-accent transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-accent font-semibold text-lg">
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>
                    </Link>
                    <Button 
                      onClick={() => handleAddToCart(item)}
                      className="w-full mt-4 bg-primary text-background text-xs py-2.5 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} /> Add to Bag
                    </Button>
                  </th>
                ))}
                {/* Empty slots placeholders */}
                {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                  <th key={`empty-${idx}`} className="w-64 p-4 border-b border-border align-top">
                    <div className="aspect-[3/4] w-full rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-text-muted mb-4 bg-surface/10">
                      <span className="text-4xl font-light mb-2">+</span>
                      <span className="text-xs uppercase tracking-wider">Add Item</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {/* Category */}
              <tr>
                <td className="p-4 border-b border-border bg-surface/30 font-medium text-xs uppercase tracking-wider text-text-muted">Category</td>
                {compareItems.map(item => (
                  <td key={item._id || item.id} className="p-4 border-b border-border text-center text-text">{item.category}</td>
                ))}
                {Array.from({ length: 4 - compareItems.length }).map((_, idx) => <td key={`empty-cat-${idx}`} className="p-4 border-b border-border"></td>)}
              </tr>
              
              {/* Fabric */}
              <tr>
                <td className="p-4 border-b border-border bg-surface/30 font-medium text-xs uppercase tracking-wider text-text-muted">Fabric</td>
                {compareItems.map(item => (
                  <td key={item._id || item.id} className="p-4 border-b border-border text-center text-text">{item.fabric || '100% Pure Silk'}</td>
                ))}
                {Array.from({ length: 4 - compareItems.length }).map((_, idx) => <td key={`empty-fab-${idx}`} className="p-4 border-b border-border"></td>)}
              </tr>

              {/* Sizes */}
              <tr>
                <td className="p-4 border-b border-border bg-surface/30 font-medium text-xs uppercase tracking-wider text-text-muted">Available Sizes</td>
                {compareItems.map(item => (
                  <td key={item._id || item.id} className="p-4 border-b border-border text-center text-text">
                    {item.sizes ? item.sizes.join(', ') : 'Free Size'}
                  </td>
                ))}
                {Array.from({ length: 4 - compareItems.length }).map((_, idx) => <td key={`empty-size-${idx}`} className="p-4 border-b border-border"></td>)}
              </tr>

              {/* Rating */}
              <tr>
                <td className="p-4 border-b border-border bg-surface/30 font-medium text-xs uppercase tracking-wider text-text-muted">Rating</td>
                {compareItems.map(item => (
                  <td key={item._id || item.id} className="p-4 border-b border-border text-center text-text">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-semibold">{item.rating || '4.9'}</span>
                      <span className="text-amber-500">★</span>
                      <span className="text-text-muted text-xs">({item.reviewsCount || 32})</span>
                    </div>
                  </td>
                ))}
                {Array.from({ length: 4 - compareItems.length }).map((_, idx) => <td key={`empty-rating-${idx}`} className="p-4 border-b border-border"></td>)}
              </tr>

              {/* Description summary */}
              <tr>
                <td className="p-4 border-b border-border bg-surface/30 font-medium text-xs uppercase tracking-wider text-text-muted">Description</td>
                {compareItems.map(item => (
                  <td key={item._id || item.id} className="p-4 border-b border-border text-center text-text-muted text-xs leading-relaxed max-w-[200px] mx-auto">
                    {item.description ? (item.description.length > 120 ? item.description.substring(0, 120) + '...' : item.description) : '-'}
                  </td>
                ))}
                {Array.from({ length: 4 - compareItems.length }).map((_, idx) => <td key={`empty-desc-${idx}`} className="p-4 border-b border-border"></td>)}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Compare;
