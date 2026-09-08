import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const AdminDashboard = () => {
  const { userInfo } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [dashboardResponse, ordersResponse] = await Promise.all([api.get('/admin/dashboard'), api.get('/admin/orders')]);
      setDashboard(dashboardResponse.data); setOrders(ordersResponse.data);
    } catch (err) { setError(err.response?.data?.message || 'Unable to load admin data.'); }
  };
  useEffect(() => { if (userInfo?.role === 'admin') load(); }, [userInfo]);

  if (userInfo?.role !== 'admin') return <div className="page-shell max-w-xl mx-auto px-4">Admin access required.</div>;
  if (error) return <div className="page-shell max-w-xl mx-auto px-4 text-red-600">{error}</div>;
  if (!dashboard) return <div className="page-shell max-w-xl mx-auto px-4">Loading dashboard...</div>;
  const updateStatus = async (id, status) => { await api.put(`/admin/orders/${id}/status`, { status }); await load(); };

  return <div className="page-shell max-w-7xl mx-auto px-4"><h1 className="text-4xl font-serif mb-8">Admin Dashboard</h1><div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{[['Revenue', `₹${dashboard.totalRevenue.toLocaleString('en-IN')}`], ['Orders', dashboard.totalOrders], ['Customers', dashboard.totalCustomers], ['Products', dashboard.totalProducts]].map(([label, value]) => <div key={label} className="bg-surface border border-border rounded-2xl p-5"><p className="text-sm text-text-muted">{label}</p><strong className="text-2xl">{value}</strong></div>)}</div><div className="bg-surface border border-border rounded-2xl p-6"><h2 className="text-xl font-serif mb-4">Order Management</h2><div className="space-y-3">{orders.map((order) => <div key={order._id} className="flex flex-wrap gap-3 items-center justify-between border-t border-border pt-3"><span>{order.user?.name || 'Customer'} · ₹{order.totalAmount.toLocaleString('en-IN')}</span><select value={order.orderStatus} onChange={(event) => updateStatus(order._id, event.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 text-sm">{['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'].map((status) => <option key={status}>{status}</option>)}</select></div>)}</div></div></div>;
};

export default AdminDashboard;
