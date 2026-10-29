const pad = (n) => String(n).padStart(2, '0');
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const ddmm = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

// Mốc đầu kỳ chứa ngày d: chính ngày đó / thứ Hai của tuần / ngày 1 của tháng
const bucketStart = (d, group) => {
  if (group === 'week') return new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  if (group === 'month') return new Date(d.getFullYear(), d.getMonth(), 1);
  return d;
};
const nextBucket = (d, group) => (group === 'month'
  ? new Date(d.getFullYear(), d.getMonth() + 1, 1)
  : new Date(d.getFullYear(), d.getMonth(), d.getDate() + (group === 'week' ? 7 : 1)));
const bucketLabel = (d, group) => (group === 'month' ? `T${d.getMonth() + 1}/${d.getFullYear()}`
  : group === 'week' ? `Tuần ${ddmm(d)}` : ddmm(d));

// Gom doanh thu (số khách × giá vé, chuyến không hủy - cùng quy tắc sp_BaoCaoDoanhThuTheoXe) theo kỳ;
// kỳ không có chuyến vẫn hiện cột 0 để trục thời gian liên tục.
export function bucketRevenue(trips, tuNgay, denNgay, group) {
  const buckets = new Map();
  for (let d = bucketStart(parse(tuNgay), group); isoOf(d) <= denNgay; d = nextBucket(d, group)) {
    buckets.set(isoOf(d), { key: isoOf(d), label: bucketLabel(d, group), revenue: 0, trips: 0 });
  }
  for (const t of trips) {
    const day = String(t.thoiGianKhoiHanh).slice(0, 10);
    if (t.trangThai === 'Huy' || day < tuNgay || day > denNgay) continue;
    const b = buckets.get(isoOf(bucketStart(parse(day), group)));
    b.revenue += t.soKhach * t.giaVe;
    b.trips += 1;
  }
  return [...buckets.values()];
}
