package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Preorden;
import com.minimalecommerce.app.model.EstadoPreorden;
import com.minimalecommerce.app.service.PreordenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/preordenes")
public class PreordenController {

    @Autowired
    private PreordenService preordenService;

    @GetMapping
    public ResponseEntity<List<Preorden>> obtenerTodasPreordenes() {
        List<Preorden> preordenes = preordenService.obtenerTodasPreordenes();
        return ResponseEntity.ok(preordenes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Preorden> obtenerPreordenPorId(@PathVariable Long id) {
        Optional<Preorden> preorden = preordenService.obtenerPreordenPorId(id);
        return preorden.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Preorden> crearPreorden(@RequestBody Preorden preorden) {
        Preorden nuevaPreorden = preordenService.crearPreorden(preorden);
        return ResponseEntity.ok(nuevaPreorden);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Preorden>> obtenerPreordenesPorUsuario(@PathVariable Long usuarioId) {
        List<Preorden> preordenes = preordenService.obtenerPreordenesPorUsuario(usuarioId);
        return ResponseEntity.ok(preordenes);
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<Preorden>> obtenerPreordenesPorProducto(@PathVariable Long productoId) {
        List<Preorden> preordenes = preordenService.obtenerPreordenesPorProducto(productoId);
        return ResponseEntity.ok(preordenes);
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Preorden>> obtenerPreordenesPorEstado(@PathVariable EstadoPreorden estado) {
        List<Preorden> preordenes = preordenService.obtenerPreordenesPorEstado(estado);
        return ResponseEntity.ok(preordenes);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Preorden> actualizarEstadoPreorden(@PathVariable Long id, @RequestParam EstadoPreorden estado) {
        Preorden preordenActualizada = preordenService.actualizarEstadoPreorden(id, estado);
        return ResponseEntity.ok(preordenActualizada);
    }

    @GetMapping("/usuario/{usuarioId}/total")
    public ResponseEntity<Map<String, Object>> calcularTotalPreordenes(@PathVariable Long usuarioId, @RequestParam EstadoPreorden estado) {
        BigDecimal total = preordenService.calcularTotalPreordenes(usuarioId, estado);
        Long cantidad = preordenService.contarPreordenesPorUsuario(usuarioId);

        Map<String, Object> response = new HashMap<>();
        response.put("usuarioId", usuarioId);
        response.put("estado", estado);
        response.put("total", total);
        response.put("cantidadPreordenes", cantidad);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Preorden> actualizarPreorden(@PathVariable Long id, @RequestBody Preorden preorden) {
        Preorden preordenActualizada = preordenService.actualizarPreorden(id, preorden);
        return ResponseEntity.ok(preordenActualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarPreorden(@PathVariable Long id) {
        preordenService.eliminarPreorden(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Preorden eliminada correctamente");
        return ResponseEntity.ok(response);
    }
}
