import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function inspect() {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to host:', conn.connection.host);
  console.log('Current DB Name:', conn.connection.db.databaseName);

  const adminDb = conn.connection.db.admin();
  const dbs = await adminDb.listDatabases();
  console.log('\nAvailable Databases in cluster:');
  for (const db of dbs.databases) {
    console.log(`- ${db.name} (${db.sizeOnDisk} bytes)`);
  }

  // Check collections in current DB
  const collections = await conn.connection.db.listCollections().toArray();
  console.log(`\nCollections in current DB "${conn.connection.db.databaseName}":`);
  for (const col of collections) {
    const count = await conn.connection.db.collection(col.name).countDocuments();
    console.log(`- ${col.name}: ${count} documents`);
  }

  // Check if anvika_boutique exists in cluster
  for (const dbInfo of dbs.databases) {
    if (dbInfo.name !== 'admin' && dbInfo.name !== 'local') {
      const otherDb = conn.connection.useDb(dbInfo.name);
      const cols = await otherDb.db.listCollections().toArray();
      console.log(`\nCollections in "${dbInfo.name}":`);
      for (const col of cols) {
        const count = await otherDb.db.collection(col.name).countDocuments();
        console.log(`  - ${col.name}: ${count} documents`);
      }
    }
  }

  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
