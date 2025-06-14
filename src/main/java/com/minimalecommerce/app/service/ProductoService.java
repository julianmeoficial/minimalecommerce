package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.model.Categoria;
import com.minimalecommerce.app.repository.ProductoRepository;
import com.minimalecommerce.app.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    // Obtener todos los productos activos
    public List<Producto> obtenerProductosActivos() {
        return productoRepository.findByActivoTrue();
    }

    // Obtener productos por categoría
    public List<Producto> obtenerProductosPorCategoria(Long categoriaId) {
        return productoRepository.findByCategoriaIdAndStockDisponible(categoriaId);
    }

    // Obtener productos disponibles (con stock)
    public List<Producto> obtenerProductosDisponibles() {
        return productoRepository.findProductosDisponibles();
    }

    // Crear nuevo producto
    public Producto crearProducto(Producto producto) {
        if (producto.getCategoria() == null || producto.getCategoria().getId() == null) {
            throw new RuntimeException("Debe especificar una categoría válida");
        }

        Optional<Categoria> categoria = categoriaRepository.findById(producto.getCategoria().getId());
        if (!categoria.isPresent()) {
            throw new RuntimeException("Categoría no encontrada");
        }

        producto.setCategoria(categoria.get());
        producto.setActivo(true);
        return productoRepository.save(producto);
    }

    // Actualizar producto
    public Producto actualizarProducto(Long id, Producto producto) {
        Optional<Producto> productoExistente = productoRepository.findById(id);
        if (productoExistente.isPresent()) {
            producto.setId(id);
            return productoRepository.save(producto);
        }
        throw new RuntimeException("Producto no encontrado");
    }

    // Desactivar producto
    public void desactivarProducto(Long id) {
        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isPresent()) {
            producto.get().setActivo(false);
            productoRepository.save(producto.get());
        }
    }

    // Buscar productos por nombre
    public List<Producto> buscarProductos(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public List<Producto> obtenerProductosPreorden() {
        return productoRepository.findByEspreordenTrueAndActivoTrue();
    }

    // Buscar productos por rango de precio
    public List<Producto> buscarProductosPorPrecio(BigDecimal precioMin, BigDecimal precioMax) {
        return productoRepository.findByPrecioBetween(precioMin, precioMax);
    }

    // Obtener productos populares
    public List<Producto> obtenerProductosPopulares() {
        return productoRepository.findProductosPopulares();
    }

    // Actualizar stock
    public void actualizarStock(Long productoId, Integer nuevoStock) {
        Optional<Producto> producto = productoRepository.findById(productoId);
        if (producto.isPresent()) {
            producto.get().setStock(nuevoStock);
            productoRepository.save(producto.get());
        }
    }

    public List<Producto> obtenerProductosPorVendedor(Long vendedorId) {
        // Traer TODOS los productos del vendedor (activos y pausados)
        return productoRepository.findByVendedorId(vendedorId);
    }

    // Eliminar producto completamente
    public void eliminarProductoCompleto(Long id) {
        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isPresent()) {
            productoRepository.deleteById(id);
        } else {
            throw new RuntimeException("Producto no encontrado");
        }
    }

    // Método para obtener producto por ID
    public Producto obtenerProductoPorId(Long id) {
        Optional<Producto> producto = productoRepository.findById(id);
        return producto.orElse(null);
    }

    // O si prefieres mantener la consistencia con Optional:
    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

}
