import React, { useState } from 'react';
import { Ticket, Calendar, Clock, MapPin, QrCode, Download, CreditCard, User, AlertCircle, Trash2 } from 'lucide-react';
import { EventRegistration } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface UserDashboardProps {
  registrations: EventRegistration[];
  onOpenPass: (reg: EventRegistration) => void;
  onCancelRegistration: (id: string) => void;
  onExploreEvents: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  registrations,
  onOpenPass,
  onCancelRegistration,
  onExploreEvents,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'payments' | 'profile'>('upcoming');

  return (
    <div className="py-12 sm:py-16 bg-[#0a0a0c] min-h-screen text-[#f5f2ee]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* User Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111215] border border-[#25272c] flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#FC5300]/20 text-[#FC5300] border border-[#FC5300]/40 flex items-center justify-center font-head text-2xl font-bold">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-head font-bold text-2xl sm:text-3xl uppercase text-white">
                  {user?.fullName || 'Fitness Athlete'}
                </h1>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#FC5300]/20 text-[#FC5300]">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-[#b4b0aa] mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExploreEvents}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] rounded-lg transition-colors cursor-pointer"
            >
              Browse New Events
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-3 border-b border-[#25272c] mb-8 pb-3">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-[#FC5300] text-white'
                : 'text-[#b4b0aa] hover:text-white hover:bg-[#16181d]'
            }`}
          >
            <Ticket className="h-4 w-4" />
            <span>My Event Passes ({registrations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-[#FC5300] text-white'
                : 'text-[#b4b0aa] hover:text-white hover:bg-[#16181d]'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Payment History</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[#FC5300] text-white'
                : 'text-[#b4b0aa] hover:text-white hover:bg-[#16181d]'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile & Athlete Info</span>
          </button>
        </div>

        {/* Content by Tab */}
        {activeTab === 'upcoming' && (
          <div>
            {registrations.length === 0 ? (
              <div className="text-center py-16 bg-[#111215] border border-dashed border-[#25272c] rounded-2xl p-8">
                <Ticket className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
                <h3 className="font-head font-bold text-xl uppercase text-white">
                  No Event Registrations Yet
                </h3>
                <p className="text-xs text-[#b4b0aa] max-w-sm mx-auto mt-1">
                  You haven't RSVP'd for any upcoming runs or gym meetups.
                </p>
                <button
                  onClick={onExploreEvents}
                  className="mt-5 px-5 py-2.5 bg-[#FC5300] text-white font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-[#ff7a2e] transition-colors cursor-pointer"
                >
                  Discover Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-[#111215] border border-[#25272c] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-[#FC5300]" />

                    <div>
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#25272c] pt-1">
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-xs text-[#FC5300] font-bold block">
                            REF: {reg.referenceId}
                          </span>
                          <h4 className="font-head font-bold text-xl uppercase text-white mt-0.5 line-clamp-2">
                            {reg.eventTitle}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-emerald-500/20 text-emerald-400 shrink-0">
                          {reg.paymentStatus}
                        </span>
                      </div>

                      <div className="py-4 space-y-2 text-xs text-[#e4e1dc]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#FC5300]" />
                          <span>{reg.eventDate} · {reg.eventTime}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-[#FC5300] shrink-0 mt-0.5" />
                          <span className="text-[#b4b0aa]">{reg.eventVenue}, {reg.eventCity}</span>
                        </div>
                        <div className="pt-2 text-[11px] text-[#b4b0aa]">
                          Participant: <strong className="text-white">{reg.fullName}</strong> ({reg.ticketCount} Seat)
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#25272c] flex items-center justify-between">
                      <button
                        onClick={() => onOpenPass(reg)}
                        className="py-2 px-3 bg-[#16181d] hover:bg-[#25272c] border border-[#25272c] rounded-lg text-xs font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <QrCode className="h-4 w-4 text-[#FC5300]" />
                        <span>View Digital Pass</span>
                      </button>

                      <button
                        onClick={() => onCancelRegistration(reg.id)}
                        className="p-2 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Cancel Registration"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-[#111215] border border-[#25272c] rounded-xl overflow-hidden">
            <div className="p-5 border-b border-[#25272c]">
              <h3 className="font-head font-bold text-lg uppercase text-white">
                Payment Transactions & Receipts
              </h3>
              <p className="text-xs text-[#b4b0aa]">
                Processed securely via Razorpay Standard Checkout in Indian Rupees (INR).
              </p>
            </div>

            <div className="divide-y divide-[#25272c] text-xs">
              {registrations.map((reg) => (
                <div key={reg.id} className="p-4 sm:p-5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">{reg.eventTitle}</span>
                    <span className="text-[11px] text-[#b4b0aa] font-mono">
                      Ref: {reg.referenceId} · Order: {reg.razorpayOrderId || 'N/A (Free)'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-white block">
                      {reg.totalAmountInPaise === 0
                        ? '₹0.00'
                        : `₹${(reg.totalAmountInPaise / 100).toFixed(2)}`}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-emerald-400">
                      {reg.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-[#111215] border border-[#25272c] rounded-xl p-6 sm:p-8 max-w-xl space-y-4">
            <h3 className="font-head font-bold text-xl uppercase text-white">
              Athlete Profile & Contact
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#b4b0aa] block mb-1">Full Name</label>
                <div className="p-2.5 bg-[#0a0a0c] border border-[#25272c] rounded text-white font-medium">
                  {user?.fullName}
                </div>
              </div>

              <div>
                <label className="text-[#b4b0aa] block mb-1">Email Address</label>
                <div className="p-2.5 bg-[#0a0a0c] border border-[#25272c] rounded text-white font-mono">
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="text-[#b4b0aa] block mb-1">Account Role</label>
                <div className="p-2.5 bg-[#0a0a0c] border border-[#25272c] rounded text-[#FC5300] font-mono uppercase font-bold">
                  {user?.role}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
