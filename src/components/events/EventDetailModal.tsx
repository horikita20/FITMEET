import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  ArrowRight,
  Building2,
  Flame,
} from 'lucide-react';
import { FitnessEvent } from '../../types';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { getPublicAssetUrl } from '../../lib/brandAssets';

interface EventDetailModalProps {
  event: FitnessEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: (event: FitnessEvent) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegisterClick,
}) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111215] border border-slate-200 dark:border-[#25272c] rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-800 dark:text-[#f5f2ee] transition-colors">
        {/* Cover Image & Close */}
        <div className="relative aspect-[21/9] sm:aspect-[16/7] bg-black">
          <ImageWithFallback
            src={event.coverImage}
            fallbackSrc={getPublicAssetUrl('assets/images/hero_runners_dawn.jpg')}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />

          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#FC5300] text-white">
              {event.category.replace('_', ' ')}
            </span>
            <h2 className="font-head font-bold text-2xl sm:text-3xl uppercase text-white mt-1 leading-tight [text-wrap:balance]">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Key metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-[#25272c] text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#FC5300] shrink-0" />
              <div>
                <span className="text-slate-500 dark:text-[#b4b0aa] text-[10px] uppercase font-bold block">
                  Date
                </span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {event.displayDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#FC5300] shrink-0" />
              <div>
                <span className="text-slate-500 dark:text-[#b4b0aa] text-[10px] uppercase font-bold block">
                  Timing
                </span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {event.startTime} - {event.endTime}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:col-span-2">
              <MapPin className="h-5 w-5 text-[#FC5300] shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 dark:text-[#b4b0aa] text-[10px] uppercase font-bold block">
                  Venue
                </span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {event.venue}, {event.city}
                </span>
                {event.locationDetails && (
                  <span className="text-[11px] text-slate-500 dark:text-[#b4b0aa] block mt-0.5">
                    ({event.locationDetails})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* About Event */}
          <div>
            <h3 className="font-head font-bold text-lg uppercase text-slate-900 dark:text-white tracking-wide">
              Event Overview
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-[#b4b0aa] leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Organizers and Co-Hosts */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#16181d] border border-slate-200 dark:border-[#25272c] space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#FC5300]">
              Hosting Organizations
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                {event.primaryOrganizerName} (Host)
              </span>
              <span className="text-slate-500 dark:text-[#b4b0aa] text-xs">Primary Organizer</span>
            </div>

            {event.coHosts && event.coHosts.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-[#25272c] space-y-1.5">
                <span className="text-[10px] text-slate-500 dark:text-[#b4b0aa] uppercase block font-semibold">
                  Approved Co-Hosts:
                </span>
                {event.coHosts.map((ch: any) => (
                  <div
                    key={ch.organizationId}
                    className="flex items-center justify-between text-xs text-[#FC5300] dark:text-[#ff7a2e]"
                  >
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {ch.organizationName}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-[#b4b0aa] font-mono">
                      {ch.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rules & Guidelines */}
          {event.rules && event.rules.length > 0 && (
            <div>
              <h3 className="font-head font-bold text-base uppercase text-slate-900 dark:text-white tracking-wide">
                Rules & Guidelines
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-[#b4b0aa]">
                {event.rules.map((rule: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#FC5300] font-bold">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Strip: Price & Register Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#25272c] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#b4b0aa] block">
                Registration Fee
              </span>
              <div className="font-head font-bold text-2xl text-slate-900 dark:text-white">
                {event.priceInPaise === 0 ? (
                  <span className="text-[#FC5300]">100% Free RSVP</span>
                ) : (
                  <span>
                    ₹{(event.priceInPaise / 100).toFixed(2)}{' '}
                    <span className="text-xs text-slate-500 dark:text-[#b4b0aa] font-normal font-sans">
                      / participant
                    </span>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-[#b4b0aa]">
                {event.slotsRemaining} of {event.registrationCapacity} slots left
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onRegisterClick(event);
              }}
              disabled={event.slotsRemaining <= 0}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all transform active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(252,83,0,0.35)]"
            >
              <span>{event.slotsRemaining <= 0 ? 'Fully Booked' : 'Join the Meet'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
