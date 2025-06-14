package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.model.Categoria;
import com.minimalecommerce.app.service.ProductoService;
import com.minimalecommerce.app.service.CategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private CategoriaService categoriaService;

    // Obtener todos los productos activos
    @GetMapping
    public ResponseEntity<List<Producto>> obtenerTodosProductos() {
        List<Producto> productos = productoService.obtenerProductosActivos();
        return ResponseEntity.ok(productos);
    }

    // Obtener producto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable Long id) {
        Producto producto = productoService.obtenerProductoPorId(id); // ✅ CORRECTO

        if (producto != null) {
            return ResponseEntity.ok(producto);
        } else {
            return ResponseEntity.notFound().build();
        }
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

    //Subir imagenes y crear producto con imagen

    @PostMapping("/crear-con-imagen")
    public ResponseEntity<Map<String, Object>> crearProductoConImagen(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("nombre") String nombre,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("precio") BigDecimal precio,
            @RequestParam("stock") Integer stock,
            @RequestParam("categoriaId") Long categoriaId) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Lógica de subida de imagen
            String nombreImagen = null;
            if (!archivo.isEmpty()) {
                String UPLOAD_DIR = "src/main/resources/static/imagenes-productos/";
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }

                String originalFileName = archivo.getOriginalFilename();
                String fileExtension = "";
                if (originalFileName != null && originalFileName.contains(".")) {
                    fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
                }

                nombreImagen = UUID.randomUUID().toString() + fileExtension;
                Path rutaArchivo = Paths.get(UPLOAD_DIR + nombreImagen);
                Files.copy(archivo.getInputStream(), rutaArchivo, StandardCopyOption.REPLACE_EXISTING);
            }

            // Crear producto con categoría correcta
            Producto producto = new Producto();
            producto.setNombre(nombre);
            producto.setDescripcion(descripcion);
            producto.setPrecio(precio);
            producto.setStock(stock);
            producto.setImagen(nombreImagen);

            // CORREGIR: Buscar y asignar categoría
            Optional<Categoria> categoria = categoriaService.obtenerCategoriaPorId(categoriaId);
            if (categoria.isPresent()) {
                producto.setCategoria(categoria.get());
            } else {
                response.put("error", "Categoría no encontrada");
                return ResponseEntity.badRequest().body(response);
            }

            // Guardar producto
            Producto productoGuardado = productoService.crearProducto(producto);

            response.put("success", true);
            response.put("producto", productoGuardado);
            response.put("rutaImagen", nombreImagen != null ? "/imagenes-productos/" + nombreImagen : null);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("error", "Error al subir imagen: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        } catch (Exception e) {
            response.put("error", "Error al crear producto: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Obtener productos por vendedor
    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<List<Producto>> obtenerProductosPorVendedor(@PathVariable Long vendedorId) {
        try {
            List<Producto> productos = productoService.obtenerProductosPorVendedor(vendedorId);
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Eliminar producto completamente de la base de datos
    @DeleteMapping("/eliminar-completo/{id}")
    public ResponseEntity<Map<String, String>> eliminarProductoCompleto(@PathVariable Long id) {
        try {
            productoService.eliminarProductoCompleto(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Producto eliminado completamente de la base de datos");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error al eliminar producto: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/preorden")
    public ResponseEntity<List<Producto>> obtenerProductosPreorden() {
        try {
            List<Producto> productos = productoService.obtenerProductosPreorden();
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
