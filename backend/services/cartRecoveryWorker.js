import crypto from 'crypto';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import WhatsAppMessage from '../models/WhatsAppMessage.js';
import { sendAbandonedCartWhatsApp } from './whatsappService.js';

// Configuration intervals in milliseconds
const getDelayMinutes = (step) => {
  if (step === 1) return parseInt(process.env.ABANDONED_CART_DELAY_MINUTES_STEP1 || '30', 10);
  if (step === 2) return parseInt(process.env.ABANDONED_CART_DELAY_MINUTES_STEP2 || '1440', 10); // 24h
  if (step === 3) return parseInt(process.env.ABANDONED_CART_DELAY_MINUTES_STEP3 || '2880', 10); // 48h
  return 30;
};

let workerTimer = null;
let isProcessing = false;

/**
 * Checks and processes a single cart for abandoned cart recovery
 * 
 * @param {Object} cart - Populated or unpopulated Cart document
 * @param {boolean} [forceImmediate=false] - If true, bypasses time threshold (e.g. for Admin manual trigger)
 */
export const processSingleCartRecovery = async (cart, forceImmediate = false) => {
  // 1. Verify Cart has items
  if (!cart.items || cart.items.length === 0 || cart.subtotal <= 0) {
    if (cart.recoveryStatus !== 'none') {
      cart.recoveryStatus = 'cancelled';
      await cart.save();
    }
    return { status: 'skipped', reason: 'Cart is empty' };
  }

  // 2. Fetch cart owner and check WhatsApp opt-in
  const user = await User.findById(cart.user);
  if (!user) {
    return { status: 'skipped', reason: 'User not found' };
  }

  // Strict check: WhatsApp opt-in is required
  if (!user.whatsappOptIn) {
    return { status: 'skipped', reason: 'User has not opted into WhatsApp marketing' };
  }

  // Notification preference check
  if (user.notificationPreferences?.abandonedCart === false) {
    return { status: 'skipped', reason: 'User disabled abandoned cart notifications' };
  }

  const recipientPhone = user.phone;
  if (!recipientPhone) {
    return { status: 'skipped', reason: 'User has no phone number on file' };
  }

  // 3. Verify customer has NOT placed an order since last cart activity
  const recentOrder = await Order.findOne({
    user: user._id,
    createdAt: { $gte: cart.lastActivityAt || cart.updatedAt },
    orderStatus: { $ne: 'Cancelled' },
  });

  if (recentOrder) {
    // Customer purchased! Cancel any further recovery messages
    cart.recoveryStatus = 'completed';
    cart.recoveredAt = recentOrder.createdAt;
    cart.recoveryOrder = recentOrder._id;
    await cart.save();
    return { status: 'cancelled', reason: 'Customer has already placed an order' };
  }

  // 4. Determine next recovery step
  const currentStep = cart.recoveryStep || 0;
  const nextStep = currentStep + 1;

  if (nextStep > 3) {
    return { status: 'completed', reason: 'Maximum recovery sequence (3 steps) completed' };
  }

  const messageType = `abandoned_cart_reminder_${nextStep}`;

  // 5. Time threshold check (unless forced immediately)
  if (!forceImmediate) {
    const delayMinutes = getDelayMinutes(nextStep);
    const referenceTime = nextStep === 1 
      ? (cart.lastActivityAt || cart.updatedAt || new Date())
      : (cart.lastRecoveryMessageSentAt || cart.lastActivityAt);

    const elapsedMinutes = (Date.now() - new Date(referenceTime).getTime()) / (1000 * 60);

    if (elapsedMinutes < delayMinutes) {
      return { 
        status: 'pending_threshold', 
        elapsedMinutes: Math.floor(elapsedMinutes), 
        requiredMinutes: delayMinutes 
      };
    }
  }

  // 6. Check de-duplication: Ensure this step was not already sent
  const existingMessage = await WhatsAppMessage.findOne({
    cartId: cart._id,
    messageType,
    status: { $in: ['sent', 'delivered', 'read', 'pending'] },
  });

  if (existingMessage) {
    return { status: 'already_sent', messageId: existingMessage._id };
  }

  // 7. Prepare dynamic parameters for template
  const primaryItem = cart.items[0];
  const productName = primaryItem?.name || 'Exclusive Heirloom Piece';
  const productImage = primaryItem?.image || '';

  // Generate or reuse persistent recovery token
  if (!cart.recoveryToken) {
    cart.recoveryToken = `rec_${crypto.randomBytes(12).toString('hex')}`;
  }

  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')[0]
    .trim()
    .replace(/\/$/, '');

  const recoveryUrl = `${frontendUrl}/checkout?ref=wa_cart&recoveryToken=${cart.recoveryToken}`;

  // 8. Create pending message record in DB first
  let messageRecord;
  try {
    messageRecord = await WhatsAppMessage.create({
      userId: user._id,
      cartId: cart._id,
      phoneNumber: recipientPhone,
      messageType,
      templateName: process.env[`WHATSAPP_TEMPLATE_NAME_REMINDER_${nextStep}`] || 'anvika_abandoned_cart_v1',
      status: 'pending',
      recoveryToken: cart.recoveryToken,
      variables: {
        customerName: user.name || 'Valued Customer',
        productName,
        productImage,
        cartTotal: cart.subtotal,
        cartUrl: recoveryUrl,
        storeName: 'Anvika Boutique',
      },
    });
  } catch (dbErr) {
    // If compound index constraint triggers, duplicate prevented!
    if (dbErr.code === 11000) {
      return { status: 'duplicate_prevented', reason: 'Message for this step already exists' };
    }
    throw dbErr;
  }

  // 9. Dispatch WhatsApp message via WhatsApp service
  try {
    const dispatchResult = await sendAbandonedCartWhatsApp({
      to: recipientPhone,
      customerName: user.name || 'Valued Customer',
      productName,
      productImage,
      cartTotal: cart.subtotal,
      cartUrl: recoveryUrl,
      templateName: messageRecord.templateName,
      step: nextStep,
    });

    // Update message log status
    messageRecord.status = 'sent';
    messageRecord.providerMessageId = dispatchResult.messageId;
    messageRecord.sentAt = new Date();
    messageRecord.metaResponseRaw = dispatchResult.raw;
    await messageRecord.save();

    // Update Cart recovery tracking state
    cart.isAbandoned = true;
    if (!cart.abandonedAt) cart.abandonedAt = new Date();
    cart.recoveryStatus = 'in_progress';
    cart.recoveryStep = nextStep;
    cart.lastRecoveryMessageSentAt = new Date();
    await cart.save();

    return {
      status: 'success',
      step: nextStep,
      messageId: messageRecord._id,
      providerMessageId: dispatchResult.messageId,
      simulated: dispatchResult.simulated,
    };
  } catch (sendErr) {
    messageRecord.status = 'failed';
    messageRecord.failedAt = new Date();
    messageRecord.errorMessage = sendErr.message;
    await messageRecord.save();

    return {
      status: 'failed',
      error: sendErr.message,
    };
  }
};

