import express from 'express';
import WhatsAppMessage from '../models/WhatsAppMessage.js';
import Cart from '../models/Cart.js';

const router = express.Router();

/**
 * @desc    Meta WhatsApp Cloud API Webhook Verification
 * @route   GET /api/webhook/whatsapp
 * @access  Public
 */
router.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'anvika_wa_webhook_verify_secret';

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ [WhatsApp Webhook] Verification successful');
      return res.status(200).send(challenge);
    } else {
      console.warn('❌ [WhatsApp Webhook] Verification token mismatch');
      return res.sendStatus(403);
    }
  }

  res.sendStatus(400);
});

/**
 * @desc    Meta WhatsApp Cloud API Status & Event Webhook
 * @route   POST /api/webhook/whatsapp
 * @access  Public
 */
router.post('/webhook/whatsapp', async (req, res) => {
  try {
    const body = req.body;

    // Immediately acknowledge Meta to prevent webhook retries
    res.status(200).send('EVENT_RECEIVED');

    if (body.object === 'whatsapp_business_account' && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          if (!value) continue;

          // Process status updates (sent, delivered, read, failed)
          const statuses = value.statuses || [];
          for (const item of statuses) {
            const wamid = item.id;
            const newStatus = item.status; // 'sent', 'delivered', 'read', 'failed'
            const timestamp = item.timestamp ? new Date(parseInt(item.timestamp, 10) * 1000) : new Date();

            if (!wamid) continue;

            const updateFields = { status: newStatus };
            if (newStatus === 'delivered') updateFields.deliveredAt = timestamp;
            if (newStatus === 'read') updateFields.readAt = timestamp;
            if (newStatus === 'failed') {
              updateFields.failedAt = timestamp;
              const error = item.errors?.[0];
              updateFields.errorMessage = error ? `${error.title || ''}: ${error.message || ''}` : 'Message delivery failed';
            }

            await WhatsAppMessage.findOneAndUpdate(
              { providerMessageId: wamid },
              { $set: updateFields }
            );
          }
        }
      }
    }
  } catch (err) {
    console.error('❌ [WhatsApp Webhook] Error processing event:', err.message);
  }
});

/**
 * @desc    Click-through tracker for recovery link in WhatsApp message
 * @route   GET /api/cart/recover/:token
 * @access  Public
 */
router.get('/cart/recover/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (token) {
      // Record click timestamp on the message log
      await WhatsAppMessage.findOneAndUpdate(
        { recoveryToken: token },
        { $set: { clickedAt: new Date() } }
      );
    }

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173')
      .split(',')[0]
      .trim()
      .replace(/\/$/, '');

    // Redirect user to the checkout page with tracking parameters
    return res.redirect(`${frontendUrl}/checkout?ref=wa_cart&recoveryToken=${token || ''}`);
  } catch (err) {
    console.error('Error handling recovery redirect:', err.message);
    res.redirect('/');
  }
});

export default router;
