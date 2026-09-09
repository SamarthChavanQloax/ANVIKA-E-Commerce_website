import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  MapPin,
  CreditCard,
  ChevronDown,
} from 'lucide-react';

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const ORDER_STATUS_OPTIONS = [
  'Pending',
  'Placed',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Returned',
  'Refunded',
];

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get('/api/admin/orders', { withCredentials: true });
      const ordersList = Array.isArray(data) ? data : (data?.orders || []);
      setOrders(ordersList);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await axios.put(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, orderStatus: newStatus } : ord))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s === 'shipped' || s === 'out for delivery') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (s === 'processing' || s === 'packed') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    if (s === 'cancelled' || s === 'returned' || s === 'refunded') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20'; // Placed / Confirmed / Pending
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter && o.orderStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const idMatch = o._id.toLowerCase().includes(q);
      const userMatch = o.user?.name?.toLowerCase().includes(q) || o.user?.email?.toLowerCase().includes(q);
      return idMatch || userMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            Order Fulfillment
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Track transactions, inspect delivery destinations, and dispatch shipments in real-time.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors text-xs self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-amber-400' : ''} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-[#141419] border border-stone-800/80 rounded-2xl shadow-xl">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID (#...), customer name, or email..."
            className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500 sm:w-56"
        >
          <option value="">All Order Statuses</option>
          {ORDER_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-[#141419] border border-stone-800/80 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-400">Loading Orders from MongoDB...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-stone-500 text-xs">
            No orders found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-900/70 border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-semibold">Order ID</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Ordered Items</th>
                  <th className="py-3.5 px-4 font-semibold">Total Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Payment</th>
                  <th className="py-3.5 px-4 font-semibold">Status Pipeline</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-stone-900/30 transition-colors">
                    {/* Order ID & Date */}
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-white">#{ord._id.slice(-6).toUpperCase()}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-stone-200">{ord.user?.name || 'Customer'}</p>
                      <p className="text-[11px] text-stone-400">{ord.user?.email || 'N/A'}</p>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-stone-300">
                          {ord.items?.length || 0} item(s)
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 truncate max-w-xs mt-0.5">
                        {ord.items?.[0]?.name} {ord.items?.length > 1 && `+ ${ord.items.length - 1} more`}
                      </p>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white text-sm">{formatINR(ord.total)}</span>
                    </td>

                    {/* Payment */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                        ord.isPaid
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {ord.paymentMethod || 'UPI'} • {ord.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <div className="relative inline-block">
                        <select
                          disabled={updatingId === ord._id}
                          value={ord.orderStatus}
                          onChange={(e) => handleStatusUpdate(ord._id, e.target.value)}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-semibold border focus:outline-none cursor-pointer ${getStatusBadge(ord.orderStatus)}`}
                        >
                          {ORDER_STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st} className="bg-[#18181d] text-stone-200">
                              {st}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </td>

                    {/* Details Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181d] border border-stone-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-white">
                  Order Details #{selectedOrder._id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(selectedOrder.orderStatus)}`}>
                {selectedOrder.orderStatus}
              </span>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-stone-900/80 rounded-xl border border-stone-800">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 block mb-1">
                  Customer
                </span>
                <p className="font-semibold text-stone-200">{selectedOrder.user?.name || 'Customer'}</p>
                <p className="text-stone-400">{selectedOrder.user?.email}</p>
                <p className="text-stone-400 mt-1">Payment Method: {selectedOrder.paymentMethod}</p>
              </div>

              <div className="p-3.5 bg-stone-900/80 rounded-xl border border-stone-800">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 block mb-1">
                  Shipping Address
                </span>
                <p className="text-stone-200">
                  {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}
                </p>
                <p className="text-stone-400">
                  {selectedOrder.shippingAddress?.state}, {selectedOrder.shippingAddress?.postalCode}
                </p>
                <p className="text-stone-400">{selectedOrder.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-300 block mb-2.5">
                Ordered Items ({selectedOrder.items?.length || 0})
              </span>
              <div className="space-y-2 border border-stone-800 rounded-xl p-3 bg-stone-900/40">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-1.5 border-b border-stone-800/60 last:border-none">
                    <img
                      src={item.image || '/demo-saree.jpg'}
                      alt={item.name}
                      className="w-10 h-12 object-cover rounded-lg bg-stone-800 border border-stone-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-200 truncate">{item.name}</p>
                      <p className="text-[11px] text-stone-400">Qty: {item.qty} × {formatINR(item.price)}</p>
                    </div>
                    <span className="text-xs font-bold text-white">
                      {formatINR(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="pt-2 border-t border-stone-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span>{formatINR(selectedOrder.subtotal || selectedOrder.total)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Shipping</span>
                <span>{formatINR(selectedOrder.shipping || 0)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-stone-800/60">
                <span>Total</span>
                <span className="text-amber-300">{formatINR(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Close */}
            <div className="pt-3 border-t border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
