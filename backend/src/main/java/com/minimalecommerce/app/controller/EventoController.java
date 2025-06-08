package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Evento;
import com.minimalecommerce.app.service.EventoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    @Autowired
    private EventoService eventoService;

    @GetMapping
    public ResponseEntity<List<Evento>> obtenerEventosActivos() {
        List<Evento> eventos = eventoService.obtenerEventosActivos();
        return ResponseEntity.ok(eventos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evento> obtenerEventoPorId(@PathVariable Long id) {
        Optional<Evento> evento = eventoService.obtenerEventoPorId(id);
        return evento.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Evento> crearEvento(@RequestBody Evento evento) {
        Evento nuevoEvento = eventoService.crearEvento(evento);
        return ResponseEntity.ok(nuevoEvento);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Evento>> obtenerEventosPorUsuario(@PathVariable Long usuarioId) {
        List<Evento> eventos = eventoService.obtenerEventosPorUsuario(usuarioId);
        return ResponseEntity.ok(eventos);
    }

    @GetMapping("/proximos")
    public ResponseEntity<List<Evento>> obtenerEventosProximos() {
        List<Evento> eventos = eventoService.obtenerEventosProximos();
        return ResponseEntity.ok(eventos);
    }

    @GetMapping("/buscar/{titulo}")
    public ResponseEntity<List<Evento>> buscarEventos(@PathVariable String titulo) {
        List<Evento> eventos = eventoService.buscarEventos(titulo);
        return ResponseEntity.ok(eventos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evento> actualizarEvento(@PathVariable Long id, @RequestBody Evento evento) {
        Evento eventoActualizado = eventoService.actualizarEvento(id, evento);
        return ResponseEntity.ok(eventoActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarEvento(@PathVariable Long id) {
        eventoService.eliminarEvento(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Evento eliminado correctamente");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarEvento(@PathVariable Long id) {
        eventoService.desactivarEvento(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Evento desactivado correctamente");
        return ResponseEntity.ok(response);
    }
}
