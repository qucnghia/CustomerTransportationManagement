-- =============================================================================
-- BÀI TẬP LỚN CƠ SỞ DỮ LIỆU
-- ĐỀ TÀI: HỆ THỐNG QUẢN LÝ HÃNG VẬN TẢI HÀNH KHÁCH ĐƯỜNG DÀI
-- FILE: 04_views_and_procedures.sql - STORED PROCEDURES & VIEWS CHO CÁC TRUY VẤN
-- =============================================================================

USE QuanLyVanTai;

-- Xóa các thủ tục, hàm và view cũ nếu tồn tại
DROP PROCEDURE IF EXISTS sp_TinhLuongTaiXeThang;
DROP PROCEDURE IF EXISTS sp_BaoCaoDoanhThuTheoXe;
DROP PROCEDURE IF EXISTS sp_DanhSachBaoDuongXe;
DROP VIEW IF EXISTS v_XeQuaHanBaoDuong;
DROP VIEW IF EXISTS v_XeAnToan;
DROP VIEW IF EXISTS v_BangLuongTaiXeHienTai;
DROP VIEW IF EXISTS v_LuongTheoChuyen;
DROP VIEW IF EXISTS v_DanhSachChuyenXe;
DROP VIEW IF EXISTS v_XeBaoDuongChiTiet;
DROP VIEW IF EXISTS v_XeKmQuyDoi;
DROP FUNCTION IF EXISTS fn_HeSoDiaHinh;

DELIMITER //

-- =============================================================================
-- HÀM DÙNG CHUNG: HỆ SỐ ĐƯỜNG KHÓ THEO ĐỘ PHỨC TẠP TUYẾN
--   Cấp 1 = 1.0 (đồng bằng), Cấp 2 = 1.3 (trung du), Cấp 3 = 1.7 (đèo núi)
-- =============================================================================
CREATE FUNCTION fn_HeSoDiaHinh(p_DoPhucTap INT)
RETURNS DECIMAL(3, 1)
DETERMINISTIC
NO SQL
BEGIN
    RETURN CASE p_DoPhucTap
        WHEN 2 THEN 1.3
        WHEN 3 THEN 1.7
        ELSE 1.0
    END;
END //

DELIMITER ;

-- =============================================================================
-- TRUY VẤN 1: TÍNH LƯƠNG TÀI XẾ
-- Quy tắc nghiệp vụ:
--   - Chỉ tính các chuyến đã HOÀN THÀNH.
--   - Lái xe chính lương gấp đôi phụ xe (hệ số vai trò: 2.0 vs 1.0).
--   - Nhân hệ số đường khó của tuyến (fn_HeSoDiaHinh).
--   - Đơn giá cơ bản: 500,000 VNĐ / chuyến.
-- =============================================================================

-- Bước 1: Mỗi dòng là tiền lương của 1 người cho 1 chuyến (lái chính hoặc phụ xe)
CREATE VIEW v_LuongTheoChuyen AS
SELECT cx.MaChuyen, cx.ThoiGianKhoiHanh, cx.MaLaiXe AS MaTaiXe, 'LaiChinh' AS VaiTro,
       500000.0 * 2.0 * fn_HeSoDiaHinh(ty.DoPhucTap) AS TienLuong
FROM CHUYEN_XE cx
JOIN TUYEN_XE ty ON cx.MaTuyen = ty.MaTuyen
WHERE cx.TrangThai = 'HoanThanh'
UNION ALL
SELECT cx.MaChuyen, cx.ThoiGianKhoiHanh, cx.MaPhuXe AS MaTaiXe, 'PhuXe' AS VaiTro,
       500000.0 * 1.0 * fn_HeSoDiaHinh(ty.DoPhucTap) AS TienLuong
FROM CHUYEN_XE cx
JOIN TUYEN_XE ty ON cx.MaTuyen = ty.MaTuyen
WHERE cx.TrangThai = 'HoanThanh';

DELIMITER //

