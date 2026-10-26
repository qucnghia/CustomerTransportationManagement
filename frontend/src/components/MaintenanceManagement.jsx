import { useState } from 'react';
import {
  Wrench, ShieldCheck, AlertTriangle,
  CheckCircle2, Gauge, History
} from 'lucide-react';
import ConfirmMaintenanceModal from './ConfirmMaintenanceModal';

export default function MaintenanceManagement({
  overdueVehicles = [],
  safeVehicles = [],
  maintenanceHistory = [],
  onConfirmSuccess
}) {
  const [activeSubTab, setActiveSubTab] = useState('overdue'); // 'overdue' | 'safe' | 'history'
  const [selectedVehicleToConfirm, setSelectedVehicleToConfirm] = useState(null);

  const formatMoney = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);
  };

  const handleOpenConfirm = (vehicle) => setSelectedVehicleToConfirm(vehicle);

  const overdueCount = overdueVehicles.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-1.5">
            <Wrench className="w-4 h-4 text-rose-600" />
            <span>Phân Hệ Kỹ Thuật & Giám Sát Chu Kỳ Phương Tiện</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Quản Lý Chu Kỳ & Xác Nhận Bảo Dưỡng
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-3xl font-medium">
            Tính toán tự động theo hệ số mòn xe: Đường đồng bằng (1.0x), trung du (1.3x), miền núi (1.7x). Cứ mỗi 100 km quy đổi rút ngắn 1 ngày trong chu kỳ 360 ngày chuẩn.
          </p>
        </div>

        {/* Quick status counter */}
        <div className="flex items-center gap-2">
          {overdueCount > 0 ? (
            <span className="px-4 py-2.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 font-black text-sm flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
              <span>{overdueCount} xe cần xử lý bảo dưỡng</span>
            </span>
          ) : (
            <span className="px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
              <span>100% Đội xe an toàn</span>
            </span>
          )}
        </div>
      </div>

      {/* Top Formula Explain Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-slate-700 font-medium">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">Thuật Toán Đánh Giá Chu Kỳ (Truy Vấn 3)</div>
            <div className="text-slate-900 font-bold text-sm sm:text-base">
              Số ngày bị trừ = ⌊KmQuyDoi / 100⌋ • Chu kỳ thực tế = max(0, 360 - Số ngày bị trừ)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold">
            KmQuyDoi = Km(ĐB)×1.0 + Km(TD)×1.3 + Km(MN)×1.7
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('overdue')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'overdue'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Xe Quá Hạn Bảo Dưỡng</span>
          {overdueCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white text-rose-600">
              {overdueCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('safe')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'safe'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Xe Đạt Chuẩn An Toàn ({safeVehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'history'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Nhật Ký & Lịch Sử Bảo Dưỡng ({maintenanceHistory.length})</span>
        </button>
      </div>

      {/* 1. Tab Overdue Vehicles */}
      {activeSubTab === 'overdue' && (
        <div className="space-y-6">
          {overdueCount === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1.5">
                Tuyệt Vời! Không Có Xe Nào Quá Hạn Bảo Dưỡng
              </h2>
              <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto font-medium">
                Tất cả các phương tiện đều đã hoàn tất kiểm định kỹ thuật và hoạt động an toàn trong chu kỳ định mức.
              </p>
              <button
                onClick={() => setActiveSubTab('safe')}
                className="mt-5 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all cursor-pointer"
              >
                Xem danh sách xe an toàn →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {overdueVehicles.map((vehicle) => {
                const daysOverdue = Math.abs(Number(vehicle.soNgayConLai) || 0);
                const km = Number(vehicle.tongKmQuyDoi) || 0;
                const deductedDays = Number(vehicle.soNgayBiTru) || 0;

                return (
                  <div
                    key={vehicle.bienSo}
                    className="rounded-3xl border border-rose-200 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top plate and status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-sm tracking-wide shadow-xs">
                          {vehicle.bienSo}
                        </div>
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black border border-rose-300 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>QUÁ HẠN {daysOverdue} NGÀY</span>
                        </span>
                      </div>

                      {/* Vehicle details */}
                      <h2 className="text-lg font-black text-slate-900 mb-1">
                        {vehicle.tenLoaiXe || `${vehicle.hangSanXuat || ''} ${vehicle.model || ''}`}
                      </h2>
                      <p className="text-sm text-slate-500 mb-4 font-medium">
                        Hãng: <span className="font-bold text-slate-800">{vehicle.hangSanXuat || 'Thaco'}</span> • Model: <span className="font-bold text-slate-800">{vehicle.model || 'Mobihome'}</span>
                      </p>

                      {/* Technical metrics box */}
                      <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2.5 text-sm mb-5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Lần bảo dưỡng trước:</span>
                          <span className="font-bold text-slate-800">{vehicle.ngayBaoDuongGanNhat || vehicle.ngayBaoDuongCuoi}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Tổng Km quy đổi kể từ lần cuối:</span>
                          <span className="font-black text-rose-700">{km.toLocaleString('vi-VN')} km</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Số ngày bị trừ do mòn xe:</span>
                          <span className="font-bold text-slate-800">-{deductedDays} ngày</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-rose-200/60">
                          <span className="text-slate-500 font-medium">Hạn bảo dưỡng quy định:</span>
                          <span className="font-black text-rose-600">{vehicle.ngayBaoDuongTiepTheo}</span>
                        </div>
                      </div>
                    </div>

                    {/* CONFIRM MAINTENANCE ACTION BUTTON */}
                    <div>
                      <button
                        onClick={() => handleOpenConfirm(vehicle)}
                        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Xác Nhận Đã Bảo Dưỡng Xong</span>
                      </button>
                      <p className="text-xs text-center text-slate-400 mt-2 font-medium">
                        * Reset chu kỳ 360 ngày & đưa xe quay lại hoạt động
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Tab Safe Vehicles */}
      {activeSubTab === 'safe' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">
              Danh Sách {safeVehicles.length} Phương Tiện Đang Hoạt Động An Toàn
            </span>
            <span className="text-xs text-slate-500">
              Dữ liệu từ View <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-emerald-700">v_XeAnToan</code>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-4">Biển Kiểm Soát</th>
                  <th className="py-4 px-4">Hãng & Dòng Xe</th>
                  <th className="py-4 px-4">Bảo Dưỡng Gần Nhất</th>
                  <th className="py-4 px-4">Tổng Km Quy Đổi</th>
                  <th className="py-4 px-4">Số Ngày Trừ Mòn Xe</th>
                  <th className="py-4 px-4">Hạn Bảo Dưỡng Kế Tiếp</th>
                  <th className="py-4 px-4">Số Ngày Còn Lại</th>
                  <th className="py-4 px-4">Trạng Thái Kỹ Thuật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeVehicles.map((v) => {
                  const daysLeft = Number(v.soNgayConLai || 0);

                  return (
                    <tr key={v.bienSo} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm border border-slate-200 tracking-wide">
                          {v.bienSo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block text-sm sm:text-base">{v.hangSanXuat}</span>
                        <span className="text-xs text-slate-500 font-medium">{v.model}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold text-xs sm:text-sm">
                        {v.ngayBaoDuongCuoi || v.ngayBaoDuongGanNhat}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {Number(v.tongKmQuyDoi || 0).toLocaleString('vi-VN')} km
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">
                        -{v.soNgayBiTru || 0} ngày
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 text-xs sm:text-sm">
                        {v.ngayBaoDuongTiepTheo}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700">
                        +{daysLeft} ngày
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đạt Chuẩn An Toàn</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Tab Maintenance History Logs */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">
              Nhật Ký Các Đợt Bảo Dưỡng Đã Thực Hiện ({maintenanceHistory.length} đợt)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-4">Mã Đợt</th>
                  <th className="py-4 px-4">Biển Số Xe</th>
                  <th className="py-4 px-4">Dòng Xe</th>
                  <th className="py-4 px-4">Ngày Bảo Dưỡng</th>
                  <th className="py-4 px-4">Chi Phí (VNĐ)</th>
                  <th className="py-4 px-4">Nội Dung Thực Hiện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maintenanceHistory.map((item) => {
                  const plate = item.xe?.bienSo || item.bienSoXe || '29B-000.00';
                  const model = item.xe?.model || item.xe?.hangSanXuat || 'Xe khách';
                  const cost = Number(item.chiPhi || 0);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-400">
                        #{item.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-900 border border-slate-200 text-xs sm:text-sm tracking-wide">
                          {plate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-semibold">
                        {model}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold text-xs sm:text-sm">
                        {item.ngayBaoDuong}
                      </td>
                      <td className="py-3.5 px-4 font-black text-blue-700 text-sm sm:text-base">
                        {formatMoney(cost)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-[360px] font-medium leading-relaxed">
                        {item.noiDung}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Maintenance Modal */}
      {selectedVehicleToConfirm && (
        <ConfirmMaintenanceModal
          key={selectedVehicleToConfirm.bienSo}
          onClose={() => setSelectedVehicleToConfirm(null)}
          vehicle={selectedVehicleToConfirm}
          onSuccess={onConfirmSuccess}
        />
      )}

    </div>
  );
}
