import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Zap,
  LockKeyhole,
} from 'lucide-react';
import { FitnessEvent } from '../../types';
import { FITMEET_LOGO_URL, getPublicAssetUrl } from '../../lib/brandAssets';

interface MeetsPageProps {
  events: FitnessEvent[];
  onNavigateHome: () => void;
  onJoinMeet: (event: FitnessEvent) => void;
  onSelectEvent?: (event: FitnessEvent) => void;
}

type MeetsTab = 'upcoming' | 'past';

const fallbackEvent: FitnessEvent = {
  id: 'fitmeet-01',
  title: 'FitMeet #01',
  description: '',
  category: 'gym_hiit',
  coverImage: getPublicAssetUrl('assets/images/hero_runners_dawn.jpg'),
  date: 'TBA',
  displayDate: 'A Sunday, very soon',
  startTime: 'To be announced',
  endTime: 'To be announced',
  timezone: 'IST',
  venue: 'To Be Announced',
  city: 'Patna',
  priceInPaise: 0,
  currency: 'INR',
  registrationCapacity: 100,
  slotsRemaining: 100,
  registrationDeadline: '',
  rules: [],
  cancellationPolicy: '',
  primaryOrganizerId: '',
  primaryOrganizerName: 'FitMeet Patna',
  coHosts: [],
  status: 'published',
  featured: true,
  createdAt: new Date().toISOString(),
};

