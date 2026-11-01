import React from 'react';

const steps = [
  {
    title: 'Walk in',
    description:
      'The FitMeet team welcomes you at the venue and tells you how the morning will run. You don’t need to know anyone.',
  },
  {
    title: 'Warm up together',
    description:
      'The whole group warms up with a coach, so you’re ready to move and never left guessing what to do.',
  },
  {
    title: 'Take on the challenges',
    description:
      'Strength, bodyweight, HIIT and team games. Go at your own pace; the point is to play, not to compete with the pros.',
  },
  {
    title: 'Win goodies, meet people',
    description:
      'Finish with prizes, snacks, high-fives and new friends. Come back next Sunday to a new place and the same crew.',
  },
];

const welcomeNotes = [
  'No experience needed',
  'Come solo or with friends',
  'Wear comfortable workout clothes',
  'Every fitness level welcome',
];

export const FirstSundaySection: React.FC = () => (
  <section className="bg-[#0a0a0c] px-4 py-14 sm:px-8 sm:py-16 lg:py-[68px]">
    <div className="mx-auto max-w-[1668px]">
      <div className="mb-8 max-w-[760px]">
        <h2 className="font-head text-4xl font-black uppercase leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
          What happens on your
          <span className="mt-1 block text-[#ff5a1f]">first Sunday</span>
        </h2>
        <p className="mt-4 max-w-[700px] text-sm leading-7 text-[#b8b6bb] sm:text-base">
          Never been to a FitMeet? Here’s how the morning goes, so you know exactly what to expect
          before you walk in.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {steps.map(({ title, description }, index) => (
          <article
            key={title}
            className="flex aspect-square flex-col rounded-[22px] border border-[#25262b] bg-[#141518] p-5 sm:p-6"
          >
            <div className="flex min-h-[48px] items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ff5a1f] font-head text-lg font-black text-white">
                {index + 1}
              </span>
              <h3 className="font-head text-base font-black uppercase leading-tight text-white sm:text-lg">
                {title}
              </h3>
            </div>
            <p className="mt-5 text-sm leading-[1.55] text-[#c5c3c8] sm:text-[15px]">
              {description}
            </p>
          </article>
        ))}
      </div>

      <ul className="mt-6 flex flex-wrap gap-2.5">
        {welcomeNotes.map((note) => (
          <li
            key={note}
            className="rounded-full border border-[#38251f] bg-[#21140f] px-4 py-2 text-xs font-semibold text-[#f0e9e5] sm:text-sm"
          >
            {note}
          </li>
        ))}
      </ul>
    </div>
  </section>
);
