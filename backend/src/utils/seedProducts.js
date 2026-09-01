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
  {
    name: 'Ultra-Wide 34-Inch Curved Monitor',
    description: 'Immersive gaming and productivity experience with 144Hz refresh rate, QHD resolution, and AMD FreeSync.',
    price: 499.00,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=800&auto=format&fit=crop&q=80',
    stock: 10,
    rating: 4.9,
  },
  {
    name: 'Premium Leather Smart Wallet',
    description: 'Trackable smart wallet made from full-grain leather. Built-in RFID blocking and quick-access card slots.',
    price: 79.99,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
    stock: 55,
    rating: 4.7,
  },
  {
    name: 'Smart Home Hub Display',
    description: 'Control your entire smart home, make video calls, and watch videos on this 10-inch smart display.',
    price: 229.00,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&auto=format&fit=crop&q=80',
    stock: 22,
    rating: 4.5,
  },
  {
    name: 'Adjustable Dumbbell Set',
    description: 'Space-saving adjustable dumbbells that replace 15 sets of weights. Adjust from 5 to 52.5 lbs with a simple dial.',
    price: 349.00,
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
    stock: 5,
    rating: 4.8,
  },
  {
    name: 'Polarized Aviator Sunglasses',
    description: 'Classic aviator style with premium polarized lenses for 100% UV protection and glare reduction.',
    price: 119.50,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
    stock: 38,
    rating: 4.6,
  },
  {
    name: 'Portable Espresso Maker',
    description: 'Brew rich, authentic espresso anywhere. Manually operated, no battery or electricity required.',
    price: 54.90,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=800&auto=format&fit=crop&q=80',
    stock: 45,
    rating: 4.4,
  },
  {
    name: 'High-Fidelity Turntable',
    description: 'Experience the warm sound of vinyl. Belt-drive motor, built-in preamp, and Bluetooth connectivity.',
    price: 299.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=800&auto=format&fit=crop&q=80',
    stock: 12,
    rating: 4.9,
  },
  {
    name: 'Merino Wool Hiking Socks (3-Pack)',
    description: 'Breathable, moisture-wicking merino wool blend to keep your feet dry and blister-free on long trails.',
    price: 34.00,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&auto=format&fit=crop&q=80',
    stock: 120,
    rating: 4.8,
  },
  {
    name: 'Smart Plant Moisture Monitor',
    description: 'Never kill a houseplant again. Sends alerts to your phone when your plants need water or sunlight.',
    price: 24.99,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1416879598555-220b3df2a5e4?w=800&auto=format&fit=crop&q=80',
    stock: 65,
    rating: 4.2,
  },
  {
    name: 'Noise-Isolating Earbuds',
    description: 'Compact true wireless earbuds with deep bass, active noise isolation, and a 24-hour charging case.',
    price: 89.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    stock: 40,
    rating: 4.5,
  },
  {
    name: 'Gourmet Cast Iron Skillet',
    description: 'Pre-seasoned 12-inch cast iron skillet. Perfect for searing, baking, and frying with incredible heat retention.',
    price: 49.95,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1585007600263-71228e40c8d1?w=800&auto=format&fit=crop&q=80',
    stock: 25,
    rating: 4.7,
  }
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
