package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Pedido;
import com.minimalecommerce.app.model.Pedidoitem;
import com.minimalecommerce.app.model.EstadoPedido;
import com.minimalecommerce.app.service.PedidoService;
import com.minimalecommerce.app.service.PedidoitemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private PedidoitemService pedidoitemService;

    // ==================== PARA COMPRADORES ====================

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Map<String, Object>>> obtenerPedidosPorUsuario(@PathVariable Long usuarioId) {
        try {
            System.out.println("📋 Obteniendo pedidos para usuario: " + usuarioId);

            List<Pedido> pedidos = pedidoService.obtenerPedidosPorUsuario(usuarioId);
            List<Map<String, Object>> pedidosConDetalles = new ArrayList<>();

            for (Pedido pedido : pedidos) {
                Map<String, Object> pedidoData = new HashMap<>();
                pedidoData.put("id", pedido.getId());
                pedidoData.put("fechapedido", pedido.getFechapedido());
                pedidoData.put("total", pedido.getTotal());
                pedidoData.put("estado", pedido.getEstado());
                pedidoData.put("direccionentrega", pedido.getDireccionentrega());

                // Obtener items del pedido
                List<Pedidoitem> items = pedidoitemService.obtenerItemsPorPedido(pedido.getId());
                pedidoData.put("items", items);
                pedidoData.put("cantidadItems", items.size());

                pedidosConDetalles.add(pedidoData);
            }

            System.out.println("✅ Pedidos obtenidos: " + pedidosConDetalles.size());
            return ResponseEntity.ok(pedidosConDetalles);

        } catch (Exception e) {
            System.err.println("❌ Error obteniendo pedidos: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPedidoPorId(@PathVariable Long id) {
        try {
            System.out.println("🔍 Obteniendo pedido: " + id);

            Optional<Pedido> pedidoOpt = pedidoService.obtenerPedidoPorId(id);

            if (pedidoOpt.isPresent()) {
                Pedido pedido = pedidoOpt.get();
                List<Pedidoitem> items = pedidoitemService.obtenerItemsPorPedido(id);

                Map<String, Object> response = new HashMap<>();
                response.put("pedido", pedido);
                response.put("items", items);
                response.put("cantidadItems", items.size());

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            System.err.println("❌ Error obteniendo pedido: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== PARA VENDEDORES ====================

    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<List<Map<String, Object>>> obtenerPedidosPorVendedor(@PathVariable Long vendedorId) {
        try {
            System.out.println("🏪 Obteniendo pedidos para vendedor: " + vendedorId);

            List<Map<String, Object>> pedidosVendedor = pedidoService.obtenerPedidosPorVendedor(vendedorId);

            System.out.println("✅ Pedidos de vendedor obtenidos: " + pedidosVendedor.size());
            return ResponseEntity.ok(pedidosVendedor);

        } catch (Exception e) {
            System.err.println("❌ Error obteniendo pedidos de vendedor: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Map<String, Object>> actualizarEstadoPedido(@PathVariable Long id,
                                                                      @RequestBody Map<String, String> request) {
        try {
            String nuevoEstado = request.get("estado");
            System.out.println("🔄 Actualizando estado del pedido " + id + " a: " + nuevoEstado);

            EstadoPedido estado = EstadoPedido.valueOf(nuevoEstado.toUpperCase());
            Pedido pedidoActualizado = pedidoService.actualizarEstadoPedido(id, estado);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("pedido", pedidoActualizado);
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

    // ==================== ESTADÍSTICAS ====================

    @GetMapping("/usuario/{usuarioId}/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasPedidos(@PathVariable Long usuarioId) {
        try {
            Map<String, Object> estadisticas = new HashMap<>();

            List<Pedido> todosPedidos = pedidoService.obtenerPedidosPorUsuario(usuarioId);
            estadisticas.put("totalPedidos", todosPedidos.size());

            // Contar por estados
            long pendientes = todosPedidos.stream().filter(p -> p.getEstado() == EstadoPedido.PENDIENTE).count();
            long confirmados = todosPedidos.stream().filter(p -> p.getEstado() == EstadoPedido.CONFIRMADO).count();
            long enviados = todosPedidos.stream().filter(p -> p.getEstado() == EstadoPedido.ENVIADO).count();
            long entregados = todosPedidos.stream().filter(p -> p.getEstado() == EstadoPedido.ENTREGADO).count();
            long cancelados = todosPedidos.stream().filter(p -> p.getEstado() == EstadoPedido.CANCELADO).count();

            estadisticas.put("pendientes", pendientes);
            estadisticas.put("confirmados", confirmados);
            estadisticas.put("enviados", enviados);
            estadisticas.put("entregados", entregados);
            estadisticas.put("cancelados", cancelados);

            // Total gastado
            BigDecimal totalGastado = todosPedidos.stream()
                    .map(Pedido::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            estadisticas.put("totalGastado", totalGastado);

            return ResponseEntity.ok(estadisticas);

        } catch (Exception e) {
            System.err.println("❌ Error obteniendo estadísticas: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
