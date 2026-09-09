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

    // Product revenue breakdown (excluding cancelled orders)
    let productRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $ne: 'Cancelled' },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 7 },
    ]);

    // Fallback to all non-cancelled orders if range has 0 revenue orders so chart is never empty
    if (!productRevenue || productRevenue.length === 0) {
      productRevenue = await Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            totalQuantity: { $sum: '$items.qty' },
            totalRevenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 7 },
      ]);
    }

    // Top selling products by order frequency
    const topOrderedItems = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
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
      productRevenue,
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

// @desc    Get detailed executive audit & report data for admin (orders, customers, metrics, date-filtered)
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getAdminReportData = async (req, res, next) => {
  try {
    const { range = '30days', startDate, endDate, status } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (range === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { createdAt: { $gte: startOfDay } };
    } else if (range === '7days') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: past } };
    } else if (range === '30days') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: past } };
    } else if (range === '3months') {
      const past = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: past } };
    } else if (range === 'thisYear') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = { createdAt: { $gte: startOfYear } };
    } else if (range === 'custom' && startDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          ...(endDate ? { $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) } : {}),
        },
      };
    }

    const orderQuery = { ...dateFilter };
    if (status && status !== 'all') {
      orderQuery.orderStatus = status;
    }

    // 1. Fetch filtered orders with populated user
    const orders = await Order.find(orderQuery)
      .populate('user', 'name email phone addresses')
      .sort({ createdAt: -1 });

    // 2. Fetch all customers (excluding admins)
    const allCustomers = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });

    // New customers in period based on user creation date
    let newCustomersInPeriod = 0;
    if (dateFilter.createdAt) {
      newCustomersInPeriod = allCustomers.filter((c) => {
        const d = new Date(c.createdAt);
        if (dateFilter.createdAt.$gte && d < dateFilter.createdAt.$gte) return false;
        if (dateFilter.createdAt.$lte && d > dateFilter.createdAt.$lte) return false;
        return true;
      }).length;
    } else {
      newCustomersInPeriod = allCustomers.length;
    }

    // 3. Customer order stats & lifetime values
    const allOrdersInDb = await Order.find({});
    const ordersByUserId = {};
    allOrdersInDb.forEach((o) => {
      if (o.user) {
        const uid = o.user.toString();
        if (!ordersByUserId[uid]) ordersByUserId[uid] = [];
        ordersByUserId[uid].push(o);
      }
    });

    let returningCustomersCount = 0;
    const customerReports = allCustomers.map((c) => {
      const userAllOrders = ordersByUserId[c._id.toString()] || [];
      if (userAllOrders.length > 1) {
        returningCustomersCount++;
      }

      const periodOrders = orders.filter((o) => o.user && o.user._id.toString() === c._id.toString());
      const periodSpent = periodOrders.reduce((sum, o) => (o.orderStatus !== 'Cancelled' ? sum + (o.total || 0) : sum), 0);
      const allTimeSpent = userAllOrders.reduce((sum, o) => (o.orderStatus !== 'Cancelled' ? sum + (o.total || 0) : sum), 0);
      const lastOrder = userAllOrders.length > 0
        ? [...userAllOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : null;

      return {
        _id: c._id,
        name: c.name,
        email: c.email,
        phone: c.phone || lastOrder?.shippingAddress?.phone || 'N/A',
        joinedDate: c.createdAt,
        totalOrders: userAllOrders.length,
        periodOrdersCount: periodOrders.length,
        totalSpent: allTimeSpent,
        periodSpent,
        lastOrderDate: lastOrder ? lastOrder.createdAt : null,
        lastOrderStatus: lastOrder ? lastOrder.orderStatus : null,
        primaryAddress: lastOrder?.shippingAddress
          ? `${lastOrder.shippingAddress.street || ''}, ${lastOrder.shippingAddress.city || ''}, ${lastOrder.shippingAddress.state || ''} ${lastOrder.shippingAddress.postalCode || ''}`.trim()
          : (c.addresses?.[0] ? `${c.addresses[0].street || ''}, ${c.addresses[0].city || ''}` : 'Not provided'),
      };
    });

    // 4. Financial & Order Metrics (Consistent Logic: AOV = Net Revenue / Revenue Orders)
    const totalOrders = orders.length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled');
    const cancelledOrdersCount = cancelledOrders.length;
    const cancelledRevenue = cancelledOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const revenueOrders = orders.filter((o) => o.orderStatus !== 'Cancelled');
    const revenueOrdersCount = revenueOrders.length;

    const grossSubtotalRevenue = revenueOrders.reduce((sum, o) => sum + (o.subtotal || o.total || 0), 0);
    const totalDiscountAmount = revenueOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const totalShippingAmount = revenueOrders.reduce((sum, o) => sum + (o.shipping || 0), 0);
    const netRevenue = revenueOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // AOV = netRevenue / revenueOrdersCount
    const avgOrderValue = revenueOrdersCount > 0 ? Math.round(netRevenue / revenueOrdersCount) : 0;

    // Items sold & Top Selling Products
    let totalItemsSold = 0;
    const productSalesMap = {};

    revenueOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const qty = item.qty || 1;
        const price = item.price || 0;
        totalItemsSold += qty;

        const pName = item.name || 'Handcrafted Couture Piece';
        if (!productSalesMap[pName]) {
          productSalesMap[pName] = {
            name: pName,
            image: item.image,
            unitsSold: 0,
            revenue: 0,
          };
        }
        productSalesMap[pName].unitsSold += qty;
        productSalesMap[pName].revenue += price * qty;
      });
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
      .slice(0, 10);

    // 5. Order Status Summary
    const statusCounts = {
      Pending: 0,
      Placed: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
      Returned: 0,
    };
    orders.forEach((o) => {
      const st = o.orderStatus || 'Placed';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    // 6. Payment Summary
    const paymentStatusCounts = {
      Paid: 0,
      Pending: 0,
      Failed: 0,
      Refunded: 0,
    };
    const paymentMethodCounts = {};

    orders.forEach((o) => {
      if (o.orderStatus === 'Cancelled') {
        paymentStatusCounts['Refunded'] = (paymentStatusCounts['Refunded'] || 0) + 1;
      } else if (o.isPaid || o.paymentStatus === 'Completed') {
        paymentStatusCounts['Paid'] = (paymentStatusCounts['Paid'] || 0) + 1;
      } else if (o.paymentStatus === 'Failed') {
        paymentStatusCounts['Failed'] = (paymentStatusCounts['Failed'] || 0) + 1;
      } else {
        paymentStatusCounts['Pending'] = (paymentStatusCounts['Pending'] || 0) + 1;
      }

      const pm = o.paymentMethod || 'Other';
      paymentMethodCounts[pm] = (paymentMethodCounts[pm] || 0) + 1;
    });

    // Active ordering customers in period
    const activeOrderingCustomers = new Set(
      orders.map((o) => o.user?._id?.toString()).filter(Boolean)
    ).size;

    // Generated By Admin info from request
    const adminUser = req.user ? { name: req.user.name, email: req.user.email } : { name: 'Anvika Admin' };

    res.json({
      metadata: {
        title: 'Executive Audit & Customer Ledger Report',
        brand: 'ANVIKA BOUTIQUE',
        generatedBy: adminUser.name,
        generatedAt: new Date().toISOString(),
        range,
        startDate: startDate || null,
        endDate: endDate || null,
        statusFilter: status || 'all',
      },
      summary: {
        totalOrders,
        revenueOrdersCount,
        cancelledOrdersCount,
        cancelledRevenue,
        totalItemsSold,
        grossRevenue: netRevenue,
        avgOrderValue,
      },
      financialSummary: {
        grossSubtotal: grossSubtotalRevenue,
        discounts: totalDiscountAmount,
        shipping: totalShippingAmount,
        netRevenue: netRevenue,
        refundsOrCancelled: cancelledRevenue,
      },
      customerSummary: {
        totalCustomers: allCustomers.length,
        newCustomers: newCustomersInPeriod,
        returningCustomers: returningCustomersCount,
        orderingCustomers: activeOrderingCustomers,
      },
      statusSummary: statusCounts,
      paymentSummary: {
        statuses: paymentStatusCounts,
        methods: paymentMethodCounts,
      },
      topSellingProducts,
      orders: orders.map((o) => ({
        _id: o._id,
        orderNumber: o._id.toString().slice(-8).toUpperCase(),
        createdAt: o.createdAt,
        customerName: o.user?.name || 'Guest / Unassigned',
        customerEmail: o.user?.email || 'N/A',
        customerPhone: o.user?.phone || o.shippingAddress?.phone || 'N/A',
        orderStatus: o.orderStatus,
        paymentStatus: o.orderStatus === 'Cancelled' ? 'Refunded' : o.isPaid || o.paymentStatus === 'Completed' ? 'Paid' : (o.paymentStatus || 'Pending'),
        paymentMethod: o.paymentMethod || 'Standard',
        subtotal: o.subtotal || 0,
        shipping: o.shipping || 0,
        discount: o.discount || 0,
        total: o.total || 0,
        itemsCount: (o.items || []).reduce((sum, it) => sum + (it.qty || 1), 0),
        items: (o.items || []).map((it) => ({
          name: it.name,
          qty: it.qty,
          price: it.price,
        })),
        shippingAddress: o.shippingAddress,
      })),
      customers: customerReports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dedicated revenue analytics with aggregation
// @route   GET /api/admin/analytics/revenue
// @access  Private/Admin
export const getAdminAnalyticsRevenue = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate = new Date();
    let format = '%Y-%m-%d';

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
      format = '%Y-%m';
    } else {
      // 30 days default
      startDate.setDate(now.getDate() - 30);
    }

    // Revenue aggregation grouped by time interval
    const revenueTimeline = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $nin: ['Cancelled', 'Returned', 'Refunded'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          totalRevenue: { $sum: '$total' },
          subtotal: { $sum: '$subtotal' },
          discounts: { $sum: '$discount' },
          shipping: { $sum: '$shipping' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Aggregate totals across all non-cancelled orders
    const allTimeStats = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['Cancelled', 'Returned', 'Refunded'] },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalDiscounts: { $sum: '$discount' },
          totalShipping: { $sum: '$shipping' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
        },
      },
    ]);

    // Payment methods revenue distribution
    const paymentMethods = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['Cancelled', 'Returned', 'Refunded'] },
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.status(200).json({
      period,
      summary: allTimeStats[0] || {
        totalSales: 0,
        totalDiscounts: 0,
        totalShipping: 0,
        totalOrders: 0,
        avgOrderValue: 0,
      },
      timeline: revenueTimeline,
      paymentMethods,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dedicated product analytics with top selling & low stock
// @route   GET /api/admin/analytics/products
// @access  Private/Admin
export const getAdminAnalyticsProducts = async (req, res, next) => {
  try {
    const threshold = Number(req.query.lowStockThreshold) || 5;

    // Top selling products by revenue and quantity sold
    const topProducts = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['Cancelled', 'Returned', 'Refunded'] },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalUnitsSold: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // Low stock products alert
    const lowStockAlerts = await Product.find({
      stock: { $gt: 0, $lte: threshold },
    })
      .select('name image price stock category variants')
      .sort({ stock: 1 })
      .limit(20);

    // Out of stock products
    const outOfStock = await Product.find({
      stock: { $lte: 0 },
    })
      .select('name image price stock category')
      .limit(20);

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalInventory: { $sum: '$stock' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      topSelling: topProducts,
      lowStockAlerts,
      outOfStock,
      categoryDistribution,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dedicated customer analytics with lifetime spend & retention
// @route   GET /api/admin/analytics/customers
// @access  Private/Admin
export const getAdminAnalyticsCustomers = async (req, res, next) => {
  try {
    // Total customers (non-admin)
    const totalCustomers = await User.countDocuments({ role: { $ne: 'admin' } });

    // Customer spend & order frequency ranking
    const topCustomers = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['Cancelled', 'Returned', 'Refunded'] },
        },
      },
      {
        $group: {
          _id: '$user',
          ordersCount: { $sum: 1 },
          totalSpend: { $sum: '$total' },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
      { $sort: { totalSpend: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: '$userDetails.name',
          email: '$userDetails.email',
          ordersCount: 1,
          totalSpend: 1,
          lastOrderDate: 1,
        },
      },
    ]);

    // Repeat customers (ordered > 1 time)
    const repeatCustomerAgg = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['Cancelled', 'Returned', 'Refunded'] },
        },
      },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          totalUniqueBuyers: { $sum: 1 },
          repeatBuyers: {
            $sum: { $cond: [{ $gt: ['$count', 1] }, 1, 0] },
          },
        },
      },
    ]);

    const repeatData = repeatCustomerAgg[0] || { totalUniqueBuyers: 0, repeatBuyers: 0 };
    const repeatRate = repeatData.totalUniqueBuyers > 0
      ? Math.round((repeatData.repeatBuyers / repeatData.totalUniqueBuyers) * 100)
      : 0;

    // Geographic customer distribution by shipping city
    const geographicSpread = await Order.aggregate([
      {
        $match: {
          'shippingAddress.city': { $exists: true, $ne: '' },
        },
      },
      {
        $group: {
          _id: '$shippingAddress.city',
          ordersCount: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { ordersCount: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      totalCustomers,
      topCustomers,
      retention: {
        totalUniqueBuyers: repeatData.totalUniqueBuyers,
        repeatBuyers: repeatData.repeatBuyers,
        repeatRate: `${repeatRate}%`,
      },
      geographicSpread,
    });
  } catch (error) {
    next(error);
  }
};


