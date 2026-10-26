import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

// Class "dark" trên <html> được đặt sẵn bởi script trong index.html (tránh nháy trắng khi tải trang)
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // Trình duyệt chặn localStorage: vẫn đổi được giao diện, chỉ không nhớ lựa chọn
    }
    setIsDark(next);
  };

  const label = isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';
  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      aria-pressed={isDark}
      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
