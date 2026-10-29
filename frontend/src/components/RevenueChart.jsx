import { useState } from 'react';
import { bucketRevenue } from './revenueBuckets';

const GROUPS = [
  { key: 'day', label: 'Ngày' },
  { key: 'week', label: 'Tuần' },
  { key: 'month', label: 'Tháng' }
];
const MAX_X_LABELS = 10;

const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
// Nhãn trục gọn: 38,8 tr / 1,2 tỷ
const compact = (v) => (v >= 1e9 ? `${(v / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`
  : v >= 1e6 ? `${(v / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr` : v.toLocaleString('vi-VN'));

// Trục tung tròn số: 1 / 2 / 5 × 10^k
const niceMax = (v) => {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 5, 10].map(m => m * p).find(n => n >= v);
};

export default function RevenueChart({ trips, tuNgay, denNgay }) {
  const [group, setGroup] = useState('day');
  const data = bucketRevenue(trips, tuNgay, denNgay, group);
  const top = niceMax(Math.max(...data.map(b => b.revenue)));
  const ticks = [4, 3, 2, 1, 0].map(i => (top * i) / 4);
  const labelEvery = Math.ceil(data.length / MAX_X_LABELS);
  const total = data.reduce((s, b) => s + b.revenue, 0);

  return (
    <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-black text-slate-900">Doanh thu theo {GROUPS.find(g => g.key === group).label.toLowerCase()}</h3>
        <div role="group" aria-label="Gom doanh thu theo" className="flex items-center gap-1 p-1 rounded-lg bg-slate-100">
          {GROUPS.map(g => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGroup(g.key)}
              aria-pressed={group === g.key}
              className={`px-3 py-1 rounded-md text-xs font-bold cursor-pointer transition-colors ${
                group === g.key ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <p className="py-16 text-center text-sm font-medium text-slate-400">Không có doanh thu trong kỳ này</p>
      ) : (
        <div className="flex gap-2" aria-hidden="true">
          {/* Trục tung */}
          <div className="relative h-56 w-12 shrink-0 text-right text-[11px] font-medium text-slate-400 tabular-nums">
            {ticks.map((v, i) => (
              <span key={v} className="absolute right-0 -translate-y-1/2" style={{ top: `${(i / 4) * 100}%` }}>{compact(v)}</span>
            ))}
          </div>

          <div className="flex-1 min-w-0">
            {/* Vùng vẽ: lưới mờ + cột */}
            <div className="relative h-56">
              {ticks.map((v, i) => (
                <div key={v} className={`absolute inset-x-0 border-t ${i === 4 ? 'border-slate-300' : 'border-slate-100'}`} style={{ top: `${(i / 4) * 100}%` }} />
              ))}
              <div className="absolute inset-0 flex items-end gap-[2px]">
                {data.map((b, i) => (
                  <div key={b.key} tabIndex={0} className="group relative flex-1 h-full flex items-end outline-none">
                    {/* Vùng bắt chuột cao hết khung, lớn hơn cột */}
                    <div
                      className="w-full max-w-12 mx-auto rounded-t bg-cyan-500 group-hover:bg-cyan-600 group-focus-visible:bg-cyan-600 transition-colors"
                      style={{ height: `${(b.revenue / top) * 100}%`, minHeight: b.revenue > 0 ? 2 : 0 }}
                    />
                    <div
                      className={`pointer-events-none absolute mb-2 z-10 hidden group-hover:block group-focus-visible:block whitespace-nowrap px-3 py-2 rounded-xl bg-slate-900 text-white text-xs shadow-lg ${
                        i < data.length / 2 ? 'left-0' : 'right-0'
                      }`}
                      style={{ bottom: `${(b.revenue / top) * 100}%` }}
                    >
                      <div className="font-bold text-slate-300">{b.label}</div>
                      <div className="text-sm font-black">{formatMoney(b.revenue)}</div>
                      <div className="text-slate-300">{b.trips} chuyến</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trục hoành: nhãn thưa để không chồng nhau */}
            <div className="flex gap-[2px] mt-1.5 text-[11px] font-medium text-slate-400">
              {data.map((b, i) => (
                <span key={b.key} className="flex-1 min-w-0 text-center whitespace-nowrap overflow-visible">
                  {i % labelEvery === 0 ? b.label.replace('Tuần ', '') : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bảng dữ liệu cho trình đọc màn hình */}
      <table className="sr-only">
        <caption>Doanh thu theo {GROUPS.find(g => g.key === group).label.toLowerCase()}</caption>
        <thead><tr><th>Kỳ</th><th>Doanh thu</th><th>Số chuyến</th></tr></thead>
        <tbody>
          {data.map(b => <tr key={b.key}><td>{b.label}</td><td>{formatMoney(b.revenue)}</td><td>{b.trips}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
