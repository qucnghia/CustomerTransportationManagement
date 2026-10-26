package in.nqn.backend.service;

import in.nqn.backend.dto.request.XeRequest;
import in.nqn.backend.dto.response.DoanhThuXeResponse;
import in.nqn.backend.entity.Xe;
import in.nqn.backend.exception.DuplicateResourceException;
import in.nqn.backend.exception.ResourceNotFoundException;
import in.nqn.backend.repository.XeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class XeService {

    private final XeRepository xeRepository;

    public XeService(XeRepository xeRepository) {
        this.xeRepository = xeRepository;
    }

    public Xe createNewXe(XeRequest xe) {
        if (xe.getBienSo() == null || xe.getBienSo().isBlank()) {
            throw new IllegalArgumentException("Biển số xe không được để trống");
        }
        String bienSo = xe.getBienSo().trim();
        if (xeRepository.existsById(bienSo)) {
            throw new DuplicateResourceException("Biển số xe " +
                    bienSo + " đã tồn tại! Vui lòng tạo biển số xe khác!");
        }
        Xe newXe = new Xe();
        newXe.setBienSo(bienSo);
        // Xe mới chưa có lịch sử bảo dưỡng thì tính chu kỳ từ ngày nhập hệ thống
        newXe.setNgayBaoDuongCuoi(LocalDate.now());
        return xeRepository.save(applyRequest(newXe, xe));
    }

    public Xe getXeByBSX(String bienSo) {
        return xeRepository
                .findById(bienSo)
                .orElseThrow(() -> new ResourceNotFoundException("Biển số xe "
                        + bienSo + " không tồn tại! Vui lòng nhập biển số xe khác!"));
    }

    public List<Xe> getAllXe() {
        return xeRepository.findAll();
    }

    public Xe updateXe(String bienSo, XeRequest xe) {
        return xeRepository.save(applyRequest(getXeByBSX(bienSo), xe));
    }

    // Xe đã có chuyến xe sẽ bị CSDL chặn xóa (FK ON DELETE RESTRICT) -> trả về 409
    public void deleteXe(String bienSo) {
        if (!xeRepository.existsById(bienSo)) {
            throw new ResourceNotFoundException("Biển số xe " + bienSo + " không tồn tại! Không thể xóa.");
        }
        xeRepository.deleteById(bienSo);
    }

    // TRUY VẤN 2 BÀI TẬP LỚN: Thống kê doanh thu theo xe trong khoảng thời gian (Gọi sp_BaoCaoDoanhThuTheoXe)
    public List<DoanhThuXeResponse> getBaoCaoDoanhThuTheoXe(LocalDate tuNgay, LocalDate denNgay) {
        if (tuNgay.isAfter(denNgay)) {
            throw new IllegalArgumentException("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc!");
        }
        return xeRepository.callSpBaoCaoDoanhThuTheoXe(tuNgay, denNgay);
    }

    // Không gửi ngày bảo dưỡng cuối thì giữ nguyên giá trị hiện có
    private Xe applyRequest(Xe target, XeRequest xe) {
        target.setMauxe(xe.getMauxe());
        target.setHangSanXuat(xe.getHangSanXuat());
        target.setDoiXe(xe.getDoiXe());
        target.setModel(xe.getModel());
        target.setSoGhe(xe.getSoGhe());
        target.setSoNamSuDung(xe.getSoNamSuDung());
        if (xe.getNgayBaoDuongCuoi() != null) {
            target.setNgayBaoDuongCuoi(xe.getNgayBaoDuongCuoi());
        }
        return target;
    }
}
