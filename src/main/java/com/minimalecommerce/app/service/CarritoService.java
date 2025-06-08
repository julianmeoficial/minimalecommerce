package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Carritoitem;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.repository.CarritoitemRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import com.minimalecommerce.app.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CarritoService {

    @Autowired
    private CarritoitemRepository carritoitemRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // Obtener items del carrito por usuario
    public List<Carritoitem> obtenerCarritoPorUsuario(Long usuarioId) {
        return carritoitemRepository.findByUsuarioIdOrderByFechaagregadoDesc(usuarioId);
    }

    // Agregar producto al carrito
    public Carritoitem agregarProductoAlCarrito(Long usuarioId, Long productoId, Integer cantidad) {
        Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);
        Optional<Producto> producto = productoRepository.findById(productoId);

        if (!usuario.isPresent()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        if (!producto.isPresent()) {
            throw new RuntimeException("Producto no encontrado");
        }

        if (producto.get().getStock() < cantidad) {
            throw new RuntimeException("Stock insuficiente");
        }

        // Verificar si el producto ya está en el carrito
        Optional<Carritoitem> itemExistente = carritoitemRepository.findByUsuarioIdAndProductoId(usuarioId, productoId);

        if (itemExistente.isPresent()) {
            // Actualizar cantidad
            Carritoitem item = itemExistente.get();
            item.setCantidad(item.getCantidad() + cantidad);
            return carritoitemRepository.save(item);
        } else {
            // Crear nuevo item
            Carritoitem nuevoItem = new Carritoitem();
            nuevoItem.setUsuario(usuario.get());
            nuevoItem.setProducto(producto.get());
            nuevoItem.setCantidad(cantidad);
            nuevoItem.setPreciounitario(producto.get().getPrecio());
            return carritoitemRepository.save(nuevoItem);
        }
    }

    // Actualizar cantidad de un item
    public Carritoitem actualizarCantidadItem(Long itemId, Integer nuevaCantidad) {
        Optional<Carritoitem> item = carritoitemRepository.findById(itemId);
        if (item.isPresent()) {
            if (nuevaCantidad <= 0) {
                carritoitemRepository.deleteById(itemId);
                return null;
            }

            if (item.get().getProducto().getStock() < nuevaCantidad) {
                throw new RuntimeException("Stock insuficiente");
            }

            item.get().setCantidad(nuevaCantidad);
            return carritoitemRepository.save(item.get());
        }
        throw new RuntimeException("Item no encontrado");
    }

    // Eliminar item del carrito
    public void eliminarItemDelCarrito(Long itemId) {
        carritoitemRepository.deleteById(itemId);
    }

    // Limpiar carrito completo
    public void limpiarCarrito(Long usuarioId) {
        carritoitemRepository.deleteByUsuarioId(usuarioId);
    }

    // Calcular total del carrito
    public BigDecimal calcularTotalCarrito(Long usuarioId) {
        BigDecimal total = carritoitemRepository.calcularTotalCarrito(usuarioId);
        return total != null ? total : BigDecimal.ZERO;
    }

    // Contar items en el carrito
    public Long contarItemsCarrito(Long usuarioId) {
        return carritoitemRepository.countByUsuarioId(usuarioId);
    }

    // Obtener cantidad total de productos
    public Integer obtenerCantidadTotalProductos(Long usuarioId) {
        Integer total = carritoitemRepository.obtenerCantidadTotalItems(usuarioId);
        return total != null ? total : 0;
    }
}
