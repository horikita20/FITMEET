import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CollaborateSectionProps {
  onCollaborateClick: () => void;
}

const CollaborateIllustration: React.FC = () => (
  <svg
    viewBox="0 0 360 360"
    className="h-full w-full"
    role="img"
    aria-label="FitMeet members celebrating with a local brand"
  >
    <defs>
      <radialGradient id="collab-glow">
        <stop offset="0" stopColor="#ff5a1f" stopOpacity=".2" />
        <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="360" height="360" rx="38" fill="#0b0b0d" />
    <circle cx="180" cy="188" r="155" fill="url(#collab-glow)" />
    <path
      d="M151 62v-22M119 77L103 61M211 77l16-16"
      stroke="#777276"
      strokeWidth="8"
      strokeLinecap="round"
    />

    <ellipse cx="181" cy="306" rx="94" ry="12" fill="#000" opacity=".65" />

    <g>
      <rect x="38" y="106" width="82" height="60" rx="8" fill="#29282d" />
      <path d="M32 106h94l-12-20H44z" fill="#42bce9" />
      <path d="M43 106q10 16 20 0t20 0t20 0t20 0" fill="none" stroke="#fff" strokeWidth="5" />
      <rect x="64" y="126" width="31" height="40" rx="4" fill="#f3a66d" />
      <path d="M268 118h3v48h-3z" fill="#b9b3b0" />
      <rect x="247" y="83" width="111" height="39" rx="20" fill="#161518" stroke="#71351f" />
      <text
        x="302"
        y="108"
        textAnchor="middle"
        fill="#ff6a2a"
        fontSize="16"
        fontWeight="800"
        letterSpacing="1.2"
      >
        FITMEET
      </text>
    </g>

    <g>
      <path d="M148 188h27v94q0 12-12 12t-12-12zM178 188h27v94q0 12-12 12t-12-12z" fill="#303036" />
      <path d="M143 142q-10 5-12 18l-12 43q-4 14 9 18t18-10l13-35v-34z" fill="#fff" />
      <path d="M182 142q10 5 12 18l12 43q4 14-9 18t-18-10l-13-35v-34z" fill="#fff" />
      <path d="M142 136q2-23 27-23t28 23v48q-1 16-28 16t-28-16z" fill="#43bce8" />
      <circle cx="169" cy="94" r="25" fill="#f6f2ef" />
      <path d="M143 95q0-26 26-26t26 26" fill="#2b2a30" />
    </g>

    <g>
      <path d="M211 188h27v94q0 12-12 12t-12-12zM241 188h27v94q0 12-12 12t-12-12z" fill="#303036" />
      <path d="M207 142q-10 5-12 18l-12 43q-4 14 9 18t18-10l13-35v-34z" fill="#fff" />
      <path d="M246 142q10 5 12 18l12 43q4 14-9 18t-18-10l-13-35v-34z" fill="#fff" />
      <path d="M206 136q2-23 27-23t28 23v48q-1 16-28 16t-28-16z" fill="#ff5a1f" />
      <circle cx="233" cy="94" r="25" fill="#f6f2ef" />
      <path d="M207 95q0-26 26-26t26 26" fill="#2b2a30" />
    </g>

    <g fill="#fff">
      <path d="M180 98c-6-15-20-10-14 3l14 27 14-27c6-13-8-18-14-3z" />
      <path d="M178 124l-10 43q-3 13 7 15t14-9l7-43z" />
    </g>

    <rect x="19" y="209" width="135" height="40" rx="20" fill="#101216" stroke="#1b5267" />
    <text
      x="86"
      y="235"
      textAnchor="middle"
      fill="#42bce9"
      fontSize="16"
      fontWeight="800"
      letterSpacing="1"
    >
      YOUR BRAND
    </text>
    <path d="M46 229h-8" stroke="#42bce9" strokeWidth="2" />
    <path d="M110 109l9 8" stroke="#f3a66d" strokeWidth="3" />
    <path d="M235 127l11-8" stroke="#ff5a1f" strokeWidth="3" />
  </svg>
);

export const CollaborateSection: React.FC<CollaborateSectionProps> = ({ onCollaborateClick }) => (
  <section className="bg-[#0a0a0c] px-4 py-12 sm:px-8 sm:py-16 lg:py-20">
    <div className="mx-auto grid max-w-[1668px] grid-cols-1 items-center gap-8 rounded-[28px] border border-[#292a30] bg-[#141518] px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-12 lg:px-16 lg:py-14">
      <div>
        <p className="font-head text-sm font-bold uppercase tracking-[0.12em] text-[#ff5a1f] sm:text-base">
          COLLABORATE
        </p>
        <h2 className="mt-4 font-head text-4xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[4.5rem]">
          Bring your brand <span className="text-[#ff5a1f]">to the meet.</span>
        </h2>
        <p className="mt-5 max-w-[940px] text-base leading-[1.7] text-[#c9c9cf] sm:text-lg lg:text-[22px]">
          Every FitMeet brings Patna’s fitness crowd together in one place: gym-goers, students,
          young professionals and weekend athletes. Gyms, studios, coaches, cafés, sportswear and
          local brands, collaborate with us and get seen by the people who care about fitness.
        </p>
        <button
          onClick={onCollaborateClick}
          className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#ff5a1f] px-8 py-4 text-base font-bold text-white shadow-[0_12px_30px_rgba(255,90,31,0.28)] transition-colors hover:bg-[#ff7a2e] active:scale-[.98] sm:text-lg"
        >
          <span>Collaborate with us</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
      <div className="mx-auto aspect-square w-full max-w-[350px] overflow-hidden rounded-[42px] lg:mx-0">
        <CollaborateIllustration />
      </div>
    </div>
  </section>
);
