// Kiểm tra nhanh: node src/components/revenueBuckets.test.mjs
import assert from 'node:assert/strict';
import { bucketRevenue } from './revenueBuckets.js';

const trips = [
  { thoiGianKhoiHanh: '2026-09-30 22:00:00', soKhach: 10, giaVe: 100, trangThai: 'HoanThanh' }, // ngoài khoảng
  { thoiGianKhoiHanh: '2026-10-01 07:00:00', soKhach: 2, giaVe: 100, trangThai: 'HoanThanh' },  // Thứ Năm
  { thoiGianKhoiHanh: '2026-10-05 07:00:00', soKhach: 3, giaVe: 100, trangThai: 'DaLenLich' },  // Thứ Hai
  { thoiGianKhoiHanh: '2026-10-05 09:00:00', soKhach: 9, giaVe: 100, trangThai: 'Huy' },        // bị hủy
  { thoiGianKhoiHanh: '2026-11-02 07:00:00', soKhach: 1, giaVe: 100, trangThai: 'DangChay' }
];

const days = bucketRevenue(trips, '2026-10-01', '2026-11-02', 'day');
assert.equal(days.length, 33);
assert.equal(days[0].revenue, 200);
assert.equal(days.find(b => b.key === '2026-10-05').revenue, 300);
assert.equal(days.reduce((s, b) => s + b.revenue, 0), 600);

const weeks = bucketRevenue(trips, '2026-10-01', '2026-11-02', 'week');
assert.equal(weeks[0].key, '2026-09-28');           // tuần chứa 01/10 bắt đầu Thứ Hai 28/09
assert.equal(weeks[0].revenue, 200);                // chuyến 30/09 nằm ngoài khoảng nên không tính
assert.equal(weeks[1].key, '2026-10-05');
assert.equal(weeks.at(-1).key, '2026-11-02');

const months = bucketRevenue(trips, '2026-10-01', '2026-11-02', 'month');
assert.deepEqual(months.map(m => [m.label, m.revenue, m.trips]), [['T10/2026', 500, 2], ['T11/2026', 100, 1]]);
console.log('revenueBuckets: OK');
