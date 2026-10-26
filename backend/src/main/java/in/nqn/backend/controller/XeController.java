package in.nqn.backend.controller;

import in.nqn.backend.dto.request.XeRequest;
import in.nqn.backend.dto.response.ApiResponse;
import in.nqn.backend.dto.response.DoanhThuXeResponse;
import in.nqn.backend.entity.Xe;
import in.nqn.backend.service.XeService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class XeController {

    private final XeService xeService;

    public XeController(XeService xeService) {
        this.xeService = xeService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Xe>> addNewXe(@Valid @RequestBody XeRequest xe) {
        Xe newXe = xeService.createNewXe(xe);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(newXe, "Thêm phương tiện mới thành công!"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Xe>>> getAllXe() {
        List<Xe> listXe = xeService.getAllXe();
        return ResponseEntity.ok(ApiResponse.success(listXe, "Lấy danh sách xe thành công!"));
    }

    // TRUY VẤN 2 BÀI TẬP LỚN: Thống kê doanh thu theo xe theo khoảng thời gian
    // Ví dụ: GET /api/vehicles/revenues?tuNgay=2026-09-01&denNgay=2026-10-31 (mặc định: tháng hiện tại)
    @GetMapping("/revenues")
    public ResponseEntity<ApiResponse<List<DoanhThuXeResponse>>> getBaoCaoDoanhThuTheoXe(
            @RequestParam(name = "tuNgay", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(name = "denNgay", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay) {
        LocalDate today = LocalDate.now();
        if (tuNgay == null) tuNgay = today.withDayOfMonth(1);
        if (denNgay == null) denNgay = today.withDayOfMonth(today.lengthOfMonth());
        List<DoanhThuXeResponse> result = xeService.getBaoCaoDoanhThuTheoXe(tuNgay, denNgay);
        return ResponseEntity.ok(ApiResponse.success(result,
                "Lấy báo cáo doanh thu theo xe từ " + tuNgay + " đến " + denNgay + " thành công!"));
    }

    @GetMapping("/{bienSoXe}")
    public ResponseEntity<ApiResponse<Xe>> getXe(@PathVariable String bienSoXe) {
        Xe xe = xeService.getXeByBSX(bienSoXe);
        return ResponseEntity.ok(ApiResponse.success(xe, "Tìm thấy phương tiện!"));
    }

    @PutMapping("/{bienSoXe}")
    public ResponseEntity<ApiResponse<Xe>> updateXe(@PathVariable String bienSoXe,
                                                    @Valid @RequestBody XeRequest xe) {
        Xe xeNeedToUpdate = xeService.updateXe(bienSoXe, xe);
        return ResponseEntity.ok(ApiResponse.success(xeNeedToUpdate, "Cập nhật phương tiện thành công!"));
    }

    @DeleteMapping("/{bienSoXe}")
    public ResponseEntity<ApiResponse<Void>> deleteXe(@PathVariable String bienSoXe) {
        xeService.deleteXe(bienSoXe);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa phương tiện thành công!"));
    }
}
