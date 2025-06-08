package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Metricavendedor;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.repository.MetricavendedorRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MetricavendedorService {

    @Autowired
    private MetricavendedorRepository metricavendedorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Crear o actualizar métrica diaria
    public Metricavendedor actualizarMetricaDiaria(Long vendedorId, LocalDate fecha) {
        Optional<Usuario> vendedor = usuarioRepository.findById(vendedorId);
        if (!vendedor.isPresent()) {
            throw new RuntimeException("Vendedor no encontrado");
        }

        Optional<Metricavendedor> metricaExistente = metricavendedorRepository.findByVendedorIdAndFecha(vendedorId, fecha);

        Metricavendedor metrica;
        if (metricaExistente.isPresent()) {
            metrica = metricaExistente.get();
        } else {
            metrica = new Metricavendedor();
            metrica.setVendedor(vendedor.get());
            metrica.setFecha(fecha);
        }

        // Aquí calcularías las métricas reales basándose en pedidos, productos, etc.
        // Por ahora, valores de ejemplo
        return metricavendedorRepository.save(metrica);
    }

    // Obtener métricas por vendedor
    public List<Metricavendedor> obtenerMetricasPorVendedor(Long vendedorId) {
        return metricavendedorRepository.findByVendedorId(vendedorId);
    }

    // Obtener métricas en rango de fechas
    public List<Metricavendedor> obtenerMetricasEnRango(Long vendedorId, LocalDate fechaInicio, LocalDate fechaFin) {
        return metricavendedorRepository.findByVendedorIdAndFechaBetween(vendedorId, fechaInicio, fechaFin);
    }

    // Obtener totales del vendedor
    public BigDecimal calcularVentasTotales(Long vendedorId) {
        BigDecimal total = metricavendedorRepository.calcularVentasTotales(vendedorId);
        return total != null ? total : BigDecimal.ZERO;
    }

    public Integer calcularProductosVendidosTotales(Long vendedorId) {
        Integer total = metricavendedorRepository.calcularProductosVendidosTotales(vendedorId);
        return total != null ? total : 0;
    }

    public Double calcularCalificacionPromedioGeneral(Long vendedorId) {
        Double promedio = metricavendedorRepository.calcularCalificacionPromedioGeneral(vendedorId);
        return promedio != null ? promedio : 0.0;
    }

    // Obtener métricas del último mes
    public List<Metricavendedor> obtenerMetricasUltimoMes(Long vendedorId) {
        LocalDate fechaInicio = LocalDate.now().minusMonths(1);
        return metricavendedorRepository.findMetricasUltimoMes(vendedorId, fechaInicio);
    }

    // Actualizar métrica específica
    public Metricavendedor actualizarMetrica(Long id, Metricavendedor metrica) {
        Optional<Metricavendedor> metricaExistente = metricavendedorRepository.findById(id);
        if (metricaExistente.isPresent()) {
            metrica.setId(id);
            return metricavendedorRepository.save(metrica);
        }
        throw new RuntimeException("Métrica no encontrada");
    }
}
