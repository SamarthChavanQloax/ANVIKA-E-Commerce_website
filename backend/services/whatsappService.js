import axios from 'axios';

/**
 * Normalizes phone numbers to international format (defaulting to India +91 if 10 digits)
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.toString().replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned.slice(1); // Meta WhatsApp API expects digits without '+'
  }
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }
  return cleaned;
};

/**
 * Checks whether live WhatsApp Cloud API credentials are configured
 */
export const isWhatsAppConfigured = () => {
  const isEnabled = process.env.WHATSAPP_ENABLED === 'true';
  const hasToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN && !process.env.WHATSAPP_ACCESS_TOKEN.includes('your_'));
  const hasPhoneId = Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID && !process.env.WHATSAPP_PHONE_NUMBER_ID.includes('your_'));
  return isEnabled && hasToken && hasPhoneId;
};

/**
 * Dispatches an Abandoned Cart Reminder template message
 * 
 * @param {Object} params
 * @param {string} params.to - Customer WhatsApp phone number
 * @param {string} params.customerName - Customer name
 * @param {string} params.productName - Main product name waiting in cart
 * @param {string} [params.productImage] - Optional product image URL for header
 * @param {number} params.cartTotal - Cart total amount
 * @param {string} params.cartUrl - Direct URL to recover cart / complete purchase
 * @param {string} [params.templateName] - Meta approved template name
 * @param {string} [params.step] - Step identifier (1, 2, or 3)
 */
export const sendAbandonedCartWhatsApp = async ({
  to,
  customerName = 'Valued Customer',
  productName = 'Curated Artisan Piece',
  productImage,
  cartTotal = 0,
  cartUrl,
  templateName,
  step = 1,
}) => {
  const formattedPhone = formatPhoneNumber(to);

  if (!formattedPhone || formattedPhone.length < 10) {
    throw new Error(`Invalid recipient WhatsApp phone number: ${to}`);
  }

  const activeTemplate =
    templateName ||
    process.env[`WHATSAPP_TEMPLATE_NAME_REMINDER_${step}`] ||
    process.env.WHATSAPP_TEMPLATE_NAME ||
    'anvika_abandoned_cart_v1';

  const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US';
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  // Extract relative path or full token for CTA button
  // If template has a dynamic URL button {{1}}, Meta expects the suffix parameter
  const urlSuffix = cartUrl.includes('/cart') 
    ? cartUrl.substring(cartUrl.indexOf('/cart')) 
    : cartUrl;

  const components = [];

  // Optional Header Image component if supported by the template
  if (productImage && productImage.startsWith('http')) {
    components.push({
      type: 'header',
      parameters: [
        {
          type: 'image',
          image: { link: productImage },
        },
      ],
    });
  }

  // Body parameters matching template placeholders:
  // {{1}}: customerName
  // {{2}}: productName
  // {{3}}: formatted cart total
  components.push({
    type: 'body',
    parameters: [
      { type: 'text', text: customerName },
      { type: 'text', text: productName },
      { type: 'text', text: `₹${Number(cartTotal).toLocaleString('en-IN')}` },
    ],
  });

  // Action Button component (Complete Purchase)
  components.push({
    type: 'button',
    sub_type: 'url',
    index: '0',
    parameters: [
      {
        type: 'text',
        text: urlSuffix,
      },
    ],
  });

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedPhone,
    type: 'template',
    template: {
      name: activeTemplate,
      language: {
        code: languageCode,
      },
      components,
    },
  };

  // If live credentials are NOT enabled/available, run in Simulation / Mock Mode
  if (!isWhatsAppConfigured()) {
    const simulatedWamid = `wamid.sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    console.log('\n💬 [WhatsApp Cloud API Simulation Mode]');
    console.log(`📱 Recipient: +${formattedPhone} (${customerName})`);
    console.log(`📋 Template: ${activeTemplate} (Step ${step})`);
    console.log(`👜 Product: ${productName} | Cart Total: ₹${cartTotal}`);
    console.log(`🔗 Action Button Link: ${cartUrl}`);
    console.log(`🆔 Simulated Message ID: ${simulatedWamid}\n`);

    return {
      success: true,
      simulated: true,
      messageId: simulatedWamid,
      status: 'sent',
      sentAt: new Date(),
    };
  }

  // Live Meta WhatsApp Cloud API request with automatic retry
  const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
  let lastError;
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const messageId = response.data?.messages?.[0]?.id;

      return {
        success: true,
        simulated: false,
        messageId: messageId || `wamid.live_${Date.now()}`,
        status: 'sent',
        sentAt: new Date(),
        raw: response.data,
      };
    } catch (err) {
      lastError = err;
      const errorData = err.response?.data?.error || {};
      console.warn(
        `⚠️ WhatsApp API dispatch attempt ${attempt}/${maxRetries} failed:`,
        errorData.message || err.message
      );

      // Do not retry on client/validation errors (4xx except rate limit 429)
      const statusCode = err.response?.status;
      if (statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
        break;
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  const errorMessage = lastError.response?.data?.error?.message || lastError.message;
  throw new Error(`Meta WhatsApp Cloud API error: ${errorMessage}`);
};
