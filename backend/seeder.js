import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
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
    role: 'customer',
  },
];

const categories = [
  { name: 'Sarees', slug: 'sarees', description: 'Handcrafted traditional and contemporary sarees', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop' },
  { name: 'Women\'s Wear', slug: 'womens-wear', description: 'Designer kurtas, anarkalis, and ethnic sets', image: 'https://images.unsplash.com/photo-1583391733959-b202242138bc?q=80&w=800&auto=format&fit=crop' },
  { name: 'Lehengas', slug: 'lehengas', description: 'Bridal and festive embellished lehengas', image: 'https://images.unsplash.com/photo-1585465223062-8ce8a9cbbe9b?q=80&w=800&auto=format&fit=crop' },
  { name: 'Baby & Kids', slug: 'baby-kids', description: 'Soft organic cotton dresses and festive ethnic wear for little ones', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop' },
];

const sampleProducts = [
  {
    name: 'Rosewood Banarasi Silk Saree',
    slug: 'rosewood-banarasi-silk-saree',
    brand: 'Anvika Heritage',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585465223062-8ce8a9cbbe9b?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'A timeless Banarasi silk saree woven with intricate gold zari work. Perfect for grand celebrations and bridal trousseaus.',
    category: 'Sarees',
    fabric: 'Banarasi Silk',
    price: 12500,
    originalPrice: 15000,
    discount: 16,
    stock: 12,
    rating: 4.9,
    numReviews: 8,
    isFeatured: true,
    isNew: true,
    isBestseller: true,
  },
  {
    name: 'Mehfil Embroidered Anarkali',
    slug: 'mehfil-embroidered-anarkali',
    brand: 'Royal Elegance',
    image: 'https://images.unsplash.com/photo-1583391733959-b202242138bc?q=80&w=800&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1583391733959-b202242138bc?q=80&w=800&auto=format&fit=crop'],
    description: 'A regal floor-length Anarkali suit featuring resham embroidery and a matching organza dupatta.',
    category: 'Women\'s Wear',
    fabric: 'Georgette',
    price: 15000,
    originalPrice: 18000,
    discount: 16,
    stock: 15,
    variants: [
      { size: 'S', color: 'Emerald Green', price: 15000, stock: 5 },
      { size: 'M', color: 'Emerald Green', price: 15000, stock: 7 },
      { size: 'L', color: 'Emerald Green', price: 15500, stock: 3 }
    ],
    rating: 5.0,
    numReviews: 12,
    isFeatured: true,
    isNew: true,
    isBestseller: false,
  },
  {
    name: 'Little Bloom Cotton Dress',
    slug: 'little-bloom-cotton-dress',
    brand: 'Anvika Kids',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop'],
    description: 'Soft, hypoallergenic organic cotton dress for baby girls, featuring delicate floral hand-block prints.',
    category: 'Baby & Kids',
    fabric: 'Organic Cotton',
    price: 2500,
    originalPrice: 2800,
    discount: 10,
    stock: 15,
    variants: [
      { size: '6-12 Months', color: 'Mustard Yellow', price: 2500, stock: 10 },
      { size: '1-2 Years', color: 'Mustard Yellow', price: 2500, stock: 5 },
      { size: '6-12 Months', color: 'Baby Pink', price: 2500, stock: 0 }
    ],
    rating: 4.7,
    numReviews: 6,
    isFeatured: false,
    isNew: true,
    isBestseller: false,
  }
];

const importData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anvika_boutique';
    await mongoose.connect(mongoUri);

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();

    // Create users individually to run pre-save password hashing hook
    const createdUsers = [];
    for (const u of users) {
      const createdUser = await User.create(u);
      createdUsers.push(createdUser);
    }
    const adminUser = createdUsers[0]._id;

    await Category.insertMany(categories);

    const products = sampleProducts.map((p) => ({
      ...p,
      user: adminUser,
    }));

    await Product.insertMany(products);

    console.log('✅ Data Imported Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeder Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anvika_boutique';
    await mongoose.connect(mongoUri);

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Category.deleteMany();

    console.log('⚠️ Data Destroyed!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Destroy Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
