package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Notificacion;
import com.minimalecommerce.app.model.TipoNotificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    // MÉTODOS EXISTENTES
    List<Notificacion> findByUsuarioIdOrderByFechacreacionDesc(Long usuarioId);

    List<Notificacion> findByUsuarioIdAndLeidaFalse(Long usuarioId);

    Long countByUsuarioIdAndLeidaFalse(Long usuarioId);

    List<Notificacion> findByUsuarioIdAndTipo(Long usuarioId, TipoNotificacion tipo);

    Optional<Notificacion> findByIdAndUsuarioId(Long id, Long usuarioId);

    // NUEVOS MÉTODOS para vendedores
    List<Notificacion> findByRemitenteId(Long remitenteId);

    List<Notificacion> findByRemitenteIdOrderByFechacreacionDesc(Long remitenteId);

    List<Notificacion> findByRemitenteIdAndFechacreacionAfter(Long remitenteId, LocalDateTime fecha);

    Long countByRemitenteId(Long remitenteId);

    Long countByRemitenteIdAndLeidaTrue(Long remitenteId);

    Long countByRemitenteIdAndFechacreacionAfter(Long remitenteId, LocalDateTime fecha);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true, n.fechaLectura = CURRENT_TIMESTAMP WHERE n.usuario.id = :usuarioId AND n.leida = false")
    void marcarTodasComoLeidas(@Param("usuarioId") Long usuarioId);
}
