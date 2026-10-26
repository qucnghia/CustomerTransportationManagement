import { AlertTriangle, Loader2 } from 'lucide-react';

export function Field({ label, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">{label}</span>
      {children}
    </label>
  );
}

export function Row({ cols = 2, children }) {
  const grid = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' }[cols];
  return <div className={`grid grid-cols-1 ${grid} gap-4`}>{children}</div>;
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5" role="alert">
      <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
      <span>{message}</span>
    </div>
  );
}

export function FormActions({ onClose, submitting, icon: Icon, label }) {
  return (
    <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 text-sm transition-colors cursor-pointer"
      >
        Hủy
      </button>
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
        <span>{label}</span>
      </button>
    </div>
  );
}
