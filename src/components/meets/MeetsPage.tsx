import React from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock, MapPin, Users, Sparkles } from 'lucide-react';
import { FitnessEvent } from '../../types';

interface MeetsPageProps {
  events: FitnessEvent[];
  onNavigateHome: () => void;
  onJoinMeet: (event: FitnessEvent) => void;
  onSelectEvent?: (event: FitnessEvent) => void;
}

export const MeetsPage: React.FC<MeetsPageProps> = ({
  events,
  onNavigateHome,
  onJoinMeet,
  onSelectEvent,
}) => {
  // Separate events into upcoming and past
  // As per requirement: Date & Time are "To be announced", and past meets has empty state "No meets yet. The first one is on its way."
  const upcomingMeets: FitnessEvent[] = events.length > 0 ? events : [
    {
      id: 'fitmeet-01',
      title: 'FitMeet #01: Strength, Endurance & Fun Games',
      description: 'The inaugural Patna community session. Dynamic team conditioning, fun fitness games, and endurance intervals designed for all fitness levels.',
      category: 'gym_hiit' as const,
      coverImage: '/assets/images/hero_runners_dawn.jpg',
      date: 'TBA',
      displayDate: 'To be announced',
      startTime: 'To be announced',
      endTime: 'To be announced',
      timezone: 'IST',
      venue: 'To be announced',
      city: 'Patna',
      priceInPaise: 0,
      currency: 'INR',
      registrationCapacity: 100,
      slotsRemaining: 100,
      registrationDeadline: 'To be announced',
      rules: ['All fitness levels welcome', 'Hydration provided'],
      cancellationPolicy: 'Free cancellation up to 24 hours before the meet',
      primaryOrganizerId: 'fitmeet-patna',
      primaryOrganizerName: 'FitMeet Patna',
      coHosts: [],
      status: 'published' as const,
      featured: true,
      createdAt: new Date().toISOString(),
    }
  ];

  const pastMeets: FitnessEvent[] = []; // No completed meets yet, display exact requested empty state

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f5f2ee] pb-24">
      {/* Top Header Navigation Strip with "Back to Home" button */}
      <div className="border-b border-white/10 bg-[#0d0e12]/80 backdrop-blur-md sticky top-20 z-30">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3 sm:px-4 py-2 rounded-lg border border-white/10"
          >
            <ArrowLeft className="h-4 w-4 text-[#FC5300]" />
            <span>Back to Home</span>
          </button>

          <span className="text-[11px] font-mono tracking-widest text-[#8d8a85] uppercase">
            Official Meets · Patna
          </span>
        </div>
      </div>

      {/* A. HERO SECTION */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-[#1b1c20] bg-gradient-to-b from-[#0e0f14] via-[#0a0a0c] to-[#0a0a0c]">
        {/* Subtle ambient glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FC5300]/10 blur-[120px] rounded-full"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 text-center">
          {/* Location Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FC5300]/10 border border-[#FC5300]/30 text-[#FC5300] font-head font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-5">
            <span>FITMEET · PATNA</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-head font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-white leading-[0.95] [text-wrap:balance]">
            PUSH YOUR LIMITS.{' '}
            <span className="text-[#FC5300] block sm:inline">TOGETHER.</span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-5 text-base sm:text-lg lg:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Strength, endurance, HIIT and fun games. All levels welcome.
          </p>

          {/* Facts / Key Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-neutral-400">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#FC5300]" />
              <span>Every Sunday</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#FC5300]" />
              <span>Patna, Bihar</span>
            </span>
            <span className="text-neutral-600">·</span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#FC5300]" />
              <span>All Fitness Levels</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Meets Container */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-14 space-y-16">
        {/* B. UPCOMING MEETS SECTION */}
        <section id="upcoming-meets" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#20222a] pb-4">
            <div>
              <p className="text-xs font-bold font-mono uppercase tracking-widest text-[#FC5300]">
                Schedule & RSVP
              </p>
              <h2 className="font-head font-black text-3xl sm:text-4xl uppercase tracking-tight text-white mt-1">
                UPCOMING MEETS
              </h2>
            </div>
            <p className="text-xs text-neutral-400">
              Dates and venues are confirmed before each session.
            </p>
          </div>

          {/* Meet Cards: Split layout with Meet Number on left, Details on right */}
          <div className="space-y-5">
            {upcomingMeets.map((meet, index) => {
              const meetNumber = String(index + 1).padStart(2, '0');
              const displayDate = meet.displayDate && !meet.displayDate.includes('2026-11') ? meet.displayDate : 'To be announced';
              const displayTime = meet.startTime && !meet.startTime.includes(':') ? meet.startTime : 'To be announced';
              const displayVenue = meet.venue && !meet.venue.includes('Marine Drive') ? meet.venue : 'To be announced, Patna';

              return (
                <div
                  key={meet.id}
                  className="bg-[#121318] border border-[#23252e] hover:border-[#FC5300]/50 rounded-2xl p-5 sm:p-7 transition-all duration-200 shadow-xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Left Column: Meet Number Identifier */}
                    <div className="md:col-span-3 flex md:flex-col items-center md:items-start justify-between md:justify-center border-b md:border-b-0 md:border-r border-[#23252e] pb-4 md:pb-0 md:pr-6">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#FC5300] block mb-0.5">
                          MEET IDENTIFIER
                        </span>
                        <div className="font-head font-black text-3xl sm:text-4xl text-white tracking-tight uppercase">
                          FITMEET #{meetNumber}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 bg-white/5 px-2.5 py-1 rounded mt-2">
                        <Sparkles className="h-3 w-3 text-[#FC5300]" />
                        <span>Edition #{meetNumber}</span>
                      </span>
                    </div>

                    {/* Middle Column: Event Information */}
                    <div className="md:col-span-6 space-y-3">
                      <h3 className="font-head font-bold text-xl sm:text-2xl uppercase tracking-tight text-white">
                        {meet.title || `FitMeet #${meetNumber}: Strength, Endurance & Games`}
                      </h3>

                      <div className="space-y-1.5 text-xs sm:text-sm text-neutral-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#FC5300] shrink-0" />
                          <span className="font-semibold text-white">Date:</span>
                          <span className="text-neutral-300">{displayDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#FC5300] shrink-0" />
                          <span className="font-semibold text-white">Time:</span>
                          <span className="text-neutral-300">{displayTime}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-[#FC5300] shrink-0 mt-0.5" />
                          <span className="font-semibold text-white">Venue:</span>
                          <span className="text-neutral-300">{displayVenue}</span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed pt-1">
                        {meet.description}
                      </p>
                    </div>

                    {/* Right Column: Join the Meet CTA */}
                    <div className="md:col-span-3 flex flex-col items-stretch md:items-end justify-center gap-3 pt-2 md:pt-0">
                      <button
                        onClick={() => onJoinMeet(meet)}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] rounded-xl transition-all transform active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(252,83,0,0.35)]"
                      >
                        <span>Join the Meet</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      <span className="text-[11px] text-center md:text-right text-neutral-400">
                        100% Free RSVP • Instant Pass
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* C. PAST MEETS SECTION */}
        <section id="past-meets" className="space-y-6 pt-6">
          <div className="border-b border-[#20222a] pb-4">
            <p className="text-xs font-bold font-mono uppercase tracking-widest text-[#8d8a85]">
              Archive
            </p>
            <h2 className="font-head font-black text-3xl sm:text-4xl uppercase tracking-tight text-white mt-1">
              PAST MEETS
            </h2>
          </div>

          {pastMeets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pastMeets.map((meet) => (
                <div key={meet.id} className="bg-[#121318] border border-[#23252e] rounded-xl p-5">
                  <h3 className="font-head font-bold text-lg text-white">{meet.title}</h3>
                </div>
              ))}
            </div>
          ) : (
            /* Empty-state message strictly matching requirement: "No meets yet. The first one is on its way." */
            <div className="bg-[#121318]/60 border border-[#23252e] rounded-2xl p-10 sm:p-14 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#FC5300]">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-head font-bold text-xl uppercase text-white tracking-wide">
                No meets yet. The first one is on its way.
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
                Follow our official channels to be the first to know when the inaugural edition drops in Patna!
              </p>
            </div>
          )}
        </section>

      {/* Bottom Back to Home Button removed per client request */}
      </div>
    </div>
  );
};
