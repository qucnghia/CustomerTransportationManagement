import { useState } from 'react';
import { 
  CalendarRange, Filter, Search, PlusCircle, Pencil, ChevronRight, Ban
} from 'lucide-react';
import Pagination from './Pagination';
import { usePagination } from './usePagination';

const STATUS_STYLE = {
  DaLenLich: 'bg-amber-100 text-amber-700',
  DangChay: 'bg-blue-100 text-blue-700',
  HoanThanh: 'bg-emerald-100 text-emerald-700',
  Huy: 'bg-rose-100 text-rose-700'
};
// Bước kế tiếp được phép (một chiều, không lùi lại)
const NEXT_STATUS = { DaLenLich: 'Đang chạy', DangChay: 'Hoàn thành' };

// Nhãn trạng thái; với chuyến chưa xong thì là nút bấm chuyển sang bước kế tiếp,
// chuyến sắp khởi hành có thêm nút Hủy bên cạnh
function StatusBadge({ trip, onAdvance, onCancel }) {
  const base = `inline-flex items-center gap-1 whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[trip.trangThai] ?? 'bg-slate-100 text-slate-600'}`;
  const next = NEXT_STATUS[trip.trangThai];
  if (!next || !onAdvance) return <span className={base}>{trip.trangThaiChuyen}</span>;
  const advance = (
    <button
      type="button"
      onClick={() => onAdvance(trip)}
      title={`Bấm để chuyển sang "${next}" (không thể hoàn tác)`}
      className={`${base} group cursor-pointer ring-1 ring-inset ring-current/20 hover:ring-current/60 transition-shadow`}
    >
      <span>{trip.trangThaiChuyen}</span>
      <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
    </button>
  );
  if (trip.trangThai !== 'DaLenLich' || !onCancel) return advance;
  return (
    <div className="flex items-center gap-1.5">
      {advance}
      <button
        type="button"
        onClick={() => onCancel(trip)}
        title="Hủy chuyến (giữ lại thông tin, không tính doanh thu, lương, km)"
        className="inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-bold text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50 hover:ring-rose-400 cursor-pointer transition-colors"
      >
        <Ban className="w-3.5 h-3.5" />
        <span>Hủy</span>
      </button>
    </div>
  );
}

