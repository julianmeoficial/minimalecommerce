package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // Buscar productos por categoría
    List<Producto> findByCategoria(Categoria categoria);

    // Buscar productos por ID de categoría
    List<Producto> findByCategoriaId(Long categoriaId);

    // Buscar productos activos
    List<Producto> findByActivoTrue();

    // Buscar productos activos por categoría
    List<Producto> findByCategoriaAndActivoTrue(Categoria categoria);

    // Buscar productos por nombre
    List<Producto> findByNombreContainingIgnoreCase(String nombre);

    // Buscar productos con stock disponible
    @Query("SELECT p FROM Producto p WHERE p.stock > 0 AND p.activo = true")
    List<Producto> findProductosDisponibles();

    // Buscar productos por rango de precio
    @Query("SELECT p FROM Producto p WHERE p.precio BETWEEN :precioMin AND :precioMax AND p.activo = true")
    List<Producto> findByPrecioBetween(@Param("precioMin") BigDecimal precioMin, @Param("precioMax") BigDecimal precioMax);

    // Buscar productos más vendidos (simulado por stock bajo)
    @Query("SELECT p FROM Producto p WHERE p.activo = true ORDER BY p.stock ASC")
    List<Producto> findProductosPopulares();

    // Buscar productos por categoría y con stock
    @Query("SELECT p FROM Producto p WHERE p.categoria.id = :categoriaId AND p.stock > 0 AND p.activo = true")
    List<Producto> findByCategoriaIdAndStockDisponible(@Param("categoriaId") Long categoriaId);
}
