package in.nqn.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public class TaiXeRequest {

    @NotBlank(message = "Họ tên tài xế không được để trống!")
    private String hoTen;

    @NotBlank(message = "Căn cước công dân không được để trống!")
    private String cccd;

    @NotBlank(message = "Mã số bằng lái không được để trống!")
    private String maSoBangLai;

    @NotBlank(message = "Loại bằng lái không được để trống!")
    @Pattern(regexp = "D|E|FC|FD", message = "Loại bằng lái chỉ được là D, E, FC hoặc FD!")
    private String loaiBangLai;

    @NotBlank(message = "Địa chỉ không được để trống!")
    private String diaChi;

    @JsonFormat(pattern = "dd/MM/yyyy")
    @NotNull(message = "Ngày sinh không được để trống!")
    private LocalDate ngaySinh;

    @NotNull(message = "Thâm niên không được để trống!")
    @Min(value = 0, message = "Thâm niên phải lớn hơn hoặc bằng 0!")
    private int thamNien;

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public String getCccd() {
        return cccd;
    }

    public void setCccd(String cccd) {
        this.cccd = cccd;
    }

    public String getMaSoBangLai() {
        return maSoBangLai;
    }

    public void setMaSoBangLai(String maSoBangLai) {
        this.maSoBangLai = maSoBangLai;
    }

    public String getLoaiBangLai() {
        return loaiBangLai;
    }

    public void setLoaiBangLai(String loaiBangLai) {
        this.loaiBangLai = loaiBangLai;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }

    public LocalDate getNgaySinh() {
        return ngaySinh;
    }

    public void setNgaySinh(LocalDate ngaySinh) {
        this.ngaySinh = ngaySinh;
    }

    public int getThamNien() {
        return thamNien;
    }

    public void setThamNien(int thamNien) {
        this.thamNien = thamNien;
    }
}