export default function TripManagement({ 
  trips = [], 
  onOpenCreate,
  onEditTrip,
  onAdvanceStatus,
  onCancelTrip
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const formatMoney = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);
  };

  const safeTrips = Array.isArray(trips) ? trips : [];

  const filteredTrips = safeTrips.filter(t => {
    if (!t) return false;
    const name = String(t.tenTuyen || '').toLowerCase();
    const plate = String(t.bienSoXe || '').toLowerCase();
    const driver = String(t.tenTaiXeChinh || '').toLowerCase();
    const status = String(t.trangThaiChuyen || t.trangThai || '');

    const q = searchTerm.toLowerCase().trim();
    const matchSearch = !q || name.includes(q) || plate.includes(q) || driver.includes(q);
    const matchStatus = statusFilter === 'ALL' || status === statusFilter;

    return matchSearch && matchStatus;
  });

  const pager = usePagination(filteredTrips, `${searchTerm}|${statusFilter}`);
  const pageTrips = pager.pageItems;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-1.5">
            <CalendarRange className="w-4 h-4" />
            <span>Phân Hệ Điều Phối Chuyến Xe</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Quản Lý Lịch Trình Chuyến Xe
          </h1>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onOpenCreate && onOpenCreate('trip')}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Điều Phối Chuyến Xe Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Tìm theo tuyến đường, biển số xe, tài xế..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Đang chạy">Đang chạy</option>
              <option value="Sắp khởi hành">Sắp khởi hành</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Dạng Bảng
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'cards' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Dạng Thẻ
          </button>
        </div>
      </div>

      {/* Main Content: Table View */}
      <div className="scroll-mt-24">
      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-4">Mã</th>
                  <th className="py-4 px-4">Tuyến Đường</th>
                  <th className="py-4 px-4">Phương Tiện</th>
                  <th className="py-4 px-4">Lái Chính (x2)</th>
                  <th className="py-4 px-4">Phụ Xe (x1)</th>
                  <th className="py-4 px-4">Giờ Khởi Hành</th>
                  <th className="py-4 px-4">Khách / Ghế</th>
                  <th className="py-4 px-4">Cước Phí</th>
                  <th className="py-4 px-4">Doanh Thu Chuyến</th>
                  <th className="py-4 px-4">Trạng Thái</th>
                  <th className="py-4 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-slate-400 font-medium">
                      Không tìm thấy chuyến xe nào phù hợp
                    </td>
                  </tr>
                ) : (
                  pageTrips.map((trip) => {
                    const pax = Number(trip.soKhach || 0);
                    const seats = trip.soGhe;
                    const fare = Number(trip.giaVe || 0);
                    const tripRev = pax * fare;

                    return (
                      <tr key={trip.maChuyen} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-400">
                          #{trip.maChuyen}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[240px]">
                          {trip.tenTuyen}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 block w-fit text-xs sm:text-sm tracking-wide">
                            {trip.bienSoXe}
                          </span>
                          <span className="text-xs text-slate-500 truncate block mt-1">
                            {trip.tenLoaiXe}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {trip.tenTaiXeChinh}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {trip.tenTaiXePhu}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold text-xs sm:text-sm">
                          {String(trip.thoiGianKhoiHanh).slice(0, 16)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {pax} / {seats}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {formatMoney(fare)}
                        </td>
                        <td className="py-3.5 px-4 font-black text-blue-700 text-sm sm:text-base">
                          {/* Chuyến đã hủy không tính doanh thu: gạch ngang để vẫn xem được số vé đã bán */}
                          <span className={trip.trangThai === 'Huy' ? 'line-through text-slate-400 font-semibold' : ''}>{formatMoney(tripRev)}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge trip={trip} onAdvance={onAdvanceStatus} onCancel={onCancelTrip} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {onEditTrip && (
                            <button
                              onClick={() => onEditTrip(trip)}
                              disabled={trip.trangThai === 'HoanThanh' || trip.trangThai === 'Huy'}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
                              title={trip.trangThai === 'HoanThanh' ? 'Chuyến đã hoàn thành, không thể sửa'
                                : trip.trangThai === 'Huy' ? 'Chuyến đã hủy, không thể sửa' : 'Sửa chuyến xe'}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageTrips.map((trip) => {
            const pax = Number(trip.soKhach || 0);
            const seats = trip.soGhe;
            const fare = Number(trip.giaVe || 0);
            const tripRev = pax * fare;
            const occupancy = Math.min(100, Math.round((pax / seats) * 100));

            return (
              <div 
                key={trip.maChuyen}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-sm font-bold text-slate-400">#{trip.maChuyen}</span>
                    <StatusBadge trip={trip} onAdvance={onAdvanceStatus} onCancel={onCancelTrip} />
                  </div>

                  <h2 className="font-black text-slate-900 text-base mb-3 leading-snug">
                    {trip.tenTuyen}
                  </h2>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Phương tiện:</span>
                      <span className="font-bold text-slate-900">{trip.bienSoXe} ({trip.tenLoaiXe})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Lái xe chính:</span>
                      <span className="font-bold text-slate-900">{trip.tenTaiXeChinh}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Phụ xe:</span>
                      <span className="text-slate-700 font-semibold">{trip.tenTaiXePhu}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Khởi hành:</span>
                      <span className="font-semibold text-slate-800">{String(trip.thoiGianKhoiHanh).slice(0, 16)}</span>
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                      <span className="text-slate-500 font-medium">Hành khách trên xe:</span>
                      <span className="font-black text-slate-900">{pax} / {seats} ({occupancy}%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${occupancy >= 90 ? 'bg-rose-500' : 'bg-blue-500'}`} 
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase block">Doanh Thu Chuyến</span>
                    <span className={`font-black text-base sm:text-lg ${trip.trangThai === 'Huy' ? 'line-through text-slate-400' : 'text-blue-700'}`}>{formatMoney(tripRev)}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-600">
                    {formatMoney(fare)} / khách
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      <Pagination pager={pager} unit="chuyến" label="Phân trang chuyến xe" />

    </div>
  );
}
