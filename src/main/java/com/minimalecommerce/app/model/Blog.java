package com.minimalecommerce.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "blog")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Blog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 250)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String contenido;

    @Column(length = 500)
    private String imagen;

    @Column(name = "fechapublicacion")
    private LocalDateTime fechapublicacion;

    @Column(nullable = false)
    private Boolean publicado = false;

    @Column(length = 500)
    private String resumen;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "autorid", nullable = false)
    private Usuario autor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoriaid")
    private Categoria categoria;

    @PrePersist
    protected void onCreate() {
        if (fechapublicacion == null) {
            fechapublicacion = LocalDateTime.now();
        }
    }
}
