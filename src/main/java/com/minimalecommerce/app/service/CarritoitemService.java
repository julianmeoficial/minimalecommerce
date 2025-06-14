package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Carritoitem;
import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.Pedido;
import com.minimalecommerce.app.model.Pedidoitem;
import com.minimalecommerce.app.model.EstadoPedido;
import com.minimalecommerce.app.repository.CarritoitemRepository;
import com.minimalecommerce.app.repository.ProductoRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import com.minimalecommerce.app.repository.PedidoRepository;
import com.minimalecommerce.app.repository.PedidoitemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class CarritoitemService {

    @Autowired
    private CarritoitemRepository carritoitemRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private PedidoitemRepository pedidoitemRepository;

    // ==================== OPERACIONES BÁSICAS DEL CARRITO ====================

    public List<Carritoitem> obtenerCarritoPorUsuario(Long usuarioId) {
        return carritoitemRepository.findByUsuarioId(usuarioId);
    }

    public Carritoitem agregarProductoAlCarrito(Long usuarioId, Long productoId, Integer cantidad) {
        System.out.println("🔍 Service - Iniciando agregarProductoAlCarrito");
        System.out.println("🔍 Service - Usuario: " + usuarioId + ", Producto: " + productoId + ", Cantidad: " + cantidad);

        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));

            Producto producto = productoRepository.findById(productoId)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productoId));

            System.out.println("✅ Usuario encontrado: " + usuario.getNombre());
            System.out.println("✅ Producto encontrado: " + producto.getNombre());
            System.out.println("✅ Stock disponible: " + producto.getStock());

            if (producto.getStock() < cantidad) {
                throw new RuntimeException("Stock insuficiente. Disponible: " + producto.getStock());
            }

            // Verificar si ya existe el item
            Optional<Carritoitem> itemExistente = carritoitemRepository.findByUsuarioIdAndProductoId(usuarioId, productoId);

            if (itemExistente.isPresent()) {
                Carritoitem item = itemExistente.get();
                int nuevaCantidad = item.getCantidad() + cantidad;

                if (producto.getStock() < nuevaCantidad) {
                    throw new RuntimeException(
                            String.format("Ya tienes %d unidad(es) en el carrito. Stock máximo disponible: %d",
                                    item.getCantidad(), producto.getStock())
                    );
                }

                item.setCantidad(nuevaCantidad);
                System.out.println("🔄 Actualizando item existente a cantidad: " + nuevaCantidad);
                return carritoitemRepository.save(item);
            } else {
                Carritoitem nuevoItem = new Carritoitem(usuario, producto, cantidad);
                System.out.println("➕ Creando nuevo item en carrito");
                return carritoitemRepository.save(nuevoItem);
            }
        } catch (Exception e) {
            System.err.println("❌ Error en service agregarProductoAlCarrito: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Carritoitem actualizarCantidad(Long itemId, Integer nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a 0");
        }

        Carritoitem item = carritoitemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item del carrito no encontrado"));

        if (item.getProducto().getStock() < nuevaCantidad) {
            throw new RuntimeException("Stock insuficiente. Disponible: " + item.getProducto().getStock());
        }

        item.setCantidad(nuevaCantidad);
        return carritoitemRepository.save(item);
    }

    public void eliminarItem(Long itemId) {
        carritoitemRepository.deleteById(itemId);
    }

    public void limpiarCarritoPorUsuario(Long usuarioId) {
        carritoitemRepository.deleteByUsuarioId(usuarioId);
    }

    public Integer contarProductosPorUsuario(Long usuarioId) {
        Integer total = carritoitemRepository.sumCantidadByUsuarioId(usuarioId);
        return total != null ? total : 0;
    }

    public long contarItemsPorUsuario(Long usuarioId) {
        return carritoitemRepository.countByUsuarioId(usuarioId);
    }

    // ==================== PROCESAMIENTO DE PEDIDOS ====================

    public Map<String, Object> procesarPedido(Long usuarioId, String direccionEntrega, Long cuponId) {
        // Obtener items del carrito
        List<Carritoitem> itemsCarrito = obtenerCarritoPorUsuario(usuarioId);

        if (itemsCarrito.isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        // Validar stock antes de procesar
        for (Carritoitem item : itemsCarrito) {
            if (item.getProducto().getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + item.getProducto().getNombre());
            }
        }

        // Calcular total
        BigDecimal total = itemsCarrito.stream()
                .map(Carritoitem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Crear pedido
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setFechapedido(LocalDateTime.now());
        pedido.setTotal(total);
        pedido.setEstado(EstadoPedido.PENDIENTE);
        pedido.setDireccionentrega(direccionEntrega);

        Pedido pedidoCreado = pedidoRepository.save(pedido);

        // Crear items del pedido
        List<Pedidoitem> itemsPedido = new ArrayList<>();
        for (Carritoitem itemCarrito : itemsCarrito) {
            Pedidoitem pedidoItem = new Pedidoitem();
            pedidoItem.setPedido(pedidoCreado);
            pedidoItem.setProducto(itemCarrito.getProducto());
            pedidoItem.setCantidad(itemCarrito.getCantidad());
            pedidoItem.setPreciounitario(itemCarrito.getPreciounitario());

            Pedidoitem itemCreado = pedidoitemRepository.save(pedidoItem);
            itemsPedido.add(itemCreado);

            // Actualizar stock del producto
            Producto producto = itemCarrito.getProducto();
            producto.setStock(producto.getStock() - itemCarrito.getCantidad());
            productoRepository.save(producto);
        }

        // Limpiar carrito
        limpiarCarritoPorUsuario(usuarioId);

        // ✅ PREPARAR RESPUESTA COMPLETA PARA EL FRONTEND
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("pedido", pedidoCreado);
        response.put("items", itemsPedido);
        response.put("cantidadItems", itemsPedido.size());
        response.put("subtotal", total);
        response.put("mensaje", "Pedido procesado exitosamente");

        return response;
    }
}
