package in.nqn.backend.service;

import in.nqn.backend.dto.request.TuyenXeRequest;
import in.nqn.backend.entity.TuyenXe;
import in.nqn.backend.exception.ResourceNotFoundException;
import in.nqn.backend.repository.TuyenXeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TuyenXeService {

    private final TuyenXeRepository tuyenXeRepository;

    public TuyenXeService(TuyenXeRepository tuyenXeRepository) {
        this.tuyenXeRepository = tuyenXeRepository;
    }

    public TuyenXe createTuyenXe(TuyenXeRequest request) {
        TuyenXe tuyenXe = new TuyenXe();
        tuyenXe.setDiemDau(request.getDiemDau());
        tuyenXe.setDiemCuoi(request.getDiemCuoi());
        tuyenXe.setDoDaiKm(request.getDoDaiKm());
        tuyenXe.setDoPhucTap(request.getDoPhucTap());
        return tuyenXeRepository.save(tuyenXe);
    }

    public List<TuyenXe> getAllTuyenXe() {
        return tuyenXeRepository.findAll();
    }

    public TuyenXe getTuyenXeById(Integer id) {
        return tuyenXeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tuyến xe với mã " + id + " không tồn tại!"));
    }

    public TuyenXe updateTuyenXe(Integer id, TuyenXeRequest request) {
        TuyenXe existing = getTuyenXeById(id);
        existing.setDiemDau(request.getDiemDau());
        existing.setDiemCuoi(request.getDiemCuoi());
        existing.setDoDaiKm(request.getDoDaiKm());
        existing.setDoPhucTap(request.getDoPhucTap());
        return tuyenXeRepository.save(existing);
    }

    public void deleteTuyenXe(Integer id) {
        if (!tuyenXeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tuyến xe với mã " + id + " không tồn tại!");
        }
        tuyenXeRepository.deleteById(id);
    }
}
