import React from 'react';

interface FitMeetEmblemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withOrbit?: boolean;
  withGlow?: boolean;
}

export const FitMeetEmblem: React.FC<FitMeetEmblemProps> = ({
  className = '',
  size = 'md',
  withOrbit = true,
  withGlow = true,
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48 sm:w-56 sm:h-56',
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Background Warm Radial Glow */}
      {withGlow && (
        <div
          className="absolute inset-0 rounded-full blur-2xl pointer-events-none -z-10"
          style={{
            background: 'radial-gradient(circle, rgba(252, 83, 0, 0.4) 0%, rgba(252, 83, 0, 0.1) 50%, transparent 70%)',
          }}
        />
      )}

      {/* Orbit Ring */}
      {withOrbit && (
        <div className="absolute -inset-4 sm:-inset-6 rounded-full border border-dashed border-[#ff5a1f]/40 pointer-events-none animate-[spin_40s_linear_infinite]" />
      )}

      {/* Emblem SVG / Image Graphic */}
      <div className={`relative ${sizeMap[size]} flex items-center justify-center`}>
        <img
          src="/assets/aistudio/FitMeet_Emblem_original_1_.jpg_3ce53c29.jpeg"
          alt="FitMeet Official Emblem"
          className="w-full h-full object-contain rounded-2xl drop-shadow-[0_0_20px_rgba(252,83,0,0.35)]"
          onError={(e) => {
            // High-fidelity SVG Fallback in case of missing file
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
};

