import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { prefersReduced, scrollToEl } from '../lib/motion';
import { FLAGSHIP } from '../data/cars';
import CarStage from './CarStage';

interface Props {
  active: boolean;
  paused: boolean;
}

export default function Hero({ active, paused }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const [exploded, setExploded] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  /* entrance timeline (starts when the gate lets us in) + hero scrub-out */
  useEffect(() => {
    if (!active) return;
    if (prefersReduced()) return; // elements are already at final state
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.from('.hero-eyebrow', { opacity: 0, x: -18, duration: 0.8 }, 0.1)
          .from('.hero-line > span', { yPercent: 115, duration: 1.25, stagger: 0.12 }, 0.2)
          .from('.hero-sub', { y: 26, opacity: 0, duration: 0.9 }, '-=0.7')
          .from('.hero-cta > *', { y: 22, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.6')
          .from('.hero-meta', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6')
          .from('.stage-bar', { y: 20, opacity: 0, duration: 0.8 }, '-=0.7');
        // chạy số chỉ số hiệu năng
        root.querySelectorAll<HTMLElement>('[data-count]').forEach((elm) => {
          const target = parseFloat(elm.dataset.count || '0');
          const dec = parseInt(elm.dataset.dec || '0', 10);
          const obj = { v: 0 };
          tl.to(
            obj,
            {
              v: target,
              duration: 1.6,
              ease: 'power3.out',
              onUpdate: () => {
                elm.textContent = obj.v.toFixed(dec);
              },
            },
            '-=1.5',
          );
        });
        gsap.to('.hero-fade', {
          y: -70,
          opacity: 0.15,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 1 },
        });
      }, root);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, [active]);

  return (
    <section ref={rootRef} id="top" className="hero relative">
      {/* watermark + ambient glow — decorative, never interactive */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <p className="absolute left-1/2 top-14 hidden -translate-x-1/2 select-none whitespace-nowrap font-display text-[18vw] font-bold uppercase leading-none text-white/[0.025] md:block">
          AURUM
        </p>
        <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-gold/10 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-gold/[0.07] blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-60px)] w-full max-w-[1500px] flex-col px-5 pb-10 pt-24 md:px-10 md:pt-28">
        <div className="grid flex-1 items-center gap-12 lg:grid-cols-[1fr_1.65fr]">
          {/* trái — tiêu đề */}
          <div className="hero-fade [@media(max-height:550px)]:!pt-0">
            <p className="hero-eyebrow eyebrow mb-6">01 / SHOWROOM — EST. 2026 · HÀ NỘI</p>
            <h1 className="font-display text-[clamp(54px,8.2vw,128px)] leading-[.95] tracking-[-.015em] text-cream">
              <span className="hero-line block overflow-hidden">
                <span className="block pb-[.09em]">SCULPTED</span>
              </span>
              <span className="hero-line block overflow-hidden">
                <span className="block pb-[.09em]">
                  <em className="font-normal">for the</em>
                </span>
              </span>
              <span className="hero-line block overflow-hidden">
                <span className="block pb-[.09em]">
                  SELECT FEW<span className="text-gold">.</span>
                </span>
              </span>
            </h1>
            <p className="hero-sub mt-7 max-w-md text-[15px] leading-[1.7] text-muted">
              Sáu kiệt tác cơ khí. Một tiêu chuẩn — đỉnh cao. AURUM MOTORS là nơi
              những cỗ xe hiếm tìm thấy chủ nhân xứng đáng.
            </p>
            <div className="hero-cta mt-9 flex flex-wrap gap-4">
              <button type="button" className="btn-solid" data-cursor="BOOK" onClick={() => scrollToEl('#testdrive')}>
                Đặt lịch lái thử
              </button>
              <button type="button" className="btn-pill" data-cursor="VIEW" onClick={() => scrollToEl('#collection')}>
                Bộ sưu tập ↓
              </button>
            </div>
            <div className="hero-meta mt-10 grid max-w-md grid-cols-3 border-t hairline pt-5 font-mono [@media(max-height:550px)]:hidden">
              <div>
                <p className="text-2xl text-cream tabular-nums">
                  <span data-count={FLAGSHIP.hp}>0</span>
                </p>
                <p className="eyebrow mt-1">HP</p>
              </div>
              <div>
                <p className="text-2xl text-cream tabular-nums">
                  <span data-count={FLAGSHIP.accel} data-dec="1">0</span>s
                </p>
                <p className="eyebrow mt-1">0–100 KM/H</p>
              </div>
              <div>
                <p className="text-2xl text-cream tabular-nums">
                  <span data-count={FLAGSHIP.vmax}>0</span>
                </p>
                <p className="eyebrow mt-1">KM/H V-MAX</p>
              </div>
            </div>
          </div>

          {/* phải — sân khấu 3D */}
          <div className="hero-fade relative">
            <div
              className="relative h-[46vh] min-h-[300px] overflow-hidden border hairline lg:h-[62vh]"
              style={{ background: 'radial-gradient(ellipse at 72% 50%, #171208 0%, #0c0a06 45%, #050505 78%)' }}
            >
              <CarStage active={active} paused={paused} exploded={exploded} replayKey={replayKey} />
              <p className="eyebrow pointer-events-none absolute left-4 top-4 !text-gold/80">
                ✳ LIVE 3D — DI CHUỘT ĐỂ XOAY
              </p>
            </div>
            <div className="stage-bar flex flex-wrap items-center justify-between gap-3 border-x border-b hairline px-4 py-3">
              <p className="eyebrow">FIG. 01 — {FLAGSHIP.name} CONCEPT</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExploded((v) => !v)}
                  data-cursor={exploded ? 'ASSEMBLE' : 'EXPLODE'}
                  className="border hairline px-3 py-2 font-mono text-[10px] uppercase tracking-[.14em] text-muted transition-colors duration-300 hover:border-gold hover:text-gold"
                >
                  {exploded ? '− Assemble' : '＋ Explore the layers'}
                </button>
                <button
                  type="button"
                  aria-label="Replay lắp ráp"
                  onClick={() => {
                    setExploded(false);
                    setReplayKey((k) => k + 1);
                  }}
                  data-cursor="REPLAY"
                  className="border hairline px-3 py-2 font-mono text-[10px] text-muted transition-colors duration-300 hover:border-gold hover:text-gold"
                >
                  ↻
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
