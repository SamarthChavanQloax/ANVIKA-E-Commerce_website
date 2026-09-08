import { useState, useEffect, useCallback, useMemo } from 'react';
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
  PieChart as PieChartIcon,
  Tag,
  DollarSign,
  Sparkles,
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

const PALETTE = [
  { stroke: '#f59e0b', fill: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30' },
  { stroke: '#f43f5e', fill: '#f43f5e', bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/30' },
  { stroke: '#6366f1', fill: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  { stroke: '#10b981', fill: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  { stroke: '#a855f7', fill: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30' },
  { stroke: '#06b6d4', fill: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { stroke: '#ea580c', fill: '#ea580c', bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30' },
  { stroke: '#38bdf8', fill: '#38bdf8', bg: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-500/30' },
];

const Analytics = () => {
  const [range, setRange] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chart interactivity & view toggles
  const [chartView, setChartView] = useState('pie'); // 'pie' | 'bars'
  const [hoveredProductIndex, setHoveredProductIndex] = useState(null);

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

  // Max revenue for time-trend bar normalization
  const maxRevenue = data?.ordersTrend?.reduce((max, item) => Math.max(max, item.revenue), 0) || 1;

  // Resolved list of products for revenue charts
  const revenueItems = useMemo(() => {
    const raw = data?.productRevenue || data?.topOrderedItems || [];
    return raw.filter((item) => item.totalRevenue > 0);
  }, [data?.productRevenue, data?.topOrderedItems]);

  // Total product revenue for percentages
  const totalProductsRevenue = useMemo(() => {
    return revenueItems.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
  }, [revenueItems]);

  // Max product revenue for horizontal bar charts
  const maxProductRevenue = useMemo(() => {
    return revenueItems.reduce((max, item) => Math.max(max, item.totalRevenue || 0), 1);
  }, [revenueItems]);

  // Generate SVG Pie / Donut Arc Slices
  const pieSlices = useMemo(() => {
    if (!revenueItems.length || totalProductsRevenue === 0) return [];

    let currentAngle = 0;
    const cx = 110;
    const cy = 110;
    const R = 92; // Outer radius
    const r = 58; // Inner cutout radius

    return revenueItems.map((item, idx) => {
      const val = item.totalRevenue || 0;
      const fraction = val / totalProductsRevenue;
      const startAngle = currentAngle;
      const endAngle = currentAngle + fraction * 2 * Math.PI;
      currentAngle = endAngle;

      const palette = PALETTE[idx % PALETTE.length];
      const percentage = (fraction * 100).toFixed(1);

      // Edge case: single item 100% of pie
      if (fraction >= 0.999) {
        return {
          ...item,
          idx,
          fraction,
          percentage: '100.0',
          palette,
          isFull: true,
          cx, cy, R, r,
        };
      }

      // Compute outer arc points (rotated by -90deg so 0 is at top)
      const x1 = cx + R * Math.cos(startAngle - Math.PI / 2);
      const y1 = cy + R * Math.sin(startAngle - Math.PI / 2);
      const x2 = cx + R * Math.cos(endAngle - Math.PI / 2);
      const y2 = cy + R * Math.sin(endAngle - Math.PI / 2);

      // Compute inner arc points in reverse direction
      const ix1 = cx + r * Math.cos(endAngle - Math.PI / 2);
      const iy1 = cy + r * Math.sin(endAngle - Math.PI / 2);
      const ix2 = cx + r * Math.cos(startAngle - Math.PI / 2);
      const iy2 = cy + r * Math.sin(startAngle - Math.PI / 2);

      const largeArc = fraction > 0.5 ? 1 : 0;

      const pathData = [
        `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
        `A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
        `L ${ix1.toFixed(2)} ${iy1.toFixed(2)}`,
        `A ${r} ${r} 0 ${largeArc} 0 ${ix2.toFixed(2)} ${iy2.toFixed(2)}`,
        'Z',
      ].join(' ');

      return {
        ...item,
        idx,
        fraction,
        percentage,
        palette,
        pathData,
        isFull: false,
      };
    });
  }, [revenueItems, totalProductsRevenue]);

  // Selected or hovered slice data for dynamic center display
  const activeHoveredSlice = hoveredProductIndex !== null ? pieSlices[hoveredProductIndex] : null;

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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                range === r.id
                  ? 'bg-amber-600 text-white shadow-sm font-semibold'
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

          {/* Sales & Revenue Trend Chart */}
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

          {/* =========================================================================
              PRODUCT REVENUE SHARE (PIE / DONUT CHART & RANKED BREAKDOWN)
              ========================================================================= */}
          <div className="p-6 rounded-2xl bg-[#141419] border border-stone-800/80 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <PieChartIcon size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Product Revenue Distribution</h3>
                  <p className="text-xs text-stone-400">
                    Contribution share and sales volume by individual couture piece
                  </p>
                </div>
              </div>

              {/* View Switcher & Total Badge */}
              <div className="flex items-center gap-3">
                <div className="flex items-center p-1 bg-stone-900 border border-stone-800 rounded-xl text-xs">
                  <button
                    onClick={() => setChartView('pie')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      chartView === 'pie'
                        ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <PieChartIcon size={13} />
                    <span>Donut Pie</span>
                  </button>
                  <button
                    onClick={() => setChartView('bars')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      chartView === 'bars'
                        ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 size={13} />
                    <span>Ranked Bars</span>
                  </button>
                </div>

                <span className="hidden sm:inline-block text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  Gross: {formatINR(totalProductsRevenue)}
                </span>
              </div>
            </div>

            {pieSlices.length === 0 ? (
              <div className="py-16 text-center text-stone-500 text-xs">
                No product revenue records found for this timeframe.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Visual Chart Column */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                  {chartView === 'pie' ? (
                    <div className="relative w-[240px] h-[240px] flex items-center justify-center">
                      <svg
                        viewBox="0 0 220 220"
                        className="w-full h-full transform transition-all duration-300 drop-shadow-lg"
                      >
                        {pieSlices.map((slice) => {
                          const isHovered = hoveredProductIndex === slice.idx;
                          const isAnyHovered = hoveredProductIndex !== null;
                          const opacityClass = isAnyHovered && !isHovered ? 'opacity-35' : 'opacity-100';

                          if (slice.isFull) {
                            return (
                              <circle
                                key={slice.idx}
                                cx={slice.cx}
                                cy={slice.cy}
                                r={(slice.R + slice.r) / 2}
                                fill="none"
                                stroke={slice.palette.fill}
                                strokeWidth={slice.R - slice.r}
                                className={`transition-all duration-300 cursor-pointer ${opacityClass}`}
                                onMouseEnter={() => setHoveredProductIndex(slice.idx)}
                                onMouseLeave={() => setHoveredProductIndex(null)}
                              />
                            );
                          }

                          return (
                            <path
                              key={slice.idx}
                              d={slice.pathData}
                              fill={slice.palette.fill}
                              stroke="#141419"
                              strokeWidth="2.5"
                              className={`transition-all duration-200 cursor-pointer ${opacityClass} hover:filter hover:brightness-110`}
                              onMouseEnter={() => setHoveredProductIndex(slice.idx)}
                              onMouseLeave={() => setHoveredProductIndex(null)}
                            />
                          );
                        })}
                      </svg>

                      {/* Donut Center Cutout Display */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                        {activeHoveredSlice ? (
                          <div className="animate-fadeIn space-y-0.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                              {activeHoveredSlice.percentage}% Share
                            </span>
                            <p className="font-serif font-bold text-sm sm:text-base text-white line-clamp-1 max-w-[120px]">
                              {activeHoveredSlice._id}
                            </p>
                            <p className="font-mono text-xs text-stone-300 font-semibold">
                              {formatINR(activeHoveredSlice.totalRevenue)}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase tracking-widest text-stone-400 font-semibold">
                              Atelier Share
                            </span>
                            <p className="font-serif font-bold text-base sm:text-lg text-white">
                              {formatINR(totalProductsRevenue)}
                            </p>
                            <span className="text-[9px] text-stone-500 font-medium">
                              {revenueItems.length} Key Pieces
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Mini summary metric in bar view */
                    <div className="w-full bg-stone-900/60 border border-stone-800 rounded-2xl p-6 text-center space-y-2">
                      <Sparkles size={24} className="text-amber-400 mx-auto mb-1" />
                      <h4 className="font-serif font-bold text-white text-base">Top Bestsellers</h4>
                      <p className="text-xs text-stone-400 max-w-xs mx-auto">
                        Ranked volume velocities and monetary yields for authentic handloom pieces.
                      </p>
                      <div className="pt-3 border-t border-stone-800 flex justify-around text-xs">
                        <div>
                          <div className="text-[10px] uppercase text-stone-500 font-semibold">Top Yield</div>
                          <div className="text-sm font-mono font-bold text-amber-400">
                            {formatINR(revenueItems[0]?.totalRevenue || 0)}
                          </div>
                        </div>
                        <div className="w-[1px] bg-stone-800" />
                        <div>
                          <div className="text-[10px] uppercase text-stone-500 font-semibold">Catalog Units</div>
                          <div className="text-sm font-mono font-bold text-white">
                            {revenueItems.reduce((s, i) => s + (i.totalQuantity || 0), 0)} pcs
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Interactive Product Legend & Ranked Breakdown */}
                <div className="lg:col-span-7 space-y-2.5">
                  {chartView === 'pie' ? (
                    <div className="space-y-2">
                      {pieSlices.map((slice) => {
                        const isHovered = hoveredProductIndex === slice.idx;
                        return (
                          <div
                            key={slice.idx}
                            onMouseEnter={() => setHoveredProductIndex(slice.idx)}
                            onMouseLeave={() => setHoveredProductIndex(null)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isHovered
                                ? 'bg-stone-800/90 border-amber-500/60 shadow-md scale-[1.01]'
                                : 'bg-stone-900/50 hover:bg-stone-900/80 border-stone-800/80'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: slice.palette.fill }}
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-semibold text-stone-200 truncate">
                                  {slice._id}
                                </h4>
                                <p className="text-[11px] text-stone-400 flex items-center gap-2">
                                  <span>{slice.totalQuantity || 1} units sold</span>
                                  <span>•</span>
                                  <span className="font-mono text-stone-300 font-medium">
                                    {formatINR(slice.totalRevenue)}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Percentage Share Pill */}
                            <div className="shrink-0 flex items-center gap-2">
                              <span
                                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${slice.palette.border} ${slice.palette.text} bg-stone-950`}
                              >
                                {slice.percentage}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Ranked Horizontal Bars View */
                    <div className="space-y-3">
                      {pieSlices.map((slice) => {
                        const barWidth = Math.max(8, Math.round((slice.totalRevenue / maxProductRevenue) * 100));
                        return (
                          <div key={slice.idx} className="space-y-1.5 p-2 rounded-xl hover:bg-stone-900/40 transition-colors">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-stone-200 truncate max-w-sm">
                                {slice._id}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-stone-400 text-[11px]">
                                  {slice.totalQuantity} units
                                </span>
                                <span className="font-mono font-bold text-white">
                                  {formatINR(slice.totalRevenue)}
                                </span>
                                <span className="text-[10px] font-mono text-amber-400">
                                  ({slice.percentage}%)
                                </span>
                              </div>
                            </div>

                            {/* Bar Track */}
                            <div className="h-3 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${barWidth}%`,
                                  backgroundColor: slice.palette.fill,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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
