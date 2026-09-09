import mongoose from 'mongoose';

const whatsAppMessageSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: true,
    index: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    index: true,
  },
  messageType: {
    type: String,
    required: true,
    enum: [
      'abandoned_cart_reminder_1',
      'abandoned_cart_reminder_2',
      'abandoned_cart_reminder_3',
      'order_update',
      'custom',
    ],
    index: true,
  },
  templateName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  providerMessageId: {
    type: String, // wamid from Meta WhatsApp Cloud API
    sparse: true,
    index: true,
  },
  variables: {
    customerName: { type: String },
    productName: { type: String },
    productImage: { type: String },
    cartTotal: { type: Number },
    cartUrl: { type: String },
    storeName: { type: String, default: 'Anvika Boutique' },
  },
  recoveryToken: {
    type: String,
    index: true,
  },
  clickedAt: {
    type: Date,
  },
  sentAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  readAt: {
    type: Date,
  },
  failedAt: {
    type: Date,
  },
  errorMessage: {
    type: String,
  },
  metaResponseRaw: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Compound index to strictly prevent duplicate messages for the same cart and recovery step
whatsAppMessageSchema.index({ cartId: 1, messageType: 1 }, { unique: true });

const WhatsAppMessage = mongoose.model('WhatsAppMessage', whatsAppMessageSchema);
export default WhatsAppMessage;
