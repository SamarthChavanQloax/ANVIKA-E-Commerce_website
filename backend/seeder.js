import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Order from './models/Order.js';

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@anvika.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Jane Customer',
    email: 'jane@example.com',
    password: 'password123',
  },
];

const categories = [
  { name: 'Sarees', slug: 'sarees' },
  { name: 'Women\'s Dresses', slug: 'womens-dresses' },
  { name: 'Kurtis', slug: 'kurtis' },
  { name: 'Baby Girls', slug: 'baby-girls' },
  { name: 'Baby Boys', slug: 'baby-boys' },
  { name: 'Accessories', slug: 'accessories' },
];

const sampleProducts = [
  {
    name: 'Rosewood Banarasi Silk Saree',
    slug: 'rosewood-banarasi-silk-saree',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585465223062-8ce8a9cbbe9b?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'A timeless Banarasi silk saree woven with intricate zari work. Perfect for weddings and grand celebrations.',
    category: 'Sarees',
    fabric: 'Banarasi Silk',
    price: 12500,
    originalPrice: 15000,
    discount: 16,
    stock: 10,
    isFeatured: true,
    isNew: true,
  },
  {
    name: 'Moonlight Chanderi Saree',
    slug: 'moonlight-chanderi-saree',
    image: 'https://images.unsplash.com/photo-1585465223062-8ce8a9cbbe9b?q=80&w=800&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1585465223062-8ce8a9cbbe9b?q=80&w=800&auto=format&fit=crop'],
    description: 'Lightweight and elegant Chanderi silk with delicate motifs. A graceul choice for daytime events.',
    category: 'Sarees',
    fabric: 'Chanderi Silk',
    price: 8900,
    stock: 5,
    isBestseller: true,
  },
  {
    name: 'Mehfil Embroidered Anarkali',
    slug: 'mehfil-embroidered-anarkali',
    image: 'https://images.unsplash.com/photo-1583391733959-b202242138bc?q=80&w=800&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1583391733959-b202242138bc?q=80&w=800&auto=format&fit=crop'],
    description: 'A royal Anarkali suit featuring heavy embroidery and a matching dupatta.',
    category: 'Women\'s Dresses',
    fabric: 'Georgette',
    price: 15000,
    stock: 8,
    isFeatured: true,
  },
  {
    name: 'Little Bloom Cotton Dress',
    slug: 'little-bloom-cotton-dress',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop'],
    description: 'Soft, breathable cotton dress for baby girls, featuring delicate floral prints.',
    category: 'Baby Girls',
    fabric: 'Organic Cotton',
    price: 2500,
    stock: 15,
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/anvika_boutique');

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();

    const seededUsers = await Promise.all(users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 10),
    })));
    const createdUsers = await User.insertMany(seededUsers);
    const adminUser = createdUsers[0]._id;

    await Category.insertMany(categories);

    const products = sampleProducts.map((p) => {
      return { ...p, user: adminUser };
    });

    await Product.insertMany(products);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/anvika_boutique');

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
