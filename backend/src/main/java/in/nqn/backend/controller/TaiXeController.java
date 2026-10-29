package in.nqn.backend.controller;

import in.nqn.backend.dto.request.TaiXeRequest;
import in.nqn.backend.dto.response.ApiResponse;
import in.nqn.backend.dto.response.LuongTaiXeResponse;
import in.nqn.backend.entity.TaiXe;
import in.nqn.backend.service.TaiXeService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class TaiXeController {

    private final TaiXeService taiXeService;

    public TaiXeController(TaiXeService taiXeService) {
        this.taiXeService = taiXeService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaiXe>> createTaiXe(@Valid @RequestBody TaiXeRequest taiXe) {
        TaiXe newTaiXe = taiXeService.createTaiXe(taiXe);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(newTaiXe, "Thêm tài xế mới thành công!"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaiXe>>> getAllTaiXe() {
        return ResponseEntity.ok(ApiResponse.success(taiXeService.getAllTaiXe(), "Lấy danh sách tài xế thành công!"));
    }

    // Theo khoảng ngày khi có tuNgay & denNgay (vd ?tuNgay=2026-10-01&denNgay=2026-10-15),
    // ngược lại theo tháng (?nam=&thang=, mặc định tháng hiện tại)
    @GetMapping("/salaries")
    public ResponseEntity<ApiResponse<List<LuongTaiXeResponse>>> getLuongTaiXeTheoThang(
            @RequestParam(name = "nam", required = false) Integer nam,
            @RequestParam(name = "thang", required = false) Integer thang,
            @RequestParam(name = "tuNgay", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(name = "denNgay", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        if (tuNgay != null && denNgay != null) {
            return ResponseEntity.ok(ApiResponse.success(taiXeService.getLuongTaiXeTheoKhoang(tuNgay, denNgay),
                    "Lấy bảng lương tài xế từ " + tuNgay + " đến " + denNgay + " thành công!"));
        }
        LocalDate today = LocalDate.now();
        int y = nam != null ? nam : today.getYear();
        int m = thang != null ? thang : today.getMonthValue();
        List<LuongTaiXeResponse> result = taiXeService.getLuongTaiXeTheoThang(y, m);
        return ResponseEntity.ok(ApiResponse.success(result,
                "Lấy bảng lương tài xế tháng " + m + "/" + y + " thành công!"));
    }

    @GetMapping("/salaries/current")
    public ResponseEntity<ApiResponse<List<LuongTaiXeResponse>>> getBangLuongTaiXeHienTai() {
        List<LuongTaiXeResponse> result = taiXeService.getBangLuongTaiXeHienTai();
        return ResponseEntity.ok(ApiResponse.success(result,
                "Lấy bảng lương tài xế tháng hiện tại thành công!"));
    }

    @GetMapping("/{maTaiXe}")
    public ResponseEntity<ApiResponse<TaiXe>> getTaiXe(@PathVariable Integer maTaiXe) {
        return ResponseEntity.ok(ApiResponse.success(taiXeService.getTaiXeById(maTaiXe), "Tìm thấy tài xế!"));
    }

    @PutMapping("/{maTaiXe}")
    public ResponseEntity<ApiResponse<TaiXe>> updateTaiXe(@PathVariable Integer maTaiXe,
                                                          @Valid @RequestBody TaiXeRequest taiXe) {
        TaiXe updated = taiXeService.updateTaiXe(maTaiXe, taiXe);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật tài xế thành công!"));
    }

    @DeleteMapping("/{maTaiXe}")
    public ResponseEntity<ApiResponse<Void>> deleteTaiXe(@PathVariable Integer maTaiXe) {
        taiXeService.deleteTaiXe(maTaiXe);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa tài xế thành công!"));
    }
}
