package in.nqn.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "LICH_SU_BAO_DUONG")
public class LichSuBaoDuong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaBaoDuong")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "BienSoXe", nullable = false)
    private Xe xe;

    private LocalDate ngayBaoDuong;

    private BigDecimal chiPhi;

    private String noiDung;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Xe getXe() {
        return xe;
    }

    public void setXe(Xe xe) {
        this.xe = xe;
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

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }
}
