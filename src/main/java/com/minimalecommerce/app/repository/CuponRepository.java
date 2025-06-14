package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Cupon;
import com.minimalecommerce.app.model.TipoCupon;
import com.minimalecommerce.app.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CuponRepository extends JpaRepository<Cupon, Long> {

    // Buscar por código
    Optional<Cupon> findByCodigo(String codigo);

    Optional<Cupon> findByCodigoIgnoreCase(String codigo);

    // Verificar existencia de código
    boolean existsByCodigo(String codigo);

    boolean existsByCodigoIgnoreCase(String codigo);

    // Buscar cupones activos
    List<Cupon> findByActivoTrue();

    List<Cupon> findByActivoTrueOrderByFechacreacionDesc();

    // Buscar cupones válidos (activos, no vencidos, con usos disponibles)
    @Query("SELECT c FROM Cupon c WHERE c.activo = true AND c.fechainicio <= :ahora AND c.fechavencimiento > :ahora AND c.usosactuales < c.usosmaximo")
    List<Cupon> findCuponesValidos(@Param("ahora") LocalDateTime ahora);

    // Buscar por creador
    List<Cupon> findByCreadorId(Long creadorId);

    List<Cupon> findByCreadorIdOrderByFechacreacionDesc(Long creadorId);

    List<Cupon> findByCreadorAndActivoTrue(Usuario creador);

    // Buscar por tipo
    List<Cupon> findByTipo(TipoCupon tipo);

    List<Cupon> findByTipoAndActivoTrue(TipoCupon tipo);

    // Buscar cupones próximos a vencer
    @Query("SELECT c FROM Cupon c WHERE c.activo = true AND c.fechavencimiento BETWEEN :ahora AND :fechaLimite")
    List<Cupon> findCuponesProximosAVencer(@Param("ahora") LocalDateTime ahora,
                                           @Param("fechaLimite") LocalDateTime fechaLimite);

    // Buscar cupones por vendedor próximos a vencer
    @Query("SELECT c FROM Cupon c WHERE c.creador.id = :vendedorId AND c.activo = true AND c.fechavencimiento BETWEEN :ahora AND :fechaLimite")
    List<Cupon> findCuponesProximosAVencerByVendedor(@Param("vendedorId") Long vendedorId,
                                                     @Param("ahora") LocalDateTime ahora,
                                                     @Param("fechaLimite") LocalDateTime fechaLimite);

    // Buscar cupones agotados
    @Query("SELECT c FROM Cupon c WHERE c.usosactuales >= c.usosmaximo")
    List<Cupon> findCuponesAgotados();

    // Buscar cupones vencidos
    @Query("SELECT c FROM Cupon c WHERE c.fechavencimiento < :ahora")
    List<Cupon> findCuponesVencidos(@Param("ahora") LocalDateTime ahora);

    // Estadísticas por vendedor
    @Query("SELECT COUNT(c) FROM Cupon c WHERE c.creador.id = :vendedorId")
    Long countByCreadorId(@Param("vendedorId") Long vendedorId);

    @Query("SELECT COUNT(c) FROM Cupon c WHERE c.creador.id = :vendedorId AND c.activo = true")
    Long countActivosByCreadorId(@Param("vendedorId") Long vendedorId);

    @Query("SELECT COALESCE(SUM(c.usosactuales), 0) FROM Cupon c WHERE c.creador.id = :vendedorId")
    Long sumUsosActualesByCreadorId(@Param("vendedorId") Long vendedorId);

    // Buscar cupones por rango de fechas
    @Query("SELECT c FROM Cupon c WHERE c.fechacreacion BETWEEN :fechaInicio AND :fechaFin")
    List<Cupon> findByFechacreacionBetween(@Param("fechaInicio") LocalDateTime fechaInicio,
                                           @Param("fechaFin") LocalDateTime fechaFin);

    // Buscar cupones con uso específico
    @Query("SELECT c FROM Cupon c WHERE c.usosactuales >= :minUsos AND c.usosactuales <= :maxUsos")
    List<Cupon> findByUsosActualesBetween(@Param("minUsos") Integer minUsos,
                                          @Param("maxUsos") Integer maxUsos);

    // Top cupones más usados
    @Query("SELECT c FROM Cupon c WHERE c.usosactuales > 0 ORDER BY c.usosactuales DESC")
    List<Cupon> findTopCuponesMasUsados();

    // Desactivar cupones vencidos automáticamente
    @Modifying
    @Transactional
    @Query("UPDATE Cupon c SET c.activo = false WHERE c.fechavencimiento < :ahora AND c.activo = true")
    int desactivarCuponesVencidos(@Param("ahora") LocalDateTime ahora);

    // Buscar cupones por valor
    @Query("SELECT c FROM Cupon c WHERE c.valor >= :valorMinimo AND c.valor <= :valorMaximo")
    List<Cupon> findByValorBetween(@Param("valorMinimo") java.math.BigDecimal valorMinimo,
                                   @Param("valorMaximo") java.math.BigDecimal valorMaximo);

    // Buscar cupones con descripción
    @Query("SELECT c FROM Cupon c WHERE LOWER(c.descripcion) LIKE LOWER(CONCAT('%', :texto, '%')) OR LOWER(c.codigo) LIKE LOWER(CONCAT('%', :texto, '%'))")
    List<Cupon> findByDescripcionOrCodigoContaining(@Param("texto") String texto);
}
