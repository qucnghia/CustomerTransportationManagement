package in.nqn.backend.service;

import in.nqn.backend.dto.request.ChuyenXeRequest;
import in.nqn.backend.dto.response.ChuyenXeResponse;
import in.nqn.backend.entity.ChuyenXe;
import in.nqn.backend.entity.Xe;
import in.nqn.backend.exception.ResourceNotFoundException;
import in.nqn.backend.repository.ChuyenXeRepository;
import in.nqn.backend.repository.TaiXeRepository;
import in.nqn.backend.repository.TuyenXeRepository;
import in.nqn.backend.repository.XeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Service
public class ChuyenXeService {

    private static final Set<String> TRANG_THAI_HOP_LE = Set.of("DaLenLich", "DangChay", "HoanThanh", "Huy");
    // Tiến trình một chiều của chuyến xe, không được lùi lại
    private static final List<String> TIEN_TRINH = List.of("DaLenLich", "DangChay", "HoanThanh");
    private static final String HOAN_THANH = "HoanThanh";
    private static final String DA_LEN_LICH = "DaLenLich";
    private static final String HUY = "Huy";

    private final ChuyenXeRepository chuyenXeRepository;
    private final XeRepository xeRepository;
    private final TaiXeRepository taiXeRepository;
    private final TuyenXeRepository tuyenXeRepository;

    public ChuyenXeService(ChuyenXeRepository chuyenXeRepository,
                           XeRepository xeRepository,
                           TaiXeRepository taiXeRepository,
                           TuyenXeRepository tuyenXeRepository) {
        this.chuyenXeRepository = chuyenXeRepository;
        this.xeRepository = xeRepository;
        this.taiXeRepository = taiXeRepository;
        this.tuyenXeRepository = tuyenXeRepository;
    }

    public ChuyenXe createChuyenXe(ChuyenXeRequest request) {
        ChuyenXe chuyenXe = new ChuyenXe();
        chuyenXe.setTrangThai("DaLenLich");
        return chuyenXeRepository.save(applyRequest(chuyenXe, request));
    }

    public List<ChuyenXe> getAllChuyenXe() {
        return chuyenXeRepository.findAll();
    }

    public List<ChuyenXeResponse> getDanhSachChuyenXeChiTiet() {
        return chuyenXeRepository.getDanhSachChuyenXeChiTiet();
    }

    public ChuyenXe getChuyenXeById(Integer id) {
        return chuyenXeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chuyến xe với mã " + id + " không tồn tại!"));
    }

    public ChuyenXe updateChuyenXe(Integer id, ChuyenXeRequest request) {
        ChuyenXe existing = getChuyenXeById(id);
        if (HOAN_THANH.equals(existing.getTrangThai())) {
            throw new IllegalArgumentException("Chuyến xe #" + id + " đã hoàn thành, không được phép sửa!");
        }
        if (HUY.equals(existing.getTrangThai())) {
            throw new IllegalArgumentException("Chuyến xe #" + id + " đã bị hủy, không được phép sửa!");
        }
        int hienTai = TIEN_TRINH.indexOf(existing.getTrangThai());
        int moi = TIEN_TRINH.indexOf(request.getTrangThai());
        if (moi >= 0 && moi < hienTai) {
            throw new IllegalArgumentException("Không được chuyển trạng thái chuyến xe ngược lại!");
        }
        return chuyenXeRepository.save(applyRequest(existing, request));
    }

    // Hủy chuyến chưa khởi hành: giữ lại bản ghi, trạng thái Huy làm doanh thu, lương, km quy đổi
    // và kiểm tra trùng lịch đều bỏ qua chuyến này (xem các view/thủ tục trong 04_views_and_procedures.sql)
    public ChuyenXe huyChuyenXe(Integer id) {
        ChuyenXe chuyenXe = getChuyenXeById(id);
        if (!DA_LEN_LICH.equals(chuyenXe.getTrangThai())) {
            throw new IllegalArgumentException("Chỉ hủy được chuyến xe đang ở trạng thái Sắp khởi hành!");
        }
        chuyenXe.setTrangThai(HUY);
        return chuyenXeRepository.save(chuyenXe);
    }

