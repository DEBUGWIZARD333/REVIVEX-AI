import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import connectDB from '../config/db.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Immerse yourself in pure sound with active noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions.',
    price: 199.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    stock: 25,
    rating: 4.8,
  },
  {
    name: 'Minimalist Mechanical Keyboard',
    description: 'Tactile mechanical switches, RGB backlighting, and a sleek aluminum chassis built for productivity and gaming.',
    price: 129.50,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    stock: 18,
    rating: 4.6,
  },
  {
    name: 'Organic Cotton Crewneck Hoodie',
    description: 'Ultra-soft 100% organic cotton fleece hoodie with relaxed fit and durable stitching.',
    price: 64.99,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    stock: 40,
    rating: 4.5,
  },
  {
    name: 'Smart Fitness & Health Watch',
    description: 'Track your heart rate, sleep metrics, workout routines, and notifications on a high-definition AMOLED display.',
    price: 149.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    stock: 12,
    rating: 4.7,
  },
  {
    name: 'Ergonomic Executive Desk Chair',
    description: 'Breathable mesh back support with adjustable armrests and lumbar cushioning for long working hours.',
    price: 249.00,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=800&auto=format&fit=crop&q=80',
    stock: 8,
    rating: 4.9,
  },
  {
    name: 'Stainless Steel Insulated Water Bottle',
    description: 'Keeps beverages ice-cold for 24 hours or piping hot for 12 hours. Double-wall vacuum insulation with leak-proof cap.',
    price: 29.99,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    stock: 50,
    rating: 4.4,
  },
  {
    name: 'Leather Travel Duffle Bag',
    description: 'Handcrafted full-grain leather duffle bag with spacious compartments and a detachable shoulder strap.',
    price: 189.99,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    stock: 15,
    rating: 4.8,
  },
  {
    name: 'Smart Ceramic Coffee Mug Warmer',
    description: 'Maintain your drink at the perfect temperature all day long with touch settings and automatic auto-shutoff.',
    price: 39.99,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    stock: 30,
    rating: 4.3,
  },
];

const seedData = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    console.log('Existing products cleared.');
    
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${createdProducts.length} sample products into database.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
