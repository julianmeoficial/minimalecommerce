package com.minimalecommerce.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "producto")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false)
    private Integer stock;

    @Column(length = 500)
    private String imagen;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoriaid", nullable = false)
    private Categoria categoria;


    // Campo vendedor
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendedorid", nullable = false)
    private Usuario vendedor;

    // Getter y Setter para vendedor
    public Usuario getVendedor() {
        return vendedor;
    }

    public void setVendedor(Usuario vendedor) {
        this.vendedor = vendedor;
    }

    @Column(name = "fechacreacion")
    private LocalDateTime fechacreacion;

    @Column(nullable = false)
    private Boolean activo = true;

    @PrePersist
    protected void onCreate() {
        fechacreacion = LocalDateTime.now();
    }

    @Column(name = "espreorden", nullable = false)
    private Boolean espreorden = false;

    // Getter y Setter
    public Boolean getEspreorden() {
        return espreorden;
    }

    public void setEspreorden(Boolean espreorden) {
        this.espreorden = espreorden;
    }
}
