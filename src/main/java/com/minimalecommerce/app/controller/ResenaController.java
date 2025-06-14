package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Resena;
import com.minimalecommerce.app.service.ResenaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/resenas")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Validated
public class ResenaController {

    @Autowired
    private ResenaService resenaService;

    // ===== ENDPOINTS BÁSICOS =====

    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerTodasResenas() {
        try {
            List<Resena> resenas = resenaService.obtenerTodasResenas();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", resenas);
            response.put("total", resenas.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al obtener reseñas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerResenaPorId(@PathVariable Long id) {
        try {
            Optional<Resena> resena = resenaService.obtenerResenaPorId(id);
            Map<String, Object> response = new HashMap<>();

            if (resena.isPresent()) {
                response.put("success", true);
                response.put("data", resena.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Reseña no encontrada");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al obtener reseña: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> crearResena(@RequestBody Resena resena) {
        try {
            Resena nuevaResena = resenaService.crearResena(resena);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", nuevaResena);
            response.put("message", "Reseña creada correctamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarResena(@PathVariable Long id, @RequestBody Resena resena) {
        try {
            Resena resenaActualizada = resenaService.actualizarResena(id, resena);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", resenaActualizada);
            response.put("message", "Reseña actualizada correctamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarResena(@PathVariable Long id) {
        try {
            resenaService.eliminarResena(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Reseña eliminada correctamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ===== ENDPOINTS POR PRODUCTO =====

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<Map<String, Object>> obtenerResenasPorProducto(@PathVariable Long productoId) {
        try {
            List<Resena> resenas = resenaService.obtenerResenasPorProducto(productoId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", resenas);
            response.put("productoId", productoId);
            response.put("total", resenas.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al obtener reseñas del producto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/producto/{productoId}/promedio")
    public ResponseEntity<Map<String, Object>> obtenerPromedioCalificacion(@PathVariable Long productoId) {
        try {
            Double promedio = resenaService.obtenerPromedioCalificacion(productoId);
            Long totalResenas = resenaService.contarResenasPorProducto(productoId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("productoId", productoId);
            response.put("promedioCalificacion", promedio);
            response.put("totalResenas", totalResenas);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al obtener promedio: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/producto/{productoId}/verificadas")
    public ResponseEntity<Map<String, Object>> obtenerResenasVerificadasPorProducto(@PathVariable Long productoId) {
        try {
            List<Resena> resenas = resenaService.obtenerResenasVerificadasPorProducto(productoId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", resenas);
            response.put("productoId", productoId);
            response.put("total", resenas.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al obtener reseñas verificadas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ===== ENDPOINTS POR USUARIO =====

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<Map<String, Object>> obtenerResenasPorUsuario(@PathVariable Long usuarioId) {
        try {
            List<Resena> resenas = resenaService.obtenerResenasPorUsuario(usuarioId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", resenas);
            response.put("usuarioId", usuarioId);
            response.put("total", resenas.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al obtener reseñas del usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ===== ENDPOINTS PARA COMPRADORES =====

    @PostMapping("/comprador/{compradorId}/producto/{productoId}")
    public ResponseEntity<Map<String, Object>> crearResenaComprador(
            @PathVariable Long compradorId,
            @PathVariable Long productoId,
            @RequestBody Resena resena) {
        try {
            Resena nuevaResena = resenaService.crearResenaComprador(compradorId, productoId, resena);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", nuevaResena);
            response.put("message", "Reseña creada correctamente");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error interno del servidor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/comprador/{compradorId}/escritas")
    public ResponseEntity<Map<String, Object>> obtenerResenasEscritasPorComprador(@PathVariable Long compradorId) {
        try {
            List<Resena> resenas = resenaService.obtenerResenasEscritasPorComprador(compradorId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", resenas);
            response.put("compradorId", compradorId);
            response.put("total", resenas.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al obtener reseñas escritas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/comprador/{compradorId}/producto/{productoId}/puede-resenar")
    public ResponseEntity<Map<String, Object>> puedeResenarProducto(
            @PathVariable Long compradorId,
            @PathVariable Long productoId) {
        try {
            boolean puedeResenar = resenaService.puedeResenarProducto(compradorId, productoId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("compradorId", compradorId);
            response.put("productoId", productoId);
            response.put("puedeResenar", puedeResenar);
            response.put("message", puedeResenar ? "Puede escribir reseña" : "Ya escribió una reseña para este producto");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al verificar disponibilidad: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/comprador/{compradorId}/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasComprador(@PathVariable Long compradorId) {
        try {
            Long totalResenasEscritas = resenaService.contarResenasEscritasPorComprador(compradorId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("compradorId", compradorId);
            response.put("totalResenasEscritas", totalResenasEscritas);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al obtener estadísticas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ===== ENDPOINTS PARA VENDEDORES =====

    @GetMapping("/vendedor/{vendedorId}/recibidas")
    public ResponseEntity<Map<String, Object>> obtenerResenasRecibidasPorVendedor(@PathVariable Long vendedorId) {
        try {
            List<Resena> resenas = resenaService.obtenerResenasRecibidasPorVendedor(vendedorId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", resenas);
            response.put("vendedorId", vendedorId);
            response.put("total", resenas.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al obtener reseñas recibidas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/vendedor/{vendedorId}/promedio")
    public ResponseEntity<Map<String, Object>> obtenerPromedioCalificacionVendedor(@PathVariable Long vendedorId) {
        try {
            Double promedio = resenaService.obtenerPromedioCalificacionVendedor(vendedorId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("vendedorId", vendedorId);
            response.put("promedioCalificacion", promedio);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al obtener promedio del vendedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/vendedor/{vendedorId}/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasVendedor(@PathVariable Long vendedorId) {
        try {
            Long totalResenasRecibidas = resenaService.contarResenasRecibidasPorVendedor(vendedorId);
            Long resenasVerificadas = resenaService.contarResenasVerificadasPorVendedor(vendedorId);
            Double promedioCalificacion = resenaService.obtenerPromedioCalificacionVendedor(vendedorId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("vendedorId", vendedorId);
            response.put("totalResenasRecibidas", totalResenasRecibidas);
            response.put("resenasVerificadas", resenasVerificadas);
            response.put("promedioCalificacion", promedioCalificacion);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al obtener estadísticas del vendedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ===== ENDPOINTS ADICIONALES =====

    @GetMapping("/calificacion/{calificacion}")
    public ResponseEntity<Map<String, Object>> obtenerResenasConCalificacion(@PathVariable Integer calificacion) {
        try {
            if (calificacion < 1 || calificacion > 5) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "La calificación debe estar entre 1 y 5");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            List<Resena> resenas = resenaService.obtenerResenasConCalificacion(calificacion);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", resenas);
            response.put("calificacion", calificacion);
            response.put("total", resenas.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al obtener reseñas por calificación: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/estadisticas/generales")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasGenerales() {
        try {
            List<Resena> todasResenas = resenaService.obtenerTodasResenas();
            Double promedioGeneral = resenaService.obtenerPromedioCalificacionGeneral();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalResenas", todasResenas.size());
            response.put("promedioGeneral", promedioGeneral != null ? promedioGeneral : 0.0);

            // Estadísticas por calificación
            Map<Integer, Long> resenasporCalificacion = new HashMap<>();
            for (int i = 1; i <= 5; i++) {
                final int calificacion = i;
                long count = todasResenas.stream()
                        .filter(r -> r.getCalificacion().equals(calificacion))
                        .count();
                resenasporCalificacion.put(i, count);
            }
            response.put("distribucionCalificaciones", resenasporCalificacion);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Error al obtener estadísticas generales: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
