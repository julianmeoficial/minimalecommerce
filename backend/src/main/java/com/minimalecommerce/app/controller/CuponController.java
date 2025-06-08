package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Cupon;
import com.minimalecommerce.app.service.CuponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cupones")
public class CuponController {

    @Autowired
    private CuponService cuponService;

    @PostMapping
    public ResponseEntity<Cupon> crearCupon(@RequestBody Cupon cupon) {
        Cupon nuevoCupon = cuponService.crearCupon(cupon);
        return ResponseEntity.ok(nuevoCupon);
    }

    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<List<Cupon>> obtenerCuponesPorVendedor(@PathVariable Long vendedorId) {
        List<Cupon> cupones = cuponService.obtenerCuponesPorVendedor(vendedorId);
        return ResponseEntity.ok(cupones);
    }

    @GetMapping("/vendedor/{vendedorId}/activos")
    public ResponseEntity<List<Cupon>> obtenerCuponesActivosPorVendedor(@PathVariable Long vendedorId) {
        List<Cupon> cupones = cuponService.obtenerCuponesActivosPorVendedor(vendedorId);
        return ResponseEntity.ok(cupones);
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<Cupon> buscarPorCodigo(@PathVariable String codigo) {
        Optional<Cupon> cupon = cuponService.buscarPorCodigo(codigo);
        return cupon.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/aplicar")
    public ResponseEntity<Map<String, Object>> aplicarCupon(@RequestBody Map<String, Object> request) {
        String codigo = request.get("codigo").toString();
        BigDecimal montoOriginal = new BigDecimal(request.get("montoOriginal").toString());

        Cupon cupon = cuponService.aplicarCupon(codigo, montoOriginal);
        BigDecimal montoConDescuento = cupon.aplicarDescuento(montoOriginal);
        BigDecimal descuento = montoOriginal.subtract(montoConDescuento);

        Map<String, Object> response = new HashMap<>();
        response.put("cupon", cupon);
        response.put("montoOriginal", montoOriginal);
        response.put("descuento", descuento);
        response.put("montoFinal", montoConDescuento);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/validos")
    public ResponseEntity<List<Cupon>> obtenerCuponesValidos() {
        List<Cupon> cupones = cuponService.obtenerCuponesValidos();
        return ResponseEntity.ok(cupones);
    }

    @GetMapping("/vendedor/{vendedorId}/validos")
    public ResponseEntity<List<Cupon>> obtenerCuponesValidosPorVendedor(@PathVariable Long vendedorId) {
        List<Cupon> cupones = cuponService.obtenerCuponesValidosPorVendedor(vendedorId);
        return ResponseEntity.ok(cupones);
    }

    @PutMapping("/{id}/desactivar")
    public ResponseEntity<Cupon> desactivarCupon(@PathVariable Long id) {
        Cupon cupon = cuponService.desactivarCupon(id);
        return ResponseEntity.ok(cupon);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cupon> actualizarCupon(@PathVariable Long id, @RequestBody Cupon cupon) {
        Cupon cuponActualizado = cuponService.actualizarCupon(id, cupon);
        return ResponseEntity.ok(cuponActualizado);
    }

    @GetMapping("/vendedor/{vendedorId}/contador")
    public ResponseEntity<Map<String, Object>> contarCuponesActivos(@PathVariable Long vendedorId) {
        Long contador = cuponService.contarCuponesActivos(vendedorId);
        Map<String, Object> response = new HashMap<>();
        response.put("vendedorId", vendedorId);
        response.put("cuponesActivos", contador);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vendedor/{vendedorId}/proximos-vencer")
    public ResponseEntity<List<Cupon>> obtenerCuponesProximosAVencer(@PathVariable Long vendedorId, @RequestParam(defaultValue = "7") int dias) {
        List<Cupon> cupones = cuponService.obtenerCuponesProximosAVencer(vendedorId, dias);
        return ResponseEntity.ok(cupones);
    }
}

