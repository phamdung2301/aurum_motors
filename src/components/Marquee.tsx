import { CARS } from '../data/cars';

/** Ticker band on the accent — content duplicated exactly 2x, -40% loop. */
export default function Marquee() {
  const row = (copy: boolean) => (
    <div aria-hidden={copy || undefined} className="flex shrink-0 items-center">
      {CARS.map((c) => (
        <span key={c.id + (copy ? '-b' : '-a')} className="flex items-center">
          <span className="px-8 font-mono text-sm tracking-[.3em] text-[#0c0a06] uppercase">
            {c.name}
          </span>
          <span aria-hidden className="text-lg text-[#0c0a06]">
            ✳
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <section aria-hidden className="overflow-hidden border-y border-gold/30 bg-gold py-4">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
