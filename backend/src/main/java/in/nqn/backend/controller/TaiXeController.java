package in.nqn.backend.controller;

import in.nqn.backend.dto.request.TaiXeRequest;
import in.nqn.backend.dto.response.ApiResponse;
import in.nqn.backend.dto.response.LuongTaiXeResponse;
import in.nqn.backend.entity.TaiXe;
import in.nqn.backend.service.TaiXeService;
import jakarta.validation.Valid;
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

    // Mặc định: tháng hiện tại
    @GetMapping("/salaries")
    public ResponseEntity<ApiResponse<List<LuongTaiXeResponse>>> getLuongTaiXeTheoThang(
            @RequestParam(name = "nam", required = false) Integer nam,
            @RequestParam(name = "thang", required = false) Integer thang) {
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
