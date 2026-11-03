import React from 'react';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { FitnessEvent } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { getPublicAssetUrl } from '../../lib/brandAssets';

interface EventCardProps {
  event: FitnessEvent;
  onSelectEvent: (event: FitnessEvent) => void;
  onRegisterClick: (event: FitnessEvent) => void;
  onJoinWaitlist?: (event: FitnessEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelectEvent,
  onRegisterClick,
  onJoinWaitlist,
}) => {
  const isComingSoon = event.status === 'coming_soon';

  const spotsPercent =
    event.registrationCapacity > 0
      ? Math.round(
          ((event.registrationCapacity - event.slotsRemaining) / event.registrationCapacity) * 100
        )
      : 0;

  // SPECIAL CARD VARIANT FOR "COMING SOON" (Exact match to user's uploaded screenshot)
  if (isComingSoon) {
    return (
      <div className="group flex flex-col justify-between h-full bg-white dark:bg-[#111215] border border-slate-200 dark:border-[#25272c] hover:border-[#00A3FF] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div className="flex flex-col">
          {/* Dark cover with subtle brand badge */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#18191e] flex items-center justify-center">
            <span className="font-logo font-black tracking-widest text-white/30 text-lg uppercase select-none">
              FITMEET
            </span>

            <div className="absolute top-3 left-3 bg-[#00A3FF] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-md z-10">
              Coming Soon
            </div>

            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-[10px] text-white font-mono px-2 py-0.5 rounded border border-white/20 z-10">
              {event.city}
            </div>
          </div>

          {/* Details */}
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-head font-bold text-2xl uppercase tracking-tight text-slate-900 dark:text-white leading-tight">
              Coming Soon
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#b4b0aa] mt-1">{event.description}</p>

            <div className="mt-5 space-y-3 pt-3 border-t border-slate-100 dark:border-[#1e2027] text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 block">
                    DATE
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-[#f5f2ee] text-xs mt-0.5 block">
                    {event.displayDate || 'Details dropping soon'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 block">
                    TIME
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-[#f5f2ee] text-xs mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{event.startTime || 'To be announced'}</span>
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 block">
                  LOCATION
                </span>
                <span className="font-semibold text-slate-800 dark:text-[#f5f2ee] text-xs mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span>{event.venue || 'To be announced'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Join waiting list Action Button (Exact match to user's screenshot) */}
        <div className="p-5 pt-0 mt-auto">
          <button
            onClick={() => {
              if (onJoinWaitlist) onJoinWaitlist(event);
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-[#00A3FF] hover:bg-[#008fe0] active:scale-[0.98] rounded-xl transition-all cursor-pointer shadow-md"
          >
            <span>Join waiting list</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // STANDARD LIVE EVENT CARD
  return (
    <div className="group flex flex-col justify-between h-full bg-white dark:bg-[#111215] border border-slate-200 dark:border-[#25272c] hover:border-slate-300 dark:hover:border-[#383a42] rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* Top Media & Header Section */}
      <div className="flex flex-col">
        {/* Cover Photo with non-overlapping badges */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-[#0c0d10]">
          <ImageWithFallback
            src={event.coverImage}
            fallbackSrc={getPublicAssetUrl('assets/images/hero_runners_dawn.jpg')}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges container: Flex layout guarantees price and city never overlap */}
          <div className="absolute inset-x-0 top-0 p-3 flex items-center justify-between gap-2 pointer-events-none z-10">
            <span className="bg-[#FC5300] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-md shrink-0">
              {event.priceInPaise === 0
                ? 'Free RSVP'
                : `₹${(event.priceInPaise / 100).toFixed(0)} Entry`}
            </span>

            <span className="bg-black/80 backdrop-blur-md text-[10px] text-white font-mono px-2 py-0.5 rounded border border-white/20 shrink-0 truncate max-w-[120px]">
              {event.city}
            </span>
          </div>

          {/* Optional Co-Host Banner positioned cleanly at bottom of photo */}
          {event.coHosts && event.coHosts.length > 0 && (
            <div className="absolute inset-x-2 bottom-2 bg-black/85 backdrop-blur-sm px-2.5 py-1 rounded border border-white/10 text-[10px] text-[#ff7a2e] flex items-center gap-1.5 z-10">
              <Users className="h-3 w-3 shrink-0" />
              <span className="truncate">Co-Host: {event.coHosts[0].organizationName}</span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-5 flex-1 flex flex-col">
          <h3
            onClick={() => onSelectEvent(event)}
            className="font-head font-bold text-lg sm:text-xl uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-[#FC5300] dark:group-hover:text-[#ff7a2e] transition-colors leading-snug cursor-pointer line-clamp-2 min-h-[2.75rem]"
            title={event.title}
          >
            {event.title}
          </h3>

          <div className="mt-3.5 space-y-2 text-xs text-slate-600 dark:text-[#e4e1dc]">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-[#FC5300] shrink-0" />
              <span className="truncate">{event.displayDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#FC5300] shrink-0" />
              <span>
                {event.startTime} - {event.endTime}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 text-[#FC5300] shrink-0 mt-0.5" />
              <span className="line-clamp-1 text-slate-500 dark:text-[#b4b0aa]">{event.venue}</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500 dark:text-[#b4b0aa] line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>
      </div>

      {/* Footer & Action Controls */}
      <div className="p-5 pt-0 mt-auto">
        <div className="pt-3 border-t border-slate-100 dark:border-[#1b1c20] mb-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#b4b0aa] mb-1.5">
            <span>Slots Available:</span>
            <span className="font-mono text-slate-900 dark:text-white font-bold">
              {event.slotsRemaining} left / {event.registrationCapacity}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-[#0a0a0c] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#FC5300] to-[#ff7a2e] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, spotsPercent))}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelectEvent(event)}
            className="py-2.5 px-2 text-xs font-semibold uppercase tracking-wider text-slate-700 hover:text-black dark:text-neutral-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#16181d] dark:hover:bg-[#1f2229] border border-slate-200 dark:border-[#25272c] rounded transition-colors cursor-pointer text-center truncate"
          >
            Details
          </button>

          <button
            onClick={() => onRegisterClick(event)}
            disabled={event.slotsRemaining <= 0}
            className="py-2.5 px-2 text-xs font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-all cursor-pointer text-center flex items-center justify-center gap-1 shadow-sm truncate"
          >
            <span>{event.slotsRemaining <= 0 ? 'Full' : 'Join'}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
