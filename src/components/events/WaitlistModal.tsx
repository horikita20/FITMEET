import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2, MessageCircle, Sparkles, MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';
import { FitnessEvent } from '../../types';
import { submitWaitlist } from '../../lib/api';

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbE5yl8Likg2G1r0I83R';

interface WaitlistModalProps {
  isOpen: boolean;
  event?: FitnessEvent | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  event,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(event?.city || 'Patna');
  const [paceInterest, setPaceInterest] = useState('All Paces Welcome');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in your name, email, and mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitWaitlist({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        city,
        eventId: event?.id,
        eventTitle: event?.title || 'The Next Run Is Coming Soon',
        paceInterest,
      });

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Could not join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#14151a] border border-slate-200 dark:border-[#242630] rounded-2xl shadow-2xl overflow-hidden my-6 transition-colors">
        {/* Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00A3FF] via-[#FC5300] to-[#25D366]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-500 hover:text-black dark:text-neutral-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#1d1f27] dark:hover:bg-[#282a36] transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {!submitted ? (
          /* STEP 1: WAITLIST SUBMISSION FORM */
          <div className="p-6 sm:p-8 space-y-5">
            {/* Header matching user's reference mockup */}
            <div className="text-center space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#00A3FF] font-bold block">
                UPCOMING EVENT
              </span>
              <h2 className="font-head font-bold text-2xl sm:text-3xl uppercase tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                <span>The Next Run Is Coming Soon</span>
                <span className="text-[#00A3FF]">💙</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#b4b0aa] max-w-sm mx-auto leading-relaxed">
                We just wrapped up an incredible run, and we're already working on the next experience. Event details, date, location, and registrations will be announced soon.
              </p>
            </div>

            {/* Event Micro Card Preview */}
            <div className="bg-slate-50 dark:bg-[#0c0d10] border border-slate-200 dark:border-[#22242c] rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-head font-bold uppercase text-slate-900 dark:text-white">
                  {event?.title || 'Sunday City Run • Next Edition'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-[#00A3FF]/15 text-[#00A3FF]">
                  COMING SOON
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-600 dark:text-[#8d8a85] text-[11px] pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[#FC5300]" />
                  <span>Details dropping soon</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-[#FC5300]" />
                  <span>To be announced</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#FC5300]" />
                  <span>{city}</span>
                </span>
              </div>
            </div>

            {/* Error notice */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Aditya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0c0d10] border border-slate-300 dark:border-[#2a2c36] focus:border-[#00A3FF] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aditya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0c0d10] border border-slate-300 dark:border-[#2a2c36] focus:border-[#00A3FF] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98350 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#0c0d10] border border-slate-300 dark:border-[#2a2c36] focus:border-[#00A3FF] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0c0d10] border border-slate-300 dark:border-[#2a2c36] focus:border-[#00A3FF] rounded-lg text-slate-900 dark:text-white focus:outline-none transition-colors"
                  >
                    <option value="Patna">Patna</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Other">Other City</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1">
                    Your Pace / Interest
                  </label>
                  <select
                    value={paceInterest}
                    onChange={(e) => setPaceInterest(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0c0d10] border border-slate-300 dark:border-[#2a2c36] focus:border-[#00A3FF] rounded-lg text-slate-900 dark:text-white focus:outline-none transition-colors"
                  >
                    <option value="All Paces Welcome">All Paces Welcome</option>
                    <option value="5K Runner (Pace waves)">5K Runner (Pace waves)</option>
                    <option value="10K / Half Marathon Prep">10K / Half Marathon Prep</option>
                    <option value="Beginner / Walker">Beginner / Walker</option>
                    <option value="Gym & HIIT Enthusiast">Gym & HIIT Enthusiast</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-[#00A3FF] hover:bg-[#008fe0] disabled:opacity-50 transition-all transform active:scale-95 cursor-pointer shadow-md"
              >
                {loading ? (
                  <span>Joining Waitlist...</span>
                ) : (
                  <>
                    <span>Join waiting list</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: EXACT MATCH TO USER'S SCREENSHOT (image.png) */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            {/* Header */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#00A3FF] font-bold block">
                UPCOMING EVENT
              </span>
              <h2 className="font-head font-bold text-2xl sm:text-3xl uppercase tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                <span>The Next Run Is Coming Soon</span>
                <span className="text-[#00A3FF]">💙</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#b4b0aa] max-w-sm mx-auto leading-relaxed">
                We just wrapped up an incredible run, and we're already working on the next experience. Event details, date, location, and registrations will be announced soon.
              </p>
            </div>

            {/* Inner Confirmation Card */}
            <div className="bg-slate-50 dark:bg-[#0c0d10] border border-slate-200 dark:border-[#22242c] rounded-2xl p-6 sm:p-8 space-y-5">
              {/* Party icon */}
              <div className="h-16 w-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center text-3xl">
                <span>🎉</span>
              </div>

              <div>
                <h3 className="font-head font-bold text-2xl uppercase tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <span>🎉 You're on the list!</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#b4b0aa] mt-1.5">
                  We'll keep you updated as soon as details are announced.
                </p>
              </div>

              {/* Green WhatsApp Community / Channel Callout (Exact match to user's screenshot & link) */}
              <div className="bg-white dark:bg-[#14151a] border border-slate-200 dark:border-[#2a2c36] rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
                <p className="text-xs text-slate-600 dark:text-neutral-300">
                  Join the FITMEET WhatsApp Community for updates
                </p>

                <a
                  href={WHATSAPP_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#25D366] hover:bg-[#20ba59] transition-all transform active:scale-95 shadow-md cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 fill-white" />
                  <span>Join WhatsApp Community</span>
                </a>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-semibold text-slate-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
