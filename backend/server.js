import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import dns from 'dns';

// Configure DNS resolvers to ensure reliable MongoDB Atlas SRV lookup across all Windows network adapters
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();

const app = express();

// Allowed origins for CORS (local frontend dev server & configured environment url)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection state
let isDbConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anvika_boutique';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    isDbConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isDbConnected = false;
    console.warn(`⚠️ MongoDB Connection Notice: Could not connect to ${mongoUri}`);
    console.warn(`   Reason: ${error.message}`);
    console.warn(`   Tip: To connect to MongoDB, ensure a local MongoDB service is running, or set MONGO_URI in backend/.env to your MongoDB Atlas connection string.`);
  }
};

// Initiate DB connection
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    service: 'anvika-backend'
  });
});

// Root welcome
app.get('/', (req, res) => {
  res.send('Anvika Boutique API is running...');
});

// Mount Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);

// 404 handler for undefined routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Anvika Backend running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
