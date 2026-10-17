package in.nqn.backend.repository;

import in.nqn.backend.entity.Xe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface XeRepository extends JpaRepository<Xe,String> {

    @Query(value = "CALL sp_BaoCaoDoanhThuTheoXe",nativeQuery = true)
    List<Object[]> callSpBaoCaoDoanhTheoXe(@Param("tuNgay")LocalDate tuNgay, @Param("denNgay") LocalDate denNgay);
}
