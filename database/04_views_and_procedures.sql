-- =============================================================================
-- BÀI TẬP LỚN CƠ SỞ DỮ LIỆU
-- ĐỀ TÀI: HỆ THỐNG QUẢN LÝ HÃNG VẬN TẢI HÀNH KHÁCH ĐƯỜNG DÀI
-- FILE: 04_views_and_procedures.sql - STORED PROCEDURES & VIEWS CHO CÁC TRUY VẤN
-- =============================================================================

USE QuanLyVanTai;

-- Xóa các thủ tục và view cũ nếu tồn tại
DROP PROCEDURE IF EXISTS sp_TinhLuongTaiXeThang;
DROP PROCEDURE IF EXISTS sp_BaoCaoDoanhThuTheoXe;
DROP PROCEDURE IF EXISTS sp_DanhSachBaoDuongXe;
DROP VIEW IF EXISTS v_XeQuaHanBaoDuong;
DROP VIEW IF EXISTS v_XeAnToan;
DROP VIEW IF EXISTS v_BangLuongTaiXeHienTai;

DELIMITER //

-- =============================================================================
-- TRUY VẤN 1: TÍNH LƯƠNG TÀI XẾ TRONG THÁNG
-- Quy tắc: Lái xe gấp đôi phụ xe (x2.0 vs x1.0).
-- Hệ số địa hình: Cấp 1 = 1.0, Cấp 2 = 1.3, Cấp 3 = 1.7.
-- Đơn giá cơ bản: 500,000 VNĐ / chuyến.
-- =============================================================================
CREATE PROCEDURE sp_TinhLuongTaiXeThang(
    IN p_Nam INT,
    IN p_Thang INT
)
BEGIN
    SELECT 
        tx.MaTaiXe,
        tx.HoTen,
        tx.LoaiBangLai,
        tx.ThamNien,
        -- Đếm số chuyến đảm nhận vai trò lái xe chính
        COUNT(CASE WHEN cx.MaLaiXe = tx.MaTaiXe THEN 1 END) AS SoChuyenLaiChinh,
        -- Đếm số chuyến đảm nhận vai trò phụ xe
        COUNT(CASE WHEN cx.MaPhuXe = tx.MaTaiXe THEN 1 END) AS SoChuyenPhuXe,
        -- Tổng số chuyến đã thực hiện
        COUNT(cx.MaChuyen) AS TongSoChuyen,
        -- Tính tổng lương tháng
        COALESCE(SUM(
            CASE 
                -- Lái xe chính: Lương cơ bản * 2.0 * Hệ số đường khó
                WHEN cx.MaLaiXe = tx.MaTaiXe THEN 500000.0 * 2.0 * 
                    CASE ty.DoPhucTap 
                        WHEN 1 THEN 1.0 
                        WHEN 2 THEN 1.3 
                        WHEN 3 THEN 1.7 
                        ELSE 1.0 
                    END
                -- Phụ xe: Lương cơ bản * 1.0 * Hệ số đường khó
                WHEN cx.MaPhuXe = tx.MaTaiXe THEN 500000.0 * 1.0 * 
                    CASE ty.DoPhucTap 
                        WHEN 1 THEN 1.0 
                        WHEN 2 THEN 1.3 
                        WHEN 3 THEN 1.7 
                        ELSE 1.0 
                    END
                ELSE 0.0
            END
        ), 0.0) AS TongLuongThang
    FROM TAI_XE tx
    LEFT JOIN CHUYEN_XE cx ON (tx.MaTaiXe = cx.MaLaiXe OR tx.MaTaiXe = cx.MaPhuXe)
        AND YEAR(cx.ThoiGianKhoiHanh) = p_Nam 
        AND MONTH(cx.ThoiGianKhoiHanh) = p_Thang
        AND cx.ThoiGianKhoiHanh <= NOW()
        AND cx.TrangThai != 'Huy'
    LEFT JOIN TUYEN_XE ty ON cx.MaTuyen = ty.MaTuyen
    GROUP BY tx.MaTaiXe, tx.HoTen, tx.LoaiBangLai, tx.ThamNien
    ORDER BY TongLuongThang DESC;
END //

-- =============================================================================
-- TRUY VẤN 2: THỐNG KÊ DOANH THU THEO XE TRONG KHOẢNG THỜI GIAN
-- Doanh thu = SUM(SoKhach * GiaVe)
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
        AND DATE(cx.ThoiGianKhoiHanh) BETWEEN p_TuNgay AND p_DenNgay
        AND cx.TrangThai != 'Huy'
    GROUP BY x.BienSo, x.HangSanXuat, x.Model, x.SoGhe
    ORDER BY TongDoanhThu DESC;
