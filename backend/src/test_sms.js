import dotenv from 'dotenv';
dotenv.config();

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromNumber = process.env.TWILIO_SMS_NUMBER || '+918825553110';
const targetPhone = '+918825553110';
const text = '🛒 ReviveX Cart Recovery: Hi Arunesh, items worth $199.99 are waiting in your cart! Coupon REVIVE15: http://localhost:5173/shop';

const authHeader = 'Basic ' + Buffer.from(twilioAccountSid + ':' + twilioAuthToken).toString('base64');
const bodyParams = new URLSearchParams({
  From: twilioFromNumber,
  To: targetPhone,
  Body: text,
});

async function sendSMS() {
  console.log('Sending direct SMS to', targetPhone, 'via Twilio...');
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: bodyParams.toString(),
  });
  const data = await res.json();
  console.log('SMS RESPONSE STATUS:', res.status);
  console.log('SMS RESPONSE DATA:', JSON.stringify(data, null, 2));
}
sendSMS();
