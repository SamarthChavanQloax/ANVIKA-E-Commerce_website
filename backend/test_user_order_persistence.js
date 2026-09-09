import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Cart from './models/Cart.js';
import Coupon from './models/Coupon.js';
import { reduceOrderStock } from './controllers/paymentController.js';

dotenv.config();

if (process.platform === 'win32' || process.env.CUSTOM_DNS === 'true') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

const testCompleteOrderAndUserPersistence = async () => {
  console.log('\n========================================================================');
  console.log('📦 VERIFYING CUSTOMER & ORDER DETAILS PERSISTENCE IN DATABASE');
  console.log('========================================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anvika_boutique';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  } catch (err) {
    const fallbackUri = 'mongodb://anvika_admin:Qloax123@ac-uqatpw3-shard-00-00.6f3gpag.mongodb.net:27017,ac-uqatpw3-shard-00-01.6f3gpag.mongodb.net:27017,ac-uqatpw3-shard-00-02.6f3gpag.mongodb.net:27017/anvika_boutique?ssl=true&replicaSet=atlas-w3rxdd-shard-0&authSource=admin&retryWrites=true&w=majority';
    await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 10000 });
  }
  console.log('✅ Connected to Database.\n');

  // Find or create test customer
  let customer = await User.findOne({ email: 'priya.sharma@example.com' });
  if (!customer) {
    customer = await User.create({
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      password: 'Password123!',
      phone: '+91 98200 12345',
      role: 'customer',
    });
  }

  // Find product
  const product = await Product.findOne({ stock: { $gt: 2 } });
  if (!product) {
    throw new Error('No product with stock found in database');
  }

  console.log('1. Customer Information:');
  console.log(`   - ID: ${customer._id}`);
  console.log(`   - Name: ${customer.name}`);
  console.log(`   - Email: ${customer.email}`);
  console.log(`   - Phone: ${customer.phone}`);

  console.log('\n2. Selected Product:');
  console.log(`   - ID: ${product._id}`);
  console.log(`   - Name: ${product.name}`);
  console.log(`   - Price: ₹${product.price}`);
  console.log(`   - Stock: ${product.stock}`);

  // Step 1: Customer places order
  console.log('\n3. Placing Order...');
  const orderItems = [
    {
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: 1,
      quantity: 1,
      size: 'Free Size',
      color: 'Royal Maroon',
      variant: { size: 'Free Size', color: 'Royal Maroon' },
    },
  ];

  const shippingAddress = {
    fullName: customer.name,
    phone: customer.phone,
    street: 'Flat 402, Lotus Towers, Juhu Tara Road',
    addressLine: 'Flat 402, Lotus Towers, Juhu Tara Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400049',
    country: 'India',
  };

  const order = new Order({
    user: customer._id,
    customer: {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    },
    items: orderItems,
    orderItems: orderItems,
    shippingAddress,
    paymentMethod: 'Razorpay',
    orderStatus: 'Pending',
    paymentStatus: 'Pending',
    subtotal: product.price,
    discount: 0,
    shippingFee: 0,
    totalAmount: product.price,
    isPaid: false,
    isDelivered: false,
  });

  const createdOrder = await order.save();
  console.log(`   ✅ Order placed with ID: ${createdOrder._id}`);
  console.log(`   - Initial Order Status: ${createdOrder.orderStatus}`);
  console.log(`   - Initial Payment Status: ${createdOrder.paymentStatus}`);

  // Step 2: Payment gateway creates Razorpay order
  console.log('\n4. Payment Gateway Order Generation...');
  const razorpayOrderId = `order_test_${Date.now()}`;
  createdOrder.razorpay = { orderId: razorpayOrderId };
  await createdOrder.save();
  console.log(`   - Razorpay Order ID: ${razorpayOrderId}`);

  // Step 3: Payment gateway verifies and completes transaction
  console.log('\n5. Payment Gateway Verification & Capture...');
  const razorpayPaymentId = `pay_test_${Date.now()}`;
  const razorpaySignature = `sig_${Date.now()}_valid`;

  createdOrder.isPaid = true;
  createdOrder.paidAt = new Date();
  createdOrder.paymentStatus = 'Completed';
  createdOrder.orderStatus = 'Confirmed';
  createdOrder.paymentResult = {
    id: razorpayPaymentId,
    status: 'Captured',
    update_time: new Date().toISOString(),
    email_address: customer.email,
  };
  createdOrder.razorpay = {
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  };
  await createdOrder.save();
  await reduceOrderStock(createdOrder);

  // Step 4: Query fresh from database to inspect persistence
  console.log('\n6. Inspecting Persisted Order in MongoDB...');
  const dbOrder = await Order.findById(createdOrder._id).populate('user', 'name email phone role');

  console.log('\n----------------- COMPLETE DATABASE RECORD -----------------');
  console.log(`Order ID:            ${dbOrder._id}`);
  console.log(`User ID (Ref):       ${dbOrder.user?._id || dbOrder.user}`);
  console.log(`User Name:           ${dbOrder.user?.name}`);
  console.log(`User Email:          ${dbOrder.user?.email}`);
  console.log(`Customer Snapshot:   Name="${dbOrder.customer?.name}", Email="${dbOrder.customer?.email}", Phone="${dbOrder.customer?.phone}"`);
  console.log(`Payment Status:      ${dbOrder.paymentStatus} (isPaid = ${dbOrder.isPaid})`);
  console.log(`Order Status:        ${dbOrder.orderStatus}`);
  console.log(`Paid At:             ${dbOrder.paidAt}`);
  console.log(`Payment Gateway:     ${dbOrder.paymentMethod}`);
  console.log(`Razorpay Payment ID: ${dbOrder.razorpay?.paymentId}`);
  console.log(`Razorpay Order ID:   ${dbOrder.razorpay?.orderId}`);
  console.log(`Total Amount:        ₹${dbOrder.totalAmount}`);
  console.log(`Delivery Address:    ${dbOrder.shippingAddress.fullName}, ${dbOrder.shippingAddress.street}, ${dbOrder.shippingAddress.city}, ${dbOrder.shippingAddress.state} - ${dbOrder.shippingAddress.postalCode}`);
  console.log(`Items Count:         ${dbOrder.items.length}`);
  console.log(`Item 0 Snapshot:     ${dbOrder.items[0].name} | Qty: ${dbOrder.items[0].qty} | Size: ${dbOrder.items[0].size} | Color: ${dbOrder.items[0].color} | Price: ₹${dbOrder.items[0].price}`);
  console.log('------------------------------------------------------------\n');

  // Assertions
  if (!dbOrder.user || !dbOrder.customer?.name) {
    throw new Error('❌ Customer details missing from order record!');
  }
  if (!dbOrder.isPaid || dbOrder.paymentStatus !== 'Completed') {
    throw new Error('❌ Payment status not updated to Completed!');
  }
  if (dbOrder.orderStatus !== 'Confirmed') {
    throw new Error('❌ Order status not updated to Confirmed!');
  }
  if (!dbOrder.items || dbOrder.items.length === 0) {
    throw new Error('❌ Item snapshots missing from order record!');
  }

  console.log('✅ ALL CHECKS PASSED: The database completely records which user placed the order along with all order and payment details!');

  // Clean up test order
  await Order.deleteOne({ _id: dbOrder._id });
  console.log('🧹 Test order cleaned up successfully.\n');
  process.exit(0);
};

testCompleteOrderAndUserPersistence().catch((err) => {
  console.error('❌ Error during test:', err);
  process.exit(1);
});
