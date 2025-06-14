package com.minimalecommerce.app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cupon")
public class Cupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCupon tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "fechacreacion")
    private LocalDateTime fechacreacion;

    @Column(name = "fechainicio")
    private LocalDateTime fechainicio;

    @Column(name = "fechavencimiento")
    private LocalDateTime fechavencimiento;

    @Column(name = "usosmaximo")
    private Integer usosmaximo;

    @Column(name = "usosactuales")
    private Integer usosactuales;

    private Boolean activo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creadorid")
    @JsonIgnore
    private Usuario creador;

    // Constructores
    public Cupon() {
        this.fechacreacion = LocalDateTime.now();
        this.usosactuales = 0;
        this.activo = true;
    }

    public Cupon(String codigo, TipoCupon tipo, BigDecimal valor, String descripcion,
                 LocalDateTime fechainicio, LocalDateTime fechavencimiento,
                 Integer usosmaximo, Usuario creador) {
        this();
        this.codigo = codigo.toUpperCase();
        this.tipo = tipo;
        this.valor = valor;
        this.descripcion = descripcion;
        this.fechainicio = fechainicio;
        this.fechavencimiento = fechavencimiento;
        this.usosmaximo = usosmaximo;
        this.creador = creador;
    }

    // Métodos de negocio
    public boolean esValido() {
        LocalDateTime ahora = LocalDateTime.now();
        return activo &&
                ahora.isAfter(fechainicio) &&
                ahora.isBefore(fechavencimiento) &&
                usosactuales < usosmaximo;
    }

    public boolean puedeUsarse() {
        return esValido() && usosactuales < usosmaximo;
    }

    public BigDecimal calcularDescuento(BigDecimal montoBase) {
        if (!puedeUsarse() || montoBase == null || montoBase.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        switch (tipo) {
            case PORCENTAJE:
                return montoBase.multiply(valor.divide(BigDecimal.valueOf(100)));
            case MONTO_FIJO:
                return valor.min(montoBase); // No puede ser mayor al monto base
            default:
                return BigDecimal.ZERO;
        }
    }

    public void incrementarUso() {
        if (puedeUsarse()) {
            this.usosactuales++;
        }
    }

    public boolean estaAgotado() {
        return usosactuales >= usosmaximo;
    }

    public boolean estaVencido() {
        return LocalDateTime.now().isAfter(fechavencimiento);
    }

    public boolean proximoAVencer(int dias) {
        LocalDateTime limite = LocalDateTime.now().plusDays(dias);
        return fechavencimiento.isBefore(limite) && fechavencimiento.isAfter(LocalDateTime.now());
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo != null ? codigo.toUpperCase() : null;
    }

    public TipoCupon getTipo() {
        return tipo;
    }

    public void setTipo(TipoCupon tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechacreacion() {
        return fechacreacion;
    }

    public void setFechacreacion(LocalDateTime fechacreacion) {
        this.fechacreacion = fechacreacion;
    }

    public LocalDateTime getFechainicio() {
        return fechainicio;
    }

    public void setFechainicio(LocalDateTime fechainicio) {
        this.fechainicio = fechainicio;
    }

    public LocalDateTime getFechavencimiento() {
        return fechavencimiento;
    }

    public void setFechavencimiento(LocalDateTime fechavencimiento) {
        this.fechavencimiento = fechavencimiento;
    }

    public Integer getUsosmaximo() {
        return usosmaximo;
    }

    public void setUsosmaximo(Integer usosmaximo) {
        this.usosmaximo = usosmaximo;
    }

    public Integer getUsosactuales() {
        return usosactuales;
    }

    public void setUsosactuales(Integer usosactuales) {
        this.usosactuales = usosactuales;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Usuario getCreador() {
        return creador;
    }

    public void setCreador(Usuario creador) {
        this.creador = creador;
    }

    @Override
    public String toString() {
        return "Cupon{" +
                "id=" + id +
                ", codigo='" + codigo + '\'' +
                ", tipo=" + tipo +
                ", valor=" + valor +
                ", activo=" + activo +
                ", usosactuales=" + usosactuales +
                ", usosmaximo=" + usosmaximo +
                '}';
    }
}