/**
 * Sweeper function that searches for eligible abandoned carts across the database
 */
export const runAbandonedCartRecoverySweep = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const step1ThresholdMinutes = getDelayMinutes(1);
    const thresholdDate = new Date(Date.now() - step1ThresholdMinutes * 60 * 1000);

    // Find carts with items that have been inactive past the threshold
    const eligibleCarts = await Cart.find({
      'items.0': { $exists: true },
      subtotal: { $gt: 0 },
      recoveryStatus: { $in: ['none', 'scheduled', 'in_progress'] },
      lastActivityAt: { $lte: thresholdDate },
    }).populate('user', 'name phone whatsappOptIn notificationPreferences');

    let processedCount = 0;
    let sentCount = 0;

    for (const cart of eligibleCarts) {
      // Re-verify if cart owner opted into WhatsApp
      if (cart.user && cart.user.whatsappOptIn) {
        processedCount++;
        const result = await processSingleCartRecovery(cart, false);
        if (result.status === 'success') {
          sentCount++;
        }
      }
    }

    if (processedCount > 0) {
      console.log(`[CartRecoveryWorker] Checked ${processedCount} inactive carts, dispatched ${sentCount} reminders.`);
    }
  } catch (error) {
    console.error('❌ [CartRecoveryWorker] Error during recovery sweep:', error.message);
  } finally {
    isProcessing = false;
  }
};

/**
 * Initializes and starts the background recovery worker
 * Runs every 2 minutes by default (configurable)
 */
export const startCartRecoveryWorker = () => {
  if (workerTimer) return;

  const intervalMs = parseInt(process.env.CART_RECOVERY_POLL_INTERVAL_MS || '120000', 10); // default 2 mins

  console.log(`⏰ [CartRecoveryWorker] Initialized. Scanning for abandoned carts every ${intervalMs / 1000}s`);

  // Run initial sweep shortly after startup (10s delay to allow DB connection to stabilize)
  setTimeout(() => {
    runAbandonedCartRecoverySweep().catch(() => {});
  }, 10000);

  // Set recurring interval
  workerTimer = setInterval(() => {
    runAbandonedCartRecoverySweep().catch(() => {});
  }, intervalMs);
};

/**
 * Stops the worker cleanly on server shutdown
 */
export const stopCartRecoveryWorker = () => {
  if (workerTimer) {
    clearInterval(workerTimer);
    workerTimer = null;
    console.log('🛑 [CartRecoveryWorker] Stopped.');
  }
};
