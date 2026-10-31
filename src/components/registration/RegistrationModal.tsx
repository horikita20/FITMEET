import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  QrCode,
  Download,
  Info,
  Check,
  Sparkles,
  Users,
} from 'lucide-react';
import { FitnessEvent, EventRegistration } from '../../types';
import { registerFreeEvent, createRazorpayOrder, verifyRazorpayPayment } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface RegistrationModalProps {
  event: FitnessEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (registration: EventRegistration) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  event,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  // Mode: 'register' (shows event details + form) or 'confirmed' (shows digital pass)
  const [viewState, setViewState] = useState<'register' | 'confirmed'>('register');

  // Participant Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Prefer not to say' | 'Self-describe' | ''>('');
  const [customGender, setCustomGender] = useState('');
  const [instagram, setInstagram] = useState('');
  const [ticketCount, setTicketCount] = useState<number>(1);

  // Status & Error Management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [confirmedPass, setConfirmedPass] = useState<EventRegistration | null>(null);

  // RFC 5322 Email Validation
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Sync authenticated user info when available
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.fullName || `${user.firstName} ${user.lastName}`.trim());
      if (!email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Reset modal state on opening
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFieldErrors({});
      setConfirmedPass(null);
      setLoading(false);
      setViewState('register');

      if (user && user.email) {
        if (!fullName) setFullName(user.fullName || `${user.firstName} ${user.lastName}`.trim());
        if (!email) setEmail(user.email);
      }
    }
  }, [event, isOpen, user]);

  if (!isOpen || !event) return null;

  const unitPriceInPaise = event.priceInPaise;
  const totalAmountInPaise = unitPriceInPaise * ticketCount;
  const isFree = unitPriceInPaise === 0;

  // Validation
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full Name is required (minimum 2 characters).';
    }

    if (!email.trim()) {
      errors.email = 'Email Address is required.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please provide a valid email format (e.g. name@domain.com).';
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (!phone.trim()) {
      errors.phone = 'Phone / WhatsApp Number is required.';
    } else if (cleanPhone.length < 10) {
      errors.phone = 'Please provide a valid mobile number (at least 10 digits).';
    }

    if (!gender) {
      errors.gender = 'Please select a gender option.';
    } else if (gender === 'Self-describe' && !customGender.trim()) {
      errors.customGender = 'Please describe your gender identification.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please fill in all required participant fields.');
      return false;
    }

    setError(null);
    return true;
  };

  // Submit Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    const resolvedGender = gender === 'Self-describe' ? `Self-describe: ${customGender.trim()}` : gender;

    try {
      if (isFree) {
        // Free RSVP flow
        const result = await registerFreeEvent({
          eventId: event.id,
          userId: user?.id,
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          gender: resolvedGender,
          instagram: instagram.trim() || undefined,
          ticketCount,
        });

        if (result && result.id) {
          setConfirmedPass(result);
          setViewState('confirmed');
          onSuccess(result);
        } else {
          throw new Error('Registration failed. Please check slot availability and try again.');
        }
      } else {
        // Paid Event Flow: Request Razorpay Order from server
        const orderData = await createRazorpayOrder({
          eventId: event.id,
          ticketCount,
          userId: user?.id,
          userEmail: email.trim().toLowerCase(),
          userPhone: phone.trim(),
        });

        if (!orderData || !orderData.orderId) {
          throw new Error(
            orderData?.error ||
              'Razorpay payment gateway is not configured yet. Live payments require gateway credentials.'
          );
        }

        // Check if Razorpay script is loaded
        if (!(window as any).Razorpay) {
          throw new Error('Payment gateway SDK failed to load. Please verify your connection.');
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'FITMEET PATNA',
          description: `${event.title} (${ticketCount} ticket${ticketCount > 1 ? 's' : ''})`,
          order_id: orderData.orderId,
          prefill: {
            name: fullName.trim(),
            email: email.trim().toLowerCase(),
            contact: phone.trim(),
          },
          theme: {
            color: '#FC5300',
          },
          handler: async (response: any) => {
            try {
              const verified = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                eventId: event.id,
                userId: user?.id,
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                gender: resolvedGender,
                instagram: instagram.trim() || undefined,
                ticketCount,
              });

              if (verified && verified.id) {
                setConfirmedPass(verified);
                setViewState('confirmed');
                onSuccess(verified);
              } else {
                throw new Error('Payment verification failed on the server.');
              }
            } catch (err: any) {
              setError(err.message || 'Payment verification failed. Your card was not charged.');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.open();
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Registration request could not be processed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calendar (.ics) Generator
  const downloadCalendarInvite = () => {
    if (!event || !confirmedPass) return;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FitMeet//Event Registration//EN',
      'BEGIN:VEVENT',
      `UID:${confirmedPass.referenceId}@fitmeet.in`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${event.title} (FitMeet Pass: ${confirmedPass.referenceId})`,
      `DESCRIPTION:FitMeet Community Challenge. Attendee: ${confirmedPass.fullName}. Reference ID: ${confirmedPass.referenceId}. Venue: ${event.venue}, ${event.city}.`,
      `LOCATION:${event.venue}, ${event.city}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `fitmeet-${confirmedPass.referenceId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#f0f3f8] dark:bg-[#0e0f14] border border-slate-200 dark:border-[#20222a] rounded-2xl shadow-2xl overflow-hidden my-6 transition-colors">
        {/* Top Google Forms-inspired Accent Bar */}
        <div className="h-2 w-full bg-[#FC5300]" />

        {/* Header / Dismiss Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-logo font-black italic text-lg tracking-tight text-slate-900 dark:text-white uppercase">
              FIT<span className="text-[#FC5300]">MEET</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-400 uppercase tracking-widest pl-1">
              PATNA
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:text-black dark:text-neutral-400 dark:hover:text-white bg-slate-200/80 hover:bg-slate-300 dark:bg-[#1b1d24] dark:hover:bg-[#252833] transition-colors cursor-pointer"
            aria-label="Close Registration"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mx-6 mt-3 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Notice:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 ml-auto cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* VIEW 1: EVENT DETAILS + REGISTRATION FORM */}
        {viewState === 'register' && (
          <div className="p-5 sm:p-7 space-y-5 max-h-[85vh] overflow-y-auto">
            {/* 1. Direct Event Details Card (Exact match to user requirement: 'registration pe click krne ke bad sidha aa jayega event ka details aisa') */}
            <div className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-[#22242c] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1e2027] pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FC5300] text-white">
                    {event.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-neutral-400">
                    {event.city}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {event.slotsRemaining} spots left
                  </span>
                  <span className="text-xs font-bold text-[#FC5300] bg-[#FC5300]/10 px-2.5 py-0.5 rounded">
                    {isFree ? '100% Free RSVP' : `₹${(event.priceInPaise / 100).toFixed(0)} Entry`}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="font-head font-bold text-2xl sm:text-3xl uppercase text-slate-900 dark:text-white leading-tight">
                  {event.title}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-[#b4b0aa] leading-relaxed line-clamp-2">
                  {event.description}
                </p>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700 dark:text-[#e4e1dc]">
                <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-[#0c0d11] p-2.5 rounded-lg border border-slate-100 dark:border-[#1a1c22]">
                  <Calendar className="h-4 w-4 text-[#FC5300] shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-[#888] uppercase block font-semibold">Date</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{event.displayDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-[#0c0d11] p-2.5 rounded-lg border border-slate-100 dark:border-[#1a1c22]">
                  <Clock className="h-4 w-4 text-[#FC5300] shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-[#888] uppercase block font-semibold">Time</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{event.startTime} - {event.endTime}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-50 dark:bg-[#0c0d11] p-2.5 rounded-lg border border-slate-100 dark:border-[#1a1c22] sm:col-span-2">
                  <MapPin className="h-4 w-4 text-[#FC5300] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-[#888] uppercase block font-semibold">Venue</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{event.venue}, {event.city}</span>
                    {event.locationDetails && (
                      <span className="text-[11px] text-slate-500 dark:text-[#888] block">({event.locationDetails})</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Direct Participant RSVP Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-[#22242c] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-[#1e2027] pb-3">
                <h3 className="font-head font-bold text-lg uppercase text-slate-900 dark:text-white">
                  Participant Registration
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#b4b0aa] mt-0.5">
                  Enter attendee details to generate your digital entry pass.
                </p>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1">
                    Full Name <span className="text-[#FC5300]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Aditya Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0c0d10] border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none transition-colors ${
                      fieldErrors.fullName
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-300 dark:border-[#2a2c36] focus:border-[#FC5300]'
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <span className="text-[11px] text-red-500 mt-1 block">{fieldErrors.fullName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1">
                    Email Address <span className="text-[#FC5300]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aditya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0c0d10] border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none transition-colors ${
                      fieldErrors.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-300 dark:border-[#2a2c36] focus:border-[#FC5300]'
                    }`}
                  />
                  {fieldErrors.email && (
                    <span className="text-[11px] text-red-500 mt-1 block">{fieldErrors.email}</span>
                  )}
                </div>
              </div>

              {/* Phone & Instagram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1">
                    Phone / WhatsApp Number <span className="text-[#FC5300]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98350 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0c0d10] border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none transition-colors ${
                      fieldErrors.phone
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-300 dark:border-[#2a2c36] focus:border-[#FC5300]'
                    }`}
                  />
                  {fieldErrors.phone && (
                    <span className="text-[11px] text-red-500 mt-1 block">{fieldErrors.phone}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1">
                    Instagram Handle <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="@aditya_runs"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0c0d10] border border-slate-300 dark:border-[#2a2c36] focus:border-[#FC5300] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1.5">
                  Gender <span className="text-[#FC5300]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Female', 'Male', 'Prefer not to say', 'Self-describe'] as const).map((g) => (
                    <label
                      key={g}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        gender === g
                          ? 'border-[#FC5300] bg-[#FC5300]/10 text-slate-900 dark:text-white font-semibold'
                          : 'border-slate-200 dark:border-[#2a2c36] bg-slate-50 dark:bg-[#0c0d10] text-slate-600 dark:text-[#b4b0aa] hover:border-slate-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        className="text-[#FC5300] focus:ring-[#FC5300]"
                      />
                      <span className="truncate">{g}</span>
                    </label>
                  ))}
                </div>
                {gender === 'Self-describe' && (
                  <input
                    type="text"
                    placeholder="Please specify..."
                    value={customGender}
                    onChange={(e) => setCustomGender(e.target.value)}
                    className="mt-2 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#0c0d10] border border-[#FC5300] rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                )}
                {fieldErrors.gender && (
                  <span className="text-[11px] text-red-500 mt-1 block">{fieldErrors.gender}</span>
                )}
              </div>

              {/* Summary & Submit Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#1e2027] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-[#b4b0aa]">Registration Pass Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {isFree ? (
                      <span className="text-[#FC5300] font-mono text-sm">₹0 (100% Free RSVP)</span>
                    ) : (
                      <span className="font-mono text-sm">₹{(totalAmountInPaise / 100).toFixed(2)}</span>
                    )}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || event.slotsRemaining <= 0}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg text-sm font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(252,83,0,0.35)]"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Pass...</span>
                    </span>
                  ) : (
                    <>
                      <span>{isFree ? 'Join the Meet — Get Pass' : 'Proceed to Payment'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-neutral-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Instant digital ticket • QR code generated on confirmation • Free cancellation</span>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 2: CONFIRMED DIGITAL PASS */}
        {viewState === 'confirmed' && confirmedPass && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="font-head font-bold text-3xl uppercase text-slate-900 dark:text-white tracking-tight">
                You're In! See You This Sunday!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#b4b0aa] max-w-md mx-auto">
                Your entry pass has been generated. Show your QR token or Reference ID at the check-in point.
              </p>
            </div>

            {/* Digital Pass Ticket Card */}
            <div className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-[#22242c] rounded-2xl p-6 shadow-md space-y-5 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FC5300] to-emerald-500" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1e2027] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-neutral-400 block font-bold">
                    Official FitMeet Entry Pass
                  </span>
                  <span className="font-mono text-base font-bold text-[#FC5300]">
                    {confirmedPass.referenceId}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                    STATUS: CONFIRMED
                  </span>
                </div>
              </div>

              {/* Event Micro Details */}
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-[#e4e1dc]">
                <h3 className="font-head font-bold text-xl uppercase text-slate-900 dark:text-white">
                  {confirmedPass.eventTitle}
                </h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#FC5300] shrink-0" />
                  <span>{confirmedPass.eventDate} • {confirmedPass.eventTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#FC5300] shrink-0" />
                  <span>{confirmedPass.eventVenue}, {confirmedPass.eventCity}</span>
                </div>
              </div>

              {/* Attendee Details */}
              <div className="p-3.5 bg-slate-50 dark:bg-[#0c0d10] rounded-xl border border-slate-100 dark:border-[#1b1c21] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-neutral-400 block">
                    Attendee Name
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {confirmedPass.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-neutral-400 block">
                    Phone / WhatsApp
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {confirmedPass.phone}
                  </span>
                </div>
              </div>

              {/* QR Token Mockup */}
              <div className="pt-2 text-center space-y-2">
                <div className="h-20 w-20 mx-auto bg-slate-900 text-white rounded-xl p-2 flex items-center justify-center shadow-inner">
                  <QrCode className="h-16 w-16 text-white" />
                </div>
                <span className="font-mono text-[10px] text-slate-500 dark:text-neutral-400 block">
                  Token: {confirmedPass.qrToken}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={downloadCalendarInvite}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-neutral-200 bg-slate-100 hover:bg-slate-200 dark:bg-[#1b1d24] dark:hover:bg-[#252833] border border-slate-200 dark:border-[#2a2c36] transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4 text-[#FC5300]" />
                <span>Add to Calendar (.ics)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] transition-colors cursor-pointer"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
