import mongoose from 'mongoose';

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    size: { type: String, default: 'Free Size' },
    color: { type: String, default: '' },
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  price: {
    type: Number,
    required: true, // Price snapshot validated against Piyush's Product model
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const cartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  isAbandoned: {
    type: Boolean,
    default: false,
    index: true,
  },
  abandonedAt: {
    type: Date,
  },
  recoveryStatus: {
    type: String,
    enum: ['none', 'scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'none',
    index: true,
  },
  recoveryStep: {
    type: Number,
    default: 0, // 0 = no reminder sent, 1 = reminder 1, 2 = reminder 2, 3 = reminder 3
  },
  lastRecoveryMessageSentAt: {
    type: Date,
  },
  recoveryToken: {
    type: String,
    index: true,
  },
  recoveredAt: {
    type: Date,
  },
  recoveryOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
}, {
  timestamps: true,
});

// Helper method to recalculate subtotal
cartSchema.methods.calculateSubtotal = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return this.subtotal;
};

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
