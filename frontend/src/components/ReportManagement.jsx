import { useState } from 'react';
import { 
  BarChart3, DollarSign,
  Users, Filter, Loader2,
  ArrowDownWideNarrow, ArrowUpNarrowWide 
} from 'lucide-react';
import { api, currentMonthRange } from '../services/api';
import DatePicker from './DatePicker';

export default function ReportManagement({
  initialRevenues = [],
  initialSalaries = []
}) {
  const [activeReportTab, setActiveReportTab] = useState('revenue'); // 'revenue' | 'salary'

  // Revenue filters & sorting
  const [tuNgay, setTuNgay] = useState(() => currentMonthRange().tuNgay);
  const [denNgay, setDenNgay] = useState(() => currentMonthRange().denNgay);
  const [revenues, setRevenues] = useState(initialRevenues);
  const [revenueSortOrder, setRevenueSortOrder] = useState('desc'); // 'desc' | 'asc'
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  // Salary filters & sorting
  const [nam, setNam] = useState(() => currentMonthRange().nam);
  const [thang, setThang] = useState(() => currentMonthRange().thang);
  const [salaries, setSalaries] = useState(initialSalaries);
  const [salarySortOrder, setSalarySortOrder] = useState('desc'); // 'desc' | 'asc'
  const [loadingSalary, setLoadingSalary] = useState(false);

  const formatMoney = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);
  };

  const handleFilterRevenue = async (e) => {
    e.preventDefault();
    setLoadingRevenue(true);
    try {
      const res = await api.getRevenues(tuNgay, denNgay);
      if (res && res.data) {
        setRevenues(res.data);
      }
    } catch (err) {
      console.warn("Lỗi tải doanh thu:", err);
    } finally {
      setLoadingRevenue(false);
    }
  };

  const handleFilterSalary = async (e) => {
    e.preventDefault();
    setLoadingSalary(true);
    try {
      const res = await api.getSalaries(nam, thang);
      if (res && res.data) {
        setSalaries(res.data);
      }
    } catch (err) {
      console.warn("Lỗi tải bảng lương:", err);
    } finally {
      setLoadingSalary(false);
    }
  };

  const totalRevenue = revenues.reduce((acc, r) => acc + (Number(r.tongDoanhThu) || 0), 0);
  const totalPax = revenues.reduce((acc, r) => acc + (Number(r.tongSoKhach) || 0), 0);
  const totalTrips = revenues.reduce((acc, r) => acc + (Number(r.soChuyenThucHien) || 0), 0);
  const totalPayroll = salaries.reduce((acc, s) => acc + (Number(s.tongLuongThang) || 0), 0);

  // Sort revenues by amount based on revenueSortOrder
  const sortedRevenues = [...revenues].sort((a, b) => {
    const revA = Number(a.tongDoanhThu || 0);
    const revB = Number(b.tongDoanhThu || 0);
    return revenueSortOrder === 'desc' ? revB - revA : revA - revB;
  });

  // Sort salaries by amount based on salarySortOrder
  const sortedSalaries = [...salaries].sort((a, b) => {
    const salA = Number(a.tongLuongThang || 0);
    const salB = Number(b.tongLuongThang || 0);
    return salarySortOrder === 'desc' ? salB - salA : salA - salB;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold mb-1.5">
            <BarChart3 className="w-4 h-4" />
            <span>Phân Hệ Thống Kê & Báo Cáo Tài Chính</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Báo Cáo Doanh Thu & Quyết Toán Lương
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 font-medium">
            Dữ liệu tổng hợp doanh thu theo từng phương tiện và quyết toán chi tiết quỹ lương nhân sự theo tháng
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveReportTab('revenue')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeReportTab === 'revenue'
                ? 'bg-white text-cyan-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Doanh Thu Theo Xe</span>
          </button>
          <button
            onClick={() => setActiveReportTab('salary')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeReportTab === 'salary'
                ? 'bg-white text-cyan-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quyết Toán Lương</span>
          </button>
        </div>
      </div>

      {activeReportTab === 'revenue' ? (
        <div className="space-y-6">
          
          {/* Revenue KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20">
              <div className="text-xs uppercase font-bold text-cyan-100 tracking-wider">Tổng Doanh Thu Đội Xe</div>
              <div className="text-3xl sm:text-4xl font-black mt-2">{formatMoney(totalRevenue)}</div>
              <div className="text-xs text-cyan-100 mt-1 font-medium">Từ {tuNgay} đến {denNgay}</div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Tổng Lượt Khách Phục Vụ</div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">{totalPax.toLocaleString('vi-VN')} Khách</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Trên tổng {totalTrips} chuyến xe hoàn tất</div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Hiệu Suất Xe Dẫn Đầu</div>
              <div className="text-3xl sm:text-4xl font-black text-blue-700 mt-2 truncate">
                {revenues[0]?.bienSo || '14B-999.88'}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                Doanh thu: {formatMoney(revenues[0]?.tongDoanhThu || 0)}
              </div>
            </div>
          </div>

          {/* Date Filter Bar (Clean & Compact) */}
          <form onSubmit={handleFilterRevenue} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3.5">
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
                disabled={loadingRevenue}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loadingRevenue ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
                <span>Lọc Báo Cáo</span>
              </button>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              * Click vào cột Doanh thu để đổi thứ tự sắp xếp
            </span>
          </form>

          {/* Revenue Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-4">STT</th>
                    <th className="py-4 px-4">Biển Kiểm Soát</th>
                    <th className="py-4 px-4">Dòng Phương Tiện</th>
                    <th className="py-4 px-4">Số Chuyến Thực Hiện</th>
                    <th className="py-4 px-4">Tổng Lượng Khách</th>
                    <th 
                      onClick={() => setRevenueSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                      className="py-4 px-4 text-right font-black cursor-pointer select-none group hover:text-cyan-700 transition-colors"
                      title="Bấm để đảo chiều sắp xếp (Cao ↔ Thấp)"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors">
                        <span>Tổng Doanh Thu (VNĐ)</span>
                        {revenueSortOrder === 'desc' ? (
                          <ArrowDownWideNarrow className="w-4 h-4 text-cyan-600" />
                        ) : (
                          <ArrowUpNarrowWide className="w-4 h-4 text-cyan-600" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedRevenues.map((r, idx) => (
                    <tr key={r.bienSo} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                          revenueSortOrder === 'desc' && idx === 0 
                            ? 'bg-amber-100 text-amber-800' 
                            : revenueSortOrder === 'desc' && idx === 1 
                            ? 'bg-slate-200 text-slate-700' 
                            : revenueSortOrder === 'desc' && idx === 2 
                            ? 'bg-amber-50 text-amber-900' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-bold text-xs sm:text-sm tracking-wide">
                          {r.bienSo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-bold text-sm sm:text-base">
                        {r.tenLoaiXe}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {r.soChuyenThucHien} chuyến
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {r.tongSoKhach} hành khách
                      </td>
                      <td className="py-3.5 px-4 font-black text-base text-cyan-700 text-right">
                        {formatMoney(r.tongDoanhThu)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* Salary Report Tab */
        <div className="space-y-6">
          
          {/* Salary KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20">
              <div className="text-xs uppercase font-bold text-emerald-100 tracking-wider">Tổng Quỹ Lương Quyết Toán</div>
              <div className="text-3xl sm:text-4xl font-black mt-2">{formatMoney(totalPayroll)}</div>
              <div className="text-xs text-emerald-100 mt-1 font-medium">Kỳ lương tháng {thang}/{nam}</div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Thu Nhập Cao Nhất</div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-2 truncate">
                {salaries[0]?.hoTen || 'Nguyễn Văn Hùng'}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                Lương: {formatMoney(salaries[0]?.tongLuongThang || 0)} (Hạng {salaries[0]?.loaiBangLai})
              </div>
            </div>
          </div>

          {/* Month/Year Selector */}
          <form onSubmit={handleFilterSalary} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <span className="text-sm font-bold text-slate-700">Tháng:</span>
              <select
                value={thang}
                onChange={(e) => setThang(Number(e.target.value))}
                className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                {[9, 10, 11, 12].map(m => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>

              <span className="text-sm font-bold text-slate-700">Năm:</span>
              <select
                value={nam}
                onChange={(e) => setNam(Number(e.target.value))}
                className="px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                {[0, 1, 2, 3].map(i => currentMonthRange().nam - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <button
                type="submit"
                disabled={loadingSalary}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loadingSalary ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
                <span>Quyết Toán</span>
              </button>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              * Click vào cột Lương để đổi thứ tự sắp xếp
            </span>
          </form>

          {/* Salaries Table with Sort on Salary Column */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-4">STT</th>
                    <th className="py-4 px-4">Mã NV</th>
                    <th className="py-4 px-4">Họ Và Tên</th>
                    <th className="py-4 px-4">Hạng Bằng</th>
                    <th className="py-4 px-4">Lái Chính</th>
                    <th className="py-4 px-4">Phụ Xe</th>
                    <th 
                      onClick={() => setSalarySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                      className="py-4 px-4 text-right font-black cursor-pointer select-none group hover:text-emerald-700 transition-colors"
                      title="Bấm để đảo chiều sắp xếp lương (Cao ↔ Thấp)"
                    >
                      <div className="inline-flex items-center justify-end gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors">
                        <span>Tổng Lương Quyết Toán</span>
                        {salarySortOrder === 'desc' ? (
                          <ArrowDownWideNarrow className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ArrowUpNarrowWide className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedSalaries.map((s, idx) => (
                    <tr key={s.maTaiXe} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                          salarySortOrder === 'desc' && idx === 0 
                            ? 'bg-amber-100 text-amber-800' 
                            : salarySortOrder === 'desc' && idx === 1 
                            ? 'bg-slate-200 text-slate-700' 
                            : salarySortOrder === 'desc' && idx === 2 
                            ? 'bg-amber-50 text-amber-900' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-400">
                        #{s.maTaiXe}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm sm:text-base">
                        {s.hoTen}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-800 text-xs">
                          {s.loaiBangLai}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {s.soChuyenLaiChinh} chuyến
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {s.soChuyenPhuXe} chuyến
                      </td>
                      <td className="py-3.5 px-4 font-black text-base text-emerald-700 text-right">
                        {formatMoney(s.tongLuongThang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