-- Bước 2: Bảng lương theo năm & tháng bất kỳ
CREATE PROCEDURE sp_TinhLuongTaiXeThang(
    IN p_Nam INT,
    IN p_Thang INT
)
BEGIN
    DECLARE v_DauThang DATE DEFAULT MAKEDATE(p_Nam, 1) + INTERVAL (p_Thang - 1) MONTH;

    SELECT
        tx.MaTaiXe,
        tx.HoTen,
        tx.LoaiBangLai,
        tx.ThamNien,
        COUNT(CASE WHEN l.VaiTro = 'LaiChinh' THEN 1 END) AS SoChuyenLaiChinh,
        COUNT(CASE WHEN l.VaiTro = 'PhuXe' THEN 1 END) AS SoChuyenPhuXe,
        COUNT(l.MaChuyen) AS TongSoChuyen,
        COALESCE(SUM(l.TienLuong), 0.0) AS TongLuongThang
    FROM TAI_XE tx
    LEFT JOIN v_LuongTheoChuyen l ON l.MaTaiXe = tx.MaTaiXe
        AND l.ThoiGianKhoiHanh >= v_DauThang
        AND l.ThoiGianKhoiHanh < v_DauThang + INTERVAL 1 MONTH
    GROUP BY tx.MaTaiXe, tx.HoTen, tx.LoaiBangLai, tx.ThamNien
    ORDER BY TongLuongThang DESC;
END //

-- =============================================================================
-- TRUY VẤN 2: THỐNG KÊ DOANH THU THEO XE TRONG KHOẢNG THỜI GIAN
-- Quy tắc: Doanh thu = SUM(SoKhach * GiaVe) của các chuyến không bị hủy
--          (vé của chuyến đã lên lịch / đang chạy cũng là doanh thu đã bán)
-- =============================================================================
CREATE PROCEDURE sp_BaoCaoDoanhThuTheoXe(
    IN p_TuNgay DATE,
    IN p_DenNgay DATE
)
BEGIN
    SELECT
        x.BienSo,
        x.HangSanXuat,
        x.Model,
        x.SoGhe,
        COUNT(cx.MaChuyen) AS TongSoChuyen,
        COALESCE(SUM(cx.SoKhach), 0) AS TongSoKhach,
        COALESCE(SUM(cx.SoKhach * cx.GiaVe), 0.00) AS TongDoanhThu
    FROM XE x
    LEFT JOIN CHUYEN_XE cx ON x.BienSo = cx.BienSoXe
        AND cx.ThoiGianKhoiHanh >= p_TuNgay
        AND cx.ThoiGianKhoiHanh < p_DenNgay + INTERVAL 1 DAY
        AND cx.TrangThai <> 'Huy'
    GROUP BY x.BienSo, x.HangSanXuat, x.Model, x.SoGhe
    ORDER BY TongDoanhThu DESC;
END //

DELIMITER ;

-- =============================================================================
-- TRUY VẤN 3: TÍNH TOÁN NGÀY BẢO DƯỠNG TIẾP THEO & PHÂN LOẠI XE QUÁ HẠN
-- =============================================================================

-- Bước 1: Tổng kilomet quy đổi của các chuyến đã hoàn thành kể từ lần bảo dưỡng cuối
CREATE VIEW v_XeKmQuyDoi AS
SELECT
    x.BienSo,
    x.HangSanXuat,
    x.Model,
    x.SoGhe,
    x.NgayBaoDuongCuoi,
    ROUND(COALESCE(SUM(ty.DoDaiKm * fn_HeSoDiaHinh(ty.DoPhucTap)), 0.0), 1) AS TongKmQuyDoi
FROM XE x
LEFT JOIN CHUYEN_XE cx ON x.BienSo = cx.BienSoXe
    AND cx.ThoiGianKhoiHanh >= x.NgayBaoDuongCuoi
    AND cx.TrangThai = 'HoanThanh'
LEFT JOIN TUYEN_XE ty ON cx.MaTuyen = ty.MaTuyen
GROUP BY x.BienSo, x.HangSanXuat, x.Model, x.SoGhe, x.NgayBaoDuongCuoi;

-- Bước 2: Chu kỳ thực tế (360 ngày, cứ 100 km quy đổi trừ 1 ngày, không âm),
--         ngày bảo dưỡng tiếp theo, số ngày còn lại so với hôm nay và trạng thái
CREATE VIEW v_XeBaoDuongChiTiet AS
SELECT
    t.BienSo,
    t.HangSanXuat,
    t.Model,
    t.SoGhe,
    t.NgayBaoDuongCuoi,
    t.TongKmQuyDoi,
    t.SoNgayBiTru,
    t.ChuKyThucTeNgay,
    t.NgayBaoDuongTiepTheo,
    DATEDIFF(t.NgayBaoDuongTiepTheo, CURRENT_DATE()) AS SoNgayConLai,
    CASE WHEN t.NgayBaoDuongTiepTheo <= CURRENT_DATE() THEN 'QUA_HAN' ELSE 'AN_TOAN' END AS TrangThaiBaoDuong
