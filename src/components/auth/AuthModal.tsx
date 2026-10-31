import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  User,
  Lock,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'signin' | 'signup';
  onClose: () => void;
  onSuccess?: () => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
  onOpenTerms,
  onOpenPrivacy,
}) => {
  const { login, signUp, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setInfoMessage(null);
    setResetSent(false);
    setFieldErrors({});
    setLoading(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // RFC 5322 compliant regex for robust email validation
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Helper to normalize and test mobile phone (Indian 10-digit mobile or standard format)
  const validatePhone = (raw: string): boolean => {
    const cleanDigits = raw.replace(/\D/g, '');
    if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
      const national = cleanDigits.slice(2);
      return /^[6-9]\d{9}$/.test(national);
    }
    if (cleanDigits.length === 10) {
      return /^[6-9]\d{9}$/.test(cleanDigits);
    }
    return false;
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (mode === 'signup') {
      // 1. Full Name Validation
      const trimmedName = fullName.trim();
      if (!trimmedName) {
        errors.fullName = 'Full name is required.';
      } else if (trimmedName.length < 2) {
        errors.fullName = 'Please enter your full name (minimum 2 characters).';
      }

      // 2. Mobile Phone Validation
      const trimmedPhone = phone.trim();
      if (!trimmedPhone) {
        errors.phone = 'Mobile number is required for event check-in.';
      } else if (!validatePhone(trimmedPhone)) {
        errors.phone = 'Please enter a valid 10-digit mobile number (e.g. 98350 12345).';
      }
    }

    // 3. Email Validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please provide a valid email address (e.g. name@domain.com).';
    }

    // 4. Password Validation
    if (mode !== 'forgot') {
      if (!password) {
        errors.password = 'Password is required.';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
      }

      // 5. Confirm Password Validation (Signup mode only)
      if (mode === 'signup') {
        if (!confirmPassword) {
          errors.confirmPassword = 'Please confirm your password.';
        } else if (password !== confirmPassword) {
          errors.confirmPassword = 'Passwords do not match.';
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setInfoMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'forgot') {
        setResetSent(true);
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        if (!isSupabaseConfigured) {
          setInfoMessage(
            'Form validation passed! However, live user registration requires Supabase backend credentials. Accounts cannot be persisted without database setup. Review the setup guide below to configure your Supabase project.'
          );
          setShowSetupGuide(true);
          setLoading(false);
          return;
        }

        // Live Supabase signup
        await signUp(email.trim(), fullName.trim(), phone.trim(), password);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        // Sign-in mode
        if (!isSupabaseConfigured) {
          setInfoMessage(
            'Supabase is not configured yet. Live login requires Supabase backend credentials. Review setup instructions below.'
          );
          setShowSetupGuide(true);
          setLoading(false);
          return;
        }

        await login(email.trim(), password);
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    if (loading) return;
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        setError(
          'Google Sign-In is not configured yet. Live Google OAuth requires backend Supabase credentials and Google OAuth provider setup.'
        );
        setShowSetupGuide(true);
        setLoading(false);
        return;
      }

      await loginWithGoogle();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in is unavailable in this environment.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    Boolean(password && confirmPassword) && password === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md bg-[#111215] border border-[#25272c] rounded-2xl shadow-2xl p-5 sm:p-7 my-6 text-[#f5f2ee] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center mb-2">
            <img
              src="/assets/images/fitmeet_logo_master.png"
              alt="FitMeet Patna"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </div>
          <h2 className="font-head text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
            {mode === 'signup'
              ? 'Create Your Account'
              : mode === 'signin'
              ? 'Welcome Back'
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-[#b4b0aa] mt-1 max-w-xs mx-auto">
            {mode === 'signup'
              ? 'Register to join weekly fitness meets, explore partner gyms, and connect with coaches in Patna.'
              : mode === 'signin'
              ? 'Sign in to access your event passes, bookings, and community meets.'
              : 'Enter your email to receive password reset instructions.'}
          </p>

          {/* Real-time Auth Status Indicator */}
          {!isSupabaseConfigured && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171920] border border-[#2b2d35] text-[10px] text-amber-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Authentication Backend: Not Connected</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Informational Message */}
        {infoMessage && (
          <div className="mb-4 p-3.5 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-200 text-xs flex items-start gap-2.5 animate-fade-in">
            <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <p className="leading-relaxed">{infoMessage}</p>
            </div>
          </div>
        )}

        {/* Supabase Configuration Helper Accordion */}
        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-lg bg-[#14161b] border border-[#262830] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="w-full flex items-center justify-between px-3 py-2 text-[11px] text-[#ff7a2e] hover:text-[#fc5300] font-semibold cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                <span>How to configure Supabase Authentication</span>
              </span>
              {showSetupGuide ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
            {showSetupGuide && (
              <div className="px-3.5 py-3 border-t border-[#262830] text-[11px] text-[#b4b0aa] space-y-2 bg-[#0c0d10]">
                <p className="text-white font-medium">To connect live user registration:</p>
                <ol className="list-decimal list-inside space-y-1 text-[10.5px]">
                  <li>
                    Create a free project at{' '}
                    <span className="text-[#ff7a2e] font-mono">supabase.com</span>
                  </li>
                  <li>
                    Navigate to <strong>Project Settings → API</strong>
                  </li>
                  <li>
                    Add these variables to your <strong>.env</strong> file:
                    <div className="mt-1 p-2 bg-black rounded border border-[#222] font-mono text-[10px] text-neutral-300 select-all">
                      VITE_SUPABASE_URL=https://xyzcompany.supabase.co<br />
                      VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
                    </div>
                  </li>
                  <li>
                    For Google sign-in, enable the <strong>Google provider</strong> under{' '}
                    <em>Authentication → Providers</em>.
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        {resetSent ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-xl text-center space-y-3">
            <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
            <p className="text-xs text-neutral-200">
              A password reset link has been dispatched to{' '}
              <strong className="text-white">{email}</strong>.
            </p>
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-xs text-[#FC5300] hover:underline font-bold uppercase cursor-pointer"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Continue with Google button with official Google multicolor G logo */}
            {mode !== 'forgot' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-[#16181d] hover:bg-[#1f2229] disabled:opacity-60 disabled:cursor-not-allowed border border-[#25272c] hover:border-[#383a42] rounded-lg text-sm font-semibold text-white transition-all cursor-pointer shadow-sm relative group"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                  {!isSupabaseConfigured && (
                    <span className="text-[10px] text-neutral-400 font-normal">
                      (OAuth unconfigured)
                    </span>
                  )}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#25272c]" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-[#b4b0aa]">
                    <span className="bg-[#111215] px-3 font-medium">Or continue with email</span>
                  </div>
                </div>
              </>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              {/* 1. Full Name (Signup Mode) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled={loading}
                      placeholder="e.g. Aditya Raj"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) {
                          setFieldErrors((prev) => ({ ...prev, fullName: '' }));
                        }
                      }}
                      className={`w-full pl-9 pr-3 py-2 text-sm bg-[#0a0a0c] border ${
                        fieldErrors.fullName ? 'border-red-500' : 'border-[#25272c]'
                      } focus:border-[#FC5300] rounded-lg text-white placeholder-neutral-600 focus:outline-none transition-colors`}
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                  </div>
                  {fieldErrors.fullName && (
                    <span className="text-[10px] text-red-400 mt-1 block flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {fieldErrors.fullName}
                    </span>
                  )}
                </div>
              )}

              {/* 2. Email Address */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled={loading}
                    placeholder="runner@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }}
                    className={`w-full pl-9 pr-3 py-2 text-sm bg-[#0a0a0c] border ${
                      fieldErrors.email ? 'border-red-500' : 'border-[#25272c]'
                    } focus:border-[#FC5300] rounded-lg text-white placeholder-neutral-600 focus:outline-none transition-colors`}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                </div>
                {fieldErrors.email && (
                  <span className="text-[10px] text-red-400 mt-1 block flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              {/* 3. Mobile Number (Signup Mode) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 text-xs font-semibold text-neutral-400 bg-[#16181d] border border-r-0 border-[#25272c] rounded-l-lg select-none">
                      +91
                    </span>
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        disabled={loading}
                        placeholder="98350 12345"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (fieldErrors.phone) {
                            setFieldErrors((prev) => ({ ...prev, phone: '' }));
                          }
                        }}
                        className={`w-full pl-9 pr-3 py-2 text-sm bg-[#0a0a0c] border ${
                          fieldErrors.phone ? 'border-red-500' : 'border-[#25272c]'
                        } focus:border-[#FC5300] rounded-r-lg text-white placeholder-neutral-600 focus:outline-none transition-colors`}
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                    </div>
                  </div>
                  {fieldErrors.phone && (
                    <span className="text-[10px] text-red-400 mt-1 block flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {fieldErrors.phone}
                    </span>
                  )}
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">
                    Used for WhatsApp event morning broadcast and emergency contact
                  </span>
                </div>
              )}

              {/* 4. Password */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa]">
                      Password *
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-[#ff7a2e] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      disabled={loading}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => ({ ...prev, password: '' }));
                        }
                      }}
                      className={`w-full pl-9 pr-10 py-2 text-sm bg-[#0a0a0c] border ${
                        fieldErrors.password ? 'border-red-500' : 'border-[#25272c]'
                      } focus:border-[#FC5300] rounded-lg text-white placeholder-neutral-600 focus:outline-none transition-colors`}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span className="text-[10px] text-red-400 mt-1 block flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {fieldErrors.password}
                    </span>
                  )}
                </div>
              )}

              {/* 5. Confirm Password (Signup Mode) */}
              {mode === 'signup' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa]">
                      Confirm Password *
                    </label>
                    {passwordsMatch && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Passwords Match
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      disabled={loading}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                        }
                      }}
                      className={`w-full pl-9 pr-10 py-2 text-sm bg-[#0a0a0c] border ${
                        fieldErrors.confirmPassword
                          ? 'border-red-500'
                          : passwordsMatch
                          ? 'border-emerald-600/60'
                          : 'border-[#25272c]'
                      } focus:border-[#FC5300] rounded-lg text-white placeholder-neutral-600 focus:outline-none transition-colors`}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <span className="text-[10px] text-red-400 mt-1 block flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {fieldErrors.confirmPassword}
                    </span>
                  )}
                </div>
              )}

              {/* Terms of Service & Privacy Policy Links */}
              {mode === 'signup' && (
                <div className="flex items-start gap-2 pt-1 text-[11px] text-[#b4b0aa]">
                  <ShieldCheck className="h-4 w-4 text-[#FC5300] shrink-0 mt-0.5" />
                  <span>
                    By creating an account, you agree to FitMeet's{' '}
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenTerms) onOpenTerms();
                      }}
                      className="text-[#ff7a2e] hover:underline font-semibold cursor-pointer"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenPrivacy) onOpenPrivacy();
                      }}
                      className="text-[#ff7a2e] hover:underline font-semibold cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                </div>
              )}

              {/* Submit Button with Loading State */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-sm font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-all active:scale-[0.98] cursor-pointer shadow-[0_0_20px_rgba(252,83,0,0.35)] flex items-center justify-center gap-2 mt-4"
              >
                {loading && (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                )}
                <span>
                  {loading
                    ? 'Processing...'
                    : mode === 'signup'
                    ? 'Create Account'
                    : mode === 'signin'
                    ? 'Sign In'
                    : 'Send Reset Link'}
                </span>
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </>
        )}

        {/* Footer Mode Switcher */}
        <div className="mt-5 pt-3.5 border-t border-[#25272c] text-center text-xs text-[#b4b0aa]">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setInfoMessage(null);
                  setFieldErrors({});
                }}
                disabled={loading}
                className="text-[#ff7a2e] font-bold hover:underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setInfoMessage(null);
                  setFieldErrors({});
                }}
                disabled={loading}
                className="text-[#ff7a2e] font-bold hover:underline cursor-pointer ml-1"
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
