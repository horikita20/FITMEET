import React from 'react';

const benefits = [
  {
    icon: '🏟️',
    title: 'NEW ARENA, EVERY MEET',
    description: 'A new gym or outdoor spot each Sunday. New vibe, new coaches, new game.',
  },
  {
    icon: '🏋️',
    title: 'CHALLENGES FOR EVERY LEVEL',
    description: 'Strength, bodyweight, HIIT and team challenges. Pick your level and play.',
  },
  {
    icon: '🏆',
    title: 'FITNESS GAMES AND FUN',
    description: 'Team games, mini contests and a cheering crowd. Fitness that feels like play.',
    featured: true,
  },
  {
    icon: '🎁',
    secondaryIcon: '🥤',
    title: 'WIN, REFUEL, CONNECT',
    description: 'Goodies for winners, snacks for everyone, and a crew of new friends.',
  },
];

export const WhyJoinSection: React.FC = () => (
  <section className="border-y border-[#25262b] bg-[#101113] py-14 sm:py-16 lg:py-[68px]">
    <div className="mx-auto max-w-[1668px] px-5 sm:px-8">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-head text-sm font-bold uppercase tracking-[0.12em] text-[#ff5a1f]">
            WHY JOIN
          </p>
          <h2 className="mt-2 font-head text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl lg:text-[4.5rem]">
            WHY <span className="text-[#ff5a1f]">FITMEET?</span>
          </h2>
        </div>
        <p className="pb-1 text-base text-[#d3d1d0] sm:text-lg lg:text-[22px]">
          Fitness that feels like a game, every Sunday.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {benefits.map(({ icon, secondaryIcon, title, description, featured }) => (
          <article
            key={title}
            className={`flex min-h-[220px] items-start gap-5 rounded-[24px] border p-5 sm:min-h-[240px] sm:p-6 lg:gap-6 ${
              featured
                ? 'border-[#ff5a1f] shadow-[0_12px_36px_rgba(255,90,31,0.08)]'
                : 'border-[#292a30]'
            } bg-[#141518]`}
          >
            <div className="mt-1 flex w-[74px] shrink-0 items-center justify-center gap-0.5 rounded-full bg-[radial-gradient(circle,rgba(255,90,31,0.2),transparent_72%)] py-2 text-[42px] leading-none">
              <span aria-hidden="true">{icon}</span>
              {secondaryIcon && (
                <span className="self-end text-[30px]" aria-hidden="true">
                  {secondaryIcon}
                </span>
              )}
            </div>
            <div className="pt-1">
              <h3 className="font-head text-xl font-black uppercase leading-[1.25] text-white sm:text-[22px]">
                {title}
              </h3>
              <p className="mt-3 text-base leading-[1.65] text-[#c9c9cf] sm:text-lg">
                {description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
