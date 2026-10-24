import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { gsap } from '../lib/gsap';
import { prefersReduced } from '../lib/motion';

/* ————————————————————————————————————————————————
   Procedural grand tourer — built from code only, no GLTF assets.
   Every part carries its explode offset vector; GSAP tweens the plain
   part.p objects so the WebGL path and the 2D fallback share the exact
   same assembly / exploded state machine.
———————————————————————————————————————————————— */

type V3 = { x: number; y: number; z: number };
type MatKey =
  | 'paint' | 'paintSatin' | 'glass' | 'carbon' | 'tire' | 'rim'
  | 'chrome' | 'lamp' | 'tail' | 'interior' | 'grille' | 'goldTrim';

interface PartSpec {
  size: [number, number, number];
  pos: [number, number, number];
  mat: MatKey;
  offset: [number, number, number]; // explode path — away from mass center
  shape?: 'box' | 'cyl';
  rot?: [number, number, number];
  radius?: number; // rounded-box corner radius
}

interface Part {
  spec: PartSpec;
  home: V3;
  p: V3;
  mesh?: THREE.Mesh;
}

export function buildCarParts(): PartSpec[] {
  const P: PartSpec[] = [];
  const add = (
    size: PartSpec['size'],
    pos: PartSpec['pos'],
    mat: MatKey,
    offset: PartSpec['offset'],
    extra?: Partial<PartSpec>,
  ) => P.push({ size, pos, mat, offset, ...extra });

  // nền gầm + thân chính
  add([4.35, 0.14, 1.7], [0, 0.32, 0], 'carbon', [0, -1.6, 0]);
  add([4.45, 0.34, 1.84], [0, 0.55, 0], 'paint', [0, -0.5, 0], { radius: 0.06 });
  add([4.3, 0.1, 1.72], [0, 0.68, 0], 'paintSatin', [0, -0.22, 0], { radius: 0.04 });
  // mũi + đuôi
  add([0.52, 0.26, 1.7], [2.02, 0.52, 0], 'paint', [1.15, 0.05, 0], { radius: 0.05 });
  add([0.52, 0.28, 1.7], [-2.02, 0.54, 0], 'paint', [-1.15, 0.05, 0], { radius: 0.05 });
  // nắp capo + cốp
  add([1.4, 0.06, 1.56], [1.32, 0.72, 0], 'paint', [0.95, 0.6, 0], { radius: 0.03 });
  add([0.95, 0.06, 1.6], [-1.6, 0.73, 0], 'paint', [-0.95, 0.6, 0], { radius: 0.03 });
  // buồng lái
  add([1.6, 0.14, 1.5], [0, 0.72, 0], 'paintSatin', [0, 0.42, 0], { radius: 0.05 });
  add([1.15, 0.05, 1.34], [-0.05, 1.02, 0], 'paint', [0, 1.35, 0], { radius: 0.02 });
  add([0.66, 0.05, 1.42], [1.0, 0.78, 0], 'glass', [0.75, 0.85, 0], { rot: [0, 0, -0.5] });
  add([0.56, 0.05, 1.42], [-0.95, 0.79, 0], 'glass', [-0.75, 0.85, 0], { rot: [0, 0, 0.52] });
  add([1.4, 0.24, 0.04], [0.02, 0.82, 0.71], 'glass', [0, 0.5, 1.0]);
  add([1.4, 0.24, 0.04], [0.02, 0.82, -0.71], 'glass', [0, 0.5, -1.0]);
  // phục quanh bánh
  add([1.0, 0.34, 0.16], [1.42, 0.6, 0.94], 'paintSatin', [0.8, 0.1, 1.15]);
  add([1.0, 0.34, 0.16], [1.42, 0.6, -0.94], 'paintSatin', [0.8, 0.1, -1.15]);
  add([1.05, 0.36, 0.16], [-1.38, 0.62, 0.94], 'paintSatin', [-0.8, 0.1, 1.15]);
  add([1.05, 0.36, 0.16], [-1.38, 0.62, -0.94], 'paintSatin', [-0.8, 0.1, -1.15]);
  // bậc chân
  add([2.6, 0.12, 0.1], [0, 0.36, 0.92], 'carbon', [0, -0.2, 1.2]);
  add([2.6, 0.12, 0.1], [0, 0.36, -0.92], 'carbon', [0, -0.2, -1.2]);
  // va trước / sau
  add([0.3, 0.2, 1.78], [2.24, 0.42, 0], 'paintSatin', [1.2, -0.15, 0], { radius: 0.04 });
  add([0.3, 0.2, 1.78], [-2.24, 0.44, 0], 'paintSatin', [-1.2, -0.15, 0], { radius: 0.04 });
  // aero: splitter, diffuser, cánh gió + chân cánh
  add([0.55, 0.05, 1.9], [2.1, 0.18, 0], 'carbon', [0.9, -0.55, 0]);
  add([0.5, 0.12, 1.7], [-2.05, 0.2, 0], 'carbon', [-0.9, -0.55, 0]);
  add([0.5, 0.045, 1.5], [-2.12, 1.14, 0], 'carbon', [-1.25, 1.0, 0]);
  add([0.07, 0.22, 0.08], [-2.12, 1.0, 0.5], 'carbon', [-1.15, 0.75, 0.8]);
  add([0.07, 0.22, 0.08], [-2.12, 1.0, -0.5], 'carbon', [-1.15, 0.75, -0.8]);
  // grille + đèn
  add([0.1, 0.18, 1.05], [2.3, 0.48, 0], 'grille', [1.35, -0.05, 0]);
  add([0.1, 0.09, 0.42], [2.27, 0.64, 0.55], 'lamp', [1.2, 0.3, 0.9]);
  add([0.1, 0.09, 0.42], [2.27, 0.64, -0.55], 'lamp', [1.2, 0.3, -0.9]);
  add([0.08, 0.03, 0.5], [2.28, 0.73, 0.45], 'lamp', [1.25, 0.48, 0.75]);
  add([0.08, 0.03, 0.5], [2.28, 0.73, -0.45], 'lamp', [1.25, 0.48, -0.75]);
  add([0.07, 0.09, 1.5], [-2.3, 0.66, 0], 'tail', [-1.3, 0.42, 0]);
  // gương chiếu hậu
  add([0.16, 0.09, 0.26], [0.62, 0.95, 1.02], 'paintSatin', [0.6, 0.6, 1.1]);
  add([0.16, 0.09, 0.26], [0.62, 0.95, -1.02], 'paintSatin', [0.6, 0.6, -1.1]);
  // pô xả
  add([0.055, 0.12, 0.055], [-2.3, 0.3, 0.4], 'chrome', [-1.2, -0.3, 0.7], { shape: 'cyl' });
  add([0.055, 0.12, 0.055], [-2.3, 0.3, -0.4], 'chrome', [-1.2, -0.3, -0.7], { shape: 'cyl' });
  // vent capo
  add([0.4, 0.02, 0.3], [1.35, 0.76, 0.45], 'carbon', [0.9, 0.72, 0.6]);
  add([0.4, 0.02, 0.3], [1.35, 0.76, -0.45], 'carbon', [0.9, 0.72, -0.6]);
  // viền vàng dọc thân
  add([3.2, 0.02, 0.02], [0, 0.66, 0.93], 'goldTrim', [0, 0.12, 1.35]);
  add([3.2, 0.02, 0.02], [0, 0.66, -0.93], 'goldTrim', [0, 0.12, -1.35]);
  // nội thất (nhìn qua kính)
  add([0.5, 0.12, 0.42], [-0.15, 0.7, 0.4], 'interior', [0, 0.9, 0.3]);
  add([0.5, 0.12, 0.42], [-0.15, 0.7, -0.4], 'interior', [0, 0.9, -0.3]);
  add([0.12, 0.5, 0.42], [-0.42, 0.95, 0.4], 'interior', [0, 1.05, 0.3]);
  add([0.12, 0.5, 0.42], [-0.42, 0.95, -0.4], 'interior', [0, 1.05, -0.3]);
  add([0.6, 0.16, 0.68], [0.55, 0.76, 0], 'interior', [0.3, 0.8, 0]);
  add([0.14, 0.05, 0.06], [-0.55, 1.07, 0], 'carbon', [0, 1.4, 0]);
  // bánh xe: lốp + mâm vàng + hub
  for (const wx of [1.45, -1.45]) {
    for (const wz of [0.85, -0.85]) {
      const oz = wz > 0 ? 1.25 : -1.25;
      add([0.34, 0.3, 0.34], [wx, 0.34, wz], 'tire', [0, -0.12, oz], { shape: 'cyl' });
      add([0.2, 0.32, 0.2], [wx, 0.34, wz], 'rim', [0, -0.12, oz], { shape: 'cyl' });
      add([0.055, 0.34, 0.055], [wx, 0.34, wz], 'chrome', [0, -0.12, oz], { shape: 'cyl' });
    }
  }
  return P;
}

