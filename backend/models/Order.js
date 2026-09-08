import mongoose from 'mongoose';

const variantSchema = mongoose.Schema({
  size: { type: String, default: '' },
  color: { type: String, default: '' },
}, { _id: false });

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
      },
      productName: { type: String, required: true },
      productImage: { type: String, required: true },
      variant: { type: variantSchema, default: () => ({}) },
      size: { type: String },
      color: { type: String },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
    }
  ],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentMethod: { type: String, default: 'cod' },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Authorized', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'],
    default: 'Pending'
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
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
  subtotal: { type: Number, required: true, default: 0.0 },
  shippingFee: { type: Number, required: true, default: 0.0 },
  discount: { type: Number, required: true, default: 0.0 },
  totalAmount: { type: Number, required: true, default: 0.0 },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  inventoryReleased: { type: Boolean, default: false },
  inventoryReduced: { type: Boolean, default: false },
}, {
  timestamps: true,
});

orderSchema.virtual('total').get(function () { return this.totalAmount; });
orderSchema.virtual('shipping').get(function () { return this.shippingFee; });
orderSchema.set('toJSON', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
