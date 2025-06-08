package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Resena;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.repository.ResenaRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import com.minimalecommerce.app.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ResenaService {

    @Autowired
    private ResenaRepository resenaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // Obtener todas las reseñas
    public List<Resena> obtenerTodasResenas() {
        return resenaRepository.findAll();
    }

    // Obtener reseña por ID
    public Optional<Resena> obtenerResenaPorId(Long id) {
        return resenaRepository.findById(id);
    }

    // Crear nueva reseña
    public Resena crearResena(Resena resena) {
        if (resena.getUsuario() == null || resena.getUsuario().getId() == null) {
            throw new RuntimeException("Debe especificar un usuario válido");
        }

        if (resena.getProducto() == null || resena.getProducto().getId() == null) {
            throw new RuntimeException("Debe especificar un producto válido");
        }

        Optional<Usuario> usuario = usuarioRepository.findById(resena.getUsuario().getId());
        if (!usuario.isPresent()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        Optional<Producto> producto = productoRepository.findById(resena.getProducto().getId());
        if (!producto.isPresent()) {
            throw new RuntimeException("Producto no encontrado");
        }

        // Validar calificación
        if (resena.getCalificacion() == null || resena.getCalificacion() < 1 || resena.getCalificacion() > 5) {
            throw new RuntimeException("La calificación debe estar entre 1 y 5");
        }

        resena.setUsuario(usuario.get());
        resena.setProducto(producto.get());

        return resenaRepository.save(resena);
    }

    // Obtener reseñas por producto
    public List<Resena> obtenerResenasPorProducto(Long productoId) {
        return resenaRepository.findByProductoId(productoId);
    }

    // Obtener reseñas por usuario
    public List<Resena> obtenerResenasPorUsuario(Long usuarioId) {
        return resenaRepository.findByUsuarioId(usuarioId);
    }

    // Obtener promedio de calificaciones por producto
    public Double obtenerPromedioCalificacion(Long productoId) {
        Double promedio = resenaRepository.obtenerPromedioCalificacion(productoId);
        return promedio != null ? promedio : 0.0;
    }

    // Actualizar reseña
    public Resena actualizarResena(Long id, Resena resena) {
        Optional<Resena> resenaExistente = resenaRepository.findById(id);
        if (resenaExistente.isPresent()) {
            resena.setId(id);
            return resenaRepository.save(resena);
        }
        throw new RuntimeException("Reseña no encontrada");
    }

    // Eliminar reseña
    public void eliminarResena(Long id) {
        resenaRepository.deleteById(id);
    }

    // Contar reseñas por usuario
    public Long contarResenasPorUsuario(Long usuarioId) {
        return resenaRepository.countByUsuarioId(usuarioId);
    }
}
