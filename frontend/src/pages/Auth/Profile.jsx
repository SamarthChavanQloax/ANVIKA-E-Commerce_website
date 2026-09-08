import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FadeIn } from '../../components/animations/RevealOnScroll';
import Button from '../../components/common/Button';
import { Package, User, LogOut, ShoppingBag, Clock, CheckCircle2, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    fetchMyOrders();
  }, [userInfo, navigate]);

  const fetchMyOrders = async () => {
    try {
      setLoadingOrders(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
        withCredentials: true,
      };
      const { data } = await axios.get('/api/orders/myorders', config);
      setOrders(data);
      setLoadingOrders(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load orders');
      setLoadingOrders(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Inventory stock will be restored.')) {
      return;
    }

    try {
      setCancellingId(orderId);
      setActionMessage('');
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
        withCredentials: true,
      };
      await axios.put(`/api/orders/${orderId}/cancel`, {}, config);
      setActionMessage('Order cancelled successfully.');
      await fetchMyOrders();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/users/logout', {}, { withCredentials: true });
    } catch (e) {}
    logout();
    navigate('/login');
  };

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-115px)] bg-background py-10 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          {/* Top User Header Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center font-serif text-2xl font-bold border border-accent/20">
                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-serif text-text font-medium">{userInfo.name}</h1>
                  <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                    {userInfo.role === 'admin' ? 'Administrator' : 'Valued Client'}
                  </span>
                </div>
                <p className="text-sm text-text-muted mt-0.5">{userInfo.email}</p>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-xs uppercase tracking-wider flex items-center gap-2 border-border hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 hover:border-red-300 transition-colors"
            >
              <LogOut size={15} /> Sign Out
            </Button>
          </div>

          {actionMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Orders Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <Package size={22} className="text-accent" />
                <h2 className="font-serif text-xl text-text font-medium">Order History</h2>
                <span className="text-xs bg-surface text-text-muted px-2 py-0.5 rounded-full border border-border">
                  {orders.length}
                </span>
              </div>
              <Link to="/shop">
                <Button variant="ghost" className="text-xs text-accent hover:underline flex items-center gap-1">
                  Continue Shopping <ArrowRight size={13} />
                </Button>
              </Link>
            </div>

            {loadingOrders ? (
              <div className="py-16 text-center text-text-muted">
                <div className="inline-block animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mb-3" />
                <p className="text-sm font-light">Retrieving your orders...</p>
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-red-600 text-sm flex items-center gap-3">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center text-text-muted mx-auto mb-4 border border-border">
                  <ShoppingBag size={28} strokeWidth={1.3} />
                </div>
                <h3 className="font-serif text-xl text-text mb-2">No Orders Placed Yet</h3>
                <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
                  Experience the pinnacle of Indian craftsmanship. Explore our curated sarees, bridal lehengas, and regal heirlooms.
                </p>
                <Link to="/shop">
                  <Button className="bg-primary text-background text-xs uppercase tracking-widest px-8">
                    Browse Collection
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:border-accent/40 transition-colors"
                  >
                    {/* Order Metadata Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60 text-xs">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono font-semibold text-text">
                          ORDER #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-text-muted flex items-center gap-1">
                          <Clock size={13} />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2">
                        {/* Order Status Badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                              : order.orderStatus === 'Shipped'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {order.orderStatus}
                        </span>

                        {/* Payment Status Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                            order.isPaid || order.paymentStatus === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50'
                              : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 border border-yellow-200/50'
                          }`}
                        >
                          {order.paymentMethod} • {order.isPaid || order.paymentStatus === 'Completed' ? 'Paid' : 'Pending Payment'}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="py-4 divide-y divide-border/40">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={item.image || '/demo-saree.jpg'}
                              alt={item.name}
                              className="w-14 h-16 object-cover rounded-lg bg-background border border-border flex-shrink-0"
                            />
                            <div>
                              <h4 className="font-serif text-sm text-text font-medium">{item.name}</h4>
                              <p className="text-xs text-text-muted mt-0.5">
                                Qty: <span className="text-text font-medium">{item.qty}</span> × ₹
                                {Number(item.price).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-sm text-text">
                            ₹{(Number(item.price) * Number(item.qty)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Row: Shipping & Total */}
                    <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
                      <div className="text-xs text-text-muted">
                        Delivery to: <span className="text-text font-medium">{order.shippingAddress?.street}, {order.shippingAddress?.city}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs text-text-muted mr-2">Total Amount:</span>
                          <span className="text-base font-semibold text-text font-serif">
                            ₹{Number(order.total).toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Cancel Order Action */}
                        {(order.orderStatus === 'Placed' || order.orderStatus === 'Confirmed') && (
                          <Button
                            variant="outline"
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={cancellingId === order._id}
                            className="text-xs py-1.5 px-3 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default Profile;
