import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      });
      console.log('✅ Admin user created: admin@example.com / password123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Check if customer user exists
    const userExists = await User.findOne({ email: 'user@example.com' });
    if (!userExists) {
      await User.create({
        name: 'Demo Customer',
        email: 'user@example.com',
        password: 'password123',
        role: 'user',
      });
      console.log('✅ Demo customer created: user@example.com / password123');
    } else {
      console.log('ℹ️ Demo customer already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
