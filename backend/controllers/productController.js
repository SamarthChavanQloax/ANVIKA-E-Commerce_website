import mongoose from 'mongoose';
import Product from '../models/Product.js';

// @desc    Fetch all products with filtering, search & sorting
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      subcategory,
      isFeatured,
      isNew,
      isBestseller,
      isActive,
      stockStatus,
      minPrice,
      maxPrice,
      sort,
      size,
      color,
      brand,
      fabric,
      page = 1,
      limit = 100,
    } = req.query;

    const query = {};

    // By default, only return active products for customers (unless explicitly querying all/admin)
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Keyword search (name, description, brand, fabric, sku)
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
        { fabric: { $regex: keyword, $options: 'i' } },
        { sku: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Category & Subcategory
    if (category && category !== 'all' && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (subcategory) {
      query.subcategory = { $regex: new RegExp(`^${subcategory}$`, 'i') };
    }

    // Fabric
    if (fabric) {
      query.fabric = { $regex: new RegExp(`^${fabric}$`, 'i') };
    }

    // Brand filter
    if (brand && brand !== 'all') {
      query.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }

    // Size filter (inside variants)
    if (size && size !== 'all') {
      query['variants.size'] = { $regex: new RegExp(`^${size}$`, 'i') };
    }

    // Color filter (inside variants)
    if (color && color !== 'all') {
      query['variants.color'] = { $regex: new RegExp(`^${color}$`, 'i') };
    }

    // Badges / Flags
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }
    if (isNew !== undefined) {
      query.isNew = isNew === 'true';
    }
    if (isBestseller !== undefined) {
      query.isBestseller = isBestseller === 'true';
    }

    // Stock status
    if (stockStatus === 'in-stock') {
      query.stock = { $gt: 0 };
    } else if (stockStatus === 'out-of-stock') {
      query.stock = { $lte: 0 };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'featured') {
      sortOption = { isFeatured: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'name-asc') {
      sortOption = { name: 1 };
    } else if (sort === 'name-desc') {
      sortOption = { name: -1 };
    } else if (sort === 'stock-low') {
      sortOption = { stock: 1 };
    } else if (sort === 'stock-high') {
      sortOption = { stock: -1 };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      products,
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum),
      total: totalCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product by ID or Slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const param = req.params.id;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(param)) {
      product = await Product.findById(param);
    }
    if (!product) {
      product = await Product.findOne({ slug: param });
    }
    if (!product) {
      product = await Product.findOne({ name: param });
    }

    if (product) {
      // Ensure variant prices stay aligned with product.price
      if (product.variants && product.variants.length > 0 && product.price > 0) {
        let updated = false;
        product.variants.forEach((v) => {
          if (!v.price || v.price === 4999 || (product.price === 3999 && v.price !== 3999)) {
            v.price = product.price;
            updated = true;
          }
        });
        if (updated) {
          try {
            await product.save();
          } catch (e) {
            // Non-blocking save
          }
        }
      }

      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error('Product already reviewed');
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added successfully' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(6);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(8);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products by category
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res, next) => {
  try {
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      res.status(404);
      throw new Error('Product not found');
    }

    const related = await Product.find({
      category: currentProduct.category,
      _id: { $ne: currentProduct._id },
    }).limit(4);

    res.json(related);
  } catch (error) {
    next(error);
  }
};

