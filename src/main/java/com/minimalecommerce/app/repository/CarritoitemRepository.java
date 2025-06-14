package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Carritoitem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarritoitemRepository extends JpaRepository<Carritoitem, Long> {

    // Buscar por usuario
    List<Carritoitem> findByUsuarioId(Long usuarioId);

    // Buscar item específico por usuario y producto
    Optional<Carritoitem> findByUsuarioIdAndProductoId(Long usuarioId, Long productoId);

    // Eliminar todos los items de un usuario
    @Modifying
    @Transactional
    void deleteByUsuarioId(Long usuarioId);

    // Contar items por usuario
    long countByUsuarioId(Long usuarioId);

    // Obtener suma de cantidades por usuario
    @Query("SELECT COALESCE(SUM(c.cantidad), 0) FROM Carritoitem c WHERE c.usuario.id = :usuarioId")
    Integer sumCantidadByUsuarioId(@Param("usuarioId") Long usuarioId);
}
