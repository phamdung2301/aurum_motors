# AURUM MOTORS — Showroom Ô Tô Siêu Sang

Landing page concept kiểu Awwwards cho showroom ô tô hạng sang: skin
**luxury serif** (đen #050505 + vàng gold #d8ae62 + Playfair Display),
intro gate WebGL, hero 3D lắp ráp/tách lớp, scroll animation GSM-level.

## Tính năng

- **Preloader** đếm 000→100 rồi kéo màn (counter-then-curtain).
- **Intro gate**: tunnel ánh sáng vàng (three.js, 15 segment recycle vô hạn,
  fog chiều sâu, poster xe vẽ procedural bằng canvas — không cần tải ảnh),
  nút "Bước vào showroom" → tăng tốc 18→220 zoom xuyên tunnel.
- **Hero 3D**: xe GT dựng procedural từ ~60 chi tiết (không GLTF), vật liệu
  clearcoat PBR + PMREM environment, camera orthographic tự căn khung mỗi
  frame, lắp ráp từng chi tiết khi tải, nút **＋ Explore the layers** (tách
  lớp) và **↻ Replay**, nghiêng theo con trỏ (lerp, không snap). Fallback:
  renderer Canvas-2D painter's algorithm nếu máy không có WebGL.
- **Bộ sưu tập**: pinned horizontal reel (GSAP ScrollTrigger pin + scrub),
  ảnh zoom khi đi qua, mobile chuyển sang snap scroll ngang.
- **Marquee** vàng chạy vô hạn, **Manifesto** chữ khổng lồ trôi ngang,
  **Nguyên tắc** đánh số, **form lái thử** lưu localStorage.
- **Lenis smooth scroll** trên GSAP ticker, custom cursor + data-cursor
  labels, film grain overlay, watermark khổng lồ.
- **Accessibility**: `prefers-reduced-motion` (bỏ spectacle, giữ state
  machine), nút pause/play hiệu ứng, mọi lớp trang trí `aria-hidden`,
  canvas `role="img"`, focus ring vàng, pause-don't-disable.

## Chạy dự án

```bash
npm install
npm run dev        # http://localhost:5173
```

Build production:

```bash
npm run build      # xuất dist/ (đã set base './', deploy đâu cũng được)
npm run preview    # xem thử dist/
```

> File `dist/` trong gói zip là bản build sẵn. Mở trực tiếp `dist/index.html`
> bằng double-click sẽ không chạy (ES modules cần HTTP) — dùng
> `npm run preview` hoặc `npx serve dist`.

## Công nghệ

Vite 7 · React 19 · TypeScript · Tailwind CSS v4 (`@theme` tokens) ·
GSAP 3 + ScrollTrigger · Lenis · Three.js.

## Cấu trúc

```
src/
├── App.tsx                 # state machine: boot → gate → site, lenis, inert
├── index.css               # @theme tokens (gold/cream/bg), grain, marquee, cursor
├── data/cars.ts            # 6 dòng xe (tên, giá VND, HP, 0-100, vmax) — sửa ở đây
├── lib/
│   ├── gsap.ts             # đăng ký ScrollTrigger 1 lần
│   ├── motion.ts           # prefersReduced, lenis singleton, scrollToEl
│   └── useReveals.ts       # .reveal fade-up scoped
└── components/
    ├── Preloader.tsx       # counter → curtain, hero bắt giữa lúc kéo màn
    ├── IntroGate.tsx       # tunnel + nút ENTER + progress bar
    ├── CarStage.tsx        # xe procedural + assembly/explode + fallback 2D
    ├── Hero.tsx            # masked line reveal, counters, scrub-out
    ├── Collection.tsx      # pinned horizontal reel
    ├── Marquee.tsx / Manifesto.tsx / Principles.tsx
    ├── TestDrive.tsx       # form + localStorage (key: aurum_testdrive)
    ├── Header.tsx / Footer.tsx
    ├── Cursor.tsx / MotionToggle.tsx
```

## Ghi chú

- Mở `?direct` (vd `http://localhost:5173/?direct`) để bỏ qua preloader +
  intro gate, vào thẳng trang — tiện khi phát triển hoặc chia sẻ link xem nhanh.
- Ảnh xe dùng hotlink Unsplash — cần mạng. Mất mạng: card tự fallback thành
  gradient + chữ cái lớn (đã xử lý `onError`).
- Muốn đổi thương hiệu/xe: sửa `src/data/cars.ts` + tên trong
  `IntroGate.tsx` (mảng `POSTERS`).
- Toàn bộ dữ liệu demo là tưởng tượng, không phải xe thật.
