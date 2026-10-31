import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FitMeetEmblem } from '../common/FitMeetEmblem';

interface AboutSectionProps {
  onLearnMoreClick?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onLearnMoreClick }) => {
  return (
    <section id="about" className="py-20 sm:py-28 border-b border-[#16171a] bg-[#0a0a0c] text-[#f5f2ee] scroll-mt-20">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 max-w-[620px]">
            {/* Eyebrow: ✦ ABOUT FITMEET */}
            <div className="flex items-center gap-2 text-[#FC5300] font-head font-bold text-xs sm:text-sm uppercase tracking-widest mb-3">
              <Sparkles className="h-3.5 w-3.5 fill-[#FC5300] text-[#FC5300]" />
              <span>ABOUT FITMEET</span>
            </div>

            {/* Main Headline */}
            <h2 className="font-head font-black text-3xl sm:text-5xl lg:text-[3.5rem] uppercase leading-[0.98] tracking-tight text-white">
              FITNESS CHALLENGES. FUN
              <span className="block mt-1">GAMES.</span>
              <span className="text-[#FC5300] block mt-1">ONE SUNDAY CREW.</span>
            </h2>

            {/* Story Paragraphs */}
            <p className="mt-6 text-sm sm:text-base lg:text-lg text-[#c9c9cf] leading-relaxed">
              FitMeet turns your Sunday morning into a fitness game. Every week, we meet at a new gym or outdoor spot in Patna for team challenges, fun games and good company.
            </p>

            <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#c9c9cf] leading-relaxed">
              Warm up together, play as a team, grab snacks and goodies, and cheer each other on. Come solo, leave with a crew.
            </p>

            {/* CTA Button: JOIN THE CREW → */}
            <div className="mt-8">
              <button
                onClick={onLearnMoreClick}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm sm:text-base font-bold uppercase tracking-wider text-white bg-transparent border-2 border-[#FC5300] hover:bg-[#FC5300]/15 hover:border-[#ff7a2e] rounded-md transition-all transform active:scale-95 cursor-pointer shadow-sm group"
              >
                <span>JOIN THE CREW</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Emblem Card: Matches Image 3 exactly */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[360px] sm:max-w-[400px] aspect-square rounded-[36px] bg-[#101114] border border-[#232429] p-8 sm:p-12 flex items-center justify-center relative shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden group hover:border-[#FC5300]/40 transition-colors">
              {/* Subtle ambient radial glow */}
              <div className="absolute inset-0 bg-radial from-[#ff5a1f]/10 via-transparent to-transparent opacity-80 pointer-events-none" />

              {/* FitMeet Master Emblem with animated dashed orbit */}
              <FitMeetEmblem size="xl" withOrbit={true} withGlow={true} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
