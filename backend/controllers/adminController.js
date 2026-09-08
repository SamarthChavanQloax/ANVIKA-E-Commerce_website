import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const revenueMatch = { paymentStatus: { $in: ['Paid', 'Authorized'] }, orderStatus: { $nin: ['Cancelled', 'Returned', 'Refunded'] } };

export const getDashboard = async (req, res, next) => {
  try {
    const [orderStats, users, products, statusCounts, lowStock, recentOrders, bestSelling] = await Promise.all([
      Order.aggregate([{ $match: revenueMatch }, { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } }]),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      Product.find({ stock: { $lte: Number(req.query.lowStock ?? 5) } }).select('name stock image price').sort({ stock: 1 }).limit(20),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email'),
      Order.aggregate([{ $unwind: '$items' }, { $group: { _id: '$items.product', units: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } }, { $sort: { units: -1 } }, { $limit: 10 }, { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } }, { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } }]),
    ]);
    const counts = Object.fromEntries(statusCounts.map((item) => [item._id, item.count]));
    res.json({
      totalRevenue: orderStats[0]?.revenue || 0,
      totalOrders: await Order.countDocuments(),
      totalCustomers: users,
      totalProducts: products,
      pendingOrders: counts.Pending || 0,
      deliveredOrders: counts.Delivered || 0,
      cancelledOrders: counts.Cancelled || 0,
      lowStockProducts: lowStock,
      recentOrders,
      bestSellingProducts: bestSelling,
    });
  } catch (error) { next(error); }
};

export const revenueAnalytics = async (req, res, next) => {
  try {
    const from = new Date(req.query.from || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const data = await Order.aggregate([{ $match: { ...revenueMatch, createdAt: { $gte: from } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    res.json(data);
  } catch (error) { next(error); }
};

export const productAnalytics = async (req, res, next) => {
  try {
    const data = await Order.aggregate([{ $unwind: '$items' }, { $group: { _id: '$items.product', quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } }, { $sort: { quantity: -1 } }, { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } }, { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } }]);
    res.json(data);
  } catch (error) { next(error); }
};

export const customerAnalytics = async (req, res, next) => {
  try {
    const [signups, topCustomers] = await Promise.all([
      User.aggregate([{ $match: { role: 'customer' } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, customers: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Order.aggregate([{ $group: { _id: '$user', orders: { $sum: 1 }, spent: { $sum: '$totalAmount' } } }, { $sort: { spent: -1 } }, { $limit: 20 }, { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }, { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }, { $project: { orders: 1, spent: 1, 'user.name': 1, 'user.email': 1 } }]),
    ]);
    res.json({ signups, topCustomers });
  } catch (error) { next(error); }
};
