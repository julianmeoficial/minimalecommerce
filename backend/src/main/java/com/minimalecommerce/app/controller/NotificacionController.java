package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Notificacion;
import com.minimalecommerce.app.model.TipoNotificacion;
import com.minimalecommerce.app.service.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    @Autowired
    private NotificacionService notificacionService;

    @PostMapping
    public ResponseEntity<Notificacion> crearNotificacion(@RequestBody Notificacion notificacion) {
        Notificacion nuevaNotificacion = notificacionService.crearNotificacion(notificacion);
        return ResponseEntity.ok(nuevaNotificacion);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Notificacion>> obtenerNotificacionesPorUsuario(@PathVariable Long usuarioId) {
        List<Notificacion> notificaciones = notificacionService.obtenerNotificacionesPorUsuario(usuarioId);
        return ResponseEntity.ok(notificaciones);
    }

    @GetMapping("/usuario/{usuarioId}/no-leidas")
    public ResponseEntity<List<Notificacion>> obtenerNotificacionesNoLeidas(@PathVariable Long usuarioId) {
        List<Notificacion> notificaciones = notificacionService.obtenerNotificacionesNoLeidas(usuarioId);
        return ResponseEntity.ok(notificaciones);
    }

    @GetMapping("/usuario/{usuarioId}/contador")
    public ResponseEntity<Map<String, Object>> contarNotificacionesNoLeidas(@PathVariable Long usuarioId) {
        Long contador = notificacionService.contarNotificacionesNoLeidas(usuarioId);
        Map<String, Object> response = new HashMap<>();
        response.put("usuarioId", usuarioId);
        response.put("notificacionesNoLeidas", contador);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/marcar-leida")
    public ResponseEntity<Notificacion> marcarComoLeida(@PathVariable Long id) {
        Notificacion notificacion = notificacionService.marcarComoLeida(id);
        return ResponseEntity.ok(notificacion);
    }

    @PutMapping("/usuario/{usuarioId}/marcar-todas-leidas")
    public ResponseEntity<Map<String, String>> marcarTodasComoLeidas(@PathVariable Long usuarioId) {
        notificacionService.marcarTodasComoLeidas(usuarioId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Todas las notificaciones marcadas como leídas");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/usuario/{usuarioId}/tipo/{tipo}")
    public ResponseEntity<List<Notificacion>> obtenerPorTipo(@PathVariable Long usuarioId, @PathVariable TipoNotificacion tipo) {
        List<Notificacion> notificaciones = notificacionService.obtenerPorTipo(usuarioId, tipo);
        return ResponseEntity.ok(notificaciones);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarNotificacion(@PathVariable Long id) {
        notificacionService.eliminarNotificacion(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notificación eliminada correctamente");
        return ResponseEntity.ok(response);
    }
}
