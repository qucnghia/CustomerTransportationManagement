package in.nqn.backend.dto.response;

import java.math.BigDecimal;

// Projection đọc kết quả Stored Procedure sp_BaoCaoDoanhThuTheoXe
public interface DoanhThuXeResponse {

    String getBienSo();

    String getHangSanXuat();

    String getModel();

    Integer getSoGhe();

    Integer getTongSoChuyen();

    Integer getTongSoKhach();

    BigDecimal getTongDoanhThu();
}
