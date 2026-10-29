package in.nqn.backend.repository;

import in.nqn.backend.dto.response.LuongTaiXeResponse;
import in.nqn.backend.entity.TaiXe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaiXeRepository extends JpaRepository<TaiXe, Integer> {

    @Query(value = "CALL sp_TinhLuongTaiXeThang(:nam, :thang)", nativeQuery = true)
    List<LuongTaiXeResponse> callSpTinhLuongTaiXeThang(@Param("nam") int nam, @Param("thang") int thang);

    @Query(value = "CALL sp_TinhLuongTheoKhoang(:tuNgay, :denNgay)", nativeQuery = true)
    List<LuongTaiXeResponse> callSpTinhLuongTheoKhoang(@Param("tuNgay") LocalDate tuNgay, @Param("denNgay") LocalDate denNgay);

    @Query(value = "SELECT * FROM v_BangLuongTaiXeHienTai", nativeQuery = true)
    List<LuongTaiXeResponse> getDanhSachBangLuongTaiXe();

    boolean existsByCccd(String cccd);

    boolean existsByCccdAndIdNot(String cccd, Integer id);

    boolean existsByMaSoBangLai(String maSoBangLai);

    boolean existsByMaSoBangLaiAndIdNot(String maSoBangLai, Integer id);
}
