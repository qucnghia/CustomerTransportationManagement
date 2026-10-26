package in.nqn.backend.dto.response;

import java.time.LocalDate;

// Projection đọc từ các View v_XeBaoDuongChiTiet / v_XeQuaHanBaoDuong / v_XeAnToan
public interface BaoDuongXeResponse {

    String getBienSo();

    String getHangSanXuat();

    String getModel();

    Integer getSoGhe();

    LocalDate getNgayBaoDuongCuoi();

    Double getTongKmQuyDoi();

    Integer getSoNgayBiTru();

    Integer getChuKyThucTeNgay();

    LocalDate getNgayBaoDuongTiepTheo();

    Integer getSoNgayConLai();

    String getTrangThaiBaoDuong();
}
