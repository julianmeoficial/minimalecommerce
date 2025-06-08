package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // Obtener todos los productos activos
    @GetMapping
    public ResponseEntity<List<Producto>> obtenerTodosProductos() {
        List<Producto> productos = productoService.obtenerProductosActivos();
        return ResponseEntity.ok(productos);
    }

    // Obtener producto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable Long id) {
        Optional<Producto> producto = productoService.obtenerProductoPorId(id);
        return producto.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Obtener productos por categoría
    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<Producto>> obtenerProductosPorCategoria(@PathVariable Long categoriaId) {
        List<Producto> productos = productoService.obtenerProductosPorCategoria(categoriaId);
        return ResponseEntity.ok(productos);
    }

    // Obtener productos disponibles (con stock)
    @GetMapping("/disponibles")
    public ResponseEntity<List<Producto>> obtenerProductosDisponibles() {
        List<Producto> productos = productoService.obtenerProductosDisponibles();
        return ResponseEntity.ok(productos);
    }

    // Crear nuevo producto
    @PostMapping
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto producto) {
        Producto nuevoProducto = productoService.crearProducto(producto);
        return ResponseEntity.ok(nuevoProducto);
    }

    // Actualizar producto
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @RequestBody Producto producto) {
        Producto productoActualizado = productoService.actualizarProducto(id, producto);
        return ResponseEntity.ok(productoActualizado);
    }

    // Desactivar producto
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> desactivarProducto(@PathVariable Long id) {
        productoService.desactivarProducto(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Producto desactivado correctamente");
        return ResponseEntity.ok(response);
    }

    // Buscar productos por nombre
    @GetMapping("/buscar/{nombre}")
    public ResponseEntity<List<Producto>> buscarProductos(@PathVariable String nombre) {
        List<Producto> productos = productoService.buscarProductos(nombre);
        return ResponseEntity.ok(productos);
    }

    // Buscar productos por rango de precio
    @GetMapping("/precio")
    public ResponseEntity<List<Producto>> buscarProductosPorPrecio(
            @RequestParam BigDecimal precioMin,
            @RequestParam BigDecimal precioMax) {
        List<Producto> productos = productoService.buscarProductosPorPrecio(precioMin, precioMax);
        return ResponseEntity.ok(productos);
    }

    // Obtener productos populares
    @GetMapping("/populares")
    public ResponseEntity<List<Producto>> obtenerProductosPopulares() {
        List<Producto> productos = productoService.obtenerProductosPopulares();
        return ResponseEntity.ok(productos);
    }

    // Actualizar stock
    @PutMapping("/{id}/stock")
    public ResponseEntity<Map<String, String>> actualizarStock(
            @PathVariable Long id,
            @RequestParam Integer nuevoStock) {
        productoService.actualizarStock(id, nuevoStock);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Stock actualizado correctamente");
        return ResponseEntity.ok(response);
    }
}
