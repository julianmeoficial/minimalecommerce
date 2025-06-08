package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Favorito;
import com.minimalecommerce.app.service.FavoritoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/favoritos")
public class FavoritoController {

    @Autowired
    private FavoritoService favoritoService;

    @PostMapping
    public ResponseEntity<Favorito> agregarAFavoritos(@RequestBody Map<String, Object> request) {
        Long usuarioId = Long.valueOf(request.get("usuarioId").toString());
        Long productoId = Long.valueOf(request.get("productoId").toString());
        Boolean notificarStock = request.get("notificarStock") != null ?
                (Boolean) request.get("notificarStock") : false;

        Favorito favorito = favoritoService.agregarAFavoritos(usuarioId, productoId, notificarStock);
        return ResponseEntity.ok(favorito);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Favorito>> obtenerFavoritosPorUsuario(@PathVariable Long usuarioId) {
        List<Favorito> favoritos = favoritoService.obtenerFavoritosPorUsuario(usuarioId);
        return ResponseEntity.ok(favoritos);
    }

    @GetMapping("/usuario/{usuarioId}/producto/{productoId}/verificar")
    public ResponseEntity<Map<String, Boolean>> verificarEnFavoritos(@PathVariable Long usuarioId, @PathVariable Long productoId) {
        boolean estaEnFavoritos = favoritoService.estaEnFavoritos(usuarioId, productoId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("estaEnFavoritos", estaEnFavoritos);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/usuario/{usuarioId}/producto/{productoId}")
    public ResponseEntity<Map<String, String>> eliminarDeFavoritos(@PathVariable Long usuarioId, @PathVariable Long productoId) {
        favoritoService.eliminarDeFavoritos(usuarioId, productoId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Producto eliminado de favoritos");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/usuario/{usuarioId}/contador")
    public ResponseEntity<Map<String, Object>> contarFavoritos(@PathVariable Long usuarioId) {
        Long contador = favoritoService.contarFavoritos(usuarioId);
        Map<String, Object> response = new HashMap<>();
        response.put("usuarioId", usuarioId);
        response.put("totalFavoritos", contador);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/productos-populares")
    public ResponseEntity<List<Object[]>> obtenerProductosMasFavoritos() {
        List<Object[]> productos = favoritoService.obtenerProductosMasFavoritos();
        return ResponseEntity.ok(productos);
    }

    @PutMapping("/{id}/notificacion-stock")
    public ResponseEntity<Favorito> actualizarNotificacionStock(@PathVariable Long id, @RequestParam Boolean notificar) {
        Favorito favorito = favoritoService.actualizarNotificacionStock(id, notificar);
        return ResponseEntity.ok(favorito);
    }
}
