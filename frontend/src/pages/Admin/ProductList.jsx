import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useProducts } from '../../context/ProductContext';
import {
  Search,
  PlusCircle,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const ProductList = () => {
  const { categories, refreshProducts } = useProducts();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [isActive, setIsActive] = useState('');
  const [badgeFilter, setBadgeFilter] = useState('');
  const [sort, setSort] = useState('newest');

  // Deletion Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Quick View Modal state
  const [previewProduct, setPreviewProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 12);
      params.append('sort', sort);

      if (keyword) params.append('keyword', keyword);
      if (category) params.append('category', category);
      if (stockStatus) params.append('stockStatus', stockStatus);
      if (isActive) params.append('isActive', isActive);
      if (badgeFilter === 'featured') params.append('isFeatured', 'true');
      if (badgeFilter === 'new') params.append('isNew', 'true');
      if (badgeFilter === 'bestseller') params.append('isBestseller', 'true');

      const { data } = await axios.get(`/api/products?${params.toString()}`);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, category, stockStatus, isActive, badgeFilter, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setCategory('');
    setStockStatus('');
    setIsActive('');
    setBadgeFilter('');
    setSort('newest');
    setPage(1);
  };

  const confirmDelete = (prod) => {
    setProductToDelete(prod);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError('');
      await axios.delete(`/api/products/${productToDelete._id}`, { withCredentials: true });
      setDeleteModalOpen(false);
      setProductToDelete(null);
      await refreshProducts(); // Sync live customer store
      fetchProducts(); // Refresh local list
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            Product Management
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Browse, search, edit, and organize boutique pieces stored in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProducts()}
            className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-amber-400' : ''} />
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-amber-900/30 transition-all active:scale-[0.98]"
          >
            <PlusCircle size={16} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by title, brand, category, or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 border-t border-stone-800/60">
          {/* Category */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.slug} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Stock status */}
          <select
            value={stockStatus}
            onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Stock Levels</option>
            <option value="in">In Stock (&gt; 0)</option>
            <option value="low">Low Stock (&le; 5)</option>
            <option value="out">Out of Stock (0)</option>
          </select>

          {/* Active status */}
          <select
            value={isActive}
            onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          {/* Badge filter */}
          <select
            value={badgeFilter}
            onChange={(e) => { setBadgeFilter(e.target.value); setPage(1); }}
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Badges</option>
            <option value="featured">Featured Pieces</option>
            <option value="new">New Arrivals</option>
            <option value="bestseller">Bestsellers</option>
          </select>

          {/* Sorting */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="stock-low">Stock: Low to High</option>
            <option value="rating">Top Rated</option>
          </select>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs transition-colors border border-stone-800 text-center"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#141419] border border-stone-800/80 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-400">Loading catalog from MongoDB...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-stone-500 space-y-3">
            <p className="text-sm">No products found matching the criteria.</p>
            <button
              onClick={handleResetFilters}
              className="text-xs text-amber-400 hover:underline"
            >
              Clear filters and search again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-900/60 border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Category & Fabric</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">Stock & Variants</th>
                  <th className="py-3.5 px-4 font-semibold">Badges</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {products.map((prod) => {
                  const hasVariants = prod.variants && prod.variants.length > 0;
                  const isLow = prod.stock > 0 && prod.stock <= 5;
                  const isOut = prod.stock <= 0;

                  return (
                    <tr key={prod._id} className="hover:bg-stone-900/40 transition-colors">
                      {/* Product details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image || '/demo-saree.jpg'}
                            alt={prod.name}
                            className="w-11 h-14 object-cover rounded-lg bg-stone-800 border border-stone-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-stone-200 truncate max-w-[220px] sm:max-w-xs">{prod.name}</p>
                            <p className="text-[11px] text-stone-400 truncate">{prod.brand || 'Anvika Heritage'}</p>
                            <span className="text-[10px] text-stone-400 font-mono">SKU: {prod.sku || prod._id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <div className="text-stone-300 font-medium">{prod.category}</div>
                        <div className="text-[11px] text-stone-400">{prod.fabric || 'Silk'}</div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{formatINR(prod.price)}</div>
                        {prod.originalPrice > prod.price && (
                          <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-0.5">
                            <span className="line-through">{formatINR(prod.originalPrice)}</span>
                            <span className="text-amber-400 font-semibold">({prod.discount}% off)</span>
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-stone-200'}`}>
                            {prod.stock} in stock
                          </span>
                        </div>
                        {hasVariants && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-[10px] text-stone-400">
                            {prod.variants.length} variant(s)
                          </span>
                        )}
                      </td>

                      {/* Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {prod.isFeatured && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-medium">
                              Featured
                            </span>
                          )}
                          {prod.isNew && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-medium">
                              New
                            </span>
                          )}
                          {prod.isBestseller && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-medium">
                              Bestseller
                            </span>
                          )}
                          {!prod.isFeatured && !prod.isNew && !prod.isBestseller && (
                            <span className="text-stone-600 text-[10px]">-</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {prod.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewProduct(prod)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                            title="Quick View"
                          >
                            <Eye size={15} />
                          </button>
                          <Link
                            to={`/admin/products/${prod._id}/edit`}
                            className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                            title="Edit Product"
                          >
                            <Edit size={15} />
                          </Link>
                          <button
                            onClick={() => confirmDelete(prod)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pages > 1 && (
          <div className="px-5 py-4 bg-stone-900/40 border-t border-stone-800 flex items-center justify-between">
            <p className="text-xs text-stone-400">
              Showing page <strong className="text-stone-200">{page}</strong> of <strong className="text-stone-200">{pages}</strong> ({total} total products)
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181d] border border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-serif font-bold text-white">Delete Product?</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Are you sure you want to delete <strong className="text-stone-200">"{productToDelete.name}"</strong>? This will permanently remove it from MongoDB and the customer store.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Product Modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181d] border border-stone-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={previewProduct.image || '/demo-saree.jpg'}
                alt={previewProduct.name}
                className="w-24 h-32 object-cover rounded-xl bg-stone-800 border border-stone-800 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">{previewProduct.category}</span>
                <h3 className="text-base font-serif font-bold text-white mt-0.5">{previewProduct.name}</h3>
                <p className="text-xs text-stone-400 mt-1">{previewProduct.brand} • {previewProduct.fabric || 'Silk'}</p>
                <div className="text-lg font-bold text-amber-300 mt-2">{formatINR(previewProduct.price)}</div>
                <p className="text-xs text-stone-400 mt-1">Stock available: {previewProduct.stock}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-stone-900/60 p-3.5 rounded-xl text-xs text-stone-300 border border-stone-800/80 leading-relaxed max-h-32 overflow-y-auto">
              {previewProduct.description || 'No description provided.'}
            </div>

            {/* Variants table if any */}
            {previewProduct.variants && previewProduct.variants.length > 0 && (
              <div className="border border-stone-800 rounded-xl overflow-hidden text-xs">
                <div className="bg-stone-900 px-3 py-1.5 font-semibold text-[11px] text-stone-400 uppercase tracking-wider">
                  Variants Breakdown ({previewProduct.variants.length})
                </div>
                <div className="divide-y divide-stone-800 max-h-36 overflow-y-auto">
                  {previewProduct.variants.map((v, i) => (
                    <div key={i} className="px-3 py-2 flex justify-between items-center text-[11px]">
                      <span className="text-stone-200">{v.size || 'Free Size'} / {v.color || 'Default Color'}</span>
                      <span className="font-semibold text-amber-400">{formatINR(v.price)} ({v.stock} pcs)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
              <Link
                to={`/product/${previewProduct._id}`}
                target="_blank"
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View on Customer Storefront</span>
                <ExternalLink size={13} />
              </Link>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
