package com.minimalecommerce.app.model;

public enum TipoCupon {
    PORCENTAJE("Porcentaje"),
    MONTO_FIJO("Monto Fijo");

    private final String descripcion;

    TipoCupon(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
