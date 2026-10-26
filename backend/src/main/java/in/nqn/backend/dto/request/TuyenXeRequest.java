package in.nqn.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class TuyenXeRequest {

    @NotBlank(message = "Điểm đầu không được để trống!")
    private String diemDau;

    @NotBlank(message = "Điểm cuối không được để trống!")
    private String diemCuoi;

    @NotNull(message = "Độ dài km không được để trống!")
    @DecimalMin(value = "1.0", message = "Độ dài tuyến phải lớn hơn hoặc bằng 1 km!")
    private BigDecimal doDaiKm;

    @NotNull(message = "Độ phức tạp tuyến không được để trống!")
    @Min(value = 1, message = "Độ phức tạp chỉ từ 1 đến 3!")
    @Max(value = 3, message = "Độ phức tạp chỉ từ 1 đến 3!")
    private Integer doPhucTap;

    public TuyenXeRequest() {
    }

    public TuyenXeRequest(String diemDau, String diemCuoi, BigDecimal doDaiKm, Integer doPhucTap) {
        this.diemDau = diemDau;
        this.diemCuoi = diemCuoi;
        this.doDaiKm = doDaiKm;
        this.doPhucTap = doPhucTap;
    }

    public String getDiemDau() {
        return diemDau;
    }

    public void setDiemDau(String diemDau) {
        this.diemDau = diemDau;
    }

    public String getDiemCuoi() {
        return diemCuoi;
    }

    public void setDiemCuoi(String diemCuoi) {
        this.diemCuoi = diemCuoi;
    }

    public BigDecimal getDoDaiKm() {
        return doDaiKm;
    }

    public void setDoDaiKm(BigDecimal doDaiKm) {
        this.doDaiKm = doDaiKm;
    }

    public Integer getDoPhucTap() {
        return doPhucTap;
    }

    public void setDoPhucTap(Integer doPhucTap) {
        this.doPhucTap = doPhucTap;
    }
}
