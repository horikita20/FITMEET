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
  const [gender, setGender] = useState<
    'Female' | 'Male' | 'Prefer not to say' | 'Self-describe' | ''
  >('');
  const [customGender, setCustomGender] = useState('');
  const [instagram, setInstagram] = useState('');
  const [age, setAge] = useState('');
  const [area, setArea] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | ''>(
    ''
  );
  const [consent, setConsent] = useState(false);
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

    if (!age.trim()) {
      errors.age = 'Age is required.';
    } else if (Number(age) < 10 || Number(age) > 100) {
      errors.age = 'Please enter a valid age.';
    }

    if (!area.trim()) {
      errors.area = 'Area in Patna is required.';
    }

    if (!fitnessLevel) {
      errors.fitnessLevel = 'Please select your fitness level.';
    }

    if (!consent) {
      errors.consent = 'Please confirm you are in Patna and can attend in person.';
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

    const resolvedGender =
      gender === 'Self-describe' ? `Self-describe: ${customGender.trim()}` : gender;

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
          userName: fullName.trim(),
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

        {/* VIEW 1: FORM MATCHING THE SECOND REGISTRATION SCREEN */}
        {viewState === 'register' && (
          <div className="p-5 sm:p-7 max-h-[85vh] overflow-y-auto bg-[#0d1014] text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="font-black italic uppercase text-[#FC5300] text-xl sm:text-2xl tracking-[-0.04em]">
                FITMEET {event.title.match(/#\d+/)?.[0] ?? '#01'}
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-500/60 bg-[#1d2128] text-slate-200 transition hover:bg-[#2a2d35]"
                aria-label="Close Registration"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2 className="mb-6 text-3xl font-black uppercase tracking-[-0.06em] text-white sm:text-5xl">
              Register Now
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-white">
                  Full Name <span className="text-[#FC5300]">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className={`w-full rounded-xl border bg-[#0d1014] px-4 py-3 text-lg text-white placeholder:text-slate-400 focus:outline-none ${
                    fieldErrors.fullName
                      ? 'border-red-500'
                      : 'border-slate-600 focus:border-[#FC5300]'
                  }`}
                />
                {fieldErrors.fullName && (
                  <span className="mt-1 block text-xs text-red-400">{fieldErrors.fullName}</span>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-white">
                  WhatsApp Number <span className="text-[#FC5300]">*</span>
                </label>
                <div
                  className={`flex items-center overflow-hidden rounded-xl border bg-[#0d1014] ${fieldErrors.phone ? 'border-red-500' : 'border-slate-600 focus-within:border-[#FC5300]'}`}
                >
                  <span className="flex h-full items-center border-r border-slate-600 px-4 text-lg text-slate-300">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full bg-transparent px-4 py-3 text-lg text-white placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                {fieldErrors.phone && (
                  <span className="mt-1 block text-xs text-red-400">{fieldErrors.phone}</span>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-white">
                  Email ID <span className="text-[#FC5300]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border bg-[#0d1014] px-4 py-3 text-lg text-white placeholder:text-slate-400 focus:outline-none ${
                    fieldErrors.email ? 'border-red-500' : 'border-slate-600 focus:border-[#FC5300]'
                  }`}
                />
                {fieldErrors.email && (
                  <span className="mt-1 block text-xs text-red-400">{fieldErrors.email}</span>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-white">
                    Age <span className="text-[#FC5300]">*</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 24"
                    className={`w-full rounded-xl border bg-[#0d1014] px-4 py-3 text-lg text-white placeholder:text-slate-400 focus:outline-none ${
                      fieldErrors.age ? 'border-red-500' : 'border-slate-600 focus:border-[#FC5300]'
                    }`}
                  />
                  {fieldErrors.age && (
                    <span className="mt-1 block text-xs text-red-400">{fieldErrors.age}</span>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-white">
                    Gender <span className="text-[#FC5300]">*</span>
                  </label>
                  <select
                    value={gender || ''}
                    onChange={(e) =>
                      setGender(
                        e.target.value as
                          | 'Female'
                          | 'Male'
                          | 'Prefer not to say'
                          | 'Self-describe'
                          | ''
                      )
                    }
                    className={`w-full appearance-none rounded-xl border bg-[#0d1014] px-4 py-3 text-lg text-white focus:outline-none ${
                      fieldErrors.gender
                        ? 'border-red-500'
                        : 'border-slate-600 focus:border-[#FC5300]'
                    }`}
                  >
                    <option value="" className="bg-[#0d1014] text-slate-300">
                      Select
                    </option>
                    <option value="Female" className="bg-[#0d1014] text-white">
                      Female
                    </option>
                    <option value="Male" className="bg-[#0d1014] text-white">
                      Male
                    </option>
                    <option value="Prefer not to say" className="bg-[#0d1014] text-white">
                      Prefer not to say
                    </option>
                    <option value="Self-describe" className="bg-[#0d1014] text-white">
                      Self-describe
                    </option>
                  </select>
                  {gender === 'Self-describe' && (
                    <input
                      type="text"
                      value={customGender}
                      onChange={(e) => setCustomGender(e.target.value)}
                      placeholder="Tell us how you identify"
                      className="mt-2 w-full rounded-xl border border-[#FC5300] bg-[#0d1014] px-4 py-3 text-lg text-white placeholder:text-slate-400 focus:outline-none"
                    />
                  )}
                  {fieldErrors.gender && (
                    <span className="mt-1 block text-xs text-red-400">{fieldErrors.gender}</span>
                  )}
                  {fieldErrors.customGender && (
                    <span className="mt-1 block text-xs text-red-400">
                      {fieldErrors.customGender}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-white">
                  Area in Patna <span className="text-[#FC5300]">*</span>
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Boring Road, Kankarbagh"
                  className={`w-full rounded-xl border bg-[#0d1014] px-4 py-3 text-lg text-white placeholder:text-slate-400 focus:outline-none ${
                    fieldErrors.area ? 'border-red-500' : 'border-slate-600 focus:border-[#FC5300]'
                  }`}
                />
                {fieldErrors.area && (
                  <span className="mt-1 block text-xs text-red-400">{fieldErrors.area}</span>
                )}
              </div>

              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-[0.12em] text-white">
                  Fitness Level <span className="text-[#FC5300]">*</span>
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFitnessLevel(level)}
                      className={`rounded-xl border px-3 py-3 text-base font-bold uppercase tracking-[0.08em] transition ${
                        fitnessLevel === level
                          ? 'border-[#FC5300] bg-[#FC5300]/10 text-white'
                          : 'border-slate-600 bg-transparent text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                {fieldErrors.fitnessLevel && (
                  <span className="mt-1 block text-xs text-red-400">
                    {fieldErrors.fitnessLevel}
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-[#5d3b2f] bg-[#201914] p-3">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#FC5300]"
                  />
                  <span className="leading-relaxed">
                    I&apos;m in Patna and can attend in person. I understand the fee won&apos;t be
                    refunded if I can&apos;t attend.
                  </span>
                </label>
                {fieldErrors.consent && (
                  <span className="mt-2 block text-xs text-red-400">{fieldErrors.consent}</span>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || event.slotsRemaining <= 0}
                  className="w-full rounded-xl bg-[#FC5300] px-5 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#ff6d1b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Generating Pass...' : isFree ? 'Get Pass' : 'Proceed to Payment'}
                </button>
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
                Your entry pass has been generated. Show your QR token or Reference ID at the
                check-in point.
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
                  <span>
                    {confirmedPass.eventDate} • {confirmedPass.eventTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#FC5300] shrink-0" />
                  <span>
                    {confirmedPass.eventVenue}, {confirmedPass.eventCity}
                  </span>
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
