import { useState } from 'react';
import { 
  Bus, PlusCircle, Search, ShieldCheck,
  AlertTriangle, Filter, Trash2, Pencil
} from 'lucide-react';

export default function VehicleManagement({
  vehicles = [],
  overdueList = [],
  onOpenCreate,
  onConfirmMaintenance,
  onEditVehicle,
  onDeleteVehicle
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');

  const overdueMap = new Map();
  overdueList.forEach(v => {
    overdueMap.set(v.bienSo, v);
  });

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  const filteredVehicles = safeVehicles.filter(v => {
    if (!v) return false;
    const plate = String(v.bienSo || '').toLowerCase();
    const brand = String(v.hangSanXuat || '').toLowerCase();
    const model = String(v.model || '').toLowerCase();

    const q = searchTerm.toLowerCase().trim();
    const matchSearch = !q || plate.includes(q) || brand.includes(q) || model.includes(q);
    const matchBrand = brandFilter === 'ALL' || brand === brandFilter.toLowerCase();

    return matchSearch && matchBrand;
  });

  const uniqueBrands = Array.from(new Set(safeVehicles.map(v => v.hangSanXuat).filter(Boolean)));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-1.5">
            <Bus className="w-4 h-4" />
            <span>Phân Hệ Quản Lý Đội Xe Khách</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Danh Sách & Hồ Sơ Phương Tiện
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 font-medium">
            Theo dõi {safeVehicles.length} phương tiện, biển kiểm soát, chu kỳ bảo dưỡng và tình trạng vận hành
          </p>
        </div>

        <button
          onClick={() => onOpenCreate && onOpenCreate('vehicle')}
          className="px-5 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-bold rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Thêm Xe Khách Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Tìm theo biển số, hãng sản xuất, model xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả hãng xe</option>
              {uniqueBrands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Fleet Stats */}
        <div className="flex items-center gap-3 text-sm">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 font-bold text-slate-700">
            Tổng: {safeVehicles.length} Xe
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-rose-100 text-rose-700 font-bold">
            Quá hạn: {overdueList.length} Xe
          </span>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-4">Biển Kiểm Soát</th>
                <th className="py-4 px-4">Hãng & Model</th>
                <th className="py-4 px-4">Màu Sơn</th>
                <th className="py-4 px-4">Đời Xe</th>
                <th className="py-4 px-4">Số Ghế</th>
                <th className="py-4 px-4">Năm Sử Dụng</th>
                <th className="py-4 px-4">Bảo Dưỡng Gần Nhất</th>
                <th className="py-4 px-4">Tình Trạng Kỹ Thuật</th>
                <th className="py-4 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 font-medium">
                    Không tìm thấy phương tiện nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const isOverdue = overdueMap.has(vehicle.bienSo);
                  const overdueInfo = overdueMap.get(vehicle.bienSo);

                  return (
                    <tr key={vehicle.bienSo} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-bold text-xs sm:text-sm tracking-wide shadow-xs">
                          {vehicle.bienSo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 block text-sm sm:text-base">{vehicle.hangSanXuat}</span>
                        <span className="text-xs text-slate-500 font-medium">{vehicle.model}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {vehicle.mauxe || 'Tiêu chuẩn'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {vehicle.doiXe}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {vehicle.soGhe} chỗ
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {vehicle.soNamSuDung} năm
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold text-xs sm:text-sm">
                        {vehicle.ngayBaoDuongCuoi ?? 'Chưa cập nhật'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-full bg-rose-100 text-rose-700 font-bold text-xs border border-rose-300 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Quá hạn {Math.abs(overdueInfo.soNgayConLai || 0)} ngày</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đạt chuẩn an toàn</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isOverdue && onConfirmMaintenance && (
                            <button
                              onClick={() => onConfirmMaintenance(overdueInfo || vehicle)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                            >
                              Duyệt bảo dưỡng
                            </button>
                          )}
                          {onEditVehicle && (
                            <button
                              onClick={() => onEditVehicle(vehicle)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                              title="Sửa phương tiện"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {onDeleteVehicle && (
                            <button
                              onClick={() => onDeleteVehicle(vehicle.bienSo)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Xóa phương tiện"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
