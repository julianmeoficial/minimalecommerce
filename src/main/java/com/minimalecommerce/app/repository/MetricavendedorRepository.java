package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Metricavendedor;
import com.minimalecommerce.app.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetricavendedorRepository extends JpaRepository<Metricavendedor, Long> {

    // Métricas por vendedor
    List<Metricavendedor> findByVendedor(Usuario vendedor);
    List<Metricavendedor> findByVendedorId(Long vendedorId);

    // Métrica específica por fecha
    Optional<Metricavendedor> findByVendedorIdAndFecha(Long vendedorId, LocalDate fecha);

    // Métricas en rango de fechas
    @Query("SELECT m FROM Metricavendedor m WHERE m.vendedor.id = :vendedorId AND m.fecha BETWEEN :fechaInicio AND :fechaFin ORDER BY m.fecha DESC")
    List<Metricavendedor> findByVendedorIdAndFechaBetween(@Param("vendedorId") Long vendedorId,
                                                          @Param("fechaInicio") LocalDate fechaInicio,
                                                          @Param("fechaFin") LocalDate fechaFin);

    // Totales del vendedor
    @Query("SELECT SUM(m.ventastotal) FROM Metricavendedor m WHERE m.vendedor.id = :vendedorId")
    BigDecimal calcularVentasTotales(@Param("vendedorId") Long vendedorId);

    @Query("SELECT SUM(m.productosvendidos) FROM Metricavendedor m WHERE m.vendedor.id = :vendedorId")
    Integer calcularProductosVendidosTotales(@Param("vendedorId") Long vendedorId);

    @Query("SELECT AVG(m.calificacionpromedio) FROM Metricavendedor m WHERE m.vendedor.id = :vendedorId AND m.calificacionpromedio > 0")
    Double calcularCalificacionPromedioGeneral(@Param("vendedorId") Long vendedorId);

    // Métricas del último mes
    @Query("SELECT m FROM Metricavendedor m WHERE m.vendedor.id = :vendedorId AND m.fecha >= :fechaInicio ORDER BY m.fecha DESC")
    List<Metricavendedor> findMetricasUltimoMes(@Param("vendedorId") Long vendedorId, @Param("fechaInicio") LocalDate fechaInicio);
}
