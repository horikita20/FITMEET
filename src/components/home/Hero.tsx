import React, { useState, useRef, useCallback } from 'react';
import { ArrowRight, Bell, Play, Calendar, MapPin, Users, MessageCircle } from 'lucide-react';
import { SiteSettings } from '../../types';
import { FitMeetVideoModal } from './FitMeetVideoModal';
import { FitMeetLogo } from '../common/FitMeetLogo';
import { HeroActivityScene } from './HeroActivityScene';

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbE5yl8Likg2G1r0I83R';

interface HeroProps {
  settings: SiteSettings;
  onRegisterClick: () => void;
  onExploreClick: () => void;
  onCollaborateClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onRegisterClick,
  onExploreClick,
  onCollaborateClick,
}) => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Confetti burst generator
  const triggerConfetti = useCallback((n: number = 22) => {
    if (!heroRef.current) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const host = heroRef.current;
    const colors = ['#ff5a1f', '#ffffff', '#ffb37a'];

    for (let k = 0; k < n; k++) {
      const p = document.createElement('i');
      p.className = 'pc';
      const angle = Math.random() * Math.PI * 2;
      const distance = 110 + Math.random() * 180;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const rotation = Math.random() * 540 - 270;

      p.style.cssText = `background:${colors[k % colors.length]};--dx:${dx}px;--dy:${dy}px;--r:${rotation}deg;animation:burst 0.9s cubic-bezier(0.1, 0.7, 0.3, 1) forwards;`;
      host.appendChild(p);

      setTimeout(() => {
        p.remove();
      }, 950);
    }
  }, []);

  // 3D desktop tilt effect
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        !window.matchMedia('(hover: hover)').matches)
    ) {
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    stage.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (stageRef.current) {
      stageRef.current.style.transform = '';
    }
  }, []);

  // Button click ripple effect
  const handleRipple = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const d = Math.max(rect.width, rect.height);
    const s = document.createElement('span');
    s.className = 'rip';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - rect.left - d / 2}px;top:${e.clientY - rect.top - d / 2}px;`;
    btn.appendChild(s);
    setTimeout(() => s.remove(), 650);
  }, []);

  const handleRegisterClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerConfetti(26);
      onRegisterClick();
    },
    [triggerConfetti, onRegisterClick]
  );

  return (
    <section
      ref={heroRef}
      className="hero relative isolate min-h-[640px] lg:min-h-[760px] xl:min-h-[820px] flex items-center border-b border-[#16171a] overflow-hidden bg-[#0b0b0d]"
      aria-labelledby="hero-title"
    >
      {/* Atmospheric Radial Glow & Shading Overlays */}
      <div
        className="hero-shade absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, #0b0b0d 0%, rgba(11,11,13,0.96) 32%, rgba(11,11,13,0.78) 52%, rgba(11,11,13,0.25) 75%, transparent 100%), linear-gradient(180deg, #0b0b0d 0%, transparent 28%)',
        }}
      />

      {/* Background Subtle Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 z-[1]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.04) 2px, transparent 2px)',
          backgroundSize: '70px 70px',
          maskImage: 'radial-gradient(circle at 60% 50%, #000 25%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at 60% 50%, #000 25%, transparent 75%)',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full mx-auto max-w-[1400px] px-4 sm:px-8 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Recreated to match Image 1 & Image 2 */}
        <div className="lg:col-span-7 xl:col-span-6 max-w-[620px]">
          {/* Brand Lockup: Matches Image 1 */}
          <FitMeetLogo size="xl" showSubtitle={true} className="mb-2" />

          {/* Main Headline: Matches Image 1 */}
          <h1
            id="hero-title"
            className="font-head font-black text-4xl sm:text-6xl lg:text-[4.25rem] xl:text-[4.75rem] uppercase leading-[0.92] tracking-tight mt-1 text-white select-none"
          >
            CHALLENGE YOURSELF.
            <span className="text-[#ff5a1f] block mt-1">EXPAND YOUR CIRCLE.</span>
          </h1>

          {/* Action CTAs: Matches Image 2 */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-5 mt-8 sm:mt-9">
            {/* Primary Button: REGISTER FOR MEET → (Matches Image 2) */}
            <button
              onClick={handleRegisterClick}
              onPointerDown={handleRipple}
              className="transform -skew-x-12 inline-flex items-center justify-center px-7 sm:px-9 py-4 text-sm sm:text-base font-black uppercase tracking-wider text-white bg-[#ff5a1f] hover:bg-[#ff7a2e] rounded-sm transition-all shadow-[0_0_28px_rgba(255,90,31,0.55)] hover:shadow-[0_0_40px_rgba(255,90,31,0.8)] active:scale-95 cursor-pointer group"
            >
              <span className="transform skew-x-12 flex items-center gap-2">
                <span>REGISTER FOR MEET</span>
                <ArrowRight className="h-4 w-4 stroke-[3] transition-transform group-hover:translate-x-1" />
              </span>
            </button>

            {/* Secondary Button: GET NOTIFIED 🔔 (Matches Image 2) */}
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onPointerDown={handleRipple}
              className="transform -skew-x-12 inline-flex items-center justify-center px-7 sm:px-9 py-4 text-sm sm:text-base font-black uppercase tracking-wider text-white bg-[#0e0e11] hover:bg-[#1a1b22] border-2 border-[#ff5a1f] rounded-sm transition-all shadow-sm hover:border-[#ff7a2e] active:scale-95 cursor-pointer group"
            >
              <span className="transform skew-x-12 flex items-center gap-2.5">
                <span>GET NOTIFIED</span>
                <Bell className="h-4 w-4 stroke-[2.6] text-white" />
              </span>
            </a>
          </div>

          {/* Secondary Links: WhatsApp Community & Video Modal */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6">
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              <span>Join WhatsApp Community →</span>
            </a>

            <button
              onClick={() => setVideoModalOpen(true)}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current text-[#ff5a1f]" />
              <span>Watch Video</span>
            </button>
          </div>

          {/* Facts: Key Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mt-9 pt-6 border-t border-white/10">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-[#ff5a1f] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs uppercase font-bold tracking-wider text-white">
                  EVERY SUNDAY
                </strong>
                <span className="block text-[11px] text-[#b4b0aa] mt-0.5">
                  Time shared before each meet
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#ff5a1f] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs uppercase font-bold tracking-wider text-white">
                  PATNA, BIHAR
                </strong>
                <span className="block text-[11px] text-[#b4b0aa] mt-0.5">
                  New gym or outdoor spot every meet
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-[#ff5a1f] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs uppercase font-bold tracking-wider text-white">
                  ALL FITNESS LEVELS
                </strong>
                <span className="block text-[11px] text-[#b4b0aa] mt-0.5">
                  Beginner to advanced
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Perspective Tilt Stage Window (Unobstructed view of the live animated workout characters) */}
        <div
          className="hero-right-stage hidden lg:flex lg:col-span-5 xl:col-span-6 h-[440px] xl:h-[500px] items-center justify-center relative pointer-events-auto cursor-pointer"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onClick={() => triggerConfetti(26)}
        >
          <div
            ref={stageRef}
            className="hero-stage-inner relative w-full h-full flex items-center justify-center pointer-events-none"
            style={{ transformStyle: 'preserve-3d', transition: 'transform 0.25s ease-out' }}
          >
            <HeroActivityScene displayInStage onCoachTap={() => triggerConfetti(24)} />
          </div>
        </div>
      </div>

      {/* Official FitMeet Explainer Video Modal */}
      <FitMeetVideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        onJoinClick={onRegisterClick}
      />
    </section>
  );
};
