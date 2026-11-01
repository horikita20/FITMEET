import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/home/Hero';
import { FeatureStrip } from './components/home/FeatureStrip';
import { FirstSundaySection } from './components/home/FirstSundaySection';
import { WhyJoinSection } from './components/home/WhyJoinSection';
import { CollaborateSection } from './components/home/CollaborateSection';
import { AboutSection } from './components/home/AboutSection';
import { FaqSection } from './components/home/FaqSection';
import { ContactSection } from './components/home/ContactSection';
import { EventDiscovery } from './components/events/EventDiscovery';
import { EventDetailModal } from './components/events/EventDetailModal';
import { RegistrationModal } from './components/registration/RegistrationModal';
import { WaitlistModal } from './components/events/WaitlistModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { OrganizerDashboard } from './components/organizer/OrganizerDashboard';
import { CollaboratePage } from './components/collaboration/CollaboratePage';
import { AdminPortal } from './components/admin/AdminPortal';
import { LegalModal } from './components/legal/LegalModal';
import { MeetsPage } from './components/meets/MeetsPage';
import { AboutPage } from './components/about/AboutPage';
import { GallerySection } from './components/home/GallerySection';
import { PartnerSection } from './components/home/PartnerSection';
import {
  fetchEvents,
  fetchOrganizations,
  fetchCollaborations,
  fetchUserRegistrations,
  fetchSiteSettings,
} from './lib/api';
import { FitnessEvent, Organization, EventRegistration, CollaborationRequest, SiteSettings } from './types';
import { Check, X } from 'lucide-react';

// Helper function to resolve view and active navigation state from the URL hash
const getViewFromHash = (): { view: string; nav: string } => {
  if (typeof window === 'undefined') return { view: 'home', nav: 'home' };
  const rawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
  if (!rawHash || rawHash === 'home') {
    return { view: 'home', nav: 'home' };
  }
  if (rawHash === 'about') {
    return { view: 'about', nav: 'about' };
  }
  if (rawHash === 'runs' || rawHash === 'meets' || rawHash === 'events' || rawHash === 'discover') {
    return { view: 'meets', nav: 'runs' };
  }
  if (rawHash === 'gallery') {
    return { view: 'gallery', nav: 'gallery' };
  }
  if (rawHash === 'collaborate' || rawHash === 'community') {
    return { view: 'collaborate', nav: 'collaborate' };
  }
  if (rawHash === 'careers') {
    return { view: 'careers', nav: 'careers' };
  }
  if (rawHash === 'contact') {
    return { view: 'contact', nav: 'contact' };
  }
  if (rawHash === 'faqs') {
    return { view: 'faqs', nav: 'faqs' };
  }
  if (rawHash === 'user-dashboard') {
    return { view: 'user-dashboard', nav: '' };
  }
  if (rawHash === 'organizer-dashboard') {
    return { view: 'organizer-dashboard', nav: '' };
  }
  return { view: 'home', nav: 'home' };
};

