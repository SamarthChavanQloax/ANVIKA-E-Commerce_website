import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  quantity: { type: Number },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  variant: {
    size: { type: String },
    color: { type: String },
    sku: { type: String },
  },
  size: { type: String },
  color: { type: String },
}, { _id: true });

// Pre-save to sync qty/quantity and variant fields
orderItemSchema.pre('validate', function() {
  if (this.qty && !this.quantity) this.quantity = this.qty;
  if (this.quantity && !this.qty) this.qty = this.quantity;
  if (this.variant) {
    if (this.variant.size && !this.size) this.size = this.variant.size;
    if (this.variant.color && !this.color) this.color = this.variant.color;
  } else if (this.size || this.color) {
    this.variant = { size: this.size, color: this.color };
  }
});

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  customer: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  items: [orderItemSchema],
  orderItems: [orderItemSchema], // alias/direct support
  shippingAddress: {
    fullName: { type: String },
    phone: { type: String },
    street: { type: String },
    addressLine: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'Razorpay',
  },
  orderStatus: {
    type: String,
    enum: [
      'Pending',
      'Placed',
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned',
      'Refunded'
    ],
    default: 'Pending',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending',
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
  },
  razorpay: {
    orderId: { type: String },
    paymentId: { type: String },
    signature: { type: String },
  },
  coupon: {
    code: { type: String },
    discount: { type: Number, default: 0 },
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false,
  },
  deliveredAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
  returnedAt: {
    type: Date,
  },
  subtotal: { type: Number, required: true, default: 0.0 },
  shipping: { type: Number, required: true, default: 0.0 },
  shippingFee: { type: Number, default: 0.0 },
  discount: { type: Number, required: true, default: 0.0 },
  total: { type: Number, required: true, default: 0.0 },
  totalAmount: { type: Number, default: 0.0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

orderSchema.pre('validate', function() {
  if ((!this.items || this.items.length === 0) && this.orderItems && this.orderItems.length > 0) {
    this.items = this.orderItems;
  }
  if ((!this.orderItems || this.orderItems.length === 0) && this.items && this.items.length > 0) {
    this.orderItems = this.items;
  }
  if (this.shipping && !this.shippingFee) this.shippingFee = this.shipping;
  if (this.shippingFee && !this.shipping) this.shipping = this.shippingFee;
  if (this.total && !this.totalAmount) this.totalAmount = this.total;
  if (this.totalAmount && !this.total) this.total = this.totalAmount;
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
