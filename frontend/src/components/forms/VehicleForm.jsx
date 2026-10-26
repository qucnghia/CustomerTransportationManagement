import { useState } from 'react';
import { Bus } from 'lucide-react';
import { api, ddMmYyyyToIso, isoToDdMmYyyy } from '../../services/api';
import { Field, Row, ErrorBox, FormActions } from './FormParts';
import { inputClass, useSubmit } from './formUtils';
import DatePicker from '../DatePicker';

const BRANDS = ['Thaco', 'Hyundai', 'Tracomeco', 'Ford', 'Samco'];

export default function VehicleForm({ entity, onClose, onSaved }) {
  const isEdit = Boolean(entity);
  const [form, setForm] = useState(() => isEdit ? {
    bienSo: entity.bienSo,
    hangSanXuat: entity.hangSanXuat,
    model: entity.model,
    mauxe: entity.mauxe,
    doiXe: entity.doiXe,
    soGhe: entity.soGhe,
    soNamSuDung: entity.soNamSuDung,
    ngayBaoDuong: ddMmYyyyToIso(entity.ngayBaoDuongCuoi)
  } : {
    bienSo: '',
    hangSanXuat: 'Thaco',
    model: '',
    mauxe: '',
    doiXe: new Date().getFullYear(),
    soGhe: 34,
    soNamSuDung: 0,
    ngayBaoDuong: ''
  });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const { submitting, errorMsg, run } = useSubmit(onSaved);

  const handleSubmit = run(async () => {
    const payload = {
      bienSo: form.bienSo.trim().toUpperCase(),
      hangSanXuat: form.hangSanXuat,
      model: form.model.trim(),
      mauxe: form.mauxe.trim(),
      doiXe: Number(form.doiXe),
      soGhe: Number(form.soGhe),
      soNamSuDung: Number(form.soNamSuDung),
      // Bỏ trống: xe mới lấy ngày hôm nay, xe đang sửa giữ nguyên ngày cũ (backend xử lý)
      ngayBaoDuongCuoi: isoToDdMmYyyy(form.ngayBaoDuong)
    };
    if (isEdit) {
      await api.updateVehicle(entity.bienSo, payload);
      return `Đã cập nhật phương tiện ${entity.bienSo}!`;
    }
    await api.createVehicle(payload);
    return `Đã thêm thành công phương tiện ${payload.bienSo}!`;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorBox message={errorMsg} />
      <Row>
        <Field label="Biển Số Xe (ID) *">
          <input type="text" required disabled={isEdit} placeholder="Ví dụ: 29B-888.99"
            value={form.bienSo} onChange={set('bienSo')} className={`${inputClass} uppercase disabled:bg-slate-100`} />
        </Field>
        <Field label="Hãng Sản Xuất *">
          <select value={form.hangSanXuat} onChange={set('hangSanXuat')} className={inputClass}>
            {[...new Set([...BRANDS, form.hangSanXuat])].map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
      </Row>

      <Row>
        <Field label="Model Dòng Xe *">
          <input type="text" required placeholder="Mobihome TB120, Universe, Solati VIP..."
            value={form.model} onChange={set('model')} className={inputClass} />
        </Field>
        <Field label="Màu Sơn Xe *">
          <input type="text" required placeholder="Trắng, Đỏ mận, Xanh dương, Bạc..."
            value={form.mauxe} onChange={set('mauxe')} className={inputClass} />
        </Field>
      </Row>

      <Row cols={4}>
        <Field label="Đời Xe (Năm)">
          <input type="number" min="1990" required value={form.doiXe} onChange={set('doiXe')} className={inputClass} />
        </Field>
        <Field label="Số Chỗ Ngồi (≥16)">
          <input type="number" min="16" required value={form.soGhe} onChange={set('soGhe')} className={inputClass} />
        </Field>
        <Field label="Số Năm Sử Dụng">
          <input type="number" min="0" required value={form.soNamSuDung} onChange={set('soNamSuDung')} className={inputClass} />
        </Field>
        <Field label="Bảo Dưỡng Cuối">
          <DatePicker value={form.ngayBaoDuong} onChange={(v) => setForm({ ...form, ngayBaoDuong: v })}
            max={new Date().toLocaleDateString('sv-SE')} minYear={1990} className={inputClass} />
        </Field>
      </Row>

      <FormActions onClose={onClose} submitting={submitting} icon={Bus}
        label={isEdit ? 'Lưu Thay Đổi' : 'Lưu Phương Tiện'} />
    </form>
  );
}