function makeMaterials(): Record<MatKey, THREE.Material> {
  return {
    paint: new THREE.MeshPhysicalMaterial({
      color: 0x9a7738, metalness: 0.72, roughness: 0.24,
      clearcoat: 1, clearcoatRoughness: 0.12,
    }),
    paintSatin: new THREE.MeshPhysicalMaterial({
      color: 0x6b5426, metalness: 0.6, roughness: 0.38, clearcoat: 0.6,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x0d0f0c, metalness: 0.1, roughness: 0.1,
      transparent: true, opacity: 0.55, envMapIntensity: 1.8, side: THREE.DoubleSide,
    }),
    carbon: new THREE.MeshStandardMaterial({ color: 0x161310, metalness: 0.45, roughness: 0.5 }),
    tire: new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.92 }),
    rim: new THREE.MeshStandardMaterial({ color: 0xd8ae62, metalness: 0.95, roughness: 0.25 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xd8cdb2, metalness: 1, roughness: 0.15 }),
    lamp: new THREE.MeshStandardMaterial({ color: 0x2a1f08, emissive: 0xffe2a6, emissiveIntensity: 2.4 }),
    tail: new THREE.MeshStandardMaterial({ color: 0x2a0805, emissive: 0xff2d18, emissiveIntensity: 1.8 }),
    interior: new THREE.MeshStandardMaterial({ color: 0x1a150c, roughness: 0.85 }),
    grille: new THREE.MeshStandardMaterial({ color: 0x0a0908, metalness: 0.6, roughness: 0.35 }),
    goldTrim: new THREE.MeshStandardMaterial({ color: 0xd8ae62, metalness: 0.9, roughness: 0.3 }),
  };
}

