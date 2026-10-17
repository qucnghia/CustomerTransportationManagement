package in.nqn.backend.repository;

import in.nqn.backend.entity.TaiXe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaiXeRepository extends JpaRepository<TaiXe,String> {

    @Query(value = "CALL sp_TinhLuongTaiXeThang(:nam, :thang)",nativeQuery = true)
    List<Object[]> callSpTinhLuongTaiXeThang(@Param("nam") int nam, @Param("thang") int thang);

    @Query(value = "select * from v_BangLuongTaiXeHienTai",nativeQuery = true)
    List<Object[]> getDanhSachBangLuongTaiXe();
}
