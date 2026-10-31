import React from 'react';
import { Camera, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

/**
 * Locked gallery until FitMeet #01. After the meet, replace tiles with real photos.
 */

export const GallerySection: React.FC = () => {
  const tiles = [
    { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=75', fallback: '/assets/images/hero_runners_dawn.jpg', label: 'Your new crew' },
    { url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=75', fallback: '/assets/images/community_coffee_crew.jpg', label: 'The coaches' },
    { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=500&q=75', fallback: '/assets/images/urban_trail_pace_group.jpg', label: 'The challenge' },
    { url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=500&q=75', fallback: '/assets/images/track_night_intervals.jpg', label: 'The group photo' },
  ];

  const scrollToEvents = () => {
    if (window.location.hash !== '#runs') {
      window.location.hash = '#runs';
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const corners = [
    'top-2.5 left-2.5 border-t-2 border-l-2',
    'top-2.5 right-2.5 border-t-2 border-r-2',
    'bottom-2.5 left-2.5 border-b-2 border-l-2',
    'bottom-2.5 right-2.5 border-b-2 border-r-2'
  ];

  return (
    <section id="gallery" className="py-14 sm:py-18 bg-[#0a0a0c] border-b border-[#16171a] scroll-mt-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <p className="font-head font-semibold text-xs sm:text-sm uppercase tracking-wider text-[#FC5300] flex items-center gap-1.5">
              <Camera className="h-4 w-4" />
              <span>Meet Gallery</span>
            </p>
            <h2 className="font-head font-bold text-3xl sm:text-4xl uppercase text-white mt-1 leading-[1.02]">
              The first photos <span className="text-[#FC5300]">drop soon.</span>
            </h2>
            <p className="mt-1.5 text-sm text-[#b4b0aa]">
              This wall fills up right after FitMeet #01. Show up and you’re in it.
            </p>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full border border-[#2a2b31] bg-[#111215] px-3.5 py-2 font-head font-semibold text-xs sm:text-sm uppercase tracking-wider text-white">
            <span className="h-2 w-2 rounded-full bg-[#FC5300] shadow-[0_0_0_4px_rgba(252,83,0,0.25)]" />
            Unlocks after FitMeet #01
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {tiles.map((t) => (
            <div key={t.label} className="relative rounded-lg overflow-hidden bg-[#111215] aspect-[4/3] border border-[#25272c]">
              <ImageWithFallback
                src={t.url}
                fallbackSrc={t.fallback}
                alt=""
                aria-hidden
                className="w-full h-full object-cover scale-110 blur-[5px] grayscale-[50%] brightness-[0.45]"
                loading="lazy"
              />
              {corners.map((c) => (
                <span key={c} className={`absolute h-4 w-4 border-white/55 ${c}`} />
              ))}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-1">
                <span className="h-10 w-10 rounded-full border border-white/35 grid place-items-center mb-1">
                  <Camera className="h-5 w-5 text-white" />
                </span>
                <span className="font-head font-bold text-sm sm:text-lg uppercase text-white">{t.label}</span>
                <span className="font-head font-semibold text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-[#FC5300]">
                  Coming after #01
                </span>
              </div>
            </div>
          ))}

          <button
            onClick={scrollToEvents}
            className="col-span-2 sm:col-span-1 rounded-lg aspect-auto sm:aspect-[4/3] py-6 sm:py-0 border-[1.5px] border-dashed border-[#FC5300] bg-[radial-gradient(circle_at_50%_40%,rgba(252,83,0,0.2),#111215_72%)] flex flex-col items-center justify-center text-center gap-1 cursor-pointer"
          >
            <span className="h-10 w-10 rounded-full bg-[#FC5300]/20 grid place-items-center mb-1">
              <Camera className="h-5 w-5 text-[#FC5300]" />
            </span>
            <span className="font-head font-bold text-lg uppercase text-white">Your photo here</span>
            <span className="font-head font-semibold text-[11px] uppercase tracking-[0.14em] text-[#FC5300]">Be in the first shot</span>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#FC5300] px-3.5 py-1.5 font-head font-semibold text-xs uppercase tracking-wider text-[#0a0a0c]">
              Join the meet <ArrowRight className="h-3 w-3" />
            </span>
          </button>
        </div>

        <p className="mt-4 flex items-center gap-2.5 text-xs sm:text-sm text-[#8b8882]">
          <span className="h-2 w-2 rounded-full bg-[#FC5300]" />
          Photos from every meet land here and on <b className="text-white font-semibold">@fitmeet.in</b>
        </p>
      </div>
    </section>
  );
};