END //

-- =============================================================================
-- TRUY VẤN 3: TÍNH TOÁN NGÀY BẢO DƯỠNG TIẾP THEO & PHÂN LOẠI XE QUÁ HẠN
-- Chu kỳ tối đa: 360 ngày từ NgayBaoDuongCuoi
-- Mỗi 100km quy đổi trừ 1 ngày (Km quy đổi = km * HeSoDuongKho: 1.0, 1.3, 1.7)
-- =============================================================================
CREATE PROCEDURE sp_DanhSachBaoDuongXe()
BEGIN
    WITH KmQuyDoiXe AS (
        SELECT 
            x.BienSo,
            COALESCE(SUM(
                ty.DoDaiKm * CASE ty.DoPhucTap 
                    WHEN 1 THEN 1.0 
                    WHEN 2 THEN 1.3 
                    WHEN 3 THEN 1.7 
                    ELSE 1.0 
                END
            ), 0.0) AS TongKmQuyDoi
        FROM XE x
        LEFT JOIN CHUYEN_XE cx ON x.BienSo = cx.BienSoXe 
            AND cx.ThoiGianKhoiHanh >= x.NgayBaoDuongCuoi
            AND cx.TrangThai != 'Huy'
        LEFT JOIN TUYEN_XE ty ON cx.MaTuyen = ty.MaTuyen
        GROUP BY x.BienSo
    )
    SELECT 
        x.BienSo,
        x.HangSanXuat,
        x.Model,
        x.SoGhe,
        x.NgayBaoDuongCuoi,
        ROUND(k.TongKmQuyDoi, 1) AS TongKmQuyDoi,
        FLOOR(k.TongKmQuyDoi / 100) AS SoNgayBiTru,
        (360 - FLOOR(k.TongKmQuyDoi / 100)) AS ChuKyThucTeNgay,
        DATE_ADD(x.NgayBaoDuongCuoi, INTERVAL (360 - FLOOR(k.TongKmQuyDoi / 100)) DAY) AS NgayBaoDuongTiepTheo,
        DATEDIFF(DATE_ADD(x.NgayBaoDuongCuoi, INTERVAL (360 - FLOOR(k.TongKmQuyDoi / 100)) DAY), CURRENT_DATE) AS SoNgayConLai,
        CASE 
            WHEN DATEDIFF(DATE_ADD(x.NgayBaoDuongCuoi, INTERVAL (360 - FLOOR(k.TongKmQuyDoi / 100)) DAY), CURRENT_DATE) <= 0 
            THEN 'QUA_HAN'
            ELSE 'AN_TOAN'
        END AS TrangThaiBaoDuong
    FROM XE x
    JOIN KmQuyDoiXe k ON x.BienSo = k.BienSo
    ORDER BY SoNgayConLai ASC;
END //

DELIMITER ;

-- =============================================================================
-- CÁC VIEWS PHỤC VỤ TRUY VẤN NHANH VÀ TÁCH RIÊNG DANH SÁCH THEO YÊU CẦU ĐỀ BÀI
-- =============================================================================

-- 1. View Danh sách xe QUÁ HẠN bảo dưỡng (Danh sách riêng theo yêu cầu đề bài)
CREATE VIEW v_XeQuaHanBaoDuong AS
WITH KmQuyDoiXe AS (
    SELECT 
        x.BienSo,
        COALESCE(SUM(
            ty.DoDaiKm * CASE ty.DoPhucTap 
                WHEN 1 THEN 1.0 
                WHEN 2 THEN 1.3 
                WHEN 3 THEN 1.7 
                ELSE 1.0 
            END
        ), 0.0) AS TongKmQuyDoi
    FROM XE x
    LEFT JOIN CHUYEN_XE cx ON x.BienSo = cx.BienSoXe 
        AND cx.ThoiGianKhoiHanh >= x.NgayBaoDuongCuoi
        AND cx.TrangThai != 'Huy'
    LEFT JOIN TUYEN_XE ty ON cx.MaTuyen = ty.MaTuyen
    GROUP BY x.BienSo
)
SELECT 
    x.BienSo,
    x.HangSanXuat,
    x.Model,
    x.NgayBaoDuongCuoi,
    ROUND(k.TongKmQuyDoi, 1) AS TongKmQuyDoi,
    FLOOR(k.TongKmQuyDoi / 100) AS SoNgayBiTru,
    DATE_ADD(x.NgayBaoDuongCuoi, INTERVAL (360 - FLOOR(k.TongKmQuyDoi / 100)) DAY) AS NgayBaoDuongTiepTheo,
    ABS(DATEDIFF(DATE_ADD(x.NgayBaoDuongCuoi, INTERVAL (360 - FLOOR(k.TongKmQuyDoi / 100)) DAY), CURRENT_DATE)) AS SoNgayQuaHan
