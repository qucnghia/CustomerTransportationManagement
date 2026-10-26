import { useState } from 'react';

export const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white';

// Trạng thái gửi form dùng chung: chạy action, báo lỗi từ backend, gọi onSaved khi thành công
export function useSubmit(onSaved) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const run = (action) => async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      onSaved(await action());
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, errorMsg, run };
}
