import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  RefreshCw,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';

export type LegalTab = 'terms' | 'privacy' | 'refund' | 'all';

interface LegalModalProps {
  type: 'terms' | 'privacy' | 'refund' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const [activeTab, setActiveTab] = useState<LegalTab>('terms');

  useEffect(() => {
    if (type) {
      setActiveTab(type);
    }
  }, [type]);

  if (!type) return null;

  const pdfUrl = '/assets/aistudio/FitMeet_Policies_a6e4b93c.pdf';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#111215] border border-[#25272c] rounded-2xl shadow-2xl text-[#f5f2ee] max-h-[90vh] flex flex-col overflow-hidden my-4 sm:my-8 animate-fade-in">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-[#25272c] bg-[#16171d]/90 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FC5300]/15 text-[#FC5300] text-[10px] font-bold tracking-wider uppercase border border-[#FC5300]/30">
                <Sparkles className="h-3 w-3" />
                Official Policy Document
              </span>
            </div>
            <h2 className="font-head font-bold text-2xl sm:text-3xl uppercase text-white tracking-tight">
              FitMeet Policies
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              download="FitMeet_Policies.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f2229] hover:bg-[#282c35] text-[#FC5300] hover:text-[#ff7a2e] text-xs font-semibold border border-[#303440] transition-colors"
              title="Download Original Signed PDF"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer hover:bg-white/5"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#25272c] px-6 bg-[#0e0f12] overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-4 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'border-[#FC5300] text-white bg-white/[0.02]'
                : 'border-transparent text-[#8d8a85] hover:text-neutral-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-[#FC5300]" />
            Terms & Conditions
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'border-[#FC5300] text-white bg-white/[0.02]'
                : 'border-transparent text-[#8d8a85] hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#FC5300]" />
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`py-3 px-4 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'refund'
                ? 'border-[#FC5300] text-white bg-white/[0.02]'
                : 'border-transparent text-[#8d8a85] hover:text-neutral-200'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#FC5300]" />
            Refund Policy
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3 px-4 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'all'
                ? 'border-[#FC5300] text-white bg-white/[0.02]'
                : 'border-transparent text-[#8d8a85] hover:text-neutral-200'
            }`}
          >
            <span>View All</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 text-xs sm:text-sm text-[#cac5be]">
          {/* TAB 1: TERMS & CONDITIONS */}
          {(activeTab === 'terms' || activeTab === 'all') && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#FC5300]">
                <FileText className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Community Rules</span>
              </div>
              <h3 className="font-head font-bold text-2xl uppercase text-white">
                Terms & Conditions
              </h3>

              {/* In short highlight box */}
              <div className="p-3.5 rounded-xl bg-[#171920] border-l-4 border-[#FC5300] text-[#f5f2ee]">
                <span className="font-bold text-[#FC5300] uppercase text-[11px] tracking-wide block mb-0.5">
                  In short:
                </span>
                <p className="text-sm">Come if you can make it, train at your own pace, and play fair.</p>
              </div>

              <div className="space-y-4 pt-2 text-[#b4b0aa] leading-relaxed">
                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-1">
                    1. Using FitMeet
                  </h4>
                  <p>
                    By using this website or joining a meet, you agree to these terms. If you don't agree, please don't use FitMeet.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-1">
                    2. Who can join
                  </h4>
                  <p>
                    Every meet happens in person at a gym or outdoor spot in Patna. Register only if you can be there on the day. Your spot is personal and can't be passed on to someone else.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-1">
                    3. Your safety
                  </h4>
                  <p>
                    Fitness activities come with some risk. By joining, you confirm you're fit enough to take part. FitMeet, its organizers and its collaborators are not responsible for any injury, loss or damage during a meet.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-1">
                    4. Registration and payment
                  </h4>
                  <p>
                    Please fill in your details correctly. For paid meets, your spot is confirmed only once payment goes through. If you register but don't show up, no refund will be given. See our Refund Policy for details.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-1">
                    5. Photos and videos
                  </h4>
                  <p>
                    We capture moments at every meet. By taking part, you allow FitMeet to use these photos and videos on our website and social media.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-1">
                    6. Updates to these terms
                  </h4>
                  <p>
                    We may update these terms from time to time. Please check this page now and then.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {(activeTab === 'privacy' || activeTab === 'all') && (
            <section className={`space-y-4 ${activeTab === 'all' ? 'pt-8 border-t border-[#25272c]' : ''}`}>
              <div className="flex items-center gap-2 text-[#FC5300]">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Privacy & Protection</span>
              </div>
              <h3 className="font-head font-bold text-2xl uppercase text-white">
                Privacy Policy
              </h3>

              {/* In short highlight box */}
              <div className="p-3.5 rounded-xl bg-[#171920] border-l-4 border-[#FC5300] text-[#f5f2ee]">
                <span className="font-bold text-[#FC5300] uppercase text-[11px] tracking-wide block mb-0.5">
                  In short:
                </span>
                <p className="text-sm">We collect only what we need to run your meet, we keep it safe, and we never sell it.</p>
              </div>

              <div className="space-y-4 pt-2 text-[#b4b0aa] leading-relaxed">
                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-1">
                    What we collect
                  </h4>
                  <p>
                    When you join a meet or create a profile, we may ask for your name, email, phone number, age, gender and fitness level.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-1">
                    Why we collect it
                  </h4>
                  <p>
                    To confirm your spot, send you meet updates, keep our community safe, and make FitMeet better.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-1">
                    How we protect it
                  </h4>
                  <p>
                    Your data is protected with standard security measures. No website can promise 100% security, but we work to keep your information private and safe.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-1">
                    Who else sees it
                  </h4>
                  <p>
                    Payments are handled by Razorpay. It receives only the details needed to process your payment and cannot use them for anything else. We never sell your data.
                  </p>
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-1">
                    Questions?
                  </h4>
                  <p>
                    Reach us anytime through the contact section on our website.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: REFUND POLICY */}
          {(activeTab === 'refund' || activeTab === 'all') && (
            <section className={`space-y-4 ${activeTab === 'all' ? 'pt-8 border-t border-[#25272c]' : ''}`}>
              <div className="flex items-center gap-2 text-[#FC5300]">
                <RefreshCw className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Payments & Refunds</span>
              </div>
              <h3 className="font-head font-bold text-2xl uppercase text-white">
                Refund Policy
              </h3>

              {/* In short highlight box */}
              <div className="p-3.5 rounded-xl bg-[#171920] border-l-4 border-[#FC5300] text-[#f5f2ee]">
                <span className="font-bold text-[#FC5300] uppercase text-[11px] tracking-wide block mb-0.5">
                  In short:
                </span>
                <p className="text-sm">
                  If we cancel or change a meet, you get your money back. If you can't make it, you don't. Once confirmed, registrations are non-refundable and can't be transferred.
                </p>
              </div>

              <div className="space-y-5 pt-2 text-[#b4b0aa] leading-relaxed">
                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    You'll get a refund if:
                  </h4>
                  <ul className="space-y-1.5 pl-6 list-disc text-sm text-[#e0dcd5]">
                    <li>FitMeet cancels the meet</li>
                    <li>The meet moves to a new date and you can't attend</li>
                    <li>FitMeet makes a major change to the meet</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-2 flex items-center gap-2">
                    <AlertOctagon className="h-4 w-4 text-amber-400 shrink-0" />
                    You won't get a refund if:
                  </h4>
                  <ul className="space-y-1.5 pl-6 list-disc text-sm text-[#b4b0aa]">
                    <li>You don't show up</li>
                    <li>Your plans change</li>
                    <li>You arrive late or can't take part</li>
                    <li>The weather isn't great, unless FitMeet cancels the meet</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-bold text-sm uppercase mb-1">
                    How refunds work
                  </h4>
                  <p>
                    Approved refunds reach your account within 7–14 working days. By registering for a meet, you agree to this policy.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Official Document Banner */}
          <div className="p-4 rounded-xl bg-[#161820] border border-[#262832] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#9d9992]">
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-[#FC5300] shrink-0" />
              <span>
                Original document uploaded: <strong className="text-white">FitMeet_Policies_a6e4b93c.pdf</strong>
              </span>
            </div>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#FC5300] hover:text-[#ff7a2e] font-semibold transition-colors"
            >
              <span>Open raw PDF</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-6 py-4 border-t border-[#25272c] bg-[#14151a] flex items-center justify-between gap-4">
          <a
            href={pdfUrl}
            download="FitMeet_Policies.pdf"
            className="inline-flex items-center gap-1.5 text-xs text-[#8d8a85] hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-[#FC5300]" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#FC5300] hover:bg-[#ff7a2e] text-white font-bold uppercase text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
