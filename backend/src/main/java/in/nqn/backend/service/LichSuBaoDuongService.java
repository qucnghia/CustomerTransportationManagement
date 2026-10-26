package in.nqn.backend.service;

import in.nqn.backend.dto.request.BaoDuongRequest;
import in.nqn.backend.dto.response.BaoDuongXeResponse;
import in.nqn.backend.entity.LichSuBaoDuong;
import in.nqn.backend.entity.Xe;
import in.nqn.backend.exception.ResourceNotFoundException;
import in.nqn.backend.repository.LichSuBaoDuongRepository;
import in.nqn.backend.repository.XeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class LichSuBaoDuongService {

    private final LichSuBaoDuongRepository lichSuBaoDuongRepository;
    private final XeRepository xeRepository;

    public LichSuBaoDuongService(LichSuBaoDuongRepository lichSuBaoDuongRepository,
                                 XeRepository xeRepository) {
        this.lichSuBaoDuongRepository = lichSuBaoDuongRepository;
        this.xeRepository = xeRepository;
    }

    // Ngày bảo dưỡng cuối của xe do trigger trg_after_insert_bao_duong tự cập nhật
    @Transactional
    public LichSuBaoDuong createBaoDuong(BaoDuongRequest request) {
        Xe xe = xeRepository.findById(request.getBienSoXe())
                .orElseThrow(() -> new ResourceNotFoundException("Xe với biển số " + request.getBienSoXe() + " không tồn tại!"));

        LichSuBaoDuong ls = new LichSuBaoDuong();
        ls.setXe(xe);
        ls.setNgayBaoDuong(request.getNgayBaoDuong());
        ls.setChiPhi(request.getChiPhi() != null ? request.getChiPhi() : BigDecimal.ZERO);
        ls.setNoiDung(request.getNoiDung());
        return lichSuBaoDuongRepository.save(ls);
    }

    public List<LichSuBaoDuong> getAllBaoDuong() {
        return lichSuBaoDuongRepository.findAll();
    }

    // 1. Xem trạng thái bảo dưỡng toàn bộ xe (từ View v_XeBaoDuongChiTiet)
    public List<BaoDuongXeResponse> getDanhSachXeBaoDuong() {
        return lichSuBaoDuongRepository.getDanhSachXeBaoDuong();
    }

    // 2. Xem danh sách riêng các xe QUÁ HẠN bảo dưỡng (Truy vấn 3 - View v_XeQuaHanBaoDuong)
    public List<BaoDuongXeResponse> getDanhSachXeQuaHan() {
        return lichSuBaoDuongRepository.getDanhSachXeQuaHan();
    }

    // 3. Xem danh sách các xe AN TOÀN (View v_XeAnToan)
    public List<BaoDuongXeResponse> getDanhSachXeAnToan() {
        return lichSuBaoDuongRepository.getDanhSachXeAnToan();
    }
}
