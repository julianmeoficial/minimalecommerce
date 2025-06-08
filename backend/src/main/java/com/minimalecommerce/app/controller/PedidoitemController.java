package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Pedidoitem;
import com.minimalecommerce.app.service.PedidoitemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidoitems")
public class PedidoitemController {

    @Autowired
    private PedidoitemService pedidoitemService;

    @GetMapping
    public ResponseEntity<List<Pedidoitem>> obtenerTodosPedidoitems() {
        List<Pedidoitem> items = pedidoitemService.obtenerTodosPedidoitems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedidoitem> obtenerPedidoitemPorId(@PathVariable Long id) {
        Optional<Pedidoitem> item = pedidoitemService.obtenerPedidoitemPorId(id);
        return item.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Pedidoitem> crearPedidoitem(@RequestBody Pedidoitem pedidoitem) {
        Pedidoitem nuevoItem = pedidoitemService.crearPedidoitem(pedidoitem);
        return ResponseEntity.ok(nuevoItem);
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<List<Pedidoitem>> obtenerItemsPorPedido(@PathVariable Long pedidoId) {
        List<Pedidoitem> items = pedidoitemService.obtenerItemsPorPedido(pedidoId);
        return ResponseEntity.ok(items);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pedidoitem> actualizarPedidoitem(@PathVariable Long id, @RequestBody Pedidoitem pedidoitem) {
        Pedidoitem itemActualizado = pedidoitemService.actualizarPedidoitem(id, pedidoitem);
        return ResponseEntity.ok(itemActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarPedidoitem(@PathVariable Long id) {
        pedidoitemService.eliminarPedidoitem(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Item de pedido eliminado correctamente");
        return ResponseEntity.ok(response);
    }
}
