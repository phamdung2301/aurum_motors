import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from '../lib/gsap';
import { prefersReduced } from '../lib/motion';

/* Infinite light-gate tunnel — ~15 one-unit segments recycled endlessly
   (both directions), fog for depth, chase-camera lerp. Procedural poster
   textures drawn on 2D canvas: zero image assets, works offline. */

const W = 2.4;
const H = 1.9;
const DEPTH = 1;
const N = 15;

const POSTERS: [string, string, string][] = [
  ['GT ÆON', 'FIG. 01 — GRAND TOURER', '12,8 TỶ ₫'],
  ['VANTA GT', 'FIG. 02 — MIDNIGHT', '14,2 TỶ ₫'],
  ['SOVEREIGN S', 'FIG. 03 — SEDAN', '9,6 TỶ ₫'],
  ['ÉCLAT ROADSTER', 'FIG. 04 — OPEN TOP', '11,5 TỶ ₫'],
];

function makePosterTexture(title: string, fig: string, price: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 640;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 640);
  grad.addColorStop(0, '#14110b');
  grad.addColorStop(1, '#060504');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 640);
  g.strokeStyle = '#d8ae62';
  g.lineWidth = 5;
  g.strokeRect(26, 26, 460, 588);
  g.lineWidth = 1;
  g.strokeRect(42, 42, 428, 556);
  g.textAlign = 'center';
  g.fillStyle = '#d8ae62';
  g.font = '500 21px "JetBrains Mono", monospace';
  g.fillText('A U R U M   M O T O R S', 256, 118);
  g.fillStyle = '#f3dfb9';
  g.font = 'italic 600 64px Georgia, "Times New Roman", serif';
  g.fillText(title, 256, 330);
  g.fillStyle = '#99907c';
  g.font = '400 19px "JetBrains Mono", monospace';
  g.fillText(fig, 256, 398);
  g.fillStyle = '#d8ae62';
  g.font = '500 30px "JetBrains Mono", monospace';
  g.fillText(price, 256, 522);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

interface Props {
  paused: boolean;
  onEnter: () => void;
}

