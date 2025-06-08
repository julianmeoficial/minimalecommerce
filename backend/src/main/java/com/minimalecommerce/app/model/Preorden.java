package com.minimalecommerce.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "preorden")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Preorden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuarioid", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "productoid", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "fechapreorden")
    private LocalDateTime fechapreorden;

    @Column(name = "fechaestimadaentrega")
    private LocalDateTime fechaestimadaentrega;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoPreorden estado = EstadoPreorden.PENDIENTE;

    @Column(name = "preciopreorden", nullable = false, precision = 10, scale = 2)
    private BigDecimal preciopreorden;

    @Column(length = 500)
    private String notas;

    @PrePersist
    protected void onCreate() {
        fechapreorden = LocalDateTime.now();
    }

    // Método para calcular total
    public BigDecimal getTotal() {
        if (preciopreorden != null && cantidad != null) {
            return preciopreorden.multiply(BigDecimal.valueOf(cantidad));
        }
        return BigDecimal.ZERO;
    }
}
