import { useEffect, useRef, useState } from 'react';
import { Bus, Users, Wrench, X, Scale, ChevronRight } from 'lucide-react';

const ROTATE_MS = 4000;

const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);
const sum = (list, key) => list.reduce((acc, x) => acc + (Number(x[key]) || 0), 0);

// Thẻ luân phiên 3 khoản thu chi; bấm vào mở popup tổng quan, bấm từng khoản thì đóng popup
// và báo onSelectDetail(key) để trang hiện bảng chi tiết tương ứng.
export default function FinanceSummary({ revenues, revenuePeriod, salaries, payrollPeriod, maintenanceItems, onSelectDetail }) {
  const items = [
    {
      key: 'revenue', label: 'Tổng doanh thu đội xe', value: sum(revenues, 'tongDoanhThu'), note: revenuePeriod,
      icon: Bus, sign: 1, gradient: 'from-cyan-600 to-blue-600', shadow: 'shadow-cyan-600/20'
    },
    {
      key: 'payroll', label: 'Tổng thu nhập tài xế', value: sum(salaries, 'tongLuongThang'), note: payrollPeriod,
      icon: Users, sign: -1, gradient: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-600/20'
    },
    {
      key: 'maintenance', label: 'Tổng chi phí bảo dưỡng', value: sum(maintenanceItems, 'chiPhi'),
      note: `${maintenanceItems.length} đợt · ${revenuePeriod}`,
      icon: Wrench, sign: -1, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-orange-600/20'
    }
  ];
  const net = items.reduce((acc, it) => acc + it.sign * it.value, 0);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    if (paused || open) return;
    const id = setInterval(() => setIndex(i => (i + 1) % items.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, open, items.length]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const current = items[index];
  const Icon = current.icon;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        aria-haspopup="dialog"
        title="Xem chi tiết thu chi"
        className={`relative w-full text-left p-6 rounded-3xl bg-gradient-to-tr ${current.gradient} text-white shadow-lg ${current.shadow} cursor-pointer transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs uppercase font-bold text-white/80 tracking-wider flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <span>{current.label}</span>
          </div>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {items.map((it, i) => (
              <span key={it.key} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
            ))}
          </div>
        </div>
        <div key={current.key} className="finance-swap text-3xl sm:text-4xl font-black mt-2">{formatMoney(current.value)}</div>
        <div className="text-xs text-white/80 mt-1 font-medium flex items-center justify-between gap-2">
          <span className="truncate">{current.note}</span>
          <span className="shrink-0 underline-offset-2 hover:underline">Chi tiết →</span>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="finance-title"
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white relative shrink-0">
              <button
                ref={closeRef}
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
                <>
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">Báo cáo tài chính</div>
                  <h3 id="finance-title" className="text-2xl font-black">Chi Tiết Thu – Chi</h3>
                </>
            </div>

            <div className="overflow-y-auto">
              <>
                  <ul className="p-6 space-y-3">
                    {items.map(({ key, label, value, note, icon: ItemIcon, sign, gradient }) => (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => { setOpen(false); onSelectDetail?.(key); }}
                          className="group w-full text-left flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 transition-colors cursor-pointer"
                        >
                          <span className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center`}>
                            <ItemIcon className="w-5 h-5" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900">{label}</div>
                            <div className="text-xs text-slate-500 font-medium truncate">{note}</div>
                          </div>
                          <div className={`text-base font-black tabular-nums whitespace-nowrap ${sign > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {sign > 0 ? '+' : '−'} {formatMoney(value)}
                          </div>
                          <ChevronRight className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="mx-6 mb-6 p-5 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Scale className="w-6 h-6 text-slate-500" />
                      <div>
                        <div className="text-sm font-black text-slate-900 uppercase tracking-wide">Lợi nhuận ròng</div>
                        <div className="text-xs text-slate-500 font-medium">Doanh thu − Lương tài xế − Bảo dưỡng</div>
                      </div>
                    </div>
                    <div className={`text-2xl font-black tabular-nums whitespace-nowrap ${net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {formatMoney(net)}
                    </div>
                  </div>
              </>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
