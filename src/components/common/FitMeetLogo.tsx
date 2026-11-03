import React from 'react';
import { FITMEET_LOGO_URL } from '../../lib/brandAssets';

interface FitMeetLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const FitMeetLogo: React.FC<FitMeetLogoProps> = ({
  className = '',
  size = 'lg',
  showSubtitle = true,
}) => {
  const sizeClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-10',
    lg: 'h-11 sm:h-13',
    xl: 'h-14 sm:h-16 md:h-20',
  };

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      {/* Exact Brand Master Logo Image Provided by User */}
      <img
        src={FITMEET_LOGO_URL}
        alt="FitMeet"
        className={`${sizeClasses[size]} w-auto object-contain object-left`}
        loading="eager"
        decoding="async"
      />

      {showSubtitle && (
        <>
          {/* Subtitle: PATNA • EVERY WEEK (Matches Image 1) */}
          <div className="font-logo font-black italic text-xs sm:text-sm md:text-base tracking-[0.45em] sm:tracking-[0.55em] text-white uppercase mt-2.5 pl-0.5 flex items-center">
            <span>PATNA</span>
            <span className="mx-2 text-[#ff5a1f] text-base leading-none">•</span>
            <span>EVERY WEEK</span>
          </div>

          {/* Tagline: Where fitness meets community. (Matches Image 1) */}
          <p className="font-head font-bold text-sm sm:text-base md:text-lg text-[#ff5a1f] mt-1 pl-0.5">
            Where fitness meets community.
          </p>

          {/* Subtle Orange Glow Divider (Matches Image 1) */}
          <div className="w-28 sm:w-36 h-[2px] bg-gradient-to-r from-[#ff5a1f] via-[#ff8a50] to-transparent mt-2 mb-4 opacity-90 shadow-[0_0_8px_#ff5a1f]" />
        </>
      )}
    </div>
  );
};
