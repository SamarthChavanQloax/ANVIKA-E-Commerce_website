import { useState, useEffect } from 'react';
import axios from 'axios';
import { useProducts } from '../../context/ProductContext';
import {
  Layers,
  PlusCircle,
  Edit,
  Trash2,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  Image as ImageIcon,
} from 'lucide-react';

const CategoryList = () => {
  const { refreshProducts } = useProducts();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get('/api/categories');
      setCategories(data || []);
    } catch (err) {
      setError('Failed to fetch categories from MongoDB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setModalError('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setModalError('');
    setModalOpen(true);
  };

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!editingCategory) {
      setSlug(slugify(val));
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim(),
      image: image.trim(),
    };

    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory._id}`, payload, { withCredentials: true });
      } else {
        await axios.post('/api/categories', payload, { withCredentials: true });
      }
      setModalOpen(false);
      await refreshProducts();
      fetchCategories();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to save category');
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      await axios.delete(`/api/categories/${categoryToDelete._id}`, { withCredentials: true });
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      await refreshProducts();
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            Category Management
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Organize catalog classifications, collections, and visual header cards directly in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors"
            title="Refresh Categories"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-amber-400' : ''} />
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-amber-900/30 transition-all active:scale-[0.98]"
          >
            <PlusCircle size={16} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Grid of Categories */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-400">Loading Categories from MongoDB...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-20 text-center text-stone-500 space-y-3 bg-[#141419] border border-stone-800 rounded-2xl">
          <FolderOpen size={36} className="mx-auto text-stone-600 mb-2" />
          <p className="text-sm">No categories found in MongoDB database.</p>
          <button
            onClick={openAddModal}
            className="text-xs text-amber-400 hover:underline"
          >
            Create the first category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-[#141419] border border-stone-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col group hover:border-stone-700 transition-all"
            >
              {/* Category Image Cover */}
              <div className="h-40 relative bg-stone-900 overflow-hidden">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-600">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141419] via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 font-mono text-[10px] text-amber-300/90 bg-stone-900/80 px-2 py-0.5 rounded border border-stone-700">
                  /{cat.slug}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white tracking-wide">{cat.name}</h3>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided for this collection.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181d] border border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-white">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>

            {modalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Sarees, Women's Wear, Lehengas"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Slug (URL path)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="e.g. sarees, womens-wear"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Hero Image URL
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of pieces featured in this category..."
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : editingCategory ? 'Update' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181d] border border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-serif font-bold text-white">Delete Category?</h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Are you sure you want to delete <strong className="text-stone-200">"{categoryToDelete.name}"</strong>? Products in this category will remain, but the classification will be removed.
              </p>
            </div>

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
    </div>
  );
};

export default CategoryList;
