import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Order from './models/Order.js';
import User from './models/User.js';

dotenv.config();

if (process.platform === 'win32' || process.env.CUSTOM_DNS === 'true') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

const syncAndInspectOrders = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anvika_boutique';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  } catch (err) {
    const fallbackUri = 'mongodb://anvika_admin:Qloax123@ac-uqatpw3-shard-00-00.6f3gpag.mongodb.net:27017,ac-uqatpw3-shard-00-01.6f3gpag.mongodb.net:27017,ac-uqatpw3-shard-00-02.6f3gpag.mongodb.net:27017/anvika_boutique?ssl=true&replicaSet=atlas-w3rxdd-shard-0&authSource=admin&retryWrites=true&w=majority';
    await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 10000 });
  }

  // 1. Backfill customer snapshot on any order missing it
  const allOrders = await Order.find({}).populate('user', 'name email phone');
  let backfilledCount = 0;

  for (const o of allOrders) {
    if (!o.customer || !o.customer.name) {
      o.customer = {
        id: o.user?._id || o.user,
        name: o.user?.name || o.shippingAddress?.fullName || 'Customer',
        email: o.user?.email || o.paymentResult?.email_address || 'N/A',
        phone: o.user?.phone || o.shippingAddress?.phone || 'N/A',
      };
      if (!o.shippingAddress?.fullName && o.user?.name) {
        o.shippingAddress.fullName = o.user.name;
      }
      await o.save();
      backfilledCount++;
    }
  }

  console.log(`\n✅ Synced customer details on ${backfilledCount} orders in database.`);

  // 2. Fetch latest order directly
  const latestOrder = await Order.findOne({}).sort({ createdAt: -1 }).lean();

  console.log('\n================================================================');
  console.log('📌 LATEST ORDER DIRECTLY FROM MONGODB ATLAS');
  console.log('================================================================');
  console.log(`Database: anvika_boutique`);
  console.log(`Collection: orders`);
  console.log(`Document _id: ObjectId("${latestOrder._id}")\n`);
  console.log(JSON.stringify(latestOrder, null, 2));
  console.log('================================================================\n');

  process.exit(0);
};

syncAndInspectOrders().catch((err) => {
  console.error(err);
  process.exit(1);
});
