package in.nqn.backend.repository;

import in.nqn.backend.entity.TuyenXe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuBaoDuongRepository extends JpaRepository<TuyenXe,String> {

    @Query(value = "select * from v_XeQuaHanBaoDuong",nativeQuery = true)
    List<Object[]> getDanhSachXeQuaHan();

    @Query(value = "select * from v_XeAnToan",nativeQuery = true)
    List<Object[]> getDanhSachXeAnToan();

    @Query(value = "select * from v_XeBaoDuongChiTiet",nativeQuery = true)
    List<Object[]> getDanhSachXeBaoDuong();
}
