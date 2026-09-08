import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FadeIn } from '../../components/animations/RevealOnScroll';
import axios from 'axios';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

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
      const { data } = await axios.post('/api/users/login', { email, password }, { withCredentials: true });
      login(data);
      setIsLoading(false);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-115px)] flex items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-12 bg-stone-950">
      {/* Background Video Looping Continuously */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover filter brightness-[0.88] contrast-[1.02]"
        src="/videos/login_video.mp4"
      />

      {/* Subtle Ambient Video Tint (keeps video visible, avoids black wash) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/25 to-black/40 backdrop-blur-[1px]" />

      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* Left Side: Brand Narrative */}
        <div className="hidden lg:flex flex-col max-w-xl text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/25 text-amber-300 text-xs font-medium tracking-widest uppercase w-fit shadow-sm">
            <Sparkles size={14} className="text-amber-300 animate-pulse" />
            <span>Anvika Heritage Couture</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-serif font-light leading-tight tracking-wide text-white drop-shadow-md">
            Timeless Elegance, <br />
            <span className="italic font-serif text-amber-300">Woven for Royalty.</span>
          </h1>

          <p className="text-stone-200 text-sm xl:text-base leading-relaxed font-light max-w-lg drop-shadow">
            Sign in to curate your personal bridal trousseau, track bespoke orders, and enjoy private access to limited artisan drops.
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-stone-200 font-light">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-sm">
              <ShieldCheck size={14} className="text-amber-300" /> Authentic Handloom
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-sm">
              <Sparkles size={14} className="text-amber-300" /> Bespoke Craftsmanship
            </span>
          </div>
        </div>

        {/* Right Side: Transparent Blurry Glass Login Card */}
        <div className="w-full max-w-md">
          <FadeIn>
            <div className="relative overflow-hidden backdrop-blur-2xl bg-white/[0.08] hover:bg-white/[0.11] border border-white/25 rounded-3xl p-8 sm:p-10 shadow-[0_16px_50px_rgba(0,0,0,0.4)] text-white transition-all duration-300 ring-1 ring-white/20">
              
              {/* Subtle top light sheen for glass effect */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

              <div className="text-center mb-8">
                <span className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-[10px] uppercase tracking-widest mb-3">
                  <Sparkles size={12} className="text-amber-300" /> Anvika Boutique
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-white font-light mb-2 drop-shadow-sm">Welcome Back</h2>
                <p className="text-xs sm:text-sm text-stone-200 font-light">Sign in to your customer account</p>
              </div>

              {error && (
                <div className="bg-red-500/25 border border-red-400/40 text-red-100 px-4 py-3 mb-6 rounded-xl text-xs backdrop-blur-md flex items-center gap-2">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={submitHandler} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone-200 font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 hover:bg-white/[0.15] focus:bg-white/[0.18] border border-white/20 focus:border-amber-300/80 rounded-xl text-white placeholder-stone-300/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/30 backdrop-blur-xl transition-all"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs uppercase tracking-wider text-stone-200 font-medium">
                      Password
                    </label>
                    <Link to="/contact" className="text-xs text-amber-300 hover:text-amber-200 transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                    <input 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 hover:bg-white/[0.15] focus:bg-white/[0.18] border border-white/20 focus:border-amber-300/80 rounded-xl text-white placeholder-stone-300/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/30 backdrop-blur-xl transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-semibold text-xs uppercase tracking-widest shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.5)] transition-all duration-300 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/15 text-center text-xs text-stone-200 font-light">
                Don't have an account yet?{' '}
                <Link to="/register" className="text-amber-300 font-medium hover:text-amber-200 transition-colors underline underline-offset-4 ml-1">
                  Create an account
                </Link>
              </div>

            </div>
          </FadeIn>
        </div>

      </div>
    </div>
  );
};

export default Login;
