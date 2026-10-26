package in.nqn.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Projection đọc từ View v_DanhSachChuyenXe (khớp theo tên cột, không phụ thuộc thứ tự)
public interface ChuyenXeResponse {

    Integer getMaChuyen();

    String getTuyenDuong();

    Integer getDoPhucTap();

    String getBienSoXe();

    String getDongXe();

    String getTenLaiXe();

    String getTenPhuXe();

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime getThoiGianKhoiHanh();

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime getThoiGianKetThuc();

    Integer getSoKhach();

    Integer getSoKhachToiDaQuyDinh();

    BigDecimal getGiaVe();

    BigDecimal getDoanhThuChuyen();

    String getTrangThai();

    Integer getMaTuyen();

    Integer getMaLaiXe();

    Integer getMaPhuXe();
}
