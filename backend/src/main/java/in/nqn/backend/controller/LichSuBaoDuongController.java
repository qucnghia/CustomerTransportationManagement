package in.nqn.backend.controller;

import in.nqn.backend.dto.request.BaoDuongRequest;
import in.nqn.backend.dto.response.ApiResponse;
import in.nqn.backend.dto.response.BaoDuongXeResponse;
import in.nqn.backend.entity.LichSuBaoDuong;
import in.nqn.backend.service.LichSuBaoDuongService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenances")
public class LichSuBaoDuongController {

    private final LichSuBaoDuongService lichSuBaoDuongService;

    public LichSuBaoDuongController(LichSuBaoDuongService lichSuBaoDuongService) {
        this.lichSuBaoDuongService = lichSuBaoDuongService;
    }

    // 1. Ghi nhận nhật ký bảo dưỡng xe mới
    @PostMapping
    public ResponseEntity<ApiResponse<LichSuBaoDuong>> createBaoDuong(@Valid @RequestBody BaoDuongRequest request) {
        LichSuBaoDuong created = lichSuBaoDuongService.createBaoDuong(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Thêm nhật ký bảo dưỡng thành công!"));
    }

    // 2. Lấy toàn bộ lịch sử bảo dưỡng
    @GetMapping
    public ResponseEntity<ApiResponse<List<LichSuBaoDuong>>> getAllBaoDuong() {
        List<LichSuBaoDuong> list = lichSuBaoDuongService.getAllBaoDuong();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy lịch sử bảo dưỡng thành công!"));
    }

    // 3. Xem chu kỳ & trạng thái bảo dưỡng của toàn bộ xe (từ View v_XeBaoDuongChiTiet)
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<BaoDuongXeResponse>>> getDanhSachXeBaoDuong() {
        List<BaoDuongXeResponse> list = lichSuBaoDuongService.getDanhSachXeBaoDuong();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy trạng thái chu kỳ bảo dưỡng xe thành công!"));
    }

    // 4. TRUY VẤN 3 BÀI TẬP LỚN: Danh sách các xe ĐÃ QUÁ HẠN bảo dưỡng (từ View v_XeQuaHanBaoDuong)
    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<BaoDuongXeResponse>>> getDanhSachXeQuaHan() {
        List<BaoDuongXeResponse> list = lichSuBaoDuongService.getDanhSachXeQuaHan();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách xe quá hạn bảo dưỡng thành công!"));
    }

    // 5. Danh sách các xe AN TOÀN bảo dưỡng (từ View v_XeAnToan)
    @GetMapping("/safe")
    public ResponseEntity<ApiResponse<List<BaoDuongXeResponse>>> getDanhSachXeAnToan() {
        List<BaoDuongXeResponse> list = lichSuBaoDuongService.getDanhSachXeAnToan();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách xe an toàn bảo dưỡng thành công!"));
    }
}
