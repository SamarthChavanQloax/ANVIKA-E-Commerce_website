import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FadeIn } from '../../components/animations/RevealOnScroll';
import Button from '../../components/common/Button';
import {
  Package,
  User,
  LogOut,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  Phone,
  Mail,
  Calendar,
  Save,
  X
} from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const { userInfo, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'orders' | 'profile' | 'addresses'
  const [activeTab, setActiveTab] = useState('orders');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [cancelErrorMsg, setCancelErrorMsg] = useState({});

  // Profile Details State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressActionMsg, setAddressActionMsg] = useState('');
  const [addressErrorMsg, setAddressErrorMsg] = useState('');

  // Global action message
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    fetchMyOrders();
    fetchUserProfile();
    fetchUserAddresses();
  }, [userInfo, navigate]);

  // 1. Fetch Orders
  const fetchMyOrders = async () => {
    try {
      setLoadingOrders(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
        withCredentials: true,
      };
      const { data } = await axios.get('/api/orders/myorders', config);
      setOrders(Array.isArray(data) ? data : []);
      setLoadingOrders(false);
    } catch (err) {
      setOrdersError(err.response?.data?.message || err.message || 'Failed to load orders');
      setLoadingOrders(false);
    }
  };

  // 2. Fetch User Profile
  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
        withCredentials: true,
      };
      const { data } = await axios.get('/api/users/profile', config);
      if (data) {
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          gender: data.gender || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        });
        if (Array.isArray(data.addresses)) {
          setAddresses(data.addresses);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  // 3. Fetch Addresses
  const fetchUserAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
        withCredentials: true,
      };
      const { data } = await axios.get('/api/users/addresses', config);
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch addresses:', err.message);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Profile Update Handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
        withCredentials: true,
      };
      const payload = {
        name: profileData.name,
        phone: profileData.phone,
        gender: profileData.gender,
        dateOfBirth: profileData.dateOfBirth || null,
      };
      const { data } = await axios.put('/api/users/profile', payload, config);

      updateUser({
        name: data.name,
        phone: data.phone,
      });

      setProfileSuccessMsg('Profile information updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      setProfileErrorMsg(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Address Add / Edit Submit Handler
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    setAddressErrorMsg('');
    setAddressActionMsg('');

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
        withCredentials: true,
      };

      if (editingAddressId) {
        // Update existing address
        await axios.put(`/api/users/addresses/${editingAddressId}`, addressForm, config);
        setAddressActionMsg('Address updated successfully.');
      } else {
        // Create new address
        await axios.post('/api/users/addresses', addressForm, config);
        setAddressActionMsg('New address added successfully.');
      }

      await fetchUserAddresses();
      setShowAddressModal(false);
      resetAddressForm();
      setTimeout(() => setAddressActionMsg(''), 4000);
    } catch (err) {
      setAddressErrorMsg(err.response?.data?.message || err.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  // Set Address as Default
  const handleSetDefaultAddress = async (addressId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
        withCredentials: true,
      };
      await axios.put(`/api/users/addresses/${addressId}`, { isDefault: true }, config);
      await fetchUserAddresses();
      setAddressActionMsg('Default delivery address updated.');
      setTimeout(() => setAddressActionMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to set default address');
    }
  };

  // Delete Address
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to remove this address?')) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
        withCredentials: true,
      };
      await axios.delete(`/api/users/addresses/${addressId}`, config);
      await fetchUserAddresses();
      setAddressActionMsg('Address deleted successfully.');
      setTimeout(() => setAddressActionMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete address');
    }
  };

  const openAddAddressModal = () => {
    resetAddressForm();
    setEditingAddressId(null);
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      addressLine: addr.addressLine || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'India',
      isDefault: Boolean(addr.isDefault),
    });
    setShowAddressModal(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      fullName: '',
      phone: '',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: addresses.length === 0,
    });
    setAddressErrorMsg('');
  };

  // Determine if customer can cancel order
  const isCancellableStatus = (status) => {
    const s = (status || '').toLowerCase();
    return ['placed', 'pending', 'confirmed', 'processing', 'packed'].includes(s);
  };

  // Cancel Order
  const handleCancelOrder = async (orderId) => {
    try {
      setCancellingId(orderId);
      setCancelErrorMsg((prev) => ({ ...prev, [orderId]: '' }));
      setActionMessage('');

      const headers = {};
      if (userInfo?.token) {
        headers.Authorization = `Bearer ${userInfo.token}`;
      }

      const config = {
        headers,
        withCredentials: true,
      };

      const { data } = await axios.put(`/api/orders/${orderId}/cancel`, {}, config);

      // Instantly update local order state to show Cancelled
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, orderStatus: 'Cancelled', cancelledAt: new Date() }
            : o
        )
      );

      setActionMessage(data?.message || 'Order cancelled successfully. Reserved inventory has been restored.');
      setConfirmCancelId(null);
      await fetchMyOrders();
    } catch (err) {
      console.error('Cancel order error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to cancel order';
      setCancelErrorMsg((prev) => ({ ...prev, [orderId]: msg }));
    } finally {
      setCancellingId(null);
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
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
                {profileData.phone && (
                  <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5">
                    <Phone size={12} className="text-accent" /> {profileData.phone}
                  </p>
                )}
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

          {/* Global Flash Messages */}
          {actionMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'orders'
                  ? 'bg-accent text-background font-semibold shadow-sm'
                  : 'text-text-muted hover:text-text hover:bg-surface'
              }`}
            >
              <Package size={16} />
              <span>Order History</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'orders' ? 'bg-background/20 text-background' : 'bg-surface text-text-muted border border-border'}`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-accent text-background font-semibold shadow-sm'
                  : 'text-text-muted hover:text-text hover:bg-surface'
              }`}
            >
              <User size={16} />
              <span>Profile Details</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'addresses'
                  ? 'bg-accent text-background font-semibold shadow-sm'
                  : 'text-text-muted hover:text-text hover:bg-surface'
              }`}
            >
              <MapPin size={16} />
              <span>Saved Addresses</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'addresses' ? 'bg-background/20 text-background' : 'bg-surface text-text-muted border border-border'}`}>
                {addresses.length}
              </span>
            </button>
          </div>

          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl text-text font-medium">Your Royal Orders</h2>
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
              ) : ordersError ? (
                <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-red-600 text-sm flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span>{ordersError}</span>
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

                          {isCancellableStatus(order.orderStatus) && (
                            <div className="flex items-center gap-2">
                              {confirmCancelId === order._id ? (
                                <div className="flex items-center gap-2 animate-fadeIn bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-xl">
                                  <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                                    Cancel this order?
                                  </span>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleCancelOrder(order._id)}
                                    disabled={cancellingId === order._id}
                                    className="text-xs py-1 px-2.5 bg-red-600 hover:bg-red-700 text-white border-red-600 transition-colors shadow-sm"
                                  >
                                    {cancellingId === order._id ? 'Cancelling...' : 'Confirm'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setConfirmCancelId(null);
                                      setCancelErrorMsg((prev) => ({ ...prev, [order._id]: '' }));
                                    }}
                                    disabled={cancellingId === order._id}
                                    className="text-xs py-1 px-2 text-text-muted hover:text-text border-border transition-colors"
                                  >
                                    Keep
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  onClick={() => setConfirmCancelId(order._id)}
                                  className="text-xs py-1.5 px-3 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                >
                                  Cancel Order
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cancellation Error Banner if any */}
                      {cancelErrorMsg[order._id] && (
                        <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
                          <AlertCircle size={14} className="shrink-0" />
                          <span>{cancelErrorMsg[order._id]}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-10 shadow-sm max-w-3xl">
              <div className="mb-6">
                <h2 className="font-serif text-xl text-text font-medium">Personal Information</h2>
                <p className="text-xs text-text-muted mt-1">
                  Manage your personal identity, contact numbers, and preferences.
                </p>
              </div>

              {profileSuccessMsg && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-3 pl-10 border border-border bg-background text-text rounded-xl focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                        placeholder="Your full name"
                      />
                      <User size={16} className="absolute left-3.5 top-3.5 text-text-muted" />
                    </div>
                  </div>

                  {/* Email (Readonly) */}
                  <div>
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2">
                      Email Address <span className="text-[10px] text-text-muted font-normal lowercase">(read-only)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={profileData.email}
                        className="w-full px-4 py-3 pl-10 border border-border bg-background/50 text-text-muted rounded-xl text-sm cursor-not-allowed"
                      />
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-text-muted" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-4 py-3 pl-10 border border-border bg-background text-text rounded-xl focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                        placeholder="+91 98765 43210"
                      />
                      <Phone size={16} className="absolute left-3.5 top-3.5 text-text-muted" />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2">
                      Gender
                    </label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-border bg-background text-text rounded-xl focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                    >
                      <option value="">Select Gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-3 pl-10 border border-border bg-background text-text rounded-xl focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                      />
                      <Calendar size={16} className="absolute left-3.5 top-3.5 text-text-muted" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-accent text-background text-xs uppercase tracking-widest px-8 py-3 rounded-xl flex items-center gap-2"
                  >
                    <Save size={15} />
                    {savingProfile ? 'Saving Changes...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <h2 className="font-serif text-xl text-text font-medium">Delivery Addresses</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Save multiple delivery addresses for smooth, expedited checkout.
                  </p>
                </div>

                <Button
                  onClick={openAddAddressModal}
                  className="bg-accent text-background text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-2 self-start sm:self-auto"
                >
                  <Plus size={16} /> Add New Address
                </Button>
              </div>

              {addressActionMsg && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{addressActionMsg}</span>
                </div>
              )}

              {loadingAddresses ? (
                <div className="py-16 text-center text-text-muted">
                  <div className="inline-block animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mb-3" />
                  <p className="text-sm font-light">Loading saved addresses...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="bg-surface border border-border rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center text-text-muted mx-auto mb-4 border border-border">
                    <MapPin size={28} strokeWidth={1.3} />
                  </div>
                  <h3 className="font-serif text-xl text-text mb-2">No Saved Addresses</h3>
                  <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
                    Add your home, office, or bridal studio address to streamline future orders.
                  </p>
                  <Button
                    onClick={openAddAddressModal}
                    className="bg-accent text-background text-xs uppercase tracking-widest px-6"
                  >
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`bg-surface border rounded-2xl p-6 shadow-sm relative transition-all ${
                        addr.isDefault
                          ? 'border-accent/80 ring-1 ring-accent/30'
                          : 'border-border hover:border-accent/40'
                      }`}
                    >
                      {/* Top Row: Name & Default Badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-base text-text font-semibold">{addr.fullName}</h4>
                            {addr.isDefault && (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent text-background flex items-center gap-1">
                                <Check size={10} strokeWidth={3} /> Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
                            <Phone size={12} className="text-accent" /> {addr.phone}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditAddressModal(addr)}
                            className="p-1.5 rounded-lg border border-border text-text-muted hover:text-text hover:bg-background transition-colors"
                            title="Edit Address"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="p-1.5 rounded-lg border border-border text-text-muted hover:text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete Address"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Address Text */}
                      <div className="text-xs text-text leading-relaxed mb-5 bg-background/50 p-3.5 rounded-xl border border-border/50">
                        <p className="font-medium text-text">{addr.addressLine}</p>
                        <p className="text-text-muted">
                          {addr.city}, {addr.state} - <span className="font-mono">{addr.postalCode}</span>
                        </p>
                        <p className="text-text-muted">{addr.country || 'India'}</p>
                      </div>

                      {/* Set Default Action */}
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr._id)}
                          className="text-xs text-accent hover:underline font-medium flex items-center gap-1"
                        >
                          Set as Default Address
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADD / EDIT ADDRESS MODAL */}
          {showAddressModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                  <div>
                    <h3 className="font-serif text-xl text-text font-medium">
                      {editingAddressId ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Ensure contact number is active for courier coordination.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-background transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {addressErrorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{addressErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      placeholder="Receiver's full name"
                      className="w-full px-3.5 py-2.5 border border-border bg-background text-text rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 border border-border bg-background text-text rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                      Street Address / Flat / Floor *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.addressLine}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                      placeholder="e.g. Flat 402, Royal Palms, Link Road"
                      className="w-full px-3.5 py-2.5 border border-border bg-background text-text rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="e.g. Mumbai"
                        className="w-full px-3.5 py-2.5 border border-border bg-background text-text rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder="e.g. Maharashtra"
                        className="w-full px-3.5 py-2.5 border border-border bg-background text-text rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                        Postal PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        placeholder="e.g. 400001"
                        className="w-full px-3.5 py-2.5 border border-border bg-background text-text rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-border bg-background text-text rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="w-4 h-4 rounded text-accent border-border focus:ring-accent"
                      />
                      <span className="text-xs text-text font-medium">
                        Make this my default shipping address
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddressModal(false)}
                      className="text-xs py-2.5 px-4"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={savingAddress}
                      className="bg-accent text-background text-xs uppercase tracking-widest py-2.5 px-6"
                    >
                      {savingAddress ? 'Saving...' : editingAddressId ? 'Update Address' : 'Add Address'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
};

export default Profile;
