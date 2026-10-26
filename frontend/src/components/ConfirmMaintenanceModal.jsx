import { useState } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, ShieldCheck, 
  Calendar, DollarSign, FileText, Loader2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import DatePicker from './DatePicker';

// Chỉ được render khi đang mở (key theo biển số) nên state luôn khởi tạo lại cho từng xe
export default function ConfirmMaintenanceModal({
  onClose,
  vehicle,
  onSuccess
}) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const todayStr = new Date().toLocaleDateString('sv-SE'); // yyyy-MM-dd theo giờ máy
  const [ngayBaoDuong, setNgayBaoDuong] = useState(todayStr);
  const [chiPhi, setChiPhi] = useState('');
  const [noiDung, setNoiDung] = useState('Bảo dưỡng định kỳ cấp xưởng: Thay dầu nhớt, kiểm tra má phanh, bảo đảm kỹ thuật an toàn vận hành');
  const [isVerified, setIsVerified] = useState(true);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isVerified) {
      setErrorMsg('Vui lòng tích xác nhận xe đã hoàn thành kiểm định kỹ thuật!');
      return;
    }

    if (!ngayBaoDuong) {
      setErrorMsg('Vui lòng chọn ngày hoàn tất bảo dưỡng!');
      return;
    }

    setSubmitting(true);
    try {
      await api.confirmMaintenance({
        bienSoXe: vehicle.bienSo,
        ngayBaoDuong,
        chiPhi: Number(chiPhi || 0),
        noiDung
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onSuccess) {
        onSuccess(vehicle.bienSo);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi xác nhận hoàn tất bảo dưỡng');
    } finally {
      setSubmitting(false);
    }
  };

  const quickPresets = [
    'Bảo dưỡng định kỳ: Thay dầu máy, lọc dầu nhớt, kiểm tra má phanh',
    'Thay thế lốp xe sau, cân chỉnh thước lái, kiểm định an toàn',
    'Bảo dưỡng toàn diện hệ thống điều hòa, điện và làm mát',
    'Đại tu hệ thống côn, số và đăng kiểm lại phương tiện'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Xác Nhận Hoàn Tất Bảo Dưỡng</h3>
              <p className="text-xs text-emerald-100 font-medium">
                Cập nhật chu kỳ và đưa phương tiện quay lại làm việc bình thường
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vehicle Badge Info */}
        <div className="px-6 py-4 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="px-3.5 py-2 bg-white border border-emerald-300 rounded-xl shadow-xs">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Biển Số</span>
              <span className="font-black text-slate-900 text-lg tracking-wide">{vehicle.bienSo}</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{vehicle.tenLoaiXe || `${vehicle.hangSanXuat || ''} ${vehicle.model || ''}`}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Lần bảo dưỡng trước: <span className="font-bold text-slate-700">{vehicle.ngayBaoDuongGanNhat || vehicle.ngayBaoDuongCuoi || 'Chưa rõ'}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Quá hạn: {Math.abs(Number(vehicle.soNgayConLai) || 0)} ngày</span>
            </span>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Ngày hoàn tất */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Ngày Hoàn Tất Bảo Dưỡng</span>
            </label>
            <DatePicker
              required
              value={ngayBaoDuong}
              onChange={setNgayBaoDuong}
              max={todayStr}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:border-emerald-500 focus:bg-white transition-all"
            />
            <p className="text-xs text-slate-500 mt-1 font-medium">
              * Mặc định là ngày hôm nay. Ngày này sẽ được đặt làm mốc chu kỳ bảo dưỡng mới (360 ngày).
            </p>
          </div>

          {/* Chi phí */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Chi Phí Bảo Dưỡng / Sửa Chữa (VNĐ)</span>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              required
              value={chiPhi}
              onChange={(e) => setChiPhi(e.target.value)}
              placeholder="1500000"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all tracking-wide"
            />
          </div>

          {/* Nội dung công việc */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nội Dung / Nhật Ký Kỹ Thuật</span>
            </label>
            <textarea
              rows={3}
              required
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              placeholder="Nhập chi tiết hạng mục sửa chữa, thay thế linh kiện..."
            />
            
            {/* Quick Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickPresets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setNoiDung(preset)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-[11px] text-slate-600 rounded-lg border border-slate-200 transition-all text-left cursor-pointer"
                >
                  {preset.slice(0, 32)}...
                </button>
              ))}
            </div>
          </div>

          {/* Verification Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-all">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-xs text-emerald-900 leading-snug font-medium">
                <strong>Xác nhận đủ điều kiện an toàn:</strong> Xe đã được kiểm tra kỹ thuật đạt chuẩn, sẵn sàng đưa vào điều phối chuyến xe bình thường.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận & Đưa Xe Trở Lại Hoạt Động</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