    // Chuyển chuyến xe sang bước kế tiếp: Đã lên lịch -> Đang chạy -> Hoàn thành
    public ChuyenXe chuyenTrangThaiTiepTheo(Integer id) {
        ChuyenXe chuyenXe = getChuyenXeById(id);
        int hienTai = TIEN_TRINH.indexOf(chuyenXe.getTrangThai());
        if (hienTai < 0 || hienTai == TIEN_TRINH.size() - 1) {
            throw new IllegalArgumentException("Chuyến xe #" + id + " không thể chuyển sang trạng thái tiếp theo!");
        }
        chuyenXe.setTrangThai(TIEN_TRINH.get(hienTai + 1));
        return chuyenXeRepository.save(chuyenXe);
    }

    // Kiểm tra các ràng buộc nghiệp vụ cốt lõi rồi gán dữ liệu từ request vào entity
    // (trùng lịch xe / nhân sự do trigger trong CSDL kiểm tra)
    private ChuyenXe applyRequest(ChuyenXe chuyenXe, ChuyenXeRequest request) {
        if (!request.getThoiGianKetThuc().isAfter(request.getThoiGianKhoiHanh())) {
            throw new IllegalArgumentException("Thời gian kết thúc chuyến xe phải sau thời gian khởi hành!");
        }
        if (request.getMaLaiXe().equals(request.getMaPhuXe())) {
            throw new IllegalArgumentException("Lái xe chính và Phụ xe không được là cùng một người!");
        }
        if (request.getTrangThai() != null && !TRANG_THAI_HOP_LE.contains(request.getTrangThai())) {
            throw new IllegalArgumentException("Trạng thái chuyến xe không hợp lệ: " + request.getTrangThai());
        }

        Xe xe = xeRepository.findById(request.getBienSoXe())
                .orElseThrow(() -> new ResourceNotFoundException("Xe với biển số " + request.getBienSoXe() + " không tồn tại!"));
        int soKhach = request.getSoKhach() != null ? request.getSoKhach() : 0;
        int soKhachToiDa = xe.getSoGhe() - 2;
        if (soKhach > soKhachToiDa) {
            throw new IllegalArgumentException("Số khách (" + soKhach
                    + ") vượt quá sức chứa cho phép của xe (tối đa " + soKhachToiDa + " khách, trừ 2 ghế cho tổ lái)!");
        }

        chuyenXe.setXe(xe);
        chuyenXe.setTuyenxe(tuyenXeRepository.findById(request.getMaTuyen())
                .orElseThrow(() -> new ResourceNotFoundException("Tuyến xe với mã " + request.getMaTuyen() + " không tồn tại!")));
        chuyenXe.setLaiXe(taiXeRepository.findById(request.getMaLaiXe())
                .orElseThrow(() -> new ResourceNotFoundException("Lái xe chính với mã " + request.getMaLaiXe() + " không tồn tại!")));
        chuyenXe.setPhuXe(taiXeRepository.findById(request.getMaPhuXe())
                .orElseThrow(() -> new ResourceNotFoundException("Phụ xe với mã " + request.getMaPhuXe() + " không tồn tại!")));
        chuyenXe.setThoiGianKhoiHanh(request.getThoiGianKhoiHanh());
        chuyenXe.setThoiGianKetThuc(request.getThoiGianKetThuc());
        chuyenXe.setSoKhach(soKhach);
        chuyenXe.setGiaVe(request.getGiaVe() != null ? request.getGiaVe() : BigDecimal.ZERO);
        if (request.getTrangThai() != null) {
            chuyenXe.setTrangThai(request.getTrangThai());
        }
        return chuyenXe;
    }
}