FROM XE x
JOIN KmQuyDoiXe k ON x.BienSo = k.BienSo
WHERE DATEDIFF(DATE_ADD(x.NgayBaoDuongCuoi, INTERVAL (360 - FLOOR(k.TongKmQuyDoi / 100)) DAY), CURRENT_DATE) <= 0
ORDER BY NgayBaoDuongTiepTheo ASC;

-- 2. View Danh sách xe AN TOÀN (chưa đến hạn bảo dưỡng)
CREATE VIEW v_XeAnToan AS
WITH KmQuyDoiXe AS (
    SELECT 
        x.BienSo,
        COALESCE(SUM(
            ty.DoDaiKm * CASE ty.DoPhucTap 
                WHEN 1 THEN 1.0 
                WHEN 2 THEN 1.3 
                WHEN 3 THEN 1.7 
                ELSE 1.0 
            END
        ), 0.0) AS TongKmQuyDoi
    FROM XE x
    LEFT JOIN CHUYEN_XE cx ON x.BienSo = cx.BienSoXe 
        AND cx.ThoiGianKhoiHanh >= x.NgayBaoDuongCuoi
        AND cx.TrangThai != 'Huy'
    LEFT JOIN TUYEN_XE ty ON cx.MaTuyen = ty.MaTuyen
    GROUP BY x.BienSo
)
SELECT 
    x.BienSo,
    x.HangSanXuat,
    x.Model,
    x.NgayBaoDuongCuoi,
    ROUND(k.TongKmQuyDoi, 1) AS TongKmQuyDoi,
    FLOOR(k.TongKmQuyDoi / 100) AS SoNgayBiTru,
    DATE_ADD(x.NgayBaoDuongCuoi, INTERVAL (360 - FLOOR(k.TongKmQuyDoi / 100)) DAY) AS NgayBaoDuongTiepTheo,
    DATEDIFF(DATE_ADD(x.NgayBaoDuongCuoi, INTERVAL (360 - FLOOR(k.TongKmQuyDoi / 100)) DAY), CURRENT_DATE) AS SoNgayConLai
FROM XE x
JOIN KmQuyDoiXe k ON x.BienSo = k.BienSo
WHERE DATEDIFF(DATE_ADD(x.NgayBaoDuongCuoi, INTERVAL (360 - FLOOR(k.TongKmQuyDoi / 100)) DAY), CURRENT_DATE) > 0
ORDER BY SoNgayConLai ASC;

-- 3. View Bảng lương tài xế tính đến tháng hiện tại
CREATE VIEW v_BangLuongTaiXeHienTai AS
SELECT 
    tx.MaTaiXe,
    tx.HoTen,
    tx.LoaiBangLai,
    COUNT(CASE WHEN cx.MaLaiXe = tx.MaTaiXe THEN 1 END) AS SoChuyenLaiChinh,
    COUNT(CASE WHEN cx.MaPhuXe = tx.MaTaiXe THEN 1 END) AS SoChuyenPhuXe,
    COALESCE(SUM(
        CASE 
            WHEN cx.MaLaiXe = tx.MaTaiXe THEN 500000.0 * 2.0 * 
                CASE ty.DoPhucTap WHEN 1 THEN 1.0 WHEN 2 THEN 1.3 WHEN 3 THEN 1.7 ELSE 1.0 END
            WHEN cx.MaPhuXe = tx.MaTaiXe THEN 500000.0 * 1.0 * 
                CASE ty.DoPhucTap WHEN 1 THEN 1.0 WHEN 2 THEN 1.3 WHEN 3 THEN 1.7 ELSE 1.0 END
            ELSE 0.0
        END
    ), 0.0) AS TongLuongThang
FROM TAI_XE tx
LEFT JOIN CHUYEN_XE cx ON (tx.MaTaiXe = cx.MaLaiXe OR tx.MaTaiXe = cx.MaPhuXe)
    AND YEAR(cx.ThoiGianKhoiHanh) = YEAR(CURRENT_DATE) 
    AND MONTH(cx.ThoiGianKhoiHanh) = MONTH(CURRENT_DATE)
    AND cx.ThoiGianKhoiHanh <= NOW()
    AND cx.TrangThai != 'Huy'
LEFT JOIN TUYEN_XE ty ON cx.MaTuyen = ty.MaTuyen
GROUP BY tx.MaTaiXe, tx.HoTen, tx.LoaiBangLai
ORDER BY TongLuongThang DESC;
