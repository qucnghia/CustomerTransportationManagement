-- =============================================================================
-- BÀI TẬP LỚN CƠ SỞ DỮ LIỆU
-- ĐỀ TÀI: HỆ THỐNG QUẢN LÝ HÃNG VẬN TẢI HÀNH KHÁCH ĐƯỜNG DÀI
-- FILE: 02_triggers.sql - CÁC RÀNG BUỘC TOÀN VẸN TỰ ĐỘNG BẰNG TRIGGER
-- =============================================================================

USE QuanLyVanTai;

DROP TRIGGER IF EXISTS trg_chuyen_xe_before_insert;
DROP TRIGGER IF EXISTS trg_chuyen_xe_before_update;
DROP TRIGGER IF EXISTS trg_after_insert_bao_duong;
DROP TRIGGER IF EXISTS trg_after_update_bao_duong;
DROP TRIGGER IF EXISTS trg_after_delete_bao_duong;
DROP PROCEDURE IF EXISTS sp_KiemTraChuyenXe;
DROP PROCEDURE IF EXISTS sp_DongBoNgayBaoDuongCuoi;

DELIMITER //

-- 0. THỦ TỤC KIỂM TRA DÙNG CHUNG CHO TRIGGER INSERT & UPDATE CỦA CHUYEN_XE
CREATE PROCEDURE sp_KiemTraChuyenXe(
    IN p_MaChuyen INT,
    IN p_BienSoXe VARCHAR(20),
    IN p_MaLaiXe INT,
    IN p_MaPhuXe INT,
    IN p_KhoiHanh DATETIME,
    IN p_KetThuc DATETIME,
    IN p_SoKhach INT,
    IN p_TrangThai VARCHAR(50)
)
BEGIN
    DECLARE v_SoGhe INT DEFAULT 0;

    -- Kiểm tra 1: Lái xe chính và Phụ xe không được trùng nhau
    IF p_MaLaiXe = p_MaPhuXe THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi nghiệp vụ: Lái xe chính và Phụ xe không được là cùng một người!';
    END IF;

    -- Kiểm tra 2: Lấy số ghế thiết kế của xe được chỉ định
    SELECT SoGhe INTO v_SoGhe
    FROM XE
    WHERE BienSo = p_BienSoXe;

    IF v_SoGhe IS NULL OR v_SoGhe = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi nghiệp vụ: Phương tiện được chỉ định không tồn tại trong hệ thống!';
    END IF;

    -- Ràng buộc cốt lõi: Số khách không được vượt quá số ghế trừ 2 (dành cho tổ lái)
    IF p_SoKhach > (v_SoGhe - 2) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi vi phạm an toàn: Số hành khách vượt quá số chỗ ngồi quy định (Số khách <= Số ghế - 2)!';
    END IF;

    -- Kiểm tra 3 & 4: Không trùng lịch xe / nhân sự với chuyến khác (bỏ qua chuyến đã hủy)
    IF p_TrangThai <> 'Huy' THEN
        IF EXISTS (
            SELECT 1 FROM CHUYEN_XE
            WHERE MaChuyen <> COALESCE(p_MaChuyen, 0)
              AND TrangThai <> 'Huy'
              AND BienSoXe = p_BienSoXe
              AND ThoiGianKhoiHanh < p_KetThuc
              AND ThoiGianKetThuc > p_KhoiHanh
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Lỗi trùng lịch: Phương tiện đã được phân công cho chuyến khác trong khoảng thời gian này!';
        END IF;

        IF EXISTS (
            SELECT 1 FROM CHUYEN_XE
            WHERE MaChuyen <> COALESCE(p_MaChuyen, 0)
              AND TrangThai <> 'Huy'
              AND (MaLaiXe IN (p_MaLaiXe, p_MaPhuXe) OR MaPhuXe IN (p_MaLaiXe, p_MaPhuXe))
              AND ThoiGianKhoiHanh < p_KetThuc
              AND ThoiGianKetThuc > p_KhoiHanh
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Lỗi trùng lịch: Lái xe hoặc phụ xe đã được phân công cho chuyến khác trong khoảng thời gian này!';
        END IF;
    END IF;
END //

-- 1. TRIGGER KIỂM SOÁT KHI THÊM CHUYẾN XE MỚI
CREATE TRIGGER trg_chuyen_xe_before_insert
BEFORE INSERT ON CHUYEN_XE
FOR EACH ROW
BEGIN
    CALL sp_KiemTraChuyenXe(NEW.MaChuyen, NEW.BienSoXe, NEW.MaLaiXe, NEW.MaPhuXe,
                            NEW.ThoiGianKhoiHanh, NEW.ThoiGianKetThuc, NEW.SoKhach, NEW.TrangThai);
END //

-- 2. TRIGGER KIỂM SOÁT KHI CẬP NHẬT CHUYẾN XE
CREATE TRIGGER trg_chuyen_xe_before_update
BEFORE UPDATE ON CHUYEN_XE
FOR EACH ROW
BEGIN
    CALL sp_KiemTraChuyenXe(NEW.MaChuyen, NEW.BienSoXe, NEW.MaLaiXe, NEW.MaPhuXe,
                            NEW.ThoiGianKhoiHanh, NEW.ThoiGianKetThuc, NEW.SoKhach, NEW.TrangThai);
END //

-- 3. ĐỒNG BỘ XE.NgayBaoDuongCuoi VỚI LẦN BẢO DƯỠNG MỚI NHẤT TRONG LỊCH SỬ
--    (giữ nguyên giá trị hiện tại nếu xe không còn bản ghi lịch sử nào)
CREATE PROCEDURE sp_DongBoNgayBaoDuongCuoi(IN p_BienSoXe VARCHAR(20))
BEGIN
    UPDATE XE
    SET NgayBaoDuongCuoi = COALESCE(
        (SELECT MAX(NgayBaoDuong) FROM LICH_SU_BAO_DUONG WHERE BienSoXe = p_BienSoXe),
        NgayBaoDuongCuoi)
    WHERE BienSo = p_BienSoXe;
END //

CREATE TRIGGER trg_after_insert_bao_duong
AFTER INSERT ON LICH_SU_BAO_DUONG
FOR EACH ROW
BEGIN
    UPDATE XE
    SET NgayBaoDuongCuoi = NEW.NgayBaoDuong
    WHERE BienSo = NEW.BienSoXe
      AND NEW.NgayBaoDuong >= NgayBaoDuongCuoi;
END //

CREATE TRIGGER trg_after_update_bao_duong
AFTER UPDATE ON LICH_SU_BAO_DUONG
FOR EACH ROW
BEGIN
    CALL sp_DongBoNgayBaoDuongCuoi(NEW.BienSoXe);
    IF OLD.BienSoXe <> NEW.BienSoXe THEN
        CALL sp_DongBoNgayBaoDuongCuoi(OLD.BienSoXe);
    END IF;
END //

CREATE TRIGGER trg_after_delete_bao_duong
AFTER DELETE ON LICH_SU_BAO_DUONG
FOR EACH ROW
BEGIN
    CALL sp_DongBoNgayBaoDuongCuoi(OLD.BienSoXe);
END //

DELIMITER ;
