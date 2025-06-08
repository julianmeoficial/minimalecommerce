package com.minimalecommerce.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "evento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fechainicio", nullable = false)
    private LocalDateTime fechainicio;

    @Column(name = "fechafin")
    private LocalDateTime fechafin;

    @Column(length = 500)
    private String imagen;

    @Column(length = 300)
    private String ubicacion;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "fechacreacion")
    private LocalDateTime fechacreacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuarioid", nullable = false)
    private Usuario usuario;

    @PrePersist
    protected void onCreate() {
        fechacreacion = LocalDateTime.now();
    }
}
