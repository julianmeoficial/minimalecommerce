package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Pedido;
import com.minimalecommerce.app.model.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Consultas básicas por usuario
    List<Pedido> findByUsuarioId(Long usuarioId);

    List<Pedido> findByEstado(EstadoPedido estado);

    List<Pedido> findByUsuarioIdAndEstado(Long usuarioId, EstadoPedido estado);

    @Query("SELECT p FROM Pedido p WHERE p.usuario.id = :usuarioId ORDER BY p.fechapedido DESC")
    List<Pedido> findByUsuarioIdOrderByFechapedidoDesc(@Param("usuarioId") Long usuarioId);

    // ✅ CONSULTA PARA VENDEDORES (ya corregida)
    @Query("SELECT DISTINCT p.id, p.fechapedido, p.total, p.estado, p.usuario.nombre, p.direccionentrega " +
            "FROM Pedido p JOIN Pedidoitem pi ON p.id = pi.pedido.id " +
            "WHERE pi.producto.vendedor.id = :vendedorId " +
            "ORDER BY p.fechapedido DESC")
    List<Object[]> findPedidosByVendedorId(@Param("vendedorId") Long vendedorId);

    // Consultas adicionales útiles
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.usuario.id = :usuarioId")
    Long countByUsuarioId(@Param("usuarioId") Long usuarioId);

    @Query("SELECT p FROM Pedido p WHERE p.estado = :estado ORDER BY p.fechapedido DESC")
    List<Pedido> findByEstadoOrderByFechapedidoDesc(@Param("estado") EstadoPedido estado);
}