const meetsStyles = `
  .fm-meets-content { background:#09090b; color:#c8c8ce; }
  .fm-hero { position:relative; overflow:hidden; text-align:center; padding:clamp(44px,7vw,72px) 16px clamp(40px,6vw,60px); border-bottom:1px solid #24242a; }
  .fm-hero::before { content:""; position:absolute; left:50%; top:-40%; width:900px; height:520px; transform:translateX(-50%); background:radial-gradient(closest-side,#ff5a1f24,transparent 70%); pointer-events:none; }
  .fm-hero::after { content:""; position:absolute; inset:0; background-image:linear-gradient(#ffffff06 1px,transparent 1px),linear-gradient(90deg,#ffffff06 1px,transparent 1px); background-size:48px 48px; mask-image:radial-gradient(ellipse at 50% 40%,#000 10%,transparent 65%); pointer-events:none; }
  .fm-hero-inner { position:relative; z-index:1; width:min(860px,100%); margin-inline:auto; }
  .fm-hero-logo { display:block; margin:0 auto 16px; height:clamp(84px,14vw,112px); width:auto; object-fit:contain; }
  .fm-pill { display:inline-block; padding:7px 14px; border:1px solid #ff5a1f66; background:#ff5a1f1a; border-radius:999px; font-size:12px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:#ff5a1f; }
  .fm-hero-title { margin:18px 0 12px; color:#fff; font-size:clamp(38px,6.4vw,68px); font-weight:800; line-height:.95; letter-spacing:-.005em; text-transform:uppercase; }
  .fm-rotator { display:grid; justify-items:center; overflow:hidden; padding-bottom:.08em; color:#ff5a1f; }
  .fm-rotator span { grid-area:1/1; opacity:0; animation:fm-rot 12.5s ease-in-out infinite; animation-delay:calc(var(--i)*2.5s); }
  @keyframes fm-rot { 0% { opacity:0; transform:translateY(60%); } 3%,17% { opacity:1; transform:none; } 20%,100% { opacity:0; transform:translateY(-60%); } }
  .fm-lede { max-width:520px; margin:0 auto; color:#c8c8ce; font-size:clamp(15px,1.8vw,18px); text-wrap:balance; }
  .fm-lede-cta { display:block; margin-top:8px; color:#ff5a1f; font-weight:600; }
  .fm-facts { display:flex; flex-wrap:wrap; justify-content:center; gap:10px 30px; margin-top:22px; color:#80818a; font-size:13px; }
  .fm-facts span { display:inline-flex; align-items:center; gap:8px; }
  .fm-facts svg { width:16px; height:16px; color:#ff5a1f; }
  .fm-main { width:min(860px,100% - 32px); margin-inline:auto; padding:36px 0 56px; }
  .fm-list-head { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; margin-bottom:22px; }
  .fm-section-title { color:#fff; font-size:clamp(32px,5vw,44px); font-weight:800; font-style:italic; line-height:.9; text-transform:uppercase; }
  .fm-section-title span { color:#ff5a1f; }
  .fm-tabs { display:flex; gap:4px; padding:4px; border:1px solid #34343c; border-radius:10px; }
  .fm-tab { appearance:none; border:0; background:none; color:#80818a; padding:9px 14px; border-radius:7px; cursor:pointer; font-size:13px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; transition:background .2s,color .2s; }
  .fm-tab:hover { color:#fff; }
  .fm-tab[aria-selected="true"] { background:#ff5a1f; color:#fff; }
  .fm-tab b { margin-left:4px; font-weight:700; opacity:.7; }
  .fm-panel[hidden] { display:none; }
  .fm-list { display:grid; gap:10px; }
  .fm-card { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:20px; padding:18px 20px; border:1px solid #24242a; border-radius:14px; background:#131317; transition:border-color .25s; }
  .fm-card:hover { border-color:#ff5a1f66; }
  .fm-card-next { border-color:#ff5a1f55; background:linear-gradient(90deg,#ff5a1f14,#131317 40%); }
  .fm-number { min-width:64px; color:#fff; font-size:40px; font-weight:800; font-style:italic; line-height:1; }
  .fm-number span { color:#ff5a1f; }
  .fm-info h3 { color:#fff; font-size:20px; font-weight:800; font-style:italic; line-height:1.1; text-transform:uppercase; }
  .fm-badge { display:inline-block; margin-left:8px; padding:4px 7px; border-radius:4px; background:#ff5a1f; color:#fff; font-size:10px; font-style:normal; font-weight:800; letter-spacing:.14em; text-transform:uppercase; vertical-align:3px; }
  .fm-meta { display:flex; flex-wrap:wrap; gap:4px 16px; margin-top:6px; color:#80818a; font-size:13px; }
  .fm-meta-item { display:inline-flex; align-items:center; gap:6px; }
  .fm-meta-item svg { width:14px; height:14px; flex:none; color:#ff5a1f; }
  .fm-meta-item i { margin-left:-2px; color:#c8c8ce; font-style:normal; }
  .fm-btn { position:relative; display:inline-flex; align-items:center; justify-content:center; gap:8px; overflow:hidden; white-space:nowrap; border:0; border-radius:5px; background:#ff5a1f; padding:11px 16px; color:#fff; cursor:pointer; font-size:13px; font-weight:800; font-style:italic; letter-spacing:.06em; text-transform:uppercase; transform:skewX(-10deg); transition:background .2s,transform .2s,box-shadow .2s; }
  .fm-btn > * { transform:skewX(10deg); }
  .fm-btn svg { width:14px; height:14px; transition:transform .2s; }
  .fm-btn:hover { background:#ff8a3d; transform:skewX(-10deg) translateY(-1px); box-shadow:0 10px 24px -10px #ff5a1fa0; }
  .fm-btn:hover svg { transform:skewX(10deg) translateX(3px); }
  .fm-btn::after { content:""; position:absolute; inset:0 auto 0 -60%; width:40%; background:linear-gradient(100deg,transparent,#ffffff55,transparent); animation:fm-shine 3.4s ease-in-out infinite; }
  @keyframes fm-shine { 0% { left:-60%; } 55%,100% { left:130%; } }
  .fm-locked { border-style:dashed; background:repeating-linear-gradient(135deg,#111115 0 12px,#141418 12px 24px); }
  .fm-locked .fm-number { color:#ffffff40; }
  .fm-locked .fm-number span { color:#ff5a1f80; }
  .fm-locked .fm-info h3 { color:#ffffff70; }
  .fm-locked-copy { display:flex; align-items:center; gap:7px; margin-top:4px; color:#80818a; font-size:13px; }
  .fm-lock-icon { width:18px; height:18px; color:#ff5a1f; animation:fm-wobble 4s ease-in-out infinite; }
  @keyframes fm-wobble { 0%,86%,100% { transform:rotate(0); } 89% { transform:rotate(-12deg); } 92% { transform:rotate(10deg); } 95% { transform:rotate(-6deg); } }
  .fm-note { margin-top:18px; color:#80818a; font-size:13px; }
  .fm-note b { color:#c8c8ce; font-weight:600; }
  .fm-empty { padding:48px 20px; border:1px dashed #34343c; border-radius:14px; text-align:center; }
  .fm-empty svg { width:34px; height:34px; margin-bottom:12px; color:#ff5a1f; }
  .fm-empty h3 { margin-bottom:6px; color:#fff; font-size:22px; font-weight:800; font-style:italic; line-height:1.1; text-transform:uppercase; }
  .fm-empty p { max-width:340px; margin:0 auto; color:#80818a; }
  @media(max-width:600px) {
    .fm-card { grid-template-columns:auto 1fr; gap:6px 16px; padding:16px; }
    .fm-card .fm-btn { grid-column:2; justify-self:start; margin-top:8px; }
    .fm-locked { grid-template-columns:auto 1fr auto; }
    .fm-number { min-width:52px; grid-row:span 2; font-size:32px; }
    .fm-list-head { align-items:flex-start; flex-direction:column; }
  }
  @media(prefers-reduced-motion:reduce) {
    .fm-meets-content *, .fm-meets-content *::before, .fm-meets-content *::after { animation:none!important; transition:none!important; }
    .fm-rotator span:first-child { opacity:1; transform:none; }
  }
`;

