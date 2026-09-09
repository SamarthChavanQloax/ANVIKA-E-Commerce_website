import React, { useState } from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Sparkles,
  ShoppingBag,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';

// 6 Canonical Royal Milestones
const ORDER_STAGES = [
  {
    key: 'placed',
    statusValues: ['pending', 'placed'],
    label: 'Order Placed',
    icon: ShoppingBag,
    summary: 'Order details recorded in our boutique system.',
  },
  {
    key: 'confirmed',
    statusValues: ['confirmed'],
    label: 'Order Confirmed',
    icon: CheckCircle2,
    summary: 'Order and payment verified by our atelier.',
  },
  {
    key: 'processing',
    statusValues: ['processing', 'packed'],
    label: 'Processing & Packed',
    icon: Package,
    summary: 'Handcrafted inspection & bespoke royal packaging complete.',
  },
  {
    key: 'shipped',
    statusValues: ['shipped'],
    label: 'Shipped',
    icon: Truck,
    summary: 'Dispatched with premium logistics partner and in transit.',
  },
  {
    key: 'out_for_delivery',
    statusValues: ['out for delivery'],
    label: 'Out for Delivery',
    icon: MapPin,
    summary: 'Courier executive is en route. Arriving at your address today!',
  },
  {
    key: 'delivered',
    statusValues: ['delivered'],
    label: 'Delivered',
    icon: Sparkles,
    summary: 'Delivered with care. Thank you for choosing Anvika.',
  },
];

const getStageIndex = (status) => {
  const s = (status || '').toLowerCase().trim();
  if (s === 'delivered') return 5;
  if (s === 'out for delivery') return 4;
  if (s === 'shipped') return 3;
  if (s === 'processing' || s === 'packed') return 2;
  if (s === 'confirmed') return 1;
  return 0; // pending / placed
};

