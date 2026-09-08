import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ street: '', city: '', state: '', postalCode: '', country: 'India' });
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!userInfo) return <div className="page-shell max-w-xl mx-auto px-4"><h1 className="text-3xl font-serif mb-4">Sign in to checkout</h1><Button onClick={() => navigate('/login')}>Sign In</Button></div>;
  if (!cartItems.length) return <div className="page-shell max-w-xl mx-auto px-4"><h1 className="text-3xl font-serif mb-4">Your bag is empty</h1><Button onClick={() => navigate('/shop')}>Continue Shopping</Button></div>;

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setError(''); setIsSubmitting(true);
    try {
      const { data } = await api.post('/orders', {
        items: cartItems.map((item) => ({ productId: item._id, quantity: item.qty, size: item.selectedSize })),
        shippingAddress: form,
        paymentMethod,
        couponCode,
      });
      if (paymentMethod === 'razorpay') {
        const paymentOrder = (await api.post('/orders/payments/create', { orderId: data._id })).data;
        if (!(await loadRazorpay())) throw new Error('Payment interface could not be loaded.');
        new window.Razorpay({
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: 'ANVIKA',
          description: `Order ${data._id}`,
          order_id: paymentOrder.orderId,
          handler: async (response) => {
            try {
              await api.post('/orders/payments/verify', { orderId: data._id, ...response });
              clearCart();
              navigate(`/orders/${data._id}`);
            } catch (err) { setError(err.response?.data?.message || 'Payment verification failed.'); }
          },
          modal: {
            ondismiss: async () => {
              try {
                await api.post('/orders/payments/failure', { orderId: data._id, reason: 'Payment cancelled by customer' });
              } catch {}
              setError('Payment was cancelled. Your stock was not charged.');
            },
          },
          theme: { color: '#3A312F' },
        }).open();
        setIsSubmitting(false);
        return;
      }
      clearCart();
      navigate(`/orders/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout could not be completed.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="page-shell max-w-5xl mx-auto px-4 sm:px-6">
      <h1 className="text-4xl font-serif mb-8">Secure Checkout</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_20rem] gap-8">
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-serif">Shipping Address</h2>
          {['street', 'city', 'state', 'postalCode', 'country'].map((field) => (
            <label key={field} className="block text-sm capitalize">
              {field.replace(/([A-Z])/g, ' $1')}
              <input required name={field} value={form[field]} onChange={update} className="mt-1 w-full px-3 py-2.5 bg-background border border-border rounded-lg" />
            </label>
          ))}
          <label className="block text-sm">Coupon code<input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} className="mt-1 w-full px-3 py-2.5 bg-background border border-border rounded-lg" /></label>
          <label className="block text-sm">Payment method<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="mt-1 w-full px-3 py-2.5 bg-background border border-border rounded-lg"><option value="cod">Cash on delivery</option><option value="razorpay">Razorpay</option></select></label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" isLoading={isSubmitting} className="w-full">Place Order</Button>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6 h-fit space-y-3">
          <h2 className="text-xl font-serif">Order Items</h2>
          {cartItems.map((item) => <div key={item.cartKey} className="flex justify-between gap-3 text-sm"><span>{item.name} x {item.qty}</span><span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span></div>)}
          <p className="pt-3 border-t border-border text-xs text-text-muted">Prices, stock, shipping, and discounts are verified by the server.</p>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
