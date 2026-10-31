import React, { useState, useEffect, memo } from 'react';
import { Calendar, Clock, MapPin, ArrowRight, Flame, Sparkles } from 'lucide-react';
import { FitnessEvent } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { EventCard } from '../events/EventCard';

interface FeaturedEventBannerProps {
  event: FitnessEvent;
  upcomingEvents?: FitnessEvent[];
  onRegisterClick: (event: FitnessEvent) => void;
  onSelectEvent?: (event: FitnessEvent) => void;
  onExploreAllClick?: () => void;
}

// Subcomponent for countdown timer to prevent ticking state from re-rendering the parent or images
const CountdownTimer = memo(() => {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 27,
    seconds: 16,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="grid grid-cols-4 sm:flex gap-2 sm:gap-2.5 w-full sm:w-auto" role="timer" aria-label="Countdown to event">
      <div className="py-2 px-1 text-center bg-slate-100 dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#34363c] rounded-md sm:w-16">
        <span className="block font-head font-bold text-xl sm:text-2xl text-slate-900 dark:text-white font-mono tabular-nums leading-none">
          {pad(timeLeft.days)}
        </span>
        <span className="block text-[9px] sm:text-[10px] uppercase text-slate-500 dark:text-[#b4b0aa] mt-1">Days</span>
      </div>
      <div className="py-2 px-1 text-center bg-slate-100 dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#34363c] rounded-md sm:w-16">
        <span className="block font-head font-bold text-xl sm:text-2xl text-slate-900 dark:text-white font-mono tabular-nums leading-none">
          {pad(timeLeft.hours)}
        </span>
        <span className="block text-[9px] sm:text-[10px] uppercase text-slate-500 dark:text-[#b4b0aa] mt-1">Hours</span>
      </div>
      <div className="py-2 px-1 text-center bg-slate-100 dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#34363c] rounded-md sm:w-16">
        <span className="block font-head font-bold text-xl sm:text-2xl text-[#FC5300] font-mono tabular-nums leading-none">
          {pad(timeLeft.minutes)}
        </span>
        <span className="block text-[9px] sm:text-[10px] uppercase text-slate-500 dark:text-[#b4b0aa] mt-1">Mins</span>
      </div>
      <div className="py-2 px-1 text-center bg-slate-100 dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#34363c] rounded-md sm:w-16">
        <span className="block font-head font-bold text-xl sm:text-2xl text-slate-900 dark:text-white font-mono tabular-nums leading-none">
          {pad(timeLeft.seconds)}
        </span>
        <span className="block text-[9px] sm:text-[10px] uppercase text-slate-500 dark:text-[#b4b0aa] mt-1">Secs</span>
      </div>
    </div>
  );
});

CountdownTimer.displayName = 'CountdownTimer';

export const FeaturedEventBanner: React.FC<FeaturedEventBannerProps> = ({
  event,
  upcomingEvents = [],
  onRegisterClick,
  onSelectEvent = onRegisterClick,
  onExploreAllClick,
}) => {
  return (
    <section id="events" className="bg-slate-50/70 dark:bg-[#0c0c0f] border-y border-slate-200 dark:border-[#16171a] py-14 sm:py-20 scroll-mt-20 transition-colors">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-8">
          <p className="font-head font-semibold text-xs sm:text-sm uppercase tracking-wider text-[#FC5300] flex items-center gap-1.5">
            <Flame className="h-4 w-4" />
            <span>Community Events</span>
          </p>
          <h2 className="font-head font-bold text-3xl sm:text-5xl uppercase text-slate-900 dark:text-white mt-1">
            Sunday Workouts & Challenges
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-[#b4b0aa] max-w-2xl">
            Live slot availability, verified venues across Patna, and instant registration passes.
          </p>
        </div>

        {/* Flagship Event Banner with responsive non-overlapping layout */}
        <div className="bg-white dark:bg-[#111215] border border-slate-200 dark:border-[#25272c] rounded-2xl p-5 sm:p-8 shadow-2xl overflow-hidden transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Cover Photo */}
            <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#25272c] bg-slate-100 dark:bg-[#0c0d10] aspect-[16/10] sm:aspect-[4/3] shadow-lg">
              <ImageWithFallback
                src={event.coverImage}
                fallbackSrc="/assets/images/hero_runners_dawn.jpg"
                alt={event.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 bg-[#FC5300] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-md z-10">
                {event.priceInPaise === 0 ? 'Free RSVP' : `₹${(event.priceInPaise / 100).toFixed(0)} Entry`}
              </div>
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-[10px] text-white font-mono px-2 py-0.5 rounded border border-white/20 z-10">
                {event.city}
              </div>
            </div>

            {/* Event Content & Countdown */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#FC5300]/20 text-[#FC5300] rounded">
                    Featured Event
                  </span>
                  <span className="text-xs text-slate-500 dark:text-[#b4b0aa] uppercase font-semibold">
                    {event.category.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-head font-bold text-2xl sm:text-4xl uppercase leading-tight text-slate-900 dark:text-white mt-2">
                  {event.title}
                </h3>

                <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-[#e4e1dc]">
                  <li className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-[#FC5300] shrink-0" />
                    <span>{event.displayDate}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-[#FC5300] shrink-0" />
                    <span>{event.startTime} - {event.endTime} ({event.timezone})</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-[#FC5300] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{event.venue}, {event.city}</span>
                  </li>
                </ul>

                {event.coHosts && event.coHosts.length > 0 && (
                  <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-600 dark:text-[#b4b0aa] bg-slate-100 dark:bg-[#16181d] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#25272c]">
                    <span className="font-semibold text-slate-900 dark:text-white">Co-Hosted with:</span>
                    <span className="text-[#FC5300] dark:text-[#ff7a2e]">{event.coHosts.map((ch: any) => ch.organizationName).join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Countdown & Action: Flex wrap prevents any overlapping */}
              <div className="mt-7 pt-6 border-t border-slate-200 dark:border-[#25272c] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5 flex-wrap">
                <CountdownTimer />

                {/* Action button with remaining slots indicator */}
                <div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => onRegisterClick(event)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] rounded transition-all transform active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(252,83,0,0.35)]"
                  >
                    <span>Join the meet</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] text-slate-500 dark:text-[#b4b0aa]">
                    {event.slotsRemaining} spots remaining
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-600 dark:text-[#b4b0aa] leading-relaxed line-clamp-2">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Event Cards: Responsive Grid with zero overlap */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div className="mt-12 sm:mt-16 pt-10 border-t border-slate-200 dark:border-[#1b1c20]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="font-head font-semibold text-xs sm:text-sm uppercase tracking-wider text-[#FC5300] flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>Other Disciplines</span>
                </p>
                <h3 className="font-head font-bold text-2xl sm:text-3xl uppercase text-slate-900 dark:text-white mt-1">
                  Upcoming Meetups & Sessions
                </h3>
              </div>

              {onExploreAllClick && (
                <button
                  onClick={onExploreAllClick}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FC5300] hover:text-[#ff7a2e] transition-colors cursor-pointer"
                >
                  <span>Explore All Events</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {upcomingEvents.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  onSelectEvent={onSelectEvent}
                  onRegisterClick={onRegisterClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
