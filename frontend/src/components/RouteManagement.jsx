import { useState } from 'react';
import { 
  MapPin, PlusCircle, Search, Mountain, TrendingUp,
  Trees, Trash2, Pencil
} from 'lucide-react';

export default function RouteManagement({
  routes = [],
  onOpenCreate,
  onEditRoute,
  onDeleteRoute
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const safeRoutes = Array.isArray(routes) ? routes : [];

  const filteredRoutes = safeRoutes.filter(r => {
    if (!r) return false;
    const name = String(r.tenTuyen || `${r.diemDau} - ${r.diemCuoi}`).toLowerCase();
    const q = searchTerm.toLowerCase().trim();
    return !q || name.includes(q);
  });

  const getTerrainBadge = (complexity) => {
    const comp = Number(complexity || 1);
    if (comp === 3) {
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
          <Mountain className="w-3.5 h-3.5 text-rose-600" />
          <span>Miền núi • Hệ số 1.7x</span>
        </span>
      );
    } else if (comp === 2) {
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          <span>Trung du • Hệ số 1.3x</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
        <Trees className="w-3.5 h-3.5 text-emerald-600" />
        <span>Đồng bằng • Hệ số 1.0x</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-1.5">
            <MapPin className="w-4 h-4" />
            <span>Phân Hệ Quản Lý Mạng Tuyến Vận Tải</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Mạng Lưới Tuyến Xe Liên Tỉnh
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 font-medium">
            Theo dõi {safeRoutes.length} tuyến vận chuyển, khoảng cách cự ly và hệ số phức tạp địa hình
          </p>
        </div>

        <button
          onClick={() => onOpenCreate && onOpenCreate('route')}
          className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Thêm Tuyến Đường Mới</span>
        </button>
      </div>

      {/* Terrain Factor Legend */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
        <div className="text-slate-600 font-medium">
          <strong className="text-slate-900">Quy định hệ số địa hình:</strong> Phụ cấp lương lái xe & tỷ lệ mài mòn phương tiện theo View phân tích.
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {getTerrainBadge(1)}
          {getTerrainBadge(2)}
          {getTerrainBadge(3)}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Tìm theo điểm đi, điểm đến, tên tuyến..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
          />
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-3" />
        </div>

        <span className="text-sm font-bold text-slate-600">
          Hiển thị: {filteredRoutes.length} / {safeRoutes.length} Tuyến
        </span>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-4">Mã Tuyến</th>
                <th className="py-4 px-4">Lộ Trình Tuyến Xe</th>
                <th className="py-4 px-4">Điểm Xuất Phát</th>
                <th className="py-4 px-4">Điểm Kết Thúc</th>
                <th className="py-4 px-4">Cự Ly Khoảng Cách</th>
                <th className="py-4 px-4">Độ Phức Tạp Địa Hình</th>
                <th className="py-4 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    Không tìm thấy tuyến đường nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((route) => {
                  const dist = route.quangDuongKm;

                  return (
                    <tr key={route.maTuyen} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-400">
                        #{route.maTuyen}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-[260px] text-sm sm:text-base">
                        {route.tenTuyen || `${route.diemDau} - ${route.diemCuoi}`}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {route.diemDau}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {route.diemCuoi}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {dist} km
                      </td>
                      <td className="py-3.5 px-4">
                        {getTerrainBadge(route.doPhucTap)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {onEditRoute && (
                          <button
                            onClick={() => onEditRoute(route)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="Sửa tuyến đường"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {onDeleteRoute && (
                          <button
                            onClick={() => onDeleteRoute(route.maTuyen)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Xóa tuyến đường"
                          >
                            <Trash2 className="w-4 h-4" />
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

    </div>
  );
}
