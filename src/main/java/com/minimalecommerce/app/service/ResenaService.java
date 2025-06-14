package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Resena;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.repository.ResenaRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import com.minimalecommerce.app.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ResenaService {

    @Autowired
    private ResenaRepository resenaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // ===== MÉTODOS BÁSICOS =====

    public List<Resena> obtenerTodasResenas() {
        return resenaRepository.findAll();
    }

    public Optional<Resena> obtenerResenaPorId(Long id) {
        return resenaRepository.findById(id);
    }

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

    public List<Resena> obtenerResenasPorProducto(Long productoId) {
        return resenaRepository.findByProductoId(productoId);
    }

    public List<Resena> obtenerResenasPorUsuario(Long usuarioId) {
        return resenaRepository.findByUsuarioId(usuarioId);
    }

    public Double obtenerPromedioCalificacion(Long productoId) {
        Double promedio = resenaRepository.obtenerPromedioCalificacion(productoId);
        return promedio != null ? promedio : 0.0;
    }

    public Resena actualizarResena(Long id, Resena resena) {
        Optional<Resena> resenaExistente = resenaRepository.findById(id);
        if (resenaExistente.isPresent()) {
            Resena resenaActual = resenaExistente.get();

            // Actualizar solo campos permitidos
            if (resena.getCalificacion() != null && resena.getCalificacion() >= 1 && resena.getCalificacion() <= 5) {
                resenaActual.setCalificacion(resena.getCalificacion());
            }

            if (resena.getComentario() != null) {
                resenaActual.setComentario(resena.getComentario());
            }

            return resenaRepository.save(resenaActual);
        }
        throw new RuntimeException("Reseña no encontrada");
    }

    public void eliminarResena(Long id) {
        if (!resenaRepository.existsById(id)) {
            throw new RuntimeException("Reseña no encontrada");
        }
        resenaRepository.deleteById(id);
    }

    public Long contarResenasPorUsuario(Long usuarioId) {
        return resenaRepository.countByUsuarioId(usuarioId);
    }

    // ===== MÉTODOS PARA COMPRADORES =====

    public Resena crearResenaComprador(Long compradorId, Long productoId, Resena resena) {
        // Validar comprador existe
        Optional<Usuario> comprador = usuarioRepository.findById(compradorId);
        if (!comprador.isPresent()) {
            throw new RuntimeException("Comprador no encontrado");
        }

        // Validar producto existe
        Optional<Producto> producto = productoRepository.findById(productoId);
        if (!producto.isPresent()) {
            throw new RuntimeException("Producto no encontrado");
        }

        // Validar calificación
        if (resena.getCalificacion() == null || resena.getCalificacion() < 1 || resena.getCalificacion() > 5) {
            throw new RuntimeException("La calificación debe estar entre 1 y 5");
        }

        // Verificar que no haya reseña duplicada del mismo usuario para el mismo producto
        if (resenaRepository.existeResenaDelCompradorParaProducto(compradorId, productoId)) {
            throw new RuntimeException("Ya has escrito una reseña para este producto");
        }

        // Configurar reseña
        resena.setUsuario(comprador.get());
        resena.setProducto(producto.get());

        return resenaRepository.save(resena);
    }

    public List<Resena> obtenerResenasEscritasPorComprador(Long compradorId) {
        return resenaRepository.findResenasEscritasPorComprador(compradorId);
    }

    public Long contarResenasEscritasPorComprador(Long compradorId) {
        return resenaRepository.countByCompradorId(compradorId);
    }

    public boolean puedeResenarProducto(Long compradorId, Long productoId) {
        return !resenaRepository.existeResenaDelCompradorParaProducto(compradorId, productoId);
    }

    // ===== MÉTODOS PARA VENDEDORES =====

    public List<Resena> obtenerResenasRecibidasPorVendedor(Long vendedorId) {
        return resenaRepository.findResenasRecibidasPorVendedor(vendedorId);
    }

    public Double obtenerPromedioCalificacionVendedor(Long vendedorId) {
        Double promedio = resenaRepository.obtenerPromedioCalificacionVendedor(vendedorId);
        return promedio != null ? promedio : 0.0;
    }

    public Long contarResenasRecibidasPorVendedor(Long vendedorId) {
        return resenaRepository.countByVendedorId(vendedorId);
    }

    public Long contarResenasVerificadasPorVendedor(Long vendedorId) {
        return resenaRepository.countByVendedorIdAndVerificadaTrue(vendedorId);
    }

    // ===== MÉTODOS PARA RESEÑAS VERIFICADAS =====

    public List<Resena> obtenerResenasVerificadasPorProducto(Long productoId) {
        return resenaRepository.findResenasVerificadasPorProducto(productoId);
    }

    // ===== MÉTODOS ADICIONALES =====

    public List<Resena> obtenerResenasRecientesPorProducto(Long productoId, int limite) {
        return resenaRepository.findTopByProductoIdOrderByFecharesenaDesc(productoId, limite);
    }

    public List<Resena> obtenerResenasConCalificacion(Integer calificacion) {
        return resenaRepository.findByCalificacion(calificacion);
    }

    public boolean existeResenaDeUsuarioParaProducto(Long usuarioId, Long productoId) {
        return resenaRepository.existsByUsuarioIdAndProductoId(usuarioId, productoId);
    }

    public Long contarResenasPorProducto(Long productoId) {
        return resenaRepository.countByProductoId(productoId);
    }

    public Double obtenerPromedioCalificacionGeneral() {
        return resenaRepository.obtenerPromedioCalificacionGeneral();
    }
}
