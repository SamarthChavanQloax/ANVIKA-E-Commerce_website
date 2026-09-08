import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
});

const productSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  brand: { type: String, trim: true },
  image: { type: String, required: true }, // Primary image
  images: [String], // Array for gallery and secondary images
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  fabric: { type: String },
  price: { type: Number, required: true, default: 0 },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0 },
  variants: [variantSchema],
  stock: { type: Number, required: true, default: 0, min: 0 },
  sku: { type: String },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
});

// Middleware to calculate total stock based on variants
productSchema.pre('save', function () {
  if (this.variants && this.variants.length > 0) {
    this.stock = this.variants.reduce((acc, variant) => acc + (variant.stock || 0), 0);
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
