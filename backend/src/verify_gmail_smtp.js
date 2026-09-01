import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

async function verifyLiveSMTPConnection() {
  console.log('Testing Gmail SMTP Connection...');
  const passClean = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  console.log('User:', process.env.SMTP_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: passClean,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ GMAIL SMTP CONNECTION VERIFIED!');

    console.log('Sending live test email to', process.env.SMTP_USER, '...');
    const info = await transporter.sendMail({
      from: `"ReviveX Cart Recovery" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: '🎉 ReviveX Email Integration Live Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #4f46e5; border-radius: 10px;">
          <h2 style="color: #4f46e5;">ReviveX Automated Cart Recovery</h2>
          <p>Your Gmail SMTP integration is 100% active!</p>
          <p>Both <strong>Pushbullet Cellular SMS</strong> and <strong>Nodemailer Gmail Email</strong> are ready to trigger automatically whenever a customer leaves an abandoned cart.</p>
        </div>
      `
    });
    console.log('✅ LIVE EMAIL DELIVERED SUCCESSFULLY! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ SMTP Error:', err.message);
  }
  process.exit(0);
}
verifyLiveSMTPConnection();
