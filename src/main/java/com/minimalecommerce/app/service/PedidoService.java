package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Pedido;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.EstadoPedido;
import com.minimalecommerce.app.repository.PedidoRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Obtener todos los pedidos
    public List<Pedido> obtenerTodosPedidos() {
        return pedidoRepository.findAll();
    }

    // Obtener pedido por ID
    public Optional<Pedido> obtenerPedidoPorId(Long id) {
        return pedidoRepository.findById(id);
    }

    // Crear nuevo pedido
    public Pedido crearPedido(Pedido pedido) {
        if (pedido.getUsuario() == null || pedido.getUsuario().getId() == null) {
            throw new RuntimeException("Debe especificar un usuario válido");
        }

        Optional<Usuario> usuario = usuarioRepository.findById(pedido.getUsuario().getId());
        if (!usuario.isPresent()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        pedido.setUsuario(usuario.get());
        if (pedido.getEstado() == null) {
            pedido.setEstado(EstadoPedido.PENDIENTE);
        }

        return pedidoRepository.save(pedido);
    }

    // Obtener pedidos por usuario
    public List<Pedido> obtenerPedidosPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByFechapedidoDesc(usuarioId);
    }

    // Obtener pedidos por estado
    public List<Pedido> obtenerPedidosPorEstado(EstadoPedido estado) {
        return pedidoRepository.findByEstado(estado);
    }

    // Actualizar estado del pedido
    public Pedido actualizarEstadoPedido(Long pedidoId, EstadoPedido nuevoEstado) {
        Optional<Pedido> pedido = pedidoRepository.findById(pedidoId);
        if (pedido.isPresent()) {
            pedido.get().setEstado(nuevoEstado);
            return pedidoRepository.save(pedido.get());
        }
        throw new RuntimeException("Pedido no encontrado");
    }

    // Actualizar pedido
    public Pedido actualizarPedido(Long id, Pedido pedido) {
        Optional<Pedido> pedidoExistente = pedidoRepository.findById(id);
        if (pedidoExistente.isPresent()) {
            pedido.setId(id);
            return pedidoRepository.save(pedido);
        }
        throw new RuntimeException("Pedido no encontrado");
    }

    // Eliminar pedido
    public void eliminarPedido(Long id) {
        pedidoRepository.deleteById(id);
    }

    // Contar pedidos por usuario
    public Long contarPedidosPorUsuario(Long usuarioId) {
        return pedidoRepository.countByUsuarioId(usuarioId);
    }
}
