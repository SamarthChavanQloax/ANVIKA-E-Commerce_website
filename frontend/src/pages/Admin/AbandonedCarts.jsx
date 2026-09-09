import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  RefreshCw,
  Eye,
  CheckCheck,
  Ban,
  UserCheck,
  UserX,
  ExternalLink,
} from 'lucide-react';

const AbandonedCarts = () => {
  const { userInfo } = useAuth();

  // Active view tab: 'carts' | 'messages'
  const [activeTab, setActiveTab] = useState('carts');

  // Stats State
  const [stats, setStats] = useState({
    totalAbandonedCarts: 0,
    messagesSent: 0,
    messagesDelivered: 0,
    messagesRead: 0,
    messagesFailed: 0,
    recoveredCarts: 0,
    recoveryConversionRate: 0,
    revenueRecovered: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Carts State
  const [carts, setCarts] = useState([]);
  const [loadingCarts, setLoadingCarts] = useState(true);
  const [cartFilter, setCartFilter] = useState('all');
  const [triggeringId, setTriggeringId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState({ id: null, message: '', isError: false });

  // Messages State
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const { data } = await axios.get('/api/admin/abandoned-carts/stats', config);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchCarts = async () => {
    try {
      setLoadingCarts(true);
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const { data } = await axios.get(`/api/admin/abandoned-carts?status=${cartFilter}`, config);
      setCarts(data.carts || []);
    } catch (err) {
      console.error('Failed to load carts:', err);
    } finally {
      setLoadingCarts(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const { data } = await axios.get('/api/admin/abandoned-carts/messages', config);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCarts();
  }, [userInfo, cartFilter]);

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages();
    }
  }, [activeTab]);

  const handleManualReminder = async (cartId) => {
    try {
      setTriggeringId(cartId);
      setActionFeedback({ id: null, message: '', isError: false });
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const { data } = await axios.post(`/api/admin/abandoned-carts/${cartId}/send-reminder`, {}, config);

      setActionFeedback({
        id: cartId,
        message: data.message || 'Reminder dispatched successfully!',
        isError: !data.success,
      });

      // Refresh list and stats
      fetchStats();
      fetchCarts();
      setTimeout(() => setActionFeedback({ id: null, message: '', isError: false }), 5000);
    } catch (err) {
      setActionFeedback({
        id: cartId,
        message: err.response?.data?.message || err.message || 'Failed to dispatch reminder',
        isError: true,
      });
    } finally {
      setTriggeringId(null);
    }
  };

  const formatElapsed = (dateString) => {
    if (!dateString) return 'Recently';
    const mins = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <MessageSquare size={20} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-light tracking-wide text-white">
              WhatsApp Abandoned Cart Recovery
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-400">
            Automatically detect abandoned checkouts and re-engage opted-in customers via Meta WhatsApp Cloud API.
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            activeTab === 'carts' ? fetchCarts() : fetchMessages();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-stone-300 font-medium transition-all"
        >
          <RefreshCw size={14} className={loadingStats || loadingCarts ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Abandoned Carts */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-stone-800/80 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] uppercase tracking-wider font-medium">Abandoned</span>
            <ShoppingBag size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-serif font-light text-white">
            {stats.totalAbandonedCarts}
          </p>
          <span className="text-[10px] text-stone-500 block">Pending recovery</span>
        </div>

        {/* Messages Sent */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-stone-800/80 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] uppercase tracking-wider font-medium">Sent</span>
            <Send size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-serif font-light text-white">
            {stats.messagesSent}
          </p>
          <span className="text-[10px] text-stone-500 block">Via WhatsApp API</span>
        </div>

        {/* Delivered */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-stone-800/80 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] uppercase tracking-wider font-medium">Delivered</span>
            <CheckCheck size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-serif font-light text-emerald-400">
            {stats.messagesDelivered}
          </p>
          <span className="text-[10px] text-stone-500 block">Confirmed receipts</span>
        </div>

        {/* Recovered Carts */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-stone-800/80 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] uppercase tracking-wider font-medium">Recovered</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-serif font-light text-white">
            {stats.recoveredCarts}
          </p>
          <span className="text-[10px] text-emerald-500/80 block">Orders completed</span>
        </div>

        {/* Conversion Rate */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-stone-800/80 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] uppercase tracking-wider font-medium">Rate</span>
            <TrendingUp size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-serif font-light text-amber-300">
            {stats.recoveryConversionRate}%
          </p>
          <span className="text-[10px] text-stone-500 block">Recovery conversion</span>
        </div>

        {/* Revenue Recovered */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-stone-800/80 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] uppercase tracking-wider font-medium">Revenue</span>
            <IndianRupee size={16} className="text-amber-400" />
          </div>
          <p className="text-xl font-serif font-light text-white truncate">
            ₹{Number(stats.revenueRecovered).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-stone-500 block">From recovered carts</span>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#141418] border border-stone-800/80 w-fit">
          <button
            onClick={() => setActiveTab('carts')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'carts'
                ? 'bg-stone-800 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Abandoned Carts List
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'messages'
                ? 'bg-stone-800 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Notification Logs
          </button>
        </div>

        {activeTab === 'carts' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400">Status:</span>
            <select
              value={cartFilter}
              onChange={(e) => setCartFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#141418] border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed / Recovered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      {/* Feedback Toast */}
      {actionFeedback.message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-all ${
            actionFeedback.isError
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* TAB 1: Abandoned Carts Table */}
      {activeTab === 'carts' && (
        <div className="rounded-2xl bg-[#141418] border border-stone-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-900/60 text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Customer</th>
                  <th className="py-3.5 px-4 font-medium">WhatsApp Opt-in</th>
                  <th className="py-3.5 px-4 font-medium">Cart Contents</th>
                  <th className="py-3.5 px-4 font-medium">Subtotal</th>
                  <th className="py-3.5 px-4 font-medium">Last Activity</th>
                  <th className="py-3.5 px-4 font-medium">Recovery Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {loadingCarts ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-stone-500">
                      <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-stone-400" />
                      Loading abandoned carts...
                    </td>
                  </tr>
                ) : carts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-stone-500">
                      No abandoned carts found matching current filters.
                    </td>
                  </tr>
                ) : (
                  carts.map((cart) => {
                    const user = cart.user || {};
                    const primaryItem = cart.items?.[0];
                    const isOptedIn = Boolean(user.whatsappOptIn);

                    return (
                      <tr key={cart._id} className="hover:bg-stone-800/30 transition-colors">
                        {/* Customer */}
                        <td className="py-4 px-4">
                          <div className="font-medium text-white">{user.name || 'Anonymous Guest'}</div>
                          <div className="text-[11px] text-stone-400">{user.email || 'No email'}</div>
                          {user.phone && (
                            <div className="text-[10px] text-stone-500 mt-0.5">{user.phone}</div>
                          )}
                        </td>

                        {/* WhatsApp Opt-in */}
                        <td className="py-4 px-4">
                          {isOptedIn ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                              <UserCheck size={12} />
                              Opted In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800/60 border border-stone-700/50 text-stone-400 text-[10px]">
                              <UserX size={12} />
                              Not Opted In
                            </span>
                          )}
                        </td>

                        {/* Items */}
                        <td className="py-4 px-4 max-w-xs">
                          <div className="flex items-center gap-2.5">
                            {primaryItem?.image && (
                              <img
                                src={primaryItem.image}
                                alt={primaryItem.name}
                                className="w-9 h-11 object-cover rounded-md border border-stone-800 flex-shrink-0"
                              />
                            )}
                            <div className="truncate">
                              <span className="font-medium text-stone-200 block truncate">
                                {primaryItem?.name || 'Custom Product'}
                              </span>
                              <span className="text-[11px] text-stone-400">
                                {cart.items?.length} item{cart.items?.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-4 px-4 font-serif text-sm font-medium text-amber-300">
                          ₹{Number(cart.subtotal).toLocaleString('en-IN')}
                        </td>

                        {/* Last Activity */}
                        <td className="py-4 px-4 text-stone-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-stone-500" />
                            <span>{formatElapsed(cart.lastActivityAt || cart.updatedAt)}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {cart.recoveryStatus === 'completed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                              <CheckCircle2 size={12} /> Recovered
                            </span>
                          ) : cart.recoveryStatus === 'in_progress' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-medium">
                              Step {cart.recoveryStep || 1} Sent
                            </span>
                          ) : cart.recoveryStatus === 'cancelled' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 text-stone-400 text-[10px]">
                              <Ban size={12} /> Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 text-stone-400 text-[10px]">
                              Pending Delay
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleManualReminder(cart._id)}
                            disabled={triggeringId === cart._id || !isOptedIn || cart.recoveryStatus === 'completed'}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-medium transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                          >
                            <Send size={12} className={triggeringId === cart._id ? 'animate-pulse' : ''} />
                            <span>{triggeringId === cart._id ? 'Sending...' : 'Send WhatsApp'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Notification Audit Logs */}
      {activeTab === 'messages' && (
        <div className="rounded-2xl bg-[#141418] border border-stone-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-900/60 text-[11px] uppercase tracking-wider text-stone-400 border-b border-stone-800">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Recipient</th>
                  <th className="py-3.5 px-4 font-medium">Type / Step</th>
                  <th className="py-3.5 px-4 font-medium">Template</th>
                  <th className="py-3.5 px-4 font-medium">Provider Message ID</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {loadingMessages ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-stone-500">
                      <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-stone-400" />
                      Loading message audit log...
                    </td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-stone-500">
                      No WhatsApp recovery messages dispatched yet.
                    </td>
                  </tr>
                ) : (
                  messages.map((msg) => (
                    <tr key={msg._id} className="hover:bg-stone-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-white">{msg.variables?.customerName || msg.userId?.name || 'Customer'}</div>
                        <div className="text-[11px] text-stone-400">+{msg.phoneNumber}</div>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-amber-300">
                        {msg.messageType}
                      </td>
                      <td className="py-4 px-4 text-stone-400">
                        {msg.templateName}
                      </td>
                      <td className="py-4 px-4 font-mono text-[10px] text-stone-400 truncate max-w-[180px]">
                        {msg.providerMessageId || 'Pending'}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                            msg.status === 'read'
                              ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300'
                              : msg.status === 'delivered'
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : msg.status === 'sent'
                              ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                              : msg.status === 'failed'
                              ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {msg.status}
                        </span>
                        {msg.errorMessage && (
                          <span className="block text-[10px] text-rose-400 mt-1 truncate max-w-[200px]">
                            {msg.errorMessage}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-stone-400 whitespace-nowrap">
                        {msg.sentAt ? new Date(msg.sentAt).toLocaleString('en-IN') : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbandonedCarts;