// Helper to slugify string
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const name = req.body.name || 'Sample Product';
    let baseSlug = req.body.slug ? slugify(req.body.slug) : slugify(name);
    if (!baseSlug) baseSlug = `product-${Date.now()}`;
    
    // Ensure slug uniqueness
    let slug = baseSlug;
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const price = Number(req.body.price) || 0;
    const originalPrice = Number(req.body.originalPrice) || price;
    const discount = req.body.discount !== undefined && req.body.discount !== ''
      ? Number(req.body.discount)
      : (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

    const variants = Array.isArray(req.body.variants) ? req.body.variants.map(v => ({
      size: v.size || '',
      color: v.color || '',
      price: Number(v.price) || price,
      stock: Number(v.stock) || 0,
    })) : [];

    // Calculate total stock: from variants if present, otherwise explicit stock
    const stock = variants.length > 0
      ? variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
      : (Number(req.body.stock) || 0);

    const product = new Product({
      name,
      slug,
      price,
      originalPrice,
      discount,
      user: req.user._id,
      image: req.body.image || '/demo-saree.jpg',
      images: Array.isArray(req.body.images) && req.body.images.length > 0 ? req.body.images : [req.body.image || '/demo-saree.jpg'],
      category: req.body.category || 'Sarees',
      subcategory: req.body.subcategory || '',
      brand: req.body.brand || 'Anvika Heritage',
      fabric: req.body.fabric || 'Silk',
      variants,
      stock,
      sku: req.body.sku || `ANV-${Date.now().toString().slice(-6)}`,
      numReviews: 0,
      rating: 0,
      description: req.body.description || '',
      isFeatured: Boolean(req.body.isFeatured),
      isNew: req.body.isNew !== undefined ? Boolean(req.body.isNew) : true,
      isBestseller: Boolean(req.body.isBestseller),
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // If variants passed, format them and compute total stock
      if (req.body.variants !== undefined) {
        product.variants = Array.isArray(req.body.variants) ? req.body.variants.map(v => ({
          size: v.size || '',
          color: v.color || '',
          price: Number(v.price) || (product.price || 0),
          stock: Number(v.stock) || 0,
        })) : [];

        if (product.variants.length > 0) {
          product.stock = product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
        } else if (req.body.stock !== undefined) {
          product.stock = Number(req.body.stock) || 0;
        }
      } else if (req.body.stock !== undefined) {
        product.stock = Number(req.body.stock) || 0;
      }

      if (req.body.name !== undefined) product.name = req.body.name;
      if (req.body.slug !== undefined) product.slug = slugify(req.body.slug);
      if (req.body.brand !== undefined) product.brand = req.body.brand;
      if (req.body.category !== undefined) product.category = req.body.category;
      if (req.body.subcategory !== undefined) product.subcategory = req.body.subcategory;
      if (req.body.fabric !== undefined) product.fabric = req.body.fabric;
      if (req.body.description !== undefined) product.description = req.body.description;
      if (req.body.image !== undefined) product.image = req.body.image;
      if (req.body.images !== undefined) product.images = req.body.images;
      if (req.body.sku !== undefined) product.sku = req.body.sku;
      if (req.body.isFeatured !== undefined) product.isFeatured = Boolean(req.body.isFeatured);
      if (req.body.isNew !== undefined) product.isNew = Boolean(req.body.isNew);
      if (req.body.isBestseller !== undefined) product.isBestseller = Boolean(req.body.isBestseller);
      if (req.body.isActive !== undefined) product.isActive = Boolean(req.body.isActive);

      const oldPrice = product.price;
      if (req.body.price !== undefined) product.price = Number(req.body.price);
      if (req.body.originalPrice !== undefined) product.originalPrice = Number(req.body.originalPrice);

      // If variants exist, sync variant prices if they shared the old price or all had the same price
      if (product.variants && product.variants.length > 0 && req.body.price !== undefined) {
        const newPrice = Number(req.body.price);
        const allSharedOldOrUniform = product.variants.every(
          (v) => v.price === oldPrice || v.price === product.variants[0]?.price
        );
        if (allSharedOldOrUniform) {
          product.variants.forEach((v) => {
            v.price = newPrice;
          });
        }
      }

      // Auto compute discount if not explicitly set
      if (req.body.discount !== undefined && req.body.discount !== '') {
        product.discount = Number(req.body.discount);
      } else if (product.originalPrice > product.price) {
        product.discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

export {
  getProducts,
  getProductById,
  getProductBySlug,
  getTopProducts,
  getFeaturedProducts,
  getRelatedProducts,
  createProductReview,
  deleteProduct,
  createProduct,
  updateProduct,
};
