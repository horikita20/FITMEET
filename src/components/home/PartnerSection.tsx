import React, { useState } from 'react';
import { Plus, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { FitMeetEmblem } from '../common/FitMeetEmblem';
import { submitCollaborationEnquiry } from '../../lib/api';

const WA_NUMBER = '919835012345'; // Official FitMeet WhatsApp line

const COLLABORATOR_PERKS = [
  'Your name and logo on every meet poster and post',
  'A shout-out to the crew at every meet you support',
  'First access to Patna’s most active fitness community',
  'Real photos and videos from your session to share',
];

const SUPPORT_OPTIONS = [
  'Provide space for a meet',
  'Support sessions as a coach',
  'Sponsor water, snacks or drinks',
  'Give prizes, vouchers or merch',
  'Host the post-workout hangout',
  'Offer physio or first-aid support',
  'Cover the meet with photos and videos',
  'Promote FitMeet to my members',
];

interface PartnerSectionProps {
  onPartnerClick?: (interestCategory?: string) => void;
}

export const PartnerSection: React.FC<PartnerSectionProps> = ({ onPartnerClick }) => {
  const [showFullForm, setShowFullForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Patna');
  const [support, setSupport] = useState<string[]>([]);
  const [more, setMore] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleSupport = (val: string) => {
    setSupport((prev) => (prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]));
  };

  const handleOpenForm = () => {
    setShowFullForm(true);
    setTimeout(() => {
      const el = document.getElementById('collaborate-form');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (submitting) return;

    if (!name.trim()) {
      setError('Please add your gym, brand or coach name.');
      return;
    }
    if (!type) {
      setError('Please choose what you are.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please add a valid contact phone number.');
      return;
    }
    if (!city.trim()) {
      setError('Please add your city.');
      return;
    }

    const text =
      `Hi FitMeet! 👋\n` +
      `I'd like to collaborate as a founding partner.\n\n` +
      `• Name: ${name.trim()}\n` +
      `• Type: ${type}\n` +
      `• Phone: ${phone.trim()}\n` +
      `• City: ${city.trim()}\n` +
      (support.length > 0 ? `• Ways to support: ${support.join(', ')}\n` : '') +
      (more.trim() ? `• Note: ${more.trim()}\n` : '') +
      `\nLooking forward to hearing from the FitMeet crew!`;

    window.open(
      'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text),
      '_blank',
      'noopener'
    );
    setSubmitting(true);
    try {
      await submitCollaborationEnquiry({
        name: name.trim(),
        organizationType: type,
        phone: phone.trim(),
        city: city.trim(),
        supportOptions: support,
        message: more.trim(),
      });
      setSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to save collaboration enquiry.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="collaborate"
      className="bg-[#0b0b0d] text-[#b8b9c0] py-20 sm:py-28 transition-colors border-b border-[#16171a]"
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8 space-y-16">
        {/* ================= RECREATED PARTNERS SHOWCASE (Matches Image 4) ================= */}
        <div className="flex flex-col items-center text-center">
          {/* Top Master FitMeet Emblem with Glow */}
          <div className="mb-4">
            <FitMeetEmblem size="lg" withOrbit={false} withGlow={true} />
          </div>

          {/* Heading: OUR PARTNERS */}
          <h2 className="font-logo font-black italic text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight flex items-baseline justify-center gap-2.5">
            <span className="text-white">OUR</span>
            <span className="text-[#ff5a1f]">PARTNERS</span>
          </h2>

          {/* Subtitle */}
          <p className="mt-3 text-sm sm:text-base lg:text-lg text-[#9a9aa3] max-w-xl leading-relaxed">
            FitMeet is just getting started. Our first brand partners will appear here.
          </p>

          {/* 4 Partner Cards Grid: Matches Image 4 */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {/* Card 1: Your Brand Here (Glowing Active Card) */}
            <div
              onClick={handleOpenForm}
              className="bg-[#141519] border border-[#ff5a1f]/70 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[175px] sm:min-h-[190px] relative overflow-hidden shadow-[0_0_35px_rgba(255,90,31,0.28)] hover:shadow-[0_0_45px_rgba(255,90,31,0.45)] hover:border-[#ff7a2e] transition-all cursor-pointer group"
            >
              {/* Center orange plus button */}
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-[#ff5a1f] group-hover:bg-[#ff7a2e] flex items-center justify-center text-white transition-transform group-hover:scale-110 shadow-md">
                <Plus className="h-5 w-5 stroke-[2.8]" />
              </div>

              {/* Text: Your brand here */}
              <span className="text-[#ff8a50] group-hover:text-white font-bold text-sm sm:text-base mt-4 tracking-wide transition-colors">
                Your brand here
              </span>

              {/* Bottom glowing gold/orange highlight line */}
              <div className="absolute bottom-0 inset-x-6 h-[2px] bg-gradient-to-r from-transparent via-[#ff8a50] to-transparent opacity-90" />
            </div>

            {/* Card 2: Coming soon... */}
            <div className="bg-[#101114] border border-dashed border-white/20 rounded-2xl p-6 sm:p-8 flex items-center justify-center min-h-[175px] sm:min-h-[190px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
              <span className="text-[#6e707a] font-medium text-sm sm:text-base tracking-wider select-none">
                Coming soon • • •
              </span>
            </div>

            {/* Card 3: Coming soon... */}
            <div className="bg-[#101114] border border-dashed border-white/20 rounded-2xl p-6 sm:p-8 flex items-center justify-center min-h-[175px] sm:min-h-[190px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
              <span className="text-[#6e707a] font-medium text-sm sm:text-base tracking-wider select-none">
                Coming soon • • •
              </span>
            </div>

            {/* Card 4: Coming soon... */}
            <div className="bg-[#101114] border border-dashed border-white/20 rounded-2xl p-6 sm:p-8 flex items-center justify-center min-h-[175px] sm:min-h-[190px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
              <span className="text-[#6e707a] font-medium text-sm sm:text-base tracking-wider select-none">
                Coming soon • • •
              </span>
            </div>
          </div>

          {/* Bottom Action Button: Become a founding partner (Slanted Parallelogram) */}
          <div className="mt-9 flex flex-col items-center">
            <button
              onClick={handleOpenForm}
              className="transform -skew-x-12 inline-flex items-center justify-center px-8 sm:px-11 py-3.5 sm:py-4 bg-[#ff5a1f] hover:bg-[#ff7a2e] text-black font-black uppercase text-sm sm:text-base tracking-wider rounded-md transition-all shadow-[0_0_28px_rgba(255,90,31,0.45)] hover:shadow-[0_0_40px_rgba(255,90,31,0.7)] active:scale-95 cursor-pointer"
            >
              <span className="transform skew-x-12">Become a founding partner</span>
            </button>
            <p className="text-xs sm:text-sm text-[#8a8b93] mt-3.5">
              All of Patna’s fitness crowd, in one place, at every meet.
            </p>
          </div>
        </div>

        {/* ================= DETAILED COLLABORATION FORM (Preserved & Enhanced) ================= */}
        {showFullForm && (
          <div
            id="collaborate-form"
            className="pt-12 border-t border-[#24252b] scroll-mt-24 space-y-10 animate-[rotIn_0.4s_ease]"
          >
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="font-head font-black text-2xl sm:text-4xl uppercase text-white">
                Collaborate with FitMeet
              </h3>
              <p className="mt-2 text-sm text-[#9a9aa3]">
                FitMeet hosts and runs every meet. You help power it with your space, your expertise
                or your brand.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Perks */}
              <div className="lg:col-span-5 bg-[#121317] border border-[#24252b] rounded-2xl p-6 sm:p-8 space-y-6">
                <span className="text-[#ff5a1f] font-mono text-xs uppercase font-extrabold tracking-widest block">
                  Founding collaborator perks
                </span>
                <ul className="space-y-4 text-sm text-[#e6e7ea]">
                  {COLLABORATOR_PERKS.map((perk) => (
                    <li key={perk} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-[#ff5a1f] shrink-0 mt-0.5 stroke-[3]" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: Form */}
              <div className="lg:col-span-7 bg-[#121317] border border-[#24252b] rounded-2xl p-6 sm:p-8">
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#d7d8dd] mb-1.5">
                        Gym / brand / coach name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. IronCore Fitness Arena"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-3 rounded-lg border border-[#2c2d34] bg-[#0b0b0d] text-white text-sm focus:border-[#ff5a1f] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#d7d8dd] mb-1.5">
                        I am a *
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full appearance-none px-3.5 py-3 rounded-lg border border-[#2c2d34] bg-[#0b0b0d] text-white text-sm focus:border-[#ff5a1f] focus:outline-none transition-colors cursor-pointer pr-10"
                        >
                          <option value="">Choose one</option>
                          <option>Gym / studio</option>
                          <option>Yoga, dance or Zumba studio</option>
                          <option>Coach / trainer</option>
                          <option>Fitness or nutrition brand</option>
                          <option>Sportswear or sports store</option>
                          <option>Café / juice bar</option>
                          <option>Physio / sports clinic</option>
                          <option>Photographer / videographer</option>
                          <option>Creator / influencer</option>
                          <option>College, school or society</option>
                          <option>Company</option>
                          <option>Something else</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#d7d8dd] mb-1.5">
                        Contact phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 XXXXX XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-3 rounded-lg border border-[#2c2d34] bg-[#0b0b0d] text-white text-sm focus:border-[#ff5a1f] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#d7d8dd] mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-3 rounded-lg border border-[#2c2d34] bg-[#0b0b0d] text-white text-sm focus:border-[#ff5a1f] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#d7d8dd] mb-2">
                      How would you like to support? *
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SUPPORT_OPTIONS.map((opt) => {
                        const isChecked = support.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleSupport(opt)}
                            className={`flex items-center gap-2.5 p-3 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                              isChecked
                                ? 'bg-[#ff5a1f]/15 border-[#ff5a1f] text-white font-semibold'
                                : 'bg-[#0b0b0d] border-[#2c2d34] text-[#e6e7ea] hover:border-[#ff5a1f]/50'
                            }`}
                          >
                            <div
                              className={`h-4 w-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                                isChecked
                                  ? 'bg-[#ff5a1f] border-[#ff5a1f] text-white'
                                  : 'border-[#4a4b52]'
                              }`}
                            >
                              {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#d7d8dd] mb-1.5">
                      Anything else to share? (optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about your space, capacity, classes, or ideas..."
                      value={more}
                      onChange={(e) => setMore(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-lg border border-[#2c2d34] bg-[#0b0b0d] text-white text-sm focus:border-[#ff5a1f] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-red-200 text-xs">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs">
                      Redirecting you to WhatsApp to connect directly with the FitMeet team!
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold uppercase tracking-wider text-sm text-white bg-[#ff5a1f] hover:bg-[#ff7a2e] transition-all transform active:scale-98 shadow-lg shadow-[#ff5a1f]/25 cursor-pointer mt-2"
                  >
                    <span>Send on WhatsApp</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
