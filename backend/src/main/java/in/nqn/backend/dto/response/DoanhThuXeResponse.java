package in.nqn.backend.dto.response;

public class DoanhThuXeResponse {

    private String bienSo;

    private String hangSanXuat;

    private String model;

    private int soGhe;

    private int tongSoChuyen;

    private int tongSoKhach;

    private int tongDoanhThu;

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

    public int getTongSoChuyen() {
        return tongSoChuyen;
    }

    public void setTongSoChuyen(int tongSoChuyen) {
        this.tongSoChuyen = tongSoChuyen;
    }

    public int getTongSoKhach() {
        return tongSoKhach;
    }

    public void setTongSoKhach(int tongSoKhach) {
        this.tongSoKhach = tongSoKhach;
    }

    public int getTongDoanhThu() {
        return tongDoanhThu;
    }

    public void setTongDoanhThu(int tongDoanhThu) {
        this.tongDoanhThu = tongDoanhThu;
    }
}
