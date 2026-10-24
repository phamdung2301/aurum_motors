import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CARS } from '../data/cars';
import { useReveals } from '../lib/useReveals';

const KEY = 'aurum_testdrive';

interface Booking {
  id: string;
  name: string;
  phone: string;
  car: string;
  date: string;
  at: string;
}

/** Fake-submit form with a real localStorage record (rung 2 data layer). */
export default function TestDrive() {
  const rootRef = useRef<HTMLElement>(null);
  useReveals(rootRef);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sent, setSent] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setBookings(JSON.parse(stored) as Booking[]);
    } catch {
      /* storage blocked — app still works */
    }
    return () => window.clearTimeout(timerRef.current);
  }, []);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const b: Booking = {
      id: crypto.randomUUID(),
      name: String(fd.get('name') || ''),
      phone: String(fd.get('phone') || ''),
      car: String(fd.get('car') || ''),
      date: String(fd.get('date') || ''),
      at: new Date().toISOString(),
    };
    const updated = [b, ...bookings];
    setBookings(updated);
    try {
      localStorage.setItem(KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
    setSent(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setSent(false), 6000);
    e.currentTarget.reset();
  };

  const clearAll = () => {
    setBookings([]);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  };

  const inputCls =
    'mt-2 w-full border hairline bg-bg px-4 py-3 text-sm text-cream outline-none transition-colors duration-300 placeholder:text-muted/50 focus:border-gold';

  return (
    <section ref={rootRef} id="testdrive" className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-[1500px] gap-14 px-5 md:px-10 lg:grid-cols-2">
        <div>
          <p className="reveal eyebrow">05 / LÁI THỬ</p>
          <h2 className="reveal mt-3 font-display text-[clamp(38px,4vw,62px)] leading-[1.05] text-cream">
            Trải nghiệm <em>trước</em> khi sở hữu
          </h2>
          <p className="reveal mt-6 max-w-md text-[15px] leading-[1.75] text-muted">
            Đội concierge của AURUM sẽ chuẩn bị xe, cung đường và thời gian
            phù hợp nhất với bạn — trong vòng 24 giờ kể từ khi nhận yêu cầu.
          </p>
          <div className="reveal mt-10 space-y-4 font-mono text-[11px] uppercase tracking-[.14em]">
            <p className="flex justify-between border-t hairline pt-4">
              <span className="text-muted">HOTLINE</span>
              <span className="text-cream">+84 24 7777 8888</span>
            </p>
            <p className="flex justify-between border-t hairline pt-4">
              <span className="text-muted">SHOWROOM</span>
              <span className="text-cream">88 Tràng Tiền, Hoàn Kiếm, Hà Nội</span>
            </p>
            <p className="flex justify-between border-y hairline py-4">
              <span className="text-muted">GIỜ MỞ CỬA</span>
              <span className="text-cream">8:00 — 22:00 · MỖI NGÀY</span>
            </p>
          </div>
          {bookings.length > 0 && (
            <div className="reveal mt-10">
              <div className="flex items-center justify-between">
                <p className="eyebrow !text-gold">LỊCH ĐÃ ĐĂNG ({bookings.length})</p>
                <button
                  type="button"
                  onClick={clearAll}
                  data-cursor="CLEAR"
                  className="eyebrow transition-colors hover:text-gold"
                >
                  XÓA HẾT ✳
                </button>
              </div>
              <ul className="mt-4 space-y-2 font-mono text-[11px] text-muted">
                {bookings.slice(0, 4).map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-4 border-t hairline pt-2"
                  >
                    <span className="text-cream">{b.car}</span>
                    <span>
                      {b.date || '—'} · {b.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="reveal relative border hairline bg-panel p-7 md:p-9">
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label htmlFor="td-name" className="eyebrow">
                HỌ VÀ TÊN
              </label>
              <input id="td-name" name="name" required placeholder="Nguyễn Văn A" className={inputCls} />
            </div>
            <div>
              <label htmlFor="td-phone" className="eyebrow">
                SỐ ĐIỆN THOẠI
              </label>
              <input
                id="td-phone"
                name="phone"
                type="tel"
                required
                placeholder="09xx xxx xxx"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="td-car" className="eyebrow">
                XE QUAN TÂM
              </label>
              <select id="td-car" name="car" required className={inputCls} defaultValue={CARS[0].name}>
                {CARS.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} — {c.kind}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="td-date" className="eyebrow">
                NGÀY MONG MUỐN
              </label>
              <input
                id="td-date"
                name="date"
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                className={inputCls}
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <button type="submit" className="btn-solid w-full justify-center" data-cursor="SEND">
              Gửi yêu cầu ↗
            </button>
            <p className="eyebrow !normal-case">
              Demo form — dữ liệu lưu trong trình duyệt của bạn (localStorage), không gửi đi đâu.
            </p>
          </form>

          {sent && (
            <div className="absolute inset-0 grid place-items-center bg-panel/95 p-8 text-center">
              <div>
                <p className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold text-xl text-gold">
                  ✓
                </p>
                <h3 className="mt-6 font-display text-3xl text-cream">Đã nhận yêu cầu</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted">
                  Đội concierge của AURUM sẽ liên hệ bạn trong vòng 24 giờ.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
