package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Pedidoitem;
import com.minimalecommerce.app.model.Pedido;
import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.repository.PedidoitemRepository;
import com.minimalecommerce.app.repository.PedidoRepository;
import com.minimalecommerce.app.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoitemService {

    @Autowired
    private PedidoitemRepository pedidoitemRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // Obtener todos los items de pedidos
    public List<Pedidoitem> obtenerTodosPedidoitems() {
        return pedidoitemRepository.findAll();
    }

    // Obtener item por ID
    public Optional<Pedidoitem> obtenerPedidoitemPorId(Long id) {
        return pedidoitemRepository.findById(id);
    }

    // Crear nuevo item de pedido
    public Pedidoitem crearPedidoitem(Pedidoitem pedidoitem) {
        if (pedidoitem.getPedido() == null || pedidoitem.getPedido().getId() == null) {
            throw new RuntimeException("Debe especificar un pedido válido");
        }

        if (pedidoitem.getProducto() == null || pedidoitem.getProducto().getId() == null) {
            throw new RuntimeException("Debe especificar un producto válido");
        }

        Optional<Pedido> pedido = pedidoRepository.findById(pedidoitem.getPedido().getId());
        if (!pedido.isPresent()) {
            throw new RuntimeException("Pedido no encontrado");
        }

        Optional<Producto> producto = productoRepository.findById(pedidoitem.getProducto().getId());
        if (!producto.isPresent()) {
            throw new RuntimeException("Producto no encontrado");
        }

        pedidoitem.setPedido(pedido.get());
        pedidoitem.setProducto(producto.get());

        // Establecer precio unitario del producto actual si no se especifica
        if (pedidoitem.getPreciounitario() == null) {
            pedidoitem.setPreciounitario(producto.get().getPrecio());
        }

        return pedidoitemRepository.save(pedidoitem);
    }

    // Obtener items por pedido
    public List<Pedidoitem> obtenerItemsPorPedido(Long pedidoId) {
        return pedidoitemRepository.findByPedidoId(pedidoId);
    }

    // Actualizar item de pedido
    public Pedidoitem actualizarPedidoitem(Long id, Pedidoitem pedidoitem) {
        Optional<Pedidoitem> itemExistente = pedidoitemRepository.findById(id);
        if (itemExistente.isPresent()) {
            pedidoitem.setId(id);
            return pedidoitemRepository.save(pedidoitem);
        }
        throw new RuntimeException("Item de pedido no encontrado");
    }

    // Eliminar item de pedido
    public void eliminarPedidoitem(Long id) {
        pedidoitemRepository.deleteById(id);
    }
}
