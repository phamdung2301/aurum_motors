import { scrollToEl } from '../lib/motion';

const NAV = [
  { label: 'Bộ sưu tập', href: '#collection', sup: '01' },
  { label: 'Triết lý', href: '#manifesto', sup: '02' },
  { label: 'Lái thử', href: '#testdrive', sup: '03' },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-[70] border-b hairline bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-10">
        <button
          type="button"
          onClick={() => scrollToEl('#top')}
          data-cursor="TOP"
          className="font-display text-lg tracking-[.08em] text-cream"
        >
          AURUM MOTORS <sup className="text-[9px] text-gold">®</sup>
        </button>
        <nav className="hidden items-center gap-10 md:flex" aria-label="Điều hướng chính">
          {NAV.map((n) => (
            <button
              key={n.href}
              type="button"
              onClick={() => scrollToEl(n.href)}
              data-cursor="GO"
              className="font-mono text-[11px] uppercase tracking-[.2em] text-muted transition-colors duration-300 hover:text-cream"
            >
              {n.label} <sup className="text-[8px] text-gold">{n.sup}</sup>
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => scrollToEl('#testdrive')}
          data-cursor="BOOK"
          className="btn-pill !px-5 !py-2"
        >
          Đặt lịch lái thử
        </button>
      </div>
    </header>
  );
}
