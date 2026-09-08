import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  IndianRupee,
  ShieldCheck,
  User,
} from 'lucide-react';

const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get('/api/admin/customers', { withCredentials: true });
      setCustomers(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch customer list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            Customer Directory
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Registered customer accounts, verified orders, and total lifetime spend (passwords securely hidden).
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors text-xs self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-amber-400' : ''} />
          <span>Refresh Customers</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, email, or phone number..."
          className="w-full pl-10 pr-4 py-3 bg-[#141419] border border-stone-800 rounded-xl text-stone-100 text-xs placeholder-stone-500 focus:outline-none focus:border-amber-500"
        />
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
      </div>

      {/* Customers Table */}
      <div className="bg-[#141419] border border-stone-800/80 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-400">Loading Customers from MongoDB...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center text-stone-500 text-xs">
            No customer accounts found matching search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-900/70 border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Contact</th>
                  <th className="py-3.5 px-4 font-semibold">Registration Date</th>
                  <th className="py-3.5 px-4 font-semibold">Completed Orders</th>
                  <th className="py-3.5 px-4 font-semibold">Lifetime Spent</th>
                  <th className="py-3.5 px-4 font-semibold">Account Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredCustomers.map((user) => {
                  const isAdmin = user.role === 'admin';
                  return (
                    <tr key={user._id} className="hover:bg-stone-900/30 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-sm shrink-0 border ${
                            isAdmin
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-stone-800 text-stone-300 border-stone-700'
                          }`}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-200 truncate">{user.name || 'Anonymous'}</p>
                            <p className="text-[11px] text-stone-400 font-mono">ID: #{user._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="text-stone-300 flex items-center gap-1.5">
                          <Mail size={12} className="text-stone-500" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && user.phone !== 'N/A' && (
                          <div className="text-stone-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                            <Phone size={12} className="text-stone-500" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 text-stone-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-stone-500" />
                          <span>
                            {new Date(user.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-stone-200">
                          {user.ordersCount || 0} order(s)
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white text-sm">
                          {formatINR(user.totalSpent)}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <ShieldCheck size={12} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                            <User size={12} />
                            Customer
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
