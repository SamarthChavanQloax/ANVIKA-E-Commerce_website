import { useState, useEffect, useMemo, useRef } from 'react';
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
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  SlidersHorizontal,
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

const PRINT_SCOPES = [
  { id: 'dossier', label: 'Executive Dossier (Summary + Orders)', shortLabel: 'Full Dossier' },
  { id: 'orders', label: 'Orders Ledger Only', shortLabel: 'Orders Only' },
  { id: 'customers', label: 'Customer Lifetime Ledger', shortLabel: 'Customers' },
  { id: 'topProducts', label: 'Top Products Performance', shortLabel: 'Top Products' },
];

const Reports = () => {
  const [range, setRange] = useState('30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'customers' | 'topProducts' | 'breakdown'

  // Print controls
  const [printScope, setPrintScope] = useState('dossier'); // 'dossier' | 'orders' | 'customers' | 'topProducts'
  const [isPreviewMode, setIsPreviewMode] = useState(false); // Simulated A4 Print Preview on screen

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
        o.paymentMethod?.toLowerCase().includes(q) ||
        (o.shippingAddress?.city && o.shippingAddress.city.toLowerCase().includes(q))
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

  // Trigger Print / PDF
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

  const auditDocId = useMemo(() => {
    const dt = new Date(metadata?.generatedAt || Date.now());
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `ANV-AUD-${y}${m}${d}-${Math.floor(1000 + Math.random() * 9000)}`;
  }, [metadata?.generatedAt]);

  return (
    <div className="space-y-8 print:space-y-0 print:text-black">
      {/* =========================================================================
          PRINT STYLESHEET (Engineered specifically for pristine A4 multi-page output)
          ========================================================================= */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 14mm 10mm;
          }
          
          /* Full page background and base text */
          html, body {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #111827 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            font-size: 11px !important;
            line-height: 1.35 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Force hide any on-screen interactive elements */
          .print\\:hidden,
          header,
          aside,
          button,
          input,
          select,
          nav {
            display: none !important;
          }

          /* Page break controls */
          .print-break-before {
            page-break-before: always !important;
            break-before: page !important;
          }

          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Table pagination and repeating header rules */
          table {
            page-break-inside: auto !important;
            border-collapse: collapse !important;
            width: 100% !important;
          }

          thead {
            display: table-header-group !important;
          }

          tfoot {
            display: table-footer-group !important;
          }

          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Remove all shadows, glows, and dark backgrounds */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }

          /* Ensure print container uses 100% width with clean margins */
          .print-doc-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }

          /* Force show print-only elements */
          .print-only {
            display: block !important;
          }

          /* Print page frame container */
          .print-page {
            width: 100% !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* =========================================================================
          SCREEN ONLY: Top Header & Executive Action Toolbar
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800/80 pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold flex items-center gap-1.5">
              <Sparkles size={13} /> Executive Intelligence
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-light tracking-wide">
            Reports & Ledgers
          </h1>
          <p className="text-stone-400 text-sm mt-1 font-light">
            Audit dossier, consolidated accounting ledger, customer lifetime values, and publication-ready PDF generator.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Print Preview Toggle */}
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
              isPreviewMode
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-stone-800/80 hover:bg-stone-700/80 border-stone-700/80 text-stone-300 hover:text-white'
            }`}
            title="Preview how pages will look when printed or exported as PDF"
          >
            {isPreviewMode ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>{isPreviewMode ? 'Close Page View' : 'Page View (Print Preview)'}</span>
          </button>

          {/* Export Orders CSV */}
          <button
            onClick={exportOrdersCSV}
            className="px-4 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/80 text-white text-xs font-medium tracking-wider uppercase transition-all flex items-center gap-2 shadow-sm hover:border-amber-500/40 cursor-pointer"
            title="Download full order details in CSV spreadsheet format"
          >
            <FileSpreadsheet size={15} className="text-emerald-400" />
            <span>Orders CSV</span>
          </button>

          {/* Export Customers CSV */}
          <button
            onClick={exportCustomersCSV}
            className="px-4 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/80 text-white text-xs font-medium tracking-wider uppercase transition-all flex items-center gap-2 shadow-sm hover:border-amber-500/40 cursor-pointer"
            title="Download customer list and lifetime spend in CSV format"
          >
            <Download size={15} className="text-amber-400" />
            <span>Customers CSV</span>
          </button>

          {/* Print / PDF Primary Button */}
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer active:scale-95"
            title="Print or save this report as PDF with full A4 pagination"
          >
            <Printer size={16} />
            <span>Print / PDF Document</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SCREEN ONLY: Print Settings & Filter Bar
          ========================================================================= */}
      <div className="space-y-4 print:hidden">
        {/* Print Scope Selector Toolbar */}
        <div className="bg-[#16161d] border border-stone-800/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-amber-400 shrink-0" />
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-300">
              Print Document Scope:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PRINT_SCOPES.map((scope) => (
              <button
                key={scope.id}
                onClick={() => setPrintScope(scope.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  printScope === scope.id
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-950/30'
                    : 'bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {printScope === scope.id && <Check size={12} className="stroke-[3]" />}
                <span>{scope.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Status Filter Bar */}
        <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-5 shadow-sm space-y-4">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    range === preset.id
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold shadow-sm'
                      : 'bg-stone-900/60 hover:bg-stone-800/80 border border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Status Filter & Refresh Button */}
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
            <div className="pt-3 border-t border-stone-800/80 flex flex-wrap items-center gap-4 text-xs text-stone-300">
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
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 print:hidden">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* =========================================================================
          PRINT PREVIEW BANNER (When simulated A4 page preview is active)
          ========================================================================= */}
      {isPreviewMode && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 text-amber-200 text-xs print:hidden animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Eye size={18} className="text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-amber-100">
                A4 Page View Active: Showing exact printed document layout
              </p>
              <p className="text-amber-300/80 text-[11px] mt-0.5">
                Print scope set to: <strong>{PRINT_SCOPES.find((s) => s.id === printScope)?.label}</strong>. Click Print / PDF to save.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 transition-colors"
            >
              Print Now
            </button>
            <button
              onClick={() => setIsPreviewMode(false)}
              className="px-3 py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-900 text-stone-300 transition-colors"
            >
              Exit Preview
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          THE PRINTABLE DOCUMENT ENGINE
          - When printing (window.print): Renders clean, paginated, pure white A4 sheets with page breaks and repeating table headers.
          - When isPreviewMode === true: Renders on-screen as simulated A4 paper sheets with shadows and borders.
          - When isPreviewMode === false: Renders standard rich interactive dark admin dashboard.
          ========================================================================= */}

      <div
        className={
          isPreviewMode
            ? 'space-y-12 max-w-4xl mx-auto py-6 print:space-y-0 print:max-w-none print:m-0 print:p-0'
            : ''
        }
      >
        {/* =======================================================================
            PAGE 1: EXECUTIVE BRIEFING & AUDITED FINANCIAL STATEMENT
            (Shown when in print/preview or when active tab on screen)
            ======================================================================= */}
        {(printScope === 'dossier' || isPreviewMode) && (
          <div
            className={`print-page print-doc-container print:block ${
              isPreviewMode
                ? 'bg-white text-stone-900 rounded-lg shadow-2xl p-10 border border-stone-200 min-h-[1123px] relative'
                : 'hidden print:block'
            }`}
          >
            {/* 1.1 Boutique Luxury Letterhead */}
            <div className="border-b-2 border-stone-900 pb-5 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-3xl font-bold tracking-[0.2em] uppercase text-stone-950">
                      ANVIKA
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-stone-900 text-white">
                      Boutique & Atelier
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-600 font-semibold mt-1">
                    Executive Audit & Financial Ledger Statement
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Official Atelier Operational Records • Verified Database Audit Trail
                  </p>
                </div>

                <div className="text-right text-[11px] text-stone-700 space-y-1">
                  <p className="font-mono text-xs font-semibold text-stone-900">
                    {auditDocId}
                  </p>
                  <p>
                    <strong>Generated:</strong> {new Date(metadata?.generatedAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(metadata?.generatedAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p>
                    <strong>Audited By:</strong> {metadata?.generatedBy || 'Anvika Executive Admin'}
                  </p>
                  <p>
                    <strong>Period:</strong> {currentRangeLabel} ({statusFilter === 'all' ? 'All Statuses' : statusFilter})
                  </p>
                </div>
              </div>

              {/* Gold luxury divider line */}
              <div className="h-[2px] w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700 mt-4" />
            </div>

            {/* 1.2 Executive KPI Summary Cards (Print/Preview Optimized) */}
            <div className="mb-6 print-avoid-break">
              <div className="text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-2">
                Executive Core Performance Indicators
              </div>
              <div className="grid grid-cols-4 gap-3">
                {/* Gross Revenue */}
                <div className="border border-stone-300 rounded-lg p-3 bg-stone-50/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
                    Gross Realized Revenue
                  </div>
                  <div className="text-xl font-serif font-bold text-stone-950 mt-1">
                    ₹{(summary?.grossRevenue || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-stone-600 mt-1">
                    From <strong>{summary?.revenueOrdersCount || 0}</strong> active orders
                  </div>
                </div>

                {/* Orders Processed */}
                <div className="border border-stone-300 rounded-lg p-3 bg-stone-50/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
                    Total Orders Processed
                  </div>
                  <div className="text-xl font-serif font-bold text-stone-950 mt-1">
                    {summary?.totalOrders || 0}
                  </div>
                  <div className="text-[10px] text-stone-600 mt-1">
                    {summary?.revenueOrdersCount || 0} active • {summary?.cancelledOrdersCount || 0} cancelled
                  </div>
                </div>

                {/* Customer Volume */}
                <div className="border border-stone-300 rounded-lg p-3 bg-stone-50/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
                    Customer Volume
                  </div>
                  <div className="text-xl font-serif font-bold text-stone-950 mt-1">
                    {customerSummary?.totalCustomers || 0}
                  </div>
                  <div className="text-[10px] text-stone-600 mt-1">
                    {customerSummary?.orderingCustomers || 0} active • {customerSummary?.newCustomers || 0} new
                  </div>
                </div>

                {/* Average Order Value */}
                <div className="border border-stone-300 rounded-lg p-3 bg-stone-50/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
                    Avg. Order Value (AOV)
                  </div>
                  <div className="text-xl font-serif font-bold text-stone-950 mt-1">
                    ₹{(summary?.avgOrderValue || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-stone-600 mt-1">
                    Revenue ÷ {summary?.revenueOrdersCount || 0} orders
                  </div>
                </div>
              </div>
            </div>

            {/* 1.3 Financial & Operational Breakdowns (3-Column Clean Statement) */}
            <div className="grid grid-cols-3 gap-4 mb-6 print-avoid-break">
              {/* Financial Accounting Breakdown */}
              <div className="border border-stone-300 rounded-lg p-3.5 bg-white">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-2.5">
                  <span className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900">
                    Financial Audit Summary
                  </span>
                  <span className="text-[9px] font-mono font-bold text-stone-500">INR (₹)</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-stone-600">
                    <span>Gross Product Subtotal</span>
                    <span className="font-mono text-stone-900 font-medium">
                      ₹{(financialSummary?.grossSubtotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Promotional Discounts</span>
                    <span className="font-mono text-emerald-700 font-medium">
                      -₹{(financialSummary?.discounts || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Shipping & Packaging</span>
                    <span className="font-mono text-stone-900 font-medium">
                      +₹{(financialSummary?.shipping || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-stone-300 flex justify-between font-bold text-xs text-stone-950">
                    <span>Net Realized Revenue</span>
                    <span className="font-mono">
                      ₹{(financialSummary?.netRevenue || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {financialSummary?.refundsOrCancelled > 0 && (
                    <div className="pt-1 text-[10px] flex justify-between text-red-700">
                      <span>Cancelled / Non-Realized</span>
                      <span className="font-mono">
                        ₹{(financialSummary?.refundsOrCancelled || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="border border-stone-300 rounded-lg p-3.5 bg-white">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-2.5">
                  <span className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900">
                    Order Status Breakdown
                  </span>
                  <span className="text-[9px] font-mono text-stone-500">{summary?.totalOrders || 0} Total</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {Object.entries(statusSummary || {}).map(([status, count]) => {
                    if (count === 0) return null;
                    const pct = summary?.totalOrders > 0 ? Math.round((count / summary.totalOrders) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-stone-700 font-medium">{status}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-stone-900 font-bold">{count}</span>
                          <span className="text-[10px] font-mono text-stone-500">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Settlement & Methods */}
              <div className="border border-stone-300 rounded-lg p-3.5 bg-white">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-2.5">
                  <span className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900">
                    Settlement & Channels
                  </span>
                  <span className="text-[9px] font-mono text-stone-500">Payment Audit</span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-stone-50 border border-stone-200 rounded p-1.5">
                      <div className="text-[9px] uppercase font-bold text-stone-500">Settled / Paid</div>
                      <div className="text-base font-mono font-bold text-emerald-700">
                        {paymentSummary?.statuses?.Paid || 0}
                      </div>
                    </div>
                    <div className="bg-stone-50 border border-stone-200 rounded p-1.5">
                      <div className="text-[9px] uppercase font-bold text-stone-500">Pending / Due</div>
                      <div className="text-base font-mono font-bold text-amber-700">
                        {paymentSummary?.statuses?.Pending || 0}
                      </div>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-stone-200 space-y-1">
                    {Object.entries(paymentSummary?.methods || {}).map(([method, count]) => (
                      <div key={method} className="flex justify-between text-stone-700 text-[10px]">
                        <span>{method}</span>
                        <span className="font-mono font-semibold">{count} orders</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 1.4 Top Selling Atelier Pieces Table (Page 1 summary) */}
            <div className="mb-6 print-avoid-break">
              <div className="text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-2">
                Top Selling Handcrafted Pieces (Top 5 Ranked by Units & Volume)
              </div>
              <table className="w-full text-left text-[11px] border border-stone-300">
                <thead className="bg-stone-100 text-stone-800 font-bold border-b border-stone-300 uppercase text-[9px] tracking-wider">
                  <tr>
                    <th className="py-2 px-2.5 text-center w-10">Rank</th>
                    <th className="py-2 px-2.5">Product Title</th>
                    <th className="py-2 px-2.5 text-center">Units Sold</th>
                    <th className="py-2 px-2.5 text-right">Revenue Generated</th>
                    <th className="py-2 px-2.5 text-right">Realized Unit Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {(topSellingProducts || []).slice(0, 5).map((prod, idx) => {
                    const avgPrice = prod.unitsSold > 0 ? Math.round(prod.revenue / prod.unitsSold) : 0;
                    return (
                      <tr key={idx} className="even:bg-stone-50/50">
                        <td className="py-1.5 px-2.5 text-center font-mono font-bold text-stone-900">
                          #{idx + 1}
                        </td>
                        <td className="py-1.5 px-2.5 font-medium text-stone-950">
                          {prod.name}
                        </td>
                        <td className="py-1.5 px-2.5 text-center font-mono font-semibold">
                          {prod.unitsSold} units
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono font-semibold text-stone-950">
                          ₹{(prod.revenue || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-mono text-stone-600">
                          ₹{avgPrice.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 1.5 Official Certification & Page 1 Footer */}
            <div className="pt-4 border-t-2 border-stone-900 flex items-center justify-between text-[10px] text-stone-600 print-avoid-break">
              <div>
                <p className="font-semibold text-stone-900 uppercase tracking-widest">
                  ANVIKA BOUTIQUE • EXECUTIVE ATELIER AUDIT
                </p>
                <p className="text-[9px] text-stone-500">
                  Certified genuine ledger records extracted directly from MongoDB cluster.
                </p>
              </div>

              <div className="text-right">
                <p className="font-mono font-semibold text-stone-900">Page 1 of Executive Dossier</p>
                <p className="text-[9px] text-stone-500">STRICTLY CONFIDENTIAL • INTERNAL USE ONLY</p>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            PAGE 2+: DETAILED ORDERS / TRANSACTION LEDGER TABLE
            (Forces a clean page break during printing!)
            ======================================================================= */}
        {(printScope === 'dossier' || printScope === 'orders' || isPreviewMode) && (
          <div
            className={`print-page print-doc-container print:block ${
              printScope === 'dossier' ? 'print-break-before' : ''
            } ${
              isPreviewMode
                ? 'bg-white text-stone-900 rounded-lg shadow-2xl p-10 border border-stone-200 min-h-[1123px] relative'
                : 'hidden print:block'
            }`}
          >
            {/* Page 2+ Running Header */}
            <div className="border-b-2 border-stone-900 pb-3 mb-4 flex items-center justify-between">
              <div>
                <span className="font-serif text-xl font-bold tracking-wider uppercase text-stone-950">
                  ANVIKA BOUTIQUE
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 ml-3">
                  Transaction & Orders Ledger
                </span>
              </div>
              <div className="text-right text-[10px] text-stone-600 font-mono">
                Period: {currentRangeLabel} • {filteredOrders.length} Records
              </div>
            </div>

            {/* High-Contrast Print Ledger Table */}
            <table className="w-full text-left text-[10px] border border-stone-300">
              <thead className="bg-stone-100 text-stone-900 font-bold border-b border-stone-400 uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="py-2 px-2 text-center w-16">Ref #</th>
                  <th className="py-2 px-2 w-24">Date</th>
                  <th className="py-2 px-2.5">Customer Profile</th>
                  <th className="py-2 px-2.5 min-w-[180px]">Items Breakdown</th>
                  <th className="py-2 px-2 text-center w-20">Status</th>
                  <th className="py-2 px-2 text-center w-20">Payment</th>
                  <th className="py-2 px-2.5 text-right w-24">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredOrders.map((order, idx) => (
                  <tr key={order._id || idx} className="even:bg-stone-50/60 print-avoid-break">
                    {/* Ref */}
                    <td className="py-2 px-2 font-mono font-bold text-center text-stone-900">
                      #{order.orderNumber}
                    </td>

                    {/* Date */}
                    <td className="py-2 px-2 text-stone-700 whitespace-nowrap">
                      <div>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[9px] text-stone-500 font-mono">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-2 px-2.5">
                      <div className="font-bold text-stone-950">{order.customerName}</div>
                      <div className="text-[9px] text-stone-600">{order.customerEmail}</div>
                      {order.customerPhone && order.customerPhone !== 'N/A' && (
                        <div className="text-[9px] text-stone-500">{order.customerPhone}</div>
                      )}
                    </td>

                    {/* Items */}
                    <td className="py-2 px-2.5">
                      <div className="space-y-0.5 text-stone-900">
                        {(order.items || []).map((it, i) => (
                          <div key={i} className="leading-tight">
                            <span className="font-medium">• {it.name}</span>{' '}
                            <span className="font-mono text-stone-600 text-[9px]">
                              (x{it.qty || 1}{it.price ? ` @ ₹${it.price.toLocaleString('en-IN')}` : ''})
                            </span>
                          </div>
                        ))}
                      </div>
                      {order.shippingAddress?.city && (
                        <div className="text-[9px] text-stone-500 mt-0.5">
                          📍 {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border ${
                          order.orderStatus === 'Delivered'
                            ? 'border-emerald-700 text-emerald-900 bg-emerald-50'
                            : order.orderStatus === 'Cancelled'
                            ? 'border-red-700 text-red-900 bg-red-50'
                            : order.orderStatus === 'Shipped' || order.orderStatus === 'Processing'
                            ? 'border-blue-700 text-blue-900 bg-blue-50'
                            : 'border-amber-700 text-amber-900 bg-amber-50'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <div className="font-bold text-stone-900">{order.paymentMethod}</div>
                      <div className="text-[8.5px] font-bold uppercase text-stone-600">
                        {order.paymentStatus || 'Paid'}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-2 px-2.5 text-right font-mono font-bold text-stone-950 whitespace-nowrap">
                      ₹{(order.total || 0).toLocaleString('en-IN')}
                      {order.discount > 0 && (
                        <div className="text-[8.5px] text-emerald-700 font-normal">
                          -₹{order.discount.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-stone-100 font-bold border-t-2 border-stone-400">
                <tr>
                  <td colSpan={6} className="py-2.5 px-3 text-right uppercase tracking-wider text-stone-800 text-[9px]">
                    Total Realized Orders Value:
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono text-xs text-stone-950">
                    ₹{(summary?.grossRevenue || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Page Footer */}
            <div className="mt-6 pt-3 border-t border-stone-300 flex items-center justify-between text-[9px] text-stone-500">
              <span>ANVIKA BOUTIQUE • CONSOLIDATED TRANSACTION AUDIT LEDGER</span>
              <span>STRICTLY CONFIDENTIAL • SYSTEM RUN {new Date().toISOString()}</span>
            </div>
          </div>
        )}

        {/* =======================================================================
            CUSTOMER LIFETIME LEDGER (Print Mode: customers)
            ======================================================================= */}
        {(printScope === 'customers') && (
          <div className="print-page print-doc-container hidden print:block">
            <div className="border-b-2 border-stone-900 pb-3 mb-4 flex items-center justify-between">
              <div>
                <span className="font-serif text-xl font-bold tracking-wider uppercase text-stone-950">
                  ANVIKA BOUTIQUE
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600 ml-3">
                  Customer Lifetime Engagement Ledger
                </span>
              </div>
              <div className="text-right text-[10px] text-stone-600 font-mono">
                {filteredCustomers.length} Customer Profiles • Generated {new Date().toLocaleDateString('en-IN')}
              </div>
            </div>

            <table className="w-full text-left text-[10px] border border-stone-300">
              <thead className="bg-stone-100 text-stone-900 font-bold border-b border-stone-400 uppercase text-[9px]">
                <tr>
                  <th className="py-2 px-2.5">Customer Name</th>
                  <th className="py-2 px-2.5">Contact Details</th>
                  <th className="py-2 px-2 text-center">Period Orders</th>
                  <th className="py-2 px-2 text-center">All-Time Orders</th>
                  <th className="py-2 px-2.5 text-right">Period Spend</th>
                  <th className="py-2 px-2.5 text-right">Lifetime Value</th>
                  <th className="py-2 px-2.5">Primary Delivery Destination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredCustomers.map((cust) => (
                  <tr key={cust._id} className="even:bg-stone-50/60 print-avoid-break">
                    <td className="py-2 px-2.5 font-bold text-stone-950">{cust.name}</td>
                    <td className="py-2 px-2.5">
                      <div>{cust.email}</div>
                      <div className="text-[9px] text-stone-500">{cust.phone}</div>
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-stone-900">
                      {cust.periodOrdersCount || 0}
                    </td>
                    <td className="py-2 px-2 text-center font-mono text-stone-700">
                      {cust.totalOrders || 0}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold text-stone-950">
                      ₹{(cust.periodSpent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold text-amber-900">
                      ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-2.5 text-stone-700 text-[9px]">{cust.primaryAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          INTERACTIVE SCREEN DASHBOARD VIEW (Shown during regular app browsing)
          ========================================================================= */}
      {!isPreviewMode && (
        <div className="space-y-8 print:hidden">
          {/* 1. Executive Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gross Revenue */}
            <div className="bg-[#141419] border border-stone-800/80 hover:border-amber-500/40 rounded-2xl p-5 shadow-sm transition-all relative overflow-hidden group">
              <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
                <span className="uppercase tracking-wider font-semibold">Gross Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-serif text-white font-light tracking-wide">
                ₹{(summary?.grossRevenue || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-stone-400 mt-2 font-light">
                From <span className="text-amber-400 font-medium">{summary?.revenueOrdersCount || 0}</span> revenue orders
              </p>
            </div>

            {/* Total Orders Processed */}
            <div className="bg-[#141419] border border-stone-800/80 hover:border-blue-500/40 rounded-2xl p-5 shadow-sm transition-all relative overflow-hidden group">
              <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
                <span className="uppercase tracking-wider font-semibold">Orders Processed</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <ShoppingBag size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-serif text-white font-light tracking-wide">
                {summary?.totalOrders || 0}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-stone-400">
                <span className="text-emerald-400 font-medium">
                  {summary?.revenueOrdersCount || 0} active
                </span>
                {summary?.cancelledOrdersCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-400 font-medium">
                      {summary?.cancelledOrdersCount} cancelled
                    </span>
                  </>
                )}
                <span>•</span>
                <span>{summary?.totalItemsSold || 0} units</span>
              </div>
            </div>

            {/* Customer Engagement */}
            <div className="bg-[#141419] border border-stone-800/80 hover:border-purple-500/40 rounded-2xl p-5 shadow-sm transition-all relative overflow-hidden group">
              <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
                <span className="uppercase tracking-wider font-semibold">Customers</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Users size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-serif text-white font-light tracking-wide">
                {customerSummary?.totalCustomers || 0}
              </div>
              <p className="text-[11px] text-stone-400 mt-2 font-light">
                <span className="text-purple-300 font-medium">{customerSummary?.orderingCustomers || 0}</span> active in period • <span className="text-stone-300">{customerSummary?.newCustomers || 0}</span> new
              </p>
            </div>

            {/* Average Order Value (AOV) */}
            <div className="bg-[#141419] border border-stone-800/80 hover:border-emerald-500/40 rounded-2xl p-5 shadow-sm transition-all relative overflow-hidden group">
              <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
                <span className="uppercase tracking-wider font-semibold">Avg. Order Value</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <CreditCard size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-serif text-white font-light tracking-wide">
                ₹{(summary?.avgOrderValue || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-stone-500 mt-2 font-light">
                Net Revenue ÷ {summary?.revenueOrdersCount || 0} active orders
              </p>
            </div>
          </div>

          {/* 2. Financial & Status Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Financial Accounting Breakdown */}
            <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-stone-800/80 pb-3">
                <h3 className="font-serif text-base text-white font-medium flex items-center gap-2">
                  <DollarSign size={16} className="text-amber-400" />
                  <span>Financial Audit Summary</span>
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-mono">INR (₹)</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-stone-400">
                  <span>Gross Product Subtotal</span>
                  <span className="font-mono text-stone-200 font-medium">
                    ₹{(financialSummary?.grossSubtotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <Tag size={12} className="text-stone-500" /> Promotional Discounts
                  </span>
                  <span className="font-mono text-emerald-400 font-medium">
                    -₹{(financialSummary?.discounts || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <Truck size={12} className="text-stone-500" /> Shipping & Packaging
                  </span>
                  <span className="font-mono text-stone-200 font-medium">
                    +₹{(financialSummary?.shipping || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-stone-800/80 flex justify-between items-center text-sm font-medium">
                  <span className="text-white">Net Realized Revenue</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    ₹{(financialSummary?.netRevenue || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {financialSummary?.refundsOrCancelled > 0 && (
                  <div className="pt-2 border-t border-stone-800/40 flex justify-between items-center text-[11px] text-red-400/90">
                    <span>Cancelled / Non-Realized</span>
                    <span className="font-mono">
                      ₹{(financialSummary?.refundsOrCancelled || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-stone-800/80 pb-3">
                <h3 className="font-serif text-base text-white font-medium flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400" />
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
                        <div className="flex justify-between text-xs text-stone-300">
                          <span className="font-medium">{status}</span>
                          <span className="font-mono text-stone-400">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-stone-800/80 overflow-hidden">
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
            <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-stone-800/80 pb-3">
                <h3 className="font-serif text-base text-white font-medium flex items-center gap-2">
                  <CreditCard size={16} className="text-amber-400" />
                  <span>Payment Distribution</span>
                </h3>
                <span className="text-[10px] text-stone-500 uppercase">Settlement</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Payment Statuses */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-stone-900/60 rounded-xl p-2.5 border border-stone-800/60">
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Settled / Paid</div>
                    <div className="text-lg font-mono font-medium text-emerald-400">
                      {paymentSummary?.statuses?.Paid || 0}
                    </div>
                  </div>
                  <div className="bg-stone-900/60 rounded-xl p-2.5 border border-stone-800/60">
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Pending / Due</div>
                    <div className="text-lg font-mono font-medium text-amber-400">
                      {paymentSummary?.statuses?.Pending || 0}
                    </div>
                  </div>
                </div>

                {/* Methods */}
                <div className="pt-2 border-t border-stone-800/60 space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1">
                    Methods Used
                  </div>
                  {Object.entries(paymentSummary?.methods || {}).length === 0 ? (
                    <div className="text-stone-500 text-[11px]">No method transactions recorded.</div>
                  ) : (
                    Object.entries(paymentSummary.methods).map(([method, count]) => {
                      const pct = summary?.totalOrders > 0 ? Math.round((count / summary.totalOrders) * 100) : 0;
                      return (
                        <div key={method} className="flex justify-between items-center text-[11px] text-stone-300">
                          <span>{method}</span>
                          <span className="font-mono text-stone-400">
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

          {/* 3. Screen Ledger Navigation Tabs & Search */}
          <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
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

            {/* TAB 1: ORDERS LEDGER */}
            {activeTab === 'orders' && (
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="py-20 text-center text-stone-400 text-xs flex flex-col items-center justify-center gap-3">
                    <RefreshCw size={24} className="animate-spin text-amber-400" />
                    <span>Aggregating boutique order ledgers...</span>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="py-16 text-center text-stone-500 text-sm font-light">
                    No orders found for the selected period and criteria.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-900/80 text-stone-400 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-800">
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
                    <tbody className="divide-y divide-stone-800/60 font-light">
                      {filteredOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-stone-900/40 transition-colors">
                          <td className="py-3.5 px-3 font-mono font-medium text-amber-300 whitespace-nowrap">
                            #{order.orderNumber}
                          </td>
                          <td className="py-3.5 px-3 text-stone-400 whitespace-nowrap">
                            <div>
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-[10px] text-stone-500">
                              {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-medium text-white">{order.customerName}</div>
                            <div className="text-[11px] text-stone-400 break-words">
                              {order.customerEmail}
                            </div>
                            {order.customerPhone && order.customerPhone !== 'N/A' && (
                              <div className="text-[10px] text-stone-500">
                                {order.customerPhone}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 min-w-[200px] max-w-sm">
                            <div className="space-y-1.5 text-stone-200 text-xs font-normal">
                              {(order.items || []).map((it, idx) => (
                                <div key={idx} className="whitespace-normal break-words leading-tight">
                                  <span className="text-stone-400 font-serif">• </span>
                                  <span className="font-medium">{it.name}</span>{' '}
                                  <span className="text-amber-400/90 font-mono text-[11px]">
                                    (x{it.qty || 1}{it.price ? ` @ ₹${it.price.toLocaleString('en-IN')}` : ''})
                                  </span>
                                </div>
                              ))}
                            </div>
                            {order.shippingAddress?.city && (
                              <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1">
                                <MapPin size={10} className="flex-shrink-0" />
                                <span>{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                order.orderStatus === 'Delivered'
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : order.orderStatus === 'Cancelled'
                                  ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                                  : order.orderStatus === 'Processing' || order.orderStatus === 'Confirmed'
                                  ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="text-stone-300 font-medium">{order.paymentMethod}</div>
                            <div className="text-[10px] text-stone-400 uppercase">
                              {order.paymentStatus || 'Paid'}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right font-semibold text-white whitespace-nowrap">
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

            {/* TAB 2: CUSTOMERS LEDGER */}
            {activeTab === 'customers' && (
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="py-20 text-center text-stone-400 text-xs flex flex-col items-center justify-center gap-3">
                    <RefreshCw size={24} className="animate-spin text-amber-400" />
                    <span>Aggregating customer ledgers...</span>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="py-16 text-center text-stone-500 text-sm font-light">
                    No customer profiles match the current filter.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-900/80 text-stone-400 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-800">
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
                    <tbody className="divide-y divide-stone-800/60 font-light">
                      {filteredCustomers.map((cust) => (
                        <tr key={cust._id} className="hover:bg-stone-900/40 transition-colors">
                          <td className="py-3.5 px-3 font-medium text-white whitespace-nowrap">
                            {cust.name}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="break-words">{cust.email}</div>
                            <div className="text-[11px] text-stone-500">{cust.phone}</div>
                          </td>
                          <td className="py-3.5 px-3 text-stone-400 whitespace-nowrap">
                            {new Date(cust.joinedDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className="font-semibold text-amber-400 font-mono">
                              {cust.periodOrdersCount || 0}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-medium text-stone-300 font-mono">
                            {cust.totalOrders || 0}
                          </td>
                          <td className="py-3.5 px-3 text-right font-semibold text-white whitespace-nowrap font-mono">
                            ₹{(cust.periodSpent || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3 text-right font-semibold text-amber-300 whitespace-nowrap font-mono">
                            ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3 max-w-xs text-stone-400 whitespace-normal break-words text-[11px]">
                            {cust.primaryAddress}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TAB 3: TOP SELLING */}
            {activeTab === 'topProducts' && (
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="py-20 text-center text-stone-400 text-xs flex flex-col items-center justify-center gap-3">
                    <RefreshCw size={24} className="animate-spin text-amber-400" />
                    <span>Aggregating product sales rankings...</span>
                  </div>
                ) : (!topSellingProducts || topSellingProducts.length === 0) ? (
                  <div className="py-16 text-center text-stone-500 text-sm font-light">
                    No product sales records found for this period.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-900/80 text-stone-400 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-800">
                      <tr>
                        <th className="py-3 px-3 text-center w-12">Rank</th>
                        <th className="py-3 px-3">Product Title</th>
                        <th className="py-3 px-3 text-center">Units Sold</th>
                        <th className="py-3 px-3 text-right">Revenue Generated</th>
                        <th className="py-3 px-3 text-right">Avg Realized Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 font-light">
                      {topSellingProducts.map((prod, idx) => {
                        const avgPrice = prod.unitsSold > 0 ? Math.round(prod.revenue / prod.unitsSold) : 0;
                        return (
                          <tr key={idx} className="hover:bg-stone-900/40 transition-colors">
                            <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-400">
                              #{idx + 1}
                            </td>
                            <td className="py-3.5 px-3 font-medium text-white whitespace-normal break-words max-w-md">
                              <div className="flex items-center gap-2">
                                {idx === 0 && <Award size={14} className="text-amber-400 flex-shrink-0" />}
                                <span>{prod.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono font-semibold text-white">
                              {prod.unitsSold} units
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-semibold text-amber-300 whitespace-nowrap">
                              ₹{(prod.revenue || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-stone-400 whitespace-nowrap">
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

            {/* TAB 4: BREAKDOWN */}
            {activeTab === 'breakdown' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                <div className="bg-stone-900/50 rounded-xl p-5 border border-stone-800">
                  <h3 className="font-serif text-lg text-white font-medium mb-4 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-400" />
                    <span>Order Status Distribution</span>
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(statusSummary || {}).map(([status, count]) => {
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
                    })}
                  </div>
                </div>

                <div className="bg-stone-900/50 rounded-xl p-5 border border-stone-800">
                  <h3 className="font-serif text-lg text-white font-medium mb-4 flex items-center gap-2">
                    <CreditCard size={16} className="text-amber-400" />
                    <span>Payment Channels & Methods</span>
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(paymentSummary?.methods || {}).map(([method, count]) => {
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
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
