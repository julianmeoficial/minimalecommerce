package com.minimalecommerce.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "metricavendedor")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Metricavendedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendedorid", nullable = false)
    private Usuario vendedor;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "productosvendidos", nullable = false)
    private Integer productosvendidos = 0;

    @Column(name = "ventastotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal ventastotal = BigDecimal.ZERO;

    @Column(name = "pedidoscompletados", nullable = false)
    private Integer pedidoscompletados = 0;

    // CORREGIDO: Sin precision ni scale para Double
    @Column(name = "calificacionpromedio")
    private Double calificacionpromedio = 0.0;

    @Column(name = "visitastienda", nullable = false)
    private Integer visitastienda = 0;

    @Column(name = "productosactivos", nullable = false)
    private Integer productosactivos = 0;

    @Column(name = "fechaactualizacion")
    private LocalDateTime fechaactualizacion;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        fechaactualizacion = LocalDateTime.now();
    }
}
