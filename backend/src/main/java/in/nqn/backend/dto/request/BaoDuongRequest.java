package in.nqn.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;


@Getter
@Setter
public class BaoDuongRequest {
    @NotNull(message = "Mã bảo dưỡng không được để trống")
    private Integer maBaoDuong;

    @NotNull(message = "Biển số xe không được để trống")
    private String bienSoXe;

    @NotNull(message = "Ngày bảo dưỡng không được để trống")
    private LocalDate ngayBaoDuong;

    @DecimalMin(value = "0.0",message = "Chi phí bảo dưỡng phải >= 0")
    private BigDecimal chiPhi;

    @NotNull(message = "Nội dung bảo dưỡng không được để trống")
    private String message;

    public Integer getMaBaoDuong() {
        return maBaoDuong;
    }

    public void setMaBaoDuong(Integer maBaoDuong) {
        this.maBaoDuong = maBaoDuong;
    }

    public String getBienSoXe() {
        return bienSoXe;
    }

    public void setBienSoXe(String bienSoXe) {
        this.bienSoXe = bienSoXe;
    }

    public LocalDate getNgayBaoDuong() {
        return ngayBaoDuong;
    }

    public void setNgayBaoDuong(LocalDate ngayBaoDuong) {
        this.ngayBaoDuong = ngayBaoDuong;
    }

    public BigDecimal getChiPhi() {
        return chiPhi;
    }

    public void setChiPhi(BigDecimal chiPhi) {
        this.chiPhi = chiPhi;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
