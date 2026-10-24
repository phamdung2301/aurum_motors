export default function Footer({ onReplay }: { onReplay: () => void }) {
  return (
    <footer className="relative overflow-hidden border-t hairline">
      <div className="mx-auto max-w-[1500px] px-5 py-20 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <div>
            <p className="eyebrow">AURUM MOTORS — EST. 2026 · VIETNAM</p>
            <p className="mt-4 font-display text-[clamp(44px,7vw,110px)] leading-none text-cream">
              Sẵn sàng cho <em>chặng</em> tiếp theo?
            </p>
          </div>
          <button type="button" onClick={onReplay} className="btn-pill" data-cursor="REPLAY">
            Replay experience ↻
          </button>
        </div>

        <div className="mt-16 grid gap-10 border-t hairline pt-10 font-mono text-[11px] tracking-[.14em] text-muted uppercase md:grid-cols-4">
          <div>
            <p className="mb-3 text-gold">SHOWROOM</p>
            <p className="leading-loose normal-case">88 Tràng Tiền</p>
            <p className="leading-loose normal-case">Hoàn Kiếm, Hà Nội</p>
          </div>
          <div>
            <p className="mb-3 text-gold">GIỜ MỞ CỬA</p>
            <p className="leading-loose normal-case">8:00 — 22:00</p>
            <p className="leading-loose normal-case">Tất cả các ngày</p>
          </div>
          <div>
            <p className="mb-3 text-gold">LIÊN HỆ</p>
            <p className="leading-loose normal-case">+84 24 7777 8888</p>
            <p className="leading-loose normal-case">concierge@aurum.vn</p>
          </div>
          <div>
            <p className="mb-3 text-gold">TỌA ĐỘ</p>
            <p className="leading-loose">21.0278° N</p>
            <p className="leading-loose">105.8342° E</p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t hairline pt-6 eyebrow">
          <p>© 2026 AURUM MOTORS</p>
          <p>CONCEPT SHOWROOM — KHÔNG PHẢI INVENTORY THẬT</p>
          <p aria-hidden>✳ GSAP · THREE.JS · TAILWIND</p>
        </div>
      </div>
    </footer>
  );
}
