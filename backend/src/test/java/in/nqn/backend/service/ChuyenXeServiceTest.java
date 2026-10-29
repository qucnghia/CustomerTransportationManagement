package in.nqn.backend.service;

import in.nqn.backend.dto.request.ChuyenXeRequest;
import in.nqn.backend.entity.ChuyenXe;
import in.nqn.backend.entity.TaiXe;
import in.nqn.backend.entity.TuyenXe;
import in.nqn.backend.entity.Xe;
import in.nqn.backend.repository.ChuyenXeRepository;
import in.nqn.backend.repository.TaiXeRepository;
import in.nqn.backend.repository.TuyenXeRepository;
import in.nqn.backend.repository.XeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Unit test quy tắc nghiệp vụ khi điều phối chuyến xe (không cần CSDL)
class ChuyenXeServiceTest {

    private final ChuyenXeRepository chuyenXeRepo = mock(ChuyenXeRepository.class);
    private final XeRepository xeRepo = mock(XeRepository.class);
    private final TaiXeRepository taiXeRepo = mock(TaiXeRepository.class);
    private final TuyenXeRepository tuyenXeRepo = mock(TuyenXeRepository.class);
    private final ChuyenXeService service = new ChuyenXeService(chuyenXeRepo, xeRepo, taiXeRepo, tuyenXeRepo);

    @BeforeEach
    void setUp() {
        Xe xe = new Xe();
        xe.setBienSo("29B-188.88");
        xe.setSoGhe(16);
        when(xeRepo.findById("29B-188.88")).thenReturn(Optional.of(xe));
        when(tuyenXeRepo.findById(1)).thenReturn(Optional.of(new TuyenXe()));
        when(taiXeRepo.findById(any())).thenReturn(Optional.of(new TaiXe()));
        when(chuyenXeRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    private ChuyenXeRequest request(int soKhach, int laiXe, int phuXe, int soGioChay) {
        ChuyenXeRequest r = new ChuyenXeRequest();
        r.setMaTuyen(1);
        r.setBienSoXe("29B-188.88");
        r.setMaLaiXe(laiXe);
        r.setMaPhuXe(phuXe);
        r.setThoiGianKhoiHanh(LocalDateTime.of(2026, 11, 1, 8, 0));
        r.setThoiGianKetThuc(LocalDateTime.of(2026, 11, 1, 8, 0).plusHours(soGioChay));
        r.setSoKhach(soKhach);
        return r;
    }

    @Test
    void soKhachToiDaBangSoGheTruHai() {
        ChuyenXe saved = service.createChuyenXe(request(14, 1, 2, 2));
        assertEquals(14, saved.getSoKhach());
        assertEquals("DaLenLich", saved.getTrangThai());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.createChuyenXe(request(15, 1, 2, 2)));
        assertTrue(ex.getMessage().contains("tối đa 14"));
    }

    @Test
    void laiXeKhongDuocTrungPhuXe() {
        assertThrows(IllegalArgumentException.class, () -> service.createChuyenXe(request(10, 3, 3, 2)));
        verify(chuyenXeRepo, never()).save(any());
    }

    @Test
    void thoiGianKetThucPhaiSauKhoiHanh() {
        assertThrows(IllegalArgumentException.class, () -> service.createChuyenXe(request(10, 1, 2, 0)));
    }

    private ChuyenXe chuyenCo(String trangThai) {
        ChuyenXe c = new ChuyenXe();
        c.setId(7);
        c.setTrangThai(trangThai);
        when(chuyenXeRepo.findById(7)).thenReturn(Optional.of(c));
        return c;
    }

    @Test
    void chuyenTrangThaiChiTienMotBuoc() {
        ChuyenXe c = chuyenCo("DaLenLich");
        assertEquals("DangChay", service.chuyenTrangThaiTiepTheo(7).getTrangThai());
        assertEquals("HoanThanh", service.chuyenTrangThaiTiepTheo(7).getTrangThai());
        assertThrows(IllegalArgumentException.class, () -> service.chuyenTrangThaiTiepTheo(7));
        assertEquals("HoanThanh", c.getTrangThai());
    }

    @Test
    void chuyenDaHuyKhongChuyenTiepDuoc() {
        chuyenCo("Huy");
        assertThrows(IllegalArgumentException.class, () -> service.chuyenTrangThaiTiepTheo(7));
    }

    @Test
    void khongDuocSuaChuyenDaHoanThanh() {
        chuyenCo("HoanThanh");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.updateChuyenXe(7, request(10, 1, 2, 2)));
        assertTrue(ex.getMessage().contains("đã hoàn thành"));
        verify(chuyenXeRepo, never()).save(any());
    }

    @Test
    void khongDuocLuiTrangThaiKhiSua() {
        chuyenCo("DangChay");
        ChuyenXeRequest r = request(10, 1, 2, 2);
        r.setTrangThai("DaLenLich");
        assertThrows(IllegalArgumentException.class, () -> service.updateChuyenXe(7, r));

        r.setTrangThai("HoanThanh");
        assertEquals("HoanThanh", service.updateChuyenXe(7, r).getTrangThai());
    }

    @Test
    void chiHuyDuocChuyenSapKhoiHanh() {
        ChuyenXe c = chuyenCo("DaLenLich");
        assertEquals("Huy", service.huyChuyenXe(7).getTrangThai());
        assertThrows(IllegalArgumentException.class, () -> service.huyChuyenXe(7)); // đã hủy rồi

        c.setTrangThai("DangChay");
        assertThrows(IllegalArgumentException.class, () -> service.huyChuyenXe(7));
        c.setTrangThai("HoanThanh");
        assertThrows(IllegalArgumentException.class, () -> service.huyChuyenXe(7));
    }

    @Test
    void khongDuocSuaChuyenDaHuy() {
        chuyenCo("Huy");
        ChuyenXeRequest r = request(10, 1, 2, 2);
        r.setTrangThai("DaLenLich");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.updateChuyenXe(7, r));
        assertTrue(ex.getMessage().contains("đã bị hủy"));
    }

    @Test
    void trangThaiPhaiHopLe() {
        ChuyenXeRequest r = request(10, 1, 2, 2);
        r.setTrangThai("ABC");
        assertThrows(IllegalArgumentException.class, () -> service.createChuyenXe(r));
    }
}
