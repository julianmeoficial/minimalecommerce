package com.minimalecommerce.app.model;

public enum TipoNotificacion {
    PEDIDO("Pedido"),
    EVENTO("Evento"),
    PROMOCION("Promoción"),
    SISTEMA("Sistema"),
    PRODUCTO("Producto"),
    CARRITO("Carrito");

    private final String descripcion;

    TipoNotificacion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
