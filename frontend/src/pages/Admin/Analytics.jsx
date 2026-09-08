import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Users,
  RefreshCw,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const RANGES = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

const Analytics = () => {
  const [range, setRange] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`/api/admin/analytics?range=${range}`, { withCredentials: true });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Max revenue for bar normalization
  const maxRevenue = data?.ordersTrend?.reduce((max, item) => Math.max(max, item.revenue), 0) || 1;

  return (
    <div className="space-y-8">
      {/* Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            Business Analytics
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Historical revenue metrics, volume velocities, and product distribution from MongoDB.
          </p>
        </div>

        {/* Time range buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-900 border border-stone-800 rounded-xl">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === r.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-400">Aggregating MongoDB Analytics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics in Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="p-5 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Period Revenue</span>
                <TrendingUp size={18} className="text-amber-400" />
              </div>
              <p className="text-2xl font-serif font-bold text-white tracking-tight">
                {formatINR(data?.revenue)}
              </p>
              <p className="text-[11px] text-stone-400 mt-1 capitalize">For selected {range}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Orders Processed</span>
                <ShoppingBag size={18} className="text-blue-400" />
              </div>
              <p className="text-2xl font-serif font-bold text-white tracking-tight">
                {data?.orders ?? 0}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">Non-cancelled orders</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Average Order Value</span>
                <Award size={18} className="text-purple-400" />
              </div>
              <p className="text-2xl font-serif font-bold text-white tracking-tight">
                {formatINR(data?.avgOrderValue)}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">Per completed cart</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">New Customers</span>
                <Users size={18} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-serif font-bold text-white tracking-tight">
                {data?.newCustomers ?? 0}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">Acquired during period</p>
            </div>
          </div>

          {/* Revenue Velocity Chart */}
          <div className="p-6 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Sales & Revenue Trend</h3>
                <p className="text-xs text-stone-400">Chronological distribution of sales</p>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                Total: {formatINR(data?.revenue)}
              </span>
            </div>

            {!data?.ordersTrend || data.ordersTrend.length === 0 ? (
              <div className="py-16 text-center text-stone-500 text-xs">
                No transactions recorded during this specific timeframe.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {data.ordersTrend.map((trend, i) => {
                  const percent = Math.max(8, Math.round((trend.revenue / maxRevenue) * 100));
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-stone-300">
                        <span className="font-mono text-[11px]">{trend._id}</span>
                        <span className="font-bold text-white">
                          {formatINR(trend.revenue)} ({trend.ordersCount} order{trend.ordersCount > 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="h-4 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Two Columns: Category Performance & Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="p-6 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl space-y-4">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Layers size={18} className="text-amber-400" />
                <span>Category Inventory Distribution</span>
              </h3>

              {!data?.categoryStats || data.categoryStats.length === 0 ? (
                <div className="py-10 text-center text-stone-500 text-xs">
                  No category data available.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.categoryStats.map((cat, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-stone-200 text-xs">{cat._id || 'Uncategorized'}</p>
                        <p className="text-[11px] text-stone-400">Total Stock: {cat.totalStock} units</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-300">{cat.productCount} pieces</span>
                        <p className="text-[10px] text-stone-400">Avg Price: {formatINR(cat.avgPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Status Breakdown */}
            <div className="p-6 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl space-y-4">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-amber-400" />
                <span>Order Status Distribution</span>
              </h3>

              {!data?.orderStatusDistribution || data.orderStatusDistribution.length === 0 ? (
                <div className="py-10 text-center text-stone-500 text-xs">
                  No order status data available.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.orderStatusDistribution.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-stone-900/60 rounded-xl border border-stone-800 flex items-center justify-between"
                    >
                      <span className="font-semibold text-stone-200 text-xs">{st._id}</span>
                      <span className="text-xs font-mono font-bold text-white px-2.5 py-0.5 rounded-full bg-stone-800 border border-stone-700">
                        {st.count} order(s)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
