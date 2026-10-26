package in.nqn.backend.repository;

import in.nqn.backend.dto.response.BaoDuongXeResponse;
import in.nqn.backend.entity.LichSuBaoDuong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuBaoDuongRepository extends JpaRepository<LichSuBaoDuong, Integer> {

    @Query(value = "SELECT * FROM v_XeQuaHanBaoDuong", nativeQuery = true)
    List<BaoDuongXeResponse> getDanhSachXeQuaHan();

    @Query(value = "SELECT * FROM v_XeAnToan", nativeQuery = true)
    List<BaoDuongXeResponse> getDanhSachXeAnToan();

    @Query(value = "SELECT * FROM v_XeBaoDuongChiTiet ORDER BY SoNgayConLai", nativeQuery = true)
    List<BaoDuongXeResponse> getDanhSachXeBaoDuong();
}
