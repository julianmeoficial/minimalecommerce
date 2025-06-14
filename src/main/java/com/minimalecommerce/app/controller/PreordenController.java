package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Preorden;
import com.minimalecommerce.app.model.EstadoPreorden;
import com.minimalecommerce.app.service.PreordenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/preordenes")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class PreordenController {

    @Autowired
    private PreordenService preordenService;

    // ==================== OPERACIONES BÁSICAS ====================

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

    // ==================== CREAR PREORDEN DESDE FRONTEND ====================

    @PostMapping("/crear")
    public ResponseEntity<Map<String, Object>> crearPreordenDesdeProducto(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("🛒 Creando preorden desde producto...");

            Long usuarioId = Long.valueOf(request.get("usuarioId").toString());
            Long productoId = Long.valueOf(request.get("productoId").toString());
            Integer cantidad = Integer.valueOf(request.get("cantidad").toString());
            String fechaEntregaStr = request.get("fechaEstimadaEntrega").toString();
            String notas = request.get("notas") != null ? request.get("notas").toString() : "";

            // Parsear fecha de entrega
            LocalDateTime fechaEntrega = LocalDateTime.parse(fechaEntregaStr);

            Preorden preorden = preordenService.crearPreordenCompleta(
                    usuarioId, productoId, cantidad, fechaEntrega, notas
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("preorden", preorden);
            response.put("mensaje", "Preorden creada exitosamente");

            System.out.println("✅ Preorden creada: " + preorden.getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error creando preorden: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Preorden> crearPreorden(@RequestBody Preorden preorden) {
        Preorden nuevaPreorden = preordenService.crearPreorden(preorden);
        return ResponseEntity.ok(nuevaPreorden);
    }

    // ==================== CONSULTAS POR USUARIO ====================

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Preorden>> obtenerPreordenesPorUsuario(@PathVariable Long usuarioId) {
        try {
            System.out.println("📋 Obteniendo preórdenes para usuario: " + usuarioId);
            List<Preorden> preordenes = preordenService.obtenerPreordenesPorUsuario(usuarioId);
            System.out.println("✅ Preórdenes encontradas: " + preordenes.size());
            return ResponseEntity.ok(preordenes);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo preórdenes: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/usuario/{usuarioId}/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasUsuario(@PathVariable Long usuarioId) {
        try {
            Map<String, Object> estadisticas = new HashMap<>();

            Long totalPreordenes = preordenService.contarPreordenesPorUsuario(usuarioId);
            estadisticas.put("totalPreordenes", totalPreordenes);

            // Contar por estados
            long pendientes = preordenService.contarPreordenesPorUsuarioYEstado(usuarioId, EstadoPreorden.PENDIENTE);
            long confirmadas = preordenService.contarPreordenesPorUsuarioYEstado(usuarioId, EstadoPreorden.CONFIRMADA);
            long enProduccion = preordenService.contarPreordenesPorUsuarioYEstado(usuarioId, EstadoPreorden.PRODUCCION);
            long listas = preordenService.contarPreordenesPorUsuarioYEstado(usuarioId, EstadoPreorden.LISTA);
            long entregadas = preordenService.contarPreordenesPorUsuarioYEstado(usuarioId, EstadoPreorden.ENTREGADA);
            long canceladas = preordenService.contarPreordenesPorUsuarioYEstado(usuarioId, EstadoPreorden.CANCELADA);

            estadisticas.put("pendientes", pendientes);
            estadisticas.put("confirmadas", confirmadas);
            estadisticas.put("enProduccion", enProduccion);
            estadisticas.put("listas", listas);
            estadisticas.put("entregadas", entregadas);
            estadisticas.put("canceladas", canceladas);

            // Total invertido
            BigDecimal totalInvertido = preordenService.calcularTotalTodasPreordenes(usuarioId);
            estadisticas.put("totalInvertido", totalInvertido);

            return ResponseEntity.ok(estadisticas);

        } catch (Exception e) {
            System.err.println("❌ Error obteniendo estadísticas: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== CONSULTAS POR VENDEDOR ====================

    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<List<Preorden>> obtenerPreordenesPorVendedor(@PathVariable Long vendedorId) {
        try {
            System.out.println("🏪 Obteniendo preórdenes para vendedor: " + vendedorId);
            List<Preorden> preordenes = preordenService.obtenerPreordenesPorVendedor(vendedorId);
            System.out.println("✅ Preórdenes de vendedor encontradas: " + preordenes.size());
            return ResponseEntity.ok(preordenes);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo preórdenes de vendedor: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== GESTIÓN DE ESTADOS ====================

    @PutMapping("/{id}/estado")
    public ResponseEntity<Map<String, Object>> actualizarEstadoPreorden(@PathVariable Long id,
                                                                        @RequestBody Map<String, String> request) {
        try {
            String nuevoEstado = request.get("estado");
            System.out.println("🔄 Actualizando estado de preorden " + id + " a: " + nuevoEstado);

            EstadoPreorden estado = EstadoPreorden.valueOf(nuevoEstado.toUpperCase());
            Preorden preordenActualizada = preordenService.actualizarEstadoPreorden(id, estado);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("preorden", preordenActualizada);
            response.put("mensaje", "Estado actualizado correctamente");

            System.out.println("✅ Estado actualizado exitosamente");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error actualizando estado: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ==================== CONSULTAS POR PRODUCTO ====================

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<Preorden>> obtenerPreordenesPorProducto(@PathVariable Long productoId) {
        List<Preorden> preordenes = preordenService.obtenerPreordenesPorProducto(productoId);
        return ResponseEntity.ok(preordenes);
    }

    @GetMapping("/producto/{productoId}/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasProducto(@PathVariable Long productoId) {
        try {
            Map<String, Object> estadisticas = new HashMap<>();

            Long totalPreordenes = preordenService.contarPreordenesPorProducto(productoId);
            estadisticas.put("totalPreordenes", totalPreordenes);

            BigDecimal totalVentas = preordenService.calcularTotalVentasProducto(productoId);
            estadisticas.put("totalVentas", totalVentas);

            return ResponseEntity.ok(estadisticas);

        } catch (Exception e) {
            System.err.println("❌ Error obteniendo estadísticas de producto: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== CONSULTAS POR ESTADO ====================

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Preorden>> obtenerPreordenesPorEstado(@PathVariable EstadoPreorden estado) {
        List<Preorden> preordenes = preordenService.obtenerPreordenesPorEstado(estado);
        return ResponseEntity.ok(preordenes);
    }

    // ==================== CANCELACIÓN ====================

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Map<String, Object>> cancelarPreorden(@PathVariable Long id,
                                                                @RequestBody Map<String, String> request) {
        try {
            String motivo = request.get("motivo");
            System.out.println("❌ Cancelando preorden " + id + " - Motivo: " + motivo);

            Preorden preordenCancelada = preordenService.cancelarPreorden(id, motivo);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("preorden", preordenCancelada);
            response.put("mensaje", "Preorden cancelada correctamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error cancelando preorden: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ==================== OPERACIONES DE ACTUALIZACIÓN Y ELIMINACIÓN ====================

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
