package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Cupon;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.service.CuponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/cupones")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080"})
public class CuponController {

    @Autowired
    private CuponService cuponService;

    // ==================== OPERACIONES BÁSICAS ====================

    @PostMapping
    public ResponseEntity<Map<String, Object>> crearCupon(@RequestBody Cupon cupon) {
        try {
            System.out.println("🔍 Creando nuevo cupón: " + cupon.getCodigo());

            // VALIDAR Y ASIGNAR CREADOR SI NO EXISTE
            if (cupon.getCreador() == null) {
                System.out.println("⚠️ creador es null, buscando usuario por defecto");
                // Crear un usuario temporal o buscar uno existente
                Usuario usuarioDefault = new Usuario();
                usuarioDefault.setId(1L); // ID por defecto
                cupon.setCreador(usuarioDefault);
            }

            System.out.println("🔍 creador asignado: " + cupon.getCreador().getId());

            Cupon nuevoCupon = cuponService.crearCupon(cupon);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cupon", nuevoCupon);
            response.put("mensaje", "Cupón creado exitosamente");
            System.out.println("✅ Cupón creado exitosamente: " + nuevoCupon.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error creando cupón: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Error al crear cupón: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cupon> obtenerCuponPorId(@PathVariable Long id) {
        try {
            System.out.println("🔍 Buscando cupón por ID: " + id);
            Optional<Cupon> cupon = cuponService.obtenerCuponPorId(id);
            if (cupon.isPresent()) {
                System.out.println("✅ Cupón encontrado: " + cupon.get().getCodigo());
                return ResponseEntity.ok(cupon.get());
            } else {
                System.out.println("❌ Cupón no encontrado con ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("❌ Error buscando cupón por ID: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarCupon(@PathVariable Long id, @RequestBody Cupon cupon) {
        try {
            System.out.println("🔍 Actualizando cupón ID: " + id);
            Cupon cuponActualizado = cuponService.actualizarCupon(id, cupon);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cupon", cuponActualizado);
            response.put("mensaje", "Cupón actualizado exitosamente");
            System.out.println("✅ Cupón actualizado exitosamente: " + cuponActualizado.getCodigo());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error actualizando cupón: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarCupon(@PathVariable Long id) {
        try {
            System.out.println("🔍 Eliminando cupón ID: " + id);
            cuponService.eliminarCupon(id);
            Map<String, String> response = new HashMap<>();
            response.put("success", "true");
            response.put("mensaje", "Cupón eliminado correctamente");
            System.out.println("✅ Cupón eliminado exitosamente: " + id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error eliminando cupón: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("success", "false");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ==================== BÚSQUEDAS ESPECÍFICAS ====================

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<Cupon> buscarPorCodigo(@PathVariable String codigo) {
        try {
            System.out.println("🔍 Buscando cupón por código: " + codigo);
            Cupon cupon = cuponService.buscarPorCodigo(codigo);
            System.out.println("✅ Cupón encontrado por código: " + cupon.getId());
            return ResponseEntity.ok(cupon);
        } catch (Exception e) {
            System.err.println("❌ Error buscando cupón por código: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/validos")
    public ResponseEntity<List<Cupon>> obtenerCuponesValidos() {
        try {
            System.out.println("🔍 Solicitando cupones válidos...");
            List<Cupon> cupones = cuponService.obtenerCuponesValidos();
            System.out.println("✅ Cupones válidos obtenidos: " + cupones.size());
            return ResponseEntity.ok(cupones);
        } catch (Exception e) {
            System.err.println("❌ Error en endpoint /validos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    // ==================== OPERACIONES POR VENDEDOR ====================

    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<List<Cupon>> obtenerCuponesPorVendedor(@PathVariable Long vendedorId) {
        try {
            System.out.println("🔍 Solicitando cupones del vendedor: " + vendedorId);
            List<Cupon> cupones = cuponService.obtenerCuponesPorVendedor(vendedorId);
            System.out.println("✅ Cupones del vendedor obtenidos: " + cupones.size());
            return ResponseEntity.ok(cupones);
        } catch (Exception e) {
            System.err.println("❌ Error en endpoint /vendedor/" + vendedorId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    @GetMapping("/vendedor/{vendedorId}/activos")
    public ResponseEntity<List<Cupon>> obtenerCuponesActivosPorVendedor(@PathVariable Long vendedorId) {
        try {
            System.out.println("🔍 Solicitando cupones activos del vendedor: " + vendedorId);
            List<Cupon> cupones = cuponService.obtenerCuponesActivosPorVendedor(vendedorId);
            System.out.println("✅ Cupones activos del vendedor obtenidos: " + cupones.size());
            return ResponseEntity.ok(cupones);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo cupones activos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/vendedor/{vendedorId}/contador")
    public ResponseEntity<Map<String, Object>> obtenerContadorPorVendedor(@PathVariable Long vendedorId) {
        try {
            System.out.println("🔍 Obteniendo contador de cupones para vendedor: " + vendedorId);
            Map<String, Object> contador = new HashMap<>();
            contador.put("total", cuponService.contarCuponesPorVendedor(vendedorId));
            contador.put("activos", cuponService.contarCuponesActivosPorVendedor(vendedorId));
            contador.put("totalUsos", cuponService.obtenerTotalUsosPorVendedor(vendedorId));
            System.out.println("✅ Contador obtenido para vendedor: " + vendedorId);
            return ResponseEntity.ok(contador);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo contador: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/vendedor/{vendedorId}/proximos-vencer")
    public ResponseEntity<List<Cupon>> obtenerCuponesProximosAVencerPorVendedor(
            @PathVariable Long vendedorId,
            @RequestParam(defaultValue = "7") int dias) {
        try {
            System.out.println("🔍 Obteniendo cupones próximos a vencer para vendedor: " + vendedorId);
            List<Cupon> cupones = cuponService.obtenerCuponesProximosAVencerPorVendedor(vendedorId, dias);
            System.out.println("✅ Cupones próximos a vencer obtenidos: " + cupones.size());
            return ResponseEntity.ok(cupones);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo cupones próximos a vencer: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== GESTIÓN DE ESTADO ====================

    @PutMapping("/{id}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarCupon(@PathVariable Long id) {
        try {
            System.out.println("🔍 Desactivando cupón ID: " + id);
            cuponService.desactivarCupon(id);
            Map<String, String> response = new HashMap<>();
            response.put("success", "true");
            response.put("mensaje", "Cupón desactivado correctamente");
            System.out.println("✅ Cupón desactivado exitosamente: " + id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error desactivando cupón: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("success", "false");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ==================== APLICACIÓN DE CUPONES ====================

    @PostMapping("/aplicar")
    public ResponseEntity<Map<String, Object>> aplicarCupon(@RequestBody Map<String, Object> request) {
        try {
            String codigo = request.get("codigo").toString();
            BigDecimal montoOriginal = new BigDecimal(request.get("montoOriginal").toString());
            System.out.println("🔍 Aplicando cupón: " + codigo + " a monto: " + montoOriginal);

            Cupon cupon = cuponService.validarYObtenerCupon(codigo);
            BigDecimal descuento = cuponService.calcularDescuento(cupon, montoOriginal);
            BigDecimal montoFinal = montoOriginal.subtract(descuento);

            Map<String, Object> response = new HashMap<>();
            response.put("cupon", cupon);
            response.put("montoOriginal", montoOriginal);
            response.put("descuento", descuento);
            response.put("montoFinal", montoFinal);
            response.put("success", true);
            response.put("mensaje", "Cupón aplicado correctamente");

            System.out.println("✅ Cupón aplicado exitosamente. Descuento: " + descuento);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error aplicando cupón: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/validar")
    public ResponseEntity<Map<String, Object>> validarCupon(@RequestBody Map<String, Object> request) {
        try {
            String codigo = request.get("codigo").toString();
            System.out.println("🔍 Validando cupón: " + codigo);

            Cupon cupon = cuponService.validarYObtenerCupon(codigo);

            Map<String, Object> response = new HashMap<>();
            response.put("valido", true);
            response.put("cupon", cupon);
            response.put("mensaje", "Cupón válido");

            System.out.println("✅ Cupón válido: " + codigo);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error validando cupón: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("valido", false);
            response.put("mensaje", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ==================== ESTADÍSTICAS Y REPORTES ====================

    @GetMapping("/estadisticas/vendedor/{vendedorId}")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasVendedor(@PathVariable Long vendedorId) {
        try {
            System.out.println("🔍 Obteniendo estadísticas para vendedor: " + vendedorId);
            Map<String, Object> estadisticas = cuponService.obtenerEstadisticasCompletas(vendedorId);
            System.out.println("✅ Estadísticas obtenidas para vendedor: " + vendedorId);
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo estadísticas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/mantenimiento/desactivar-vencidos")
    public ResponseEntity<Map<String, Object>> desactivarCuponesVencidos() {
        try {
            System.out.println("🔍 Ejecutando mantenimiento: desactivar cupones vencidos");
            int cuponesDesactivados = cuponService.desactivarCuponesVencidos();

            Map<String, Object> response = new HashMap<>();
            response.put("cuponesDesactivados", cuponesDesactivados);
            response.put("mensaje", "Mantenimiento completado");

            System.out.println("✅ Mantenimiento completado. Cupones desactivados: " + cuponesDesactivados);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error en mantenimiento: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ==================== HEALTH CHECK ====================

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("service", "cupones-api");
        response.put("version", "1.0.0");
        System.out.println("✅ Health check realizado");
        return ResponseEntity.ok(response);
    }
}
