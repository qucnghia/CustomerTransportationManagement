package in.nqn.backend.service;

import in.nqn.backend.dto.request.XeRequest;
import in.nqn.backend.entity.Xe;
import in.nqn.backend.exception.DuplicateResourceException;
import in.nqn.backend.exception.ResourceNotFoundException;
import in.nqn.backend.repository.XeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class XeService {

    XeRepository xeRepository;

    public XeService(XeRepository xeRepository) {
        this.xeRepository = xeRepository;
    }

    public Xe createNewXe(Xe xe) {
        if(xeRepository.existsById(xe.getBienSo())){
            throw new DuplicateResourceException("Biến số xe " +
                    xe.getBienSo() + " đã tồn tại! Vui lòng tạo biển số xe khác!");
        }
        return xeRepository.save(xe);
    }

    public Xe getXeByBSX(String bienSo){
        return xeRepository
                .findById(bienSo)
                .orElseThrow(() -> new ResourceNotFoundException("Biển số xe "
                        + bienSo + " không tồn tại! Vui lòng nhập biển số xe khác!"));
    }

    public List<Xe> getAllXe(){
        return xeRepository.findAll();
    }

    public Xe updateXe(String bienSo, XeRequest xe) {
        return xeRepository.save(mapToEntity(bienSo,xe));
    }

    public Xe mapToEntity(String bienSo,XeRequest xe) {
        Xe updateXe =  new Xe();
        updateXe.setBienSo(bienSo);
        updateXe.setMauxe(xe.getMauxe());
        updateXe.setHangSanXuat(xe.getHangSanXuat());
        updateXe.setDoiXe(xe.getDoiXe());
        updateXe.setModel(xe.getModel());
        updateXe.setSoGhe(xe.getSoGhe());
        updateXe.setSoNamSuDung(xe.getSoNamSuDung());
        updateXe.setNgayBaoDuongCuoi(xe.getNgayBaoDuongCuoi());
        return updateXe;
    }

}
