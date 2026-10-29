import { ChevronLeft, ChevronRight } from 'lucide-react';

const navBtn = 'w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors';

// Thanh phân trang dùng chung; nhận nguyên kết quả của usePagination
export default function Pagination({ pager, unit = 'mục', label = 'Phân trang', className = '' }) {
  const { page, pageCount, firstIndex, total, pageItems } = pager;
  if (total === 0) return null;

  // Thanh phân trang luôn đặt ngay sau danh sách: đổi trang thì cuộn lên đầu danh sách đó
  const goToPage = (p, e) => {
    pager.goToPage(p);
    e.currentTarget.closest('nav').previousElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav aria-label={label} className={`${className} flex flex-col sm:flex-row items-center justify-between gap-3`}>
      <span className="text-sm font-medium text-slate-500">
        Hiển thị <strong className="text-slate-900">{firstIndex + 1}–{firstIndex + pageItems.length}</strong> / {total} {unit}
      </span>
      {pageCount > 1 && (
        <div className="flex items-center gap-1.5">
          <button onClick={(e) => goToPage(page - 1, e)} disabled={page === 1} aria-label="Trang trước" className={navBtn}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          {/* shortcut: hiện mọi số trang, ổn tới ~15 trang; nhiều hơn thì thu gọn thành "1 … 4 5 6 … 20" */}
          {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={(e) => goToPage(p, e)}
              aria-current={p === page ? 'page' : undefined}
              className={`min-w-9 h-9 px-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                p === page
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
          <button onClick={(e) => goToPage(page + 1, e)} disabled={page === pageCount} aria-label="Trang sau" className={navBtn}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
