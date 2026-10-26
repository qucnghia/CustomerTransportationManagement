import { Bus, Bell, Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function AdminNavbar({ 
  onToggleSidebar,
  overdueCount = 0,
  onNavigateTab
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Menu Toggle Button & Brand */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Dedicated Menu Toggle Button to open the blurred drawer */}
            <button
              onClick={onToggleSidebar}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md shadow-slate-900/10 active:scale-95 transition-all cursor-pointer group"
              title="Mở danh mục quản trị"
            >
              <Menu className="w-4.5 h-4.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Danh Mục</span>
            </button>

            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 tracking-tight text-lg sm:text-xl">
                    TRANS-OPS
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wider">
                    Admin
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right: Urgent Alerts if any */}
          <div className="flex items-center gap-3">
            {overdueCount > 0 && (
              <button
                onClick={() => onNavigateTab && onNavigateTab('maintenance')}
                className="relative p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-2 cursor-pointer text-xs font-bold"
                title={`${overdueCount} xe quá hạn bảo dưỡng`}
              >
                <Bell className="w-4 h-4 text-rose-600 animate-bounce" />
                <span className="hidden sm:inline">{overdueCount} Xe Quá Hạn</span>
                <span className="w-2 h-2 rounded-full bg-rose-600 sm:hidden" />
              </button>
            )}
            <ThemeToggle />
          </div>

        </div>
      </div>
    </header>
  );
}
