import { useRef } from 'react';
import { useReveals } from '../lib/useReveals';

const PRINCIPLES = [
  {
    n: '01',
    t: 'Di sản',
    en: 'HERITAGE',
    d: 'Ba mươi năm phục vụ những bộ sưu tập tư nhân tại Hà Nội — mỗi chiếc xe qua tay chúng tôi đều mang một câu chuyện riêng, được ghi lại trong hồ sơ da phục.',
  },
  {
    n: '02',
    t: 'Kỹ nghệ',
    en: 'CRAFT',
    d: '214 giờ kiểm định trên mỗi chiếc xe trước khi trưng bày. 12 nghệ nhân, một bộ tiêu chuẩn không thỏa hiệp, không ngoại lệ.',
  },
  {
    n: '03',
    t: 'Cam kết',
    en: 'COMMITMENT',
    d: 'Bảo hành 10 năm. Concierge 24/7. Bảo dưỡng tận nơi trong bán kính 300 km — vì chiếc xe của bạn không bao giờ nghỉ, chúng tôi cũng vậy.',
  },
];

export default function Principles() {
  const rootRef = useRef<HTMLElement>(null);
  useReveals(rootRef);

  return (
    <section ref={rootRef} id="philosophy" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <p className="reveal eyebrow">04 / NGUYÊN TẮC</p>
        <h2 className="reveal mt-3 font-display text-[clamp(38px,4vw,62px)] leading-[1.05] text-cream">
          Ba điều không bao giờ <em>thỏa hiệp</em>
        </h2>
        <div className="mt-14">
          {PRINCIPLES.map((p) => (
            <div
              key={p.n}
              className="reveal grid grid-cols-[auto_1fr] items-baseline gap-6 border-t hairline py-9 last:border-b md:grid-cols-[110px_260px_1fr] md:gap-10"
            >
              <p
                aria-hidden
                className="font-display text-[64px] leading-none text-gold/20"
              >
                {p.n}
              </p>
              <div>
                <h3 className="font-display text-2xl text-cream">{p.t}</h3>
                <p className="eyebrow mt-2">{p.en}</p>
              </div>
              <p className="col-span-2 max-w-xl text-sm leading-[1.75] text-muted md:col-span-1">
                {p.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
