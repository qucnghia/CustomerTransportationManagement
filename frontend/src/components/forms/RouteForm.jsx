import { useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { api } from '../../services/api';
import { Field, Row, ErrorBox, FormActions } from './FormParts';
import { inputClass, useSubmit } from './formUtils';

export default function RouteForm({ entity, onClose, onSaved }) {
  const isEdit = Boolean(entity);
  const [form, setForm] = useState(() => isEdit ? {
    diemDau: entity.diemDau,
    diemCuoi: entity.diemCuoi,
    doDaiKm: entity.quangDuongKm,
    doPhucTap: entity.doPhucTap
  } : {
    diemDau: '',
    diemCuoi: '',
    doDaiKm: '',
    doPhucTap: 1
  });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const { submitting, errorMsg, run } = useSubmit(onSaved);

  const handleSubmit = run(async () => {
    const payload = {
      diemDau: form.diemDau.trim(),
      diemCuoi: form.diemCuoi.trim(),
      doDaiKm: Number(form.doDaiKm),
      doPhucTap: Number(form.doPhucTap)
    };
    if (isEdit) {
      await api.updateRoute(entity.maTuyen, payload);
      return `Đã cập nhật tuyến #${entity.maTuyen}!`;
    }
    await api.createRoute(payload);
    return `Đã thêm tuyến đường ${payload.diemDau} - ${payload.diemCuoi}!`;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorBox message={errorMsg} />
      <Row>
        <Field label="Bến / Điểm Khởi Hành *">
          <input type="text" required placeholder="Ví dụ: Hà Nội (Bến Mỹ Đình)" value={form.diemDau} onChange={set('diemDau')} className={inputClass} />
        </Field>
        <Field label="Bến / Điểm Kết Thúc Đến *">
          <input type="text" required placeholder="Ví dụ: Lạng Sơn (Bến Đồng Đăng)" value={form.diemCuoi} onChange={set('diemCuoi')} className={inputClass} />
        </Field>
      </Row>

      <Row>
        <Field label="Cự Ly Tuyến (km) *">
          <input type="number" step="0.5" min="1" required value={form.doDaiKm} onChange={set('doDaiKm')} className={inputClass} />
        </Field>
        <Field label="Độ Phức Tạp Địa Hình *">
          <select value={form.doPhucTap} onChange={set('doPhucTap')} className={inputClass}>
            <option value="1">Cấp 1 - Đồng bằng / Cao tốc (Hệ số 1.0)</option>
            <option value="2">Cấp 2 - Trung du / Đồi dốc nhẹ (Hệ số 1.3)</option>
            <option value="3">Cấp 3 - Đèo núi hiểm trở (Hệ số 1.7)</option>
          </select>
        </Field>
      </Row>

      <FormActions onClose={onClose} submitting={submitting} icon={MapIcon}
        label={isEdit ? 'Lưu Thay Đổi' : 'Lưu Tuyến Đường'} />
    </form>
  );
}
