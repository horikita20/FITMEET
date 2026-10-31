import React from 'react';
import { Instagram, Facebook, MessageCircle, FileDown } from 'lucide-react';
import { SiteSettings } from '../../types';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (view: string) => void;
  onOpenLegal: (type: 'terms' | 'privacy' | 'refund') => void;
}

const FACEBOOK_URL = 'https://www.facebook.com/fitmeet.in';
const INSTAGRAM_URL = 'https://www.instagram.com/fitmeet.in/';
const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbE5yl8Likg2G1r0I83R';

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate, onOpenLegal }) => {
  return (
    <footer className="bg-slate-100 dark:bg-[#0a0a0c] text-slate-700 dark:text-[#f5f2ee] text-xs border-t border-slate-200 dark:border-[#16171a] transition-colors">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-[#16171a]">
          {/* Logo & Location: Official FitMeet logo and the location text "Patna" */}
          <div className="flex flex-col items-start gap-1">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer group select-none text-left"
              aria-label="FitMeet Patna"
            >
              <div className="bg-black px-2 py-1.5 rounded-lg border border-neutral-800 flex items-center justify-center">
                <img
                  src="/assets/images/fitmeet_logo_master.png"
                  alt="FitMeet"
                  className="h-6 sm:h-7 w-auto object-contain"
                />
              </div>
              <span className="font-head font-bold text-xs sm:text-sm tracking-[0.2em] text-slate-700 dark:text-neutral-300 uppercase">
                PATNA
              </span>
            </button>
            <span className="font-head font-bold text-xs sm:text-sm tracking-[0.2em] text-slate-700 dark:text-neutral-300 uppercase">
              WHERE FITNESS MEETS COMMUNITY
            </span>
          </div>

          {/* Social Media Links: Facebook, Instagram, WhatsApp Channel */}
          <div className="flex items-center gap-3">
            {/* Facebook */}
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded bg-white dark:bg-[#111215] border border-slate-300 dark:border-[#25272c] hover:border-[#1877F2] text-slate-700 dark:text-white hover:text-[#1877F2] transition-colors shadow-sm"
              aria-label="Follow FITMEET on Facebook"
              title="FitMeet Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>

            {/* Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded bg-white dark:bg-[#111215] border border-slate-300 dark:border-[#25272c] hover:border-[#E4405F] text-slate-700 dark:text-white hover:text-[#E4405F] transition-colors shadow-sm"
              aria-label="Follow FITMEET on Instagram"
              title="FitMeet Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>

            {/* WhatsApp Channel */}
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded bg-white dark:bg-[#111215] border border-slate-300 dark:border-[#25272c] hover:border-[#25D366] text-[#25D366] transition-colors shadow-sm"
              aria-label="Follow FITMEET on WhatsApp"
              title="Follow FITMEET Channel on WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Legal & Policies */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-[#8d8a85]">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span>·</span>
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => onOpenLegal('refund')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Refund Policy
            </button>
            <span>·</span>
            <a
              href="/assets/aistudio/FitMeet_Policies_a6e4b93c.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="FitMeet_Policies.pdf"
              className="inline-flex items-center gap-1 text-[#FC5300] hover:text-[#ff7a2e] font-semibold transition-colors"
              title="Download Official FitMeet Policies (Oct 28, 2026)"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Official Policies (PDF)</span>
            </a>
          </div>

          <div>
            © {new Date().getFullYear()} {settings.brandName} Patna. Target Domain: {settings.customDomain}
          </div>
        </div>
      </div>
    </footer>
  );
};
