package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Pedido;
import com.minimalecommerce.app.model.EstadoPedido;
import com.minimalecommerce.app.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    // ==================== MÉTODOS BÁSICOS ====================

    public List<Pedido> obtenerTodosPedidos() {
        return pedidoRepository.findAll();
    }

    public Optional<Pedido> obtenerPedidoPorId(Long id) {
        return pedidoRepository.findById(id);
    }

    public Pedido crearPedido(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }

    public List<Pedido> obtenerPedidosPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByFechapedidoDesc(usuarioId);
    }

    public List<Pedido> obtenerPedidosPorEstado(EstadoPedido estado) {
        return pedidoRepository.findByEstadoOrderByFechapedidoDesc(estado);
    }

    // ==================== MÉTODOS PARA VENDEDORES ====================

    public List<Map<String, Object>> obtenerPedidosPorVendedor(Long vendedorId) {
        List<Object[]> resultados = pedidoRepository.findPedidosByVendedorId(vendedorId);

        Map<Long, Map<String, Object>> pedidosMap = new HashMap<>();

        for (Object[] resultado : resultados) {
            Long pedidoId = (Long) resultado[0];

            if (!pedidosMap.containsKey(pedidoId)) {
                Map<String, Object> pedidoData = new HashMap<>();
                pedidoData.put("pedidoId", resultado[0]);
                pedidoData.put("fechaPedido", resultado[1]);
                pedidoData.put("total", resultado[2]);
                pedidoData.put("estado", resultado[3]);
                pedidoData.put("compradorNombre", resultado[4]);
                pedidoData.put("direccionEntrega", resultado[5]);

                pedidosMap.put(pedidoId, pedidoData);
            }
        }

        return new ArrayList<>(pedidosMap.values());
    }

    // ==================== GESTIÓN DE ESTADOS ====================

    public Pedido actualizarEstadoPedido(Long id, EstadoPedido estado) {
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(id);

        if (pedidoOpt.isPresent()) {
            Pedido pedido = pedidoOpt.get();
            pedido.setEstado(estado);
            return pedidoRepository.save(pedido);
        }

        throw new RuntimeException("Pedido no encontrado con ID: " + id);
    }

    public Pedido actualizarPedido(Long id, Pedido pedido) {
        if (pedidoRepository.existsById(id)) {
            pedido.setId(id);
            return pedidoRepository.save(pedido);
        }
        throw new RuntimeException("Pedido no encontrado con ID: " + id);
    }

    public void eliminarPedido(Long id) {
        pedidoRepository.deleteById(id);
    }

    // ==================== MÉTODOS ADICIONALES ====================

    public List<Pedido> obtenerPedidosPorUsuarioYEstado(Long usuarioId, EstadoPedido estado) {
        return pedidoRepository.findByUsuarioIdAndEstado(usuarioId, estado);
    }

    public Pedido cancelarPedido(Long pedidoId, String motivo) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (pedido.getEstado() == EstadoPedido.ENTREGADO) {
            throw new RuntimeException("No se puede cancelar un pedido ya entregado");
        }

        pedido.setEstado(EstadoPedido.CANCELADO);
        return pedidoRepository.save(pedido);
    }

    public List<Pedido> obtenerPedidosRecientesPorUsuario(Long usuarioId, int limite) {
        List<Pedido> todosPedidos = pedidoRepository.findByUsuarioIdOrderByFechapedidoDesc(usuarioId);
        return todosPedidos.stream().limit(limite).toList();
    }
}
