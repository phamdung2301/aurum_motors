import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { scrollToEl } from '../lib/motion';
import { CARS, formatVnd } from '../data/cars';

/** Pinned horizontal reel on desktop (ScrollTrigger pin + x scrub +
    containerAnimation image zoom); native snap scroll on mobile. */
export default function Collection() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference) and (min-width: 800px)', () => {
      const ctx = gsap.context(() => {
        const getDist = () => -(track.scrollWidth - window.innerWidth + 90);
        const reelTween = gsap.to(track, {
          x: getDist,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            pin: true,
            scrub: 1,
            end: () => '+=' + Math.abs(getDist()),
            invalidateOnRefresh: true,
          },
        });
        track.querySelectorAll<HTMLElement>('.reel-img').forEach((img) => {
          gsap.fromTo(
            img,
            { scale: 1.12 },
            {
              scale: 1.28,
              ease: 'none',
              scrollTrigger: {
                trigger: img,
                containerAnimation: reelTween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          );
        });
        track.querySelectorAll<HTMLElement>('.reel-card').forEach((card) => {
          const body = card.querySelector('.reel-body');
          if (!body) return;
          gsap.from(body, {
            y: 46,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, containerAnimation: reelTween, start: 'left 92%' },
          });
        });
      }, root);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="collection"
      className="relative overflow-hidden py-20 md:flex md:min-h-screen md:flex-col md:justify-center md:py-0"
    >
      <div className="mx-auto w-full max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">02 / THE COLLECTION</p>
            <h2 className="mt-3 font-display text-[clamp(38px,4vw,62px)] leading-[1.05] text-cream">
              Sự lựa chọn <em>của</em> số ít
            </h2>
          </div>
          <p className="eyebrow hidden md:block">CUỘN ĐỂ DUYỆT BỘ SƯU TẬP →</p>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mt-12 flex snap-x snap-mandatory gap-8 overflow-x-auto px-5 pb-2 md:w-max md:snap-none md:overflow-visible md:px-10"
      >
        {CARS.map((car, i) => (
          <article
            key={car.id}
            className="reel-card w-[78vw] shrink-0 snap-start sm:w-[420px] lg:w-[480px]"
            data-cursor="VIEW"
          >
            <div className="relative h-[38vh] min-h-[240px] overflow-hidden border hairline bg-panel">
              <div
                aria-hidden
                className="absolute inset-0 grid place-items-center font-display text-7xl text-gold/15"
                style={{ background: 'radial-gradient(ellipse at 50% 40%, #171208 0%, #0a0906 70%)' }}
              >
                {car.name.charAt(0)}
              </div>
              <img
                src={car.image}
                alt={`${car.name} — ${car.kind}`}
                loading="lazy"
                className="reel-img relative h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="absolute left-4 top-4 border hairline bg-bg/70 px-2 py-1 font-mono text-[10px] tracking-[.2em] text-gold backdrop-blur">
                {String(i + 1).padStart(2, '0')} / {String(CARS.length).padStart(2, '0')}
              </span>
              <span
                aria-hidden
                className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full border border-gold/50 bg-bg/60 text-gold backdrop-blur"
              >
                ↗
              </span>
            </div>
            <div className="reel-body mt-5">
              <p className="eyebrow">{car.kind}</p>
              <h3 className="mt-2 font-display text-3xl text-cream">{car.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{car.blurb}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t hairline pt-4 font-mono text-[11px] tracking-[.06em]">
                <span className="text-gold">{formatVnd(car.price)}</span>
                <span className="text-muted">
                  {car.hp} HP · {car.accel}S · {car.vmax} KM/H
                </span>
              </div>
            </div>
          </article>
        ))}

        <div className="flex w-[70vw] shrink-0 items-center sm:w-[380px]">
          <div className="w-full border hairline p-8 text-center">
            <p className="font-display text-2xl text-cream">Toàn bộ bộ sưu tập</p>
            <p className="mt-2 text-sm text-muted">chỉ mở theo lịch hẹn riêng</p>
            <button
              type="button"
              className="btn-pill mt-6"
              data-cursor="BOOK"
              onClick={() => scrollToEl('#testdrive')}
            >
              Đặt lịch tham quan
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
