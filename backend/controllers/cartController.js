import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price image stock sizes colors');

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        subtotal: 0,
      });
    } else {
      // Recalculate subtotal in case any items changed
      cart.calculateSubtotal();
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, variant = {} } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error('Product ID is required');
    }

    const numQuantity = Math.max(1, parseInt(quantity, 10) || 1);

    // Validate product existence with Piyush's Product model
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check stock availability
    if (product.stock < numQuantity) {
      res.status(400);
      throw new Error(`Insufficient stock. Only ${product.stock} items available.`);
    }

    // Determine variant defaults if not specified
    const selectedSize = variant.size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Free Size');
    const selectedColor = variant.color || (product.colors && product.colors.length > 0 ? product.colors[0] : '');

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        subtotal: 0,
      });
    }

    // Check if matching item (same product and variant) already exists
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId.toString() &&
        (item.variant?.size || '') === selectedSize &&
        (item.variant?.color || '') === selectedColor
    );

    if (existingIndex > -1) {
      const newQuantity = cart.items[existingIndex].quantity + numQuantity;
      if (product.stock < newQuantity) {
        res.status(400);
        throw new Error(`Cannot add more. Only ${product.stock} items in stock (you already have ${cart.items[existingIndex].quantity} in cart).`);
      }
      cart.items[existingIndex].quantity = newQuantity;
      // Refresh price snapshot from authoritative DB product
      cart.items[existingIndex].price = product.price;
    } else {
      cart.items.push({
        product: product._id,
        variant: {
          size: selectedSize,
          color: selectedColor,
        },
        quantity: numQuantity,
        price: product.price, // Authoritative price snapshot from Product model
        name: product.name,
        image: product.image,
      });
    }
 
    cart.calculateSubtotal();
    cart.lastActivityAt = new Date();
    if (!cart.recoveryToken) {
      cart.recoveryToken = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    // If cart was marked abandoned or in_progress, adding more items reactivates it
    if (cart.recoveryStatus === 'in_progress' || cart.recoveryStatus === 'cancelled') {
      cart.recoveryStatus = 'none';
      cart.recoveryStep = 0;
    }
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price image stock sizes colors');
    res.status(200).json(populatedCart);
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity < 1) {
      res.status(400);
      throw new Error('Quantity must be at least 1');
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      res.status(404);
      throw new Error('Item not found in cart');
    }

    // Verify stock against Product model
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error('Product is no longer available');
    }

    if (product.stock < numQuantity) {
      res.status(400);
      throw new Error(`Only ${product.stock} items available in stock.`);
    }

    item.quantity = numQuantity;
    item.price = product.price; // Update snapshot to latest price

    cart.calculateSubtotal();
    cart.lastActivityAt = new Date();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price image stock sizes colors');
    res.json(populatedCart);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      res.status(404);
      throw new Error('Item not found in cart');
    }

    cart.items.pull(itemId);
    cart.calculateSubtotal();
    cart.lastActivityAt = new Date();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price image stock sizes colors');
    res.json(populatedCart);
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all items in cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      cart.lastActivityAt = new Date();
      cart.recoveryStatus = 'cancelled';
      await cart.save();
    }

    res.json({ message: 'Cart cleared successfully', items: [], subtotal: 0 });
  } catch (error) {
    next(error);
  }
};
