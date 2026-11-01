import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { submitCollaborationEnquiry } from '../../lib/api';

const WA_NUMBER = '919835012345'; // Official FitMeet line

const PARTNER_CATEGORIES = [
  { title: 'Gyms & studios', desc: 'Host a meet in your space' },
  { title: 'Yoga, dance & Zumba', desc: 'Bring a session format to the crew' },
  { title: 'Coaches & trainers', desc: 'Support sessions with form tips' },
  { title: 'Fitness & nutrition brands', desc: 'Fuel the crew' },
  { title: 'Sportswear & sports stores', desc: 'Gear up the community' },
  { title: 'Supplement stores & cafe', desc: 'Host the post-workout hangout' },
  { title: 'Physio & sports clinics', desc: 'Keep everyone safe' },
  { title: 'Photographers & videographers', desc: 'Capture every meet' },
  { title: 'Creators & influencers', desc: 'Spread the word across Patna' },
  { title: 'Colleges, schools & societies', desc: 'Open your grounds to us' },
  { title: 'Companies', desc: 'Bring your team to a meet' },
  { title: 'Something else', desc: 'Tell us your idea' },
];

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

export const CollaboratePage: React.FC = () => {
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
    setSupport((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (submitting) return;

    if (!name.trim()) {
      setError('Please add your gym, brand or coach name.');
      return;
    }
    if (!type) {
      setError('Please choose what you are.');
      return;
    }
    if (!phone.trim() || !/^[+\d][\d\s-]{8,}$/.test(phone.trim())) {
      setError('Please add a valid contact phone number.');
      return;
    }
    if (!city.trim()) {
      setError('Please add your city.');
      return;
    }
    if (support.length === 0) {
      setError('Please pick at least one way you’d like to support.');
      return;
    }

    const text = [
      'Hi FitMeet! New collaboration request:',
      '• Name: ' + name.trim(),
      '• I am a: ' + type,
      '• Phone: ' + phone.trim(),
      '• City: ' + city.trim(),
      '• Support: ' + support.join(', '),
      more.trim() ? '• Note: ' + more.trim() : '',
    ]
      .filter(Boolean)
      .join('\n');

    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
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
      setError(submitError instanceof Error ? submitError.message : 'Unable to save collaboration enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0b0b0d] text-[#b8b9c0] min-h-screen">
      {/* ================= HERO ================= */}
      <section className="py-20 lg:py-24 border-b border-[#1c1d22]">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
          <div className="text-[#ff5a00] font-head font-bold text-xs sm:text-sm tracking-[2px] uppercase">
            Now onboarding founding collaborators
          </div>
          <h1 className="font-head font-extrabold text-5xl sm:text-7xl lg:text-8xl text-white uppercase leading-[0.92] my-5 sm:my-7">
            Collaborate <span className="block text-[#ff5a00]">with us</span>
          </h1>
          <p className="max-w-[560px] text-base sm:text-lg text-[#d0d1d6] leading-relaxed mb-8">
            FitMeet hosts and runs every meet. You help power it with your space, your expertise or your brand, and reach Patna’s fitness community from day one.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <button
              onClick={() => scrollToSection('apply')}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md font-head font-bold text-sm sm:text-base uppercase tracking-wider text-white bg-[#ff5a00] hover:bg-[#e24f00] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#ff5a00]/25 cursor-pointer"
            >
              <span>Send collaboration request</span>
            </button>
            <button
              onClick={() => scrollToSection('partners')}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md font-head font-bold text-sm sm:text-base uppercase tracking-wider text-white bg-transparent border border-[#3a3b42] hover:border-[#ff5a00] hover:text-[#ff5a00] transition-colors cursor-pointer"
            >
              <span>Who we’re looking for</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= WAYS TO HELP ================= */}
      <section className="bg-[#0f1013] py-16 border-b border-[#1c1d22]" aria-label="Ways to collaborate">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="border-t-2 border-[#ff5a00] pt-4.5">
            <div className="text-[#ff5a00] font-head font-bold text-sm">01</div>
            <h3 className="font-head font-bold text-2xl text-white my-2.5">Give space</h3>
            <p className="text-sm text-[#b8b9c0] leading-relaxed">
              Your gym, studio, ground or café becomes the venue for a FitMeet session.
            </p>
          </div>
          <div className="border-t-2 border-[#ff5a00] pt-4.5">
            <div className="text-[#ff5a00] font-head font-bold text-sm">02</div>
            <h3 className="font-head font-bold text-2xl text-white my-2.5">Support sessions</h3>
            <p className="text-sm text-[#b8b9c0] leading-relaxed">
              Coaches help with warm-ups, form tips and guidance while FitMeet runs the meet.
            </p>
          </div>
          <div className="border-t-2 border-[#ff5a00] pt-4.5">
            <div className="text-[#ff5a00] font-head font-bold text-sm">03</div>
            <h3 className="font-head font-bold text-2xl text-white my-2.5">Sponsor</h3>
            <p className="text-sm text-[#b8b9c0] leading-relaxed">
              Water, snacks, energy drinks, prizes, vouchers or merchandise for the crew.
            </p>
          </div>
          <div className="border-t-2 border-[#ff5a00] pt-4.5">
            <div className="text-[#ff5a00] font-head font-bold text-sm">04</div>
            <h3 className="font-head font-bold text-2xl text-white my-2.5">Cover &amp; promote</h3>
            <p className="text-sm text-[#b8b9c0] leading-relaxed">
              Photos, videos and posts that bring more of Patna to the next meet.
            </p>
          </div>
        </div>
      </section>

      {/* ================= PARTNERS ================= */}
      <section id="partners" className="py-20 lg:py-24 border-b border-[#1c1d22]">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
          <div className="text-[#ff5a00] font-head font-bold text-xs sm:text-sm tracking-[2px] uppercase">
            We’re looking for
          </div>
          <h2 className="font-head font-extrabold text-3xl sm:text-5xl text-white uppercase my-3 mb-7">
            Collaborators across Patna
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {PARTNER_CATEGORIES.map((p) => (
              <div
                key={p.title}
                className="bg-[#121317] border border-[#24252b] rounded-lg p-5 hover:border-[#ff5a00]/50 hover:-translate-y-1 transition-all group"
              >
                <div className="w-7 h-[3px] rounded bg-[#ff5a00] mb-4" />
                <h3 className="font-head font-bold text-xl text-white mb-2 leading-tight">
                  {p.title}
                </h3>
                <p className="text-xs text-[#8a8b93]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PERKS ================= */}
      <section className="py-16 border-b border-[#1c1d22]">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#ff5a00] rounded-2xl p-8 sm:p-12">
            <div className="lg:col-span-5">
              <div className="text-[#2a1200] font-head font-bold text-xs uppercase tracking-widest">
                Founding collaborator perks
              </div>
              <h2 className="font-head font-black text-3xl sm:text-5xl text-white uppercase leading-none mt-3">
                Join early.<br />Grow with the crew.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <ul className="bg-[#0b0b0d] rounded-xl p-6 sm:p-7 space-y-4">
                {COLLABORATOR_PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-sm sm:text-base text-[#e6e7ea]">
                    <Check className="h-4 w-4 text-[#ff5a00] stroke-[3] shrink-0 mt-1" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FORM ================= */}
      <section id="apply" className="bg-[#0f1013] py-20 lg:py-24">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <div className="text-[#ff5a00] font-head font-bold text-xs uppercase tracking-[2px]">
                Collaborate with FitMeet
              </div>
              <h2 className="font-head font-extrabold text-3xl sm:text-5xl text-white uppercase leading-tight my-3">
                Let’s power the <span className="text-[#ff5a00] block">next meet.</span>
              </h2>
              <p className="text-sm sm:text-base text-[#d0d1d6] leading-relaxed mb-4">
                Tell us who you are and how you’d like to help. Our team reviews every request and gets back to you within 48 hours.
              </p>
              <p className="text-sm text-[#8a8b93]">
                Prefer to talk?{' '}
                <a href="mailto:contact@fitmeet.in" className="text-[#ff5a00] hover:underline">
                  contact@fitmeet.in
                </a>
              </p>
            </div>

            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="bg-[#121317] border border-[#24252b] rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-head font-bold text-xs uppercase tracking-wider text-[#d7d8dd] mb-2">
                      Gym / brand / coach name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. IronCore Fitness Arena"
                      className="w-full px-3.5 py-3 rounded-md bg-[#0b0b0d] border border-[#2c2d34] text-white text-sm focus:border-[#ff5a00] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-head font-bold text-xs uppercase tracking-wider text-[#d7d8dd] mb-2">
                      I am a *
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-md bg-[#0b0b0d] border border-[#2c2d34] text-white text-sm focus:border-[#ff5a00] outline-none"
                      required
                    >
                      <option value="">Choose one</option>
                      <option value="Gym / studio">Gym / studio</option>
                      <option value="Yoga, dance or Zumba studio">Yoga, dance or Zumba studio</option>
                      <option value="Coach / trainer">Coach / trainer</option>
                      <option value="Fitness or nutrition brand">Fitness or nutrition brand</option>
                      <option value="Sportswear or sports store">Sportswear or sports store</option>
                      <option value="Café / juice bar">Café / juice bar</option>
                      <option value="Physio / sports clinic">Physio / sports clinic</option>
                      <option value="Photographer / videographer">Photographer / videographer</option>
                      <option value="Creator / influencer">Creator / influencer</option>
                      <option value="College, school or society">College, school or society</option>
                      <option value="Company">Company</option>
                      <option value="Something else">Something else</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-head font-bold text-xs uppercase tracking-wider text-[#d7d8dd] mb-2">
                      Contact phone *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-3.5 py-3 rounded-md bg-[#0b0b0d] border border-[#2c2d34] text-white text-sm focus:border-[#ff5a00] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-head font-bold text-xs uppercase tracking-wider text-[#d7d8dd] mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-md bg-[#0b0b0d] border border-[#2c2d34] text-white text-sm focus:border-[#ff5a00] outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <span className="block font-head font-bold text-xs uppercase tracking-wider text-[#d7d8dd] mb-2">
                    How would you like to support? *
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUPPORT_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-md border text-xs sm:text-sm cursor-pointer transition-colors ${
                          support.includes(opt)
                            ? 'bg-[#0b0b0d] border-[#ff5a00] text-white'
                            : 'bg-[#0b0b0d] border-[#2c2d34] text-[#e6e7ea] hover:border-[#ff5a00]/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={support.includes(opt)}
                          onChange={() => toggleSupport(opt)}
                          className="accent-[#ff5a00] h-4 w-4 rounded"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-head font-bold text-xs uppercase tracking-wider text-[#d7d8dd] mb-2">
                    Tell us more
                  </label>
                  <textarea
                    value={more}
                    onChange={(e) => setMore(e.target.value)}
                    placeholder="Gym size and facilities, coaching experience, or what your brand would like to offer…"
                    rows={3}
                    className="w-full px-3.5 py-3 rounded-md bg-[#0b0b0d] border border-[#2c2d34] text-white text-sm focus:border-[#ff5a00] outline-none resize-vertical"
                  />
                </div>

                {error && (
                  <p className="text-xs text-[#ff8a5c] font-medium">{error}</p>
                )}

                <button
                  disabled={submitting}
                  type="submit"
                  className="w-full py-4 rounded-md font-head font-bold text-sm uppercase tracking-wider text-white bg-[#ff5a00] hover:bg-[#e24f00] transition-colors shadow-lg shadow-[#ff5a00]/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Send collaboration request</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="text-center text-xs text-[#8a8b93]">
                  FitMeet hosts every meet. Collaborators support with space, expertise or sponsorship.
                </p>

                {success && (
                  <div className="p-3.5 rounded-md bg-[#ff5a00]/10 border border-[#ff5a00]/40 text-[#ffd2bd] text-xs">
                    Thanks! WhatsApp is opening with your request. Just hit send and we’ll get back to you within 48 hours.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
