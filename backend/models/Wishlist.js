import mongoose from 'mongoose';

const wishlistItemSchema = mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: { type: String, default: '' },
  price: { type: Number, default: 0 },
  originalPrice: { type: Number, default: 0 },
  image: { type: String, default: '' },
  category: { type: String, default: '' },
  slug: { type: String, default: '' },
  inStock: { type: Boolean, default: true },
}, {
  timestamps: true,
});

const wishlistSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  items: [wishlistItemSchema],
}, {
  timestamps: true,
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
