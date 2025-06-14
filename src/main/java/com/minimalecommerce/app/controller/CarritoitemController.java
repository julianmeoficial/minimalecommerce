package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Carritoitem;
import com.minimalecommerce.app.service.CarritoitemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/carrito")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class CarritoitemController {

    @Autowired
    private CarritoitemService carritoitemService;

    // ==================== OPERACIONES DEL CARRITO ====================

    @PostMapping("/agregar")
    public ResponseEntity<Map<String, Object>> agregarProducto(@RequestBody Map<String, Object> request) {
        try {
            Long usuarioId = Long.valueOf(request.get("usuarioId").toString());
            Long productoId = Long.valueOf(request.get("productoId").toString());
            Integer cantidad = Integer.valueOf(request.get("cantidad").toString());

            System.out.println("🛒 Agregando al carrito - Usuario: " + usuarioId + ", Producto: " + productoId);

            Carritoitem item = carritoitemService.agregarProductoAlCarrito(usuarioId, productoId, cantidad);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("item", item);
            response.put("mensaje", "Producto agregado al carrito correctamente");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error agregando al carrito: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Carritoitem>> obtenerCarritoPorUsuario(@PathVariable Long usuarioId) {
        try {
            System.out.println("🔍 Obteniendo carrito para usuario: " + usuarioId);
            List<Carritoitem> items = carritoitemService.obtenerCarritoPorUsuario(usuarioId);
            System.out.println("✅ Carrito obtenido: " + items.size() + " items");
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo carrito: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/actualizar-cantidad")
    public ResponseEntity<Map<String, Object>> actualizarCantidad(@RequestBody Map<String, Object> request) {
        try {
            Long itemId = Long.valueOf(request.get("itemId").toString());
            Integer cantidad = Integer.valueOf(request.get("cantidad").toString());

            Carritoitem item = carritoitemService.actualizarCantidad(itemId, cantidad);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("item", item);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/eliminar/{itemId}")
    public ResponseEntity<Map<String, String>> eliminarItem(@PathVariable Long itemId) {
        try {
            carritoitemService.eliminarItem(itemId);

            Map<String, String> response = new HashMap<>();
            response.put("success", "true");
            response.put("mensaje", "Item eliminado correctamente");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("success", "false");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/limpiar/{usuarioId}")
    public ResponseEntity<Map<String, String>> limpiarCarrito(@PathVariable Long usuarioId) {
        try {
            carritoitemService.limpiarCarritoPorUsuario(usuarioId);

            Map<String, String> response = new HashMap<>();
            response.put("success", "true");
            response.put("mensaje", "Carrito limpiado correctamente");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("success", "false");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/contar/{usuarioId}")
    public ResponseEntity<Map<String, Object>> contarItems(@PathVariable Long usuarioId) {
        try {
            Integer cantidadProductos = carritoitemService.contarProductosPorUsuario(usuarioId);
            long cantidadItems = carritoitemService.contarItemsPorUsuario(usuarioId);

            Map<String, Object> response = new HashMap<>();
            response.put("cantidadProductos", cantidadProductos);
            response.put("cantidadItems", cantidadItems);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("cantidadProductos", 0);
            response.put("cantidadItems", 0);
            return ResponseEntity.ok(response);
        }
    }

    // ==================== PROCESAMIENTO DE PEDIDOS ====================

    @PostMapping("/procesar-pedido")
    public ResponseEntity<Map<String, Object>> procesarPedido(@RequestBody Map<String, Object> request) {
        try {
            Long usuarioId = Long.valueOf(request.get("usuarioId").toString());
            String direccionEntrega = request.get("direccionEntrega").toString();
            Long cuponId = request.get("cuponId") != null ?
                    Long.valueOf(request.get("cuponId").toString()) : null;

            System.out.println("💳 Procesando pedido para usuario: " + usuarioId);
            System.out.println("📍 Dirección: " + direccionEntrega);
            System.out.println("🎫 Cupón ID: " + cuponId);

            Map<String, Object> resultado = carritoitemService.procesarPedido(usuarioId, direccionEntrega, cuponId);

            System.out.println("✅ Pedido procesado exitosamente");
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            System.err.println("❌ Error procesando pedido: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
