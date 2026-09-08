import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useProducts } from '../../context/ProductContext';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Tag,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const ProductForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { categories, refreshProducts } = useProducts();

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('Anvika Heritage');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [fabric, setFabric] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');

  // Pricing
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discount, setDiscount] = useState('');

  // Stock & Flags
  const [baseStock, setBaseStock] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Images
  const [image, setImage] = useState('/products/saree-rosewood-silk.jpg');
  const [additionalImages, setAdditionalImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Variants: [{ size: 'S', color: 'Emerald Green', price: 15000, stock: 5 }]
  const [variants, setVariants] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Slugify helper
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };

  // Auto-generate slug on name change if not manually modified
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!isEditMode) {
      setSlug(slugify(val));
    }
  };

  // Sync main price updates with variants if variants aren't intentionally customized
  const handlePriceChange = (e) => {
    const val = e.target.value;
    const oldPriceNum = Number(price);
    const newPriceNum = Number(val);
    setPrice(val);

    setVariants((prev) => {
      if (!prev || prev.length === 0) return prev;
      const allSharedPrice = prev.every(
        (v) => Number(v.price) === oldPriceNum || Number(v.price) === Number(prev[0]?.price)
      );
      if (allSharedPrice) {
        return prev.map((v) => ({ ...v, price: newPriceNum || 0 }));
      }
      return prev;
    });
  };

  // Auto-calculate discount
  useEffect(() => {
    const p = Number(price);
    const orig = Number(originalPrice);
    if (p > 0 && orig > p) {
      const calculatedDiscount = Math.round(((orig - p) / orig) * 100);
      setDiscount(calculatedDiscount.toString());
    } else {
      setDiscount('0');
    }
  }, [price, originalPrice]);

  // Set default category when categories load
  useEffect(() => {
    if (!category && categories.length > 0) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  // If edit mode, fetch product from MongoDB
  useEffect(() => {
    if (isEditMode) {
      const fetchProductData = async () => {
        try {
          setFetching(true);
          const { data } = await axios.get(`/api/products/${id}`);
          if (data) {
            setName(data.name || '');
            setSlug(data.slug || '');
            setBrand(data.brand || '');
            setCategory(data.category || '');
            setSubcategory(data.subcategory || '');
            setFabric(data.fabric || '');
            setSku(data.sku || '');
            setDescription(data.description || '');
            setPrice(data.price?.toString() || '');
            setOriginalPrice(data.originalPrice?.toString() || '');
            setDiscount(data.discount?.toString() || '');
            setBaseStock(data.stock?.toString() || '');
            setIsFeatured(Boolean(data.isFeatured));
            setIsNew(Boolean(data.isNew));
            setIsBestseller(Boolean(data.isBestseller));
            setIsActive(data.isActive !== undefined ? Boolean(data.isActive) : true);
            setImage(data.image || '');
            setAdditionalImages(data.images?.filter(img => img !== data.image) || []);
            setVariants(data.variants || []);
          }
        } catch (err) {
          setError('Failed to fetch product data from MongoDB');
        } finally {
          setFetching(false);
        }
      };

      fetchProductData();
    }
  }, [id, isEditMode]);

  // Variants calculations
  const totalVariantStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const effectiveStock = variants.length > 0 ? totalVariantStock : Number(baseStock) || 0;

  // Add Variant Row
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        size: 'M',
        color: 'Emerald Green',
        price: Number(price) || 0,
        stock: 5,
      },
    ]);
  };

  // Remove Variant Row
  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Update Variant Field
  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = field === 'price' || field === 'stock' ? Number(value) : value;
    setVariants(updated);
  };

  // Images handling
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setAdditionalImages([...additionalImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Product name is required');
      setLoading(false);
      return;
    }

    if (!price || Number(price) < 0) {
      setError('A valid positive price is required');
      setLoading(false);
      return;
    }

    const allImages = [image, ...additionalImages].filter(Boolean);

    // Ensure variants are synced if all variants share uniform price or user edited base price
    const basePriceNum = Number(price);
    const allVariantsSharePrice = variants.length > 0 && variants.every(
      (item) => Number(item.price) === Number(variants[0]?.price)
    );
    const finalVariants = variants.map((v) => ({
      ...v,
      price: (allVariantsSharePrice && basePriceNum > 0) ? basePriceNum : (Number(v.price) || basePriceNum),
      stock: Number(v.stock) || 0,
    }));

    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      brand: brand.trim(),
      category,
      subcategory: subcategory.trim(),
      fabric: fabric.trim(),
      sku: sku.trim() || `ANV-${Date.now().toString().slice(-6)}`,
      description: description.trim(),
      price: basePriceNum,
      originalPrice: Number(originalPrice) || basePriceNum,
      discount: Number(discount) || 0,
      stock: effectiveStock,
      variants: finalVariants,
      image,
      images: allImages,
      isFeatured,
      isNew,
      isBestseller,
      isActive,
    };

    try {
      if (isEditMode) {
        await axios.put(`/api/products/${id}`, payload, { withCredentials: true });
        setSuccessMsg('Product updated successfully in MongoDB!');
      } else {
        await axios.post('/api/products', payload, { withCredentials: true });
        setSuccessMsg('Product added successfully to MongoDB!');
      }

      await refreshProducts(); // Sync live customer store immediately!
      setTimeout(() => {
        navigate('/admin/products');
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save product in MongoDB');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-stone-400">Fetching Product from MongoDB...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button & Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
              {isEditMode ? 'Edit Product' : 'Create New Product'}
            </h2>
            <p className="text-xs text-stone-400">
              {isEditMode ? 'Modify attributes, variants, and stock stored in MongoDB.' : 'Add a handcrafted design to the Anvika collection.'}
            </p>
          </div>
        </div>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="p-6 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl space-y-4">
          <h3 className="text-sm font-serif font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <Sparkles size={16} /> Basic Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Rosewood Banarasi Silk Saree"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                Slug (URL Identifier)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="e.g. rosewood-banarasi-silk-saree"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Anvika Heritage"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                Category *
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c._id || c.slug} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                Fabric Material
              </label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. Pure Banarasi Silk, Georgette, Organic Cotton"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                SKU Identifier
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. ANV-SAR-001"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide an alluring description of weaving craftsmanship, drape details, or celebratory styling..."
              className="w-full p-3.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs leading-relaxed focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Section 2: Pricing & Stock */}
        <div className="p-6 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl space-y-4">
          <h3 className="text-sm font-serif font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <Tag size={16} /> Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={handlePriceChange}
                placeholder="12500"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                Original Price (₹ MRP)
              </label>
              <input
                type="number"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="15000"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="16"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Stock setting */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
              Base Stock Quantity {variants.length > 0 && <span className="text-amber-400 font-normal normal-case">(Automatically calculated from variants sum: {totalVariantStock})</span>}
            </label>
            <input
              type="number"
              min="0"
              disabled={variants.length > 0}
              value={variants.length > 0 ? totalVariantStock : baseStock}
              onChange={(e) => setBaseStock(e.target.value)}
              placeholder="10"
              className="w-full max-w-xs px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Section 3: Fashion Variants */}
        <div className="p-6 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Layers size={16} /> Size & Color Variants ({variants.length})
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Configure specific size, color shades, customized prices, and individual stock quantities.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium transition-colors"
            >
              <Plus size={14} />
              <span>Add Variant</span>
            </button>
          </div>

          {variants.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-stone-800 rounded-xl text-stone-500 text-xs">
              No variants defined. The product will use the base stock and single price.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold uppercase text-stone-400 px-3">
                <span className="col-span-3">Size</span>
                <span className="col-span-4">Color</span>
                <span className="col-span-2">Price (₹)</span>
                <span className="col-span-2">Stock</span>
                <span className="col-span-1 text-center">Action</span>
              </div>

              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-stone-900/70 p-2 rounded-xl border border-stone-800">
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="e.g. S, M, L, Free Size"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="e.g. Emerald Green, Rose Gold"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                      title="Remove Variant"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Imagery */}
        <div className="p-6 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl space-y-4">
          <h3 className="text-sm font-serif font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <ImageIcon size={16} /> Product Media & Images
          </h3>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
              Primary Image URL *
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/products/saree-rosewood-silk.jpg or https://..."
                className="flex-1 px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
              />
              {image && (
                <img
                  src={image}
                  alt="Primary Preview"
                  className="w-10 h-10 object-cover rounded-xl border border-stone-800 shrink-0 bg-stone-900"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
              Add Additional Gallery Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
              >
                Add Image
              </button>
            </div>

            {additionalImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {additionalImages.map((img, i) => (
                  <div key={i} className="relative group w-16 h-20 rounded-lg overflow-hidden border border-stone-800 bg-stone-900">
                    <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Badges & Status */}
        <div className="p-6 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl">
          <h3 className="text-sm font-serif font-semibold uppercase tracking-wider text-amber-300 mb-4">
            Visibility & Merchandising Badges
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700 transition-colors">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-amber-600 focus:ring-0 focus:ring-offset-0 bg-stone-800 border-stone-700"
              />
              <span className="text-xs font-medium text-stone-200">Active (Visible)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700 transition-colors">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-amber-600 focus:ring-0 focus:ring-offset-0 bg-stone-800 border-stone-700"
              />
              <span className="text-xs font-medium text-stone-200">Featured Piece</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700 transition-colors">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="rounded text-amber-600 focus:ring-0 focus:ring-offset-0 bg-stone-800 border-stone-700"
              />
              <span className="text-xs font-medium text-stone-200">New Arrival</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700 transition-colors">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="rounded text-amber-600 focus:ring-0 focus:ring-offset-0 bg-stone-800 border-stone-700"
              />
              <span className="text-xs font-medium text-stone-200">Bestseller</span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-amber-900/30 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Save size={16} />
            <span>{loading ? 'Saving to MongoDB...' : isEditMode ? 'Update Product' : 'Save & Publish to MongoDB'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
