import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function updateAllPhones() {
  await connectDB();
  const res = await User.updateMany(
    { phone: { $in: ['+1 (555) 234-5678', null, ''] } },
    { $set: { phone: '+918825553110' } }
  );
  console.log('Updated user phone numbers in DB:', res);
  process.exit(0);
}
updateAllPhones();
