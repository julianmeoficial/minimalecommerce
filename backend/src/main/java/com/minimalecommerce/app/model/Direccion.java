package com.minimalecommerce.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "direccion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Direccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuarioid", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String nombre; // "Casa", "Oficina", "Trabajo"

    @Column(name = "direccioncompleta", nullable = false, length = 400)
    private String direccioncompleta;

    @Column(length = 100)
    private String ciudad;

    @Column(name = "codigopostal", length = 20)
    private String codigopostal;

    @Column(length = 15)
    private String telefono;

    @Column(nullable = false)
    private Boolean principal = false;

    @Column(nullable = false)
    private Boolean activa = true;

    @Column(name = "fechacreacion")
    private LocalDateTime fechacreacion;

    @PrePersist
    protected void onCreate() {
        fechacreacion = LocalDateTime.now();
    }
}
