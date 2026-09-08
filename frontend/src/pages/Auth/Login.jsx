import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FadeIn } from '../../components/animations/RevealOnScroll';
import Button from '../../components/common/Button';
import api from '../../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
<<<<<<< HEAD
      const { data } = await api.post('/users/login', { email, password });
      login(data);
=======
      let res;
      try {
        res = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
      } catch (authErr) {
        // Fallback to legacy route if needed
        res = await axios.post('/api/users/login', { email, password }, { withCredentials: true });
      }
      login(res.data);
      setIsLoading(false);
      navigate('/profile');
>>>>>>> origin/main
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
      setIsLoading(false);
    }
  };

  const fillQuickCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[calc(100vh-115px)] flex">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-surface">
        <img 
          src="/saree-lavender.png" 
          alt="Login Fashion"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-10 lg:p-16 bg-background">
        <FadeIn className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif text-text mb-2">Welcome Back</h1>
            <p className="text-text-muted">Sign in to access your wishlist and orders.</p>
          </div>

          {error && <div className="bg-red-100 text-red-700 p-3 mb-6 rounded-sm text-sm">{error}</div>}

          <form onSubmit={submitHandler} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-surface text-text rounded-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-text">Password</label>
                <Link to="/forgot-password" className="text-xs text-text-muted hover:text-text transition-colors">Forgot Password?</Link>
              </div>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-surface text-text rounded-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full h-12 mt-2" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2.5 text-center font-medium">Quick One-Click Test Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickCredentials('admin@anvika.com', 'password123')}
                className="py-2 px-3 text-xs bg-surface hover:bg-border/60 border border-border rounded-lg text-text transition-colors"
              >
                Demo Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('jane@example.com', 'password123')}
                className="py-2 px-3 text-xs bg-surface hover:bg-border/60 border border-border rounded-lg text-text transition-colors"
              >
                Demo Customer
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-text font-medium hover:text-accent transition-colors border-b border-transparent hover:border-accent">
              Create one
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default Login;
