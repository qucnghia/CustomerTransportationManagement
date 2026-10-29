import { 
  Bus, CalendarRange, MapPin, Users, Wrench, DollarSign, 
  AlertTriangle, ArrowUpRight, Plus, ShieldCheck, CheckCircle2 
} from 'lucide-react';

export default function DashboardOverview({
  trips = [],
  vehicles = [],
  routes = [],
  drivers = [],
  overdueVehicles = [],
  safeVehicles = [],
  onNavigateTab,
  onOpenCreate,
  onConfirmMaintenance
}) {
  const formatMoney = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);
  };

  const activeTripsCount = trips.filter(t => t.trangThaiChuyen === 'Đang chạy' || t.trangThai === 'DangChay').length;
  const scheduledTripsCount = trips.filter(t => t.trangThaiChuyen === 'Sắp khởi hành' || t.trangThaiChuyen === 'Đang mở bán' || t.trangThai === 'DaLenLich').length;
  
  // Doanh thu = số khách × giá vé của các chuyến không bị hủy (cùng quy tắc sp_BaoCaoDoanhThuTheoXe)
  const estimatedRevenue = trips
    .filter(t => t.trangThai !== 'Huy')
    .reduce((sum, t) => sum + (Number(t.soKhach) || 0) * (Number(t.giaVe) || 0), 0);

  const overdueCount = overdueVehicles.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Bảng Điều Hành Trung Tâm
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1.5 font-medium">
            Tổng quan thời gian thực về tình trạng phương tiện, lịch trình điều phối và cảnh báo kỹ thuật
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenCreate && onOpenCreate('trip')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Lập Chuyến Nhanh</span>
          </button>
        </div>
      </div>

      {/* Overdue Urgent Alert Banner */}
      {overdueCount > 0 ? (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white shadow-xl shadow-rose-500/15 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <AlertTriangle className="w-8 h-8 text-white animate-bounce" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-1.5">
                Ưu Tiên Kỹ Thuật Cấp Bách
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Cảnh Báo: Phát Hiện {overdueCount} Phương Tiện Quá Hạn Bảo Dưỡng!
              </h2>
              <p className="text-sm text-rose-100 mt-1 max-w-2xl font-medium leading-relaxed">
                Các phương tiện này đã vượt quá chu kỳ quy đổi km và số ngày cho phép. Cần kiểm tra xưởng và xác nhận bảo dưỡng xong trước khi tiếp tục phân chuyến.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab && onNavigateTab('maintenance')}
              className="px-5 py-3 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-bold text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Xử Lý Bảo Dưỡng Ngay</span>
              <ArrowUpRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-base block">Toàn Bộ Đội Xe Đạt Chuẩn An Toàn Vận Hành</span>
              <span className="text-sm text-emerald-700 font-medium">Không có phương tiện nào vượt định mức chu kỳ kỹ thuật</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('maintenance')}
            className="text-sm font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            Xem chi tiết chu kỳ →
          </button>
        </div>
      )}

      {/* 6 Key Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Card 1: Chuyến đang chạy */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('trips')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chuyến Đang Chạy</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <CalendarRange className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{activeTripsCount}</div>
          <div className="text-xs text-slate-500 mt-1.5 flex items-center justify-between font-medium">
            <span>+{scheduledTripsCount} đã lên lịch</span>
            <span className="text-blue-600 font-bold group-hover:underline">Chi tiết →</span>
          </div>
        </div>

        {/* Card 2: Tổng đội xe */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('vehicles')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đội Phương Tiện</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{vehicles.length}</div>
          <div className="text-xs text-slate-500 mt-1.5 flex items-center justify-between font-medium">
            <span className="text-emerald-700 font-bold">{safeVehicles.length} an toàn</span>
            <span className="text-amber-600 font-bold group-hover:underline">Chi tiết →</span>
          </div>
        </div>

        {/* Card 3: Xe quá hạn */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('maintenance')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
            overdueCount > 0 
              ? 'bg-rose-50/60 border-rose-200 hover:border-rose-400' 
              : 'bg-white border-slate-200 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${overdueCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
              Quá Hạn Bảo Dưỡng
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              overdueCount > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl font-black ${overdueCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {overdueCount} xe
          </div>
          <div className="text-xs mt-1.5 flex items-center justify-between font-medium">
            <span className={overdueCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
              {overdueCount > 0 ? 'Cần duyệt xong' : '100% đạt chuẩn'}
            </span>
            <span className="font-bold group-hover:underline text-rose-600">Xử lý →</span>
          </div>
        </div>

        {/* Card 4: Tuyến khai thác */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('routes')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mạng Tuyến Vận Tải</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{routes.length}</div>
          <div className="text-xs text-slate-500 mt-1.5 flex items-center justify-between font-medium">
            <span>Bắc - Trung - Nam</span>
            <span className="text-purple-600 font-bold group-hover:underline">Chi tiết →</span>
          </div>
        </div>

        {/* Card 5: Nhân sự tài xế */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('drivers')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nhân Sự Đội Xe</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{drivers.length}</div>
          <div className="text-xs text-slate-500 mt-1.5 flex items-center justify-between font-medium">
            <span>Bằng D, E, FC, FD</span>
            <span className="text-emerald-600 font-bold group-hover:underline">Bảng lương →</span>
          </div>
        </div>

        {/* Card 6: Doanh thu ước tính */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('reports')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh Thu Chuyến</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 truncate">
            {formatMoney(estimatedRevenue)}
          </div>
          <div className="text-xs text-slate-500 mt-1.5 flex items-center justify-between font-medium">
            <span>{trips.length} chuyến ghi nhận</span>
            <span className="text-cyan-600 font-bold group-hover:underline">Báo cáo →</span>
          </div>
        </div>

      </div>

      {/* Two Column Section: Urgent Maintenance Review + Recent Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col (2 cols): Recent Scheduled Trips */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Lịch Trình Chuyến Xe Gần Nhất
              </h2>
              <p className="text-sm text-slate-500 font-medium">Giám sát xe lăn bánh và tỷ lệ hành khách</p>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('trips')}
              className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              Xem tất cả ({trips.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3.5 font-bold">Tuyến Đường</th>
                  <th className="pb-3.5 font-bold">Xe & Biển Số</th>
                  <th className="pb-3.5 font-bold">Tài Xế Phụ Trách</th>
                  <th className="pb-3.5 font-bold">Khởi Hành</th>
                  <th className="pb-3.5 font-bold">Khách/Ghế</th>
                  <th className="pb-3.5 font-bold">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trips.slice(0, 5).map((trip) => {
                  const maxSeats = trip.soGhe;
                  const pax = Number(trip.soKhach || 0);

                  return (
                    <tr key={trip.maChuyen} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900 max-w-[220px] truncate">
                        {trip.tenTuyen}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-900 border border-slate-200 tracking-wide">
                          {trip.bienSoXe}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-800 font-semibold">
                        {trip.tenTaiXeChinh}
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium text-xs sm:text-sm">
                        {String(trip.thoiGianKhoiHanh).slice(0, 16)}
                      </td>
                      <td className="py-3.5 font-bold text-slate-900">
                        {pax}/{maxSeats}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold ${
                          trip.trangThaiChuyen === 'Đang chạy' 
                            ? 'bg-blue-100 text-blue-700'
                            : trip.trangThaiChuyen === 'Hoàn thành'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {trip.trangThaiChuyen}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col (1 col): Immediate Overdue Vehicles List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-rose-600" />
                <h2 className="text-lg font-black text-slate-900">Xe Cần Bảo Dưỡng Gấp</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black">
                {overdueVehicles.length} Xe
              </span>
            </div>

            {overdueVehicles.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm font-medium">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <span>Không có phương tiện nào quá hạn bảo dưỡng!</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                {overdueVehicles.slice(0, 3).map((v) => (
                  <div 
                    key={v.bienSo}
                    className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{v.bienSo}</span>
                        <span className="text-xs font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                          Quá {Math.abs(v.soNgayConLai || 0)} ngày
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 truncate max-w-[170px] font-medium">
                        {v.tenLoaiXe}
                      </div>
                    </div>

                    <button
                      onClick={() => onConfirmMaintenance && onConfirmMaintenance(v)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
                    >
                      Duyệt xong
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab && onNavigateTab('maintenance')}
            className="mt-5 w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer text-center"
          >
            Quản Lý Toàn Bộ Chu Kỳ Bảo Dưỡng →
          </button>
        </div>

      </div>

    </div>
  );
}
