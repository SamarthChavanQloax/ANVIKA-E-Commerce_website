import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  XCircle,
  Boxes,
} from 'lucide-react';

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      setError(null);
      const { data } = await axios.get('/api/admin/dashboard', { withCredentials: true });
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardStats();
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s === 'shipped' || s === 'out for delivery') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (s === 'processing' || s === 'packed') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    if (s === 'cancelled' || s === 'returned') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20'; // Placed / Confirmed / Pending
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-stone-400">Loading Live MongoDB Metrics...</p>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.toLowerCase().includes('authorized') || error.toLowerCase().includes('user not found') || error.toLowerCase().includes('token');
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center max-w-lg mx-auto my-12">
        <AlertTriangle size={36} className="text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-serif text-white mb-2">Session Expired or User Changed</h3>
        <p className="text-stone-400 text-sm mb-5">{error}</p>
        <div className="flex items-center justify-center gap-3">
          {isAuthError ? (
            <Link
              to="/admin/login"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
            >
              Log In Again
            </Link>
          ) : (
            <button
              onClick={fetchDashboardStats}
              className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            Executive Overview
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Real-time business performance and catalog health directly from MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 hover:text-white hover:border-stone-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-amber-400' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium shadow-lg shadow-amber-900/30 transition-all active:scale-[0.98]"
          >
            <PlusCircle size={15} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            {formatINR(stats?.totalRevenue)}
          </div>
          <p className="text-[11px] text-stone-400 mt-2 flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium">Live aggregate</span>
            <span>from valid orders</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            {stats?.totalOrders ?? 0}
          </div>
          <p className="text-[11px] text-stone-400 mt-2">
            <span className="text-amber-400 font-medium">{stats?.pendingOrders ?? 0} Pending</span>
            <span className="mx-1">•</span>
            <span className="text-emerald-400 font-medium">{stats?.deliveredOrders ?? 0} Delivered</span>
          </p>
        </div>

        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Customers</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            {stats?.totalCustomers ?? 0}
          </div>
          <p className="text-[11px] text-stone-400 mt-2">
            Registered customer accounts
          </p>
        </div>

        {/* Total Products */}
        <div className="p-5 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Live Products</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Package size={20} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            {stats?.totalProducts ?? 0}
          </div>
          <p className="text-[11px] text-stone-400 mt-2">
            Available in boutique catalog
          </p>
        </div>
      </div>

      {/* Operational Attention Grid (Low stock / Order pipeline) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Orders */}
        <Link
          to="/admin/orders"
          className="p-4 rounded-2xl bg-[#141419] border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-stone-400">Pending Orders</p>
              <p className="text-xl font-bold text-amber-300">{stats?.pendingOrders ?? 0}</p>
            </div>
          </div>
          <ArrowUpRight size={18} className="text-stone-400 group-hover:text-amber-300" />
        </Link>

        {/* Low Stock Products */}
        <Link
          to="/admin/inventory"
          className="p-4 rounded-2xl bg-[#141419] border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs text-stone-400">Low Stock Items (&le; 5)</p>
              <p className="text-xl font-bold text-amber-300">{stats?.lowStockProducts ?? 0}</p>
            </div>
          </div>
          <ArrowUpRight size={18} className="text-stone-400" />
        </Link>

        {/* Out of Stock Products */}
        <Link
          to="/admin/inventory"
          className="p-4 rounded-2xl bg-[#141419] border border-red-500/20 hover:border-red-500/40 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-stone-400">Out of Stock Items</p>
              <p className="text-xl font-bold text-red-300">{stats?.outOfStockProducts ?? 0}</p>
            </div>
          </div>
          <ArrowUpRight size={18} className="text-stone-400" />
        </Link>
      </div>

      {/* Main Two-Column View: Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 bg-[#141419] border border-stone-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Recent Orders</h3>
              <p className="text-xs text-stone-400">Latest transactions registered in MongoDB</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-sm">
              No orders found in MongoDB.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Items</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/50">
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-stone-900/40 transition-colors">
                      <td className="py-3.5 font-mono text-stone-300">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5">
                        <div className="font-medium text-stone-200">{order.user?.name || 'Customer'}</div>
                        <div className="text-[11px] text-stone-400">{order.user?.email || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 text-stone-300">
                        {order.items?.length || 0} item(s)
                      </td>
                      <td className="py-3.5 font-semibold text-white">
                        {formatINR(order.total)}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Best Selling Products */}
        <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Featured Catalog</h3>
              <p className="text-xs text-stone-400">Top rated & bestselling pieces</p>
            </div>
            <Link
              to="/admin/products"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {!stats?.bestSellingProducts || stats.bestSellingProducts.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-sm">
              No products found in MongoDB.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.bestSellingProducts.map((prod) => (
                <div key={prod._id} className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-stone-900/40 transition-colors">
                  <img
                    src={prod.image || '/demo-saree.jpg'}
                    alt={prod.name}
                    className="w-12 h-14 object-cover rounded-lg bg-stone-800 shrink-0 border border-stone-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-200 truncate">{prod.name}</p>
                    <p className="text-[11px] text-stone-400">{prod.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-amber-400">{formatINR(prod.price)}</span>
                      <span className="text-[10px] text-stone-400">• Stock: {prod.stock}</span>
                    </div>
                  </div>
                  <Link
                    to={`/admin/products/${prod._id}/edit`}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                    title="Edit Product"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Customers Section */}
      <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-serif font-bold text-lg text-white">Recent Customer Accounts</h3>
            <p className="text-xs text-stone-400">Newly registered users from MongoDB (passwords securely hidden)</p>
          </div>
          <Link
            to="/admin/customers"
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <span>View All Customers</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {!stats?.recentCustomers || stats.recentCustomers.length === 0 ? (
          <div className="py-8 text-center text-stone-500 text-sm">
            No customers found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentCustomers.map((cust) => (
              <div key={cust._id} className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-serif font-bold text-sm shrink-0">
                  {cust.name ? cust.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-stone-200 truncate">{cust.name || 'Anonymous Customer'}</p>
                  <p className="text-[11px] text-stone-400 truncate">{cust.email}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    Joined: {new Date(cust.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
