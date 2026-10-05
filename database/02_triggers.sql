-- =============================================================================
-- BÀI TẬP LỚN CƠ SỞ DỮ LIỆU
-- ĐỀ TÀI: HỆ THỐNG QUẢN LÝ HÃNG VẬN TẢI HÀNH KHÁCH ĐƯỜNG DÀI
-- FILE: 02_triggers.sql - CÁC RÀNG BUỘC TOÀN VẸN TỰ ĐỘNG BẰNG TRIGGER
-- =============================================================================

USE QuanLyVanTai;

DROP TRIGGER IF EXISTS trg_chuyen_xe_before_insert;
DROP TRIGGER IF EXISTS trg_chuyen_xe_before_update;
DROP TRIGGER IF EXISTS trg_after_insert_bao_duong;

DELIMITER //

-- 1. TRIGGER KIỂM SOÁT KHI THÊM CHUYẾN XE MỚI
CREATE TRIGGER trg_chuyen_xe_before_insert
BEFORE INSERT ON CHUYEN_XE
FOR EACH ROW
BEGIN
    DECLARE v_SoGhe INT DEFAULT 0;

    -- Kiểm tra 1: Lái xe chính và Phụ xe không được trùng nhau
    IF NEW.MaLaiXe = NEW.MaPhuXe THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi nghiệp vụ: Lái xe chính và Phụ xe không được là cùng một người!';
    END IF;

    -- Kiểm tra 2: Lấy số ghế thiết kế của xe được chỉ định
    SELECT SoGhe INTO v_SoGhe 
    FROM XE 
    WHERE BienSo = NEW.BienSoXe;

    -- Ràng buộc cốt lõi: Số khách không được vượt quá số ghế trừ 2 (dành cho tổ lái)
    IF NEW.SoKhach > (v_SoGhe - 2) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi vi phạm an toàn: Số hành khách vượt quá số chỗ ngồi quy định (Số khách <= Số ghế - 2)!';
    END IF;
END //

-- 2. TRIGGER KIỂM SOÁT KHI CẬP NHẬT CHUYẾN XE
CREATE TRIGGER trg_chuyen_xe_before_update
BEFORE UPDATE ON CHUYEN_XE
FOR EACH ROW
BEGIN
    DECLARE v_SoGhe INT DEFAULT 0;

    -- Kiểm tra 1: Lái xe chính và Phụ xe không được trùng nhau
    IF NEW.MaLaiXe = NEW.MaPhuXe THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi nghiệp vụ: Lái xe chính và Phụ xe không được là cùng một người!';
    END IF;

    -- Kiểm tra 2: Lấy số ghế thiết kế của xe
    SELECT SoGhe INTO v_SoGhe 
    FROM XE 
    WHERE BienSo = NEW.BienSoXe;

    -- Ràng buộc: Số khách không vượt quá số ghế trừ 2
    IF NEW.SoKhach > (v_SoGhe - 2) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lỗi vi phạm an toàn: Số hành khách vượt quá số chỗ ngồi quy định (Số khách <= Số ghế - 2)!';
    END IF;
END //

-- 3. TRIGGER TỰ ĐỘNG CẬP NHẬT NGÀY BẢO DƯỠNG CUỐI CỦA XE KHI GHI NHẬN BẢO DƯỠNG MỚI
CREATE TRIGGER trg_after_insert_bao_duong
AFTER INSERT ON LICH_SU_BAO_DUONG
FOR EACH ROW
BEGIN
    UPDATE XE
    SET NgayBaoDuongCuoi = NEW.NgayBaoDuong
    WHERE BienSo = NEW.BienSoXe
      AND NEW.NgayBaoDuong >= NgayBaoDuongCuoi;
END //

DELIMITER ;
