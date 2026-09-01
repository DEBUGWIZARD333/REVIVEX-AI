import dotenv from 'dotenv';
dotenv.config();

const pbKey = process.env.PUSHBULLET_API_KEY || 'o.ottCr7u1OHFhbzeLxV9GWVj3Acn9EDUr';
const targetPhone = '+918825553110';
const message = '🛒 ReviveX Cart Recovery: Hi Arunesh, your items ($199.99) are saved! Complete checkout: http://localhost:5173/shop';

async function dispatchLivePushbulletSMS() {
  console.log('Fetching connected Pushbullet devices...');
  const devicesRes = await fetch('https://api.pushbullet.com/v2/devices', {
    headers: { 'Access-Token': pbKey }
  });
  const devicesData = await devicesRes.json();
  console.log('Connected Devices:', JSON.stringify(devicesData.devices, null, 2));

  const activeDevice = (devicesData.devices || []).find(d => d.active && (d.has_sms || d.kind === 'android' || d.type === 'android'));

  if (activeDevice) {
    console.log('Found SMS-enabled device:', activeDevice.nickname || activeDevice.model, '(ID:', activeDevice.iden + ')');
    console.log('Sending live SMS to', targetPhone, 'via Pushbullet...');

    const pbRes = await fetch('https://api.pushbullet.com/v2/texts', {
      method: 'POST',
      headers: {
        'Access-Token': pbKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          target_device_iden: activeDevice.iden,
          addresses: [targetPhone],
          message: message
        }
      })
    });

    const resData = await pbRes.json();
    console.log('PUSHBULLET DISPATCH RESULT:', JSON.stringify(resData, null, 2));
  } else {
    console.warn('No active SMS-enabled device found yet! Devices count:', (devicesData.devices || []).length);
  }
}
dispatchLivePushbulletSMS();
