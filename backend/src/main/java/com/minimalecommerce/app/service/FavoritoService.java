package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Favorito;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.repository.FavoritoRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import com.minimalecommerce.app.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FavoritoService {

    @Autowired
    private FavoritoRepository favoritoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // Agregar producto a favoritos
    public Favorito agregarAFavoritos(Long usuarioId, Long productoId, Boolean notificarStock) {
        Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);
        Optional<Producto> producto = productoRepository.findById(productoId);

        if (!usuario.isPresent()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        if (!producto.isPresent()) {
            throw new RuntimeException("Producto no encontrado");
        }

        // Verificar si ya está en favoritos
        Optional<Favorito> favoritoExistente = favoritoRepository.findByUsuarioIdAndProductoId(usuarioId, productoId);
        if (favoritoExistente.isPresent()) {
            throw new RuntimeException("El producto ya está en favoritos");
        }

        Favorito favorito = new Favorito();
        favorito.setUsuario(usuario.get());
        favorito.setProducto(producto.get());
        favorito.setNotificarstock(notificarStock != null ? notificarStock : false);

        return favoritoRepository.save(favorito);
    }

    // Obtener favoritos por usuario
    public List<Favorito> obtenerFavoritosPorUsuario(Long usuarioId) {
        return favoritoRepository.findByUsuarioIdOrderByFechaagregadoDesc(usuarioId);
    }

    // Verificar si producto está en favoritos
    public boolean estaEnFavoritos(Long usuarioId, Long productoId) {
        return favoritoRepository.findByUsuarioIdAndProductoId(usuarioId, productoId).isPresent();
    }

    // Eliminar de favoritos
    public void eliminarDeFavoritos(Long usuarioId, Long productoId) {
        Optional<Favorito> favorito = favoritoRepository.findByUsuarioIdAndProductoId(usuarioId, productoId);
        if (favorito.isPresent()) {
            favoritoRepository.delete(favorito.get());
        } else {
            throw new RuntimeException("El producto no está en favoritos");
        }
    }

    // Contar favoritos por usuario
    public Long contarFavoritos(Long usuarioId) {
        return favoritoRepository.countByUsuarioId(usuarioId);
    }

    // Obtener productos más favoritos
    public List<Object[]> obtenerProductosMasFavoritos() {
        return favoritoRepository.findProductosMasFavoritos();
    }

    // Actualizar notificación de stock
    public Favorito actualizarNotificacionStock(Long favoritoId, Boolean notificar) {
        Optional<Favorito> favorito = favoritoRepository.findById(favoritoId);
        if (favorito.isPresent()) {
            favorito.get().setNotificarstock(notificar);
            return favoritoRepository.save(favorito.get());
        }
        throw new RuntimeException("Favorito no encontrado");
    }
}
