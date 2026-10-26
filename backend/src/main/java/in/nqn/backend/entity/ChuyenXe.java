package in.nqn.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "CHUYEN_XE")
public class ChuyenXe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaChuyen")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "MaTuyen",nullable = false)
    private TuyenXe tuyenxe;

    @ManyToOne
    @JoinColumn(name = "BienSoXe",nullable = false)
    private Xe xe;

    @ManyToOne
    @JoinColumn(name = "MaLaiXe",nullable = false)
    private TaiXe laiXe;

    @ManyToOne
    @JoinColumn(name = "MaPhuXe",nullable = false)
    private TaiXe phuXe;

    private LocalDateTime thoiGianKhoiHanh;

    private LocalDateTime thoiGianKetThuc;

    private Integer soKhach;

    private BigDecimal giaVe;

    private String trangThai;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public TuyenXe getTuyenxe() {
        return tuyenxe;
    }

    public void setTuyenxe(TuyenXe tuyenxe) {
        this.tuyenxe = tuyenxe;
    }

    public Xe getXe() {
        return xe;
    }

    public void setXe(Xe xe) {
        this.xe = xe;
    }

    public TaiXe getLaiXe() {
        return laiXe;
    }

    public void setLaiXe(TaiXe laiXe) {
        this.laiXe = laiXe;
    }

    public TaiXe getPhuXe() {
        return phuXe;
    }

    public void setPhuXe(TaiXe phuXe) {
        this.phuXe = phuXe;
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