const OrderStatusTracker = ({ order, onStatusUpdate, allowSimulation = false, userInfo = null }) => {
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [simulatingStatus, setSimulatingStatus] = useState(false);
  const [simMsg, setSimMsg] = useState('');

  if (!order) return null;

  const currentStatus = order.orderStatus || 'Placed';
  const isCancelled = currentStatus.toLowerCase() === 'cancelled';
  const isReturned = currentStatus.toLowerCase() === 'returned';
  const isRefunded = currentStatus.toLowerCase() === 'refunded';
  const isSpecialState = isCancelled || isReturned || isRefunded;

  const activeIndex = getStageIndex(currentStatus);

  // Tracking details
  const trackingNumber = order.trackingNumber || `ANV-EXP-${(order._id || '').slice(-6).toUpperCase()}`;
  const courierPartner = order.courierPartner || 'BlueDart Luxury Express';

  // Compute estimated delivery
  const getEstimatedDateString = () => {
    if (order.deliveredAt) {
      return new Date(order.deliveredAt).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    if (currentStatus === 'Out for Delivery') {
      return 'Arriving Today by 8:00 PM';
    }
    const baseDate = new Date(order.createdAt || Date.now());
    const est = order.estimatedDelivery ? new Date(order.estimatedDelivery) : new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000);
    return est.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCopyTracking = (e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  // Test Simulation Handler (Available for admins or testing)
  const handleSimulateStatus = async (newStatus, e) => {
    e?.stopPropagation();
    if (simulatingStatus) return;
    try {
      setSimulatingStatus(true);
      setSimMsg(`Updating status to ${newStatus}...`);

      const token = userInfo?.token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await axios.put(
        `/api/orders/${order._id}/status`,
        { status: newStatus },
        { headers, withCredentials: true }
      );

      if (onStatusUpdate) {
        onStatusUpdate(res.data?.order || { ...order, orderStatus: newStatus });
      }
      setSimMsg(`Status updated to ${newStatus}`);
      setTimeout(() => setSimMsg(''), 3000);
    } catch (err) {
      console.error('Status simulation error:', err);
      // If unauthorized on server (e.g. non-admin), still allow local UI preview if in simulation mode
      if (onStatusUpdate) {
        onStatusUpdate({ ...order, orderStatus: newStatus });
        setSimMsg(`Previewing ${newStatus}`);
        setTimeout(() => setSimMsg(''), 3000);
      } else {
        setSimMsg(err.response?.data?.message || 'Update failed');
      }
    } finally {
      setSimulatingStatus(false);
    }
  };

  const canSimulate = allowSimulation || userInfo?.role === 'admin';

  return (
    <div className="w-full bg-surface/80 dark:bg-surface/50 border border-border/80 rounded-2xl p-5 sm:p-7 shadow-sm transition-all text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold flex items-center gap-1.5">
              <ShieldCheck size={14} /> Official Consignment Tracking
            </span>
            <span className="text-text-muted text-xs">&bull;</span>
            <span className="font-mono text-xs text-text font-medium">#{order._id?.slice(-8).toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h3 className="font-serif text-lg sm:text-xl font-medium text-text">
              Status:{' '}
              <span
                className={
                  currentStatus === 'Delivered'
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : currentStatus === 'Out for Delivery'
                    ? 'text-amber-600 dark:text-amber-400 font-semibold animate-pulse'
                    : currentStatus === 'Shipped'
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : currentStatus === 'Cancelled'
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : 'text-accent font-semibold'
                }
              >
                {currentStatus}
              </span>
            </h3>

            <span
              className={`px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                currentStatus === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : currentStatus === 'Out for Delivery'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ring-2 ring-amber-400/40'
                  : currentStatus === 'Shipped'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                  : currentStatus === 'Cancelled'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  : 'bg-accent/15 text-accent'
              }`}
            >
              {currentStatus === 'Out for Delivery' ? '⚡ Out For Delivery' : currentStatus}
            </span>
          </div>
        </div>

        {/* Estimated Date / ETA Banner */}
        <div className="text-left sm:text-right bg-background/60 p-3 sm:p-3.5 rounded-xl border border-border/70">
          <p className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
            {currentStatus === 'Delivered' ? 'Delivered On' : 'Estimated Delivery'}
          </p>
          <p className="text-sm font-semibold text-text mt-0.5 flex items-center gap-1.5 sm:justify-end">
            <Clock size={14} className="text-accent" />
            <span className={currentStatus === 'Out for Delivery' ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
              {getEstimatedDateString()}
            </span>
          </p>
        </div>
      </div>

      {/* SPECIAL STATE: Cancelled or Returned */}
      {isSpecialState ? (
        <div className="my-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-start gap-4">
          <AlertTriangle className="text-red-600 dark:text-red-400 w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif font-bold text-red-700 dark:text-red-300 text-base">
              Order {currentStatus}
            </h4>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 leading-relaxed">
              {isCancelled
                ? 'This order was cancelled. Reserved inventory was restored to our boutique catalog.'
                : `This order is currently marked as ${currentStatus}.`}
              {order.cancelledAt && (
                <span className="block mt-1 font-mono text-[11px]">
                  Action recorded on {new Date(order.cancelledAt).toLocaleString('en-IN')}
                </span>
              )}
            </p>
          </div>
        </div>
      ) : (
        /* 6-STAGE CANONICAL MILESTONES STEPPER */
        <div className="my-8">
          <div className="relative">
            {/* Desktop / Tablet Stepper (horizontal) */}
            <div className="hidden md:grid grid-cols-6 gap-2 relative">
              {/* Connecting Progress Line */}
              <div className="absolute top-5 left-[8%] right-[8%] h-1 bg-border rounded-full -z-0">
                <div
                  className="h-full bg-accent transition-all duration-700 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, (activeIndex / (ORDER_STAGES.length - 1)) * 100))}%`,
                  }}
                />
              </div>

              {ORDER_STAGES.map((stage, idx) => {
                const isCompleted = idx < activeIndex;
                const isCurrent = idx === activeIndex;
                const StageIcon = stage.icon;

                return (
                  <div key={stage.key} className="flex flex-col items-center text-center relative z-10">
                    {/* Milestone Node */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-accent text-background shadow-md shadow-accent/25'
                          : isCurrent
                          ? 'bg-accent text-background ring-4 ring-accent/30 shadow-lg scale-110'
                          : 'bg-background border-2 border-border text-text-muted'
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={18} strokeWidth={2.6} />
                      ) : (
                        <StageIcon size={18} strokeWidth={isCurrent ? 2.2 : 1.7} />
                      )}
                    </div>

                    {/* Milestone Label */}
                    <p
                      className={`text-xs mt-3 font-medium transition-colors ${
                        isCurrent
                          ? 'text-accent font-bold scale-105'
                          : isCompleted
                          ? 'text-text font-semibold'
                          : 'text-text-muted font-normal'
                      }`}
                    >
                      {stage.label}
                    </p>

                    {/* Active Pulsing Indicator Badge */}
                    {isCurrent && (
                      <span className="mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent animate-pulse">
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Stepper (vertical) */}
            <div className="md:hidden space-y-4 relative pl-7 border-l-2 border-border ml-3">
              {ORDER_STAGES.map((stage, idx) => {
                const isCompleted = idx < activeIndex;
                const isCurrent = idx === activeIndex;
                const StageIcon = stage.icon;

                return (
                  <div key={stage.key} className="relative pb-2">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-[37px] top-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-accent text-background'
                          : isCurrent
                          ? 'bg-accent text-background ring-4 ring-accent/30 scale-105'
                          : 'bg-background border-2 border-border text-text-muted'
                      }`}
                    >
                      {isCompleted ? <Check size={14} strokeWidth={3} /> : <StageIcon size={14} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm ${
                            isCurrent
                              ? 'text-accent font-bold'
                              : isCompleted
                              ? 'text-text font-medium'
                              : 'text-text-muted'
                          }`}
                        >
                          {stage.label}
                        </p>
                        {isCurrent && (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent animate-pulse">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">{stage.summary}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE STAGE HIGHLIGHT BOX */}
      {!isSpecialState && (
        <div
          className={`p-4 sm:p-5 rounded-xl border mb-6 transition-all ${
            currentStatus === 'Out for Delivery'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
              : currentStatus === 'Shipped'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200'
              : currentStatus === 'Delivered'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              : 'bg-accent/5 border-accent/20 text-text'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-background/80 shadow-xs mt-0.5 flex-shrink-0">
              {currentStatus === 'Out for Delivery' ? (
                <MapPin className="text-amber-600 dark:text-amber-400 w-5 h-5 animate-bounce" />
              ) : currentStatus === 'Shipped' ? (
                <Truck className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              ) : currentStatus === 'Delivered' ? (
                <Sparkles className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
              ) : (
                <CheckCircle2 className="text-accent w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <h5 className="font-serif font-bold text-sm sm:text-base">
                {currentStatus === 'Out for Delivery'
                  ? 'Consignment is Out for Delivery!'
                  : currentStatus === 'Shipped'
                  ? 'Consignment In Transit with Courier Partner'
                  : currentStatus === 'Delivered'
                  ? 'Consignment Successfully Delivered'
                  : currentStatus === 'Processing' || currentStatus === 'Packed'
                  ? 'Artisan Tailoring & Packing in Progress'
                  : 'Order Confirmed and Scheduled for Dispatch'}
              </h5>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {currentStatus === 'Out for Delivery'
                  ? `Our courier delivery executive is out for delivery in your postal zone. Please keep your contact phone (+91 ${order.shippingAddress?.phone || order.customer?.phone || 'registered number'}) available for courier verification.`
                  : currentStatus === 'Shipped'
                  ? `Your luxury order has departed our facility via ${courierPartner} under tracking AWB #${trackingNumber}. You can track package journey in real time.`
                  : currentStatus === 'Delivered'
                  ? 'Your package has been successfully delivered. We hope you cherish your royal handcrafted ensemble.'
                  : currentStatus === 'Processing' || currentStatus === 'Packed'
                  ? 'Our artisans are applying signature finishing touches and packing your heirloom garments in our protective moisture-sealed royal gift box.'
                  : 'Your royal order has been confirmed. You will receive live status notifications as your package advances through our ateliers.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LOGISTICS & COURIER DETAILS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60 text-xs">
        {/* Courier Partner */}
        <div className="bg-background/60 p-3.5 rounded-xl border border-border/60">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted block mb-1">
            Courier Partner
          </span>
          <p className="font-serif text-text font-medium text-sm flex items-center gap-1.5">
            <Truck size={14} className="text-accent" />
            {courierPartner}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 block">
            Express Air Priority
          </span>
        </div>

        {/* Tracking AWB */}
        <div className="bg-background/60 p-3.5 rounded-xl border border-border/60">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted block mb-1">
            Tracking Waybill (AWB)
          </span>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <span className="font-mono text-xs font-semibold text-text truncate">
              {trackingNumber}
            </span>
            <button
              onClick={handleCopyTracking}
              className="p-1 rounded hover:bg-surface text-text-muted hover:text-accent transition-colors shrink-0"
              title="Copy tracking number"
            >
              {copiedTracking ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>
          <span className="text-[10px] text-text-muted mt-0.5 block">
            {copiedTracking ? 'Copied to clipboard!' : 'Click icon to copy AWB'}
          </span>
        </div>

        {/* Shipping Destination */}
        <div className="bg-background/60 p-3.5 rounded-xl border border-border/60">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted block mb-1">
            Destination Address
          </span>
          <p className="font-medium text-text truncate">
            {order.shippingAddress?.fullName || order.customer?.name || 'Customer'}
          </p>
          <p className="text-text-muted truncate mt-0.5">
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
          </p>
        </div>
      </div>

      {/* QUICK STATUS TEST SIMULATOR (Accessible for Admins or interactive testing) */}
      {canSimulate && (
        <div className="mt-6 pt-4 border-t border-dashed border-border/80">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted flex items-center gap-1">
              <RotateCcw size={11} /> Test Order Status Transitions:
            </span>
            {simMsg && <span className="text-xs text-accent font-medium">{simMsg}</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].map((statusOption) => (
              <button
                key={statusOption}
                onClick={(e) => handleSimulateStatus(statusOption, e)}
                disabled={simulatingStatus || currentStatus === statusOption}
                className={`text-[11px] px-3 py-1 rounded-lg border transition-all ${
                  currentStatus === statusOption
                    ? 'bg-accent text-background font-bold border-accent shadow-xs'
                    : 'bg-background hover:bg-surface text-text-muted hover:text-text border-border'
                }`}
              >
                {statusOption}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTracker;
