import React, { useState } from 'react';
import {
  Handshake,
  Building2,
  Award,
  Calendar,
  Check,
  X,
  Send,
  Users,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Organization, CollaborationRequest, FitnessEvent } from '../../types';
import { sendCollaborationRequest, updateCollaborationStatus } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface CollaborationHubProps {
  organizations: Organization[];
  collaborations: CollaborationRequest[];
  events: FitnessEvent[];
  onCollaborationUpdated: () => void;
  onApplyAsOrganizer: () => void;
}

export const CollaborationHub: React.FC<CollaborationHubProps> = ({
  organizations,
  collaborations,
  events,
  onCollaborationUpdated,
  onApplyAsOrganizer,
}) => {
  const { user } = useAuth();
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [proposedRole, setProposedRole] = useState<string>('Warmup & Strength Drill Lead');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipientId) return;

    setLoading(true);
    try {
      await sendCollaborationRequest({
        proposerOrgId: user?.organizationId || 'org-01',
        recipientOrgId: selectedRecipientId,
        eventId: selectedEventId || undefined,
        proposedRole,
        message,
      });

      setActionMsg('Collaboration invitation sent successfully!');
      setSelectedRecipientId('');
      setMessage('');
      onCollaborationUpdated();
      setTimeout(() => setActionMsg(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to send collaboration');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (collabId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateCollaborationStatus(collabId, status);
      setActionMsg(`Collaboration marked as ${status}`);
      onCollaborationUpdated();
      setTimeout(() => setActionMsg(null), 3500);
    } catch {
      alert('Failed to update collaboration');
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-[#0a0a0c] min-h-screen text-[#f5f2ee]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111215] border border-[#25272c] flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-[#FC5300] text-xs font-bold uppercase tracking-wider mb-1">
              <Handshake className="h-4 w-4" />
              <span>Multi-Organization Synergy</span>
            </div>
            <h1 className="font-head font-bold text-3xl sm:text-4xl uppercase text-white">
              Gyms, Brands & Coaches Collaboration Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#b4b0aa] mt-1 max-w-2xl leading-relaxed">
              Connect with leading training gyms, sports brands, and elite coaches. Propose
              co-hosted community events, combine member bases, and scale your fitness impact.
            </p>
          </div>

          <button
            onClick={onApplyAsOrganizer}
            className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] rounded-lg transition-colors cursor-pointer shrink-0 shadow-md"
          >
            <span>Partner / Apply as Organizer</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {actionMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{actionMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Organization Directory */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-head font-bold text-2xl uppercase text-white">
                Verified Community Organizations
              </h2>
              <span className="text-xs text-[#b4b0aa]">{organizations.length} Partners Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="bg-[#111215] border border-[#25272c] hover:border-[#34363c] rounded-xl p-5 flex flex-col justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] uppercase font-mono mb-2">
                      <span className="text-[#FC5300] font-bold">{org.type.replace('_', ' ')}</span>
                      <span className="text-emerald-400">Verified</span>
                    </div>

                    <h3 className="font-head font-bold text-xl uppercase text-white leading-tight">
                      {org.name}
                    </h3>
                    <p className="text-xs text-[#b4b0aa] mt-2 line-clamp-2 leading-relaxed">
                      {org.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1b1c20] flex items-center justify-between text-xs">
                    <span className="text-neutral-400">{org.city}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedRecipientId(org.id)}
                      className="text-[#FC5300] hover:text-[#ff7a2e] font-bold uppercase text-[11px] cursor-pointer"
                    >
                      Propose Event →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Active / Pending Collaborations List */}
            <div className="mt-10 pt-8 border-t border-[#25272c]">
              <h3 className="font-head font-bold text-2xl uppercase text-white mb-4">
                Collaboration Invitations & History
              </h3>

              <div className="space-y-3">
                {collaborations.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-[#111215] border border-[#25272c] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {c.proposerOrgName}
                        </span>
                        <span className="text-neutral-500">→</span>
                        <span className="font-semibold text-white text-sm">
                          {c.recipientOrgName}
                        </span>
                      </div>
                      <div className="text-xs text-[#FC5300] font-medium mt-0.5">
                        Proposed Role: {c.proposedRole}
                      </div>
                      {c.eventTitle && (
                        <div className="text-[11px] text-[#b4b0aa] mt-0.5">
                          Tied to: {c.eventTitle}
                        </div>
                      )}
                      <p className="text-xs text-neutral-400 mt-1 italic">"{c.message}"</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(c.id, 'accepted')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs rounded transition-colors cursor-pointer"
                          >
                            Accept Co-Host
                          </button>
                          <button
                            onClick={() => handleStatusChange(c.id, 'rejected')}
                            className="px-3 py-1.5 bg-[#16181d] hover:bg-[#25272c] text-neutral-400 hover:text-white text-xs rounded transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded text-[11px] font-mono font-bold uppercase ${
                            c.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {c.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Send Proposal Form */}
          <div className="lg:col-span-5 bg-[#111215] border border-[#25272c] rounded-2xl p-6 sm:p-7">
            <h3 className="font-head font-bold text-2xl uppercase text-white mb-1">
              Send Co-Hosting Proposal
            </h3>
            <p className="text-xs text-[#b4b0aa] mb-5">
              Select an organization to partner on an upcoming workout or competition.
            </p>

            <form onSubmit={handleSendProposal} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                  Recipient Organization *
                </label>
                <select
                  required
                  value={selectedRecipientId}
                  onChange={(e) => setSelectedRecipientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white focus:outline-none"
                >
                  <option value="">Choose organization...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.type.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                  Attach to Event (Optional)
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white focus:outline-none"
                >
                  <option value="">General Co-Hosting Partnership</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.displayDate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                  Proposed Co-Hosting Role *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Dynamic Warmup & Mobility Station"
                  value={proposedRole}
                  onChange={(e) => setProposedRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white placeholder-neutral-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                  Collaboration Proposal Message
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain how this co-hosted event benefits both communities, expected attendees, and logistics..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white placeholder-neutral-600 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-[#0a0a0c] border border-[#25272c] rounded-lg text-[11px] text-[#b4b0aa] flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-[#FC5300] shrink-0 mt-0.5" />
                <span>
                  Co-host logos and descriptions will appear alongside the primary organizer on the
                  public event page once accepted.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-sm font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] disabled:opacity-50 rounded-lg transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Sending Proposal...' : 'Dispatch Collaboration Invite'}</span>
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
