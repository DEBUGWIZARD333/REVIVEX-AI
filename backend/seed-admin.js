import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/revenue_recovery';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const email = 'arun2k07@gmail.com';
    const password = '123456';
    
    // Remove if exists
    await User.deleteOne({ email });

    const adminUser = await User.create({
      name: 'Admin',
      email: email,
      phone: '+919876543210',
      password: password,
      role: 'admin'
    });

    console.log('--- ADMIN SEED SUCCESSFUL ---');
    console.log('Admin Email:', adminUser.email);
    console.log('Admin Role:', adminUser.role);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
