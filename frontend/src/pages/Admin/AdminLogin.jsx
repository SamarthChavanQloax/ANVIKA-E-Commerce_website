import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Shield, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { userInfo, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (userInfo && userInfo.role === 'admin') {
      navigate(from, { replace: true });
    }
  }, [userInfo, navigate, from]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/users/login', { email, password }, { withCredentials: true });
      if (data.role !== 'admin') {
        setError('Access denied: This account does not have administrator privileges.');
        setIsLoading(false);
        return;
      }
      login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('admin@anvika.com');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-[#f2efe9] flex flex-col justify-center items-center p-4 selection:bg-amber-600/30 selection:text-amber-200 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 text-amber-400 mb-4 shadow-xl shadow-amber-900/20">
            <Shield size={28} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-wide">ANVIKA</h1>
          <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold mt-1">
            Administrator Portal
          </p>
          <p className="text-stone-400 text-sm mt-2">
            Sign in to manage inventory, orders, and products.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#141419] border border-stone-800/80 rounded-2xl p-7 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="flex items-start gap-3 p-3.5 mb-5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs leading-relaxed">
              <AlertCircle size={17} className="shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@anvika.com"
                  className="w-full pl-10 pr-4 py-3 bg-stone-900/90 border border-stone-800 rounded-xl text-stone-100 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-stone-900/90 border border-stone-800 rounded-xl text-stone-100 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-sm shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick One-Click Credentials */}
          <div className="mt-6 pt-5 border-t border-stone-800/80">
            <p className="text-[11px] text-stone-400 uppercase tracking-wider text-center font-medium mb-3">
              Developer Quick Access
            </p>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800/80 border border-stone-800 text-xs text-amber-300 flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Fill Default Admin Credentials (admin@anvika.com)</span>
            </button>
          </div>
        </div>

        {/* Back to store */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs text-stone-400 hover:text-stone-300 transition-colors"
          >
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
