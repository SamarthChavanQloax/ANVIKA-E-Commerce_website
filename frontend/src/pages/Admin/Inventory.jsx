import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useProducts } from '../../context/ProductContext';
import {
  Boxes,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Search,
  Save,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const Inventory = () => {
  const { refreshProducts } = useProducts();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(5);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'low', 'out', 'healthy'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  // Inline editing state: { [productId]: { stock: number, variants: [...] } }
  const [stockEdits, setStockEdits] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [saveSuccessId, setSaveSuccessId] = useState(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/products?limit=100');
      const list = data.products || [];
      setProducts(list);

      // Initialize stockEdits map
      const initialEdits = {};
      list.forEach((p) => {
        initialEdits[p._id] = {
          stock: p.stock || 0,
          variants: p.variants ? p.variants.map((v) => ({ ...v })) : [],
        };
      });
      setStockEdits(initialEdits);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle Root Stock change (for products without variants)
  const handleRootStockChange = (productId, newStock) => {
    const val = Math.max(0, Number(newStock) || 0);
    setStockEdits((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        stock: val,
      },
    }));
  };

  // Handle Variant Stock change
  const handleVariantStockChange = (productId, variantIndex, newStock) => {
    const val = Math.max(0, Number(newStock) || 0);
    setStockEdits((prev) => {
      const current = prev[productId];
      const updatedVariants = [...current.variants];
      updatedVariants[variantIndex] = {
        ...updatedVariants[variantIndex],
        stock: val,
      };
      // Auto sum variants
      const total = updatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
      return {
        ...prev,
        [productId]: {
          ...current,
          variants: updatedVariants,
          stock: total,
        },
      };
    });
  };

  // Save stock changes to MongoDB
  const handleSaveStock = async (product) => {
    const editData = stockEdits[product._id];
    if (!editData) return;

    try {
      setSavingId(product._id);
      const payload = {
        stock: editData.stock,
      };
      if (editData.variants && editData.variants.length > 0) {
        payload.variants = editData.variants;
      }

      await axios.put(`/api/products/${product._id}`, payload, { withCredentials: true });
      await refreshProducts(); // Sync live customer store!

      setSaveSuccessId(product._id);
      setTimeout(() => setSaveSuccessId(null), 2500);

      // Update base products array
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, stock: editData.stock, variants: editData.variants } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock in MongoDB');
    } finally {
      setSavingId(null);
    }
  };

  // Filtered inventory list
  const filteredProducts = products.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
      if (!matches) return false;
    }

    const currentStock = stockEdits[p._id]?.stock ?? p.stock;
    if (filterMode === 'out') return currentStock <= 0;
    if (filterMode === 'low') return currentStock > 0 && currentStock <= threshold;
    if (filterMode === 'healthy') return currentStock > threshold;
    return true;
  });

  const totalCount = products.length;
  const outCount = products.filter((p) => (p.stock || 0) <= 0).length;
  const lowCount = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= threshold).length;
  const healthyCount = products.filter((p) => (p.stock || 0) > threshold).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            Inventory & Stock Control
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Real-time SKU quantities, size/color variant levels, and inline MongoDB updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Configurable Low Stock Threshold */}
          <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-xl text-xs text-stone-300">
            <Sliders size={14} className="text-amber-400" />
            <span>Low Stock Alert &le;</span>
            <input
              type="number"
              min="1"
              max="50"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value) || 1)}
              className="w-12 bg-stone-800 border border-stone-700 rounded px-1.5 py-0.5 text-center font-bold text-amber-300 focus:outline-none"
            />
          </div>

          <button
            onClick={fetchInventory}
            className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-amber-400' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Stats / Filter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => setFilterMode('all')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterMode === 'all'
              ? 'bg-stone-800 border-amber-500/50 shadow-lg shadow-amber-900/10'
              : 'bg-[#141419] border-stone-800/80 hover:border-stone-700'
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Total Catalog SKUs</p>
          <p className="text-2xl font-serif font-bold text-white mt-1">{totalCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('low')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterMode === 'low'
              ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-900/20'
              : 'bg-[#141419] border-stone-800/80 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Low Stock (&le; {threshold})</p>
            <AlertTriangle size={15} className="text-amber-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-amber-300 mt-1">{lowCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('out')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterMode === 'out'
              ? 'bg-red-500/10 border-red-500/50 shadow-lg shadow-red-900/20'
              : 'bg-[#141419] border-stone-800/80 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400">Out of Stock (0)</p>
            <XCircle size={15} className="text-red-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-red-400 mt-1">{outCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('healthy')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterMode === 'healthy'
              ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-900/20'
              : 'bg-[#141419] border-stone-800/80 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Healthy Stock</p>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-emerald-400 mt-1">{healthyCount}</p>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter inventory by title, category, or brand..."
          className="w-full pl-10 pr-4 py-3 bg-[#141419] border border-stone-800 rounded-xl text-stone-100 text-xs placeholder-stone-500 focus:outline-none focus:border-amber-500"
        />
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
      </div>

      {/* Inventory Table */}
      <div className="bg-[#141419] border border-stone-800/80 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-400">Loading Inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-stone-500 text-xs">
            No inventory records found for current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-900/70 border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Variants</th>
                  <th className="py-3.5 px-4 font-semibold">Current Stock</th>
                  <th className="py-3.5 px-4 font-semibold">Status Indicator</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Quick Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredProducts.map((prod) => {
                  const hasVariants = prod.variants && prod.variants.length > 0;
                  const currentStock = stockEdits[prod._id]?.stock ?? prod.stock;
                  const isLow = currentStock > 0 && currentStock <= threshold;
                  const isOut = currentStock <= 0;
                  const isExpanded = Boolean(expandedRows[prod._id]);
                  const isModified = currentStock !== prod.stock;

                  return (
                    <div key={prod._id} className="contents">
                      {/* Main Product Row */}
                      <tr className="hover:bg-stone-900/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image || '/demo-saree.jpg'}
                              alt={prod.name}
                              className="w-10 h-12 object-cover rounded-lg bg-stone-800 border border-stone-800 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-stone-200 truncate max-w-xs">{prod.name}</p>
                              <p className="text-[11px] text-stone-400">{prod.brand || 'Anvika Heritage'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-stone-300">
                          {prod.category}
                        </td>

                        <td className="py-3 px-4">
                          {hasVariants ? (
                            <button
                              type="button"
                              onClick={() => toggleRow(prod._id)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] text-amber-300 font-medium transition-colors"
                            >
                              <span>{prod.variants.length} variant(s)</span>
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          ) : (
                            <span className="text-stone-500 text-[11px]">Standard (No variants)</span>
                          )}
                        </td>

                        {/* Inline Stock Editor */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              disabled={hasVariants}
                              value={currentStock}
                              onChange={(e) => handleRootStockChange(prod._id, e.target.value)}
                              className="w-20 px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-500 disabled:opacity-75 disabled:bg-stone-800/40"
                            />
                            <span className="text-[11px] text-stone-400">units</span>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="py-3 px-4">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                              <XCircle size={12} />
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <AlertTriangle size={12} />
                              Low Stock Warning
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 size={12} />
                              Sufficient Stock
                            </span>
                          )}
                        </td>

                        {/* Save Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            disabled={savingId === prod._id}
                            onClick={() => handleSaveStock(prod)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              saveSuccessId === prod._id
                                ? 'bg-emerald-600 text-white'
                                : isModified
                                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20'
                                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                            }`}
                          >
                            <Save size={13} />
                            <span>
                              {savingId === prod._id
                                ? 'Saving...'
                                : saveSuccessId === prod._id
                                ? 'Saved!'
                                : 'Save'}
                            </span>
                          </button>
                        </td>
                      </tr>

                      {/* Collapsible Variants Sub-Rows */}
                      {hasVariants && isExpanded && (
                        <tr className="bg-stone-900/50">
                          <td colSpan="6" className="p-4 border-y border-stone-800">
                            <div className="bg-[#121216] rounded-xl p-4 border border-stone-800 space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-amber-400 uppercase tracking-wider text-[10px]">
                                  Variant Inventory Breakdown: {prod.name}
                                </span>
                                <span className="text-[11px] text-stone-400">
                                  Total sum automatically reflects as base stock ({currentStock} pcs)
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {stockEdits[prod._id]?.variants?.map((v, vIdx) => (
                                  <div
                                    key={vIdx}
                                    className="p-3 bg-stone-900/90 rounded-xl border border-stone-800 flex items-center justify-between gap-3"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-stone-200">
                                        Size: <span className="text-white">{v.size || 'Free'}</span>
                                      </p>
                                      <p className="text-[11px] text-stone-400 truncate">
                                        Color: <span className="text-stone-300">{v.color || 'Standard'}</span>
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="number"
                                        min="0"
                                        value={v.stock}
                                        onChange={(e) => handleVariantStockChange(prod._id, vIdx, e.target.value)}
                                        className="w-16 px-2 py-1 bg-stone-800 border border-stone-700 rounded-lg text-xs font-bold text-center text-amber-300 focus:outline-none focus:border-amber-500"
                                      />
                                      <span className="text-[10px] text-stone-400">pcs</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </div>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