interface Props {
  active: boolean;
  paused: boolean;
  exploded: boolean;
  replayKey: number;
}

export default function CarStage({ active, paused, exploded, replayKey }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const partsRef = useRef<Part[]>([]);
  const readyRef = useRef(false);
  const pausedRef = useRef(paused);
  const skipExplodeRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  /* ——— init scene (WebGL, fallback to 2D rasterizer) ——— */
  useEffect(() => {
    if (!active) return;
    const el = hostRef.current;
    if (!el) return;
    const reduced = prefersReduced();

    const specs = buildCarParts();
    const parts: Part[] = specs.map((s) => ({
      spec: s,
      home: { x: s.pos[0], y: s.pos[1], z: s.pos[2] },
      p: { x: s.pos[0], y: s.pos[1], z: s.pos[2] },
    }));
    partsRef.current = parts;

    let raf = 0;
    let visible = true;
    const pointer = { x: 0, y: 0 };
    const tilt = { ry: -0.55, rx: 0 };

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch {
      renderer = null; // no WebGL → software fallback below
    }

    const cleanups: (() => void)[] = [];
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const onLeave = () => { pointer.x = 0; pointer.y = 0; };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    });

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    io.observe(el);
    cleanups.push(() => io.disconnect());

    /* ——————— WebGL path ——————— */
    if (renderer) {
      const canvas = renderer.domElement;
      canvas.style.cssText = 'width:100%;height:100%;display:block';
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      el.appendChild(canvas);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      scene.environmentIntensity = 0.4;

      const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 100);
      camera.position.set(9, 6, 11);
      camera.lookAt(0, 0.55, 0);

      // bục trưng bày — tĩnh, không thuộc parts
      const discGeo = new THREE.CylinderGeometry(3.05, 3.2, 0.16, 72);
      const discMat = new THREE.MeshStandardMaterial({ color: 0x0e0c09, metalness: 0.25, roughness: 0.5 });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.y = -0.08;
      disc.receiveShadow = true;
      scene.add(disc);
      const ringGeo = new THREE.TorusGeometry(3.06, 0.012, 8, 128);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xd8ae62, transparent: true, opacity: 0.7 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.002;
      scene.add(ring);

      const materials = makeMaterials();
      const carGroup = new THREE.Group();
      scene.add(carGroup);
      const frameMeshes: THREE.Mesh[] = [disc];

      for (const part of parts) {
        const s = part.spec;
        let geo: THREE.BufferGeometry;
        if (s.shape === 'cyl') {
          geo = new THREE.CylinderGeometry(s.size[0], s.size[0], s.size[1], 28);
        } else if (s.radius) {
          geo = new RoundedBoxGeometry(s.size[0], s.size[1], s.size[2], 2, s.radius);
        } else {
          geo = new THREE.BoxGeometry(s.size[0], s.size[1], s.size[2]);
        }
        geo.computeBoundingBox();
        const mesh = new THREE.Mesh(geo, materials[s.mat]);
        if (s.shape === 'cyl') mesh.rotation.x = Math.PI / 2;
        if (s.rot) mesh.rotation.set(s.rot[0], s.rot[1], s.rot[2]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(part.p.x, part.p.y, part.p.z);
        carGroup.add(mesh);
        part.mesh = mesh;
        frameMeshes.push(mesh);
      }

      // ánh sáng studio: key ấm + fill lạnh + rim vàng
      const sun = new THREE.DirectionalLight(0xfff1d6, 3.2);
      sun.position.set(-5, 9, 6);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
      sun.shadow.camera.updateProjectionMatrix();
      sun.shadow.normalBias = 0.03;
      scene.add(sun);
      const fill = new THREE.DirectionalLight(0xbfd0ff, 0.7);
      fill.position.set(7, 4, -6);
      scene.add(fill);
      const rimLight = new THREE.PointLight(0xd8ae62, 60, 30);
      rimLight.position.set(-6, 3.5, -7);
      scene.add(rimLight);
      const kick = new THREE.PointLight(0xffd9a0, 40, 25);
      kick.position.set(6, 2.5, 7);
      scene.add(kick);
      scene.add(new THREE.AmbientLight(0xffffff, 0.45));

      const corner = new THREE.Vector3();
      const fit = () => {
        const w = Math.max(el.clientWidth, 1);
        const h = Math.max(el.clientHeight, 1);
        const aspect = w / h;
        camera.updateMatrixWorld();
        camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
        let L = Infinity, R = -Infinity, B = Infinity, T = -Infinity;
        for (const m of frameMeshes) {
          if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
          const b = m.geometry.boundingBox!;
          for (let i = 0; i < 8; i++) {
            corner
              .set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z)
              .applyMatrix4(m.matrixWorld)
              .applyMatrix4(camera.matrixWorldInverse);
            L = Math.min(L, corner.x); R = Math.max(R, corner.x);
            B = Math.min(B, corner.y); T = Math.max(T, corner.y);
          }
        }
        const halfH = Math.max((T - B) / 2, (R - L) / (2 * aspect)) * 1.09;
        const cx = (L + R) / 2, cy = (T + B) / 2;
        camera.left = cx - halfH * aspect;
        camera.right = cx + halfH * aspect;
        camera.top = cy + halfH;
        camera.bottom = cy - halfH;
        camera.updateProjectionMatrix();
        renderer!.setSize(w, h);
      };
      fit();

      const ro = new ResizeObserver(fit);
      ro.observe(el);
      cleanups.push(() => ro.disconnect());

      let last = performance.now();
      const render = (now: number) => {
        raf = requestAnimationFrame(render);
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        if (!visible || document.hidden) return;
        const frozen = pausedRef.current || reduced;
        if (!frozen) {
          const t = now * 0.00025;
          const targetRy = -0.55 + pointer.x * 0.5 + Math.sin(t) * 0.04;
          const targetRx = pointer.y * 0.08;
          tilt.ry += (targetRy - tilt.ry) * 0.045; // lerp — never snap
          tilt.rx += (targetRx - tilt.rx) * 0.045;
          carGroup.rotation.y = tilt.ry;
          carGroup.rotation.x = tilt.rx;
        }
        for (const part of parts) part.mesh!.position.set(part.p.x, part.p.y, part.p.z);
        carGroup.updateMatrixWorld(true);
        fit();
        renderer!.render(scene, camera);
      };
      raf = requestAnimationFrame(render);

      cleanups.push(() => {
        for (const part of parts) gsap.killTweensOf(part.p);
        scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else if (mat) mat.dispose();
        });
        envTex.dispose();
        pmrem.dispose();
        renderer!.dispose();
        canvas.remove();
      });
    } else {
      /* ——————— Canvas-2D software fallback (painter's algorithm) ——————— */
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'width:100%;height:100%;display:block';
      el.appendChild(canvas);
      const ctx = canvas.getContext('2d');

      const MAT2D: Record<MatKey, [number, number, number]> = {
        paint: [43, 44, 36], paintSatin: [40, 32, 26], glass: [195, 14, 22],
        carbon: [40, 8, 12], tire: [0, 0, 8], rim: [43, 56, 48],
        chrome: [45, 22, 62], lamp: [46, 85, 74], tail: [8, 78, 44],
        interior: [38, 26, 14], grille: [0, 0, 10], goldTrim: [43, 62, 52],
      };
      // faces of a unit box: corner indices (bit0 x+, bit1 y+, bit2 z+) + local normal
      const FACES: [number[], number[]][] = [
        [[1, 5, 7, 3], [1, 0, 0]],
        [[0, 2, 6, 4], [-1, 0, 0]],
        [[2, 3, 7, 6], [0, 1, 0]],
        [[0, 1, 5, 4], [0, -1, 0]],
        [[4, 5, 7, 6], [0, 0, 1]],
        [[0, 2, 3, 1], [0, 0, -1]],
      ];
      const light = { x: -0.45, y: 0.75, z: 0.55 };
      const ll = Math.hypot(light.x, light.y, light.z);
      light.x /= ll; light.y /= ll; light.z /= ll;

      let prev = 0;
      const draw = (now: number) => {
        raf = requestAnimationFrame(draw);
        if (!ctx || now - prev < 40) return; // ~25fps
        prev = now;
        if (!visible || document.hidden) return;
        const w = Math.max(el.clientWidth, 1);
        const h = Math.max(el.clientHeight, 1);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        const frozen = pausedRef.current || reduced;
        if (!frozen) {
          const t = now * 0.00025;
          const targetRy = -0.55 + pointer.x * 0.5 + Math.sin(t) * 0.04;
          tilt.ry += (targetRy - tilt.ry) * 0.045;
        }
        const cyr = Math.cos(tilt.ry), syr = Math.sin(tilt.ry);
        const pitch = 0.3, cp = Math.cos(pitch), sp = Math.sin(pitch);
        const sc = Math.min(w / 8.2, h / 3.6);
        const cx = w / 2, cyy = h * 0.56;

        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, w, h);
        // bục
        ctx.beginPath();
        ctx.ellipse(cx, cyy + 0.35 * sc, 3.2 * sc, 3.2 * sc * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#0c0a07';
        ctx.fill();
        ctx.strokeStyle = 'rgba(216,174,98,.35)';
        ctx.stroke();

        const proj = (v: number[]) => {
          const x1 = v[0] * cyr + v[2] * syr;
          const z1 = -v[0] * syr + v[2] * cyr;
          const y2 = v[1] * cp - z1 * sp;
          return { sx: cx + x1 * sc, sy: cyy - y2 * sc, z: v[1] * sp + z1 * cp };
        };
        const rotN = (n: number[]) => {
          const x1 = n[0] * cyr + n[2] * syr;
          const z1 = -n[0] * syr + n[2] * cyr;
          return { x: x1, y: n[1] * cp - z1 * sp, z: n[1] * sp + z1 * cp };
        };

        const order = parts
          .map((part) => ({ part, z: proj([part.p.x, part.p.y, part.p.z]).z }))
          .sort((a, b) => a.z - b.z);

        for (const { part } of order) {
          const s = part.spec;
          const [hs, ss, bs] = MAT2D[s.mat];
          const hw = s.size[0] / 2, hh = s.size[1] / 2, hd = s.size[2] / 2;
          const corners: ReturnType<typeof proj>[] = [];
          for (let i = 0; i < 8; i++) {
            corners.push(proj([
              part.p.x + (i & 1 ? hw : -hw),
              part.p.y + (i & 2 ? hh : -hh),
              part.p.z + (i & 4 ? hd : -hd),
            ]));
          }
          for (const [idxs, n] of FACES) {
            const rn = rotN(n);
            const d = Math.max(0, rn.x * light.x + rn.y * light.y + rn.z * light.z);
            const l = Math.min(92, bs * (0.42 + 0.72 * d));
            ctx.beginPath();
            idxs.forEach((ci, k) => {
              const pt = corners[ci];
              if (k === 0) ctx.moveTo(pt.sx, pt.sy);
              else ctx.lineTo(pt.sx, pt.sy);
            });
            ctx.closePath();
            ctx.globalAlpha = s.mat === 'glass' ? 0.72 : 1;
            ctx.fillStyle = `hsl(${hs} ${ss}% ${l}%)`;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      };
      raf = requestAnimationFrame(draw);
      cleanups.push(() => canvas.remove());
    }

    readyRef.current = true;
    return () => {
      readyRef.current = false;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
      for (const part of partsRef.current) gsap.killTweensOf(part.p);
      partsRef.current = [];
    };
  }, [active]);

  /* ——— assembly: parts fly in from offsets, capped stagger ——— */
  useEffect(() => {
    if (!active || !readyRef.current) return;
    const parts = partsRef.current;
    const reduce = prefersReduced();
    parts.forEach((part, i) => {
      gsap.killTweensOf(part.p);
      const k = reduce ? 0 : 0.45;
      part.p.x = part.home.x + part.spec.offset[0] * k;
      part.p.y = part.home.y + part.spec.offset[1] * k;
      part.p.z = part.home.z + part.spec.offset[2] * k;
      gsap.to(part.p, {
        x: part.home.x, y: part.home.y, z: part.home.z,
        duration: reduce ? 0 : 1.65,
        delay: reduce ? 0 : 0.15 + Math.min(i, 42) * 0.032,
        ease: 'power3.out',
      });
    });
    // the replay commit also flips exploded=false — don't double-tween
    skipExplodeRef.current = true;
  }, [active, replayKey]);

  /* ——— exploded view toggle ——— */
  useEffect(() => {
    if (!active) return;
    if (skipExplodeRef.current) {
      skipExplodeRef.current = false;
      return;
    }
    const parts = partsRef.current;
    if (!readyRef.current || !parts.length) return;
    const reduce = prefersReduced();
    parts.forEach((part, i) => {
      const k = exploded ? 1 : 0;
      gsap.to(part.p, {
        x: part.home.x + part.spec.offset[0] * 0.34 * k,
        y: part.home.y + part.spec.offset[1] * 0.5 * k,
        z: part.home.z + part.spec.offset[2] * 0.4 * k,
        duration: reduce ? 0 : 1.2,
        delay: reduce ? 0 : Math.min(i, 42) * 0.005,
        ease: 'power3.inOut',
        overwrite: true,
      });
    });
  }, [active, exploded]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label="Mô hình 3D xe GT AURUM — xoay theo con trỏ, có chế độ tách lớp linh kiện"
      className="absolute inset-0 touch-pan-y"
    />
  );
}
