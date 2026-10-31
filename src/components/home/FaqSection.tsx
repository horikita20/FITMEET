import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'What is FitMeet?',
    a: 'FitMeet Patna is a growing fitness community for people who want to challenge themselves, make new friends, learn from great coaches and explore different gyms, all while having fun.',
  },
  {
    q: 'Who can join FitMeet? Is it only for Patna?',
    a: 'FitMeet is a Patna-only, in-person community. Every meet happens live at a gym or outdoor spot in Patna, so please register only if you’re in Patna and can attend in person. There are no online sessions and no remote participation. Spots are limited, so if you register and don’t show up, the fee is non-refundable. If you’re outside Patna, follow @fitmeet.in. We’ll announce it there first if FitMeet comes to your city.',
  },
  {
    q: 'I’m a beginner. Can I join?',
    a: 'Absolutely. FitMeet is for every fitness level. Challenges can be scaled to your pace, and coaches are there to guide you. No one gets left behind.',
  },
  {
    q: 'Can I come alone?',
    a: 'Yes! Most people come solo the first time. That’s the whole point: you’ll meet new people within the first 10 minutes.',
  },
  {
    q: 'I own a gym or brand, or I’m a coach. How can I collaborate?',
    a: 'We’d love to have you! Gyms can host a Sunday challenge, brands can fuel the challengers, and coaches can support our meets. Apply through Collaborate With Us or message us through the contact form.',
  },
  {
    q: 'How often do FitMeet meets happen?',
    a: 'Our schedule depends on venue availability and planning. We announce every meet at least one week in advance on our Instagram, @fitmeet.in, and on the website. Turn on post notifications so you never miss a meet!',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faqs" className="bg-slate-50 dark:bg-[#0d0d10] border-b border-slate-200 dark:border-[#16171a] py-16 sm:py-20 scroll-mt-20 transition-colors">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-2">
          <p className="font-head font-semibold text-xs sm:text-sm uppercase tracking-wider text-[#FC5300] flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4" />
            <span>Good To Know</span>
          </p>
          <span className="text-xs text-slate-500 dark:text-[#8a8b93] font-mono">
            Oct 28, 2026 · @Shubham
          </span>
        </div>

        <h2 className="font-head font-bold text-3xl sm:text-4xl uppercase text-slate-900 dark:text-white mt-1">
          Frequently Asked <span className="text-[#FC5300]">Questions</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="border border-slate-200 dark:border-[#25272c] bg-white dark:bg-[#111215] rounded-lg p-5 transition-colors shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between text-left text-sm font-semibold text-slate-900 dark:text-white hover:text-[#FC5300] dark:hover:text-[#ff7a2e] transition-colors cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 dark:text-[#b4b0aa] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#FC5300]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-[#b4b0aa] leading-relaxed pt-3 border-t border-slate-100 dark:border-[#1b1c20]">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
