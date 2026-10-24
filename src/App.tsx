import { useEffect, useMemo, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './lib/gsap';
import { prefersReduced, scrollState } from './lib/motion';
import Preloader from './components/Preloader';
import IntroGate from './components/IntroGate';
import Cursor from './components/Cursor';
import MotionToggle from './components/MotionToggle';
import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Collection from './components/Collection';
import Manifesto from './components/Manifesto';
import Principles from './components/Principles';
import TestDrive from './components/TestDrive';
import Footer from './components/Footer';

type Phase = 'boot' | 'gate' | 'site';

/* ?direct — bỏ qua preloader/gate, vào thẳng site (deep-link / test) */
const DIRECT =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('direct');

export default function App() {
  // reduced motion → skip the whole spectacle, land straight on the site
  const [phase, setPhase] = useState<Phase>(() =>
    prefersReduced() || DIRECT ? 'site' : 'boot',
  );
  const [motionPaused, setMotionPaused] = useState(false);
  const showPreloader = useMemo(() => !prefersReduced() && !DIRECT, []);
  const reduced = useMemo(() => prefersReduced(), []);

  /* scroll locked + main inert until the visitor is in */
  useEffect(() => {
    document.body.style.overflow = phase === 'site' ? '' : 'hidden';
    if (phase === 'site') {
      const t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
      return () => window.clearTimeout(t);
    }
  }, [phase]);

  /* lenis smooth scroll on the GSAP ticker */
  useEffect(() => {
    if (phase !== 'site' || reduced) return;
    const lenis = new Lenis({ duration: 1.15, wheelMultiplier: 0.9 });
    scrollState.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      scrollState.lenis = null;
    };
  }, [phase, reduced]);

  /* global pause — CSS animations + a ref read by every JS loop */
  useEffect(() => {
    document.documentElement.classList.toggle('motion-paused', motionPaused);
  }, [motionPaused]);

  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  const replay = () => {
    if (scrollState.lenis) scrollState.lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0 });
    setPhase('gate');
  };

  return (
    <div className="relative min-h-screen">
      <Cursor />
      <div className="grain" aria-hidden />
      {showPreloader && (
        <Preloader onDone={() => setPhase((p) => (p === 'boot' ? 'gate' : p))} />
      )}
      {phase === 'gate' && (
        <IntroGate paused={motionPaused} onEnter={() => setPhase('site')} />
      )}
      <MotionToggle
        paused={motionPaused}
        reduced={reduced}
        onToggle={() => setMotionPaused((v) => !v)}
      />

      <div inert={phase !== 'site'}>
        <Header />
        <main>
          <Hero active={phase === 'site'} paused={motionPaused} />
          <Marquee />
          <Collection />
          <Manifesto />
          <Principles />
          <TestDrive />
        </main>
        <Footer onReplay={replay} />
      </div>
    </div>
  );
}
