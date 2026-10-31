import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { SiteSettings } from '../../types';

export const INTEREST_OPTIONS = [
  'Join the Challenge: I’m ready to sweat this Sunday',
  '🏋️ Gym Owner: Host the challenge at my gym',
  '🧑🏫 Coach / Trainer: Support and guide the challengers',
  '🥤 Brand: Fuel the challengers',
  '🤝 Volunteer: Be part of the crew behind the challenge',
  '🏙️ New City: Bring FitMeet to my city',
  '💬 Other: Something else',
];

interface ContactSectionProps {
  settings: SiteSettings;
  initialInterest?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings, initialInterest }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState<string>(initialInterest || INTEREST_OPTIONS[0]);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialInterest && INTEREST_OPTIONS.includes(initialInterest)) {
      setInterest(initialInterest);
    }
  }, [initialInterest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Simulate enquiry capture
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
    }, 5000);
  };

  return (
    <section id="contact" className="py-16 sm:py-20 border-b border-slate-200 dark:border-[#16171a] bg-white dark:bg-[#0a0a0c] scroll-mt-20 transition-colors">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left info */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <p className="font-head font-semibold text-xs sm:text-sm uppercase tracking-wider text-[#FC5300]">
                Join The Community
              </p>
              <h2 className="font-head font-bold text-3xl sm:text-4xl uppercase text-slate-900 dark:text-white mt-1">
                Let's make your <span className="text-[#FC5300]">next move.</span>
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-[#b4b0aa] leading-relaxed max-w-sm">
                Join our next Sunday challenge, partner with us as a gym or brand, or support our sessions as a coach. Have a question? Drop us a message and we’ll get back within 24 hours.
              </p>
            </div>

          </div>

          {/* Right form */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-[#111215] border border-slate-200 dark:border-[#25272c] rounded-xl p-6 sm:p-8 shadow-xl transition-colors">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <div className="h-12 w-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="font-head font-bold text-2xl uppercase text-slate-900 dark:text-white">
                  Message Dispatched!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#b4b0aa] max-w-sm mx-auto">
                  Thank you, <strong className="text-slate-900 dark:text-white">{name || 'Athlete'}</strong>. The FitMeet
                  team will follow up via email within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#FC5300] hover:underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-[#b4b0aa] mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Aditya Raj"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0a0a0c] border border-slate-300 dark:border-[#34363c] focus:border-[#FC5300] rounded-md text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-[#b4b0aa] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="aditya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0a0a0c] border border-slate-300 dark:border-[#34363c] focus:border-[#FC5300] rounded-md text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-[#b4b0aa] mb-1">
                    Interest Area *
                  </label>
                  <select
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0a0a0c] border border-slate-300 dark:border-[#34363c] focus:border-[#FC5300] rounded-md text-slate-900 dark:text-white focus:outline-none transition-colors cursor-pointer"
                  >
                    {INTEREST_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-[#b4b0aa] mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your gym, brand, pace, or what you'd like to collaborate on..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-[#0a0a0c] border border-slate-300 dark:border-[#34363c] focus:border-[#FC5300] rounded-md text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-600 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] rounded transition-all transform active:scale-95 cursor-pointer shadow-md"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Community Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
