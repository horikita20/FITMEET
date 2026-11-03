import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  QrCode,
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react';

interface FinalCtaProps {
  onRegisterClick: () => void;
  eventTitle?: string;
  slotsRemaining?: number;
}

export const FinalCta: React.FC<FinalCtaProps> = ({
  onRegisterClick,
  eventTitle = 'Sunday Sunrise Ganga Pathway Run & Workout',
  slotsRemaining = 22,
}) => {
  return (
    <section
      id="register"
      className="relative scroll-mt-20 border-b border-slate-200 dark:border-[#16171a] bg-slate-50 dark:bg-[#0c0d10] py-14 sm:py-20 overflow-hidden transition-colors"
    >
      {/* Athletic background ambient glow */}
      <div
        className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-[#FC5300]/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-[#FC5300]/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Main Banner Container */}
        <div className="relative rounded-2xl border border-slate-200 dark:border-[#25272c] bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#14151a] dark:via-[#111216] dark:to-[#0c0d10] p-7 sm:p-10 lg:p-12 shadow-2xl overflow-hidden transition-colors">
          {/* Top highlight bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FC5300] to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FC5300]/10 border border-[#FC5300]/30 text-[#FC5300] dark:text-[#ff7a2e] text-xs font-mono font-semibold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-[#FC5300]" />
                <span>Next Session: This Sunday • 7:00 AM • Marine Drive</span>
              </div>

              {/* Main Headline */}
              <h2 className="font-head font-bold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                Ready to take <br className="hidden sm:inline" />
                <span className="text-[#FC5300]">on the challenge?</span>
              </h2>

              {/* Subheadline / Value Proposition */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-300 max-w-xl leading-relaxed">
                Join Patna’s fastest-growing weekend fitness movement. Whether you are training for
                your first 5K or just want an energizing Sunday morning with genuine people, FitMeet
                is completely free and welcoming to all fitness levels.
              </p>

              {/* 3 Trust Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-neutral-200 bg-white dark:bg-[#0a0a0c]/80 border border-slate-200 dark:border-[#1f2127] rounded-lg px-3.5 py-3 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-[#FC5300] shrink-0" />
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">
                      100% Free RSVP
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                      Zero hidden costs
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-neutral-200 bg-white dark:bg-[#0a0a0c]/80 border border-slate-200 dark:border-[#1f2127] rounded-lg px-3.5 py-3 shadow-sm">
                  <QrCode className="h-4 w-4 text-[#FC5300] shrink-0" />
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">
                      Instant Pass
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                      QR entry on phone
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-neutral-200 bg-white dark:bg-[#0a0a0c]/80 border border-slate-200 dark:border-[#1f2127] rounded-lg px-3.5 py-3 shadow-sm">
                  <Users className="h-4 w-4 text-[#FC5300] shrink-0" />
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">
                      All Fitness Levels
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                      Runners & walkers
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Action Card */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
              <div className="w-full max-w-md bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#25272c] rounded-xl p-6 sm:p-7 space-y-4 shadow-xl relative transition-colors">
                {/* Status pill */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1b1c20] pb-3">
                  <span className="font-head font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                    Flagship Registration
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Open • {slotsRemaining} spots left
                  </span>
                </div>

                {/* Event micro-summary */}
                <div className="space-y-2 py-1">
                  <h3 className="font-head text-lg sm:text-xl font-bold text-slate-900 dark:text-white uppercase leading-snug">
                    {eventTitle}
                  </h3>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-[#b4b0aa]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[#FC5300] shrink-0" />
                      <span>Upcoming Sunday • 07:00 AM IST</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#FC5300] shrink-0" />
                      <span className="truncate">Ganga Pathway (Marine Drive), Patna</span>
                    </div>
                  </div>
                </div>

                {/* Prominent Call-to-Action Button */}
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] active:scale-[0.98] rounded-lg transition-all cursor-pointer shadow-[0_0_24px_rgba(252,83,0,0.4)] group"
                >
                  <span>Join the meet — Free RSVP</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Trust guarantee microcopy */}
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-neutral-400 pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>30-second form • Instant digital ticket • Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
