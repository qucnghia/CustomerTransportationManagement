import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const POPOVER_HEIGHT = 380;

const pad = (n) => String(n).padStart(2, '0');
const toIso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayIso = () => new Date().toLocaleDateString('sv-SE');
// "yyyy-MM-dd" -> { y, m (0-11) }; không dùng new Date(chuỗi) để tránh lệch múi giờ
const parseIso = (s) => {
  const [y, m] = String(s || '').split('-').map(Number);
  return y && m ? { y, m: m - 1 } : null;
};

// Lịch chọn ngày thay cho <input type="date"> (bảng lịch gốc của trình duyệt không chỉnh giao diện được).
// value / min / max dạng "yyyy-MM-dd", onChange(value) trả về chuỗi cùng định dạng ('' khi xóa).
export default function DatePicker({
  value = '', onChange, required = false, min, max, minYear = 1940, maxYear,
  placeholder = 'dd/mm/yyyy', className = '', id
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => parseIso(value) ?? parseIso(todayIso()));
  const [pos, setPos] = useState(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const lastYear = maxYear ?? new Date().getFullYear() + 5;
  const years = [];
  for (let y = lastYear; y >= minYear; y--) years.push(y);

  // Popover dùng position: fixed, lật lên trên khi phía dưới không đủ chỗ
  const openPicker = () => {
    const r = triggerRef.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom > POPOVER_HEIGHT;
    setPos({ left: Math.min(r.left, window.innerWidth - 296), top: below ? r.bottom + 6 : Math.max(8, r.top - POPOVER_HEIGHT - 6) });
    setView(parseIso(value) ?? parseIso(todayIso()));
    setOpen(true);
  };

  const close = (refocus = false) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!popoverRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onScroll = (e) => {
      if (!popoverRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    popoverRef.current?.querySelector('[aria-pressed="true"], [data-today]')?.focus();
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  const pick = (iso) => {
    onChange(iso);
    close(true);
  };

  const shiftMonth = (delta) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  const isDisabled = (iso) => (min && iso < min) || (max && iso > max);

  // Lưới 6 tuần, tuần bắt đầu từ Thứ Hai
  const firstWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(view.y, view.m, i - firstWeekday + 1);
    return { iso: toIso(d.getFullYear(), d.getMonth(), d.getDate()), day: d.getDate(), inMonth: d.getMonth() === view.m };
  });

  const today = todayIso();
  const display = value ? value.split('-').reverse().join('/') : '';
  const navBtn = 'w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer';
  const selectCls = 'px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 cursor-pointer focus:outline-none focus:border-blue-500';

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => (open ? close() : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${className} flex items-center justify-between gap-2 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40`}
      >
        <span className={display ? '' : 'text-slate-400 font-medium'}>{display || placeholder}</span>
        <CalendarDays className="w-4 h-4 shrink-0 text-slate-400" />
      </button>

      {/* Ô ẩn để form vẫn báo "bắt buộc" theo cơ chế kiểm tra gốc của trình duyệt */}
      <input
        tabIndex={-1}
        aria-hidden="true"
        required={required}
        value={value}
        onChange={() => {}}
        onFocus={() => triggerRef.current?.focus()}
        className="absolute left-4 bottom-0 w-px h-px opacity-0 pointer-events-none"
      />

      {/* Portal ra <body>: tránh bị <label> bao ngoài bắt click và bị modal có thanh cuộn cắt mất */}
      {open && pos && createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Chọn ngày"
          style={{ left: pos.left, top: pos.top }}
          className="fixed z-[60] w-72 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/20"
        >
          <div className="flex items-center gap-1.5 mb-3">
            <button type="button" onClick={() => shiftMonth(-1)} className={navBtn} aria-label="Tháng trước">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <select aria-label="Tháng" value={view.m} onChange={(e) => setView({ ...view, m: Number(e.target.value) })} className={`${selectCls} flex-1`}>
              {Array.from({ length: 12 }, (_, m) => <option key={m} value={m}>Tháng {m + 1}</option>)}
            </select>
            <select aria-label="Năm" value={view.y} onChange={(e) => setView({ ...view, y: Number(e.target.value) })} className={selectCls}>
              {!years.includes(view.y) && <option value={view.y}>{view.y}</option>}
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button type="button" onClick={() => shiftMonth(1)} className={navBtn} aria-label="Tháng sau">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(w => (
              <span key={w} className={`text-center text-[11px] font-bold uppercase tracking-wider py-1 ${w === 'CN' ? 'text-rose-500' : 'text-slate-400'}`}>{w}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map(({ iso, day, inMonth }) => {
              const selected = iso === value;
              const isToday = iso === today;
              const disabled = isDisabled(iso);
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(iso)}
                  aria-pressed={selected}
                  aria-label={`Ngày ${day} tháng ${Number(iso.slice(5, 7))} năm ${iso.slice(0, 4)}`}
                  data-today={isToday || undefined}
                  className={`h-9 rounded-lg text-sm font-semibold transition-colors ${
                    selected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : disabled
                        ? 'text-slate-300 cursor-not-allowed'
                        : `cursor-pointer hover:bg-blue-50 hover:text-blue-700 ${inMonth ? 'text-slate-800' : 'text-slate-400'} ${isToday ? 'ring-1 ring-inset ring-blue-500 text-blue-700 font-bold' : ''}`
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isDisabled(today)}
              onClick={() => pick(today)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Hôm nay
            </button>
            {!required && value && (
              <button
                type="button"
                onClick={() => pick('')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
