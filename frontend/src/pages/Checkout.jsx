import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import {
  CheckCircle2,
  Truck,
  CreditCard,
  ShieldCheck,
  Tag,
  ChevronRight,
  AlertCircle,
  Lock,
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const {
    cartItems,
    subtotal,
    discountAmount,
    shippingFee,
    orderTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: userInfo?.name || '',
    phone: userInfo?.phone || '',
    street: '',
    city: '',
    state: 'Maharashtra',
    postalCode: '',
    country: 'India',
  });

  // WhatsApp Notification Opt-In state
  const [whatsappOptIn, setWhatsappOptIn] = useState(() => {
    return userInfo?.whatsappOptIn !== undefined ? userInfo.whatsappOptIn : true;
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // 'Razorpay' or 'COD'

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Processing state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load user addresses if available
  useEffect(() => {
    if (userInfo?.addresses && userInfo.addresses.length > 0) {
      setAddresses(userInfo.addresses);
    } else if (userInfo) {
      // Fetch fresh profile
      axios
        .get('/api/users/profile', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        })
        .then((res) => {
          if (res.data?.addresses?.length > 0) {
            setAddresses(res.data.addresses);
          }
        })
        .catch(() => {});
    }
  }, [userInfo]);

  // Load Razorpay SDK script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponCodeInput.trim()) return;

    const res = await applyCoupon(couponCodeInput);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponCodeInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const getActiveShippingAddress = () => {
    if (addresses.length > 0 && !isAddingNewAddress) {
      const addr = addresses[selectedAddressIndex] || addresses[0];
      return {
        fullName: addr.fullName || userInfo?.name || 'Customer',
        phone: addr.phone || userInfo?.phone || '',
        street: addr.street || addr.addressLine || '',
        addressLine: addr.addressLine || addr.street || '',
        city: addr.city || '',
        state: addr.state || '',
        postalCode: addr.postalCode || '',
        country: addr.country || 'India',
      };
    }
    return newAddress;
  };

  const handlePlaceOrder = async () => {
    setErrorMessage('');

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty');
      return;
    }

    const shippingAddress = getActiveShippingAddress();

    if (!shippingAddress.city || !shippingAddress.postalCode) {
      setErrorMessage('Please provide a complete shipping address (City and PIN code required)');
      return;
    }

    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // 1. Prepare items for backend
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty,
          quantity: item.qty,
          size: item.selectedSize || item.variant?.size || 'Free Size',
          color: item.variant?.color || '',
          variant: {
            size: item.selectedSize || item.variant?.size || 'Free Size',
            color: item.variant?.color || '',
          },
        })),
        shippingAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      // 2. Create authoritative order on backend
      const { data: createdOrder } = await axios.post('/api/orders', orderPayload, config);

      // 2b. Sync customer's confirmed phone and WhatsApp opt-in preferences in profile
      try {
        axios.put('/api/users/profile', {
          phone: shippingAddress.phone,
          whatsappOptIn,
        }, config).catch(() => {});
      } catch (_) {}

      if (paymentMethod === 'COD') {
        // COD complete immediately
        clearCart();
        navigate(`/order-confirmation/${createdOrder._id}`, {
          state: { order: createdOrder, isCOD: true },
        });
        return;
      }

      // 3. Online payment flow (Razorpay)
      const resLoaded = await loadRazorpayScript();

      // Create Razorpay Order via backend
      const { data: rzpData } = await axios.post(
        '/api/payments/create-order',
        { orderId: createdOrder._id },
        config
      );

      // Check if simulation mode (e.g. In local development without Razorpay keys)
      if (!resLoaded || rzpData.razorpayOrderId?.startsWith('order_sim_')) {
        // Execute seamless simulation verification for development testing
        const { data: verifyData } = await axios.post(
          '/api/payments/verify',
          {
            orderId: createdOrder._id,
            razorpayOrderId: rzpData.razorpayOrderId,
            razorpayPaymentId: `pay_sim_${Date.now()}`,
            razorpaySignature: 'simulated_signature',
          },
          config
        );

        clearCart();
        navigate(`/order-confirmation/${createdOrder._id}`, {
          state: { order: verifyData.order || createdOrder, simulated: true },
        });
        return;
      }

      // Live Razorpay Checkout
      const options = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency || 'INR',
        name: 'Anvika Boutique',
        description: `Payment for Order #${createdOrder._id.slice(-8).toUpperCase()}`,
        image: '/anvika-logo.png',
        order_id: rzpData.razorpayOrderId,
        prefill: {
          name: rzpData.customer?.name || userInfo?.name,
          email: rzpData.customer?.email || userInfo?.email,
          contact: rzpData.customer?.phone || shippingAddress.phone,
        },
        theme: {
          color: '#800020', // Burgundy / Royal Maroon
        },
        handler: async (response) => {
          try {
            const { data: verifyData } = await axios.post(
              '/api/payments/verify',
              {
                orderId: createdOrder._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              config
            );

            clearCart();
            navigate(`/order-confirmation/${createdOrder._id}`, {
              state: { order: verifyData.order || createdOrder },
            });
          } catch (err) {
            setErrorMessage(
              err.response?.data?.message || 'Payment signature verification failed. Please contact support.'
            );
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setErrorMessage('Payment cancelled by user. Your order is pending in your profile.');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(
        err.response?.data?.message || err.message || 'An error occurred during checkout'
      );
      setLoading(false);
    }
  };

  if (!userInfo) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="p-8 bg-surface rounded-2xl shadow-sm border border-border">
          <Lock className="w-12 h-12 mx-auto text-accent mb-4" />
          <h2 className="text-2xl font-serif font-bold text-text mb-2">Secure Checkout</h2>
          <p className="text-textSecondary mb-6">
            Please log in or register to complete your luxury boutique purchase.
          </p>
          <Link
            to={`/login?redirect=/checkout`}
            className="inline-block px-8 py-3 bg-accent text-white rounded-full font-medium shadow-md hover:bg-accent/90 transition-all"
          >
            Sign In to Checkout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-textSecondary mb-2">
          <Link to="/shop" className="hover:text-accent">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-text font-medium">Checkout</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text">Boutique Checkout</h1>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Shipping Address Section */}
          <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-bold text-text flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent" />
                Delivery Address
              </h2>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  {isAddingNewAddress ? 'Select Saved Address' : '+ Add New Address'}
                </button>
              )}
            </div>

            {/* Saved addresses selector */}
            {!isAddingNewAddress && addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAddressIndex === idx
                        ? 'border-accent bg-accent/5 ring-1 ring-accent'
                        : 'border-border hover:border-accent/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingAddress"
                      checked={selectedAddressIndex === idx}
                      onChange={() => setSelectedAddressIndex(idx)}
                      className="mt-1 text-accent focus:ring-accent"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-text">
                        {addr.fullName || userInfo.name}
                        {addr.phone && <span className="text-xs text-textSecondary ml-2 font-normal">({addr.phone})</span>}
                      </p>
                      <p className="text-sm text-textSecondary mt-1">
                        {addr.street || addr.addressLine}, {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-xs text-textSecondary mt-0.5">{addr.country || 'India'}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              /* New / Custom address form */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-textSecondary mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:border-accent"
                    placeholder="e.g. Ananya Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:border-accent"
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">PIN / Postal Code</label>
                  <input
                    type="text"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:border-accent"
                    placeholder="e.g. 400001"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-textSecondary mb-1">Address / Street</label>
                  <input
                    type="text"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:border-accent"
                    placeholder="Flat / House No., Apartment, Street"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">City</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:border-accent"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">State</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:border-accent"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>
            )}

            {/* WhatsApp Notification & Order Tracking Opt-In */}
            <div className="mt-5 p-3.5 rounded-xl bg-background border border-border flex items-start gap-3">
              <input
                type="checkbox"
                id="checkoutWhatsappOptIn"
                checked={whatsappOptIn}
                onChange={(e) => setWhatsappOptIn(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-accent focus:ring-accent accent-accent cursor-pointer"
              />
              <label htmlFor="checkoutWhatsappOptIn" className="text-xs text-textSecondary leading-relaxed cursor-pointer select-none">
                <span className="font-semibold text-text">WhatsApp Order Updates & Assistance:</span>{' '}
                Send order receipt, live courier dispatch tracking, and concierge styling reminders to{' '}
                <span className="font-medium text-accent">{shippingAddress?.phone || 'my phone number'}</span>.
              </label>
            </div>
          </div>

          {/* 2. Payment Method Section */}
          <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-xl font-serif font-bold text-text mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-accent" />
              Payment Method
            </h2>

            <div className="space-y-3">
              {/* Razorpay Option */}
              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'border-accent bg-accent/5 ring-1 ring-accent'
                    : 'border-border hover:border-accent/40'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-accent focus:ring-accent"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-text">Online Payment (Razorpay)</p>
                    <p className="text-xs text-textSecondary">UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Instant & Secure</span>
                </div>
              </label>

              {/* Cash On Delivery Option */}
              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-accent bg-accent/5 ring-1 ring-accent'
                    : 'border-border hover:border-accent/40'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-accent focus:ring-accent"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-text">Cash on Delivery (COD)</p>
                    <p className="text-xs text-textSecondary">Pay with cash or UPI at your doorstep upon arrival</p>
                  </div>
                </div>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">Doorstep</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm sticky top-24">
            <h2 className="text-xl font-serif font-bold text-text mb-4">Order Summary</h2>

            {/* Items list preview */}
            <div className="max-h-60 overflow-y-auto divide-y divide-border pr-2 mb-4">
              {cartItems.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-16 object-cover rounded-lg border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{item.name}</p>
                    <p className="text-xs text-textSecondary">
                      Size: {item.selectedSize || 'Free Size'} &bull; Qty: {item.qty}
                    </p>
                    <p className="text-sm font-semibold text-accent mt-0.5">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Box */}
            <div className="pt-2 pb-4 border-t border-border">
              {appliedCoupon ? (
                <div className="p-3 bg-accent/5 rounded-xl border border-accent/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-xs font-semibold text-accent">{appliedCoupon.code} Applied</p>
                      <p className="text-xs text-textSecondary">Saving ₹{discountAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-red-500 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      placeholder="Enter promo coupon code"
                      className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-text uppercase focus:outline-none focus:border-accent"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                  {couponSuccess && <p className="text-xs text-emerald-600 font-medium">{couponSuccess}</p>}
                </form>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-border text-sm">
              <div className="flex justify-between text-textSecondary">
                <span>Subtotal</span>
                <span className="text-text font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-textSecondary">
                <span>Shipping Fee</span>
                <span className="text-text font-medium">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-semibold">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between items-baseline text-base font-bold text-text">
                <span>Final Total</span>
                <span className="text-2xl font-serif text-accent">₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="button"
              disabled={loading || cartItems.length === 0}
              onClick={handlePlaceOrder}
              className={`w-full mt-6 py-3.5 px-6 rounded-xl font-medium text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                loading || cartItems.length === 0
                  ? 'bg-accent/50 cursor-not-allowed'
                  : 'bg-accent hover:bg-accent/90 hover:shadow-accent/25'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {paymentMethod === 'COD'
                      ? 'Confirm & Place COD Order'
                      : `Pay ₹${orderTotal.toLocaleString('en-IN')} with Razorpay`}
                  </span>
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="mt-4 pt-4 border-t border-border text-center text-xs text-textSecondary space-y-1">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck className="text-accent" /> 100% Verified Authentic Couture
              </p>
              <p>Free standard delivery on orders above ₹1,500</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
