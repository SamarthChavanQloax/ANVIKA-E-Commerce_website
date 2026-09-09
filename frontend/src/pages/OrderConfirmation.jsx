import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
} from 'lucide-react';

const OrderConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const { userInfo } = useAuth();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!order && id && userInfo?.token) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const config = {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          };
          const { data } = await axios.get(`/api/orders/${id}`, config);
          setOrder(data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load order details');
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [id, userInfo?.token, order]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 text-center bg-surface border border-border rounded-2xl">
        <h2 className="text-2xl font-serif font-bold text-text mb-2">Order Not Found</h2>
        <p className="text-textSecondary mb-6">{error || 'Unable to locate order details.'}</p>
        <Link
          to="/shop"
          className="inline-block px-6 py-2.5 bg-accent text-white rounded-full font-medium"
        >
          Return to Boutique
        </Link>
      </div>
    );
  }

  const items = order.items || order.orderItems || [];
  const shippingAddress = order.shippingAddress || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Success Banner */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs uppercase tracking-widest text-accent font-semibold">Thank you for your patronage</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text mt-1">Order Confirmed!</h1>
        <p className="text-textSecondary mt-2">
          Your order <span className="font-mono font-semibold text-text">#{order._id}</span> has been received and is being prepared with artisanal care.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden mb-8">
        {/* Order Meta Bar */}
        <div className="p-6 bg-background/50 border-b border-border flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-textSecondary uppercase tracking-wider font-medium">Order Date</p>
            <p className="text-sm font-medium text-text mt-0.5">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-textSecondary uppercase tracking-wider font-medium">Order Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mt-0.5">
              {order.orderStatus}
            </span>
          </div>
          <div>
            <p className="text-xs text-textSecondary uppercase tracking-wider font-medium">Payment Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${
              order.isPaid || order.paymentStatus === 'Completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {order.paymentStatus || (order.isPaid ? 'Completed' : 'Pending')}
            </span>
          </div>
          <div>
            <p className="text-xs text-textSecondary uppercase tracking-wider font-medium">Payment Method</p>
            <p className="text-sm font-medium text-text mt-0.5">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="p-6">
          <h3 className="font-serif font-bold text-lg text-text mb-4 flex items-center gap-2">
            <Package className="text-accent" />
            Purchased Couture Items ({items.length})
          </h3>
          <div className="divide-y divide-border">
            {items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-20 object-cover rounded-xl border border-border"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text truncate">{item.name}</h4>
                  <p className="text-xs text-textSecondary mt-0.5">
                    Size: <span className="font-medium text-text">{item.size || item.variant?.size || 'Free Size'}</span>
                    {item.color && (
                      <> &bull; Color: <span className="font-medium text-text">{item.color}</span></>
                    )}
                  </p>
                  <p className="text-xs text-textSecondary">Quantity: {item.qty || item.quantity || 1}</p>
                </div>
                <div className="text-right">
                  <p className="font-serif font-bold text-accent">
                    ₹{((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-textSecondary">₹{(item.price || 0).toLocaleString('en-IN')} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Ledger */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-t border-border bg-background/30">
          <div>
            <h4 className="font-serif font-semibold text-text text-sm mb-2 flex items-center gap-1.5">
              <MapPin className="text-accent" /> Delivery Address
            </h4>
            <div className="text-sm text-textSecondary leading-relaxed">
              <p className="font-medium text-text">{order.customer?.name || shippingAddress.fullName || order.user?.name || userInfo?.name}</p>
              {(order.customer?.email || order.user?.email || userInfo?.email) && (
                <p className="text-xs text-textSecondary">{order.customer?.email || order.user?.email || userInfo?.email}</p>
              )}
              <p className="mt-1">{shippingAddress.street || shippingAddress.addressLine}</p>
              <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
              <p>{shippingAddress.country || 'India'}</p>
              {(order.customer?.phone || shippingAddress.phone) && (
                <p className="mt-1 font-mono text-xs">Phone: {order.customer?.phone || shippingAddress.phone}</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-text text-sm mb-2 flex items-center gap-1.5">
              <CreditCard className="text-accent" /> Price Summary
            </h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-textSecondary">
                <span>Subtotal</span>
                <span className="font-medium text-text">₹{(order.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              {(order.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Savings</span>
                  <span>-₹{(order.discount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-textSecondary">
                <span>Shipping Fee</span>
                <span className="font-medium text-text">
                  {(order.shipping || order.shippingFee || 0) === 0 ? 'FREE' : `₹${order.shipping || order.shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border text-text">
                <span>Total Paid / Due</span>
                <span className="text-accent text-xl font-serif">₹{(order.total || order.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent/90 transition-all shadow-md"
        >
          <span>Continue Shopping</span>
          <ArrowRight />
        </Link>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text font-medium hover:bg-surface transition-all"
        >
          <span>View All My Orders</span>
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
