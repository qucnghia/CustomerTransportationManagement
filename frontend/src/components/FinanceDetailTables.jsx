import { useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import Pagination from './Pagination';
import { usePagination } from './usePagination';
import { MISSING } from '../services/api';

const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);
const th = 'py-3.5 px-4';
const td = 'py-3 px-4';

// Huy hiệu thứ hạng: vàng / bạc / đồng cho 3 vị trí đầu khi sắp xếp giảm dần
function Rank({ idx, desc }) {
  const medal = desc && ['bg-amber-100 text-amber-800', 'bg-slate-200 text-slate-700', 'bg-orange-100 text-orange-800'][idx];
  return (
    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${medal || 'bg-slate-100 text-slate-500'}`}>
      {idx + 1}
    </span>
  );
}

function SortHeader({ label, desc, onToggle, color }) {
  const Icon = desc ? ArrowDownWideNarrow : ArrowUpNarrowWide;
  return (
    <th className={`${th} text-right`}>
      <button
        type="button"
        onClick={onToggle}
        title="Bấm để đảo chiều sắp xếp (Cao ↔ Thấp)"
        className="inline-flex items-center gap-1.5 px-2 py-1 -mx-2 rounded-lg uppercase font-black hover:bg-slate-100 cursor-pointer"
      >
        <span>{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </button>
    </th>
  );
}

// Khung bảng dùng chung: phần đầu bảng + thân + phân trang
function Table({ head, children, pager, unit }) {
  return (
    <>
      <div className="scroll-mt-24 rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">{head}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">{children}</tbody>
          </table>
        </div>
      </div>
      <Pagination pager={pager} unit={unit} className="mt-4" />
    </>
  );
}

const Empty = ({ cols, text }) => (
  <tr><td colSpan={cols} className="py-10 text-center text-slate-400 font-medium">{text}</td></tr>
);

const useSorted = (items, key) => {
  const [desc, setDesc] = useState(true);
  const sorted = [...items].sort((a, b) => (desc ? b[key] - a[key] : a[key] - b[key]));
  return { sorted, desc, toggle: () => setDesc(d => !d) };
};

export function RevenueTable({ revenues }) {
  const { sorted, desc, toggle } = useSorted(revenues, 'tongDoanhThu');
  const pager = usePagination(sorted, String(desc));
  return (
    <Table
      pager={pager}
      unit="xe"
      head={<>
        <th className={th}>STT</th>
        <th className={th}>Biển Số</th>
        <th className={th}>Dòng Xe</th>
        <th className={th}>Số Chuyến</th>
        <th className={th}>Lượt Khách</th>
        <SortHeader label="Doanh Thu" desc={desc} onToggle={toggle} color="text-cyan-600" />
      </>}
    >
      {pager.total === 0 ? <Empty cols={6} text="Không có doanh thu trong kỳ này" /> : pager.pageItems.map((r, i) => (
        <tr key={r.bienSo} className="hover:bg-slate-50/70">
          <td className={td}><Rank idx={pager.firstIndex + i} desc={desc} /></td>
          <td className={td}>
            <span className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-xs tracking-wide">{r.bienSo}</span>
          </td>
          <td className={`${td} font-bold text-slate-900`}>{r.tenLoaiXe}</td>
          <td className={`${td} font-semibold text-slate-700 whitespace-nowrap`}>{r.soChuyenThucHien} chuyến</td>
          <td className={`${td} text-slate-600 whitespace-nowrap`}>{r.tongSoKhach} khách</td>
          <td className={`${td} text-right font-black text-cyan-700 whitespace-nowrap`}>{formatMoney(r.tongDoanhThu)}</td>
        </tr>
      ))}
    </Table>
  );
}

export function PayrollTable({ salaries }) {
  const { sorted, desc, toggle } = useSorted(salaries, 'tongLuongThang');
  const pager = usePagination(sorted, String(desc));
  return (
    <Table
      pager={pager}
      unit="tài xế"
      head={<>
        <th className={th}>STT</th>
        <th className={th}>Mã NV</th>
        <th className={th}>Họ Và Tên</th>
        <th className={th}>Hạng</th>
        <th className={th}>Lái Chính</th>
        <th className={th}>Phụ Xe</th>
        <SortHeader label="Lương" desc={desc} onToggle={toggle} color="text-emerald-600" />
      </>}
    >
      {pager.total === 0 ? <Empty cols={7} text="Chưa có dữ liệu lương trong tháng này" /> : pager.pageItems.map((s, i) => (
        <tr key={s.maTaiXe} className="hover:bg-slate-50/70">
          <td className={td}><Rank idx={pager.firstIndex + i} desc={desc} /></td>
          <td className={`${td} font-bold text-slate-400`}>#{s.maTaiXe}</td>
          <td className={`${td} font-bold text-slate-900`}>{s.hoTen}</td>
          <td className={td}><span className="px-2 py-0.5 rounded-lg bg-slate-100 font-bold text-slate-700 text-xs">{s.loaiBangLai}</span></td>
          <td className={`${td} font-semibold text-slate-700 whitespace-nowrap`}>{s.soChuyenLaiChinh} chuyến</td>
          <td className={`${td} text-slate-600 whitespace-nowrap`}>{s.soChuyenPhuXe} chuyến</td>
          <td className={`${td} text-right font-black text-emerald-700 whitespace-nowrap`}>{formatMoney(s.tongLuongThang)}</td>
        </tr>
      ))}
    </Table>
  );
}

export function MaintenanceTable({ items }) {
  // Mới nhất lên đầu
  const sorted = [...items].sort((a, b) => b.ngayBaoDuong.localeCompare(a.ngayBaoDuong));
  const pager = usePagination(sorted);
  return (
    <Table
      pager={pager}
      unit="đợt"
      head={<>
        <th className={th}>Ngày</th>
        <th className={th}>Biển Số</th>
        <th className={th}>Dòng Xe</th>
        <th className={th}>Nội Dung</th>
        <th className={`${th} text-right`}>Chi Phí</th>
      </>}
    >
      {pager.total === 0 ? <Empty cols={5} text="Không có đợt bảo dưỡng nào trong kỳ này" /> : pager.pageItems.map(m => (
        <tr key={m.id} className="hover:bg-slate-50/70">
          <td className={`${td} font-semibold text-slate-700 whitespace-nowrap`}>{m.ngayBaoDuong.split('-').reverse().join('/')}</td>
          <td className={td}>
            <span className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-xs tracking-wide">{m.xe?.bienSo ?? MISSING}</span>
          </td>
          <td className={`${td} font-bold text-slate-900`}>{m.xe ? `${m.xe.hangSanXuat} ${m.xe.model}` : MISSING}</td>
          <td className={`${td} text-slate-600 max-w-[280px]`}>{m.noiDung || MISSING}</td>
          <td className={`${td} text-right font-black text-orange-700 whitespace-nowrap`}>{formatMoney(m.chiPhi)}</td>
        </tr>
      ))}
    </Table>
  );
}
