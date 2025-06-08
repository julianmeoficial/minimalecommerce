package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Resena;
import com.minimalecommerce.app.service.ResenaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/resenas")
public class ResenaController {

    @Autowired
    private ResenaService resenaService;

    @GetMapping
    public ResponseEntity<List<Resena>> obtenerTodasResenas() {
        List<Resena> resenas = resenaService.obtenerTodasResenas();
        return ResponseEntity.ok(resenas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resena> obtenerResenaPorId(@PathVariable Long id) {
        Optional<Resena> resena = resenaService.obtenerResenaPorId(id);
        return resena.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Resena> crearResena(@RequestBody Resena resena) {
        Resena nuevaResena = resenaService.crearResena(resena);
        return ResponseEntity.ok(nuevaResena);
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<Resena>> obtenerResenasPorProducto(@PathVariable Long productoId) {
        List<Resena> resenas = resenaService.obtenerResenasPorProducto(productoId);
        return ResponseEntity.ok(resenas);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Resena>> obtenerResenasPorUsuario(@PathVariable Long usuarioId) {
        List<Resena> resenas = resenaService.obtenerResenasPorUsuario(usuarioId);
        return ResponseEntity.ok(resenas);
    }

    @GetMapping("/producto/{productoId}/promedio")
    public ResponseEntity<Map<String, Object>> obtenerPromedioCalificacion(@PathVariable Long productoId) {
        Double promedio = resenaService.obtenerPromedioCalificacion(productoId);
        Map<String, Object> response = new HashMap<>();
        response.put("productoId", productoId);
        response.put("promedioCalificacion", promedio);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resena> actualizarResena(@PathVariable Long id, @RequestBody Resena resena) {
        Resena resenaActualizada = resenaService.actualizarResena(id, resena);
        return ResponseEntity.ok(resenaActualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarResena(@PathVariable Long id) {
        resenaService.eliminarResena(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Reseña eliminada correctamente");
        return ResponseEntity.ok(response);
    }
}
