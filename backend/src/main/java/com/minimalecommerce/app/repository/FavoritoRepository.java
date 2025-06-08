package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Favorito;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {

    // Favoritos por usuario
    List<Favorito> findByUsuario(Usuario usuario);
    List<Favorito> findByUsuarioId(Long usuarioId);

    // Verificar si producto está en favoritos
    Optional<Favorito> findByUsuarioAndProducto(Usuario usuario, Producto producto);
    Optional<Favorito> findByUsuarioIdAndProductoId(Long usuarioId, Long productoId);

    // Favoritos ordenados por fecha
    @Query("SELECT f FROM Favorito f WHERE f.usuario.id = :usuarioId ORDER BY f.fechaagregado DESC")
    List<Favorito> findByUsuarioIdOrderByFechaagregadoDesc(@Param("usuarioId") Long usuarioId);

    // Contar favoritos por usuario
    Long countByUsuarioId(Long usuarioId);

    // Productos más agregados a favoritos
    @Query("SELECT f.producto, COUNT(f) as total FROM Favorito f GROUP BY f.producto ORDER BY total DESC")
    List<Object[]> findProductosMasFavoritos();

    // Favoritos con notificación de stock
    List<Favorito> findByUsuarioIdAndNotificarstockTrue(Long usuarioId);
}
