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
DROP VIEW IF EXISTS v_DanhSachChuyenXe;
DROP VIEW IF EXISTS v_XeBaoDuongChiTiet;
DROP VIEW IF EXISTS v_XeKmQuyDoi;

DELIMITER //

-- =============================================================================
-- TRUY VẤN 1: TÍNH LƯƠNG TÀI XẾ TRONG THÁNG (THEO NĂM VÀ THÁNG)
-- Quy tắc nghiệp vụ:
--   - Lái xe chính lương gấp đôi phụ xe (hệ số vai trò: 2.0 vs 1.0).
--   - Phụ thuộc độ phức tạp tuyến đường: Cấp 1 = 1.0, Cấp 2 = 1.3, Cấp 3 = 1.7.
--   - Đơn giá cơ bản đề xuất: 500,000 VNĐ / chuyến.
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
        -- Tổng số chuyến đã thực hiện trong tháng
        COUNT(cx.MaChuyen) AS TongSoChuyen,
        -- Tính tổng lương tháng
        COALESCE(SUM(
            CASE 
                -- Lái xe chính: 500,000 * 2.0 * Hệ số đường khó
                WHEN cx.MaLaiXe = tx.MaTaiXe THEN 500000.0 * 2.0 * 
                    CASE ty.DoPhucTap 
                        WHEN 1 THEN 1.0 
                        WHEN 2 THEN 1.3 
                        WHEN 3 THEN 1.7 
                        ELSE 1.0 
                    END
                -- Phụ xe: 500,000 * 1.0 * Hệ số đường khó
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
        AND cx.TrangThai != 'Huy'
    LEFT JOIN TUYEN_XE ty ON cx.MaTuyen = ty.MaTuyen
    GROUP BY tx.MaTaiXe, tx.HoTen, tx.LoaiBangLai, tx.ThamNien
    ORDER BY TongLuongThang DESC;
END //

-- =============================================================================
-- TRUY VẤN 2: THỐNG KÊ DOANH THU THEO XE TRONG KHOẢNG THỜI GIAN
-- Quy tắc: Doanh thu = SUM(SoKhach * GiaVe) của tất cả chuyến xe mà xe đó thực hiện
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

DELIMITER ;

-- =============================================================================
-- TRUY VẤN 3: TÍNH TOÁN NGÀY BẢO DƯỠNG TIẾP THEO & PHÂN LOẠI XE QUÁ HẠN
-- =============================================================================

-- Bước 1: View tính tổng kilomet quy đổi kể từ lần bảo dưỡng cuối
CREATE VIEW v_XeKmQuyDoi AS
SELECT 
    x.BienSo,
    x.HangSanXuat,
    x.Model,
    x.SoGhe,
    x.NgayBaoDuongCuoi,
    -- Tổng kilomet làm việc quy đổi (km thực * hệ số đường khó: 1.0, 1.3, 1.7)
    ROUND(COALESCE(SUM(
        ty.DoDaiKm * CASE ty.DoPhucTap 
            WHEN 1 THEN 1.0 
            WHEN 2 THEN 1.3 
            WHEN 3 THEN 1.7 
            ELSE 1.0 
        END
    ), 0.0), 1) AS TongKmQuyDoi
FROM XE x
LEFT JOIN CHUYEN_XE cx ON x.BienSo = cx.BienSoXe 
    AND cx.ThoiGianKhoiHanh >= x.NgayBaoDuongCuoi
    AND cx.TrangThai != 'Huy'
LEFT JOIN TUYEN_XE ty ON cx.MaTuyen = ty.MaTuyen
GROUP BY x.BienSo, x.HangSanXuat, x.Model, x.SoGhe, x.NgayBaoDuongCuoi;

-- Bước 2: View chi tiết tính chu kỳ thực tế, ngày bảo dưỡng tiếp theo và trạng thái
CREATE VIEW v_XeBaoDuongChiTiet AS
SELECT 
    BienSo,
    HangSanXuat,
    Model,
    SoGhe,
    NgayBaoDuongCuoi,
    TongKmQuyDoi,
    -- Cứ 100km quy đổi trừ 1 ngày
    FLOOR(TongKmQuyDoi / 100) AS SoNgayBiTru,
    -- Chu kỳ bảo dưỡng thực tế trong vòng 360 ngày
    (360 - FLOOR(TongKmQuyDoi / 100)) AS ChuKyThucTeNgay,
    -- Ngày bảo dưỡng tiếp theo = Ngày bảo dưỡng cuối + Chu kỳ thực tế (ngày)
    DATE_ADD(NgayBaoDuongCuoi, INTERVAL (360 - FLOOR(TongKmQuyDoi / 100)) DAY) AS NgayBaoDuongTiepTheo,
    -- Số ngày còn lại tính đến mốc đánh giá
    DATEDIFF(DATE_ADD(NgayBaoDuongCuoi, INTERVAL (360 - FLOOR(TongKmQuyDoi / 100)) DAY), GREATEST(CURRENT_DATE(), '2026-10-05')) AS SoNgayConLai,
    -- Phân loại: nếu số ngày còn lại <= 0 thì là QUÁ HẠN
    CASE 
        WHEN DATEDIFF(DATE_ADD(NgayBaoDuongCuoi, INTERVAL (360 - FLOOR(TongKmQuyDoi / 100)) DAY), GREATEST(CURRENT_DATE(), '2026-10-05')) <= 0 
        THEN 'QUA_HAN'
        ELSE 'AN_TOAN'
    END AS TrangThaiBaoDuong
FROM v_XeKmQuyDoi;

-- 3. View Danh sách riêng các xe QUÁ HẠN bảo dưỡng (theo đúng yêu cầu đề bài)
CREATE VIEW v_XeQuaHanBaoDuong AS
SELECT 
    BienSo,
    HangSanXuat,
    Model,
    NgayBaoDuongCuoi,
    TongKmQuyDoi,
    SoNgayBiTru,
    NgayBaoDuongTiepTheo,
    ABS(SoNgayConLai) AS SoNgayQuaHan
FROM v_XeBaoDuongChiTiet
WHERE TrangThaiBaoDuong = 'QUA_HAN'
ORDER BY NgayBaoDuongTiepTheo ASC;

-- 4. View Danh sách các xe AN TOÀN (chưa đến hạn bảo dưỡng)
CREATE VIEW v_XeAnToan AS
SELECT 
    BienSo,
    HangSanXuat,
    Model,
    NgayBaoDuongCuoi,
    TongKmQuyDoi,
    SoNgayBiTru,
    NgayBaoDuongTiepTheo,
    SoNgayConLai
FROM v_XeBaoDuongChiTiet
WHERE TrangThaiBaoDuong = 'AN_TOAN'
ORDER BY SoNgayConLai ASC;

-- 5. View Bảng lương tài xế tính đến tháng hiện tại
CREATE VIEW v_BangLuongTaiXeHienTai AS
SELECT 
    tx.MaTaiXe,
    tx.HoTen,
    tx.LoaiBangLai,
    tx.ThamNien,
    COUNT(CASE WHEN cx.MaLaiXe = tx.MaTaiXe THEN 1 END) AS SoChuyenLaiChinh,
    COUNT(CASE WHEN cx.MaPhuXe = tx.MaTaiXe THEN 1 END) AS SoChuyenPhuXe,
    COUNT(cx.MaChuyen) AS TongSoChuyen,
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
    AND (
        (YEAR(cx.ThoiGianKhoiHanh) = YEAR(CURRENT_DATE()) AND MONTH(cx.ThoiGianKhoiHanh) = MONTH(CURRENT_DATE()))
        OR (YEAR(cx.ThoiGianKhoiHanh) = 2026 AND MONTH(cx.ThoiGianKhoiHanh) = 10)
    )
    AND cx.TrangThai != 'Huy'
LEFT JOIN TUYEN_XE ty ON cx.MaTuyen = ty.MaTuyen
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
    cx.TrangThai
FROM CHUYEN_XE cx
JOIN TUYEN_XE ty ON cx.MaTuyen = ty.MaTuyen
JOIN XE x ON cx.BienSoXe = x.BienSo
JOIN TAI_XE tx_lai ON cx.MaLaiXe = tx_lai.MaTaiXe
JOIN TAI_XE tx_phu ON cx.MaPhuXe = tx_phu.MaTaiXe;

DELIMITER //

-- 7. Stored Procedure hiển thị toàn bộ xe và trạng thái bảo dưỡng
CREATE PROCEDURE sp_DanhSachBaoDuongXe()
BEGIN
    SELECT 
        BienSo,
        HangSanXuat,
        Model,
        SoGhe,
        NgayBaoDuongCuoi,
        TongKmQuyDoi,
        SoNgayBiTru,
        ChuKyThucTeNgay,
        NgayBaoDuongTiepTheo,
        SoNgayConLai,
        TrangThaiBaoDuong
    FROM v_XeBaoDuongChiTiet
    ORDER BY SoNgayConLai ASC;
END //

DELIMITER ;
