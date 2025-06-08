package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Metricavendedor;
import com.minimalecommerce.app.service.MetricavendedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/metricas-vendedor")
public class MetricavendedorController {

    @Autowired
    private MetricavendedorService metricavendedorService;

    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<List<Metricavendedor>> obtenerMetricasPorVendedor(@PathVariable Long vendedorId) {
        List<Metricavendedor> metricas = metricavendedorService.obtenerMetricasPorVendedor(vendedorId);
        return ResponseEntity.ok(metricas);
    }

    @GetMapping("/vendedor/{vendedorId}/rango")
    public ResponseEntity<List<Metricavendedor>> obtenerMetricasEnRango(
            @PathVariable Long vendedorId,
            @RequestParam LocalDate fechaInicio,
            @RequestParam LocalDate fechaFin) {
        List<Metricavendedor> metricas = metricavendedorService.obtenerMetricasEnRango(vendedorId, fechaInicio, fechaFin);
        return ResponseEntity.ok(metricas);
    }

    @GetMapping("/vendedor/{vendedorId}/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumenVendedor(@PathVariable Long vendedorId) {
        BigDecimal ventasTotales = metricavendedorService.calcularVentasTotales(vendedorId);
        Integer productosVendidos = metricavendedorService.calcularProductosVendidosTotales(vendedorId);
        Double calificacionPromedio = metricavendedorService.calcularCalificacionPromedioGeneral(vendedorId);

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("vendedorId", vendedorId);
        resumen.put("ventasTotales", ventasTotales);
        resumen.put("productosVendidos", productosVendidos);
        resumen.put("calificacionPromedio", calificacionPromedio);

        return ResponseEntity.ok(resumen);
    }

    @GetMapping("/vendedor/{vendedorId}/ultimo-mes")
    public ResponseEntity<List<Metricavendedor>> obtenerMetricasUltimoMes(@PathVariable Long vendedorId) {
        List<Metricavendedor> metricas = metricavendedorService.obtenerMetricasUltimoMes(vendedorId);
        return ResponseEntity.ok(metricas);
    }

    @PostMapping("/vendedor/{vendedorId}/actualizar")
    public ResponseEntity<Metricavendedor> actualizarMetricaDiaria(@PathVariable Long vendedorId, @RequestParam LocalDate fecha) {
        Metricavendedor metrica = metricavendedorService.actualizarMetricaDiaria(vendedorId, fecha);
        return ResponseEntity.ok(metrica);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Metricavendedor> actualizarMetrica(@PathVariable Long id, @RequestBody Metricavendedor metrica) {
        Metricavendedor metricaActualizada = metricavendedorService.actualizarMetrica(id, metrica);
        return ResponseEntity.ok(metricaActualizada);
    }
}

