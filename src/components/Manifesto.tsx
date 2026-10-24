import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useReveals } from '../lib/useReveals';

/** Giant drifting word + editorial statement — the quiet manifesto band. */
export default function Manifesto() {
  const rootRef = useRef<HTMLElement>(null);
  useReveals(rootRef);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.to('.manifesto-word', {
          xPercent: -12,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      }, root);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="manifesto"
      className="relative overflow-hidden py-28 md:py-40"
    >
      <p
        aria-hidden
        className="manifesto-word pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 select-none whitespace-nowrap font-display text-[22vw] font-bold uppercase leading-none text-gold/[0.05]"
      >
        AURUM ✳ AURUM ✳ AURUM
      </p>
      <div className="relative mx-auto max-w-[1500px] px-5 md:px-10">
        <p className="reveal eyebrow">03 / MANIFESTO</p>
        <h2 className="reveal mt-8 max-w-4xl font-display text-[clamp(30px,3.6vw,54px)] leading-[1.15] text-cream">
          Chúng tôi không bán xe. Chúng tôi trao quyền tiếp cận một thế giới mà
          ít ai được chạm tới — nơi từng mũi khâu da, từng ounce vàng đều là
          một <em>tuyên ngôn.</em>
        </h2>
        <p className="reveal mt-10 max-w-xl text-[15px] leading-[1.75] text-muted">
          Mỗi chiếc xe rời showroom AURUM đều mang theo một thừa kế: bộ tiêu
          chuẩn 214 giờ, đội kỹ nghệ 12 người, và một lời hứa — rằng chủ nhân
          sẽ không bao giờ phải chờ.
        </p>
      </div>
    </section>
  );
}
