package com.minimalecommerce.app.model;

public enum EstadoPreorden {
    PENDIENTE("Pendiente"),
    CONFIRMADA("Confirmada"),
    PRODUCCION("En Producción"),
    LISTA("Lista para Entrega"),
    ENTREGADA("Entregada"),
    CANCELADA("Cancelada");

    private final String descripcion;

    EstadoPreorden(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