function FitMeetApp() {
  const { user, isAuthenticated } = useAuth();

  // Navigation State initialized from URL hash for refresh and bookmark support
  const initialNav = getViewFromHash();
  const [currentView, setCurrentView] = useState<string>(initialNav.view);
  const [activeNav, setActiveNav] = useState<string>(initialNav.nav);

  // Core Data
  const [settings, setSettings] = useState<SiteSettings>({
    brandName: 'FITMEET',
    tagline: 'Run Together. Grow Together.',
    heroHeadline: 'Challenge Yourself. Expand Your Circle.',
    heroSubheadline: "Patna & India's Fitness Community",
    heroLead:
      'FitMeet Patna is a growing fitness community that brings together people who want to challenge themselves, make new friends, learn from great coaches and explore different gyms — all while having fun.',
    primaryCity: 'Patna',
    accentColor: '#FC5300',
    contactEmail: 'contact@fitmeet.in',
    contactPhone: '+91 98350 12345',
    contactAddress: 'Ganga Pathway (Marine Drive), Digha, Patna, Bihar 800011',
    instagramUrl: 'https://instagram.com/fitmeet.in',
    youtubeUrl: 'https://youtube.com/@fitmeet',
    twitterUrl: 'https://x.com/fitmeet',
    customDomain: 'fitmeet.in',
  });

  const [events, setEvents] = useState<FitnessEvent[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [collaborations, setCollaborations] = useState<CollaborationRequest[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<EventRegistration[]>([]);

  // Modals
  const [selectedEvent, setSelectedEvent] = useState<FitnessEvent | null>(null);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const [waitlistEvent, setWaitlistEvent] = useState<FitnessEvent | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [contactInterest, setContactInterest] = useState<string | undefined>(undefined);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | 'refund' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = async () => {
    try {
      const [fetchedSettings, fetchedEvents, fetchedOrgs, fetchedCollabs, fetchedRegs] =
        await Promise.all([
          fetchSiteSettings(),
          fetchEvents(),
          fetchOrganizations(),
          fetchCollaborations(),
          fetchUserRegistrations(user?.id),
        ]);

      if (fetchedSettings) setSettings(fetchedSettings);
      if (fetchedEvents.length) setEvents(fetchedEvents);
      if (fetchedOrgs.length) setOrganizations(fetchedOrgs);
      if (fetchedCollabs.length) setCollaborations(fetchedCollabs);
      if (fetchedRegs.length) setUserRegistrations(fetchedRegs);
    } catch (err) {
      console.error('Failed to load initial FitMeet data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user?.id]);

  // Synchronize route on browser back/forward and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const resolved = getViewFromHash();
      setCurrentView(resolved.view);
      setActiveNav(resolved.nav);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenRegistration = (event: FitnessEvent) => {
    setSelectedEvent(event);
    setEventDetailOpen(false);
    setRegistrationModalOpen(true);
  };

  const handleOpenDetail = (event: FitnessEvent) => {
    setSelectedEvent(event);
    setEventDetailOpen(true);
  };

  const handleNavigate = (view: string) => {
    let targetHash = view;
    if (view === 'runs' || view === 'meets' || view === 'events' || view === 'discover') {
      targetHash = 'runs';
    } else if (view === 'home') {
      targetHash = 'home';
    }

    const newHash = `#${targetHash}`;
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    } else {
      const resolved = getViewFromHash();
      setCurrentView(resolved.view);
      setActiveNav(resolved.nav);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRegisterFlagship = () => {
    handleNavigate('meets');
  };

  const handleRegistrationSuccess = (reg: EventRegistration) => {
    setUserRegistrations((prev) => [reg, ...prev]);
    // refresh events capacity
    fetchEvents().then((evs) => setEvents(evs));
    showToast(`Pass confirmed for ${reg.eventTitle}! Reference: ${reg.referenceId}`);
  };

  const handleCancelRegistration = (id: string) => {
    setUserRegistrations((prev) => prev.filter((r) => r.id !== id));
    showToast('Registration cancelled. Slot released to waitlist.');
    fetchEvents().then((evs) => setEvents(evs));
  };

  const flagshipEvent = events.find((e) => e.featured) || events[0];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col font-body selection:bg-[#FC5300] selection:text-white transition-colors duration-200">
      {/* Top Header */}
      <Header
        currentView={currentView}
        activeNav={activeNav}
        onNavigate={handleNavigate}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}
        onRegisterClick={() => {
          setAuthMode('signup');
          setAuthModalOpen(true);
        }}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero
              settings={settings}
              onRegisterClick={() => handleNavigate('meets')}
              onExploreClick={() => handleNavigate('meets')}
              onCollaborateClick={() => handleNavigate('collaborate')}
            />
            <FeatureStrip />
            <AboutSection onLearnMoreClick={() => handleNavigate('meets')} />
            <FirstSundaySection />
            <WhyJoinSection />
            <CollaborateSection onCollaborateClick={() => handleNavigate('collaborate')} />
            <PartnerSection onPartnerClick={() => handleNavigate('collaborate')} />
          </>
        )}

        {(currentView === 'meets' || currentView === 'discover' || currentView === 'events' || currentView === 'runs') && (
          <MeetsPage
            events={events}
            onNavigateHome={() => handleNavigate('home')}
            onJoinMeet={handleOpenRegistration}
            onSelectEvent={handleOpenDetail}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            onJoinClick={() => handleNavigate('meets')}
            onExploreClick={() => handleNavigate('meets')}
          />
        )}

        {currentView === 'gallery' && (
          <div className="py-12 bg-[#0a0a0c]">
            <GallerySection />
          </div>
        )}

        {currentView === 'careers' && (
          <div className="py-16 bg-[#0a0a0c]">
            <div className="mx-auto max-w-[1240px] px-4 sm:px-8 mb-10 text-center">
              <span className="text-[#ff5a1f] font-head font-bold text-xs uppercase tracking-widest">CAREERS AT FITMEET</span>
              <h1 className="font-head font-black text-3xl sm:text-5xl uppercase text-white mt-2">Join the FitMeet Team</h1>
              <p className="mt-4 text-[#9a9aa3] max-w-xl mx-auto text-sm sm:text-base">
                We are building Patna's most energetic fitness community. We're looking for trainers, coaches, event coordinators, and content creators.
              </p>
            </div>
            <ContactSection settings={settings} initialInterest="Careers / Job Application" />
          </div>
        )}

        {currentView === 'collaborate' && (
          <CollaboratePage />
        )}

        {currentView === 'faqs' && (
          <div className="py-12 bg-[#0a0a0c]">
            <FaqSection />
          </div>
        )}

        {currentView === 'contact' && (
          <div className="py-12 bg-[#0a0a0c]">
            <ContactSection settings={settings} />
          </div>
        )}

        {currentView === 'user-dashboard' && (
          <UserDashboard
            registrations={userRegistrations}
            onOpenPass={(reg) => {
              const matched = events.find((e) => e.id === reg.eventId) || null;
              setSelectedEvent(matched);
              setRegistrationModalOpen(true);
            }}
            onCancelRegistration={handleCancelRegistration}
            onExploreEvents={() => {
              setCurrentView('discover');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'organizer-dashboard' && (
          <OrganizerDashboard
            events={events}
            organizations={organizations}
            allRegistrations={userRegistrations}
            onEventCreated={(ev) => {
              setEvents((prev) => [ev, ...prev]);
              showToast(`Event "${ev.title}" published!`);
            }}
            onViewEvent={handleOpenDetail}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigate={handleNavigate}
        onOpenLegal={(type) => setLegalModalType(type)}
      />

      {/* Modals */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={eventDetailOpen}
        onClose={() => setEventDetailOpen(false)}
        onRegisterClick={handleOpenRegistration}
      />

      <RegistrationModal
        event={selectedEvent}
        isOpen={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />

      <WaitlistModal
        isOpen={waitlistModalOpen}
        event={waitlistEvent}
        onClose={() => setWaitlistModalOpen(false)}
        onSuccess={() => showToast("You're on the waitlist! Join the WhatsApp Community.")}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => showToast('Welcome to FitMeet!')}
        onOpenTerms={() => setLegalModalType('terms')}
        onOpenPrivacy={() => setLegalModalType('privacy')}
      />

      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Live Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#111215] border border-[#FC5300] text-white rounded-xl shadow-2xl backdrop-blur-md animate-fade-in text-xs font-semibold">
          <div className="h-6 w-6 rounded-full bg-[#FC5300]/20 flex items-center justify-center text-[#FC5300]">
            <Check className="h-4 w-4" />
          </div>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-white ml-1 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  if (typeof window !== 'undefined' && /^\/(?:FITMEET\/)?admin(?:\/login)?\/?$/i.test(window.location.pathname)) {
    return <AdminPortal />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <FitMeetApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
