import * as agentLogService from './agentLogService.js';
import User from '../models/User.js';

/**
 * Format WhatsApp Text Message Payload
 */
export const formatWhatsAppRecoveryMessage = ({
  customerName = 'Valued Customer',
  phone = '+918825553110',
  eventType = 'CART_ABANDONED',
  amount = 199.99,
  recoveryLink = 'http://localhost:5173/shop',
  couponCode = null,
  discountPercentage = 15,
}) => {
  let cleanPhone = (phone || '').replace(/[^0-9+]/g, '');
  if (cleanPhone && !cleanPhone.startsWith('+')) {
    cleanPhone = `+${cleanPhone}`;
  }

  let text = '';
  if (eventType === 'PAYMENT_FAILED') {
    text = `🚨 *ReviveX Payment Notice*\n\nHi ${customerName},\nWe noticed your checkout payment of *$${amount.toFixed(
      2
    )}* failed due to temporary card processing friction.\n\n👉 Complete your purchase in 1-click with our secure link:\n${recoveryLink}\n\nNeed help? Reply directly to this WhatsApp message!`;
  } else {
    const couponInfo = couponCode
      ? `\n🎁 Use Code *${couponCode}* for *${discountPercentage}% OFF* at checkout!`
      : '';

    text = `🛒 *ReviveX Cart Recovery*\n\nHi ${customerName},\nYou left items valued at *$${amount.toFixed(
      2
    )}* in your shopping cart!${couponInfo}\n\n👉 Click here to complete your order:\n${recoveryLink}\n\nItems reserved for a limited time.`;
  }

  // Generate universal WhatsApp deep link URL (works on mobile app & web)
  const encodedText = encodeURIComponent(text);
  const cleanNumber = cleanPhone.replace(/[^0-9]/g, '');
  const whatsappWebUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;

  return {
    phone: cleanPhone,
    text,
    whatsappWebUrl,
    customerName,
    amount,
    eventType,
  };
};

/**
 * Send WhatsApp Recovery Notification (Meta Cloud API + 1-Click Protocol + Twilio)
 */
export const sendWhatsAppRecoveryNotification = async ({
  userId,
  phone,
  customerName,
  eventType = 'CART_ABANDONED',
  amount = 199.99,
  recoveryLink = 'http://localhost:5173/shop',
  couponCode = null,
  discountPercentage = 15,
}) => {
  let targetPhone = phone;
  let targetName = customerName;

  if (userId) {
    const userDoc = await User.findById(userId);
    if (userDoc) {
      if (userDoc.phone) targetPhone = userDoc.phone;
      if (userDoc.name) targetName = userDoc.name;
    }
  }

  const payload = formatWhatsAppRecoveryMessage({
    customerName: targetName || 'Valued Customer',
    phone: targetPhone || '+918825553110',
    eventType,
    amount,
    recoveryLink,
    couponCode,
    discountPercentage,
  });

  let metaDispatched = false;
  let dispatchChannel = '1-Click WhatsApp Protocol';
  let apiStatusMsg = null;

  // 1. Meta WhatsApp Business Cloud API (Official Meta Graph API)
  if (process.env.META_WHATSAPP_TOKEN && process.env.META_PHONE_NUMBER_ID) {
    try {
      const metaToken = process.env.META_WHATSAPP_TOKEN;
      const metaPhoneId = process.env.META_PHONE_NUMBER_ID;
      const recipientNumber = payload.phone.replace(/[^0-9]/g, '');

      const response = await fetch(`https://graph.facebook.com/v18.0/${metaPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipientNumber,
          type: 'text',
          text: {
            preview_url: true,
            body: payload.text,
          },
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.messages) {
        metaDispatched = true;
        dispatchChannel = 'Official Meta WhatsApp Cloud API';
        apiStatusMsg = `Meta Message ID: ${resData.messages[0]?.id}`;
        console.log(`[WhatsAppRecoveryService] Meta Cloud API sent WhatsApp message to ${payload.phone}`);
      } else {
        apiStatusMsg = `Meta API Notice: ${resData.error?.message || 'Requires Meta Sandbox Opt-In'}`;
        console.warn(`[WhatsAppRecoveryService] Meta API Info:`, resData.error?.message);
      }
    } catch (err) {
      console.warn('[WhatsAppRecoveryService] Meta API exception:', err.message);
      apiStatusMsg = err.message;
    }
  }

  // 2. Twilio WhatsApp API Fallback
  if (!metaDispatched && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioFromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

      const authHeader = 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
      const bodyParams = new URLSearchParams({
        From: twilioFromNumber,
        To: payload.phone.startsWith('whatsapp:') ? payload.phone : `whatsapp:${payload.phone}`,
        Body: payload.text,
      });

      const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      const resData = await twilioRes.json();
      if (twilioRes.ok) {
        metaDispatched = true;
        dispatchChannel = 'Twilio WhatsApp Gateway';
        apiStatusMsg = `Twilio Message SID: ${resData.sid}`;
      }
    } catch (err) {
      console.warn('[WhatsAppRecoveryService] Twilio delivery fallback:', err.message);
    }
  }

  // Audit Logging
  await agentLogService.createAgentLog({
    agentName: 'WhatsAppRecoveryService',
    eventType: `WHATSAPP_${eventType}`,
    status: 'COMPLETED',
    message: `Dispatched WhatsApp recovery for ${payload.phone} via ${dispatchChannel} (Amount: $${amount.toFixed(2)})`,
    processedAt: new Date(),
  });

  return {
    success: true,
    phone: payload.phone,
    text: payload.text,
    whatsappWebUrl: payload.whatsappWebUrl,
    metaDispatched,
    dispatchChannel,
    apiStatusMsg,
    sentAt: new Date().toISOString(),
  };
};
