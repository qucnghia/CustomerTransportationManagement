package in.nqn.backend.controller;

import in.nqn.backend.dto.request.ChuyenXeRequest;
import in.nqn.backend.dto.response.ApiResponse;
import in.nqn.backend.dto.response.ChuyenXeResponse;
import in.nqn.backend.entity.ChuyenXe;
import in.nqn.backend.service.ChuyenXeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class ChuyenXeController {

    private final ChuyenXeService chuyenXeService;

    public ChuyenXeController(ChuyenXeService chuyenXeService) {
        this.chuyenXeService = chuyenXeService;
    }

    // 1. Tạo chuyến xe mới (Có validate chặt chẽ: số khách <= số ghế - 2, lái xe != phụ xe)
    @PostMapping
    public ResponseEntity<ApiResponse<ChuyenXe>> createChuyenXe(@Valid @RequestBody ChuyenXeRequest request) {
        ChuyenXe created = chuyenXeService.createChuyenXe(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Điều phối chuyến xe mới thành công!"));
    }

    // 2. Lấy danh sách chuyến xe đầy đủ thông tin (kèm tên tuyến, tên tài xế, doanh thu)
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChuyenXeResponse>>> getAllTrips() {
        List<ChuyenXeResponse> list = chuyenXeService.getDanhSachChuyenXeChiTiet();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách chuyến xe thành công!"));
    }

    // 3. Lấy chi tiết chuyến xe theo mã
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChuyenXe>> getTripById(@PathVariable Integer id) {
        ChuyenXe chuyenXe = chuyenXeService.getChuyenXeById(id);
        return ResponseEntity.ok(ApiResponse.success(chuyenXe, "Tìm thấy thông tin chuyến xe!"));
    }

    // 4. Cập nhật chuyến xe
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ChuyenXe>> updateTrip(@PathVariable Integer id,
                                                            @Valid @RequestBody ChuyenXeRequest request) {
        ChuyenXe updated = chuyenXeService.updateChuyenXe(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật chuyến xe thành công!"));
    }

    // Chuyển trạng thái một chiều: Đã lên lịch -> Đang chạy -> Hoàn thành
    @PutMapping("/{id}/next-status")
    public ResponseEntity<ApiResponse<ChuyenXe>> advanceTripStatus(@PathVariable Integer id) {
        ChuyenXe updated = chuyenXeService.chuyenTrangThaiTiepTheo(id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Đã chuyển chuyến xe #" + id + " sang trạng thái tiếp theo!"));
    }

    // Hủy chuyến sắp khởi hành (giữ lại thông tin chuyến, không tính doanh thu / lương / km)
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ChuyenXe>> cancelTrip(@PathVariable Integer id) {
        ChuyenXe cancelled = chuyenXeService.huyChuyenXe(id);
        return ResponseEntity.ok(ApiResponse.success(cancelled, "Đã hủy chuyến xe #" + id + "!"));
    }

    // Không có API xóa: lịch sử chuyến xe được giữ lại vĩnh viễn, muốn bỏ chuyến thì dùng /cancel
}
