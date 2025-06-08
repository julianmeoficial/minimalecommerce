package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Carritoitem;
import com.minimalecommerce.app.service.CarritoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    @Autowired
    private CarritoService carritoService;

    // Obtener carrito por usuario
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Carritoitem>> obtenerCarritoPorUsuario(@PathVariable Long usuarioId) {
        List<Carritoitem> carrito = carritoService.obtenerCarritoPorUsuario(usuarioId);
        return ResponseEntity.ok(carrito);
    }

    // Agregar producto al carrito
    @PostMapping("/agregar")
    public ResponseEntity<Carritoitem> agregarProductoAlCarrito(@RequestBody Map<String, Object> request) {
        Long usuarioId = Long.valueOf(request.get("usuarioId").toString());
        Long productoId = Long.valueOf(request.get("productoId").toString());
        Integer cantidad = Integer.valueOf(request.get("cantidad").toString());

        Carritoitem item = carritoService.agregarProductoAlCarrito(usuarioId, productoId, cantidad);
        return ResponseEntity.ok(item);
    }

    // Actualizar cantidad de item
    @PutMapping("/item/{itemId}")
    public ResponseEntity<Map<String, Object>> actualizarCantidadItem(
            @PathVariable Long itemId,
            @RequestParam Integer cantidad) {

        Map<String, Object> response = new HashMap<>();

        if (cantidad <= 0) {
            carritoService.eliminarItemDelCarrito(itemId);
            response.put("message", "Item eliminado del carrito");
            response.put("item", null);
        } else {
            Carritoitem item = carritoService.actualizarCantidadItem(itemId, cantidad);
            response.put("message", "Cantidad actualizada");
            response.put("item", item);
        }

        return ResponseEntity.ok(response);
    }

    // Eliminar item del carrito
    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<Map<String, String>> eliminarItemDelCarrito(@PathVariable Long itemId) {
        carritoService.eliminarItemDelCarrito(itemId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Item eliminado del carrito");
        return ResponseEntity.ok(response);
    }

    // Limpiar carrito completo
    @DeleteMapping("/usuario/{usuarioId}")
    public ResponseEntity<Map<String, String>> limpiarCarrito(@PathVariable Long usuarioId) {
        carritoService.limpiarCarrito(usuarioId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Carrito limpiado correctamente");
        return ResponseEntity.ok(response);
    }

    // Calcular total del carrito
    @GetMapping("/total/{usuarioId}")
    public ResponseEntity<Map<String, Object>> calcularTotalCarrito(@PathVariable Long usuarioId) {
        BigDecimal total = carritoService.calcularTotalCarrito(usuarioId);
        Long cantidadItems = carritoService.contarItemsCarrito(usuarioId);
        Integer cantidadProductos = carritoService.obtenerCantidadTotalProductos(usuarioId);

        Map<String, Object> response = new HashMap<>();
        response.put("total", total);
        response.put("cantidadItems", cantidadItems);
        response.put("cantidadProductos", cantidadProductos);

        return ResponseEntity.ok(response);
    }

    // Contar items en el carrito
    @GetMapping("/contar/{usuarioId}")
    public ResponseEntity<Map<String, Object>> contarItemsCarrito(@PathVariable Long usuarioId) {
        Long cantidadItems = carritoService.contarItemsCarrito(usuarioId);
        Integer cantidadProductos = carritoService.obtenerCantidadTotalProductos(usuarioId);

        Map<String, Object> response = new HashMap<>();
        response.put("cantidadItems", cantidadItems);
        response.put("cantidadProductos", cantidadProductos);

        return ResponseEntity.ok(response);
    }
}