export default function IntroGate({ paused, onEnter }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const enteredRef = useRef(false);
  const cfgRef = useRef({ v: prefersReduced() ? 0 : 9 }); // tốc độ quét, đơn vị/giây

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const host = hostRef.current;
    if (!overlay || !host) return;
    const reduced = prefersReduced();
    const cfg = cfgRef.current;
    const boost = { held: false };

    let raf = 0;
    let alive = true;
    let visible = true;
    const cleanups: (() => void)[] = [];

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    } catch {
      renderer = null;
    }

    if (renderer) {
      const canvas = renderer.domElement;
      canvas.style.cssText = 'width:100%;height:100%;display:block';
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(host.clientWidth, host.clientHeight);
      host.appendChild(canvas);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050505);
      const FOG_FAR = N * DEPTH * 0.95;
      scene.fog = new THREE.Fog(0x050505, FOG_FAR * 0.42, FOG_FAR);

      const camera = new THREE.PerspectiveCamera(45, host.clientWidth / host.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 0);

      // shared geometry + material pools — only meshes multiply
      const edgeX = new THREE.BoxGeometry(W + 0.02, 0.016, 0.016);
      const edgeY = new THREE.BoxGeometry(0.016, H + 0.02, 0.016);
      const cellGeo = new THREE.PlaneGeometry(W / 2, DEPTH);
      const posterGeo = new THREE.PlaneGeometry(1.15, 1.44);
      const brightMat = new THREE.MeshBasicMaterial({ color: 0xd8ae62 });
      const dimMat = new THREE.MeshBasicMaterial({ color: 0x8a6a2f, transparent: true, opacity: 0.55 });
      const slabMats = [0xd8ae62, 0x8a6a2f, 0xf3dfb9, 0x2a2213].map(
        (c, i) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: [0.3, 0.24, 0.14, 0.5][i], side: THREE.DoubleSide }),
      );
      const posterMats = POSTERS.map(([t, f, p]) => new THREE.MeshBasicMaterial({ map: makePosterTexture(t, f, p), side: THREE.DoubleSide }));

      const populate = (group: THREE.Group, idx: number) => {
        while (group.children.length) group.remove(group.children[0]);
        const frameMat = idx % 3 === 0 ? brightMat : dimMat;
        const edges: [THREE.BufferGeometry, number, number, number][] = [
          [edgeX, 0, H / 2, 0],
          [edgeX, 0, -H / 2, 0],
          [edgeY, W / 2, 0, 0],
          [edgeY, -W / 2, 0, 0],
        ];
        for (const [geo, x, y, z] of edges) {
          const m = new THREE.Mesh(geo, frameMat);
          m.position.set(x, y, z);
          group.add(m);
        }
        let k = (idx * 7 + 3) % 97;
        for (const ySign of [1, -1]) {
          for (let cIdx = 0; cIdx < 2; cIdx++) {
            k = (k * 5 + 1) % 97;
            if (k < 58) {
              const m = new THREE.Mesh(cellGeo, slabMats[(3 * k) % slabMats.length]);
              m.position.set(cIdx === 0 ? -W / 4 : W / 4, (ySign * H) / 2, 0);
              m.rotation.x = ySign === 1 ? -Math.PI / 2 : Math.PI / 2;
              group.add(m);
            }
          }
        }
        if (idx % 2 === 0) {
          const side = (idx / 2) % 2 === 0 ? 1 : -1;
          const m = new THREE.Mesh(posterGeo, posterMats[(idx / 2) % posterMats.length]);
          m.position.set((side * W) / 2, 0, 0);
          m.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2;
          group.add(m);
        }
      };

      const segments: THREE.Group[] = [];
      for (let i = 0; i < N; i++) {
        const g = new THREE.Group();
        g.userData.idx = i;
        populate(g, i);
        g.position.z = -i * DEPTH;
        scene.add(g);
        segments.push(g);
      }

      let scroll = 0;
      let last = performance.now();
      const tick = () => {
        raf = requestAnimationFrame(tick);
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 1 / 30); // clamp delta
        last = now;
        if (!alive || !visible || document.hidden || pausedRef.current) return;
        scroll += (boost.held && !reduced ? 60 : cfg.v) * dt;
        const want = -scroll;
        camera.position.z += 0.1 * (want - camera.position.z); // chase lerp = inertia
        const camZ = camera.position.z;
        let minZ = Infinity;
        let maxZ = -Infinity;
        for (const s of segments) {
          if (s.position.z < minZ) minZ = s.position.z;
          if (s.position.z > maxZ) maxZ = s.position.z;
        }
        const span = N * DEPTH;
        for (const s of segments) {
          if (s.position.z > camZ + DEPTH) {
            s.position.z = minZ - DEPTH;
            s.userData.idx = (s.userData.idx as number) + 1;
            populate(s, s.userData.idx as number);
            minZ = s.position.z;
          } else if (s.position.z < camZ - span - DEPTH) {
            s.position.z = maxZ + DEPTH;
            s.userData.idx = (s.userData.idx as number) - 1;
            populate(s, s.userData.idx as number);
            maxZ = s.position.z;
          }
        }
        renderer!.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);

      const ro = new ResizeObserver(() => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        renderer!.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      });
      ro.observe(host);

      const down = () => { boost.held = true; };
      const up = () => { boost.held = false; };
      host.addEventListener('pointerdown', down);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);

      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
      io.observe(host);

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        host.removeEventListener('pointerdown', down);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        gsap.killTweensOf(cfg);
        for (const geo of [edgeX, edgeY, cellGeo, posterGeo]) geo.dispose();
        for (const m of [brightMat, dimMat, ...slabMats, ...posterMats]) m.dispose();
        for (const m of posterMats) m.map?.dispose();
        renderer!.dispose();
        canvas.remove();
      });
    }

    return () => {
      alive = false;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  const enter = () => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    const reduced = prefersReduced();
    const tl = gsap.timeline({ onComplete: onEnter });
    tl.to(barRef.current, { scaleX: 1, duration: reduced ? 0.5 : 2, ease: 'none' }, 0)
      .to(copyRef.current, { opacity: 0, y: -40, duration: 0.55, ease: 'power2.in' }, 0)
      .to(hostRef.current, {
        scale: reduced ? 1 : 1.35,
        transformOrigin: '50% 50%',
        duration: reduced ? 0.5 : 2,
        ease: 'power2.in',
      }, 0);
    if (!reduced) {
      tl.to(cfgRef.current, { v: 140, duration: 2, ease: 'power2.in' }, 0)
        .to(overlayRef.current, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 1.45);
    } else {
      tl.to(overlayRef.current, { opacity: 0, duration: 0.45 }, 0.1);
    }
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-label="Cổng vào showroom AURUM MOTORS"
      className="fixed inset-0 z-[90] bg-bg"
    >
      <div ref={hostRef} className="absolute inset-0 will-change-transform" aria-hidden>
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 45%, #14100a 0%, #0a0806 45%, #050505 78%)' }}
        />
      </div>
      <div
        ref={copyRef}
        className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6 text-center"
      >
        <p className="eyebrow !text-gold">AURUM MOTORS — HÀ NỘI</p>
        <h2 className="max-w-4xl font-display text-[12vw] leading-[1.04] text-cream md:text-[5.5rem]">
          Chào mừng <em>đến</em> thế giới AURUM
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          Sáu kiệt tác cơ khí đang đợi dưới ánh đèn vàng. Bước qua cánh cổng để bắt đầu hành trình.
        </p>
        <button type="button" onClick={enter} data-cursor="ENTER" className="btn-pill !px-10 !py-4 !text-[12px]">
          Bước vào showroom ↗
        </button>
        <p className="eyebrow">GIỮ CON TRỎ ĐỂ TĂNG TỐC</p>
      </div>
      <div className="absolute bottom-0 left-0 h-px w-full bg-line/60" aria-hidden>
        <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-gold" />
      </div>
    </div>
  );
}
