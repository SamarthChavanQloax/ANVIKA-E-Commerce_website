import mongoose from 'mongoose';
import Wishlist from '../models/Wishlist.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

// Helper to format wishlist response into consistent product objects
const formatWishlistResponse = (wishlist) => {
  if (!wishlist) return [];
  const list = [];
  const seenKeys = new Set();

  // 1. Process items array first (preserves requested client productIds like 'prod_1')
  if (Array.isArray(wishlist.items)) {
    for (const item of wishlist.items) {
      const id = item.productId || (item.product?._id ? item.product._id.toString() : item._id?.toString());
      const key = item.slug || item.name || id;
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        if (id) seenKeys.add(id);
        list.push({
          _id: id,
          id: id,
          productId: id,
          name: item.name || item.product?.name || 'Luxury Ensemble',
          price: item.price || item.product?.price || 0,
          originalPrice: item.originalPrice || item.product?.originalPrice || 0,
          image: item.image || item.product?.image || (item.product?.images?.[0]) || '/demo-saree.jpg',
          category: item.category || item.product?.category || 'Sarees',
          slug: item.slug || item.product?.slug || '',
          inStock: item.inStock ?? (item.product?.stock > 0),
        });
      }
    }
  }

  // 2. Process populated products array
  if (Array.isArray(wishlist.products)) {
    for (const prod of wishlist.products) {
      if (!prod) continue;
      const id = prod._id ? prod._id.toString() : prod.toString();
      const key = prod.slug || prod.name || id;
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        if (id) seenKeys.add(id);
        list.push({
          _id: id,
          id: id,
          productId: id,
          name: prod.name || 'Luxury Ensemble',
          price: prod.price || 0,
          originalPrice: prod.originalPrice || 0,
          image: prod.image || (prod.images?.[0]) || '/demo-saree.jpg',
          category: prod.category || 'Sarees',
          slug: prod.slug || '',
          inStock: prod.stock > 0,
        });
      }
    }
  }

  return list;
};

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

    if (!wishlist) {
      const user = await User.findById(req.user._id);
      const existingProductIds = user?.wishlist || [];

      const validObjectIds = existingProductIds.filter(id => mongoose.Types.ObjectId.isValid(id));
      const stringIds = existingProductIds.filter(id => !mongoose.Types.ObjectId.isValid(id));

      wishlist = await Wishlist.create({
        user: req.user._id,
        products: validObjectIds,
        items: stringIds.map(id => ({ productId: String(id) })),
      });

      wishlist = await Wishlist.findById(wishlist._id).populate('products');
    }

    res.json(formatWishlistResponse(wishlist));
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      res.status(400);
      throw new Error('Product ID is required');
    }

    // Try finding product in Piyush's Product model if productId is valid ObjectId or slug
    let dbProduct = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      dbProduct = await Product.findById(productId);
    } else {
      dbProduct = await Product.findOne({
        $or: [
          { slug: productId },
          { name: req.body.name || req.body.product?.name || '' },
        ].filter(q => Object.values(q)[0])
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        products: [],
        items: [],
      });
    }

    // If dbProduct is found with ObjectId, track in products
    if (dbProduct) {
      const alreadyInProducts = wishlist.products.some(
        (id) => id && id.toString() === dbProduct._id.toString()
      );
      if (!alreadyInProducts) {
        wishlist.products.push(dbProduct._id);
      }
    }

    // Extract product details from request body if available
    const prodDetails = req.body.product || req.body || {};
    const effectiveName = dbProduct?.name || prodDetails.name || 'Handcrafted Luxury Piece';
    const effectivePrice = dbProduct?.price || prodDetails.price || 0;
    const effectiveImage = dbProduct?.image || prodDetails.image || (prodDetails.images?.[0]) || '/demo-saree.jpg';
    const effectiveCategory = dbProduct?.category || prodDetails.category || 'Sarees';
    const effectiveSlug = dbProduct?.slug || prodDetails.slug || '';

    // Check duplicate in items array
    const alreadyInItems = wishlist.items.some(
      (item) => item.productId === productId || (dbProduct && item.productId === dbProduct._id.toString())
    );

    if (!alreadyInItems) {
      wishlist.items.push({
        productId,
        product: dbProduct ? dbProduct._id : undefined,
        name: effectiveName,
        price: effectivePrice,
        originalPrice: dbProduct?.originalPrice || prodDetails.originalPrice || 0,
        image: effectiveImage,
        category: effectiveCategory,
        slug: effectiveSlug,
      });
    }

    await wishlist.save();

    // Also update User.wishlist safely
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { wishlist: dbProduct ? dbProduct._id : productId }
    });

    const populated = await Wishlist.findById(wishlist._id).populate('products');
    res.status(200).json(formatWishlistResponse(populated));
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
      // Remove from items array
      wishlist.items = wishlist.items.filter(
        (item) => item.productId !== productId && item._id.toString() !== productId
      );

      // Remove from products array if valid ObjectId
      if (mongoose.Types.ObjectId.isValid(productId)) {
        wishlist.products = wishlist.products.filter(
          (id) => id && id.toString() !== productId.toString()
        );
      }

      await wishlist.save();
    }

    // Also update User.wishlist safely
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { wishlist: productId }
    });

    if (wishlist) {
      const populated = await Wishlist.findById(wishlist._id).populate('products');
      res.json(formatWishlistResponse(populated));
    } else {
      res.json([]);
    }
  } catch (error) {
    next(error);
  }
};