export const MeetsPage: React.FC<MeetsPageProps> = ({ events, onNavigateHome, onJoinMeet }) => {
  const [activeTab, setActiveTab] = useState<MeetsTab>('upcoming');
  const registrationEvent = events[0] || fallbackEvent;
  const tabs: MeetsTab[] = ['upcoming', 'past'];

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, tab: MeetsTab) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const nextTab =
      tabs[(tabs.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    setActiveTab(nextTab);
    document.getElementById(`fm-tab-${nextTab}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-[#09090b] pb-10 text-[#c8c8ce]">
      <style>{meetsStyles}</style>

      <div className="sticky top-20 z-30 border-b border-white/10 bg-[#0d0e12]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3.5 sm:px-6">
          <button
            onClick={onNavigateHome}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-300 transition-colors hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4 text-[#FC5300]" />
            <span>Back to Home</span>
          </button>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#8d8a85]">
            Official Meets · Patna
          </span>
        </div>
      </div>

      <div className="fm-meets-content">
        <section className="fm-hero">
          <div className="fm-hero-inner">
            <img
              className="fm-hero-logo"
              src={FITMEET_LOGO_URL}
              alt="FitMeet logo"
              width="104"
              height="98"
            />
            <span className="fm-pill">FitMeet · Patna</span>
            <h1 className="fm-hero-title" aria-label="Push your limits. Together.">
              Push your limits.
              <span className="fm-rotator" aria-hidden="true">
                <span style={{ '--i': 0 } as React.CSSProperties}>Together.</span>
                <span style={{ '--i': 1 } as React.CSSProperties}>Every Sunday.</span>
                <span style={{ '--i': 2 } as React.CSSProperties}>In Patna.</span>
                <span style={{ '--i': 3 } as React.CSSProperties}>Without excuses.</span>
                <span style={{ '--i': 4 } as React.CSSProperties}>As one crew.</span>
              </span>
            </h1>
            <p className="fm-lede">
              Boring Sundays end here. Take on challenges, play and meet people who make your Sunday
              worth waking up for. Join Patna’s first FitMeet and make this the Sunday lifestyle.
              <b className="fm-lede-cta">Register now. Make your Sunday count.</b>
            </p>
            <div className="fm-facts">
              <span>
                <CalendarDays aria-hidden="true" />
                Every Sunday
              </span>
              <span>
                <MapPin aria-hidden="true" />
                Patna, Bihar
              </span>
              <span>
                <Users aria-hidden="true" />
                All fitness levels welcome
              </span>
            </div>
          </div>
        </section>

        <main className="fm-main">
          <div className="fm-list-head">
            <h2 className="fm-section-title">
              Fit<span>Meets</span>
            </h2>
            <div className="fm-tabs" role="tablist" aria-label="Meets">
              {tabs.map((tab) => {
                const selected = activeTab === tab;
                return (
                  <button
                    key={tab}
                    className="fm-tab"
                    id={`fm-tab-${tab}`}
                    type="button"
                    role="tab"
                    aria-controls={`fm-panel-${tab}`}
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveTab(tab)}
                    onKeyDown={(event) => handleTabKeyDown(event, tab)}
                  >
                    {tab === 'upcoming' ? 'Upcoming' : 'Past'}
                    <b>{tab === 'upcoming' ? '3' : '0'}</b>
                  </button>
                );
              })}
            </div>
          </div>

          <section
            className="fm-panel"
            id="fm-panel-upcoming"
            role="tabpanel"
            aria-labelledby="fm-tab-upcoming"
            hidden={activeTab !== 'upcoming'}
            tabIndex={0}
          >
            <div className="fm-list">
              <article className="fm-card fm-card-next">
                <div className="fm-number">
                  #<span>01</span>
                </div>
                <div className="fm-info">
                  <h3>
                    The first meet<span className="fm-badge">Up first</span>
                  </h3>
                  <div className="fm-meta">
                    <span className="fm-meta-item">
                      <CalendarDays aria-hidden="true" />
                      Date: <i>A Sunday, very soon</i>
                    </span>
                    <span className="fm-meta-item">
                      <Clock3 aria-hidden="true" />
                      Time: <i>Morning, shared before the meet</i>
                    </span>
                    <span className="fm-meta-item">
                      <MapPin aria-hidden="true" />
                      Venue: <i>Unlocked for the crew first</i>
                    </span>
                  </div>
                </div>
                <button
                  className="fm-btn"
                  type="button"
                  onClick={() => onJoinMeet(registrationEvent)}
                >
                  <span>Register now</span>
                  <ArrowRight aria-hidden="true" />
                </button>
              </article>

              {[2, 3].map((number) => (
                <article className="fm-card fm-locked" key={number}>
                  <div className="fm-number">
                    #<span>{String(number).padStart(2, '0')}</span>
                  </div>
                  <div className="fm-info">
                    <h3>Locked</h3>
                    <div className="fm-locked-copy">
                      Revealed after #{String(number - 1).padStart(2, '0')}
                    </div>
                  </div>
                  <LockKeyhole className="fm-lock-icon" aria-hidden="true" />
                </article>
              ))}
            </div>
            <p className="fm-note">
              <b>Register only if you&apos;re in Patna.</b> If you register and can&apos;t attend,
              your fee won&apos;t be refunded.
            </p>
          </section>

          <section
            className="fm-panel"
            id="fm-panel-past"
            role="tabpanel"
            aria-labelledby="fm-tab-past"
            hidden={activeTab !== 'past'}
            tabIndex={0}
          >
            <div className="fm-empty">
              <Zap aria-hidden="true" />
              <h3>No past meets yet</h3>
              <p>
                FitMeet #01 will be the first. Photos and highlights show up here after every meet.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
