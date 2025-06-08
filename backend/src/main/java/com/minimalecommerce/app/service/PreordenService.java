package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Preorden;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.model.EstadoPreorden;
import com.minimalecommerce.app.repository.PreordenRepository;
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
public class PreordenService {

    @Autowired
    private PreordenRepository preordenRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // Obtener todas las preórdenes
    public List<Preorden> obtenerTodasPreordenes() {
        return preordenRepository.findAll();
    }

    // Obtener preorden por ID
    public Optional<Preorden> obtenerPreordenPorId(Long id) {
        return preordenRepository.findById(id);
    }

    // Crear nueva preorden
    public Preorden crearPreorden(Preorden preorden) {
        if (preorden.getUsuario() == null || preorden.getUsuario().getId() == null) {
            throw new RuntimeException("Debe especificar un usuario válido");
        }

        if (preorden.getProducto() == null || preorden.getProducto().getId() == null) {
            throw new RuntimeException("Debe especificar un producto válido");
        }

        Optional<Usuario> usuario = usuarioRepository.findById(preorden.getUsuario().getId());
        if (!usuario.isPresent()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        Optional<Producto> producto = productoRepository.findById(preorden.getProducto().getId());
        if (!producto.isPresent()) {
            throw new RuntimeException("Producto no encontrado");
        }

        preorden.setUsuario(usuario.get());
        preorden.setProducto(producto.get());

        // Establecer precio de preorden si no se especifica
        if (preorden.getPreciopreorden() == null) {
            preorden.setPreciopreorden(producto.get().getPrecio());
        }

        if (preorden.getEstado() == null) {
            preorden.setEstado(EstadoPreorden.PENDIENTE);
        }

        return preordenRepository.save(preorden);
    }

    // Obtener preórdenes por usuario
    public List<Preorden> obtenerPreordenesPorUsuario(Long usuarioId) {
        return preordenRepository.findByUsuarioIdOrderByFechapreordenDesc(usuarioId);
    }

    // Obtener preórdenes por producto
    public List<Preorden> obtenerPreordenesPorProducto(Long productoId) {
        return preordenRepository.findByProductoId(productoId);
    }

    // Obtener preórdenes por estado
    public List<Preorden> obtenerPreordenesPorEstado(EstadoPreorden estado) {
        return preordenRepository.findByEstado(estado);
    }

    // Actualizar estado de preorden
    public Preorden actualizarEstadoPreorden(Long preordenId, EstadoPreorden nuevoEstado) {
        Optional<Preorden> preorden = preordenRepository.findById(preordenId);
        if (preorden.isPresent()) {
            preorden.get().setEstado(nuevoEstado);
            return preordenRepository.save(preorden.get());
        }
        throw new RuntimeException("Preorden no encontrada");
    }

    // Calcular total de preórdenes por usuario y estado
    public BigDecimal calcularTotalPreordenes(Long usuarioId, EstadoPreorden estado) {
        BigDecimal total = preordenRepository.calcularTotalPreordenesPorEstado(usuarioId, estado);
        return total != null ? total : BigDecimal.ZERO;
    }

    // Contar preórdenes por usuario
    public Long contarPreordenesPorUsuario(Long usuarioId) {
        return preordenRepository.countByUsuarioId(usuarioId);
    }

    // Actualizar preorden
    public Preorden actualizarPreorden(Long id, Preorden preorden) {
        Optional<Preorden> preordenExistente = preordenRepository.findById(id);
        if (preordenExistente.isPresent()) {
            preorden.setId(id);
            return preordenRepository.save(preorden);
        }
        throw new RuntimeException("Preorden no encontrada");
    }

    // Eliminar preorden
    public void eliminarPreorden(Long id) {
        preordenRepository.deleteById(id);
    }
}
