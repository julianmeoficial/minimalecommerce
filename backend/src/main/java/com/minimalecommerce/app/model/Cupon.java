package com.minimalecommerce.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cupon")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(nullable = false, length = 200)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoCupon tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "fechainicio", nullable = false)
    private LocalDateTime fechainicio;

    @Column(name = "fechavencimiento", nullable = false)
    private LocalDateTime fechavencimiento;

    @Column(name = "usosmaximo", nullable = false)
    private Integer usosmaximo = 1;

    @Column(name = "usosactuales", nullable = false)
    private Integer usosactuales = 0;

    @Column(nullable = false)
    private Boolean activo = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creadorid", nullable = false)
    private Usuario creador; // Vendedor que crea el cupón

    @Column(name = "fechacreacion")
    private LocalDateTime fechacreacion;

    @PrePersist
    protected void onCreate() {
        fechacreacion = LocalDateTime.now();
    }

    // Método para verificar si el cupón es válido
    public boolean esValido() {
        LocalDateTime ahora = LocalDateTime.now();
        return activo &&
                ahora.isAfter(fechainicio) &&
                ahora.isBefore(fechavencimiento) &&
                usosactuales < usosmaximo;
    }

    // Método para aplicar descuento
    public BigDecimal aplicarDescuento(BigDecimal montoOriginal) {
        if (!esValido()) {
            return montoOriginal;
        }

        if (tipo == TipoCupon.PORCENTAJE) {
            BigDecimal descuento = montoOriginal.multiply(valor).divide(BigDecimal.valueOf(100));
            return montoOriginal.subtract(descuento);
        } else {
            return montoOriginal.subtract(valor);
        }
    }
}
