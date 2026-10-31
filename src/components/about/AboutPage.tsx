import React, { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { FitMeetEmblem } from '../common/FitMeetEmblem';

interface AboutPageProps {
  onJoinClick?: () => void;
  onExploreClick?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onJoinClick, onExploreClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Intersection observer for fade-in reveals
    const root = containerRef.current;
    if (!root) return;

    const reveals = root.querySelectorAll('.rv');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((el) => observer.observe(el));

    // Pause/unpause SVG animations on scroll visibility
    const icons = root.querySelectorAll<SVGSVGElement>('svg.ill');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        icons.forEach((i) => {
          if (entry.isIntersecting && !reduceMotion) {
            if ('unpauseAnimations' in i && typeof (i as any).unpauseAnimations === 'function') {
              (i as any).unpauseAnimations();
            }
          } else {
            if ('pauseAnimations' in i && typeof (i as any).pauseAnimations === 'function') {
              (i as any).pauseAnimations();
            }
          }
        });
      });
    });

    const valuesSection = root.querySelector('.values-section');
    if (valuesSection) animObserver.observe(valuesSection);

    return () => {
      reveals.forEach((el) => observer.unobserve(el));
      if (valuesSection) animObserver.unobserve(valuesSection);
    };
  }, []);

  return (
    <div ref={containerRef} className="about-page bg-[#0b0b0d] text-[#c9c9cf] min-h-screen">
      <style>{`
        .rv {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .rv.in {
          opacity: 1;
          transform: none;
        }
        .values-grid .rv:nth-child(2) { transition-delay: 0.1s; }
        .values-grid .rv:nth-child(3) { transition-delay: 0.2s; }

        @keyframes aheroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .ahero-emb {
          animation: aheroFloat 4s ease-in-out infinite;
        }

        @keyframes ptSpin {
          to { transform: rotate(360deg); }
        }
        .orbit-spin {
          animation: ptSpin 35s linear infinite;
        }
      `}</style>

      {/* ================= 1. ABOUT HERO: "More than a fitness meetup." ================= */}
      <section className="relative overflow-hidden py-20 lg:py-28 border-b border-[#1c1d22] bg-[#0d0e12]">
        {/* Ambient radial glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-radial from-[#ff5a1f]/15 to-transparent pointer-events-none blur-2xl" />

        <div className="mx-auto max-w-[1240px] px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left text column */}
            <div className="lg:col-span-8 rv in">
              <div className="inline-flex items-center gap-2 text-[#ff5a1f] font-head font-bold text-xs sm:text-sm uppercase tracking-widest mb-4">
                <Sparkles className="h-4 w-4 fill-[#ff5a1f] text-[#ff5a1f]" />
                <span>ABOUT FITMEET</span>
              </div>

              <h1 className="font-head font-black text-4xl sm:text-6xl lg:text-[4.2rem] uppercase leading-[0.94] tracking-tight text-white">
                More than a <span className="text-[#ff5a1f]">fitness meetup.</span>
              </h1>

              <p className="mt-6 text-base sm:text-lg lg:text-xl text-[#c9c9cf] leading-relaxed max-w-2xl font-light">
                FitMeet is Patna’s Sunday fitness game. Every week, a new gym or outdoor spot becomes the arena, where people take on fitness challenges, play team games, win goodies and leave with new friends. We train, we play, we connect, and we have fun doing it.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={onJoinClick}
                  className="inline-flex items-center gap-2.5 px-8 py-4 text-sm sm:text-base font-black uppercase tracking-wider text-white bg-[#ff5a1f] hover:bg-[#ff7a2e] rounded-md transition-all shadow-[0_0_28px_rgba(255,90,31,0.45)] hover:shadow-[0_0_36px_rgba(255,90,31,0.7)] active:scale-95 cursor-pointer group"
                >
                  <span>JOIN THE CREW</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.6] transition-transform group-hover:translate-x-1" />
                </button>

                <a
                  href="https://whatsapp.com/channel/0029VbE5yl8Likg2G1r0I83R"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white bg-[#141519] border border-[#2a2b31] hover:border-[#ff5a1f] rounded-md transition-all hover:bg-[#1a1b22] active:scale-95"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  <span>WhatsApp Channel</span>
                </a>
              </div>
            </div>

            {/* Right emblem showcase column */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end rv">
              <div className="ahero-emb w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-[36px] bg-gradient-to-b from-[#181920] to-[#0f1013] border border-[#ff5a1f]/30 p-8 flex items-center justify-center relative shadow-[0_24px_50px_rgba(0,0,0,0.85)]">
                {/* Glowing ring */}
                <div className="absolute inset-4 rounded-full border-2 border-[#ff5a1f]/20 orbit-spin pointer-events-none" />
                <FitMeetEmblem size="xl" withOrbit={true} withGlow={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. VALUES: 3 CARDS WITH ANIMATED SVGS ================= */}
      <section className="values-section py-20 border-b border-[#16171a] bg-[#0b0b0d]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="mb-12 rv">
            <p className="font-head font-bold text-xs sm:text-sm uppercase tracking-widest text-[#ff5a1f] mb-2">
              WHAT FITMEET STANDS FOR
            </p>
            <h2 className="font-head font-black text-3xl sm:text-5xl uppercase text-white">
              Why people love <span className="text-[#ff5a1f]">Sundays</span> with us
            </h2>
          </div>

          <div className="values-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: New arena, every Sunday */}
            <article className="rv bg-[#131418] border border-[#23242a] hover:border-[#ff5a1f] rounded-2xl p-7 sm:p-8 transition-all hover:-translate-y-1.5 shadow-lg group">
              <div className="w-20 h-20 rounded-2xl bg-[#ff5a1f]/10 border border-[#ff5a1f]/20 flex items-center justify-center mb-6 group-hover:bg-[#ff5a1f]/20 transition-colors">
                <svg className="ill w-16 h-16" viewBox="0 0 48 48" aria-hidden="true">
                  <ellipse cx="24" cy="45" rx="19" ry="1.6" fill="#000" fillOpacity=".55" />
                  <path d="M24 10V2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M24 2q3-1 6 0t6 0v4q-3-1-6 0t-6 0z" fill="#fff" />
                  <rect x="9" y="18" width="30" height="27" rx="1.5" fill="#2b2b31" />
                  <path d="M6 19.5L24 9L42 19.5z" fill="#ff5a1f" />
                  <rect x="17" y="21.5" width="14" height="5" rx="1" fill="#fff" />
                  <path d="M20.5 24h7M20.5 22.8v2.4M27.5 22.8v2.4" stroke="#ff5a1f" strokeWidth="1.4" strokeLinecap="round" />
                  <rect x="12" y="29" width="5" height="5" rx=".8" fill="#ffb37a" fillOpacity=".25" />
                  <rect x="31" y="29" width="5" height="5" rx=".8" fill="#ffb37a" fillOpacity=".25" />
                  <rect x="20" y="33" width="8" height="12" fill="#111114" />
                  <rect x="20" y="33" width="8" height="12" fill="#ffb37a" />
                  <g>
                    <animateTransform attributeName="transform" type="translate" values="20 0;0 0;0 0" keyTimes="0;.5;1" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.08;.5;.6;1" dur="3s" repeatCount="indefinite" />
                    <path d="M23 41l-1.5 3.5M25 41l1.5 3.5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                    <rect x="21.7" y="36.5" width="4.6" height="5" rx="1.6" fill="#ff5a1f" />
                    <circle cx="24" cy="34.5" r="2" fill="#fff" />
                  </g>
                </svg>
              </div>
              <h3 className="font-head font-extrabold text-2xl uppercase text-white mb-2.5">
                New arena, every Sunday
              </h3>
              <p className="text-sm sm:text-base text-[#9a9aa3] leading-relaxed">
                From neighbourhood gyms to open-air spots, every meet takes you somewhere new in Patna.
              </p>
            </article>

            {/* Card 2: Fitness, made fun */}
            <article className="rv bg-[#131418] border border-[#23242a] hover:border-[#ff5a1f] rounded-2xl p-7 sm:p-8 transition-all hover:-translate-y-1.5 shadow-lg group">
              <div className="w-20 h-20 rounded-2xl bg-[#ff5a1f]/10 border border-[#ff5a1f]/20 flex items-center justify-center mb-6 group-hover:bg-[#ff5a1f]/20 transition-colors">
                <svg className="ill w-16 h-16" viewBox="0 0 48 48" aria-hidden="true">
                  <ellipse cx="24" cy="44.5" rx="10" ry="1.6" fill="#000" fillOpacity=".35" />
                  <defs>
                    <clipPath id="tclip-about">
                      <path d="M14 8h20v9a10 10 0 0 1-20 0z" />
                    </clipPath>
                  </defs>
                  <g>
                    <animateTransform attributeName="transform" type="translate" values="0 0;0 -2.5;0 0" dur="1.6s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1" />
                    <rect x="15.5" y="38" width="17" height="5" rx="1.5" fill="#2b2b31" />
                    <rect x="21.5" y="27" width="5" height="11.5" rx="1" fill="#ffb37a" />
                    <path d="M14 11H10.5a4.5 4.5 0 0 0 5 8M34 11h3.5a4.5 4.5 0 0 1-5 8" fill="none" stroke="#ff8a50" strokeWidth="2.4" strokeLinecap="round" />
                    <path d="M14 8h20v9a10 10 0 0 1-20 0z" fill="#ff5a1f" />
                    <path d="M24 11.5l1.4 2.9 3.2.4-2.3 2.2.6 3.1-2.9-1.5-2.9 1.5.6-3.1-2.3-2.2 3.2-.4z" fill="#fff" />
                    <g clipPath="url(#tclip-about)">
                      <rect x="-6" y="4" width="5" height="30" fill="#fff" fillOpacity=".45" transform="skewX(-18)">
                        <animate attributeName="x" values="-6;-6;40;40" keyTimes="0;.45;.75;1" dur="2.4s" repeatCount="indefinite" />
                      </rect>
                    </g>
                  </g>
                  <g opacity="0">
                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.6;1" dur="2.4s" repeatCount="indefinite" />
                    <rect x="7" y="4" width="2.6" height="2.6" fill="#ff5a1f" transform="rotate(20 8 5)" />
                    <rect x="38" y="6" width="2.4" height="2.4" fill="#4fc3f7" transform="rotate(-25 39 7)" />
                    <circle cx="12" cy="1.5" r="1.2" fill="#ffd54f" />
                    <circle cx="36" cy="1" r="1.1" fill="#8bc34a" />
                  </g>
                </svg>
              </div>
              <h3 className="font-head font-extrabold text-2xl uppercase text-white mb-2.5">
                Fitness, made fun
              </h3>
              <p className="text-sm sm:text-base text-[#9a9aa3] leading-relaxed">
                Strength, bodyweight, HIIT and team challenges that feel like a game, not a routine.
              </p>
            </article>

            {/* Card 3: Open to everyone */}
            <article className="rv bg-[#131418] border border-[#23242a] hover:border-[#ff5a1f] rounded-2xl p-7 sm:p-8 transition-all hover:-translate-y-1.5 shadow-lg group">
              <div className="w-20 h-20 rounded-2xl bg-[#ff5a1f]/10 border border-[#ff5a1f]/20 flex items-center justify-center mb-6 group-hover:bg-[#ff5a1f]/20 transition-colors">
                <svg className="ill w-16 h-16" viewBox="0 0 48 48" aria-hidden="true">
                  <ellipse cx="24" cy="44.5" rx="15" ry="1.6" fill="#000" fillOpacity=".55" />
                  {/* High-five burst */}
                  <g opacity="0">
                    <animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;.38;.45;.72;1" dur="2.4s" repeatCount="indefinite" />
                    <path d="M24 1v2.5M18.5 3l1.8 1.8M29.5 3l-1.8 1.8" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M37 9c-1-1.6-3.6-.6-2.2 1.5l2.2 2.2l2.2-2.2c1.4-2.1-1.2-3.1-2.2-1.5z" fill="#ff5a1f" />
                    <path d="M11 9c-.8-1.2-2.8-.4-1.7 1.2l1.7 1.7l1.7-1.7c1.1-1.6-.9-2.4-1.7-1.2z" fill="#ffb37a" />
                  </g>
                  {/* Person A */}
                  <g>
                    <animateTransform attributeName="transform" type="translate" values="0 0;4 0;4 0;0 0" keyTimes="0;.4;.7;1" calcMode="spline" keySplines=".4 0 .2 1;0 0 1 1;.4 0 .2 1" dur="2.4s" repeatCount="indefinite" />
                    <path d="M12 32L11.5 43M16 32L16.5 43" fill="none" stroke="#2b2b31" strokeWidth="4" strokeLinecap="round" />
                    <rect x="9.5" y="20" width="9" height="13" rx="3.5" fill="#ff5a1f" />
                    <circle cx="14" cy="15" r="4" fill="#fff" />
                    <path d="M10 14.5a4 4 0 0 1 8 0z" fill="#2b2b31" />
                  </g>
                  {/* Person B */}
                  <g>
                    <animateTransform attributeName="transform" type="translate" values="0 0;-4 0;-4 0;0 0" keyTimes="0;.4;.7;1" calcMode="spline" keySplines=".4 0 .2 1;0 0 1 1;.4 0 .2 1" dur="2.4s" repeatCount="indefinite" />
                    <path d="M32 32L31.5 43M36 32L36.5 43" fill="none" stroke="#2b2b31" strokeWidth="4" strokeLinecap="round" />
                    <rect x="29.5" y="20" width="9" height="13" rx="3.5" fill="#ffb37a" />
                    <circle cx="34" cy="15" r="4" fill="#fff" />
                    <path d="M30 14.5a4 4 0 0 1 8 0z" fill="#2b2b31" />
                  </g>
                </svg>
              </div>
              <h3 className="font-head font-extrabold text-2xl uppercase text-white mb-2.5">
                Open to everyone
              </h3>
              <p className="text-sm sm:text-base text-[#9a9aa3] leading-relaxed">
                First-timer or regular, solo or with friends. If you show up, you’re part of the crew.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ================= 4. OUR STORY ================= */}
      <section className="py-20 lg:py-24 bg-[#0a0a0c]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-4 rv">
              <h2 className="font-head font-black text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white">
                Our <span className="text-[#ff5a1f]">story</span>
              </h2>
            </div>

            <div className="lg:col-span-8 rv space-y-5 text-base sm:text-lg text-[#c9c9cf] leading-relaxed font-light">
              <p>
                FitMeet started with a simple question: why should Sunday mornings in Patna be spent on the sofa? We wanted a place where fitness feels like play, where strangers become teammates, and where every week brings a new gym, new coaches and new energy.
              </p>
              <p>
                So we built it. FitMeet hosts and runs every meet, working with local gyms, coaches and brands to create Sundays people actually look forward to.
              </p>
              <div className="font-head font-black text-2xl sm:text-3xl lg:text-4xl uppercase text-white pt-3">
                New place. New challenge. <span className="text-[#ff5a1f]">Same crew.</span>
              </div>
              <p>
                If you’ve been waiting for a reason to start, this is it.
              </p>

              <div className="pt-4">
                <button
                  onClick={onJoinClick}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 text-sm sm:text-base font-bold uppercase tracking-wider text-white bg-[#ff5a1f] hover:bg-[#ff7a2e] rounded-md transition-all shadow-[0_0_24px_rgba(255,90,31,0.4)] hover:shadow-[0_0_34px_rgba(255,90,31,0.65)] cursor-pointer group"
                >
                  <span>JOIN THE CREW</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.4] transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

