import * as agentLogService from './agentLogService.js';
import User from '../models/User.js';

/**
 * Direct Cellular SMS Dispatch Service (Fast2SMS / Twilio)
 */
export const sendDirectCellularSMS = async ({
  userId,
  phone = '+918825553110',
  message = 'ReviveX Cart Recovery: Complete your checkout at http://localhost:5173/checkout',
}) => {
  let targetPhone = phone;

  if (userId) {
    const userDoc = await User.findById(userId);
    if (userDoc && userDoc.phone) {
      targetPhone = userDoc.phone;
    }
  }

  // Format clean 10-digit number for Indian SMS Gateway (Fast2SMS)
  const numbersOnly = (targetPhone || '').replace(/[^0-9]/g, '');
  const tenDigitPhone = numbersOnly.length >= 10 ? numbersOnly.slice(-10) : '8825553110';
  const formattedPhone = targetPhone.startsWith('+') ? targetPhone : `+${targetPhone}`;

  let smsDispatched = false;
  let gatewayUsed = 'Simulated Cellular SMS';
  let apiResponse = null;

  // 1. Pushbullet Cellular SMS Gateway Integration (Free SIM SMS)
  if (process.env.PUSHBULLET_API_KEY) {
    try {
      const pbKey = process.env.PUSHBULLET_API_KEY;
      
      // Get device ID list from Pushbullet
      const devicesRes = await fetch('https://api.pushbullet.com/v2/devices', {
        headers: { 'Access-Token': pbKey }
      });
      const devicesData = await devicesRes.json();
      // Find active Android device connected with Pushbullet
      const activeDevice = (devicesData.devices || []).find(d => d.active && (d.has_sms || d.kind === 'android' || d.type === 'android'));

      if (activeDevice) {
        const pbRes = await fetch('https://api.pushbullet.com/v2/texts', {
          method: 'POST',
          headers: {
            'Access-Token': pbKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: {
              target_device_iden: activeDevice.iden,
              addresses: [formattedPhone],
              message: message.substring(0, 160)
            }
          })
        });
        const resData = await pbRes.json();
        apiResponse = resData;
        if (pbRes.ok) {
          smsDispatched = true;
          gatewayUsed = 'Pushbullet Free Cellular Gateway';
          console.log(`[SMSService] Pushbullet API dispatched SMS via Android SIM to ${formattedPhone}`);
        }
      }
    } catch (err) {
      console.warn('[SMSService] Pushbullet SMS exception:', err.message);
    }
  }

  // 2. Fast2SMS API Integration (Free SMS Gateway for India)
  if (!smsDispatched && process.env.FAST2SMS_API_KEY) {
    try {
      const fast2smsApiKey = process.env.FAST2SMS_API_KEY;
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: message.substring(0, 150),
          language: 'english',
          flash: 0,
          numbers: tenDigitPhone,
        }),
      });

      const resData = await response.json();
      apiResponse = resData;

      if (resData.return === true || resData.status_code === 200 || resData.status_code === 999) {
        smsDispatched = true;
        gatewayUsed = 'Fast2SMS Indian Gateway';
        console.log(`[SMSService] Fast2SMS API dispatched recovery message to ${tenDigitPhone}`);
      } else {
        console.warn(`[SMSService] Fast2SMS notice: ${resData.message}`);
      }
    } catch (err) {
      console.warn('[SMSService] Fast2SMS error:', err.message);
    }
  }

  // Audit Log
  await agentLogService.createAgentLog({
    agentName: 'SMSRecoveryService',
    eventType: 'CELLULAR_SMS_DISPATCH',
    status: 'COMPLETED',
    message: `Dispatched direct SMS to ${targetPhone} via ${gatewayUsed} (${apiResponse?.message || 'Gateway Active'})`,
    processedAt: new Date(),
  });

  return {
    success: true,
    phone: targetPhone,
    tenDigitPhone,
    message,
    smsDispatched,
    gatewayUsed,
    apiResponseMessage: apiResponse?.message,
    sentAt: new Date().toISOString(),
  };
};
