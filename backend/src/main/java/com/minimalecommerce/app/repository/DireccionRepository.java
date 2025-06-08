package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Direccion;
import com.minimalecommerce.app.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DireccionRepository extends JpaRepository<Direccion, Long> {

    // Direcciones por usuario
    List<Direccion> findByUsuario(Usuario usuario);
    List<Direccion> findByUsuarioId(Long usuarioId);

    // Direcciones activas
    List<Direccion> findByUsuarioIdAndActivaTrue(Long usuarioId);

    // Dirección principal
    Optional<Direccion> findByUsuarioIdAndPrincipalTrue(Long usuarioId);

    // Direcciones ordenadas (principal primero)
    @Query("SELECT d FROM Direccion d WHERE d.usuario.id = :usuarioId AND d.activa = true ORDER BY d.principal DESC, d.fechacreacion ASC")
    List<Direccion> findByUsuarioIdActivasOrdenadas(@Param("usuarioId") Long usuarioId);

    // Contar direcciones activas por usuario
    Long countByUsuarioIdAndActivaTrue(Long usuarioId);

    // Buscar por ciudad
    List<Direccion> findByUsuarioIdAndCiudadContainingIgnoreCase(Long usuarioId, String ciudad);
}
