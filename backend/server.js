import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import dns from 'dns';

// Load environment variables
dotenv.config();

// Configure custom DNS only on Windows if needed, preserving standard Linux container DNS on Render
if (process.platform === 'win32' || process.env.CUSTOM_DNS === 'true') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // Ignore if custom DNS cannot be set
  }
}

import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const app = express();

// Enable trust proxy for Render load balancers / reverse proxies (enables correct req.protocol, secure cookies & IPs)
app.set('trust proxy', 1);

// Allowed origins for CORS (supports comma-separated FRONTEND_URL & local dev servers)
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultDevOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, Render health checks, server-to-server)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');

    // Allow configured origins, local development, Render subdomains, or Vercel previews
    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.startsWith('http://localhost:') ||
      cleanOrigin.startsWith('http://127.0.0.1:') ||
      cleanOrigin.endsWith('.onrender.com') ||
      cleanOrigin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }

    // Default allow with origin reflection so credentials work properly across allowed domains
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Database connection state and event monitoring
let isDbConnected = false;

mongoose.connection.on('connected', () => {
  isDbConnected = true;
  console.log('✅ MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.warn('⚠️ MongoDB connection lost/disconnected');
});

mongoose.connection.on('error', (err) => {
  isDbConnected = false;
  console.error('❌ MongoDB connection error:', err.message);
});

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anvika_boutique';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    isDbConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB connection failed (${error.message}). Trying direct replica set fallback...`);
    try {
      const fallbackUri = 'mongodb://anvika_admin:Qloax123@ac-uqatpw3-shard-00-00.6f3gpag.mongodb.net:27017,ac-uqatpw3-shard-00-01.6f3gpag.mongodb.net:27017,ac-uqatpw3-shard-00-02.6f3gpag.mongodb.net:27017/anvika_boutique?ssl=true&replicaSet=atlas-w3rxdd-shard-0&authSource=admin&retryWrites=true&w=majority';
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      isDbConnected = true;
      console.log(`✅ MongoDB Connected via Direct Replica Set: ${conn.connection.host}`);
    } catch (fallbackError) {
      isDbConnected = false;
      console.warn(`⚠️ MongoDB Connection Notice: Could not connect to database: ${fallbackError.message}`);
    }
  }
};

// Initiate DB connection
connectDB();

// Health check endpoints (Render health check path: /api/health or /health)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'anvika-backend',
    uptime: Math.floor(process.uptime()),
    database: isDbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Root welcome
app.get('/', (req, res) => {
  res.send('Anvika Boutique API is running...');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);

// Payment configuration
app.get('/api/config/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

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

// Render provides PORT dynamically, listen on 0.0.0.0 to bind all network interfaces
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Anvika Backend listening on 0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle graceful shutdown for zero-downtime rolling deploys on Render
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Gracefully closing HTTP server and database connections...`);
  server.close(async () => {
    console.log('✅ HTTP server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('✅ MongoDB connection closed.');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
    process.exit(0);
  });

  // Force close after 10 seconds if connections hang
  setTimeout(() => {
    console.error('⚠️ Forcefully terminating process after shutdown timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});
