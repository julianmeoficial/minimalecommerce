package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Cupon;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.TipoCupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CuponRepository extends JpaRepository<Cupon, Long> {

    // Cupones por creador (vendedor)
    List<Cupon> findByCreador(Usuario creador);
    List<Cupon> findByCreadorId(Long creadorId);

    // Buscar cupón por código
    Optional<Cupon> findByCodigo(String codigo);

    // Cupones activos
    List<Cupon> findByActivoTrue();
    List<Cupon> findByCreadorIdAndActivoTrue(Long creadorId);

    // Cupones válidos (activos y en fecha)
    @Query("SELECT c FROM Cupon c WHERE c.activo = true AND c.fechainicio <= :ahora AND c.fechavencimiento >= :ahora AND c.usosactuales < c.usosmaximo")
    List<Cupon> findCuponesValidos(@Param("ahora") LocalDateTime ahora);

    // Cupones válidos por vendedor
    @Query("SELECT c FROM Cupon c WHERE c.creador.id = :creadorId AND c.activo = true AND c.fechainicio <= :ahora AND c.fechavencimiento >= :ahora AND c.usosactuales < c.usosmaximo")
    List<Cupon> findCuponesValidosPorVendedor(@Param("creadorId") Long creadorId, @Param("ahora") LocalDateTime ahora);

    // Cupones por tipo
    List<Cupon> findByCreadorIdAndTipo(Long creadorId, TipoCupon tipo);

    // Cupones próximos a vencer
    @Query("SELECT c FROM Cupon c WHERE c.creador.id = :creadorId AND c.activo = true AND c.fechavencimiento BETWEEN :ahora AND :fechaLimite")
    List<Cupon> findCuponesProximosAVencer(@Param("creadorId") Long creadorId,
                                           @Param("ahora") LocalDateTime ahora,
                                           @Param("fechaLimite") LocalDateTime fechaLimite);

    // Verificar si código existe
    boolean existsByCodigo(String codigo);

    // Contar cupones activos por vendedor
    Long countByCreadorIdAndActivoTrue(Long creadorId);
}
