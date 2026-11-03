import React, { useState, useEffect, useRef, useCallback } from 'react';

interface HeroActivitySceneProps {
  onCoachTap?: () => void;
  displayInStage?: boolean;
}

const COACH_PHRASES = ['LET’S GO!', 'SUNDAY?', 'JOIN US!', 'ONE MORE REP!'];

export const HeroActivityScene: React.FC<HeroActivitySceneProps> = ({
  onCoachTap,
  displayInStage = false,
}) => {
  const [viewBox, setViewBox] = useState(displayInStage ? '720 0 640 560' : '0 0 1600 560');
  const [preserveAspectRatio, setPreserveAspectRatio] = useState(
    displayInStage ? 'xMidYMax slice' : 'xMaxYMax meet'
  );
  const [isHop, setIsHop] = useState(false);
  const [sayOn, setSayOn] = useState(false);
  const [coachText, setCoachText] = useState(COACH_PHRASES[0]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showTapHint, setShowTapHint] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Responsive viewBox adjustment matching the original script
  useEffect(() => {
    if (displayInStage) return;

    const mq = window.matchMedia('(max-width: 900px)');
    const handleResize = () => {
      if (mq.matches) {
        setViewBox('720 0 640 560');
        setPreserveAspectRatio('xMidYMax slice');
      } else {
        setViewBox('0 0 1600 560');
        setPreserveAspectRatio('xMaxYMax meet');
      }
    };

    handleResize();
    mq.addEventListener('change', handleResize);
    return () => mq.removeEventListener('change', handleResize);
  }, [displayInStage]);

  const handleCoachClick = useCallback(() => {
    // Retrigger hop animation
    setIsHop(false);
    requestAnimationFrame(() => {
      setIsHop(true);
    });

    // Update coach dialogue
    const nextPhrase = COACH_PHRASES[phraseIndex % COACH_PHRASES.length];
    setCoachText(nextPhrase);
    setPhraseIndex((prev) => prev + 1);
    setSayOn(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSayOn(false);
      setIsHop(false);
    }, 1300);

    // Hide tap hint after first interaction
    setShowTapHint(false);

    // Haptic feedback if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(20);
      } catch {
        // Ignore on unsupported browsers
      }
    }

    // Call parent handler (e.g. for confetti burst)
    if (onCoachTap) {
      onCoachTap();
    }
  }, [phraseIndex, onCoachTap]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCoachClick();
      }
    },
    [handleCoachClick]
  );

  return (
    <svg
      className={
        displayInStage
          ? 'hero-live-scene absolute inset-0 w-full h-full z-0 pointer-events-none select-none'
          : 'hero-live-scene absolute left-0 right-0 top-[26vh] lg:top-[16vh] xl:top-[20vh] w-full h-[74vh] lg:h-[84vh] xl:h-[80vh] z-0 pointer-events-none select-none max-lg:top-auto max-lg:bottom-0 max-lg:h-[420px]'
      }
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="fm-sg" cx="66%" cy="85%" r="55%">
          <stop offset="0" stopColor="#ff5a1f" stopOpacity=".3" />
          <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fm-bm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff5a1f" stopOpacity=".22" />
          <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Pulsing ground glow */}
      <rect width="1600" height="560" fill="url(#fm-sg)">
        <animate attributeName="opacity" values="1;.6;1" dur=".7s" repeatCount="indefinite" />
      </rect>

      {/* Rotating spotlight beams */}
      <g>
        <polygon points="1050,-20 960,560 1180,560" fill="url(#fm-bm)">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-14 1050 -20;14 1050 -20;-14 1050 -20"
            dur="7s"
            repeatCount="indefinite"
          />
        </polygon>
        <polygon points="1350,-20 1250,560 1460,560" fill="url(#fm-bm)">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="12 1350 -20;-12 1350 -20;12 1350 -20"
            dur="8s"
            repeatCount="indefinite"
          />
        </polygon>
      </g>

      {/* Crowd silhouette in background */}
      <g opacity=".55">
        <g transform="translate(-10 514) scale(1.72)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="0.98s"
              begin="-0.60s"
              repeatCount="indefinite"
            />
            <path d="M-6 6L-9 -6M6 6L9 -6" stroke="#2a2b31" strokeWidth="3" strokeLinecap="round">
              <animate
                attributeName="d"
                values="M-6 6L-9 -6M6 6L9 -6;M-6 6L-11 -2M6 6L11 -2;M-6 6L-9 -6M6 6L9 -6"
                dur="0.9849775832740397s"
                begin="-0.60s"
                repeatCount="indefinite"
              />
            </path>
            <circle cx="-9" cy="-6" r="1.4" fill="#ff5a1f" />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(81 514) scale(1.53)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="0.81s"
              begin="-0.84s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(143 514) scale(1.59)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.30s"
              begin="-0.47s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(242 514) scale(1.69)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.12s"
              begin="-0.15s"
              repeatCount="indefinite"
            />
            <path d="M-6 6L-9 -6M6 6L9 -6" stroke="#2a2b31" strokeWidth="3" strokeLinecap="round">
              <animate
                attributeName="d"
                values="M-6 6L-9 -6M6 6L9 -6;M-6 6L-11 -2M6 6L11 -2;M-6 6L-9 -6M6 6L9 -6"
                dur="1.119534070272081s"
                begin="-0.15s"
                repeatCount="indefinite"
              />
            </path>
            <circle cx="-9" cy="-6" r="1.4" fill="#ff5a1f" />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(310 514) scale(1.85)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.06s"
              begin="-0.74s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(388 514) scale(1.53)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.18s"
              begin="-0.59s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(449 514) scale(1.51)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.23s"
              begin="-0.47s"
              repeatCount="indefinite"
            />
            <path d="M-6 6L-9 -6M6 6L9 -6" stroke="#2a2b31" strokeWidth="3" strokeLinecap="round">
              <animate
                attributeName="d"
                values="M-6 6L-9 -6M6 6L9 -6;M-6 6L-11 -2M6 6L11 -2;M-6 6L-9 -6M6 6L9 -6"
                dur="1.2327636184894728s"
                begin="-0.47s"
                repeatCount="indefinite"
              />
            </path>
            <circle cx="-9" cy="-6" r="1.4" fill="#ff5a1f" />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(542 514) scale(1.85)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.16s"
              begin="-0.92s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(605 514) scale(1.82)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.02s"
              begin="-0.94s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(701 514) scale(1.54)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="0.87s"
              begin="-0.22s"
              repeatCount="indefinite"
            />
            <path d="M-6 6L-9 -6M6 6L9 -6" stroke="#2a2b31" strokeWidth="3" strokeLinecap="round">
              <animate
                attributeName="d"
                values="M-6 6L-9 -6M6 6L9 -6;M-6 6L-11 -2M6 6L11 -2;M-6 6L-9 -6M6 6L9 -6"
                dur="0.8679844301003345s"
                begin="-0.22s"
                repeatCount="indefinite"
              />
            </path>
            <circle cx="-9" cy="-6" r="1.4" fill="#ff5a1f" />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(781 514) scale(1.67)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.11s"
              begin="-0.30s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(838 514) scale(1.65)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="0.98s"
              begin="-0.59s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(918 514) scale(1.86)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.14s"
              begin="-0.93s"
              repeatCount="indefinite"
            />
            <path d="M-6 6L-9 -6M6 6L9 -6" stroke="#2a2b31" strokeWidth="3" strokeLinecap="round">
              <animate
                attributeName="d"
                values="M-6 6L-9 -6M6 6L9 -6;M-6 6L-11 -2M6 6L11 -2;M-6 6L-9 -6M6 6L9 -6"
                dur="1.1409910683174833s"
                begin="-0.93s"
                repeatCount="indefinite"
              />
            </path>
            <circle cx="-9" cy="-6" r="1.4" fill="#ff5a1f" />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(1005 514) scale(1.90)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.14s"
              begin="-0.16s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(1081 514) scale(1.89)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.25s"
              begin="-0.57s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(1151 514) scale(1.58)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.22s"
              begin="-0.57s"
              repeatCount="indefinite"
            />
            <path d="M-6 6L-9 -6M6 6L9 -6" stroke="#2a2b31" strokeWidth="3" strokeLinecap="round">
              <animate
                attributeName="d"
                values="M-6 6L-9 -6M6 6L9 -6;M-6 6L-11 -2M6 6L11 -2;M-6 6L-9 -6M6 6L9 -6"
                dur="1.2158039651366772s"
                begin="-0.57s"
                repeatCount="indefinite"
              />
            </path>
            <circle cx="-9" cy="-6" r="1.4" fill="#ff5a1f" />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(1210 514) scale(1.53)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.23s"
              begin="-0.99s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(1279 514) scale(1.82)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.01s"
              begin="-0.15s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(1363 514) scale(1.81)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.24s"
              begin="-0.04s"
              repeatCount="indefinite"
            />
            <path d="M-6 6L-9 -6M6 6L9 -6" stroke="#2a2b31" strokeWidth="3" strokeLinecap="round">
              <animate
                attributeName="d"
                values="M-6 6L-9 -6M6 6L9 -6;M-6 6L-11 -2M6 6L11 -2;M-6 6L-9 -6M6 6L9 -6"
                dur="1.2363835123141007s"
                begin="-0.04s"
                repeatCount="indefinite"
              />
            </path>
            <circle cx="-9" cy="-6" r="1.4" fill="#ff5a1f" />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(1452 514) scale(1.52)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.16s"
              begin="-0.33s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(1539 514) scale(1.89)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.05s"
              begin="-1.00s"
              repeatCount="indefinite"
            />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
        <g transform="translate(1592 514) scale(1.53)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -2;0 0"
              dur="1.10s"
              begin="-0.03s"
              repeatCount="indefinite"
            />
            <path d="M-6 6L-9 -6M6 6L9 -6" stroke="#2a2b31" strokeWidth="3" strokeLinecap="round">
              <animate
                attributeName="d"
                values="M-6 6L-9 -6M6 6L9 -6;M-6 6L-11 -2M6 6L11 -2;M-6 6L-9 -6M6 6L9 -6"
                dur="1.0998814043983005s"
                begin="-0.03s"
                repeatCount="indefinite"
              />
            </path>
            <circle cx="-9" cy="-6" r="1.4" fill="#ff5a1f" />
            <rect x="-7" y="4" width="14" height="14" rx="6" fill="#1c1d22" />
            <circle r="5.5" fill="#24252b" />
          </g>
        </g>
      </g>

      {/* Runway track base */}
      <rect x="0" y="520" width="1600" height="40" fill="#0d0e11" />
      <path d="M0 521H1600" stroke="#ff5a1f" strokeOpacity=".35" strokeWidth="2" />
      <ellipse cx="1060" cy="526" rx="520" ry="16" fill="#ff5a1f" fillOpacity=".14">
        <animate
          attributeName="fill-opacity"
          values=".18;.06;.18"
          dur=".7s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Track perspective lines */}
      <g stroke="#ffffff0a" strokeWidth="2">
        <path d="M10 520L-1160 560" />
        <path d="M120 520L-920 560" />
        <path d="M230 520L-680 560" />
        <path d="M340 520L-440 560" />
        <path d="M450 520L-200 560" />
        <path d="M560 520L40 560" />
        <path d="M670 520L280 560" />
        <path d="M780 520L520 560" />
        <path d="M890 520L760 560" />
        <path d="M1000 520L1000 560" />
        <path d="M1110 520L1240 560" />
        <path d="M1220 520L1480 560" />
        <path d="M1330 520L1720 560" />
        <path d="M1440 520L1960 560" />
        <path d="M1550 520L2200 560" />
        <path d="M1660 520L2440 560" />
        <path d="M1770 520L2680 560" />
      </g>

      {/* Scenery trees */}
      <g transform="translate(606.4 344.5) scale(3.9)">
        <rect x="22.5" y="30" width="3" height="15" fill="#2a2420" />
        <circle cx="24" cy="22" r="10" fill="#22302a" />
        <circle cx="17" cy="27" r="6.5" fill="#22302a" />
        <circle cx="31" cy="27" r="6.5" fill="#22302a" />
      </g>
      <g transform="translate(1492.4 322.0) scale(4.4)">
        <rect x="22.5" y="30" width="3" height="15" fill="#2a2420" />
        <circle cx="24" cy="22" r="10" fill="#22302a" />
        <circle cx="17" cy="27" r="6.5" fill="#22302a" />
        <circle cx="31" cy="27" r="6.5" fill="#22302a" />
      </g>

      {/* Gym building in background */}
      <g transform="translate(1444.8 304.0) scale(4.8)">
        <rect x="9" y="18" width="30" height="27" rx="1.5" fill="#1d1e23" />
        <path d="M6 19.5L24 9L42 19.5z" fill="#ff5a1f" fillOpacity=".85" />
        <rect x="17" y="21.5" width="14" height="5" rx="1" fill="#e8e8ec" />
        <path
          d="M20.5 24h7M20.5 22.8v2.4M27.5 22.8v2.4"
          stroke="#ff5a1f"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <rect x="12" y="29" width="5" height="5" rx=".8" fill="#ffb37a" fillOpacity=".3">
          <animate
            attributeName="fill-opacity"
            values=".3;1;1;.3"
            keyTimes="0;.2;.85;1"
            dur="3s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="31" y="29" width="5" height="5" rx=".8" fill="#ffb37a" fillOpacity=".3">
          <animate
            attributeName="fill-opacity"
            values=".3;1;1;.3"
            keyTimes="0;.2;.85;1"
            dur="3s"
            begin=".5s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="20" y="33" width="8" height="12" fill="#ffb37a" fillOpacity=".85" />
        <path d="M24 9V2" stroke="#c9c9cf" strokeWidth="1" />
        <path d="M24 2q3-1 6 0t6 0v4q-3-1-6 0t-6 0z" fill="#e8e8ec">
          <animate
            attributeName="d"
            dur="1s"
            repeatCount="indefinite"
            values="M24 2q3-1 6 0t6 0v4q-3-1-6 0t-6 0z;M24 2q3 1 6 0t6 0v4q-3 1-6 0t-6 0z;M24 2q3-1 6 0t6 0v4q-3-1-6 0t-6 0z"
          />
        </path>
      </g>

      {/* Runner 1 (Orange shirt) */}
      <g stroke="#ffffff30" strokeWidth="3" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="-180 0;1800 0"
          dur="10s"
          begin="0s"
          repeatCount="indefinite"
        />
        <path d="M-10 460h-40M-6 485h-55M-14 435h-30" />
      </g>
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="-180 0;1800 0"
          dur="10s"
          begin="0s"
          repeatCount="indefinite"
        />
        <g transform="translate(0 385.0) scale(3.0)">
          <ellipse cx="24" cy="45" rx="7" ry="1.3" fill="#000" fillOpacity=".45" />
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -1.5;0 0"
              dur=".55s"
              repeatCount="indefinite"
            />
            <path
              d="M24 31L19 37L16 43M24 31L28 37L31 42"
              fill="none"
              stroke="#2b2b31"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animate
                attributeName="d"
                dur=".55s"
                repeatCount="indefinite"
                values="M24 31L19 37L16 43M24 31L28 37L31 42;M24 31L28 37L31 42M24 31L19 37L16 43;M24 31L19 37L16 43M24 31L28 37L31 42"
              />
            </path>
            <rect
              x="20"
              y="19"
              width="9"
              height="13"
              rx="3.5"
              fill="#ff5a1f"
              transform="rotate(8 24 25)"
            />
            <path
              d="M22 22L18 27L21 30M27 22L31 26L34 23"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animate
                attributeName="d"
                dur=".55s"
                repeatCount="indefinite"
                values="M22 22L18 27L21 30M27 22L31 26L34 23;M22 22L26 27L29 24M27 22L23 27L20 30;M22 22L18 27L21 30M27 22L31 26L34 23"
              />
            </path>
            <circle cx="26" cy="14" r="4" fill="#fff" />
            <path d="M22 13.5a4 4 0 0 1 8 0z" fill="#2b2b31" />
          </g>
        </g>
      </g>

      {/* Runner 2 (White shirt, staggered) */}
      <g stroke="#ffffff30" strokeWidth="3" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="-180 0;1800 0"
          dur="10s"
          begin="-5s"
          repeatCount="indefinite"
        />
        <path d="M-10 460h-40M-6 485h-55M-14 435h-30" />
      </g>
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="-180 0;1800 0"
          dur="10s"
          begin="-5s"
          repeatCount="indefinite"
        />
        <g transform="translate(0 385.0) scale(3.0)">
          <ellipse cx="24" cy="45" rx="7" ry="1.3" fill="#000" fillOpacity=".45" />
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 -1.5;0 0"
              dur=".55s"
              repeatCount="indefinite"
            />
            <path
              d="M24 31L19 37L16 43M24 31L28 37L31 42"
              fill="none"
              stroke="#2b2b31"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animate
                attributeName="d"
                dur=".55s"
                repeatCount="indefinite"
                values="M24 31L19 37L16 43M24 31L28 37L31 42;M24 31L28 37L31 42M24 31L19 37L16 43;M24 31L19 37L16 43M24 31L28 37L31 42"
              />
            </path>
            <rect
              x="20"
              y="19"
              width="9"
              height="13"
              rx="3.5"
              fill="#e8e8ec"
              transform="rotate(8 24 25)"
            />
            <path
              d="M22 22L18 27L21 30M27 22L31 26L34 23"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animate
                attributeName="d"
                dur=".55s"
                repeatCount="indefinite"
                values="M22 22L18 27L21 30M27 22L31 26L34 23;M22 22L26 27L29 24M27 22L23 27L20 30;M22 22L18 27L21 30M27 22L31 26L34 23"
              />
            </path>
            <circle cx="26" cy="14" r="4" fill="#fff" />
            <path d="M22 13.5a4 4 0 0 1 8 0z" fill="#2b2b31" />
          </g>
        </g>
      </g>

      {/* Jump roper athlete */}
      <g transform="translate(670.6 380.5) scale(3.1)">
        <ellipse cx="24" cy="45" rx="6" ry="1.3" fill="#000" fillOpacity=".5">
          <animate attributeName="rx" values="6;4;6" dur=".5s" repeatCount="indefinite" />
        </ellipse>
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;0 -4;0 0"
            dur=".5s"
            repeatCount="indefinite"
          />
          <path d="M14 26Q24 50 34 26" fill="none" stroke="#ffb37a" strokeWidth="1.2">
            <animate
              attributeName="d"
              values="M14 26Q24 50 34 26;M14 26Q24 -6 34 26;M14 26Q24 50 34 26"
              dur=".5s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M22 32L21.5 42M26 32L26.5 42"
            fill="none"
            stroke="#2b2b31"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect x="19" y="20" width="10" height="13" rx="3.5" fill="#ff8a50" />
          <path
            d="M20 23L15 27M28 23L33 27"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="24" cy="15" r="4" fill="#fff" />
          <path d="M20 14.5a4 4 0 0 1 8 0z" fill="#2b2b31" />
        </g>
      </g>

      {/* Squats/Jumping jacks athlete 1 */}
      <g transform="translate(780.8 371.5) scale(3.3)">
        <ellipse cx="24" cy="45" rx="7" ry="1.4" fill="#000" fillOpacity=".5">
          <animate
            attributeName="rx"
            values="7;8;4.5;8;7"
            keyTimes="0;.15;.45;.7;1"
            dur="1.4s"
            begin="-0.25s"
            repeatCount="indefinite"
          />
        </ellipse>
        <g className="fm-cbody">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 1.5;0 -5;0 1.5;0 0"
              keyTimes="0;.15;.45;.7;1"
              calcMode="spline"
              keySplines=".4 0 .2 1;.3 0 .2 1;.6 0 .8 1;.4 0 .2 1"
              dur="1.4s"
              begin="-0.25s"
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
                begin="-0.25s"
                repeatCount="indefinite"
                values="M21 32L20.5 43M27 32L27.5 43;M21 32L19 41.5M27 32L29 41.5;M21 32L16.5 40.5M27 32L31.5 40.5;M21 32L19 41.5M27 32L29 41.5;M21 32L20.5 43M27 32L27.5 43"
              />
            </path>
            <rect x="18" y="19" width="12" height="14" rx="4" fill="#ffb37a" />
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
                begin="-0.25s"
                repeatCount="indefinite"
                values="M19 22L16 31M29 22L32 31;M19 22L15 29M29 22L33 29;M19 22L13 12M29 22L35 12;M19 22L15 29M29 22L33 29;M19 22L16 31M29 22L32 31"
              />
            </path>
            <circle cx="24" cy="14" r="4.5" fill="#fff" />
            <path d="M19.5 13.5a4.5 4.5 0 0 1 9 0z" fill="#2b2b31" />
          </g>
        </g>
        {/* Foot dust circles */}
        <g fill="#c9c9cf" fillOpacity="0">
          <circle cx="19" cy="44" r="1">
            <animate
              attributeName="r"
              values="0;0;3;3"
              keyTimes="0;0.45;0.7;1"
              dur="1.4s"
              begin="-0.25s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill-opacity"
              values="0;.5;0;0"
              keyTimes="0;0.45;0.7;1"
              dur="1.4s"
              begin="-0.25s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values="19;19;12.0;12.0"
              keyTimes="0;0.45;0.7;1"
              dur="1.4s"
              begin="-0.25s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="29" cy="44" r="1">
            <animate
              attributeName="r"
              values="0;0;3;3"
              keyTimes="0;0.45;0.7;1"
              dur="1.4s"
              begin="-0.25s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill-opacity"
              values="0;.5;0;0"
              keyTimes="0;0.45;0.7;1"
              dur="1.4s"
              begin="-0.25s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values="29;29;36.0;36.0"
              keyTimes="0;0.45;0.7;1"
              dur="1.4s"
              begin="-0.25s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>

      {/* Squats/Jumping jacks athlete 2 (White shirt) */}
      <g transform="translate(875.8 371.5) scale(3.3)">
        <ellipse cx="24" cy="45" rx="7" ry="1.4" fill="#000" fillOpacity=".5">
          <animate
            attributeName="rx"
            values="7;8;4.5;8;7"
            keyTimes="0;.15;.45;.7;1"
            dur="1.4s"
            begin="-0.45s"
            repeatCount="indefinite"
          />
        </ellipse>
        <g className="fm-cbody">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 1.5;0 -5;0 1.5;0 0"
              keyTimes="0;.15;.45;.7;1"
              calcMode="spline"
              keySplines=".4 0 .2 1;.3 0 .2 1;.6 0 .8 1;.4 0 .2 1"
              dur="1.4s"
              begin="-0.45s"
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
                begin="-0.45s"
                repeatCount="indefinite"
                values="M21 32L20.5 43M27 32L27.5 43;M21 32L19 41.5M27 32L29 41.5;M21 32L16.5 40.5M27 32L31.5 40.5;M21 32L19 41.5M27 32L29 41.5;M21 32L20.5 43M27 32L27.5 43"
              />
            </path>
            <rect x="18" y="19" width="12" height="14" rx="4" fill="#e8e8ec" />
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
                begin="-0.45s"
                repeatCount="indefinite"
                values="M19 22L16 31M29 22L32 31;M19 22L15 29M29 22L33 29;M19 22L13 12M29 22L35 12;M19 22L15 29M29 22L33 29;M19 22L16 31M29 22L32 31"
              />
            </path>
            <circle cx="24" cy="14" r="4.5" fill="#fff" />
            <path d="M19.5 13.5a4.5 4.5 0 0 1 9 0z" fill="#2b2b31" />
          </g>
        </g>
        <g fill="#c9c9cf" fillOpacity="0">
          <circle cx="19" cy="44" r="1">
            <animate
              attributeName="r"
              values="0;0;3;3"
              keyTimes="0;0.45;0.7;1"
              dur="1.4s"
              begin="-0.45s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill-opacity"
              values="0;.5;0;0"
              keyTimes="0;0.45;0.7;1"
              dur="1.4s"
              begin="-0.45s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values="19;19;12.0;12.0"
              keyTimes="0;0.45;0.7;1"
              dur="1.4s"
              begin="-0.45s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="29" cy="44" r="1">
            <animate
              attributeName="r"
              values="0;0;3;3"
              keyTimes="0;0.45;0.7;1"
              dur="1.4s"
              begin="-0.45s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill-opacity"
              values="0;.5;0;0"
              keyTimes="0;0.45;0.7;1"
              dur="1.4s"
              begin="-0.45s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cx"
              values="29;29;36.0;36.0"
              keyTimes="0;0.45;0.7;1"
              dur="1.4s"
              begin="-0.45s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>

      {/* Box jump athlete */}
      <g transform="translate(1125.8 371.5) scale(3.3)">
        <rect
          x="27"
          y="33"
          width="17"
          height="12"
          rx="1.5"
          fill="#26272d"
          stroke="#ff5a1f"
          strokeWidth=".8"
        />
        <path d="M29 37h13" stroke="#ff5a1f" strokeWidth=".8" opacity=".6" />
        <ellipse cx="18" cy="45" rx="6" ry="1.3" fill="#000" fillOpacity=".5">
          <animate
            attributeName="cx"
            values="18;18;26;35;35;18;18"
            keyTimes="0;.18;.38;.5;.75;.88;1"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </ellipse>
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 2;0 2;8 -16;17 -12;17 -12;0 0;0 2"
            keyTimes="0;.18;.38;.5;.75;.88;1"
            dur="2.2s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines=".4 0 .2 1;.2 .8 .4 1;.5 0 .7 1;0 0 1 1;.4 0 .6 1;.4 0 .2 1"
          />
          <g transform="translate(-6 0)">
            <path
              d="M21 31L20 37L20.5 43M27 31L28 37L27.5 43"
              fill="none"
              stroke="#2b2b31"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animate
                attributeName="d"
                keyTimes="0;.18;.38;.5;.75;.88;1"
                dur="2.2s"
                repeatCount="indefinite"
                values="M21 31L16 36L20.5 43M27 31L32 36L27.5 43;M21 31L16 36L20.5 43M27 31L32 36L27.5 43;M21 31L18 38L17 42M27 31L30 38L31 42;M21 31L20 37L20.5 43M27 31L28 37L27.5 43;M21 31L20 37L20.5 43M27 31L28 37L27.5 43;M21 31L20 37L20.5 43M27 31L28 37L27.5 43;M21 31L16 36L20.5 43M27 31L32 36L27.5 43"
              />
            </path>
            <rect x="18" y="19" width="12" height="13" rx="4" fill="#ff8a50" />
            <path
              d="M19 22L15 29M29 22L33 29"
              fill="none"
              stroke="#fff"
              strokeWidth="3.6"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                keyTimes="0;.18;.38;.5;.75;.88;1"
                dur="2.2s"
                repeatCount="indefinite"
                values="M19 22L14 30M29 22L34 30;M19 22L14 30M29 22L34 30;M19 22L14 11M29 22L34 11;M19 22L16 30M29 22L32 30;M19 22L16 30M29 22L32 30;M19 22L16 30M29 22L32 30;M19 22L14 30M29 22L34 30"
              />
            </path>
            <circle cx="24" cy="14" r="4.3" fill="#fff" />
            <path d="M19.7 13.5a4.3 4.3 0 0 1 8.6 0z" fill="#2b2b31" />
          </g>
        </g>
      </g>

      {/* High-five workout buddies */}
      <g transform="translate(1240.6 380.5) scale(3.1)">
        <ellipse cx="24" cy="44.5" rx="15" ry="1.5" fill="#000" fillOpacity=".5" />
        <g opacity="0">
          <animate
            attributeName="opacity"
            values="0;0;1;0;0"
            keyTimes="0;.38;.45;.72;1"
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
        </g>
        {/* Person 1 */}
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
          <path d="M11 23L9 30" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M17 23L19 30" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round">
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
        {/* Person 2 */}
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
          <rect x="29.5" y="20" width="9" height="13" rx="3.5" fill="#e8e8ec" />
          <path
            d="M37 23L39 30"
            fill="none"
            stroke="#fff"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path d="M31 23L29 30" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round">
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
      </g>

      {/* Barbell lifter */}
      <g transform="translate(1338.4 367.0) scale(3.4)">
        <ellipse cx="24" cy="44.5" rx="9" ry="1.5" fill="#000" fillOpacity=".5" />
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
            dur="1.8s"
            begin="0s"
            calcMode="spline"
            keySplines=".4 0 .2 1;.4 0 .2 1"
            repeatCount="indefinite"
            values="M21 31L20.5 37L20.5 43M27 31L27.5 37L27.5 43;M21 37L16 38.5L20.5 43M27 37L32 38.5L27.5 43;M21 31L20.5 37L20.5 43M27 31L27.5 37L27.5 43"
          />
        </path>
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0;0 6;0 0"
            dur="1.8s"
            begin="0s"
            calcMode="spline"
            keySplines=".4 0 .2 1;.4 0 .2 1"
            repeatCount="indefinite"
          />
          <path d="M7 18H41" stroke="#c9c9cf" strokeWidth="2" strokeLinecap="round" />
          <rect x="7" y="12.5" width="4" height="11" rx="1.2" fill="#ff5a1f" />
          <rect x="37" y="12.5" width="4" height="11" rx="1.2" fill="#ff5a1f" />
          <rect x="18" y="19" width="12" height="13" rx="4" fill="#ffb37a" />
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
      </g>

      {/* Battle ropes athlete */}
      <g transform="translate(1443.2 376.0) scale(3.2)">
        <rect x="44" y="30" width="3" height="15" rx="1" fill="#3a3b42" />
        <path
          d="M18 30Q26 24 32 30T46 31"
          fill="none"
          stroke="#ffb37a"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            dur=".6s"
            repeatCount="indefinite"
            values="M18 30Q26 24 32 30T46 31;M18 30Q26 36 32 30T46 31;M18 30Q26 24 32 30T46 31"
          />
        </path>
        <path
          d="M18 32Q26 38 32 32T46 33"
          fill="none"
          stroke="#ff5a1f"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            dur=".6s"
            repeatCount="indefinite"
            values="M18 32Q26 38 32 32T46 33;M18 32Q26 26 32 32T46 33;M18 32Q26 38 32 32T46 33"
          />
        </path>
        <ellipse cx="16" cy="45" rx="7" ry="1.4" fill="#000" fillOpacity=".5" />
        <path
          d="M13 32L9 38L10 44M19 32L22 38L21 44"
          fill="none"
          stroke="#2b2b31"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="10"
          y="20"
          width="11"
          height="13"
          rx="4"
          fill="#e8e8ec"
          transform="rotate(8 15 26)"
        />
        <path
          d="M17 23L19 30M15 23L18 32"
          fill="none"
          stroke="#fff"
          strokeWidth="3.4"
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            dur=".6s"
            repeatCount="indefinite"
            values="M17 23L19 30M15 23L18 32;M17 23L19 26M15 23L18 34;M17 23L19 30M15 23L18 32"
          />
        </path>
        <circle cx="16" cy="15" r="4.3" fill="#fff" />
        <rect x="11.8" y="12.2" width="8.6" height="2" rx="1" fill="#ff5a1f" />
      </g>

      {/* THE COACH (Interactive) */}
      <g
        id="orb"
        className={`fm-orb pointer-events-auto cursor-pointer focus-visible:outline-none ${isHop ? 'hop' : ''}`}
        tabIndex={0}
        role="button"
        aria-label="Tap the coach"
        onClick={(event) => {
          event.stopPropagation();
          handleCoachClick();
        }}
        onKeyDown={handleKeyDown}
      >
        <g transform="translate(969.4 322.0) scale(4.4)">
          <ellipse cx="24" cy="45" rx="7" ry="1.4" fill="#000" fillOpacity=".5">
            <animate
              attributeName="rx"
              values="7;8;4.5;8;7"
              keyTimes="0;.15;.45;.7;1"
              dur="1.4s"
              begin="0s"
              repeatCount="indefinite"
            />
          </ellipse>
          <g className="fm-cbody">
            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0;0 1.5;0 -5;0 1.5;0 0"
                keyTimes="0;.15;.45;.7;1"
                calcMode="spline"
                keySplines=".4 0 .2 1;.3 0 .2 1;.6 0 .8 1;.4 0 .2 1"
                dur="1.4s"
                begin="0s"
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
                  begin="0s"
                  repeatCount="indefinite"
                  values="M21 32L20.5 43M27 32L27.5 43;M21 32L19 41.5M27 32L29 41.5;M21 32L16.5 40.5M27 32L31.5 40.5;M21 32L19 41.5M27 32L29 41.5;M21 32L20.5 43M27 32L27.5 43"
                />
              </path>
              <rect x="18" y="19" width="12" height="14" rx="4" fill="#ff5a1f" />
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
                  begin="0s"
                  repeatCount="indefinite"
                  values="M19 22L16 31M29 22L32 31;M19 22L15 29M29 22L33 29;M19 22L13 12M29 22L35 12;M19 22L15 29M29 22L33 29;M19 22L16 31M29 22L32 31"
                />
              </path>
              <circle cx="24" cy="14" r="4.5" fill="#fff" />
              <path d="M19.5 13a4.5 4.5 0 0 1 9 0z" fill="#ff5a1f" />
              <path d="M27.5 13h4" stroke="#ff5a1f" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="21" cy="17.5" r="1.3" fill="#ffb37a" />
              {/* Whistle soundwaves */}
              <path
                d="M16 11q-2 2.5 0 5M13.5 9.5q-3.5 4 0 8"
                fill="none"
                stroke="#fff"
                strokeWidth="1.2"
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
          </g>
          <g fill="#c9c9cf" fillOpacity="0">
            <circle cx="19" cy="44" r="1">
              <animate
                attributeName="r"
                values="0;0;3;3"
                keyTimes="0;0.45;0.7;1"
                dur="1.4s"
                begin="0s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill-opacity"
                values="0;.5;0;0"
                keyTimes="0;0.45;0.7;1"
                dur="1.4s"
                begin="0s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cx"
                values="19;19;12.0;12.0"
                keyTimes="0;0.45;0.7;1"
                dur="1.4s"
                begin="0s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="29" cy="44" r="1">
              <animate
                attributeName="r"
                values="0;0;3;3"
                keyTimes="0;0.45;0.7;1"
                dur="1.4s"
                begin="0s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill-opacity"
                values="0;.5;0;0"
                keyTimes="0;0.45;0.7;1"
                dur="1.4s"
                begin="0s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cx"
                values="29;29;36.0;36.0"
                keyTimes="0;0.45;0.7;1"
                dur="1.4s"
                begin="0s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </g>

        {/* Coach Speech Bubble */}
        <g
          id="say"
          className="fm-say transition-opacity duration-200 pointer-events-none"
          style={{ opacity: sayOn ? 1 : 0 }}
        >
          <rect x="1090" y="250" width="180" height="56" rx="16" fill="#fff" />
          <path d="M1110 304l-6 16 22-16z" fill="#fff" />
          <text
            id="sayT"
            x="1180"
            y="288"
            textAnchor="middle"
            fontFamily="Barlow Condensed, Arial Narrow, sans-serif"
            fontWeight="800"
            fontSize="30"
            fill="#0b0b0d"
          >
            {coachText}
          </text>
        </g>
      </g>

      {/* Floating Emoji Reactions */}
      <g opacity="0" transform="translate(1420 250)">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.08;.4;.5;1"
          dur="3.2s"
          begin="0.6s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1420 250;1420 226;1420 226"
          keyTimes="0;.5;1"
          dur="3.2s"
          begin="0.6s"
          repeatCount="indefinite"
        />
        <circle r="26" fill="#141519" stroke="#2a2b31" strokeWidth="2" />
        <text y="10" textAnchor="middle" fontSize="28">
          🔥
        </text>
      </g>
      <g opacity="0" transform="translate(1315 280)">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.08;.4;.5;1"
          dur="3.2s"
          begin="2.0s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1315 280;1315 256;1315 256"
          keyTimes="0;.5;1"
          dur="3.2s"
          begin="2.0s"
          repeatCount="indefinite"
        />
        <circle r="26" fill="#141519" stroke="#2a2b31" strokeWidth="2" />
        <text y="10" textAnchor="middle" fontSize="28">
          🙌
        </text>
      </g>
      <g opacity="0" transform="translate(905 290)">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.08;.4;.5;1"
          dur="3.2s"
          begin="1.3s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="905 290;905 266;905 266"
          keyTimes="0;.5;1"
          dur="3.2s"
          begin="1.3s"
          repeatCount="indefinite"
        />
        <circle r="26" fill="#141519" stroke="#2a2b31" strokeWidth="2" />
        <text y="10" textAnchor="middle" fontSize="28">
          💪
        </text>
      </g>
      <g opacity="0" transform="translate(1205 230)">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.08;.4;.5;1"
          dur="3.2s"
          begin="2.6s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1205 230;1205 206;1205 206"
          keyTimes="0;.5;1"
          dur="3.2s"
          begin="2.6s"
          repeatCount="indefinite"
        />
        <circle r="26" fill="#141519" stroke="#2a2b31" strokeWidth="2" />
        <text y="10" textAnchor="middle" fontSize="28">
          ⚡
        </text>
      </g>
      <g opacity="0" transform="translate(745 320)">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.08;.4;.5;1"
          dur="3.2s"
          begin="3.4s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="745 320;745 296;745 296"
          keyTimes="0;.5;1"
          dur="3.2s"
          begin="3.4s"
          repeatCount="indefinite"
        />
        <circle r="26" fill="#141519" stroke="#2a2b31" strokeWidth="2" />
        <text y="10" textAnchor="middle" fontSize="28">
          🎯
        </text>
      </g>

      {/* Synchronized Confetti Bursts Batch 1 (from 1075, 290 at begin 1.5s) */}
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1036 74;1032 134;1032 134"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#fff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1161 195;1170 255;1170 255"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;973 115;963 175;963 175"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#fff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;973 258;962 318;962 318"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#fff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1164 204;1173 264;1173 264"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ffb37a" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1107 150;1111 210;1111 210"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ffb37a" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1170 136;1179 196;1179 196"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ffb37a" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1142 203;1149 263;1149 263"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#fff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1247 205;1264 265;1264 265"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#fff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1009 158;1002 218;1002 218"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1061 173;1060 233;1060 233"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ffb37a" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1134 166;1140 226;1140 226"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1140 220;1146 280;1146 280"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ffb37a" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1199 208;1211 268;1211 268"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1174 160;1184 220;1184 220"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1059 77;1058 137;1058 137"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#fff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;921 155;906 215;906 215"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;935 264;922 324;922 324"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1112 117;1116 177;1116 177"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1184 139;1195 199;1195 199"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1011 223;1004 283;1004 283"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1075 290;1023 85;1018 145;1018 145"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Synchronized Confetti Bursts Batch 2 (from 1350, 280 at begin 4.5s) */}
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#fff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1348 188;1348 248;1348 248"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ffb37a" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1235 161;1224 221;1224 221"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#fff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1337 96;1336 156;1336 156"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1502 167;1517 227;1517 227"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1393 170;1397 230;1397 230"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1260 103;1251 163;1251 163"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1371 66;1374 126;1374 126"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#fff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1482 252;1496 312;1496 312"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1276 215;1269 275;1269 275"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#fff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1261 207;1252 267;1252 267"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ffb37a" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1184 224;1167 284;1167 284"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ffb37a" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1441 234;1450 294;1450 294"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ffb37a" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1372 128;1374 188;1374 188"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ffb37a" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1395 187;1400 247;1400 247"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ffb37a" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1460 211;1471 271;1471 271"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1465 175;1477 235;1477 235"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1348 79;1348 139;1348 139"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1230 193;1218 253;1218 253"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#fff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1390 150;1394 210;1394 210"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ff5a1f" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1349 96;1349 156;1349 156"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#fff" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1407 196;1413 256;1413 256"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="-4" y="-2.5" width="8" height="5" rx="1" fill="#ffb37a" opacity="0">
        <animate
          attributeName="opacity"
          values="0;1;1;0;0"
          keyTimes="0;.02;.15;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="1350 280;1315 79;1311 139;1311 139"
          keyTimes="0;.12;.22;1"
          dur="6s"
          begin="4.5s"
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  );
};
