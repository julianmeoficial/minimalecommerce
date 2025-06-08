package com.minimalecommerce.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 15)
    private String telefono;

    @Column(length = 300)
    private String direccion;

    @Column(name = "fecharegistro")
    private LocalDateTime fecharegistro;

    @Column(nullable = false)
    private Boolean activo = true;

    // NUEVO CAMPO: Tipo de usuario
    @Enumerated(EnumType.STRING)
    @Column(name = "tipousuario", nullable = false, length = 20)
    private TipoUsuario tipousuario = TipoUsuario.COMPRADOR;

    @PrePersist
    protected void onCreate() {
        if (fecharegistro == null) {
            fecharegistro = LocalDateTime.now();
        }
        if (activo == null) {
            activo = true;
        }
        if (tipousuario == null) {
            tipousuario = TipoUsuario.COMPRADOR;
        }
    }
}
