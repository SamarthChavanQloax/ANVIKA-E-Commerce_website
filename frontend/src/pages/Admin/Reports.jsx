import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  ChevronDown,
  Sparkles,
  Package,
  MapPin,
  ArrowUpDown,
  FileSpreadsheet,
  DollarSign,
  Tag,
  Truck,
  Award,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';

const RANGE_PRESETS = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
  { id: '3months', label: 'Last 3 Months' },
  { id: 'thisYear', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

const STATUS_OPTIONS = [
  'all',
  'Pending',
  'Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Returned',
];

const Reports = () => {
  const [range, setRange] = useState('30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'customers' | 'topProducts' | 'breakdown'

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState({
    metadata: {
      title: 'Executive Audit & Customer Ledger Report',
      brand: 'ANVIKA BOUTIQUE',
      generatedBy: 'Admin',
      generatedAt: new Date().toISOString(),
      range: '30days',
      startDate: null,
      endDate: null,
      statusFilter: 'all',
    },
    summary: {
      totalOrders: 0,
      revenueOrdersCount: 0,
      cancelledOrdersCount: 0,
      cancelledRevenue: 0,
      totalItemsSold: 0,
      grossRevenue: 0,
      avgOrderValue: 0,
    },
    financialSummary: {
      grossSubtotal: 0,
      discounts: 0,
      shipping: 0,
      netRevenue: 0,
      refundsOrCancelled: 0,
    },
    customerSummary: {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      orderingCustomers: 0,
    },
    statusSummary: {},
    paymentSummary: {
      statuses: {},
      methods: {},
    },
    topSellingProducts: [],
    orders: [],
    customers: [],
  });

  const fetchReports = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.append('range', range);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (range === 'custom') {
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
      }

      const { data } = await axios.get(`/api/admin/reports?${params.toString()}`, {
        withCredentials: true,
      });

      setReportData(data);
    } catch (err) {
      console.error('Error fetching admin reports:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate report data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (range !== 'custom' || (startDate && endDate)) {
      fetchReports();
    }
  }, [range, statusFilter, startDate, endDate]);

  // Filtered orders based on search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return reportData.orders || [];
    const q = searchQuery.toLowerCase();
    return (reportData.orders || []).filter(
      (o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerEmail?.toLowerCase().includes(q) ||
        o.orderStatus?.toLowerCase().includes(q) ||
        o.paymentMethod?.toLowerCase().includes(q)
    );
  }, [reportData.orders, searchQuery]);

  // Filtered customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return reportData.customers || [];
    const q = searchQuery.toLowerCase();
    return (reportData.customers || []).filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.primaryAddress?.toLowerCase().includes(q)
    );
  }, [reportData.customers, searchQuery]);

  // One-click CSV Export for Orders
  const exportOrdersCSV = () => {
    const orders = filteredOrders;
    if (!orders || orders.length === 0) {
      alert('No orders available to export for the selected filter.');
      return;
    }

    const headers = [
      'Order Ref',
      'Date & Time',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Order Status',
      'Payment Status',
      'Payment Method',
      'Items Breakdown',
      'Total Items Qty',
      'Subtotal (INR)',
      'Discounts (INR)',
      'Shipping Fee (INR)',
      'Net Total Paid (INR)',
      'Delivery Address',
    ];

    const rows = orders.map((o) => {
      const itemsList = (o.items || [])
        .map((it) => `${it.name} (x${it.qty || 1}${it.price ? ` @ ₹${it.price}` : ''})`)
        .join('; ');

      const addr = o.shippingAddress
        ? `${o.shippingAddress.street || ''}, ${o.shippingAddress.city || ''}, ${o.shippingAddress.state || ''} ${o.shippingAddress.postalCode || ''}`.replace(/"/g, '""')
        : 'N/A';

      return [
        `"#${o.orderNumber || o._id}"`,
        `"${new Date(o.createdAt).toLocaleString('en-IN')}"`,
        `"${(o.customerName || '').replace(/"/g, '""')}"`,
        `"${(o.customerEmail || '').replace(/"/g, '""')}"`,
        `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
        `"${o.orderStatus}"`,
        `"${o.paymentStatus || 'Pending'}"`,
        `"${o.paymentMethod || 'N/A'}"`,
        `"${itemsList.replace(/"/g, '""')}"`,
        o.itemsCount || 0,
        o.subtotal || 0,
        o.discount || 0,
        o.shipping || 0,
        o.total || 0,
        `"${addr}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Anvika_Orders_Ledger_${range}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // One-click CSV Export for Customers
  const exportCustomersCSV = () => {
    const customers = filteredCustomers;
    if (!customers || customers.length === 0) {
      alert('No customer data available to export for the selected filter.');
      return;
    }

    const headers = [
      'Customer ID',
      'Full Name',
      'Email Address',
      'Phone Number',
      'Joined Date',
      'Total Orders (All-Time)',
      'Total Spend INR (All-Time)',
      'Period Orders Count',
      'Period Spend (INR)',
      'Last Order Date',
      'Last Order Status',
      'Primary Delivery Address',
    ];

    const rows = customers.map((c) => {
      const addr = (c.primaryAddress || 'N/A').replace(/"/g, '""');
      return [
        `"${c._id}"`,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        `"${new Date(c.joinedDate).toLocaleDateString('en-IN')}"`,
        c.totalOrders || 0,
        c.totalSpent || 0,
        c.periodOrdersCount || 0,
        c.periodSpent || 0,
        c.lastOrderDate ? `"${new Date(c.lastOrderDate).toLocaleDateString('en-IN')}"` : '"No orders yet"',
        `"${c.lastOrderStatus || 'N/A'}"`,
        `"${addr}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Anvika_Customers_Ledger_${range}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  const { summary, financialSummary, customerSummary, statusSummary, paymentSummary, topSellingProducts, metadata } = reportData;

  const currentRangeLabel = useMemo(() => {
    if (range === 'custom') {
      return startDate && endDate ? `${startDate} to ${endDate}` : 'Custom Range';
    }
    const found = RANGE_PRESETS.find((p) => p.id === range);
    return found ? found.label : range;
  }, [range, startDate, endDate]);

  return (
    <div className="space-y-8 print:space-y-4 print:text-black">
      {/* Custom Print Stylesheet for flawless multi-page PDF generation */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body {
            background-color: #ffffff !important;
            color: #111827 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          table {
            page-break-inside: auto !important;
            border-collapse: collapse !important;
            width: 100% !important;
          }
          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          thead {
            display: table-header-group !important;
          }
          tfoot {
            display: table-footer-group !important;
          }
          .print-show-all {
            display: block !important;
          }
        }
      `}</style>

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800/80 pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold flex items-center gap-1.5">
              <Sparkles size={13} /> Executive Intelligence
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-light">
            Reports & Ledgers
          </h1>
          <p className="text-stone-400 text-sm mt-1 font-light">
            Consolidated executive audit, live financial ledgers, customer lifetime engagement, and inventory metrics.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportOrdersCSV}
            className="px-4 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/80 text-white text-xs font-medium tracking-wider uppercase transition-all flex items-center gap-2 shadow-sm hover:border-amber-500/40"
            title="Download full order details in CSV spreadsheet format"
          >
            <FileSpreadsheet size={15} className="text-emerald-400" />
            <span>Export Orders (CSV)</span>
          </button>

          <button
            onClick={exportCustomersCSV}
            className="px-4 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/80 text-white text-xs font-medium tracking-wider uppercase transition-all flex items-center gap-2 shadow-sm hover:border-amber-500/40"
            title="Download customer list and lifetime spend in CSV format"
          >
            <Download size={15} className="text-amber-400" />
            <span>Export Customers (CSV)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 shadow-lg shadow-amber-950/40"
            title="Print or save this report as PDF"
          >
            <Printer size={15} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Letterhead (Only visible during print / save to PDF) */}
      <div className="hidden print:block mb-6 border-b-2 border-stone-800 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-widest uppercase text-stone-900">
              {metadata?.brand || 'ANVIKA BOUTIQUE'}
            </h1>
            <p className="text-xs text-stone-600 uppercase tracking-widest font-semibold mt-0.5">
              {metadata?.title || 'Executive Audit & Customer Ledger Report'}
            </p>
            <p className="text-[11px] text-stone-500 mt-1">
              Official atelier records • Real-time database audit trail
            </p>
          </div>
          <div className="text-right text-[11px] text-stone-700 space-y-1">
            <p><strong>Generated On:</strong> {new Date(metadata?.generatedAt || Date.now()).toLocaleString('en-IN')}</p>
            <p><strong>Generated By:</strong> {metadata?.generatedBy || 'Anvika Admin'}</p>
            <p><strong>Selected Period:</strong> {currentRangeLabel} ({statusFilter === 'all' ? 'All Statuses' : statusFilter})</p>
          </div>
        </div>
      </div>

      {/* 2. Filter Toolbar */}
      <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-5 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1.5">
              <Calendar size={13} className="text-amber-400" /> Range:
            </span>
            {RANGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setRange(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  range === preset.id
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold shadow-sm'
                    : 'bg-stone-900/60 hover:bg-stone-800/80 border border-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Right controls: Status filter & Refresh */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <span className="uppercase tracking-wider text-stone-400 font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-stone-900 border border-stone-700/80 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500/60 cursor-pointer"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st} className="bg-stone-900 text-white">
                    {st === 'all' ? 'All Statuses' : st}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchReports}
              disabled={isLoading}
              className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh Report Data"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-amber-400' : ''} />
            </button>
          </div>

        </div>

        {/* Custom Date Range Selectors */}
        {range === 'custom' && (
          <div className="pt-3 border-t border-stone-800/80 flex flex-wrap items-center gap-4 text-xs text-stone-300 animate-fadeIn">
            <span className="uppercase tracking-wider font-semibold text-stone-400">Custom Dates:</span>
            <div className="flex items-center gap-2">
              <span className="text-stone-500">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-stone-500">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Executive KPI Metric Cards (Clean, Mathematically Consistent) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3 print-avoid-break">
        {/* Gross / Net Revenue */}
        <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden print:border-stone-300 print:bg-white print:p-3">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="uppercase tracking-wider font-semibold print:text-stone-700">Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 print:hidden">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-white font-light tracking-wide print:text-stone-900">
            ₹{(summary?.grossRevenue || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-stone-400 mt-2 font-light print:text-stone-600">
            From <span className="text-amber-400 font-medium print:text-stone-800">{summary?.revenueOrdersCount || 0}</span> revenue orders
          </p>
        </div>

        {/* Total Orders Processed */}
        <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden print:border-stone-300 print:bg-white print:p-3">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="uppercase tracking-wider font-semibold print:text-stone-700">Orders Processed</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 print:hidden">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-white font-light tracking-wide print:text-stone-900">
            {summary?.totalOrders || 0}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-stone-400 print:text-stone-600">
            <span className="text-emerald-400 font-medium print:text-stone-700">
              {summary?.revenueOrdersCount || 0} active
            </span>
            {summary?.cancelledOrdersCount > 0 && (
              <>
                <span>•</span>
                <span className="text-red-400 font-medium print:text-stone-700">
                  {summary?.cancelledOrdersCount} cancelled
                </span>
              </>
            )}
            <span>•</span>
            <span>{summary?.totalItemsSold || 0} units</span>
          </div>
        </div>

        {/* Customer Engagement */}
        <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden print:border-stone-300 print:bg-white print:p-3">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="uppercase tracking-wider font-semibold print:text-stone-700">Customers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 print:hidden">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-white font-light tracking-wide print:text-stone-900">
            {customerSummary?.totalCustomers || 0}
          </div>
          <p className="text-[11px] text-stone-400 mt-2 font-light print:text-stone-600">
            <span className="text-purple-300 font-medium print:text-stone-800">{customerSummary?.orderingCustomers || 0}</span> active in period • <span className="text-stone-300 print:text-stone-800">{customerSummary?.newCustomers || 0}</span> new
          </p>
        </div>

        {/* Average Order Value (AOV = Gross Revenue / Revenue Orders) */}
        <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden print:border-stone-300 print:bg-white print:p-3">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span className="uppercase tracking-wider font-semibold print:text-stone-700">Avg. Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 print:hidden">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-white font-light tracking-wide print:text-stone-900">
            ₹{(summary?.avgOrderValue || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-stone-500 mt-2 font-light print:text-stone-600">
            Net Revenue ÷ {summary?.revenueOrdersCount || 0} active orders
          </p>
        </div>
      </div>

      {/* 4. Financial & Status Summary Cards (Both Screen and Print) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4 print-avoid-break">
        
        {/* Financial Accounting Breakdown */}
        <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-5 shadow-sm print:border-stone-300 print:bg-white print:p-3">
          <div className="flex items-center justify-between mb-4 border-b border-stone-800/80 pb-3 print:border-stone-200">
            <h3 className="font-serif text-base text-white font-medium flex items-center gap-2 print:text-stone-900">
              <DollarSign size={16} className="text-amber-400 print:text-stone-800" />
              <span>Financial Audit Summary</span>
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-mono">INR (₹)</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-stone-400 print:text-stone-700">
              <span>Gross Product Subtotal</span>
              <span className="font-mono text-stone-200 font-medium print:text-stone-900">
                ₹{(financialSummary?.grossSubtotal || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center text-stone-400 print:text-stone-700">
              <span className="flex items-center gap-1.5">
                <Tag size={12} className="text-stone-500" /> Promotional Discounts
              </span>
              <span className="font-mono text-emerald-400 font-medium print:text-stone-900">
                -₹{(financialSummary?.discounts || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center text-stone-400 print:text-stone-700">
              <span className="flex items-center gap-1.5">
                <Truck size={12} className="text-stone-500" /> Shipping & Packaging
              </span>
              <span className="font-mono text-stone-200 font-medium print:text-stone-900">
                +₹{(financialSummary?.shipping || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-2.5 border-t border-stone-800/80 flex justify-between items-center text-sm font-medium print:border-stone-200">
              <span className="text-white print:text-stone-900">Net Realized Revenue</span>
              <span className="font-mono text-amber-400 font-semibold print:text-stone-900">
                ₹{(financialSummary?.netRevenue || 0).toLocaleString('en-IN')}
              </span>
            </div>

            {financialSummary?.refundsOrCancelled > 0 && (
              <div className="pt-2 border-t border-stone-800/40 flex justify-between items-center text-[11px] text-red-400/90 print:text-stone-600">
                <span>Cancelled / Non-Realized</span>
                <span className="font-mono">
                  ₹{(financialSummary?.refundsOrCancelled || 0).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-5 shadow-sm print:border-stone-300 print:bg-white print:p-3">
          <div className="flex items-center justify-between mb-4 border-b border-stone-800/80 pb-3 print:border-stone-200">
            <h3 className="font-serif text-base text-white font-medium flex items-center gap-2 print:text-stone-900">
              <CheckCircle2 size={16} className="text-amber-400 print:text-stone-800" />
              <span>Order Status Ledger</span>
            </h3>
            <span className="text-[10px] text-stone-500 uppercase">{summary?.totalOrders || 0} Total</span>
          </div>

          <div className="space-y-2 text-xs">
            {Object.keys(statusSummary || {}).length === 0 ? (
              <p className="text-stone-500 text-xs py-4 text-center">No orders recorded for this period.</p>
            ) : (
              Object.entries(statusSummary).map(([status, count]) => {
                if (count === 0) return null;
                const pct = summary?.totalOrders > 0 ? Math.round((count / summary.totalOrders) * 100) : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-300 print:text-stone-800">
                      <span className="font-medium">{status}</span>
                      <span className="font-mono text-stone-400 print:text-stone-600">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-800/80 overflow-hidden print:bg-stone-200">
                      <div
                        className={`h-full rounded-full ${
                          status === 'Delivered'
                            ? 'bg-emerald-500'
                            : status === 'Cancelled'
                            ? 'bg-red-500'
                            : status === 'Shipped' || status === 'Processing'
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-5 shadow-sm print:border-stone-300 print:bg-white print:p-3">
          <div className="flex items-center justify-between mb-4 border-b border-stone-800/80 pb-3 print:border-stone-200">
            <h3 className="font-serif text-base text-white font-medium flex items-center gap-2 print:text-stone-900">
              <CreditCard size={16} className="text-amber-400 print:text-stone-800" />
              <span>Payment Distribution</span>
            </h3>
            <span className="text-[10px] text-stone-500 uppercase">Settlement</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Payment Statuses */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-stone-900/60 rounded-xl p-2.5 border border-stone-800/60 print:bg-stone-50 print:border-stone-200">
                <div className="text-[10px] text-stone-400 uppercase font-semibold">Settled / Paid</div>
                <div className="text-lg font-mono font-medium text-emerald-400 print:text-stone-900">
                  {paymentSummary?.statuses?.Paid || 0}
                </div>
              </div>
              <div className="bg-stone-900/60 rounded-xl p-2.5 border border-stone-800/60 print:bg-stone-50 print:border-stone-200">
                <div className="text-[10px] text-stone-400 uppercase font-semibold">Pending / Due</div>
                <div className="text-lg font-mono font-medium text-amber-400 print:text-stone-900">
                  {paymentSummary?.statuses?.Pending || 0}
                </div>
              </div>
            </div>

            {/* Methods */}
            <div className="pt-2 border-t border-stone-800/60 space-y-1.5 print:border-stone-200">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 print:text-stone-700 mb-1">
                Methods Used
              </div>
              {Object.entries(paymentSummary?.methods || {}).length === 0 ? (
                <div className="text-stone-500 text-[11px]">No method transactions recorded.</div>
              ) : (
                Object.entries(paymentSummary.methods).map(([method, count]) => {
                  const pct = summary?.totalOrders > 0 ? Math.round((count / summary.totalOrders) * 100) : 0;
                  return (
                    <div key={method} className="flex justify-between items-center text-[11px] text-stone-300 print:text-stone-800">
                      <span>{method}</span>
                      <span className="font-mono text-stone-400 print:text-stone-600">
                        {count} orders ({pct}%)
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 5. Ledger Navigation Tabs & Search */}
      <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-6 shadow-sm space-y-6 print:border-stone-300 print:bg-white print:p-0 print:shadow-none">
        
        {/* On-screen tab buttons & search bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4 print:hidden">
          
          {/* Tab Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40'
                  : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              <ShoppingBag size={14} />
              <span>Orders Ledger ({filteredOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40'
                  : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              <Users size={14} />
              <span>Customer Ledger ({filteredCustomers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('topProducts')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'topProducts'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40'
                  : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              <Award size={14} />
              <span>Top Selling ({topSellingProducts?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'breakdown'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40'
                  : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              <BarChart3 size={14} />
              <span>Fulfillment & Channel Analytics</span>
            </button>
          </div>

          {/* Quick Search inside active tab */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

        </div>

        {/* Printable section title */}
        <div className="hidden print:block mb-3">
          <h2 className="font-serif text-lg font-bold text-stone-900 uppercase tracking-wide">
            {activeTab === 'customers'
              ? 'Complete Customer Lifetime Ledger'
              : activeTab === 'topProducts'
              ? 'Top Selling Products & Units Ledger'
              : 'Consolidated Orders & Transactions Ledger'}
          </h2>
          <p className="text-xs text-stone-500">
            Filtered records for period: {currentRangeLabel} • {filteredOrders.length} records matching
          </p>
        </div>

        {/* TAB 1: ORDERS LEDGER (No clipping, items wrap smoothly) */}
        {(activeTab === 'orders' || typeof window === 'undefined') && (
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-stone-400 text-xs flex flex-col items-center justify-center gap-3 print:hidden">
                <RefreshCw size={24} className="animate-spin text-amber-400" />
                <span>Aggregating boutique order ledgers...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-16 text-center text-stone-500 text-sm font-light">
                No orders found for the selected period and criteria.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-stone-300 print:text-stone-900">
                <thead className="bg-stone-900/80 text-stone-400 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-800 print:bg-stone-100 print:text-stone-900 print:border-stone-300">
                  <tr>
                    <th className="py-3 px-3">Order Ref</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Customer Profile</th>
                    <th className="py-3 px-3 min-w-[200px]">Items Breakdown</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3 text-right">Total (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-light print:divide-stone-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-stone-900/40 transition-colors print:hover:bg-transparent">
                      {/* Order Ref */}
                      <td className="py-3.5 px-3 font-mono font-medium text-amber-300 print:text-stone-900 whitespace-nowrap">
                        #{order.orderNumber}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-3 text-stone-400 print:text-stone-700 whitespace-nowrap">
                        <div>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-stone-500 print:text-stone-500">
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-white print:text-stone-900">{order.customerName}</div>
                        <div className="text-[11px] text-stone-400 print:text-stone-600 break-words">
                          {order.customerEmail}
                        </div>
                        {order.customerPhone && order.customerPhone !== 'N/A' && (
                          <div className="text-[10px] text-stone-500 print:text-stone-500">
                            {order.customerPhone}
                          </div>
                        )}
                      </td>

                      {/* Items Breakdown (Smooth wrapping without truncation!) */}
                      <td className="py-3.5 px-3 min-w-[200px] max-w-sm">
                        <div className="space-y-1.5 text-stone-200 print:text-stone-900 text-xs font-normal">
                          {(order.items || []).map((it, idx) => (
                            <div key={idx} className="whitespace-normal break-words leading-tight">
                              <span className="text-stone-400 print:text-stone-600 font-serif">• </span>
                              <span className="font-medium">{it.name}</span>{' '}
                              <span className="text-amber-400/90 print:text-stone-600 font-mono text-[11px]">
                                (x{it.qty || 1}{it.price ? ` @ ₹${it.price.toLocaleString('en-IN')}` : ''})
                              </span>
                            </div>
                          ))}
                        </div>
                        {order.shippingAddress?.city && (
                          <div className="mt-1 text-[10px] text-stone-500 print:text-stone-500 flex items-center gap-1">
                            <MapPin size={10} className="flex-shrink-0" />
                            <span>{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 print:border-emerald-600 print:text-emerald-800'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-red-500/15 text-red-300 border border-red-500/30 print:border-red-600 print:text-red-800'
                              : order.orderStatus === 'Processing' || order.orderStatus === 'Confirmed'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30 print:border-blue-600 print:text-blue-800'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 print:border-amber-600 print:text-amber-800'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-stone-300 print:text-stone-900 font-medium">{order.paymentMethod}</div>
                        <div className="text-[10px] text-stone-400 print:text-stone-600 uppercase">
                          {order.paymentStatus || 'Paid'}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-3 text-right font-semibold text-white print:text-stone-900 whitespace-nowrap">
                        <div className="font-mono text-sm">₹{(order.total || 0).toLocaleString('en-IN')}</div>
                        {order.discount > 0 && (
                          <div className="text-[10px] text-emerald-400 font-mono">
                            -₹{order.discount.toLocaleString('en-IN')} disc.
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 2: CUSTOMER PERFORMANCE LEDGER */}
        {activeTab === 'customers' && (
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-stone-400 text-xs flex flex-col items-center justify-center gap-3 print:hidden">
                <RefreshCw size={24} className="animate-spin text-amber-400" />
                <span>Aggregating customer ledgers...</span>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="py-16 text-center text-stone-500 text-sm font-light">
                No customer profiles match the current filter.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-stone-300 print:text-stone-900">
                <thead className="bg-stone-900/80 text-stone-400 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-800 print:bg-stone-100 print:text-stone-900 print:border-stone-300">
                  <tr>
                    <th className="py-3 px-3">Customer Name</th>
                    <th className="py-3 px-3">Contact Info</th>
                    <th className="py-3 px-3">Member Since</th>
                    <th className="py-3 px-3 text-center">Period Orders</th>
                    <th className="py-3 px-3 text-center">Lifetime Orders</th>
                    <th className="py-3 px-3 text-right">Period Spend</th>
                    <th className="py-3 px-3 text-right">Lifetime Spend</th>
                    <th className="py-3 px-3">Primary Destination</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-light print:divide-stone-200">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust._id} className="hover:bg-stone-900/40 transition-colors print:hover:bg-transparent">
                      <td className="py-3.5 px-3 font-medium text-white print:text-stone-900 whitespace-nowrap">
                        {cust.name}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="break-words">{cust.email}</div>
                        <div className="text-[11px] text-stone-500 print:text-stone-600">{cust.phone}</div>
                      </td>
                      <td className="py-3.5 px-3 text-stone-400 print:text-stone-700 whitespace-nowrap">
                        {new Date(cust.joinedDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-semibold text-amber-400 print:text-stone-900 font-mono">
                          {cust.periodOrdersCount || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-medium text-stone-300 print:text-stone-800 font-mono">
                        {cust.totalOrders || 0}
                      </td>
                      <td className="py-3.5 px-3 text-right font-semibold text-white print:text-stone-900 whitespace-nowrap font-mono">
                        ₹{(cust.periodSpent || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 text-right font-semibold text-amber-300 print:text-stone-900 whitespace-nowrap font-mono">
                        ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 max-w-xs text-stone-400 print:text-stone-700 whitespace-normal break-words text-[11px]">
                        {cust.primaryAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 3: TOP SELLING PRODUCTS */}
        {activeTab === 'topProducts' && (
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-stone-400 text-xs flex flex-col items-center justify-center gap-3 print:hidden">
                <RefreshCw size={24} className="animate-spin text-amber-400" />
                <span>Aggregating product sales rankings...</span>
              </div>
            ) : (!topSellingProducts || topSellingProducts.length === 0) ? (
              <div className="py-16 text-center text-stone-500 text-sm font-light">
                No product sales records found for this period.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-stone-300 print:text-stone-900">
                <thead className="bg-stone-900/80 text-stone-400 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-800 print:bg-stone-100 print:text-stone-900 print:border-stone-300">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">Rank</th>
                    <th className="py-3 px-3">Product Title</th>
                    <th className="py-3 px-3 text-center">Units Sold</th>
                    <th className="py-3 px-3 text-right">Revenue Generated</th>
                    <th className="py-3 px-3 text-right">Avg Realized Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-light print:divide-stone-200">
                  {topSellingProducts.map((prod, idx) => {
                    const avgPrice = prod.unitsSold > 0 ? Math.round(prod.revenue / prod.unitsSold) : 0;
                    return (
                      <tr key={idx} className="hover:bg-stone-900/40 transition-colors print:hover:bg-transparent">
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-400 print:text-stone-900">
                          #{idx + 1}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-white print:text-stone-900 whitespace-normal break-words max-w-md">
                          <div className="flex items-center gap-2">
                            {idx === 0 && <Award size={14} className="text-amber-400 flex-shrink-0" />}
                            <span>{prod.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-semibold text-white print:text-stone-900">
                          {prod.unitsSold} units
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-semibold text-amber-300 print:text-stone-900 whitespace-nowrap">
                          ₹{(prod.revenue || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-stone-400 print:text-stone-700 whitespace-nowrap">
                          ₹{avgPrice.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 4: BREAKDOWN & DISTRIBUTION */}
        {activeTab === 'breakdown' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            {/* Status Breakdown Detailed */}
            <div className="bg-stone-900/50 rounded-xl p-5 border border-stone-800">
              <h3 className="font-serif text-lg text-white font-medium mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-400" />
                <span>Order Status Distribution</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(statusSummary || {}).length === 0 ? (
                  <p className="text-stone-500 text-xs">No order status data available.</p>
                ) : (
                  Object.entries(statusSummary).map(([status, count]) => {
                    const pct = summary?.totalOrders > 0 ? Math.round((count / summary.totalOrders) * 100) : 0;
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-xs text-stone-300">
                          <span>{status}</span>
                          <span className="font-mono text-stone-400">
                            {count} orders ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              status === 'Delivered'
                                ? 'bg-emerald-500'
                                : status === 'Cancelled'
                                ? 'bg-red-500'
                                : status === 'Shipped' || status === 'Processing'
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Payment Method Share Detailed */}
            <div className="bg-stone-900/50 rounded-xl p-5 border border-stone-800">
              <h3 className="font-serif text-lg text-white font-medium mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-amber-400" />
                <span>Payment Channels & Methods</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(paymentSummary?.methods || {}).length === 0 ? (
                  <p className="text-stone-500 text-xs">No payment transaction records available.</p>
                ) : (
                  Object.entries(paymentSummary.methods).map(([method, count]) => {
                    const pct = summary?.totalOrders > 0 ? Math.round((count / summary.totalOrders) * 100) : 0;
                    return (
                      <div key={method} className="space-y-1">
                        <div className="flex justify-between text-xs text-stone-300">
                          <span>{method}</span>
                          <span className="font-mono text-stone-400">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
