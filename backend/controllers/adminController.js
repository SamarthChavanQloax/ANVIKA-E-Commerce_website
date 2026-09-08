import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

// @desc    Get real Admin Dashboard statistics from MongoDB
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getAdminDashboard = async (req, res, next) => {
  try {
    const lowStockThreshold = Number(req.query.lowStockThreshold) || 5;

    // Parallel count queries
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockProducts,
      outOfStockProducts,
      recentOrders,
      recentCustomers,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: { $ne: 'admin' } }),
      Order.countDocuments({ orderStatus: { $in: ['Placed', 'Confirmed', 'Pending', 'Processing'] } }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.countDocuments({ orderStatus: 'Cancelled' }),
      Product.countDocuments({ stock: { $gt: 0, $lte: lowStockThreshold } }),
      Product.countDocuments({ stock: { $lte: 0 } }),
      Order.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(6),
      User.find({ role: { $ne: 'admin' } })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Total revenue from non-cancelled orders
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Bestseller / Top Rated Products
    const bestSellingProducts = await Product.find({})
      .sort({ isBestseller: -1, rating: -1, numReviews: -1 })
      .limit(5)
      .select('name image category price originalPrice stock rating numReviews variants');

    // 7-day sales trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesTrend = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockProducts,
      outOfStockProducts,
      recentOrders,
      recentCustomers,
      bestSellingProducts,
      salesTrend,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real Analytics aggregated from MongoDB
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const { range = 'month' } = req.query;

    const now = new Date();
    let startDate = new Date();
    let groupFormat = '%Y-%m-%d';

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
      groupFormat = '%Y-%m-%d %H:00';
    } else if (range === 'week') {
      startDate.setDate(now.getDate() - 7);
      groupFormat = '%Y-%m-%d';
    } else if (range === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
      groupFormat = '%Y-%m';
    } else {
      // month default
      startDate.setDate(now.getDate() - 30);
      groupFormat = '%Y-%m-%d';
    }

    // Orders trend in time range
    const ordersTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: { $sum: '$total' },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Range summary metrics
    const rangeMetrics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          rangeRevenue: { $sum: '$total' },
          rangeOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
        },
      },
    ]);

    // New customers in range
    const newCustomersCount = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: { $gte: startDate },
    });

    // Category breakdown: counts and products
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price' },
        },
      },
      { $sort: { productCount: -1 } },
    ]);

    // Order status distribution
    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    // Top selling products by order frequency
    const topOrderedItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      range,
      revenue: rangeMetrics[0]?.rangeRevenue || 0,
      orders: rangeMetrics[0]?.rangeOrders || 0,
      avgOrderValue: Math.round(rangeMetrics[0]?.avgOrderValue || 0),
      newCustomers: newCustomersCount,
      ordersTrend,
      categoryStats,
      orderStatusDistribution,
      topOrderedItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customers enriched with order stats (without password)
// @route   GET /api/admin/customers
// @access  Private/Admin
export const getAdminCustomers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    // Enrich each user with total orders and total spend from Order collection
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const userOrders = await Order.find({ user: u._id, orderStatus: { $ne: 'Cancelled' } });
        const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone || 'N/A',
          role: u.role,
          addresses: u.addresses || [],
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          ordersCount: userOrders.length,
          totalSpent,
          status: 'Active',
        };
      })
    );

    res.json(enrichedUsers);
  } catch (error) {
    next(error);
  }
};
