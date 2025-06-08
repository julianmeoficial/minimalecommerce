package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Pedido;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByUsuario(Usuario usuario);

    // ASEGÚRATE DE TENER ESTE MÉTODO:
    List<Pedido> findByUsuarioId(Long usuarioId);

    List<Pedido> findByEstado(EstadoPedido estado);

    @Query("SELECT p FROM Pedido p WHERE p.usuario.id = :usuarioId ORDER BY p.fechapedido DESC")
    List<Pedido> findByUsuarioIdOrderByFechapedidoDesc(@Param("usuarioId") Long usuarioId);

    // MÉTODOS ADICIONALES ÚTILES:
    Long countByUsuarioId(Long usuarioId);

    @Query("SELECT p FROM Pedido p WHERE p.estado = :estado ORDER BY p.fechapedido DESC")
    List<Pedido> findByEstadoOrderByFechapedidoDesc(@Param("estado") EstadoPedido estado);
}
