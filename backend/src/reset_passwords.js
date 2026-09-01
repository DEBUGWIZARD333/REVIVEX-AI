import connectDB from './config/db.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function resetDemoPasswords() {
  await connectDB();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);

  await User.updateMany({}, { $set: { password: hashedPassword } });
  console.log('Successfully set all user passwords to: 123456');
  process.exit(0);
}
resetDemoPasswords();