FROM (
    SELECT
        k.*,
        FLOOR(k.TongKmQuyDoi / 100) AS SoNgayBiTru,
        GREATEST(0, 360 - FLOOR(k.TongKmQuyDoi / 100)) AS ChuKyThucTeNgay,
        DATE_ADD(k.NgayBaoDuongCuoi, INTERVAL GREATEST(0, 360 - FLOOR(k.TongKmQuyDoi / 100)) DAY) AS NgayBaoDuongTiepTheo
    FROM v_XeKmQuyDoi k
) t;

-- 3. View Danh sách riêng các xe QUÁ HẠN bảo dưỡng (theo đúng yêu cầu đề bài)
CREATE VIEW v_XeQuaHanBaoDuong AS
SELECT d.*, -d.SoNgayConLai AS SoNgayQuaHan
FROM v_XeBaoDuongChiTiet d
WHERE d.TrangThaiBaoDuong = 'QUA_HAN'
ORDER BY d.NgayBaoDuongTiepTheo ASC;

-- 4. View Danh sách các xe AN TOÀN (chưa đến hạn bảo dưỡng)
CREATE VIEW v_XeAnToan AS
SELECT d.*
FROM v_XeBaoDuongChiTiet d
WHERE d.TrangThaiBaoDuong = 'AN_TOAN'
ORDER BY d.SoNgayConLai ASC;

-- 5. View Bảng lương tài xế của tháng hiện tại
CREATE VIEW v_BangLuongTaiXeHienTai AS
SELECT
    tx.MaTaiXe,
    tx.HoTen,
    tx.LoaiBangLai,
    tx.ThamNien,
    COUNT(CASE WHEN l.VaiTro = 'LaiChinh' THEN 1 END) AS SoChuyenLaiChinh,
    COUNT(CASE WHEN l.VaiTro = 'PhuXe' THEN 1 END) AS SoChuyenPhuXe,
    COUNT(l.MaChuyen) AS TongSoChuyen,
    COALESCE(SUM(l.TienLuong), 0.0) AS TongLuongThang
FROM TAI_XE tx
LEFT JOIN v_LuongTheoChuyen l ON l.MaTaiXe = tx.MaTaiXe
    AND l.ThoiGianKhoiHanh >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
    AND l.ThoiGianKhoiHanh < DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01') + INTERVAL 1 MONTH
GROUP BY tx.MaTaiXe, tx.HoTen, tx.LoaiBangLai, tx.ThamNien
ORDER BY TongLuongThang DESC;

-- 6. View Danh sách Chuyến xe đầy đủ thông tin (kèm tên tuyến, tên lái xe, tên phụ xe)
CREATE VIEW v_DanhSachChuyenXe AS
SELECT
    cx.MaChuyen,
    CONCAT(ty.DiemDau, ' - ', ty.DiemCuoi) AS TuyenDuong,
    ty.DoPhucTap,
    cx.BienSoXe,
    x.Model AS DongXe,
    tx_lai.HoTen AS TenLaiXe,
    tx_phu.HoTen AS TenPhuXe,
    cx.ThoiGianKhoiHanh,
    cx.ThoiGianKetThuc,
    cx.SoKhach,
    (x.SoGhe - 2) AS SoKhachToiDaQuyDinh,
    cx.GiaVe,
    (cx.SoKhach * cx.GiaVe) AS DoanhThuChuyen,
    cx.TrangThai,
    cx.MaTuyen,
    cx.MaLaiXe,
    cx.MaPhuXe
FROM CHUYEN_XE cx
JOIN TUYEN_XE ty ON cx.MaTuyen = ty.MaTuyen
JOIN XE x ON cx.BienSoXe = x.BienSo
JOIN TAI_XE tx_lai ON cx.MaLaiXe = tx_lai.MaTaiXe
JOIN TAI_XE tx_phu ON cx.MaPhuXe = tx_phu.MaTaiXe;

DELIMITER //

-- 7. Stored Procedure hiển thị toàn bộ xe và trạng thái bảo dưỡng
CREATE PROCEDURE sp_DanhSachBaoDuongXe()
BEGIN
    SELECT *
    FROM v_XeBaoDuongChiTiet
    ORDER BY SoNgayConLai ASC;
END //

DELIMITER ;
