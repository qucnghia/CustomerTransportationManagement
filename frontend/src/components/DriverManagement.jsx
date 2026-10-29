import { useState } from 'react';
import { 
  Users, PlusCircle, Search, Trash2, DollarSign, Pencil,
  ArrowDownWideNarrow, ArrowUpNarrowWide 
} from 'lucide-react';
import Pagination from './Pagination';
import { usePagination } from './usePagination';
import { currentMonthRange } from '../services/api';

export default function DriverManagement({
  drivers = [],
  salaries = [],
  onOpenCreate,
  onEditDriver,
  onDeleteDriver
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [licenseFilter, setLicenseFilter] = useState('ALL');
  const [viewSubTab, setViewSubTab] = useState('profiles'); // 'profiles' | 'salaries'
  const [salarySortOrder, setSalarySortOrder] = useState('desc'); // 'desc' | 'asc'

  const formatMoney = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);
  };

  const safeDrivers = Array.isArray(drivers) ? drivers : [];

  const filteredDrivers = safeDrivers.filter(d => {
    if (!d) return false;
    const name = String(d.hoTen || '').toLowerCase();
    const cccd = String(d.cccd || '').toLowerCase();
    const license = String(d.maSoBangLai || '').toLowerCase();
    const grade = String(d.loaiBangLai || '');

    const q = searchTerm.toLowerCase().trim();
    const matchSearch = !q || name.includes(q) || cccd.includes(q) || license.includes(q);
    const matchGrade = licenseFilter === 'ALL' || grade === licenseFilter;

    return matchSearch && matchGrade;
  });

  const sortedSalaries = [...salaries].sort((a, b) => {
    const salA = Number(a.tongLuongThang || 0);
    const salB = Number(b.tongLuongThang || 0);
    return salarySortOrder === 'desc' ? salB - salA : salA - salB;
  });

  const driverPager = usePagination(filteredDrivers, `${searchTerm}|${licenseFilter}`);
  const salaryPager = usePagination(sortedSalaries, salarySortOrder);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-1.5">
            <Users className="w-4 h-4" />
            <span>Phân Hệ Quản Lý Nhân Sự & Đội Ngũ Lái Xe</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Hồ Sơ Tài Xế & Bảng Tính Lương
          </h1>
        </div>

        <button
          onClick={() => onOpenCreate && onOpenCreate('driver')}
          className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Thêm Tài Xế Mới</span>
        </button>
      </div>

      {/* Sub Tabs: Profiles vs Salaries */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setViewSubTab('profiles')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              viewSubTab === 'profiles'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Hồ Sơ Nhân Sự ({safeDrivers.length})
          </button>
          <button
            onClick={() => setViewSubTab('salaries')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewSubTab === 'salaries'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Bảng Tính Lương Tháng</span>
          </button>
        </div>

        {viewSubTab === 'profiles' && (
          <div className="flex items-center gap-2">
            <select
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
              className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả hạng bằng</option>
              <option value="D">Hạng D</option>
              <option value="E">Hạng E</option>
              <option value="FC">Hạng FC</option>
              <option value="FD">Hạng FD</option>
            </select>
          </div>
        )}
      </div>

      {viewSubTab === 'profiles' ? (
        <>
          {/* Search */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm theo họ tên, CCCD, mã số bằng lái..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-3" />
            </div>

            <span className="text-sm font-bold text-slate-600">
              Tổng số: {filteredDrivers.length} nhân sự
            </span>
          </div>

          {/* Drivers Table */}
          <div className="scroll-mt-24 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-4">Mã NV</th>
                    <th className="py-4 px-4">Họ Và Tên</th>
                    <th className="py-4 px-4">Số CCCD (12 số)</th>
                    <th className="py-4 px-4">Mã Bằng Lái</th>
                    <th className="py-4 px-4">Hạng Bằng</th>
                    <th className="py-4 px-4">Thâm Niên</th>
                    <th className="py-4 px-4">Ngày Sinh</th>
                    <th className="py-4 px-4">Địa Chỉ</th>
                    <th className="py-4 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400 font-medium">
                        Không tìm thấy tài xế nào phù hợp
                      </td>
                    </tr>
                  ) : (
                    driverPager.pageItems.map((driver) => (
                      <tr key={driver.id || driver.maTaiXe} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-400">
                          #{driver.id || driver.maTaiXe}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm sm:text-base">
                          {driver.hoTen}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold tracking-wide">
                          {driver.cccd}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {driver.maSoBangLai}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200">
                            Hạng {driver.loaiBangLai}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {driver.thamNien} năm
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium text-xs sm:text-sm">
                          {driver.ngaySinh}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 max-w-[200px] truncate font-medium">
                          {driver.diaChi || 'Việt Nam'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {onEditDriver && (
                            <button
                              onClick={() => onEditDriver(driver)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                              title="Sửa hồ sơ tài xế"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {onDeleteDriver && (
                            <button
                              onClick={() => onDeleteDriver(driver.id || driver.maTaiXe)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Xóa nhân sự"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination pager={driverPager} unit="tài xế" label="Phân trang tài xế" />
        </>
      ) : (
        /* Driver Salaries Tab with Clickable Sort on Salary */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Bảng Quyết Toán Tiền Lương Theo Chuyến Xe (Tháng {currentMonthRange().thang}/{currentMonthRange().nam})
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Tính tự động từ các chuyến đã hoàn thành: 500.000đ/chuyến × hệ số vai trò (lái chính 2.0, phụ xe 1.0) × hệ số đường khó.
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              Đã quyết toán
            </span>
          </div>

          <div className="scroll-mt-24 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">STT</th>
                  <th className="py-3.5 px-4">Mã NV</th>
                  <th className="py-3.5 px-4">Họ Và Tên</th>
                  <th className="py-3.5 px-4">Hạng Bằng</th>
                  <th className="py-3.5 px-4">Số Chuyến Lái Chính</th>
                  <th className="py-3.5 px-4">Số Chuyến Phụ Xe</th>
                  <th 
                    onClick={() => setSalarySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="py-3.5 px-4 text-right font-black cursor-pointer select-none group hover:text-emerald-700 transition-colors"
                    title="Bấm để đảo chiều sắp xếp lương (Cao ↔ Thấp)"
                  >
                    <div className="inline-flex items-center justify-end gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors">
                      <span>Tổng Lương Thực Nhận</span>
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
                {salaryPager.pageItems.map((sal, i) => {
                  const idx = salaryPager.firstIndex + i; // thứ hạng trên toàn bảng, không chỉ trong trang
                  return (
                  <tr key={sal.maTaiXe} className="hover:bg-slate-50/70 transition-colors">
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
                      #{sal.maTaiXe}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-base">
                      {sal.hoTen}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-800 text-xs">
                        {sal.loaiBangLai}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {sal.soChuyenLaiChinh} chuyến
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {sal.soChuyenPhuXe} chuyến
                    </td>
                    <td className="py-3.5 px-4 font-black text-base text-emerald-700 text-right">
                      {formatMoney(sal.tongLuongThang)}
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>

          <Pagination pager={salaryPager} unit="tài xế" label="Phân trang bảng lương" />
        </div>
      )}

    </div>
  );
}
