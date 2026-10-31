import React, { useState, useEffect } from 'react';
import { Shield, Users, Calendar, CreditCard, Building2, Check, X, FileText, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { SiteSettings, FitnessEvent, Organization } from '../../types';
import { fetchAdminOverview, reviewOrganizerApp, updateSiteSettings } from '../../lib/api';

interface AdminDashboardProps {
  settings: SiteSettings;
  events: FitnessEvent[];
  organizations: Organization[];
  onSettingsUpdated: (newSettings: SiteSettings) => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  events,
  organizations,
  onSettingsUpdated,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'cms' | 'events' | 'logs'>('applications');
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable CMS fields
  const [headline, setHeadline] = useState(settings.heroHeadline);
  const [subheadline, setSubheadline] = useState(settings.heroSubheadline);
  const [lead, setLead] = useState(settings.heroLead);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [contactAddress, setContactAddress] = useState(settings.contactAddress);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOverview();
      setAdminData(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (appId: string, decision: 'approved' | 'rejected') => {
    try {
      await reviewOrganizerApp(appId, decision);
      await loadData();
      onRefreshData();
    } catch {
      alert('Failed to review application');
    }
  };

  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      ...settings,
      heroHeadline: headline,
      heroSubheadline: subheadline,
      heroLead: lead,
      accentColor,
      contactEmail,
      contactPhone,
      contactAddress,
    };

    const ok = await updateSiteSettings(updated);
    if (ok) {
      onSettingsUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-[#0a0a0c] min-h-screen text-[#f5f2ee]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Admin Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111215] border border-[#25272c] flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Shield className="h-4 w-4" />
              <span>Platform Owner Console</span>
            </div>
            <h1 className="font-head font-bold text-3xl uppercase text-white">
              FitMeet Super-Admin Dashboard
            </h1>
            <p className="text-xs text-[#b4b0aa] mt-1">
              Review organizer applications, moderate events, adjust CMS settings, and audit transactions.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#16181d] hover:bg-[#25272c] border border-[#25272c] rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>
        </div>

        {/* 4-KPI Overview Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 bg-[#111215] border border-[#25272c] rounded-xl">
            <span className="text-[10px] text-[#b4b0aa] uppercase font-bold tracking-wider block">
              Total Events
            </span>
            <span className="font-head text-3xl font-bold text-white mt-1 block">
              {adminData?.totalEvents || events.length}
            </span>
          </div>

          <div className="p-5 bg-[#111215] border border-[#25272c] rounded-xl">
            <span className="text-[10px] text-[#b4b0aa] uppercase font-bold tracking-wider block">
              Total Registrations
            </span>
            <span className="font-head text-3xl font-bold text-[#FC5300] mt-1 block">
              {adminData?.totalRegistrations || 14}
            </span>
          </div>

          <div className="p-5 bg-[#111215] border border-[#25272c] rounded-xl">
            <span className="text-[10px] text-[#b4b0aa] uppercase font-bold tracking-wider block">
              Pending Applications
            </span>
            <span className="font-head text-3xl font-bold text-amber-400 mt-1 block">
              {adminData?.pendingApplications?.length || 0}
            </span>
          </div>

          <div className="p-5 bg-[#111215] border border-[#25272c] rounded-xl">
            <span className="text-[10px] text-[#b4b0aa] uppercase font-bold tracking-wider block">
              Total Razorpay Revenue
            </span>
            <span className="font-head text-3xl font-bold text-emerald-400 mt-1 block">
              ₹{((adminData?.totalRevenuePaise || 0) / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-3 border-b border-[#25272c] mb-8 pb-3">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-[#FC5300] text-white'
                : 'text-[#b4b0aa] hover:text-white hover:bg-[#16181d]'
            }`}
          >
            Organizer Approvals ({adminData?.pendingApplications?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeTab === 'cms'
                ? 'bg-[#FC5300] text-white'
                : 'text-[#b4b0aa] hover:text-white hover:bg-[#16181d]'
            }`}
          >
            Website Content & CMS
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeTab === 'events'
                ? 'bg-[#FC5300] text-white'
                : 'text-[#b4b0aa] hover:text-white hover:bg-[#16181d]'
            }`}
          >
            Event Moderation ({events.length})
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-[#FC5300] text-white'
                : 'text-[#b4b0aa] hover:text-white hover:bg-[#16181d]'
            }`}
          >
            Security Audit Trail
          </button>
        </div>

        {/* Tab 1: Organizer Applications */}
        {activeTab === 'applications' && (
          <div className="bg-[#111215] border border-[#25272c] rounded-xl p-6 sm:p-8 space-y-6">
            <h2 className="font-head font-bold text-2xl uppercase text-white">
              Pending Organizer Verification Applications
            </h2>

            {(!adminData?.pendingApplications || adminData.pendingApplications.length === 0) ? (
              <div className="text-center py-12 text-[#b4b0aa]">
                <p className="text-sm">No pending organizer applications in the queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {adminData.pendingApplications.map((app: any) => (
                  <div
                    key={app.id}
                    className="p-5 bg-[#0a0a0c] border border-[#25272c] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-head font-bold text-xl uppercase text-white">
                          {app.organizationName}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#FC5300]/20 text-[#FC5300]">
                          {app.organizationType}
                        </span>
                      </div>
                      <div className="text-xs text-[#b4b0aa] mt-1 space-x-3">
                        <span>City: {app.city}</span>
                        <span>·</span>
                        <span>Email: {app.contactEmail}</span>
                        <span>·</span>
                        <span>Phone: {app.contactPhone}</span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                        {app.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReview(app.id, 'approved')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Approve & Grant Perms
                      </button>
                      <button
                        onClick={() => handleReview(app.id, 'rejected')}
                        className="px-3 py-2 bg-[#16181d] hover:bg-red-950 text-red-400 font-bold uppercase text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: CMS Settings */}
        {activeTab === 'cms' && (
          <div className="bg-[#111215] border border-[#25272c] rounded-xl p-6 sm:p-8 max-w-2xl">
            <h2 className="font-head font-bold text-2xl uppercase text-white mb-1">
              Configure Homepage Content & Settings
            </h2>
            <p className="text-xs text-[#b4b0aa] mb-6">
              Update client copy, contact phone, accent color, and branding in real-time without modifying code.
            </p>

            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Website settings updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveCMS} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                  Hero Eyebrow / Subheadline
                </label>
                <input
                  type="text"
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                  Hero Main Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                  Hero Lead Paragraph
                </label>
                <textarea
                  rows={2}
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                    Primary Accent Color (Hex)
                  </label>
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                    Client Domain Target
                  </label>
                  <input
                    type="text"
                    disabled
                    value={settings.customDomain}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-[#25272c] rounded-lg text-[#b4b0aa] font-mono opacity-80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b4b0aa] mb-1">
                  Physical / Deck Address
                </label>
                <input
                  type="text"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0c] border border-[#25272c] focus:border-[#FC5300] rounded-lg text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 text-sm font-bold uppercase tracking-wider text-white bg-[#FC5300] hover:bg-[#ff7a2e] rounded-lg transition-colors cursor-pointer shadow-md mt-4"
              >
                Save CMS Updates
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Event Moderation */}
        {activeTab === 'events' && (
          <div className="bg-[#111215] border border-[#25272c] rounded-xl p-6 sm:p-8 space-y-4">
            <h2 className="font-head font-bold text-2xl uppercase text-white">
              Event Moderation Queue
            </h2>

            <div className="divide-y divide-[#25272c] text-xs">
              {events.map((ev) => (
                <div key={ev.id} className="py-4 flex items-center justify-between">
                  <div>
                    <span className="font-head font-bold text-lg uppercase text-white block">
                      {ev.title}
                    </span>
                    <span className="text-[#b4b0aa] text-xs">
                      {ev.displayDate} · {ev.venue}, {ev.city} · Host: {ev.primaryOrganizerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-white">
                      {ev.priceInPaise === 0 ? 'FREE' : `₹${(ev.priceInPaise / 100).toFixed(0)}`}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-emerald-500/20 text-emerald-400">
                      {ev.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Security Audit Trail */}
        {activeTab === 'logs' && (
          <div className="bg-[#111215] border border-[#25272c] rounded-xl p-6 sm:p-8 space-y-4">
            <h2 className="font-head font-bold text-2xl uppercase text-white">
              Immutable Security Audit Logs
            </h2>
            <div className="space-y-2 text-xs font-mono">
              {adminData?.auditLogs?.map((log: any) => (
                <div key={log.id} className="p-3 bg-[#0a0a0c] border border-[#25272c] rounded-lg">
                  <div className="flex items-center justify-between text-[#FC5300] mb-1">
                    <span className="font-bold">{log.action}</span>
                    <span className="text-[#b4b0aa] text-[10px]">{log.timestamp}</span>
                  </div>
                  <div className="text-white">{log.details}</div>
                  <div className="text-[10px] text-[#8d8a85] mt-1">Actor: {log.actorEmail}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
