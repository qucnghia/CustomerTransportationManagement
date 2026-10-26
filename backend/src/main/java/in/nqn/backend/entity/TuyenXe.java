package in.nqn.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "TUYEN_XE")
public class TuyenXe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaTuyen")
    private Integer id;

    private String diemDau;

    private String diemCuoi;

    private BigDecimal doDaiKm;

    private Integer doPhucTap;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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
