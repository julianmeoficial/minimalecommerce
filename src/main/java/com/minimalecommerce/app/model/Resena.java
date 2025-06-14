package com.minimalecommerce.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "resena")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===== CAMPOS EXISTENTES EN BD =====
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuarioid", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "productoid", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer calificacion; // 1-5 estrellas

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "fecharesena")
    private LocalDateTime fecharesena;

    // ===== NUEVOS CAMPOS (después de ejecutar ALTER TABLE) =====

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "compradorid")
    private Usuario comprador;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendedorid")
    private Usuario vendedor;

    @Column(nullable = false)
    private Boolean verificada = false;

    @Column(name = "tiporesena", length = 20)
    private String tipoResena = "producto";

    @PrePersist
    protected void onCreate() {
        fecharesena = LocalDateTime.now();

        // Auto-asignar comprador si no está definido
        if (comprador == null && usuario != null) {
            comprador = usuario;
        }

        // Auto-asignar vendedor desde el producto
        if (vendedor == null && producto != null && producto.getVendedor() != null) {
            vendedor = producto.getVendedor();
        }
    }
}
