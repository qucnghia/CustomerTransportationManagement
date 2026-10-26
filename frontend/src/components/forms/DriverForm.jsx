import { useState } from 'react';
import { User } from 'lucide-react';
import { api, ddMmYyyyToIso, isoToDdMmYyyy } from '../../services/api';
import { Field, Row, ErrorBox, FormActions } from './FormParts';
import { inputClass, useSubmit } from './formUtils';
import DatePicker from '../DatePicker';

export default function DriverForm({ entity, onClose, onSaved }) {
  const isEdit = Boolean(entity);
  const [form, setForm] = useState(() => isEdit ? {
    hoTen: entity.hoTen,
    cccd: entity.cccd,
    maSoBangLai: entity.maSoBangLai,
    loaiBangLai: entity.loaiBangLai,
    diaChi: entity.diaChi ?? '',
    ngaySinh: ddMmYyyyToIso(entity.ngaySinh),
    thamNien: entity.thamNien
  } : {
    hoTen: '',
    cccd: '',
    maSoBangLai: '',
    loaiBangLai: 'E',
    diaChi: '',
    ngaySinh: '',
    thamNien: 0
  });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const { submitting, errorMsg, run } = useSubmit(onSaved);

  const handleSubmit = run(async () => {
    const payload = {
      hoTen: form.hoTen.trim(),
      cccd: form.cccd.trim(),
      maSoBangLai: form.maSoBangLai.trim(),
      loaiBangLai: form.loaiBangLai,
      diaChi: form.diaChi.trim(),
      ngaySinh: isoToDdMmYyyy(form.ngaySinh),
      thamNien: Number(form.thamNien)
    };
    if (isEdit) {
      await api.updateDriver(entity.id, payload);
      return `Đã cập nhật hồ sơ tài xế ${payload.hoTen}!`;
    }
    await api.createDriver(payload);
    return `Đã thêm thành công tài xế ${payload.hoTen} (Hạng ${payload.loaiBangLai})!`;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorBox message={errorMsg} />
      <Row>
        <Field label="Họ Và Tên Tài Xế *">
          <input type="text" required placeholder="Ví dụ: Hoàng Đình Trí" value={form.hoTen} onChange={set('hoTen')} className={inputClass} />
        </Field>
        <Field label="Loại Bằng Lái Chuẩn *">
          <select value={form.loaiBangLai} onChange={set('loaiBangLai')} className={inputClass}>
            <option value="D">Hạng D (Khách 16-30 chỗ)</option>
            <option value="E">Hạng E (Khách trên 30 chỗ, giường nằm)</option>
            <option value="FC">Hạng FC (Đầu kéo, xe chuyên dụng)</option>
            <option value="FD">Hạng FD</option>
          </select>
        </Field>
      </Row>

      <Row>
        <Field label="Số Căn Cước Công Dân (12 số) *">
          <input type="text" required pattern="\d{12}" maxLength="12" title="CCCD gồm đúng 12 chữ số"
            placeholder="001099888777" value={form.cccd} onChange={set('cccd')} className={inputClass} />
        </Field>
        <Field label="Mã Số Bằng Lái *">
          <input type="text" required placeholder="GPLX-987654321099" value={form.maSoBangLai} onChange={set('maSoBangLai')} className={inputClass} />
        </Field>
      </Row>

      <Row cols={3}>
        <Field label="Địa Chỉ Thường Trú *" className="sm:col-span-2">
          <input type="text" required placeholder="Quận Cầu Giấy, Hà Nội..." value={form.diaChi} onChange={set('diaChi')} className={inputClass} />
        </Field>
        <Field label="Thâm Niên (Năm)">
          <input type="number" min="0" required value={form.thamNien} onChange={set('thamNien')} className={inputClass} />
        </Field>
      </Row>

      <Field label="Ngày Sinh *">
        <DatePicker required value={form.ngaySinh} onChange={(v) => setForm({ ...form, ngaySinh: v })}
          max={new Date().toLocaleDateString('sv-SE')} maxYear={new Date().getFullYear()} className={inputClass} />
      </Field>

      <FormActions onClose={onClose} submitting={submitting} icon={User}
        label={isEdit ? 'Lưu Thay Đổi' : 'Lưu Hồ Sơ Tài Xế'} />
    </form>
  );
}
