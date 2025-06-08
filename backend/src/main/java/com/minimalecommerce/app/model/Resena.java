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

    @PrePersist
    protected void onCreate() {
        fecharesena = LocalDateTime.now();
    }
}
