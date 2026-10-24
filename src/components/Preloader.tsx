import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { prefersReduced } from '../lib/motion';

/** Preloader: counter 0→100 then curtain lift. Fires onDone the moment the
    curtain starts rising so the hero timeline begins mid-lift; unmounts
    itself after the tween so the curtain is never killed mid-flight. */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const count = el.querySelector<HTMLElement>('.pre-count');
    const status = el.querySelector<HTMLElement>('.pre-status');

    if (prefersReduced()) {
      // skip the spectacle, keep the state machine
      gsap.to(el, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          setGone(true);
          onDone();
        },
      });
      return;
    }

    const obj = { v: 0 };
    const tl = gsap.timeline();
    tl.to(obj, {
      v: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.floor(obj.v);
        if (count) count.textContent = String(v).padStart(3, '0');
        if (status)
          status.textContent =
            v < 38
              ? 'INIT SHOWROOM FLOOR'
              : v < 74
                ? 'CALIBRATING GOLD LIGHTS'
                : 'POLISHING CLEARCOAT';
      },
    })
      .to('.pre-inner', {
        opacity: 0,
        y: -34,
        duration: 0.45,
        ease: 'power2.in',
      }, '+=0.15')
      // curtain up — hero starts underneath
      .add(() => onDone())
      .to(el, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' })
      .add(() => setGone(true));

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;
  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg"
      aria-hidden
    >
      <div className="pre-inner text-center">
        <p className="eyebrow">AURUM MOTORS — EST. 2026</p>
        <p className="pre-count mt-4 font-mono text-[17vw] leading-none font-light text-cream tabular-nums md:text-[9rem]">
          000
        </p>
        <p className="pre-status eyebrow mt-6 !text-gold">INIT SHOWROOM FLOOR</p>
      </div>
      <p className="eyebrow absolute bottom-8 left-1/2 -translate-x-1/2">
        ĐANG DỰNG TRẢI NGHIỆM — 21.0278° N / 105.8342° E
      </p>
    </div>
  );
}
