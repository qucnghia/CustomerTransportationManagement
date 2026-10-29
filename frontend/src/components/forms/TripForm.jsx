import { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { api, toDateTimeInput } from '../../services/api';
import { Field, Row, ErrorBox, FormActions } from './FormParts';
import { inputClass, useSubmit } from './formUtils';
import DatePicker from '../DatePicker';

const STATUS_OPTIONS = [
  ['DaLenLich', 'Sắp khởi hành (Đã lên lịch)'],
  ['DangChay', 'Đang chạy trên tuyến'],
  ['HoanThanh', 'Hoàn thành'],
  ['Huy', 'Đã hủy']
];

export default function TripForm({ entity, routes, vehicles, drivers, onClose, onSaved }) {
  const isEdit = Boolean(entity);
  const [form, setForm] = useState(() => isEdit ? {
    maTuyen: entity.maTuyen,
    bienSoXe: entity.bienSoXe,
    maLaiXe: entity.maLaiXe,
    maPhuXe: entity.maPhuXe,
    thoiGianKhoiHanh: toDateTimeInput(entity.thoiGianKhoiHanh),
    thoiGianKetThuc: toDateTimeInput(entity.thoiGianDenDuKien),
    soKhach: entity.soKhach,
    giaVe: entity.giaVe,
    trangThai: entity.trangThai
  } : {
    maTuyen: routes[0]?.maTuyen ?? '',
    bienSoXe: vehicles[0]?.bienSo ?? '',
    maLaiXe: drivers[0]?.id ?? '',
    maPhuXe: drivers[1]?.id ?? '',
    thoiGianKhoiHanh: '',
    thoiGianKetThuc: '',
    soKhach: 0,
    giaVe: 0,
    trangThai: 'DaLenLich'
  });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const { submitting, errorMsg, run } = useSubmit(onSaved);

  const handleSubmit = run(async () => {
    if (Number(form.maLaiXe) === Number(form.maPhuXe)) {
      throw new Error('Lái xe chính và phụ xe không được trùng nhau!');
    }
    const vehicle = vehicles.find(v => v.bienSo === form.bienSoXe);
    if (vehicle && Number(form.soKhach) > vehicle.soGhe - 2) {
      throw new Error(`Số khách (${form.soKhach}) vượt quá quy định tối đa ${vehicle.soGhe - 2} người (Xe ${vehicle.soGhe} chỗ)!`);
    }
    const payload = {
      maTuyen: Number(form.maTuyen),
      bienSoXe: form.bienSoXe,
      maLaiXe: Number(form.maLaiXe),
      maPhuXe: Number(form.maPhuXe),
      thoiGianKhoiHanh: form.thoiGianKhoiHanh,
      thoiGianKetThuc: form.thoiGianKetThuc,
      soKhach: Number(form.soKhach),
      giaVe: Number(form.giaVe),
      trangThai: form.trangThai
    };
    if (isEdit) {
      await api.updateTrip(entity.maChuyen, payload);
      return `Đã cập nhật chuyến xe #${entity.maChuyen}!`;
    }
    await api.createTrip(payload);
    return `Điều phối chuyến xe ${payload.bienSoXe} thành công!`;
  });

  const driverOptions = drivers.map(d => (
    <option key={d.id} value={d.id}>TX#{d.id} - {d.hoTen} (Hạng {d.loaiBangLai})</option>
  ));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorBox message={errorMsg} />
      <Row>
        <Field label="Tuyến Đường Vận Tải *">
          <select required value={form.maTuyen} onChange={set('maTuyen')} className={inputClass}>
            <option value="">-- Chọn tuyến đường --</option>
            {routes.map(r => (
              <option key={r.maTuyen} value={r.maTuyen}>#{r.maTuyen} - {r.tenTuyen} ({r.quangDuongKm} km)</option>
            ))}
          </select>
        </Field>
        <Field label="Phương Tiện Vận Hành *">
          <select required value={form.bienSoXe} onChange={set('bienSoXe')} className={inputClass}>
            <option value="">-- Chọn phương tiện --</option>
            {vehicles.map(v => (
              <option key={v.bienSo} value={v.bienSo}>{v.bienSo} - {v.hangSanXuat} {v.model} ({v.soGhe} chỗ)</option>
            ))}
          </select>
        </Field>
      </Row>

      <Row>
        <Field label="Lái Xe Chính (Hệ số x2.0) *">
          <select required value={form.maLaiXe} onChange={set('maLaiXe')} className={inputClass}>
            <option value="">-- Chọn lái chính --</option>
            {driverOptions}
          </select>
        </Field>
        <Field label="Phụ Xe (Hệ số x1.0) *">
          <select required value={form.maPhuXe} onChange={set('maPhuXe')} className={inputClass}>
            <option value="">-- Chọn phụ xe --</option>
            {driverOptions}
          </select>
        </Field>
      </Row>

      <Row>
        <Field label="Thời Gian Khởi Hành *">
          <DatePicker withTime required value={form.thoiGianKhoiHanh}
            onChange={(v) => setForm({ ...form, thoiGianKhoiHanh: v })} className={inputClass} />
        </Field>
        <Field label="Thời Gian Đến Dự Kiến *">
          <DatePicker withTime required value={form.thoiGianKetThuc} defaultTime="12:00"
            min={form.thoiGianKhoiHanh.slice(0, 10) || undefined}
            onChange={(v) => setForm({ ...form, thoiGianKetThuc: v })} className={inputClass} />
        </Field>
      </Row>

      <Row cols={3}>
        <Field label="Số Khách Đặt Trước">
          <input type="number" min="0" required value={form.soKhach} onChange={set('soKhach')} className={inputClass} />
        </Field>
        <Field label="Giá Vé (VNĐ) *">
          <input type="number" step="1000" min="0" required value={form.giaVe} onChange={set('giaVe')} className={inputClass} />
        </Field>
        <Field label="Trạng Thái Chuyến">
          <select value={form.trangThai} onChange={set('trangThai')} className={inputClass}>
            {STATUS_OPTIONS.map(([value, label], i) => (
              // Khi sửa: không cho lùi về trạng thái trước trạng thái hiện tại
              <option key={value} value={value} disabled={isEdit && i < STATUS_OPTIONS.findIndex(([v]) => v === entity.trangThai)}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </Row>

      <FormActions onClose={onClose} submitting={submitting} icon={CalendarPlus}
        label={isEdit ? 'Lưu Thay Đổi' : 'Xác Nhận Lập Chuyến'} />
    </form>
  );
}
