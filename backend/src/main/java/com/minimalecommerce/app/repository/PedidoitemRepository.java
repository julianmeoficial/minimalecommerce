package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Pedidoitem;
import com.minimalecommerce.app.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoitemRepository extends JpaRepository<Pedidoitem, Long> {

    List<Pedidoitem> findByPedido(Pedido pedido);
    List<Pedidoitem> findByPedidoId(Long pedidoId);
}
