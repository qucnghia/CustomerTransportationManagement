package in.nqn.backend.dto.response;

import java.math.BigDecimal;

// Projection đọc kết quả sp_TinhLuongTaiXeThang / View v_BangLuongTaiXeHienTai
public interface LuongTaiXeResponse {

    Integer getMaTaiXe();

    String getHoTen();

    String getLoaiBangLai();

    Integer getThamNien();

    Integer getSoChuyenLaiChinh();

    Integer getSoChuyenPhuXe();

    Integer getTongSoChuyen();

    BigDecimal getTongLuongThang();
}
