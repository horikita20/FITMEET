import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  Flame,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { FitnessEvent, EventCategory } from '../../types';
import { EventCard } from './EventCard';

interface EventDiscoveryProps {
  events: FitnessEvent[];
  onSelectEvent: (event: FitnessEvent) => void;
  onRegisterClick: (event: FitnessEvent) => void;
  onJoinWaitlist?: (event: FitnessEvent) => void;
}

export const EventDiscovery: React.FC<EventDiscoveryProps> = ({
  events,
  onSelectEvent,
  onRegisterClick,
  onJoinWaitlist,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPrice, setSelectedPrice] = useState<'all' | 'free' | 'paid'>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const categories = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'running', label: 'Running & LSD' },
    { id: 'gym_hiit', label: 'Gym & HIIT' },
    { id: 'bootcamp', label: 'Bootcamp & Turf' },
    { id: 'yoga_mobility', label: 'Yoga & Recovery' },
    { id: 'hyrox_crossfit', label: 'Hyrox & CrossFit' },
  ];

  const filteredEvents = events.filter((ev) => {
    const matchCity =
      selectedCity === 'all' || ev.city.toLowerCase() === selectedCity.toLowerCase();
    const matchCategory = selectedCategory === 'all' || ev.category === selectedCategory;
    const matchPrice =
      selectedPrice === 'all' ||
      (selectedPrice === 'free' && ev.priceInPaise === 0) ||
      (selectedPrice === 'paid' && ev.priceInPaise > 0);
    const matchAvailable = !onlyAvailable || ev.slotsRemaining > 0;
    const matchSearch =
      search.trim() === '' ||
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.venue.toLowerCase().includes(search.toLowerCase()) ||
      ev.city.toLowerCase().includes(search.toLowerCase()) ||
      ev.description.toLowerCase().includes(search.toLowerCase());

    return matchCity && matchCategory && matchPrice && matchAvailable && matchSearch;
  });

  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-[#0a0a0c] min-h-screen text-slate-800 dark:text-[#f5f2ee] transition-colors">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10">
          <p className="font-head font-semibold text-xs sm:text-sm uppercase tracking-wider text-[#FC5300] flex items-center gap-1.5">
            <Flame className="h-4 w-4" />
            <span>Event Discovery</span>
          </p>
          <h1 className="font-head font-bold text-3xl sm:text-5xl uppercase text-slate-900 dark:text-white mt-1">
            Discover Fitness Events & Co-Hosted Meetups
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-[#b4b0aa] max-w-2xl">
            Explore community runs, gym throwdowns, outdoor mobility sessions, and
            multi-organization fitness meetups with real-time slot tracking and instant pass
            confirmation.
          </p>
        </div>

        {/* Multi-Filter Controls */}
        <div className="bg-white dark:bg-[#111215] border border-slate-200 dark:border-[#25272c] rounded-xl p-5 mb-10 space-y-4 shadow-sm transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-neutral-500" />
              <input
                type="text"
                placeholder="Search by event, gym, venue, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#25272c] focus:border-[#FC5300] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none transition-colors"
              />
            </div>

            {/* City Selector */}
            <div className="md:col-span-4 flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-[#b4b0aa] uppercase font-bold shrink-0">
                City:
              </span>
              <div className="flex flex-wrap gap-1 w-full">
                {['all', 'Patna', 'Mumbai', 'Bengaluru'].map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                      selectedCity === city
                        ? 'bg-[#FC5300] text-white font-bold'
                        : 'bg-slate-100 dark:bg-[#16181d] text-slate-600 dark:text-[#b4b0aa] hover:text-black dark:hover:text-white border border-slate-200 dark:border-[#25272c]'
                    }`}
                  >
                    {city === 'all' ? 'All' : city}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="md:col-span-3 flex items-center gap-2 justify-end">
              <span className="text-xs text-slate-500 dark:text-[#b4b0aa] uppercase font-bold shrink-0">
                Fee:
              </span>
              <div className="flex gap-1">
                {(['all', 'free', 'paid'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPrice(p)}
                    className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer capitalize ${
                      selectedPrice === p
                        ? 'bg-[#FC5300] text-white'
                        : 'bg-slate-100 dark:bg-[#16181d] text-slate-600 dark:text-[#b4b0aa] hover:text-black dark:hover:text-white border border-slate-200 dark:border-[#25272c]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Discipline Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100 dark:border-[#1b1c20] scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold'
                    : 'bg-slate-100 dark:bg-[#0a0a0c] text-slate-600 dark:text-[#b4b0aa] hover:text-black dark:hover:text-white border border-slate-200 dark:border-[#25272c]'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#b4b0aa] cursor-pointer whitespace-nowrap pl-4">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="rounded border-slate-300 dark:border-neutral-700 text-[#FC5300] focus:ring-[#FC5300]"
              />
              <span>Open slots only</span>
            </label>
          </div>
        </div>

        {/* Results Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#111215] border border-slate-200 dark:border-[#25272c] rounded-2xl p-8">
            <h3 className="font-head font-bold text-2xl uppercase text-slate-900 dark:text-white">
              No matching events found
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-[#b4b0aa]">
              Try adjusting your city, discipline filter, or search keywords.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCity('all');
                setSelectedCategory('all');
                setSelectedPrice('all');
                setOnlyAvailable(false);
              }}
              className="mt-5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#FC5300] text-white rounded cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                onSelectEvent={onSelectEvent}
                onRegisterClick={onRegisterClick}
                onJoinWaitlist={onJoinWaitlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
