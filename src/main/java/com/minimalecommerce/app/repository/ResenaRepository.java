package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Resena;
import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {

    List<Resena> findByProducto(Producto producto);
    List<Resena> findByProductoId(Long productoId);
    List<Resena> findByUsuario(Usuario usuario);

    // AGREGAR ESTE MÉTODO QUE FALTA:
    List<Resena> findByUsuarioId(Long usuarioId);

    @Query("SELECT AVG(r.calificacion) FROM Resena r WHERE r.producto.id = :productoId")
    Double obtenerPromedioCalificacion(@Param("productoId") Long productoId);

    // MÉTODO ADICIONAL: Contar reseñas por usuario
    Long countByUsuarioId(Long usuarioId);

    // MÉTODO ADICIONAL: Reseñas ordenadas por fecha
    @Query("SELECT r FROM Resena r WHERE r.usuario.id = :usuarioId ORDER BY r.fecharesena DESC")
    List<Resena> findByUsuarioIdOrderByFecharesenaDesc(@Param("usuarioId") Long usuarioId);
}
