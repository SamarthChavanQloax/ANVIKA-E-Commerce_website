import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Product from './models/Product.js';
import Category from './models/Category.js';
import User from './models/User.js';
import { products as catalogProducts } from '../frontend/src/data/products.js';

dotenv.config();

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

async function sync() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anvika_boutique';
    console.log('Connecting to:', mongoUri);
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ Connected to DB "${conn.connection.db.databaseName}"`);

    // 1. Ensure Admin User
    let admin = await User.findOne({ email: 'admin@anvika.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@anvika.com',
        password: 'password123',
        role: 'admin',
      });
      console.log('✅ Admin user created.');
    } else {
      admin.password = 'password123';
      admin.role = 'admin';
      await admin.save();
      console.log('✅ Admin user password updated to "password123".');
    }

    // 2. Ensure Categories
    const distinctCategories = [
      { name: 'Sarees', slug: 'sarees', description: 'Handcrafted traditional Banarasi, Kanjivaram, and Tissue silk drapes', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop' },
      { name: "Women's Wear", slug: 'womens-wear', description: 'Designer kurtas, anarkalis, and ethnic sets', image: 'https://images.unsplash.com/photo-1583391733959-b202242138bc?q=80&w=800&auto=format&fit=crop' },
      { name: 'Dresses', slug: 'dresses', description: 'Contemporary & traditional Indian dresses and coord sets', image: 'https://images.unsplash.com/photo-1583391733959-b202242138bc?q=80&w=800&auto=format&fit=crop' },
      { name: 'Baby & Kids', slug: 'baby-kids', description: 'Soft organic cotton dresses and festive ethnic wear for little ones', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop' },
      { name: 'Lehengas', slug: 'lehengas', description: 'Bridal and festive embellished lehengas', image: 'https://images.unsplash.com/photo-1585465223062-8ce8a9cbbe9b?q=80&w=800&auto=format&fit=crop' },
    ];

    for (const cat of distinctCategories) {
      await Category.findOneAndUpdate(
        { name: cat.name },
        { $set: cat },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Categories synchronized.');

    // 3. Upsert All Products from catalogProducts
    let addedCount = 0;
    let updatedCount = 0;

    for (const item of catalogProducts) {
      const slug = item.slug || slugify(item.name);
      const price = Number(item.price) || 0;
      const originalPrice = Number(item.originalPrice) || price;
      const discount = item.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

      // Normalize variants if available
      let variants = [];
      if (Array.isArray(item.variants) && item.variants.length > 0) {
        variants = item.variants.map((v) => ({
          size: v.size || '',
          color: v.color || '',
          price: Number(v.price) || price,
          stock: Number(v.stock) || 0,
        }));
      } else if (Array.isArray(item.sizes) && item.sizes.length > 0) {
        // create sample variants from sizes
        variants = item.sizes.map((s, idx) => ({
          size: s,
          color: item.colors?.[0] || 'Default',
          price: price,
          stock: Math.max(3, (item.stock || 12) - idx * 2),
        }));
      }

      const totalStock = variants.length > 0
        ? variants.reduce((sum, v) => sum + v.stock, 0)
        : (Number(item.stock) || 12);

      const images = Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : [item.image || '/demo-saree.jpg'];

      const productDoc = {
        name: item.name,
        slug,
        brand: item.brand || 'Anvika Heritage',
        category: item.category || 'Sarees',
        fabric: item.fabric || 'Silk',
        price,
        originalPrice,
        discount,
        description: item.description || `${item.name} - Handcrafted luxury piece from Anvika.`,
        image: item.image || images[0],
        images,
        variants,
        stock: totalStock,
        rating: item.rating || 4.8,
        numReviews: item.reviewsCount || item.numReviews || 8,
        isFeatured: item.isFeatured !== undefined ? Boolean(item.isFeatured) : true,
        isNew: item.isNew !== undefined ? Boolean(item.isNew) : true,
        isBestseller: item.isBestseller !== undefined ? Boolean(item.isBestseller) : false,
        isActive: true,
        user: admin._id,
      };

      const existing = await Product.findOne({ name: item.name });
      if (existing) {
        await Product.updateOne({ _id: existing._id }, { $set: productDoc });
        updatedCount++;
      } else {
        await Product.create(productDoc);
        addedCount++;
      }
    }

    const finalCount = await Product.countDocuments();
    console.log(`\n🎉 Product catalog sync complete!`);
    console.log(`   - Added: ${addedCount}`);
    console.log(`   - Updated: ${updatedCount}`);
    console.log(`   - Total Products now in MongoDB: ${finalCount}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Sync Error:', err);
    process.exit(1);
  }
}

sync();
