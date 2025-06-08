package com.minimalecommerce.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "carritoitem")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Carritoitem {

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

    @Column(name = "preciounitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal preciounitario;

    @Column(name = "fechaagregado")
    private LocalDateTime fechaagregado;

    @PrePersist
    protected void onCreate() {
        fechaagregado = LocalDateTime.now();
        if (preciounitario == null && producto != null) {
            preciounitario = producto.getPrecio();
        }
    }

    public BigDecimal getSubtotal() {
        if (preciounitario != null && cantidad != null) {
            return preciounitario.multiply(BigDecimal.valueOf(cantidad));
        }
        return BigDecimal.ZERO;
    }
}