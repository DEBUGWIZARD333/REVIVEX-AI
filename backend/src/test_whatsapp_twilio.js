import dotenv from 'dotenv';
dotenv.config();

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
const targetPhone = '+918825553110';

const text = `🛒 *ReviveX Cart Recovery*\n\nHi Arunesh,\nYou left items valued at *$199.99* in your shopping cart!\n🎁 Use Code *REVIVE15* for *15% OFF* at checkout!\n\n👉 Click here to complete your order:\nhttp://localhost:5173/cart?recovery_token=revivex_demo_123\n\nItems reserved for a limited time.`;

const authHeader = 'Basic ' + Buffer.from(twilioAccountSid + ':' + twilioAuthToken).toString('base64');
const bodyParams = new URLSearchParams({
  From: twilioFromNumber,
  To: 'whatsapp:' + targetPhone,
  Body: text,
});

async function run() {
  console.log("Sending freeform WhatsApp message to", targetPhone, "via Twilio...");
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: bodyParams.toString(),
  });

  const resData = await res.json();
  console.log("Response Status:", res.status);
  console.log("Response Payload:", JSON.stringify(resData, null, 2));
}

run();
