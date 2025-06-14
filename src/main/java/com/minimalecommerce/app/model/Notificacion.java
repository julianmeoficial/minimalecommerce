package com.minimalecommerce.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 300)
    private String enlace;

    @Column(name = "fechacreacion", nullable = false)
    private LocalDateTime fechacreacion;

    @Column(nullable = false)
    private Boolean leida = false;

    @Column(columnDefinition = "TEXT")
    private String mensaje;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoNotificacion tipo;

    @Column(nullable = false, length = 150)
    private String titulo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuarioid", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "remitenteId")
    private Usuario remitente;

    @Column(name = "fechaEnvio")
    private LocalDateTime fechaEnvio;

    @Enumerated(EnumType.STRING)
    @Column(name = "estadoEnvio")
    private EstadoEnvio estadoEnvio = EstadoEnvio.PENDIENTE;

    @Enumerated(EnumType.STRING)
    private Prioridad prioridad = Prioridad.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "destinatarioTipo")
    private DestinatarioTipo destinatarioTipo = DestinatarioTipo.INDIVIDUAL;

    @Column(name = "grupoDestinatarios", columnDefinition = "TEXT")
    private String grupoDestinatarios;

    @Column(name = "intentosEnvio")
    private Integer intentosEnvio = 0;

    @Column(name = "fechaLectura")
    private LocalDateTime fechaLectura;

    @Column(columnDefinition = "JSON")
    private String metadatos;

    // ENUMS (según tu tabla)
    public enum EstadoEnvio {
        PENDIENTE, ENVIADA, PROGRAMADA, FALLIDA
    }

    public enum Prioridad {
        ALTA, BAJA, NORMAL, URGENTE  // Verificar orden en tu enum de BD
    }

    public enum DestinatarioTipo {
        INDIVIDUAL, GRUPO, TODOS
    }

    @PrePersist
    protected void onCreate() {
        if (fechacreacion == null) {
            fechacreacion = LocalDateTime.now();
        }
        if (estadoEnvio == null) {
            estadoEnvio = EstadoEnvio.ENVIADA;
        }
    }
}
