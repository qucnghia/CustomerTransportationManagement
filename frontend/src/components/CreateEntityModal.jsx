import { useState } from 'react';
import { X, Bus, User, Map as MapIcon, CalendarPlus, CheckCircle2, Plus, Pencil } from 'lucide-react';
import confetti from 'canvas-confetti';
import TripForm from './forms/TripForm';
import VehicleForm from './forms/VehicleForm';
import DriverForm from './forms/DriverForm';
import RouteForm from './forms/RouteForm';

const TABS = [
  { id: 'trip', label: 'Điều Phối Chuyến Xe', editLabel: 'Sửa Chuyến Xe', icon: CalendarPlus, Form: TripForm },
  { id: 'vehicle', label: 'Thêm Xe Mới', editLabel: 'Sửa Phương Tiện', icon: Bus, Form: VehicleForm },
  { id: 'driver', label: 'Thêm Tài Xế', editLabel: 'Sửa Hồ Sơ Tài Xế', icon: User, Form: DriverForm },
  { id: 'route', label: 'Thêm Tuyến Xe', editLabel: 'Sửa Tuyến Đường', icon: MapIcon, Form: RouteForm }
];

// Chỉ được render khi đang mở (App gắn key mới mỗi lần mở) nên state luôn khởi tạo lại từ props
export default function CreateEntityModal({
  onClose,
  initialTab = 'trip',
  editEntity = null,
  routes = [],
  vehicles = [],
  drivers = [],
  onSaved
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [successMsg, setSuccessMsg] = useState('');
  const isEdit = Boolean(editEntity);
  const tab = TABS.find(t => t.id === activeTab);
  const { Form } = tab;

  const handleSaved = (msg) => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setSuccessMsg(msg);
    onSaved?.();
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-white relative sticky top-0 z-10">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-200 mb-1">
            {isEdit ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>Hệ Thống Quản Lý Xe Khách</span>
          </div>

          <h3 className="text-2xl font-black">{isEdit ? tab.editLabel : 'Thêm Dữ Liệu Nghiệp Vụ'}</h3>
          <p className="text-xs text-blue-100 mt-1">Cập nhật phương tiện, nhân sự tài xế, lộ trình tuyến và điều phối chuyến xe</p>
        </div>

        {/* Tab Selection Bar (ẩn khi đang sửa một bản ghi cụ thể) */}
        {!isEdit && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="p-6 space-y-5">
          {successMsg ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          ) : (
            <Form
              key={activeTab}
              entity={editEntity}
              routes={routes}
              vehicles={vehicles}
              drivers={drivers}
              onClose={onClose}
              onSaved={handleSaved}
            />
          )}
        </div>
      </div>
    </div>
  );
}
