import { useEffect, type RefObject } from 'react';
import { gsap } from './gsap';

/** .reveal elements fade up on scroll — scoped to root, reduced-motion safe. */
export function useReveals(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('.reveal', root).forEach((el) => {
          gsap.from(el, {
            y: 65,
            opacity: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          });
        });
      }, root);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, [rootRef]);
}
