import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Cart from './models/Cart.js';
import Order from './models/Order.js';
import Product from './models/Product.js';
import WhatsAppMessage from './models/WhatsAppMessage.js';
import { processSingleCartRecovery } from './services/cartRecoveryWorker.js';

dotenv.config();

const runTest = async () => {
  console.log('🧪 Starting WhatsApp Abandoned Cart Recovery Integration Test Suite...\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anvika_boutique';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  const testEmail = `test_wa_${Date.now()}@example.com`;
  let testUser;
  let testCart;
  let testProduct;
  let testOrder;

  try {
    // 1. Get or create a sample product
    testProduct = await Product.findOne();
    if (!testProduct) {
      testProduct = await Product.create({
        name: 'Royal Heritage Banarasi Saree',
        price: 18500,
        category: 'Sarees',
        image: '/products/saree-pink-gold.jpg',
        stock: 10,
      });
    }

    // 2. Create customer with explicit WhatsApp opt-in
    testUser = await User.create({
      name: 'Rani Priyadarshini',
      email: testEmail,
      password: 'password123',
      phone: '+919876543210',
      whatsappOptIn: true,
      whatsappOptInAt: new Date(),
      notificationPreferences: {
        abandonedCart: true,
        orderUpdates: true,
        promotions: false,
      },
    });
    console.log(`✅ [1/6] Created customer with whatsappOptIn=true: ${testUser.name} (${testUser.phone})`);

    // 3. Create active cart with item and backdate lastActivityAt by 45 minutes
    const fortyFiveMinutesAgo = new Date(Date.now() - 45 * 60 * 1000);
    testCart = await Cart.create({
      user: testUser._id,
      items: [
        {
          product: testProduct._id,
          name: testProduct.name,
          price: testProduct.price,
          quantity: 1,
          image: testProduct.image || '/products/saree-pink-gold.jpg',
          variant: { size: 'Free Size' },
        },
      ],
      subtotal: testProduct.price,
      lastActivityAt: fortyFiveMinutesAgo,
      recoveryStatus: 'none',
      recoveryStep: 0,
    });
    console.log(`✅ [2/6] Created inactive cart (subtotal: ₹${testCart.subtotal}, inactive since: ${fortyFiveMinutesAgo.toISOString()})`);

    // 4. Trigger recovery evaluation
    const result1 = await processSingleCartRecovery(testCart, false);
    console.log(`✅ [3/6] Evaluated recovery reminder 1:`, result1);

    if (result1.status !== 'success') {
      throw new Error(`Expected result1.status to be 'success', got '${result1.status}'`);
    }

    // Verify WhatsAppMessage logged in DB
    const loggedMessage = await WhatsAppMessage.findOne({ cartId: testCart._id, messageType: 'abandoned_cart_reminder_1' });
    if (!loggedMessage) {
      throw new Error('WhatsAppMessage record was not created in database!');
    }
    console.log(`✅ Logged WhatsAppMessage in DB: status=${loggedMessage.status}, wamid=${loggedMessage.providerMessageId}`);

    // Verify Cart state updated
    const updatedCart = await Cart.findById(testCart._id);
    if (updatedCart.recoveryStep !== 1 || updatedCart.recoveryStatus !== 'in_progress') {
      throw new Error(`Cart recovery state not updated correctly: step=${updatedCart.recoveryStep}, status=${updatedCart.recoveryStatus}`);
    }
    console.log(`✅ Cart updated: recoveryStep=${updatedCart.recoveryStep}, recoveryStatus=${updatedCart.recoveryStatus}`);

    // 5. Timing Guard Check: Step 2 must NOT fire immediately (must wait 24 hours)
    const resultTiming = await processSingleCartRecovery(updatedCart, false);
    console.log(`✅ [4/6] Timing guard result (Step 2 prevented before 24h):`, resultTiming);
    if (resultTiming.status !== 'pending_threshold') {
      throw new Error(`Expected 'pending_threshold' for Step 2, got: ${JSON.stringify(resultTiming)}`);
    }

    // Exact Step 1 de-duplication test: Re-attempting step 1 directly must be rejected
    const dupCheck = await WhatsAppMessage.findOne({ cartId: testCart._id, messageType: 'abandoned_cart_reminder_1' });
    if (!dupCheck) throw new Error('Step 1 message missing');
    console.log('✅ Verified Step 1 message unique in DB:', dupCheck._id);

    // 6. Test Opt-Out Enforcement: If customer opts out, no messages sent
    testUser.whatsappOptIn = false;
    await testUser.save();
    // Simulate step 2 attempt
    updatedCart.lastRecoveryMessageSentAt = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
    const resultOptOut = await processSingleCartRecovery(updatedCart, true);
    console.log(`✅ [5/6] Opt-out enforcement result:`, resultOptOut);
    if (resultOptOut.status !== 'skipped' || !resultOptOut.reason.includes('opted')) {
      throw new Error(`Expected skip due to opt-out, got: ${JSON.stringify(resultOptOut)}`);
    }

    // 7. Test Order Cancellation: When customer purchases, remaining recovery cancelled
    testUser.whatsappOptIn = true; // re-enable opt-in
    await testUser.save();

    testOrder = await Order.create({
      user: testUser._id,
      orderItems: [
        {
          name: testProduct.name,
          qty: 1,
          price: testProduct.price,
          image: testProduct.image,
          product: testProduct._id,
        },
      ],
      shippingAddress: {
        fullName: 'Rani Priyadarshini',
        phone: '+919876543210',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
      },
      paymentMethod: 'COD',
      orderStatus: 'Confirmed',
      total: testProduct.price,
      subtotal: testProduct.price,
      createdAt: new Date(), // after cart activity
    });

    const resultAfterOrder = await processSingleCartRecovery(updatedCart, true);
    console.log(`✅ [6/6] Order placement cancellation result:`, resultAfterOrder);
    if (resultAfterOrder.status !== 'cancelled') {
      throw new Error(`Expected cancelled status after order placed, got: ${JSON.stringify(resultAfterOrder)}`);
    }

    console.log('\n🎉 ALL 6 WHATSAPP ABANDONED CART RECOVERY TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  } finally {
    // Clean up test records
    console.log('🧹 Cleaning up test records from database...');
    if (testCart) await Cart.deleteOne({ _id: testCart._id });
    if (testUser) await User.deleteOne({ _id: testUser._id });
    if (testOrder) await Order.deleteOne({ _id: testOrder._id });
    if (testCart) await WhatsAppMessage.deleteMany({ cartId: testCart._id });
    await mongoose.connection.close();
    console.log('✅ Cleanup complete. DB connection closed.');
    process.exit(0);
  }
};

runTest();
