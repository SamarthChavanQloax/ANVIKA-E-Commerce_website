import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FadeIn } from '../../components/animations/RevealOnScroll';
import axios from 'axios';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  RefreshCw
} from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = Request Code, 2 = Enter Code & Reset Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devCode, setDevCode] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Step 1: Send verification code to email
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setSuccessMessage('A 6-digit verification code has been generated for your account.');
      if (res.data?.code) {
        setDevCode(res.data.code);
        setCode(res.data.code); // Prefill for smooth immediate verification
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to process password reset request');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code in Step 2
  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setSuccessMessage('A new verification code has been generated.');
      if (res.data?.code) {
        setDevCode(res.data.code);
        setCode(res.data.code);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  // Step 2: Reset password and automatically authenticate
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/auth/reset-password', {
        email,
        code: code.trim(),
        newPassword,
      }, { withCredentials: true });

      setSuccessMessage('Password reset successfully! Redirecting...');
      
      // If user object and token returned, log them in directly
      if (res.data?.token || res.data?._id) {
        login(res.data);
        setTimeout(() => {
          navigate('/profile');
        }, 1200);
      } else {
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password. Please check your code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-y-auto pt-[125px] pb-12 px-4 sm:px-6 lg:px-12 bg-stone-950">
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/45 backdrop-blur-[1px]" />

      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
        
        {/* Left Side: Brand Narrative & Security Assurance */}
        <div className="hidden lg:flex flex-col max-w-xl text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/25 text-amber-300 text-xs font-medium tracking-widest uppercase w-fit shadow-sm">
            <Sparkles size={14} className="text-amber-300 animate-pulse" />
            <span>Account Security & Recovery</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-serif font-light leading-tight tracking-wide text-white drop-shadow-md">
            Restore Access to <br />
            <span className="italic font-serif text-amber-300">Your Private Vault.</span>
          </h1>

          <p className="text-stone-200 text-sm xl:text-base leading-relaxed font-light max-w-lg drop-shadow">
            Safely recover your credentials with our encrypted verification flow to continue exploring exclusive handloom couture and personal order histories.
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-stone-200 font-light">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-sm">
              <ShieldCheck size={14} className="text-amber-300" /> End-to-End Encrypted
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-sm">
              <KeyRound size={14} className="text-amber-300" /> Instant Key Delivery
            </span>
          </div>
        </div>

        {/* Right Side: Transparent Blurry Glass Card */}
        <div className="w-full max-w-md">
          <FadeIn>
            <div className="relative overflow-hidden backdrop-blur-2xl bg-white/[0.08] hover:bg-white/[0.11] border border-white/25 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_16px_50px_rgba(0,0,0,0.4)] text-white transition-all duration-300 ring-1 ring-white/20">
              
              {/* Subtle top light sheen for glass effect */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-amber-400' : 'w-2 bg-white/30'}`} />
                <span className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-amber-400' : 'w-2 bg-white/30'}`} />
              </div>

              {/* Card Heading */}
              <div className="text-center mb-6">
                <span className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-[10px] uppercase tracking-widest mb-3">
                  <Sparkles size={12} className="text-amber-300" /> Anvika Boutique
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-white font-light mb-1.5 drop-shadow-sm">
                  {step === 1 ? 'Forgot Password' : 'Create New Password'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-200 font-light">
                  {step === 1 
                    ? 'Enter your registered email to receive a recovery code' 
                    : `Enter the code sent to ${email}`}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/25 border border-red-400/40 text-red-100 px-4 py-3 mb-5 rounded-xl text-xs backdrop-blur-md flex items-center gap-2 animate-fadeIn">
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="bg-emerald-500/25 border border-emerald-400/40 text-emerald-100 px-4 py-3 mb-5 rounded-xl text-xs backdrop-blur-md flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* STEP 1: Request Recovery Code */}
              {step === 1 && (
                <form onSubmit={handleRequestCode} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-200 font-medium mb-2">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                      <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 hover:bg-white/[0.15] focus:bg-white/[0.18] border border-white/20 focus:border-amber-300/80 rounded-xl text-white placeholder-stone-300/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/30 backdrop-blur-xl transition-all"
                        placeholder="customer@example.com"
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
                        <span>Send Recovery Code</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Enter Code and New Password */}
              {step === 2 && (
                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                  {/* Dev Code Quick Badge */}
                  {devCode && (
                    <div className="p-2.5 rounded-xl bg-amber-400/15 border border-amber-300/30 text-amber-200 text-xs flex items-center justify-between">
                      <span className="font-mono text-xs">Code: <strong className="tracking-widest text-amber-300">{devCode}</strong></span>
                      <span className="text-[10px] text-amber-300/80 uppercase tracking-wider">Auto-filled</span>
                    </div>
                  )}

                  {/* 6-Digit Code */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-stone-200 font-medium">
                        Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="text-[11px] text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw size={11} className={isResending ? 'animate-spin' : ''} />
                        Resend Code
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                      <input 
                        type="text" 
                        required 
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/10 hover:bg-white/[0.15] focus:bg-white/[0.18] border border-white/20 focus:border-amber-300/80 rounded-xl text-white font-mono tracking-widest placeholder-stone-300/60 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/30 backdrop-blur-xl transition-all"
                        placeholder="123456"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-200 font-medium mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-white/10 hover:bg-white/[0.15] focus:bg-white/[0.18] border border-white/20 focus:border-amber-300/80 rounded-xl text-white placeholder-stone-300/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/30 backdrop-blur-xl transition-all"
                        placeholder="At least 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-stone-200 font-medium mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-white/10 hover:bg-white/[0.15] focus:bg-white/[0.18] border border-white/20 focus:border-amber-300/80 rounded-xl text-white placeholder-stone-300/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/30 backdrop-blur-xl transition-all"
                        placeholder="Re-enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-semibold text-xs uppercase tracking-widest shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.5)] transition-all duration-300 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Reset Password & Sign In</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  {/* Change Email button */}
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); setSuccessMessage(''); }}
                    className="mt-1 text-xs text-stone-300 hover:text-white inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Change Email Address</span>
                  </button>
                </form>
              )}

              {/* Return to Login */}
              <div className="mt-8 pt-6 border-t border-white/15 text-center text-xs text-stone-200 font-light flex items-center justify-center gap-1">
                <span>Remember your credentials?</span>
                <Link to="/login" className="text-amber-300 font-medium hover:text-amber-200 transition-colors underline underline-offset-4 ml-1">
                  Back to Sign In
                </Link>
              </div>

            </div>
          </FadeIn>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
