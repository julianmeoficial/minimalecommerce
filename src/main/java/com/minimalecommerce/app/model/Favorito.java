package com.minimalecommerce.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "favorito")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Favorito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuarioid", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "productoid", nullable = false)
    private Producto producto;

    @Column(name = "fechaagregado")
    private LocalDateTime fechaagregado;

    @Column(name = "notificarstock", nullable = false)
    private Boolean notificarstock = false;

    @PrePersist
    protected void onCreate() {
        fechaagregado = LocalDateTime.now();
    }
}
