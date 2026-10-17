package in.nqn.backend.controller;

import in.nqn.backend.dto.request.XeRequest;
import in.nqn.backend.entity.Xe;
import in.nqn.backend.service.XeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class XeController {

    XeService xeService;

    public XeController(XeService xeService) {
        this.xeService = xeService;
    }

    @PostMapping
    public ResponseEntity<Xe> addNewXe(@RequestBody Xe xe) {
        Xe newXe = xeService.createNewXe(xe);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(newXe);
    }

    @GetMapping("/{bienSoXe}")
    public ResponseEntity<Xe> getXe(@PathVariable String bienSoXe) {
        Xe xe = xeService.getXeByBSX(bienSoXe);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(xe);
    }

    @GetMapping
    public ResponseEntity<List<Xe>> getAllXe() {
        List<Xe> listXe =  xeService.getAllXe();
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(listXe);
    }

    @PutMapping("/{bienSoXe}")
    public ResponseEntity<Xe>  updateXe(@PathVariable String bienSoXe,
                                               @RequestBody XeRequest xe) {
        Xe xeNeedToUpdate = xeService.updateXe(bienSoXe,xe);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(xeNeedToUpdate);
    }
}
