package in.nqn.backend;

import in.nqn.backend.controller.ChuyenXeController;
import in.nqn.backend.dto.response.ApiResponse;
import in.nqn.backend.dto.response.ChuyenXeResponse;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;

import java.util.List;

@SpringBootTest
class BackendApplicationTests {

    @Autowired
    private ChuyenXeController chuyenXeController;

    @Test
    void testGetTripsController() {
        ResponseEntity<ApiResponse<List<ChuyenXeResponse>>> response = chuyenXeController.getAllTrips();
        Assertions.assertNotNull(response);
        Assertions.assertEquals(200, response.getStatusCode().value());

        ApiResponse<List<ChuyenXeResponse>> body = response.getBody();
        Assertions.assertNotNull(body);
        Assertions.assertTrue(body.isStatus());
        Assertions.assertNotNull(body.getData());
        Assertions.assertFalse(body.getData().isEmpty(), "Dữ liệu chuyến xe không được rỗng!");

        System.out.println(">>> Đã test thành công API /api/trips! Số chuyến xe lấy được: " + body.getData().size());
    }
}
