package com.minimalecommerce.app.model;

public enum TipoUsuario {
    COMPRADOR("Comprador"),
    VENDEDOR("Vendedor");

    private final String descripcion;

    TipoUsuario(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
