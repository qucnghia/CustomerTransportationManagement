package in.nqn.backend.controller;

import in.nqn.backend.dto.request.TuyenXeRequest;
import in.nqn.backend.dto.response.ApiResponse;
import in.nqn.backend.entity.TuyenXe;
import in.nqn.backend.service.TuyenXeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class TuyenXeController {

    private final TuyenXeService tuyenXeService;

    public TuyenXeController(TuyenXeService tuyenXeService) {
        this.tuyenXeService = tuyenXeService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TuyenXe>> createTuyenXe(@Valid @RequestBody TuyenXeRequest request) {
        TuyenXe created = tuyenXeService.createTuyenXe(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Thêm tuyến xe mới thành công!"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TuyenXe>>> getAllTuyenXe() {
        List<TuyenXe> list = tuyenXeService.getAllTuyenXe();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách tuyến xe thành công!"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TuyenXe>> getTuyenXeById(@PathVariable Integer id) {
        TuyenXe tuyenXe = tuyenXeService.getTuyenXeById(id);
        return ResponseEntity.ok(ApiResponse.success(tuyenXe, "Tìm thấy thông tin tuyến xe!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TuyenXe>> updateTuyenXe(@PathVariable Integer id,
                                                              @Valid @RequestBody TuyenXeRequest request) {
        TuyenXe updated = tuyenXeService.updateTuyenXe(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật tuyến xe thành công!"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTuyenXe(@PathVariable Integer id) {
        tuyenXeService.deleteTuyenXe(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa tuyến xe thành công!"));
    }
}
