import 'dotenv/config';
import nodemailer from 'nodemailer';

async function testSMTP() {
  console.log('Testing SMTP connection...');
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Missing SMTP credentials in .env');
    return false;
  }
  
  try {
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: smtpPass,
      },
    });

    await transporter.verify();
    console.log('✅ SMTP Authenticated successfully! Ready to send emails.');
    
    // Actually send a test email to the user
    console.log(`Sending test email to ${process.env.SMTP_USER}...`);
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'ReviveX Test'}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'ReviveX Connection Test',
      html: '<h1>Success!</h1><p>Your SMTP configuration is working perfectly.</p>',
    });
    console.log(`✅ Test email delivered! Message ID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('❌ SMTP Test Failed:', err.message);
    return false;
  }
}

async function testPushbullet() {
  console.log('\nTesting Pushbullet connection...');
  if (!process.env.PUSHBULLET_API_KEY) {
    console.error('❌ Missing PUSHBULLET_API_KEY in .env');
    return false;
  }

  try {
    const pbKey = process.env.PUSHBULLET_API_KEY;
    const devicesRes = await fetch('https://api.pushbullet.com/v2/devices', {
      headers: { 'Access-Token': pbKey }
    });
    
    if (!devicesRes.ok) {
       console.error(`❌ Pushbullet authentication failed. HTTP Status: ${devicesRes.status}`);
       return false;
    }

    const devicesData = await devicesRes.json();
    const activeDevice = (devicesData.devices || []).find(d => d.active && (d.has_sms || d.kind === 'android' || d.type === 'android'));

    if (activeDevice) {
      console.log(`✅ Pushbullet Authenticated! Found active Android device: ${activeDevice.model} (${activeDevice.iden})`);
      console.log('Pushbullet is ready to dispatch SMS through this device.');
      return true;
    } else {
      console.error('❌ Pushbullet Authenticated, but NO ACTIVE ANDROID DEVICE found that can send SMS.');
      console.log('Available devices:', devicesData.devices.map(d => ({ id: d.iden, model: d.model, kind: d.kind, active: d.active })));
      return false;
    }
  } catch (err) {
    console.error('❌ Pushbullet Test Failed:', err.message);
    return false;
  }
}

async function runDiagnostics() {
  console.log('--- ReviveX Communications Diagnostics ---\n');
  await testSMTP();
  await testPushbullet();
  console.log('\n------------------------------------------');
}

runDiagnostics();
