package in.nqn.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class XeRequest {

    @NotNull(message = "Màu xe không được để trống")
    private String mauxe;

    @NotNull(message = "Hãng sản xuất không được để trống")
    private String hangSanXuat;

    @NotNull(message = "Đời xe không được để trống")
    @Min(value = 1990,message = "Đời xe phải từ năm 1990 trở đi")
    private int doiXe;

    @NotNull(message = "Model xe không được để trống")
    private String model;

    @NotNull(message = "Số ghế không được để trống")
    @Min(value = 16,message = "Số ghế phải lớn hơn hoặc bằng 16")
    private int soGhe;

    @NotNull(message = "Số năm sử dụng không được để trống")
    @Min(value = 0,message = "Số năm sử dụng phải lớn hơn 0")
    private int soNamSuDung;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate NgayBaoDuongCuoi;

    public String getMauxe() {
        return mauxe;
    }

    public void setMauxe(String mauxe) {
        this.mauxe = mauxe;
    }

    public String getHangSanXuat() {
        return hangSanXuat;
    }

    public void setHangSanXuat(String hangSanXuat) {
        this.hangSanXuat = hangSanXuat;
    }

    public int getDoiXe() {
        return doiXe;
    }

    public void setDoiXe(int doiXe) {
        this.doiXe = doiXe;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public int getSoGhe() {
        return soGhe;
    }

    public void setSoGhe(int soGhe) {
        this.soGhe = soGhe;
    }

    public int getSoNamSuDung() {
        return soNamSuDung;
    }

    public void setSoNamSuDung(int soNamSuDung) {
        this.soNamSuDung = soNamSuDung;
    }

    public LocalDate getNgayBaoDuongCuoi() {
        return NgayBaoDuongCuoi;
    }

    public void setNgayBaoDuongCuoi(LocalDate ngayBaoDuongCuoi) {
        NgayBaoDuongCuoi = ngayBaoDuongCuoi;
    }
}
