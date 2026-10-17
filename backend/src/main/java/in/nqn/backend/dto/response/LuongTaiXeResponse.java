package in.nqn.backend.dto.response;

public class LuongTaiXeResponse {

    private Integer id;

    private String hoTen;

    private String loaiBangLai;

    private Integer thamNien;

    private Integer soChuyenLaiChinh;

    private Integer soChuyenPhuXe;

    private Integer tongSoChuyen;

    private Integer tongLuongThang;

    public Integer getSoChuyenLaiChinh() {
        return soChuyenLaiChinh;
    }

    public void setSoChuyenLaiChinh(Integer soChuyenLaiChinh) {
        this.soChuyenLaiChinh = soChuyenLaiChinh;
    }

    public Integer getSoChuyenPhuXe() {
        return soChuyenPhuXe;
    }

    public void setSoChuyenPhuXe(Integer soChuyenPhuXe) {
        this.soChuyenPhuXe = soChuyenPhuXe;
    }

    public Integer getTongSoChuyen() {
        return tongSoChuyen;
    }

    public void setTongSoChuyen(Integer tongSoChuyen) {
        this.tongSoChuyen = tongSoChuyen;
    }

    public Integer getTongLuongThang() {
        return tongLuongThang;
    }

    public void setTongLuongThang(Integer tongLuongThang) {
        this.tongLuongThang = tongLuongThang;
    }

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

    public String getLoaiBangLai() {
        return loaiBangLai;
    }

    public void setLoaiBangLai(String loaiBangLai) {
        this.loaiBangLai = loaiBangLai;
    }

    public Integer getThamNien() {
        return thamNien;
    }

    public void setThamNien(Integer thamNien) {
        this.thamNien = thamNien;
    }
}
