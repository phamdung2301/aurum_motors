import type Lenis from 'lenis';

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Shared lenis singleton so nav anchors scroll through the smooth-scroll
   pipeline instead of fighting it. */
export const scrollState: { lenis: Lenis | null } = { lenis: null };

export function scrollToEl(selector: string) {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return;
  if (scrollState.lenis) {
    scrollState.lenis.scrollTo(el, { offset: -64, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
