package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Evento;
import com.minimalecommerce.app.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {

    List<Evento> findByActivoTrue();
    List<Evento> findByUsuario(Usuario usuario);
    List<Evento> findByUsuarioId(Long usuarioId);

    @Query("SELECT e FROM Evento e WHERE e.fechainicio >= :fechaInicio AND e.fechainicio <= :fechaFin AND e.activo = true")
    List<Evento> findEventosEnRango(@Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);

    @Query("SELECT e FROM Evento e WHERE e.fechainicio >= :fecha AND e.activo = true ORDER BY e.fechainicio ASC")
    List<Evento> findEventosProximos(@Param("fecha") LocalDateTime fecha);

    List<Evento> findByTituloContainingIgnoreCaseAndActivoTrue(String titulo);
}
