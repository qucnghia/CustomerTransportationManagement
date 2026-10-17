package in.nqn.backend.dto.response;

import java.time.LocalDate;

public class BaoDuongXeResponse {

    private String bienSo;

    private String hangSanXuat;

    private String model;

    private int soGhe;

    private LocalDate ngayBaoDuongCuoi;

    private int tongKmQuyDoi;

    private int soNgayBiTru;

    private int chuKyThucTeNgay;

    private LocalDate ngayBaoDuongTiepTheo;

    private int soNgayConLai;

    private String trangThaiBaoDuong;

    public String getBienSo() {
        return bienSo;
    }

    public void setBienSo(String bienSo) {
        this.bienSo = bienSo;
    }

    public String getHangSanXuat() {
        return hangSanXuat;
    }

    public void setHangSanXuat(String hangSanXuat) {
        this.hangSanXuat = hangSanXuat;
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

    public LocalDate getNgayBaoDuongCuoi() {
        return ngayBaoDuongCuoi;
    }

    public void setNgayBaoDuongCuoi(LocalDate ngayBaoDuongCuoi) {
        this.ngayBaoDuongCuoi = ngayBaoDuongCuoi;
    }

    public int getTongKmQuyDoi() {
        return tongKmQuyDoi;
    }

    public void setTongKmQuyDoi(int tongKmQuyDoi) {
        this.tongKmQuyDoi = tongKmQuyDoi;
    }

    public int getSoNgayBiTru() {
        return soNgayBiTru;
    }

    public void setSoNgayBiTru(int soNgayBiTru) {
        this.soNgayBiTru = soNgayBiTru;
    }

    public int getChuKyThucTeNgay() {
        return chuKyThucTeNgay;
    }

    public void setChuKyThucTeNgay(int chuKyThucTeNgay) {
        this.chuKyThucTeNgay = chuKyThucTeNgay;
    }

    public LocalDate getNgayBaoDuongTiepTheo() {
        return ngayBaoDuongTiepTheo;
    }

    public void setNgayBaoDuongTiepTheo(LocalDate ngayBaoDuongTiepTheo) {
        this.ngayBaoDuongTiepTheo = ngayBaoDuongTiepTheo;
    }

    public int getSoNgayConLai() {
        return soNgayConLai;
    }

    public void setSoNgayConLai(int soNgayConLai) {
        this.soNgayConLai = soNgayConLai;
    }

    public String getTrangThaiBaoDuong() {
        return trangThaiBaoDuong;
    }

    public void setTrangThaiBaoDuong(String trangThaiBaoDuong) {
        this.trangThaiBaoDuong = trangThaiBaoDuong;
    }
}
