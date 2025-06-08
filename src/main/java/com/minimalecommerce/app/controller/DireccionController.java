package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Direccion;
import com.minimalecommerce.app.service.DireccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/direcciones")
public class DireccionController {

    @Autowired
    private DireccionService direccionService;

    @PostMapping
    public ResponseEntity<Direccion> crearDireccion(@RequestBody Direccion direccion) {
        Direccion nuevaDireccion = direccionService.crearDireccion(direccion);
        return ResponseEntity.ok(nuevaDireccion);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Direccion>> obtenerDireccionesPorUsuario(@PathVariable Long usuarioId) {
        List<Direccion> direcciones = direccionService.obtenerDireccionesPorUsuario(usuarioId);
        return ResponseEntity.ok(direcciones);
    }

    @GetMapping("/usuario/{usuarioId}/principal")
    public ResponseEntity<Direccion> obtenerDireccionPrincipal(@PathVariable Long usuarioId) {
        Optional<Direccion> direccion = direccionService.obtenerDireccionPrincipal(usuarioId);
        return direccion.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/establecer-principal")
    public ResponseEntity<Direccion> establecerComoPrincipal(@PathVariable Long id) {
        Direccion direccion = direccionService.establecerComoPrincipal(id);
        return ResponseEntity.ok(direccion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Direccion> actualizarDireccion(@PathVariable Long id, @RequestBody Direccion direccion) {
        Direccion direccionActualizada = direccionService.actualizarDireccion(id, direccion);
        return ResponseEntity.ok(direccionActualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> desactivarDireccion(@PathVariable Long id) {
        direccionService.desactivarDireccion(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Dirección desactivada correctamente");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/usuario/{usuarioId}/contador")
    public ResponseEntity<Map<String, Object>> contarDirecciones(@PathVariable Long usuarioId) {
        Long contador = direccionService.contarDirecciones(usuarioId);
        Map<String, Object> response = new HashMap<>();
        response.put("usuarioId", usuarioId);
        response.put("totalDirecciones", contador);
        return ResponseEntity.ok(response);
    }
}

