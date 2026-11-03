import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Download,
  CreditCard,
  Check,
  ArrowRight,
  Eye,
  Briefcase,
  FileSpreadsheet,
} from 'lucide-react';
import { FitnessEvent, Organization, EventRegistration } from '../../types';
import { createEvent } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface OrganizerDashboardProps {
  events: FitnessEvent[];
  organizations: Organization[];
  allRegistrations: EventRegistration[];
  onEventCreated: (event: FitnessEvent) => void;
  onViewEvent: (event: FitnessEvent) => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  events,
  organizations,
  allRegistrations,
  onEventCreated,
  onViewEvent,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'create' | 'attendees'>('events');
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');

  // Form State for New Event
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('running');
  const [date, setDate] = useState('2026-11-29');
  const [displayDate, setDisplayDate] = useState('Sunday, Nov 29, 2026');
  const [startTime, setStartTime] = useState('06:30 AM');
  const [endTime, setEndTime] = useState('08:30 AM');
  const [venue, setVenue] = useState('Ganga Pathway Deck, Patna');
  const [city, setCity] = useState('Patna');
  const [priceInRupees, setPriceInRupees] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(100);
  const [description, setDescription] = useState('');
  const [selectedCoHostId, setSelectedCoHostId] = useState<string>('');
  const [coHostRole, setCoHostRole] = useState<string>('Warmup & Community Partner');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const eventRegistrations = allRegistrations.filter((r) => r.eventId === selectedEventId);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !venue.trim()) return;

    setLoading(true);
    try {
      const coHosts = [];
      if (selectedCoHostId) {
        const coHostOrg = organizations.find((o) => o.id === selectedCoHostId);
        if (coHostOrg) {
          coHosts.push({
            organizationId: coHostOrg.id,
            organizationName: coHostOrg.name,
            role: coHostRole,
            status: 'accepted' as const,
          });
        }
      }

      const priceInPaise = Math.round(Number(priceInRupees) * 100);

      const created = await createEvent({
        title: title.trim(),
        category,
        date,
        displayDate,
        startTime,
        endTime,
        venue: venue.trim(),
        city: city.trim(),
        priceInPaise,
        registrationCapacity: Number(capacity),
        description: description.trim(),
        primaryOrganizerId: user?.organizationId || 'org-01',
        primaryOrganizerName: user?.organizationName || 'FitMeet Organizer',
        coHosts,
        status: 'published',
        coverImage:
          category === 'running'
            ? 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1800&q=85'
            : 'https://images.unsplash.com/photo-1517838277536-fc2b1a9f5f95?auto=format&fit=crop&w=1200&q=85',
      });

      onEventCreated(created);
      setSuccessMsg(`Event "${created.title}" successfully published!`);
      setActiveTab('events');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const exportAttendeesCSV = () => {
    if (!selectedEvent) return;
    const headers = 'Reference ID,Full Name,Email,Phone,Emergency Contact,Tickets,Status,Date\n';
    const rows = eventRegistrations
      .map(
        (r) =>
          `"${r.referenceId}","${r.fullName}","${r.email}","${r.phone}","${r.emergencyContact}",${r.ticketCount},"${r.paymentStatus}","${r.createdAt}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedEvent.title.replace(/\s+/g, '_')}_Attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-12 sm:py-16 bg-[#0a0a0c] min-h-screen text-[#f5f2ee]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111215] border border-[#25272c] flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#FC5300] text-xs font-bold uppercase tracking-wider mb-1">
              <Briefcase className="h-4 w-4" />
              <span>Organizer Management Console</span>
            </div>
            <h1 className="font-head font-bold text-3xl uppercase text-white">
              {user?.organizationName || 'FitMeet Organizer Portal'}
            </h1>
            <p className="text-xs text-[#b4b0aa] mt-1">
              Manage your fitness events, configure co-hosts, and export attendee rosters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FC5300] hover:bg-[#ff7a2e] text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-colors cursor-pointer shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Host New Event</span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-[#25272c] mb-8 pb-3">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeTab === 'events'
                ? 'bg-[#FC5300] text-white'
                : 'text-[#b4b0aa] hover:text-white hover:bg-[#16181d]'
            }`}
          >
            My Hosted Events ({events.length})
          </button>

          <button
            onClick={() => setActiveTab('attendees')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeTab === 'attendees'
                ? 'bg-[#FC5300] text-white'
                : 'text-[#b4b0aa] hover:text-white hover:bg-[#16181d]'
            }`}
          >
            Attendee Lists & Check-in
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'bg-[#FC5300] text-white'
                : 'text-[#b4b0aa] hover:text-white hover:bg-[#16181d]'
            }`}
          >
            Create New Event
          </button>
        </div>

        {/* Tab 1: Hosted Events */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-[#111215] border border-[#25272c] rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#25272c] mb-3 text-xs">
                    <span className="font-mono text-[#FC5300] font-bold">
                      {ev.priceInPaise === 0 ? 'FREE' : `₹${(ev.priceInPaise / 100).toFixed(0)}`}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-emerald-500/20 text-emerald-400">
                      {ev.status}
                    </span>
                  </div>

                  <h3 className="font-head font-bold text-xl uppercase text-white leading-snug line-clamp-1">
                    {ev.title}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-[#b4b0aa]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[#FC5300]" />
                      <span>{ev.displayDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[#FC5300]" />
                      <span>
                        {ev.startTime} - {ev.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#FC5300]" />
                      <span className="truncate">{ev.venue}</span>
                    </div>
                  </div>

                  {ev.coHosts && ev.coHosts.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[#1b1c20] text-[11px] text-[#ff7a2e]">
                      Co-Host: {ev.coHosts[0].organizationName}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-[#25272c] flex items-center justify-between text-xs">
                  <span className="text-[#b4b0aa]">
                    Capacity:{' '}
                    <strong className="text-white">
                      {ev.registrationCapacity - ev.slotsRemaining}
                    </strong>{' '}
                    / {ev.registrationCapacity}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedEventId(ev.id);
                      setActiveTab('attendees');
                    }}
                    className="text-[#FC5300] hover:underline font-bold uppercase tracking-wider text-[11px] cursor-pointer"
                  >
                    View Attendees →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Attendee Lists & Check-in */}
        {activeTab === 'attendees' && (
          <div className="bg-[#111215] border border-[#25272c] rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#25272c]">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] block mb-1">
                  Select Event
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="px-3.5 py-2 text-sm bg-[#0a0a0c] border border-[#25272c] rounded-lg text-white font-semibold focus:outline-none"
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.displayDate})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={exportAttendeesCSV}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#16181d] hover:bg-[#25272c] border border-[#25272c] rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-auto"
              >
                <FileSpreadsheet className="h-4 w-4 text-[#FC5300]" />
                <span>Export CSV Roster</span>
              </button>
            </div>

            {/* Attendees Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#25272c] text-[#b4b0aa] uppercase text-[10px] tracking-wider">
                    <th className="py-2.5">Pass Ref</th>
                    <th className="py-2.5">Participant</th>
                    <th className="py-2.5">Phone / WhatsApp</th>
                    <th className="py-2.5">Emergency Contact</th>
                    <th className="py-2.5">Tickets</th>
                    <th className="py-2.5">Payment</th>
                    <th className="py-2.5 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#25272c]">
                  {eventRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#b4b0aa]">
                        No registrations recorded yet for this session.
                      </td>
                    </tr>
                  ) : (
                    eventRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-[#16181d]/50">
                        <td className="py-3 font-mono font-bold text-[#FC5300]">
                          {reg.referenceId}
                        </td>
                        <td className="py-3 font-semibold text-white">
                          {reg.fullName}
                          <span className="block text-[11px] text-[#b4b0aa] font-normal">
                            {reg.email}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-neutral-300">{reg.phone}</td>
                        <td className="py-3 text-neutral-400">{reg.emergencyContact}</td>
                        <td className="py-3 font-bold text-white">{reg.ticketCount}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-emerald-500/20 text-emerald-400">
                            {reg.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-neutral-500 text-[10px]">
                          {reg.createdAt.slice(0, 10)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Create New Event Form */}
        {activeTab === 'create' && (
          <div className="bg-[#111215] border border-[#25272c] rounded-2xl p-6 sm:p-8 max-w-2xl">
            <h2 className="font-head font-bold text-2xl uppercase text-white mb-1">
              Publish a Fitness Event
            </h2>
            <p className="text-xs text-[#b4b0aa] mb-6">
              Create an official event listing. You can invite other gyms, coaches, or brands to
              co-host.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunday Sunrise 10K & Functional Deck Workout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white placeholder-neutral-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                    Fitness Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white focus:outline-none"
                  >
                    <option value="running">Running & LSD</option>
                    <option value="gym_hiit">Gym & HIIT</option>
                    <option value="bootcamp">Bootcamp & Turf</option>
                    <option value="yoga_mobility">Yoga & Mobility</option>
                    <option value="hyrox_crossfit">Hyrox & CrossFit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setDisplayDate(
                        new Date(e.target.value).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      );
                    }}
                    className="w-full px-3 py-2 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                  Venue & Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ganga Pathway (Marine Drive Promenade) Pin"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                    Entry Price (₹ INR) — Set 0 for Free
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={priceInRupees}
                    onChange={(e) => setPriceInRupees(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                    Capacity (Seats) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Co-Host Collaboration Select */}
              <div className="p-3.5 bg-[#0a0a0c] border border-[#25272c] rounded-xl space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FC5300] block">
                  Add Co-Hosting Organization (Optional)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={selectedCoHostId}
                    onChange={(e) => setSelectedCoHostId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#111215] border border-[#25272c] rounded-lg text-white focus:outline-none"
                  >
                    <option value="">None (Solo Event)</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.type.replace('_', ' ')})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Co-Host Role (e.g. Warmup & Hydration)"
                    value={coHostRole}
                    onChange={(e) => setCoHostRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#111215] border border-[#25272c] rounded-lg text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                  Event Description & Schedule
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the workout format, pace waves, warmup drills, and finish snacks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 text-sm font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] disabled:opacity-50 rounded-lg transition-all cursor-pointer shadow-[0_0_20px_rgba(252,83,0,0.35)] flex items-center justify-center gap-2 mt-4"
              >
                <span>{loading ? 'Publishing Event...' : 'Publish Public Event'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
