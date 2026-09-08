import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Orders = () => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userInfo) return;
    const load = async () => {
      try {
        if (id) setOrder((await api.get(`/orders/${id}`)).data);
        else setOrders((await api.get('/orders')).data);
      } catch (err) { setError(err.response?.data?.message || 'Unable to load orders.'); }
    };
    load();
  }, [id, userInfo]);

  if (!userInfo) return <div className="page-shell max-w-xl mx-auto px-4"><h1 className="text-3xl font-serif mb-4">Sign in to view orders</h1><Button onClick={() => navigate('/login')}>Sign In</Button></div>;
  if (error) return <div className="page-shell max-w-xl mx-auto px-4 text-red-600">{error}</div>;

  if (id) return <div className="page-shell max-w-3xl mx-auto px-4"><Link to="/orders" className="text-sm text-accent">Back to orders</Link><h1 className="text-4xl font-serif mt-4 mb-8">Order {order?._id?.slice(-8)}</h1>{order && <div className="bg-surface border border-border rounded-2xl p-6 space-y-4"><div className="flex justify-between"><span>Status</span><strong>{order.orderStatus}</strong></div>{order.items.map((item) => <div key={item._id} className="flex justify-between border-t border-border pt-3"><span>{item.productName} x {item.quantity}</span><span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span></div>)}<div className="border-t border-border pt-3 flex justify-between font-semibold"><span>Total</span><span>₹{order.totalAmount.toLocaleString('en-IN')}</span></div></div>}</div>;

  return <div className="page-shell max-w-4xl mx-auto px-4"><h1 className="text-4xl font-serif mb-8">My Orders</h1>{orders.length === 0 ? <p className="text-text-muted">No orders yet.</p> : <div className="space-y-4">{orders.map((item) => <Link key={item._id} to={`/orders/${item._id}`} className="block bg-surface border border-border rounded-2xl p-5 hover:border-accent"><div className="flex justify-between"><span>Order {item._id.slice(-8)}</span><strong>{item.orderStatus}</strong></div><p className="text-sm text-text-muted mt-2">{item.items.length} item(s) · ₹{item.totalAmount.toLocaleString('en-IN')}</p></Link>)}</div>}</div>;
};

export default Orders;
