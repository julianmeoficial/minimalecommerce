package com.minimalecommerce.app.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "carritoitem")
public class Carritoitem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "fechaagregado")
    private LocalDateTime fechaagregado;

    @Column(name = "preciounitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal preciounitario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "productoid", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuarioid", nullable = false)
    private Usuario usuario;

    // ==================== CONSTRUCTORES ====================

    public Carritoitem() {
        this.fechaagregado = LocalDateTime.now();
    }

    public Carritoitem(Usuario usuario, Producto producto, Integer cantidad) {
        this();
        this.usuario = usuario;
        this.producto = producto;
        this.cantidad = cantidad;
        this.preciounitario = producto.getPrecio();
    }

    // ==================== MÉTODOS DE CÁLCULO ====================

    public BigDecimal getSubtotal() {
        if (preciounitario != null && cantidad != null) {
            return preciounitario.multiply(BigDecimal.valueOf(cantidad));
        }
        return BigDecimal.ZERO;
    }

    // ==================== LIFECYCLE METHODS ====================

    @PrePersist
    protected void onCreate() {
        if (fechaagregado == null) {
            fechaagregado = LocalDateTime.now();
        }
    }

    // ==================== GETTERS Y SETTERS ====================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public LocalDateTime getFechaagregado() { return fechaagregado; }
    public void setFechaagregado(LocalDateTime fechaagregado) { this.fechaagregado = fechaagregado; }

    public BigDecimal getPreciounitario() { return preciounitario; }
    public void setPreciounitario(BigDecimal preciounitario) { this.preciounitario = preciounitario; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) {
        this.producto = producto;
        if (producto != null && this.preciounitario == null) {
            this.preciounitario = producto.getPrecio();
        }
    }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    @Override
    public String toString() {
        return "Carritoitem{" +
                "id=" + id +
                ", cantidad=" + cantidad +
                ", preciounitario=" + preciounitario +
                ", producto=" + (producto != null ? producto.getNombre() : "null") +
                ", usuario=" + (usuario != null ? usuario.getNombre() : "null") +
                '}';
    }
}
