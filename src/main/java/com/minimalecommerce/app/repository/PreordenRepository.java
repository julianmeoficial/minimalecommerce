package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Preorden;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.model.EstadoPreorden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PreordenRepository extends JpaRepository<Preorden, Long> {

    List<Preorden> findByUsuario(Usuario usuario);
    List<Preorden> findByUsuarioId(Long usuarioId);
    List<Preorden> findByProducto(Producto producto);
    List<Preorden> findByProductoId(Long productoId);
    List<Preorden> findByEstado(EstadoPreorden estado);

    @Query("SELECT p FROM Preorden p WHERE p.usuario.id = :usuarioId ORDER BY p.fechapreorden DESC")
    List<Preorden> findByUsuarioIdOrderByFechapreordenDesc(@Param("usuarioId") Long usuarioId);

    @Query("SELECT SUM(p.preciopreorden * p.cantidad) FROM Preorden p WHERE p.usuario.id = :usuarioId AND p.estado = :estado")
    BigDecimal calcularTotalPreordenesPorEstado(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoPreorden estado);

    Long countByUsuarioId(Long usuarioId);
    Long countByProductoId(Long productoId);
}
