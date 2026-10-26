package in.nqn.backend.repository;

import in.nqn.backend.entity.TuyenXe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TuyenXeRepository extends JpaRepository<TuyenXe, Integer> {
}
