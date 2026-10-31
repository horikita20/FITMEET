import React, { useState } from 'react';
import { Menu, X, ArrowRight, User, Shield, Briefcase, Ticket, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';

interface HeaderProps {
  currentView: string;
  activeNav?: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onRegisterClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  activeNav = currentView,
  onNavigate,
  onOpenAuth,
  onRegisterClick,
}) => {
  const { user, isAuthenticated, logout, switchRoleDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'runs', label: 'Runs' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'collaborate', label: 'Collaborate With Us' },
    { id: 'faqs', label: 'FAQ' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNav = (id: string) => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    if (id === 'runs') {
      onNavigate('meets');
    } else if (id === 'about') {
      onNavigate('about');
    } else if (id === 'gallery') {
      onNavigate('gallery');
    } else if (id === 'collaborate') {
      onNavigate('collaborate');
    } else if (id === 'faqs') {
      onNavigate('faqs');
    } else if (id === 'contact') {
      onNavigate('contact');
    } else {
      onNavigate(id);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#000000]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#16171a] transition-colors duration-200">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-8">
        {/* Brand Logo - Replaced with official FitMeet wordmark image as requested */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center cursor-pointer group select-none shrink-0 bg-black dark:bg-transparent px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-neutral-800/60 dark:border-transparent transition-colors"
          aria-label="FitMeet Patna"
        >
          <img
            src="/assets/images/fitmeet_logo_master.png"
            alt="FitMeet Patna"
            className="h-7 sm:h-9 w-auto object-contain"
          />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`relative py-7 transition-colors cursor-pointer text-sm font-medium ${
                  isActive
                    ? 'text-slate-950 dark:text-[#FC5300] font-bold'
                    : 'text-slate-600 hover:text-slate-950 dark:text-[#d6d3cd] dark:hover:text-[#ff7a2e]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#00adef] dark:bg-[#FC5300] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Zone: Exactly matches Reference Image 5, 7, 8 */}
        <div className="flex items-center gap-3 sm:gap-6">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center p-1 sm:p-1.5 rounded-full border border-slate-200 dark:border-[#25272c] bg-slate-100 dark:bg-[#111215] hover:border-[#FC5300] dark:hover:border-[#FC5300] transition-colors cursor-pointer"
                title={`${user.fullName} (${user.role})`}
                aria-label="User Account Menu"
              >
                {/* Upper right avatar: FitMeet Emblem logo only */}
                <div className="h-8 w-8 rounded-full overflow-hidden bg-black border border-[#FC5300]/50 flex items-center justify-center shrink-0">
                  <img
                    src="/assets/aistudio/FitMeet_Emblem_original_1_.jpg_3ce53c29.jpeg"
                    alt="FitMeet Member Emblem"
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-[#25272c] bg-white dark:bg-[#111215] shadow-2xl py-2 z-50 text-xs text-slate-800 dark:text-[#f5f2ee]">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-[#25272c]">
                    <p className="font-semibold text-slate-900 dark:text-white">{user.fullName}</p>
                    <p className="text-slate-500 dark:text-neutral-400 text-[11px] truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-[#FC5300]/20 text-[#FC5300] font-mono uppercase font-bold">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => handleNav('user-dashboard')}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-[#16181d] text-left transition-colors cursor-pointer text-slate-700 dark:text-neutral-200"
                  >
                    <Ticket className="h-4 w-4 text-[#FC5300]" />
                    <span>My Registrations & Passes</span>
                  </button>

                  {user.role === 'organizer' && (
                    <button
                      onClick={() => handleNav('organizer-dashboard')}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-[#16181d] text-left transition-colors cursor-pointer text-[#ff7a2e]"
                    >
                      <Briefcase className="h-4 w-4" />
                      <span>Organizer Portal</span>
                    </button>
                  )}

                  {user.role === 'super_admin' && (
                    <button
                      onClick={() => handleNav('admin-dashboard')}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-[#16181d] text-left transition-colors cursor-pointer text-amber-500 dark:text-amber-400"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Super-Admin Console</span>
                    </button>
                  )}

                  {/* Dev Role Switcher for seamless testing */}
                  <div className="px-4 py-2 border-t border-slate-200 dark:border-[#25272c] bg-slate-50 dark:bg-[#0a0a0c]/50">
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400 block mb-1">
                      Dev Role Testing:
                    </span>
                    <div className="flex gap-1">
                      {(['customer', 'organizer', 'super_admin'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => switchRoleDemo(r)}
                          className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-mono cursor-pointer ${
                            user.role === r
                              ? 'bg-[#FC5300] text-white font-bold'
                              : 'bg-slate-200 dark:bg-[#25272c] text-slate-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          {r.replace('_', '')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-red-500 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-[#16181d] text-left border-t border-slate-200 dark:border-[#25272c] transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Sign in text button: Matches Reference Image 5, 7, 8 */}
              <button
                onClick={() => onOpenAuth('signin')}
                className="text-sm font-semibold text-slate-700 hover:text-slate-950 dark:text-[#f5f2ee] dark:hover:text-[#FC5300] transition-colors cursor-pointer py-1.5"
              >
                Sign in
              </button>

              {/* Primary Cyan Pill Button: Register (Matches Reference Image 5, 7, 8) */}
              <button
                onClick={onRegisterClick}
                className="inline-flex items-center justify-center px-6 sm:px-7 py-2 sm:py-2.5 text-sm font-bold text-white bg-[#00adef] hover:bg-[#0098d4] rounded-full transition-all transform active:scale-95 cursor-pointer shadow-md shadow-[#00adef]/25 shrink-0"
              >
                <span>Register</span>
              </button>
            </div>
          )}

          {/* Subtle Theme Toggle placed cleanly after actions */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-slate-800 dark:text-neutral-500 dark:hover:text-white transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-[#ff7a2e]" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 dark:text-neutral-300 hover:text-black dark:hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-[#25272c] bg-white dark:bg-[#0d0d10] px-5 py-4 transition-colors">
          <div className="flex flex-col gap-2">
            {/* Mobile Theme Switcher Bar */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between py-2 px-3 rounded-lg border border-slate-200 dark:border-[#25272c] bg-slate-100 dark:bg-[#16181d] text-xs font-medium text-slate-800 dark:text-neutral-200 mb-2 cursor-pointer"
              aria-label="Toggle Theme Mode"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-[#ff7a2e]" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-700" />
                )}
                <span>Current Theme: <strong className="capitalize">{theme}</strong></span>
              </span>
              <span className="text-[11px] font-semibold text-[#FC5300]">
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`py-2 text-left text-sm font-medium border-b border-slate-100 dark:border-[#1b1c20] transition-colors ${
                  activeNav === item.id
                    ? 'text-[#FC5300] font-bold'
                    : 'text-slate-700 dark:text-neutral-300'
                }`}
              >
                {item.label}
              </button>
            ))}

            {isAuthenticated && user && (
              <>
                <button
                  onClick={() => handleNav('user-dashboard')}
                  className="py-2 text-left text-sm font-semibold text-[#FC5300] flex items-center justify-between border-b border-slate-100 dark:border-[#1b1c20]"
                >
                  <span>My Registrations</span>
                  <Ticket className="h-4 w-4" />
                </button>
                {user.role === 'organizer' && (
                  <button
                    onClick={() => handleNav('organizer-dashboard')}
                    className="py-2 text-left text-sm font-semibold text-[#ff7a2e] flex items-center justify-between border-b border-slate-100 dark:border-[#1b1c20]"
                  >
                    <span>Organizer Dashboard</span>
                    <Briefcase className="h-4 w-4" />
                  </button>
                )}
                {user.role === 'super_admin' && (
                  <button
                    onClick={() => handleNav('admin-dashboard')}
                    className="py-2 text-left text-sm font-semibold text-amber-500 dark:text-amber-400 flex items-center justify-between border-b border-slate-100 dark:border-[#1b1c20]"
                  >
                    <span>Super Admin Console</span>
                    <Shield className="h-4 w-4" />
                  </button>
                )}
              </>
            )}

            {!isAuthenticated && (
              <div className="pt-3 mt-1 flex flex-col gap-2 border-t border-slate-100 dark:border-[#1b1c20]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onRegisterClick();
                  }}
                  className="w-full py-2.5 px-4 text-center text-xs font-bold uppercase tracking-wider text-white bg-[#00adef] hover:bg-[#0098d4] rounded-full shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Register</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signin');
                  }}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:text-[#FC5300] cursor-pointer"
                >
                  Already have an account? Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
