package com.minimalecommerce.app.model;

public enum TipoNotificacion {
    // VALORES EXACTOS de tu enum de BD
    CARRITO("Carrito"),
    DESCUENTO("Descuento"),
    EVENTO("Evento"),
    INFORMATIVA("Informativa"),
    NUEVO_PRODUCTO("Nuevo Producto"),
    PEDIDO("Pedido"),
    PRODUCTO("Producto"),
    PROMOCION("Promoción"),
    SISTEMA("Sistema"),
    STOCK("Stock"),
    URGENTE("Urgente");

    private final String descripcion;

    TipoNotificacion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }

    // MÉTODO para convertir desde frontend (exacto a tu BD)
    public static TipoNotificacion fromString(String tipo) {
        if (tipo == null || tipo.trim().isEmpty()) return INFORMATIVA;

        try {
            // Convertir directamente ya que los valores coinciden
            return TipoNotificacion.valueOf(tipo.toUpperCase().trim());
        } catch (Exception e) {
            System.err.println("Error convirtiendo tipo: " + tipo);
            return INFORMATIVA;
        }
    }
}
