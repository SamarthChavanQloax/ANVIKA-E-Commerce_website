import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FadeIn } from '../../components/animations/RevealOnScroll';
import Button from '../../components/common/Button';
import api from '../../api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/users', { name, email, password });
      login(data);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed.');
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-115px)] flex flex-row-reverse">
      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-surface">
        <img 
          src="/saree-rust.png" 
          alt="Register Fashion"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-10 lg:p-16 bg-background">
        <FadeIn className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif text-text mb-2">Create Account</h1>
            <p className="text-text-muted">Join us to experience modern Indian luxury.</p>
          </div>

          {error && <div className="bg-red-100 text-red-700 p-3 mb-6 rounded-sm text-sm">{error}</div>}

          <form onSubmit={submitHandler} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Full Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-surface text-text rounded-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                placeholder="Jane Doe"
              />
            </div>
            
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
              <label className="block text-sm font-medium text-text mb-2">Password</label>
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
              Register
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-text font-medium hover:text-accent transition-colors border-b border-transparent hover:border-accent">
              Sign In
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default Register;
