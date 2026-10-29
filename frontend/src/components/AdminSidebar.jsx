import { useEffect } from 'react';
import { 
  LayoutDashboard, CalendarRange, Bus, MapPin, 
  Users, Wrench, BarChart3, X 
} from 'lucide-react';

export default function AdminSidebar({ 
  isOpen,
  onClose,
  activeTab, 
  onSelectTab, 
  overdueCount = 0,
  tripsCount = 0,
  vehiclesCount = 0
}) {
  // Close drawer on Escape key & disable background scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng Quan',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Chỉ số & Cảnh báo'
    },
    {
      id: 'trips',
      label: 'Quản Lý Chuyến Xe',
      icon: CalendarRange,
      badge: tripsCount > 0 ? tripsCount : null,
      desc: 'Lập & điều phối chuyến'
    },
    {
      id: 'vehicles',
      label: 'Quản Lý Đội Xe',
      icon: Bus,
      badge: vehiclesCount > 0 ? vehiclesCount : null,
      desc: 'Hồ sơ phương tiện'
    },
    {
      id: 'routes',
      label: 'Quản Lý Tuyến Đường',
      icon: MapPin,
      badge: null,
      desc: 'Mạng lưới vận tải'
    },
    {
      id: 'drivers',
      label: 'Quản Lý Tài Xế',
      icon: Users,
      badge: null,
      desc: 'Lái chính, phụ xe & lương'
    },
    {
      id: 'maintenance',
      label: 'Quản Lý Bảo Dưỡng',
      icon: Wrench,
      badge: overdueCount > 0 ? `${overdueCount} quá hạn` : 'An toàn',
      badgeColor: overdueCount > 0 ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-emerald-400',
      desc: 'Theo dõi chu kỳ & duyệt xong'
    },
    {
      id: 'reports',
      label: 'Báo Cáo & Doanh Thu',
      icon: BarChart3,
      badge: null,
      desc: 'Thống kê theo xe & lương'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      
      {/* 1. Backdrop Blur Overlay (Làm mờ phần phía sau) */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Slide-in Dark Drawer Sidebar */}
      <aside 
        className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-slate-950 text-white shadow-2xl border-r border-slate-800/80 z-50 flex flex-col justify-between p-5 animate-in slide-in-from-left duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div>
          
          {/* Drawer Header with Title & Close Button */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                PHÂN HỆ QUẢN TRỊ
              </span>
              <span className="text-sm text-slate-400 font-medium">
                Chọn danh mục điều hành
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-800"
              title="Đóng menu (Esc)"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-2.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-bold transition-all cursor-pointer text-left group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`} />
                    <div>
                      <span className="block leading-tight text-sm sm:text-base font-bold">
                        {item.label}
                      </span>
                      <span className={`text-xs font-normal mt-0.5 block ${
                        isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'
                      }`}>
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-black shrink-0 ${
                        isActive 
                          ? 'bg-blue-700/90 text-white' 
                          : (item.badgeColor || 'bg-slate-800 text-slate-300')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Drawer Footer Status */}
        <div className="pt-4 border-t border-slate-800/80 mt-4 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-400">Quản lý xe khách · 2026</span>
          </div>
          <span className="text-[11px] text-slate-600">Bấm ngoài để đóng</span>
        </div>

      </aside>

    </div>
  );
}
