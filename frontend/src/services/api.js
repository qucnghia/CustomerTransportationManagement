// API Service connecting to Spring Boot backend (proxied by Vite: /api -> http://localhost:8080)
// Mọi lỗi đều được ném ra để giao diện báo cho người dùng, không thay bằng dữ liệu giả.

const STATUS_LABELS = {
  DaLenLich: 'Sắp khởi hành',
  DangChay: 'Đang chạy',
  HoanThanh: 'Hoàn thành',
  Huy: 'Đã hủy'
};

export const MISSING = '—';

// "2026-10-06 21:30:00" -> "2026-10-06T21:30" (giá trị cho input datetime-local)
export const toDateTimeInput = (s) => (s ? String(s).replace(' ', 'T').slice(0, 16) : '');

// "dd/MM/yyyy" <-> "yyyy-MM-dd" (backend dùng dd/MM/yyyy cho ngày sinh & ngày bảo dưỡng của xe)
export const ddMmYyyyToIso = (s) => {
  const p = String(s || '').split('/');
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : '';
};
export const isoToDdMmYyyy = (s) => {
  const p = String(s || '').split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : null;
};

const today = () => new Date();
const pad = (n) => String(n).padStart(2, '0');
export const currentMonthRange = () => {
  const d = today();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const ym = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  return { tuNgay: `${ym}-01`, denNgay: `${ym}-${pad(last)}`, nam: d.getFullYear(), thang: d.getMonth() + 1 };
};

// Data Normalizers: chuyển DTO backend sang dạng giao diện dùng, thiếu dữ liệu thì hiển thị "—"
export function normalizeTrip(trip) {
  return {
    maChuyen: trip.maChuyen,
    maTuyen: trip.maTuyen,
    maLaiXe: trip.maLaiXe,
    maPhuXe: trip.maPhuXe,
    trangThai: trip.trangThai,
    tenTuyen: trip.tuyenDuong ?? MISSING,
    bienSoXe: trip.bienSoXe ?? MISSING,
    tenLoaiXe: trip.dongXe ?? MISSING,
    soGhe: Number(trip.soKhachToiDaQuyDinh ?? 0),
    thoiGianKhoiHanh: trip.thoiGianKhoiHanh ?? MISSING,
    thoiGianDenDuKien: trip.thoiGianKetThuc ?? MISSING,
    giaVe: Number(trip.giaVe ?? 0),
    soKhach: Number(trip.soKhach ?? 0),
    tenTaiXeChinh: trip.tenLaiXe ?? MISSING,
    tenTaiXePhu: trip.tenPhuXe ?? MISSING,
    trangThaiChuyen: STATUS_LABELS[trip.trangThai] ?? trip.trangThai ?? MISSING
  };
}

export function normalizeRoute(route) {
  return {
    maTuyen: route.id,
    tenTuyen: `${route.diemDau} - ${route.diemCuoi}`,
    diemDau: route.diemDau,
    diemCuoi: route.diemCuoi,
    quangDuongKm: Number(route.doDaiKm ?? 0),
    doPhucTap: Number(route.doPhucTap ?? 1)
  };
}

export function normalizeMaintenance(item) {
  const daysRemaining = Number(item.soNgayConLai ?? 0);
  const quaHan = item.trangThaiBaoDuong === 'QUA_HAN';
  return {
    ...item,
    tenLoaiXe: `${item.hangSanXuat ?? ''} ${item.model ?? ''}`.trim() || MISSING,
    ngayBaoDuongGanNhat: item.ngayBaoDuongCuoi ?? MISSING,
    ngayBaoDuongTiepTheo: item.ngayBaoDuongTiepTheo ?? MISSING,
    soNgayConLai: daysRemaining,
    tongKmQuyDoi: Number(item.tongKmQuyDoi ?? 0),
    soNgayBiTru: Number(item.soNgayBiTru ?? 0),
    trangThai: quaHan ? `QUÁ HẠN ${Math.abs(daysRemaining)} NGÀY!` : 'Bình thường'
  };
}

