package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Carritoitem;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarritoitemRepository extends JpaRepository<Carritoitem, Long> {

    // Buscar items del carrito por usuario
    List<Carritoitem> findByUsuario(Usuario usuario);

    // Buscar items del carrito por ID de usuario
    List<Carritoitem> findByUsuarioId(Long usuarioId);

    // Buscar item específico por usuario y producto
    Optional<Carritoitem> findByUsuarioAndProducto(Usuario usuario, Producto producto);

    // Buscar item específico por IDs de usuario y producto
    Optional<Carritoitem> findByUsuarioIdAndProductoId(Long usuarioId, Long productoId);

    // Contar items en el carrito de un usuario
    @Query("SELECT COUNT(c) FROM Carritoitem c WHERE c.usuario.id = :usuarioId")
    Long countByUsuarioId(@Param("usuarioId") Long usuarioId);

    // Calcular total del carrito de un usuario
    @Query("SELECT SUM(c.preciounitario * c.cantidad) FROM Carritoitem c WHERE c.usuario.id = :usuarioId")
    BigDecimal calcularTotalCarrito(@Param("usuarioId") Long usuarioId);

    // Obtener cantidad total de productos en el carrito
    @Query("SELECT SUM(c.cantidad) FROM Carritoitem c WHERE c.usuario.id = :usuarioId")
    Integer obtenerCantidadTotalItems(@Param("usuarioId") Long usuarioId);

    // Eliminar todos los items del carrito de un usuario
    void deleteByUsuarioId(Long usuarioId);

    // Buscar items del carrito ordenados por fecha (más recientes primero)
    @Query("SELECT c FROM Carritoitem c WHERE c.usuario.id = :usuarioId ORDER BY c.fechaagregado DESC")
    List<Carritoitem> findByUsuarioIdOrderByFechaagregadoDesc(@Param("usuarioId") Long usuarioId);
}
