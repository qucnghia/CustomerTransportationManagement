package in.nqn.backend.repository;

import in.nqn.backend.dto.response.ChuyenXeResponse;
import in.nqn.backend.entity.ChuyenXe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChuyenXeRepository extends JpaRepository<ChuyenXe, Integer> {

    @Query(value = "SELECT * FROM v_DanhSachChuyenXe ORDER BY ThoiGianKhoiHanh DESC", nativeQuery = true)
    List<ChuyenXeResponse> getDanhSachChuyenXeChiTiet();
}