export function normalizeRevenue(rev) {
  return {
    bienSo: rev.bienSo,
    tenLoaiXe: `${rev.hangSanXuat ?? ''} ${rev.model ?? ''}`.trim() || MISSING,
    soChuyenThucHien: Number(rev.tongSoChuyen ?? 0),
    tongSoKhach: Number(rev.tongSoKhach ?? 0),
    tongDoanhThu: Number(rev.tongDoanhThu ?? 0)
  };
}

export function normalizeSalary(sal) {
  return {
    maTaiXe: sal.maTaiXe,
    hoTen: sal.hoTen ?? MISSING,
    loaiBangLai: sal.loaiBangLai ?? MISSING,
    soChuyenLaiChinh: Number(sal.soChuyenLaiChinh ?? 0),
    soChuyenPhuXe: Number(sal.soChuyenPhuXe ?? 0),
    tongLuongThang: Number(sal.tongLuongThang ?? 0)
  };
}

// Gọi API, trả về json.data; lỗi mạng / HTTP / status=false đều ném Error kèm thông điệp từ backend
async function request(url, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('Không kết nối được tới máy chủ backend (http://localhost:8080)!');
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.status === false) {
    throw new Error(json?.message || `Máy chủ trả về lỗi HTTP ${res.status}`);
  }
  return json.data;
}

const list = (url, normalizer) => request(url).then(data => (normalizer ? data.map(normalizer) : data));

export const api = {
  getTrips: () => list('/api/trips', normalizeTrip),
  getRoutes: () => list('/api/routes', normalizeRoute),
  getOverdueMaintenances: () => list('/api/maintenances/overdue', normalizeMaintenance),
  getSafeMaintenances: () => list('/api/maintenances/safe', normalizeMaintenance),
  getMaintenanceHistory: () => list('/api/maintenances'),
  getRevenues: (tuNgay = currentMonthRange().tuNgay, denNgay = currentMonthRange().denNgay) =>
    list(`/api/vehicles/revenues?tuNgay=${tuNgay}&denNgay=${denNgay}`, normalizeRevenue),
  getSalaries: (nam = currentMonthRange().nam, thang = currentMonthRange().thang) =>
    list(`/api/drivers/salaries?nam=${nam}&thang=${thang}`, normalizeSalary),
  getAllVehicles: () => list('/api/vehicles'),
  getAllDrivers: () => list('/api/drivers'),

  createVehicle: (data) => request('/api/vehicles', { method: 'POST', body: data }),
  updateVehicle: (bienSo, data) => request(`/api/vehicles/${encodeURIComponent(bienSo)}`, { method: 'PUT', body: data }),
  deleteVehicle: (bienSo) => request(`/api/vehicles/${encodeURIComponent(bienSo)}`, { method: 'DELETE' }),

  createDriver: (data) => request('/api/drivers', { method: 'POST', body: data }),
  updateDriver: (id, data) => request(`/api/drivers/${id}`, { method: 'PUT', body: data }),
  deleteDriver: (id) => request(`/api/drivers/${id}`, { method: 'DELETE' }),

  createRoute: (data) => request('/api/routes', { method: 'POST', body: data }),
  updateRoute: (id, data) => request(`/api/routes/${id}`, { method: 'PUT', body: data }),
  deleteRoute: (id) => request(`/api/routes/${id}`, { method: 'DELETE' }),

  createTrip: (data) => request('/api/trips', { method: 'POST', body: data }),
  updateTrip: (id, data) => request(`/api/trips/${id}`, { method: 'PUT', body: data }),
  deleteTrip: (id) => request(`/api/trips/${id}`, { method: 'DELETE' }),

  confirmMaintenance: ({ bienSoXe, ngayBaoDuong, chiPhi, noiDung }) =>
    request('/api/maintenances', {
      method: 'POST',
      body: {
        bienSoXe,
        ngayBaoDuong,
        chiPhi: Number(chiPhi || 0),
        noiDung: noiDung || 'Xác nhận hoàn tất bảo dưỡng - Xe đủ điều kiện tiếp tục hoạt động'
      }
    })
};
