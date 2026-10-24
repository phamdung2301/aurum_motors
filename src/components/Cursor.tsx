import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReduced } from '../lib/motion';

/** Contextual gold dot cursor + data-cursor labels.
    Only on fine pointers ≥1000px, never under reduced motion. */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    if (!window.matchMedia('(pointer: fine) and (min-width: 1000px)').matches)
      return;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!dot || !label) return;

    document.documentElement.classList.add('has-cursor');
    // different speeds = depth
    const dx = gsap.quickTo(dot, 'x', { duration: 0.18, ease: 'power3.out' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.18, ease: 'power3.out' });
    const lx = gsap.quickTo(label, 'x', { duration: 0.26, ease: 'power3.out' });
    const ly = gsap.quickTo(label, 'y', { duration: 0.26, ease: 'power3.out' });

    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      lx(e.clientX);
      ly(e.clientY);
    };
    const over = (e: Event) => {
      const t = (e.target as HTMLElement).closest?.(
        '[data-cursor]',
      ) as HTMLElement | null;
      if (t) {
        label.textContent = t.dataset.cursor || '';
        gsap.to(dot, { scale: 2.4, duration: 0.3, ease: 'power3.out' });
        gsap.to(label, { opacity: 1, duration: 0.25 });
      }
    };
    const out = (e: Event) => {
      if ((e.target as HTMLElement).closest?.('[data-cursor]')) {
        gsap.to(dot, { scale: 1, duration: 0.3, ease: 'power3.out' });
        gsap.to(label, { opacity: 0, duration: 0.25 });
      }
    };

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} aria-hidden className="cursor-dot" />
      <span ref={labelRef} aria-hidden className="cursor-label" />
    </>
  );
}
