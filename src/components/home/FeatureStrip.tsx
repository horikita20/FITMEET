import React, { useEffect, useRef } from 'react';

export const FeatureStrip: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = containerRef.current;
    if (!section) return;

    const cards = Array.from(section.querySelectorAll('.fm-card')) as HTMLElement[];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const setPlaying = (card: HTMLElement, play: boolean) => {
      const svg = card.querySelector('svg');
      if (!svg) return;
      if (play && !reduceMotion.matches) {
        if ('unpauseAnimations' in svg && typeof (svg as any).unpauseAnimations === 'function') {
          (svg as any).unpauseAnimations();
        }
        card.classList.remove('is-paused');
      } else {
        if ('pauseAnimations' in svg && typeof (svg as any).pauseAnimations === 'function') {
          (svg as any).pauseAnimations();
        }
        card.classList.add('is-paused');
      }
    };

    cards.forEach((c) => setPlaying(c, false));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => setPlaying(e.target as HTMLElement, e.isIntersecting));
      },
      { threshold: 0.2 }
    );

    cards.forEach((c) => io.observe(c));

    const handleMotion = () => {
      cards.forEach((c) => setPlaying(c, !reduceMotion.matches));
    };

    reduceMotion.addEventListener('change', handleMotion);

    return () => {
      cards.forEach((c) => io.unobserve(c));
      reduceMotion.removeEventListener('change', handleMotion);
    };
  }, []);

  return (
    <>
      <style>{`
        :root {
          --fm-bg: #f8fafc;
          --fm-bg-hover: #f1f5f9;
          --fm-accent: #ff5a1f;
          --fm-divider: #e2e8f0;
          --fm-title: #0f172a;
          --fm-text: #64748b;
        }

        .dark {
          --fm-bg: #0d0d0f;
          --fm-bg-hover: #16161a;
          --fm-accent: #ff5a1f;
          --fm-divider: #26262b;
          --fm-title: #ffffff;
          --fm-text: #9a9aa3;
        }

        .fm-features {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          background: var(--fm-bg);
          padding: 40px 0;
          font-family: inherit;
        }

        .fm-card {
          padding: 8px 28px 12px;
          border-right: 1px solid var(--fm-divider);
          outline: none;
          transition: background .3s ease;
          background: transparent;
        }
        .fm-card:last-child { border-right: 0; }
        .fm-card:hover { background: var(--fm-bg-hover); }
        .fm-card:focus-visible { box-shadow: inset 0 0 0 2px var(--fm-accent); }

        .fm-icon {
          display: block;
          width: 72px;
          height: 72px;
          overflow: visible;
          transition: transform .3s ease;
        }
        .fm-card:hover .fm-icon,
        .fm-card:focus-visible .fm-icon { transform: scale(1.08); }

        .fm-card h3 {
          margin: 18px 0 10px;
          color: var(--fm-title);
          font-family: inherit;
          font-weight: 700;
          font-size: 20px;
          line-height: 1.3;
          text-transform: uppercase;
        }
        .fm-card p {
          margin: 0;
          color: var(--fm-text);
          font-size: 14px;
          line-height: 1.6;
        }

        .fm-rays { transform-box: fill-box; transform-origin: center; animation: fm-spin 10s linear infinite; }
        @keyframes fm-spin { to { transform: rotate(360deg); } }
        .is-paused .fm-rays { animation-play-state: paused; }

        @media (max-width: 1100px) {
          .fm-features { grid-template-columns: repeat(3, minmax(0, 1fr)); row-gap: 32px; }
          .fm-card:nth-child(3) { border-right: 0; }
        }
        @media (max-width: 680px) {
          .fm-features { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .fm-card { padding: 4px 18px 8px; }
          .fm-card:nth-child(3) { border-right: 1px solid var(--fm-divider); }
          .fm-card:nth-child(2n) { border-right: 0; }
          .fm-icon { width: 62px; height: 62px; }
          .fm-card h3 { font-size: 17px; }
        }
        @media (max-width: 480px) {
          .fm-features { grid-template-columns: 1fr; }
          .fm-card { border-right: 0 !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fm-rays { animation: none; }
          .fm-icon { transition: none; }
        }
      `}</style>

      <section
        ref={containerRef}
        className="fm-features border-b border-slate-200 dark:border-[#26262b] transition-colors"
        data-play="always"
        aria-label="What FitMeet offers"
      >
        {/* ===== 1. FITNESS CHALLENGES: barbell squat ===== */}
        <article className="fm-card" tabIndex={0}>
          <svg className="fm-icon" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="25" r="21" fill="#ff5a1f" fillOpacity=".13">
              <animate attributeName="r" values="20;21.5;20" dur="1.6s" repeatCount="indefinite" />
            </circle>
            <ellipse cx="24" cy="44.5" rx="9" ry="1.6" fill="#000" fillOpacity=".55">
              <animate
                attributeName="rx"
                values="9;11;9"
                dur="1.6s"
                calcMode="spline"
                keySplines=".4 0 .2 1;.4 0 .2 1"
                repeatCount="indefinite"
              />
            </ellipse>

            {/* Legs bend */}
            <path
              d="M21 31L20.5 37L20.5 43M27 31L27.5 37L27.5 43"
              fill="none"
              stroke="#2b2b31"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animate
                attributeName="d"
                dur="1.6s"
                calcMode="spline"
                keySplines=".4 0 .2 1;.4 0 .2 1"
                repeatCount="indefinite"
                values="M21 31L20.5 37L20.5 43M27 31L27.5 37L27.5 43;M21 37L16 38.5L20.5 43M27 37L32 38.5L27.5 43;M21 31L20.5 37L20.5 43M27 31L27.5 37L27.5 43"
              />
            </path>

            {/* Upper body + barbell */}
            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0;0 6;0 0"
                dur="1.6s"
                calcMode="spline"
                keySplines=".4 0 .2 1;.4 0 .2 1"
                repeatCount="indefinite"
              />
              <path d="M7 18H41" stroke="#c9c9cf" strokeWidth="2" strokeLinecap="round" />
              <rect x="7" y="12.5" width="4" height="11" rx="1.2" fill="#ff5a1f" />
              <rect x="37" y="12.5" width="4" height="11" rx="1.2" fill="#ff5a1f" />
              <rect x="11.5" y="14.5" width="2" height="7" rx=".8" fill="#ffb37a" />
              <rect x="34.5" y="14.5" width="2" height="7" rx=".8" fill="#ffb37a" />
              <rect x="18" y="19" width="12" height="13" rx="4" fill="#ff5a1f" />
              <path
                d="M19 21.5L15 23L16 18M29 21.5L33 23L32 18"
                fill="none"
                stroke="#fff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="24" cy="12.5" r="4.5" fill="#fff" />
              <rect x="19.5" y="9.6" width="9" height="2" rx="1" fill="#ff5a1f" />
            </g>

            {/* Sweat drops */}
            <g fill="#ff5a1f" opacity="0">
              <animate
                attributeName="opacity"
                values="0;0;1;0"
                keyTimes="0;.75;.85;1"
                dur="1.6s"
                repeatCount="indefinite"
              />
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0;0 0;0 -3"
                keyTimes="0;.75;1"
                dur="1.6s"
                repeatCount="indefinite"
              />
              <path d="M16 6q1.5 2 0 3q-1.5-1 0-3z" />
              <path d="M32 6q1.5 2 0 3q-1.5-1 0-3z" />
            </g>
          </svg>
          <h3>Fitness challenges</h3>
          <p>Strength, endurance, HIIT, fun games &amp; more.</p>
        </article>

        {/* ===== 2. MEET YOUR PEOPLE: high-five ===== */}
        <article className="fm-card" tabIndex={0}>
          <svg className="fm-icon" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="25" r="21" fill="#ff5a1f" fillOpacity=".13">
              <animate attributeName="r" values="20;21.5;20" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <ellipse cx="24" cy="44.5" rx="15" ry="1.6" fill="#000" fillOpacity=".55" />

            {/* Burst + heart */}
            <g opacity="0">
              <animate
                attributeName="opacity"
                values="0;0;1;0;0"
                keyTimes="0;.38;.45;.72;1"
                dur="2.4s"
                repeatCount="indefinite"
              />
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0;0 0;0 -3;0 -3"
                keyTimes="0;.38;.72;1"
                dur="2.4s"
                repeatCount="indefinite"
              />
              <path
                d="M24 1v2.5M18.5 3l1.8 1.8M29.5 3l-1.8 1.8"
                fill="none"
                stroke="#fff"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M37 9c-1-1.6-3.6-.6-2.2 1.5l2.2 2.2l2.2-2.2c1.4-2.1-1.2-3.1-2.2-1.5z"
                fill="#ff5a1f"
              />
              <path
                d="M11 9c-.8-1.2-2.8-.4-1.7 1.2l1.7 1.7l1.7-1.7c1.1-1.6-.9-2.4-1.7-1.2z"
                fill="#ffb37a"
              />
            </g>

            {/* Person A */}
            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0;4 0;4 0;0 0"
                keyTimes="0;.4;.7;1"
                calcMode="spline"
                keySplines=".4 0 .2 1;0 0 1 1;.4 0 .2 1"
                dur="2.4s"
                repeatCount="indefinite"
              />
              <path
                d="M12 32L11.5 43M16 32L16.5 43"
                fill="none"
                stroke="#2b2b31"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <rect x="9.5" y="20" width="9" height="13" rx="3.5" fill="#ff5a1f" />
              <path
                d="M11 23L9 30"
                fill="none"
                stroke="#fff"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M17 23L19 30"
                fill="none"
                stroke="#fff"
                strokeWidth="3.2"
                strokeLinecap="round"
              >
                <animate
                  attributeName="d"
                  values="M17 23L19 30;M17 23L20 9;M17 23L20 9;M17 23L19 30"
                  keyTimes="0;.4;.7;1"
                  calcMode="spline"
                  keySplines=".4 0 .2 1;0 0 1 1;.4 0 .2 1"
                  dur="2.4s"
                  repeatCount="indefinite"
                />
              </path>
              <circle cx="14" cy="15" r="4" fill="#fff" />
              <path d="M10 14.5a4 4 0 0 1 8 0z" fill="#2b2b31" />
            </g>

            {/* Person B */}
            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0;-4 0;-4 0;0 0"
                keyTimes="0;.4;.7;1"
                calcMode="spline"
                keySplines=".4 0 .2 1;0 0 1 1;.4 0 .2 1"
                dur="2.4s"
                repeatCount="indefinite"
              />
              <path
                d="M32 32L31.5 43M36 32L36.5 43"
                fill="none"
                stroke="#2b2b31"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <rect x="29.5" y="20" width="9" height="13" rx="3.5" fill="#ffb37a" />
              <path
                d="M37 23L39 30"
                fill="none"
                stroke="#fff"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M31 23L29 30"
                fill="none"
                stroke="#fff"
                strokeWidth="3.2"
                strokeLinecap="round"
              >
                <animate
                  attributeName="d"
                  values="M31 23L29 30;M31 23L28 9;M31 23L28 9;M31 23L29 30"
                  keyTimes="0;.4;.7;1"
                  calcMode="spline"
                  keySplines=".4 0 .2 1;0 0 1 1;.4 0 .2 1"
                  dur="2.4s"
                  repeatCount="indefinite"
                />
              </path>
              <circle cx="34" cy="15" r="4" fill="#fff" />
              <path d="M30 14.5a4 4 0 0 1 8 0z" fill="#2b2b31" />
              <circle cx="38.6" cy="13.2" r="1.7" fill="#2b2b31" />
            </g>
          </svg>
          <h3>Meet your people</h3>
          <p>Make new friends, become stronger together.</p>
        </article>

        {/* ===== 3. CONNECT WITH COACHES: coach jumps with whistle ===== */}
        <article className="fm-card" tabIndex={0}>
          <svg className="fm-icon" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="25" r="21" fill="#ff5a1f" fillOpacity=".13">
              <animate attributeName="r" values="20;21.5;20" dur="1.4s" repeatCount="indefinite" />
            </circle>
            <ellipse cx="24" cy="45" rx="8" ry="1.6" fill="#000" fillOpacity=".55">
              <animate
                attributeName="rx"
                values="8;9;5;9;8"
                keyTimes="0;.15;.45;.7;1"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </ellipse>

            <g opacity="0">
              <animate
                attributeName="opacity"
                values="0;0;1;0;0"
                keyTimes="0;.35;.45;.7;1"
                dur="1.4s"
                repeatCount="indefinite"
              />
              <rect
                x="7"
                y="6"
                width="2.5"
                height="2.5"
                fill="#ff5a1f"
                transform="rotate(20 8 7)"
              />
              <rect
                x="39"
                y="8"
                width="2.5"
                height="2.5"
                fill="#fff"
                transform="rotate(-25 40 9)"
              />
              <rect x="11" y="18" width="2" height="2" fill="#ffb37a" />
              <rect x="36" y="20" width="2" height="2" fill="#ff5a1f" />
              <circle cx="33" cy="3" r="1.2" fill="#ffb37a" />
            </g>

            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0;0 1.5;0 -5;0 1.5;0 0"
                keyTimes="0;.15;.45;.7;1"
                calcMode="spline"
                keySplines=".4 0 .2 1;.3 0 .2 1;.6 0 .8 1;.4 0 .2 1"
                dur="1.4s"
                repeatCount="indefinite"
              />
              <path
                d="M21 32L20.5 43M27 32L27.5 43"
                fill="none"
                stroke="#2b2b31"
                strokeWidth="4.5"
                strokeLinecap="round"
              >
                <animate
                  attributeName="d"
                  keyTimes="0;.15;.45;.7;1"
                  calcMode="spline"
                  keySplines=".4 0 .2 1;.3 0 .2 1;.6 0 .8 1;.4 0 .2 1"
                  dur="1.4s"
                  repeatCount="indefinite"
                  values="M21 32L20.5 43M27 32L27.5 43;M21 32L19 41.5M27 32L29 41.5;M21 32L16.5 40.5M27 32L31.5 40.5;M21 32L19 41.5M27 32L29 41.5;M21 32L20.5 43M27 32L27.5 43"
                />
              </path>
              <rect x="18" y="19" width="12" height="14" rx="4" fill="#ff5a1f">
                <animate
                  attributeName="height"
                  values="14;12.5;15;12.5;14"
                  keyTimes="0;.15;.45;.7;1"
                  dur="1.4s"
                  repeatCount="indefinite"
                />
              </rect>
              <path d="M22 23h4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
              <path
                d="M19 22L16 31M29 22L32 31"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                strokeLinecap="round"
              >
                <animate
                  attributeName="d"
                  keyTimes="0;.15;.45;.7;1"
                  calcMode="spline"
                  keySplines=".4 0 .2 1;.3 0 .2 1;.6 0 .8 1;.4 0 .2 1"
                  dur="1.4s"
                  repeatCount="indefinite"
                  values="M19 22L16 31M29 22L32 31;M19 22L15 29M29 22L33 29;M19 22L13 12M29 22L35 12;M19 22L15 29M29 22L33 29;M19 22L16 31M29 22L32 31"
                />
              </path>
              <circle cx="24" cy="14" r="4.5" fill="#fff" />
              <path d="M19.5 13a4.5 4.5 0 0 1 9 0z" fill="#ff5a1f" />
              <path d="M27.5 13h4" stroke="#ff5a1f" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="21" cy="17.5" r="1.3" fill="#ffb37a" />
              <path
                d="M16 11q-2 2.5 0 5M13.5 9.5q-3.5 4 0 8"
                fill="none"
                stroke="#fff"
                strokeWidth="1.4"
                strokeLinecap="round"
              >
                <animate
                  attributeName="opacity"
                  values="1;0;1"
                  dur=".7s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </svg>
          <h3>Connect with coaches</h3>
          <p>Learn, get guidance and build valuable connections.</p>
        </article>

        {/* ===== 4. DISCOVER NEW GYMS: member walks into a gym ===== */}
        <article className="fm-card" tabIndex={0}>
          <svg className="fm-icon" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="25" r="21" fill="#ff5a1f" fillOpacity=".13">
              <animate attributeName="r" values="20;21.5;20" dur="3s" repeatCount="indefinite" />
            </circle>
            <ellipse cx="24" cy="45" rx="19" ry="1.6" fill="#000" fillOpacity=".55" />

            {/* Flag */}
            <path d="M24 10V2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M24 2q3-1 6 0t6 0v4q-3-1-6 0t-6 0z" fill="#fff">
              <animate
                attributeName="d"
                dur="1s"
                repeatCount="indefinite"
                values="M24 2q3-1 6 0t6 0v4q-3-1-6 0t-6 0z;M24 2q3 1 6 0t6 0v4q-3 1-6 0t-6 0z;M24 2q3-1 6 0t6 0v4q-3-1-6 0t-6 0z"
              />
            </path>

            {/* Building */}
            <rect x="9" y="18" width="30" height="27" rx="1.5" fill="#2b2b31" />
            <path d="M6 19.5L24 9L42 19.5z" fill="#ff5a1f" />
            <rect x="17" y="21.5" width="14" height="5" rx="1" fill="#fff" />
            <path
              d="M20.5 24h7M20.5 22.8v2.4M27.5 22.8v2.4"
              stroke="#ff5a1f"
              strokeWidth="1.4"
              strokeLinecap="round"
            />

            <rect x="12" y="29" width="5" height="5" rx=".8" fill="#ffb37a" fillOpacity=".25">
              <animate
                attributeName="fill-opacity"
                values=".25;1;1;.25"
                keyTimes="0;.2;.85;1"
                dur="3s"
                repeatCount="indefinite"
              />
            </rect>
            <rect x="31" y="29" width="5" height="5" rx=".8" fill="#ffb37a" fillOpacity=".25">
              <animate
                attributeName="fill-opacity"
                values=".25;1;1;.25"
                keyTimes="0;.2;.85;1"
                dur="3s"
                begin=".4s"
                repeatCount="indefinite"
              />
            </rect>

            {/* Doorway */}
            <rect x="20" y="33" width="8" height="12" fill="#111114" />
            <rect x="20" y="33" width="8" height="12" fill="#ffb37a">
              <animate
                attributeName="width"
                values="8;8;2;2;8;8"
                keyTimes="0;.35;.45;.62;.72;1"
                dur="3s"
                repeatCount="indefinite"
              />
            </rect>

            {/* Member jogs in */}
            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values="20 0;0 0;0 0"
                keyTimes="0;.5;1"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0;0"
                keyTimes="0;.08;.5;.6;1"
                dur="3s"
                repeatCount="indefinite"
              />
              <path
                d="M23 41l-1.5 3.5M25 41l1.5 3.5"
                fill="none"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <animate
                  attributeName="d"
                  dur=".5s"
                  repeatCount="indefinite"
                  values="M23 41l-1.5 3.5M25 41l1.5 3.5;M23 41l0 3.5M25 41l0 3.5;M23 41l-1.5 3.5M25 41l1.5 3.5"
                />
              </path>
              <rect x="21.7" y="36.5" width="4.6" height="5" rx="1.6" fill="#ff5a1f" />
              <circle cx="24" cy="34.5" r="2" fill="#fff" />
            </g>
          </svg>
          <h3>Discover new gyms</h3>
          <p>Explore different gyms, equipment &amp; fitness culture.</p>
        </article>

        {/* ===== 5. GYM & OUTDOOR: hiker climbs, flag at the peak ===== */}
        <article className="fm-card" tabIndex={0}>
          <svg className="fm-icon" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="25" r="21" fill="#ff5a1f" fillOpacity=".13">
              <animate attributeName="r" values="20;21.5;20" dur="3.5s" repeatCount="indefinite" />
            </circle>

            {/* Sun */}
            <g className="fm-rays">
              <path
                d="M40 1.5v2M40 14.5v2M32.5 9h2M45.5 9h2M34.7 3.7l1.4 1.4M43.9 12.9l1.4 1.4M45.3 3.7l-1.4 1.4M36.1 12.9l-1.4 1.4"
                stroke="#ffb37a"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </g>
            <circle cx="40" cy="9" r="3.8" fill="#ffb37a" />

            {/* Cloud */}
            <g fill="#fff" fillOpacity=".85">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0;5 0;0 0"
                dur="6s"
                repeatCount="indefinite"
              />
              <circle cx="7" cy="10" r="2.2" />
              <circle cx="10" cy="8.6" r="2.8" />
              <circle cx="13.2" cy="10" r="2.2" />
              <rect x="7" y="10" width="6.2" height="2.2" />
            </g>

            {/* Mountains */}
            <path d="M22 44L33 22L46 44z" fill="#3a3a42" />
            <path d="M3 44L20 14L37 44z" fill="#ff5a1f" />
            <path d="M20 14L15.5 22L18 20.5L20 22.5L22 20.5L24.5 22z" fill="#fff" />
            <ellipse cx="24" cy="44.5" rx="21" ry="1.4" fill="#000" fillOpacity=".55" />

            {/* Summit Flag */}
            <g opacity="0">
              <animate
                attributeName="opacity"
                values="0;0;1;1;0"
                keyTimes="0;.7;.78;.95;1"
                dur="3.5s"
                repeatCount="indefinite"
              />
              <path d="M20 14V5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M20 5l6 2l-6 2z" fill="#fff" />
            </g>

            {/* Hiker */}
            <g>
              <animateMotion
                path="M6.5 34.8L18 14.5"
                keyTimes="0;1"
                keyPoints="0;1"
                dur="3.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;1;0;0"
                keyTimes="0;.68;.75;1"
                dur="3.5s"
                repeatCount="indefinite"
              />
              <path
                d="M-.6 0l-1.2 3M.6 0l1.2 3"
                fill="none"
                stroke="#fff"
                strokeWidth="1.3"
                strokeLinecap="round"
              >
                <animate
                  attributeName="d"
                  dur=".5s"
                  repeatCount="indefinite"
                  values="M-.6 0l-1.2 3M.6 0l1.2 3;M-.6 0l0 3M.6 0l0 3;M-.6 0l-1.2 3M.6 0l1.2 3"
                />
              </path>
              <rect x="-3.4" y="-4.2" width="2" height="3.4" rx=".6" fill="#ffb37a" />
              <rect x="-1.3" y="-4.6" width="2.6" height="4.8" rx="1" fill="#2b2b31" />
              <circle cx="0" cy="-6.4" r="1.8" fill="#fff" />
            </g>
          </svg>
          <h3>Gym &amp; outdoor experiences</h3>
          <p>From top gyms to open-air sessions — experience it all.</p>
        </article>
      </section>
    </>
  );
};
