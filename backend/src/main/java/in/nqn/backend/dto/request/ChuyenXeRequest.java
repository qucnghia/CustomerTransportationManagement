package in.nqn.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ChuyenXeRequest {
    @NotNull(message = "Mã tuyến xe không được để trống")
    private Integer maTuyen;

    @NotNull(message = "Biển số xe không được để trống")
    private String bienSoXe;

    @NotNull(message = "Lái xe chính không được để trống")
    private Integer maLaiXe;

    @NotNull(message = "Phụ xe không được để trống")
    private Integer maPhuXe;

    @NotNull(message = "Thời gian khởi hành không được để trống")
    private LocalDateTime thoiGianKhoiHanh;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private  LocalDateTime thoiGianKetThuc;

    @Min(value = 0,message = "Số khách phải >= 0")
    private Integer soKhach;

    @DecimalMin(value = "0.0", message = "Giá vé phải >= 0")
    private BigDecimal giaVe;

    private String trangThai;

    public Integer getMaTuyen() {
        return maTuyen;
    }

    public void setMaTuyen(Integer maTuyen) {
        this.maTuyen = maTuyen;
    }

    public String getBienSoXe() {
        return bienSoXe;
    }

    public void setBienSoXe(String bienSoXe) {
        this.bienSoXe = bienSoXe;
    }

    public Integer getMaLaiXe() {
        return maLaiXe;
    }

    public void setMaLaiXe(Integer maLaiXe) {
        this.maLaiXe = maLaiXe;
    }

    public Integer getMaPhuXe() {
        return maPhuXe;
    }

    public void setMaPhuXe(Integer maPhuXe) {
        this.maPhuXe = maPhuXe;
    }

    public LocalDateTime getThoiGianKhoiHanh() {
        return thoiGianKhoiHanh;
    }

    public void setThoiGianKhoiHanh(LocalDateTime thoiGianKhoiHanh) {
        this.thoiGianKhoiHanh = thoiGianKhoiHanh;
    }

    public LocalDateTime getThoiGianKetThuc() {
        return thoiGianKetThuc;
    }

    public void setThoiGianKetThuc(LocalDateTime thoiGianKetThuc) {
        this.thoiGianKetThuc = thoiGianKetThuc;
    }

    public Integer getSoKhach() {
        return soKhach;
    }

    public void setSoKhach(Integer soKhach) {
        this.soKhach = soKhach;
    }

    public BigDecimal getGiaVe() {
        return giaVe;
    }

    public void setGiaVe(BigDecimal giaVe) {
        this.giaVe = giaVe;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}
