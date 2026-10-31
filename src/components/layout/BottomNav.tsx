import React from 'react';
import { Home, Calendar, Users, User, Ticket } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenProfile: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenProfile,
}) => {
  const isHome = currentView === 'home';
  const isMeets = currentView === 'meets' || currentView === 'discover' || currentView === 'events';
  const isCommunity = currentView === 'collaborate';
  const isProfile = currentView === 'user-dashboard';

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#000000]/95 backdrop-blur-lg border-t border-slate-200 dark:border-[#1a1b20] py-2 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-colors"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            isHome
              ? 'text-[#FC5300] font-bold'
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className={`h-5 w-5 ${isHome ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-wide font-medium">Home</span>
        </button>

        {/* 2. Meets */}
        <button
          onClick={() => onNavigate('meets')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            isMeets
              ? 'text-[#FC5300] font-bold'
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className={`h-5 w-5 ${isMeets ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-wide font-medium">Meets</span>
        </button>

        {/* 3. Community */}
        <button
          onClick={() => onNavigate('collaborate')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            isCommunity
              ? 'text-[#FC5300] font-bold'
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className={`h-5 w-5 ${isCommunity ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-wide font-medium">Community</span>
        </button>

        {/* 4. My Events / Profile */}
        <button
          onClick={onOpenProfile}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            isProfile
              ? 'text-[#FC5300] font-bold'
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className={`h-5 w-5 ${isProfile ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-wide font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};
