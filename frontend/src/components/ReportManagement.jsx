import { useState } from 'react';
import { BarChart3, Filter, Loader2, Bus, Users, Wrench } from 'lucide-react';
import { api, currentMonthRange, MISSING } from '../services/api';
import DatePicker from './DatePicker';
import FinanceSummary from './FinanceSummary';
import RevenueChart from './RevenueChart';
import { RevenueTable, PayrollTable, MaintenanceTable } from './FinanceDetailTables';

const DETAIL_TABS = [
  { key: 'revenue', label: 'Doanh thu', icon: Bus, active: 'bg-cyan-600 text-white' },
  { key: 'payroll', label: 'Lương', icon: Users, active: 'bg-emerald-600 text-white' },
  { key: 'maintenance', label: 'Bảo dưỡng', icon: Wrench, active: 'bg-orange-500 text-white' }
];


export default function ReportManagement({
  initialRevenues = [],
  initialSalaries = [],
  trips = [],
  maintenanceHistory = []
}) {
  // Giá trị đang chọn trên bộ lọc
  const [tuNgay, setTuNgay] = useState(() => currentMonthRange().tuNgay);
  const [denNgay, setDenNgay] = useState(() => currentMonthRange().denNgay);

  // Kỳ đã áp dụng (chỉ đổi sau khi bấm "Lọc Báo Cáo")
  const [applied, setApplied] = useState({ tuNgay, denNgay });
  const [revenues, setRevenues] = useState(initialRevenues);
  const [salaries, setSalaries] = useState(initialSalaries);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [detailTab, setDetailTab] = useState('revenue');

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);
  const fmtDate = (iso) => iso.split('-').reverse().join('/');
  const period = `Từ ${fmtDate(applied.tuNgay)} đến ${fmtDate(applied.denNgay)}`;

  const handleFilter = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      // Lương trả theo chuyến nên tính cùng khoảng ngày với doanh thu, lợi nhuận mới khớp kỳ
      const [rev, sal] = await Promise.all([api.getRevenues(tuNgay, denNgay), api.getSalariesInRange(tuNgay, denNgay)]);
      setRevenues(rev);
      setSalaries(sal);
      setApplied({ tuNgay, denNgay });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPax = revenues.reduce((acc, r) => acc + (Number(r.tongSoKhach) || 0), 0);
  const totalTrips = revenues.reduce((acc, r) => acc + (Number(r.soChuyenThucHien) || 0), 0);
  const maintenanceInRange = maintenanceHistory.filter(m => m.ngayBaoDuong >= applied.tuNgay && m.ngayBaoDuong <= applied.denNgay);
  // Backend đã trả doanh thu giảm dần nên phần tử đầu là xe dẫn đầu
  const topVehicle = revenues[0];

  // Từ popup tài chính: mở bảng tương ứng rồi cuộn tới
  const showDetail = (key) => {
    setDetailTab(key);
    document.getElementById('report-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sumOf = (list, key) => list.reduce((acc, x) => acc + (Number(x[key]) || 0), 0);
  const detail = {
    revenue: { title: 'Doanh thu theo xe', note: period, total: sumOf(revenues, 'tongDoanhThu'), color: 'text-cyan-700', table: <><RevenueChart trips={trips} tuNgay={applied.tuNgay} denNgay={applied.denNgay} /><RevenueTable revenues={revenues} /></> },
    payroll: { title: 'Thu nhập tài xế', note: `Lương các chuyến hoàn thành · ${period}`, total: sumOf(salaries, 'tongLuongThang'), color: 'text-emerald-700', table: <PayrollTable salaries={salaries} /> },
    maintenance: { title: 'Chi phí bảo dưỡng', note: `${maintenanceInRange.length} đợt · ${period}`, total: sumOf(maintenanceInRange, 'chiPhi'), color: 'text-orange-700', table: <MaintenanceTable items={maintenanceInRange} /> }
  }[detailTab];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold mb-1.5">
          <BarChart3 className="w-4 h-4" />
          <span>Phân Hệ Thống Kê & Báo Cáo Tài Chính</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Báo Cáo Doanh Thu & Chi Phí
        </h1>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FinanceSummary
          revenues={revenues}
          revenuePeriod={period}
          salaries={salaries}
          payrollPeriod={`Lương các chuyến ${period.charAt(0).toLowerCase()}${period.slice(1)}`}
          maintenanceItems={maintenanceInRange}
          onSelectDetail={showDetail}
        />

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Tổng Lượt Khách Phục Vụ</div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">{totalPax.toLocaleString('vi-VN')} Khách</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Trên tổng {totalTrips} chuyến xe</div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Hiệu Suất Xe Dẫn Đầu</div>
          <div className="text-3xl sm:text-4xl font-black text-blue-700 mt-2 truncate">{topVehicle?.bienSo ?? MISSING}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Doanh thu: {formatMoney(topVehicle?.tongDoanhThu)}</div>
        </div>
      </div>

      {/* Bộ lọc kỳ báo cáo: một khoảng ngày chung cho doanh thu, lương và bảo dưỡng */}
      <form onSubmit={handleFilter} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">Từ ngày:</span>
          <DatePicker
            required
            value={tuNgay}
            onChange={setTuNgay}
            max={denNgay}
            className="w-40 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">Đến ngày:</span>
          <DatePicker
            required
            value={denNgay}
            onChange={setDenNgay}
            min={tuNgay}
            className="w-40 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-cyan-500"
          />
        </div>


        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
          <span>Lọc Báo Cáo</span>
        </button>

        {errorMsg && <span role="alert" className="text-sm font-semibold text-rose-600">{errorMsg}</span>}

        {/* Chọn bảng chi tiết hiển thị bên dưới */}
        <div role="group" aria-label="Bảng chi tiết" className="ml-auto flex items-center gap-1 p-1 rounded-xl bg-slate-100">
          {DETAIL_TABS.map(({ key, label, icon: TabIcon, active }) => (
            <button
              key={key}
              type="button"
              onClick={() => setDetailTab(key)}
              aria-pressed={detailTab === key}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                detailTab === key ? `${active} shadow-sm` : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </form>

      {/* Bảng chi tiết của khoản đang chọn */}
      <section id="report-detail" className="scroll-mt-24 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900">{detail.title}</h2>
            <p className="text-sm text-slate-500 font-medium">{detail.note}</p>
          </div>
          <span className={`text-xl font-black ${detail.color}`}>{formatMoney(detail.total)}</span>
        </div>
        <div key={detailTab} className="space-y-4">{detail.table}</div>
      </section>

    </div>
  );
}
