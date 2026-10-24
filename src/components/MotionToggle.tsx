interface Props {
  paused: boolean;
  reduced: boolean;
  onToggle: () => void;
}

/** Visible pause/play motion control (accessibility requirement). */
export default function MotionToggle({ paused, reduced, onToggle }: Props) {
  if (reduced) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      data-cursor={paused ? 'PLAY' : 'PAUSE'}
      aria-pressed={paused}
      className="fixed bottom-5 left-5 z-[80] flex items-center gap-2 rounded-full border border-gold/40 bg-bg/70 px-4 py-2 font-mono text-[9px] tracking-[.18em] text-muted uppercase backdrop-blur transition-colors duration-300 hover:border-gold hover:text-gold"
    >
      <span aria-hidden>{paused ? '▶' : '❚❚'}</span>
      <span>{paused ? 'Chạy hiệu ứng' : 'Tạm dừng hiệu ứng'}</span>
    </button>
  );
}
