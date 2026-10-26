package in.nqn.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Entity
@Table(name = "TAI_XE")
public class TaiXe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaTaiXe")
    private Integer id;

    @NotNull(message = "Họ tên tài xế không được để trống!")
    private String hoTen;

    @NotNull(message = "Căn cước công dân không được để trống!")
    private String cccd;

    @NotNull(message = "Mã số bằng lái không được để trống!")
    private String maSoBangLai;

    @NotNull(message = "Loại bằng lái không được để trống!")
    private String loaiBangLai;

    @NotNull(message = "Địa chỉ không được để trống!")
    private String diaChi;

    @JsonFormat(pattern = "dd/MM/yyyy")
    @NotNull(message = "Ngày sinh không được để trống!")
    private LocalDate ngaySinh;

    @NotNull(message = "Thâm niên không được để trống!")
    @Min(value = 0,message = "Thâm niên phải lớn hơn hoặc bằng 0!")
    private int thamNien;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

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
