package in.nqn.backend.service;

import in.nqn.backend.dto.request.TaiXeRequest;
import in.nqn.backend.dto.response.LuongTaiXeResponse;
import in.nqn.backend.entity.TaiXe;
import in.nqn.backend.exception.DuplicateResourceException;
import in.nqn.backend.exception.ResourceNotFoundException;
import in.nqn.backend.repository.TaiXeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TaiXeService {
    private final TaiXeRepository taiXeRepository;

    public TaiXeService(TaiXeRepository taiXeRepository) {
        this.taiXeRepository = taiXeRepository;
    }

    public TaiXe createTaiXe(TaiXeRequest taiXe) {
        if (taiXeRepository.existsByCccd(taiXe.getCccd())) {
            throw duplicateCccd(taiXe.getCccd());
        }
        if (taiXeRepository.existsByMaSoBangLai(taiXe.getMaSoBangLai())) {
            throw duplicateBangLai(taiXe.getMaSoBangLai());
        }
        return taiXeRepository.save(applyRequest(new TaiXe(), taiXe));
    }

    public TaiXe updateTaiXe(Integer maTaiXe, TaiXeRequest taiXe) {
        TaiXe existing = getTaiXeById(maTaiXe);
        if (taiXeRepository.existsByCccdAndIdNot(taiXe.getCccd(), maTaiXe)) {
            throw duplicateCccd(taiXe.getCccd());
        }
        if (taiXeRepository.existsByMaSoBangLaiAndIdNot(taiXe.getMaSoBangLai(), maTaiXe)) {
            throw duplicateBangLai(taiXe.getMaSoBangLai());
        }
        return taiXeRepository.save(applyRequest(existing, taiXe));
    }

    // Tài xế đã có chuyến xe sẽ bị CSDL chặn xóa (FK ON DELETE RESTRICT) -> trả về 409
    public void deleteTaiXe(Integer maTaiXe) {
        if (!taiXeRepository.existsById(maTaiXe)) {
            throw new ResourceNotFoundException("Tài xế với mã tài xế " + maTaiXe + " không tồn tại!");
        }
        taiXeRepository.deleteById(maTaiXe);
    }

    public TaiXe getTaiXeById(Integer maTaiXe) {
        return taiXeRepository
                .findById(maTaiXe)
                .orElseThrow(() -> new ResourceNotFoundException
                        ("Tài xế với mã tài xế " + maTaiXe + " không tồn tại!"));
    }

    public List<TaiXe> getAllTaiXe() {
        return taiXeRepository.findAll();
    }

    // 1. Tính lương tài xế theo tháng & năm (Gọi Stored Procedure sp_TinhLuongTaiXeThang)
    public List<LuongTaiXeResponse> getLuongTaiXeTheoThang(int nam, int thang) {
        if (thang < 1 || thang > 12) {
            throw new IllegalArgumentException("Tháng phải nằm trong khoảng 1 - 12!");
        }
        return taiXeRepository.callSpTinhLuongTaiXeThang(nam, thang);
    }

    // Tính lương theo khoảng ngày (lương trả theo chuyến) để khớp kỳ với báo cáo doanh thu
    public List<LuongTaiXeResponse> getLuongTaiXeTheoKhoang(LocalDate tuNgay, LocalDate denNgay) {
        if (tuNgay.isAfter(denNgay)) {
            throw new IllegalArgumentException("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc!");
        }
        return taiXeRepository.callSpTinhLuongTheoKhoang(tuNgay, denNgay);
    }

    // 2. Lấy bảng lương tài xế tháng hiện tại (Đọc từ View v_BangLuongTaiXeHienTai)
    public List<LuongTaiXeResponse> getBangLuongTaiXeHienTai() {
        return taiXeRepository.getDanhSachBangLuongTaiXe();
    }

    private TaiXe applyRequest(TaiXe target, TaiXeRequest taiXe) {
        target.setHoTen(taiXe.getHoTen());
        target.setCccd(taiXe.getCccd());
        target.setMaSoBangLai(taiXe.getMaSoBangLai());
        target.setLoaiBangLai(taiXe.getLoaiBangLai());
        target.setDiaChi(taiXe.getDiaChi());
        target.setNgaySinh(taiXe.getNgaySinh());
        target.setThamNien(taiXe.getThamNien());
        return target;
    }

    private DuplicateResourceException duplicateCccd(String cccd) {
        return new DuplicateResourceException("Tài xế với căn cước công dân "
                + cccd + " đã tồn tại! Vui lòng nhập lại!");
    }

    private DuplicateResourceException duplicateBangLai(String maSoBangLai) {
        return new DuplicateResourceException("Tài xế với mã số bằng lái "
                + maSoBangLai + " đã tồn tại! Vui lòng nhập lại!");
    }
}
