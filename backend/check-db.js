import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

// Ensure Google DNS is used for MongoDB Atlas SRV lookup
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const checkConnection = async () => {
  const uri = process.env.MONGO_URI;
  console.log('\n--- Checking Database Connection ---');
  console.log(`Target: ${uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'No MONGO_URI found'}`);

  if (!uri) {
    console.error('❌ Error: MONGO_URI is not set in backend/.env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ Connection Status: Connected Successfully!');
    console.log(`🌐 Cluster Host: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);

    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\n📊 Database Collections & Counts:');
    if (collections.length === 0) {
      console.log(' (No collections found yet)');
    } else {
      for (const col of collections) {
        const count = await conn.connection.db.collection(col.name).countDocuments();
        console.log(` • ${col.name.padEnd(15)} : ${count} document(s)`);
      }
    }

    console.log('\n------------------------------------\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection Failed!');
    console.error(`Error details: ${error.message}\n`);
    process.exit(1);
  }
};

checkConnection();
