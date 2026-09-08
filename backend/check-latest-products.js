import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function check() {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB:', conn.connection.db.databaseName);
  const total = await Product.countDocuments();
  console.log('Total Products in MongoDB:', total);

  const latest = await Product.find({}).sort({ createdAt: -1 }).limit(5);
  console.log('Latest 5 Products:');
  for (const p of latest) {
    console.log(`- [${p._id}] "${p.name}" | Category: "${p.category}" | Price: ${p.price} | isNew: ${p.isNew} | isFeatured: ${p.isFeatured} | isActive: ${p.isActive}`);
  }

  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
