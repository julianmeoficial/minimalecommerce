package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Notificacion;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.TipoNotificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    // Notificaciones por usuario
    List<Notificacion> findByUsuario(Usuario usuario);
    List<Notificacion> findByUsuarioId(Long usuarioId);

    // Notificaciones no leídas
    List<Notificacion> findByUsuarioIdAndLeidaFalse(Long usuarioId);

    // Notificaciones por tipo
    List<Notificacion> findByUsuarioIdAndTipo(Long usuarioId, TipoNotificacion tipo);

    // Contar notificaciones no leídas
    Long countByUsuarioIdAndLeidaFalse(Long usuarioId);

    // Notificaciones ordenadas por fecha
    @Query("SELECT n FROM Notificacion n WHERE n.usuario.id = :usuarioId ORDER BY n.fechacreacion DESC")
    List<Notificacion> findByUsuarioIdOrderByFechacreacionDesc(@Param("usuarioId") Long usuarioId);

    // Marcar todas como leídas
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.usuario.id = :usuarioId AND n.leida = false")
    void marcarTodasComoLeidas(@Param("usuarioId") Long usuarioId);
}
