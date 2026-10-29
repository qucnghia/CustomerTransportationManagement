import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

// Popup xác nhận thao tác không hoàn tác được (hủy chuyến, xóa...).
// onConfirm là hàm async: lỗi được hiện ngay trong popup, thành công thì tự đóng.
export default function ConfirmDialog({ title, message, details = [], confirmLabel = 'Xác nhận', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const cancelRef = useRef(null);

  useEffect(() => {
    // Mặc định focus nút "Quay lại" để lỡ nhấn Enter cũng không thực hiện thao tác
    cancelRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && !busy && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 shrink-0 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </span>
          <div className="min-w-0">
            <h3 id="confirm-title" className="text-lg font-black text-slate-900">{title}</h3>
            <p id="confirm-message" className="mt-1 text-sm text-slate-600 font-medium">{message}</p>
          </div>
        </div>

        {details.length > 0 && (
          <ul className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-sm">
            {details.map(([label, value]) => (
              <li key={label} className="flex justify-between gap-4">
                <span className="text-slate-500">{label}</span>
                <span className="font-bold text-slate-900 text-right">{value}</span>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p role="alert" className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-700">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 text-sm cursor-pointer disabled:opacity-50"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-500/20 cursor-pointer flex items-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
