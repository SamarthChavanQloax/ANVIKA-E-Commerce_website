import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';

dotenv.config();

async function check() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anvika_boutique';
    await mongoose.connect(mongoUri);

    // Check Jane Customer
    let customer = await User.findOne({ email: 'jane@example.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Jane Customer',
        email: 'jane@example.com',
        password: 'password123',
        role: 'customer',
      });
      console.log('✅ Created demo customer jane@example.com');
    }

    console.log('Database users verified successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
