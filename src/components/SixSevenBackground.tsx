import React from 'react';

const STREAM_ROWS = [
  { id: 0, direction: 'left', size: 'text-5xl md:text-7xl', weight: 'font-extrabold', opacity: 'text-slate-900/18' },
  { id: 1, direction: 'right', size: 'text-4xl md:text-6xl', weight: 'font-bold', opacity: 'text-indigo-950/14' },
  { id: 2, direction: 'left', size: 'text-6xl md:text-8xl', weight: 'font-extrabold', opacity: 'text-slate-900/20' },
  { id: 3, direction: 'right', size: 'text-5xl md:text-7xl', weight: 'font-bold', opacity: 'text-indigo-950/15' },
  { id: 4, direction: 'left', size: 'text-4xl md:text-6xl', weight: 'font-extrabold', opacity: 'text-slate-900/18' },
  { id: 5, direction: 'right', size: 'text-6xl md:text-8xl', weight: 'font-bold', opacity: 'text-indigo-950/16' },
  { id: 6, direction: 'left', size: 'text-5xl md:text-7xl', weight: 'font-extrabold', opacity: 'text-slate-900/20' },
];

export const SixSevenBackground: React.FC = () => {
  const repeatedPhrase = Array.from({ length: 14 }, (_, i) => (
    <span key={i} className="inline-flex items-center gap-6 mx-6 select-none">
      <span>six seven</span>
      <span className="opacity-35 font-mono-tabular text-2xl md:text-4xl">6·7</span>
    </span>
  ));

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-slate-200 via-sky-100/90 to-indigo-200/80"
    >
      {/* Soft chromatic glow orbs to produce genuine glassmorphic refraction */}
      <div className="absolute -top-24 -left-24 w-[34rem] h-[34rem] rounded-full blur-3xl animate-float-slow bg-cyan-400/40" />
      <div className="absolute top-1/3 -right-24 w-[38rem] h-[38rem] rounded-full blur-3xl animate-float-reverse bg-indigo-400/35" />
      <div className="absolute -bottom-32 left-1/3 w-[36rem] h-[36rem] rounded-full blur-3xl animate-float-slow bg-teal-300/40" />

      {/* Infinite kinetic typography streams animating "six seven" */}
      <div className="absolute inset-0 flex flex-col justify-around py-4">
        {STREAM_ROWS.map((row) => (
          <div key={row.id} className="w-full overflow-hidden whitespace-nowrap flex">
            <div
              className={`inline-flex whitespace-nowrap font-display tracking-tight ${row.size} ${row.weight} ${row.opacity} ${
                row.direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
              }`}
            >
              <div className="inline-flex">{repeatedPhrase}</div>
              <div className="inline-flex">{repeatedPhrase}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
