package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.TipoUsuario;
import com.minimalecommerce.app.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // Endpoints existentes...
    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrarUsuario(@RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
        return ResponseEntity.ok(nuevoUsuario);
    }

    // NUEVO: Registrar vendedor específicamente
    @PostMapping("/registro/vendedor")
    public ResponseEntity<Usuario> registrarVendedor(@RequestBody Usuario usuario) {
        Usuario nuevoVendedor = usuarioService.registrarVendedor(usuario);
        return ResponseEntity.ok(nuevoVendedor);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<Usuario> usuario = usuarioService.login(email, password);
        Map<String, Object> response = new HashMap<>();

        if (usuario.isPresent()) {
            response.put("success", true);
            response.put("message", "Login exitoso");
            response.put("usuario", usuario.get());
            response.put("tipoUsuario", usuario.get().getTipousuario().getDescripcion());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Credenciales incorrectas");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // NUEVOS ENDPOINTS: Por tipo de usuario
    @GetMapping("/compradores")
    public ResponseEntity<List<Usuario>> obtenerCompradores() {
        List<Usuario> compradores = usuarioService.obtenerCompradores();
        return ResponseEntity.ok(compradores);
    }

    @GetMapping("/vendedores")
    public ResponseEntity<List<Usuario>> obtenerVendedores() {
        List<Usuario> vendedores = usuarioService.obtenerVendedores();
        return ResponseEntity.ok(vendedores);
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Usuario>> obtenerUsuariosPorTipo(@PathVariable TipoUsuario tipo) {
        List<Usuario> usuarios = usuarioService.obtenerUsuariosPorTipo(tipo);
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCompradores", usuarioService.contarUsuariosPorTipo(TipoUsuario.COMPRADOR));
        stats.put("totalVendedores", usuarioService.contarUsuariosPorTipo(TipoUsuario.VENDEDOR));
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/{id}/tipo")
    public ResponseEntity<Usuario> cambiarTipoUsuario(@PathVariable Long id, @RequestParam TipoUsuario tipo) {
        Usuario usuarioActualizado = usuarioService.cambiarTipoUsuario(id, tipo);
        return ResponseEntity.ok(usuarioActualizado);
    }

    // Resto de endpoints existentes...
    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerTodosUsuarios() {
        List<Usuario> usuarios = usuarioService.obtenerUsuariosActivos();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuarioPorId(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioService.obtenerUsuarioPorId(id);
        return usuario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Usuario> obtenerUsuarioPorEmail(@PathVariable String email) {
        Optional<Usuario> usuario = usuarioService.obtenerUsuarioPorEmail(email);
        return usuario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        Map<String, Object> response = new HashMap<>();
        try {
            Usuario usuarioActualizado = usuarioService.actualizarUsuario(id, usuario);
            // Limpiar contraseña antes de enviar
            usuarioActualizado.setPassword(null);

            response.put("success", true);
            response.put("message", "Usuario actualizado correctamente");
            response.put("usuario", usuarioActualizado);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al actualizar usuario: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> desactivarUsuario(@PathVariable Long id) {
        usuarioService.desactivarUsuario(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Usuario desactivado correctamente");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/buscar/{nombre}")
    public ResponseEntity<List<Usuario>> buscarUsuarios(@PathVariable String nombre) {
        List<Usuario> usuarios = usuarioService.buscarUsuarios(nombre);
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/verificar-email/{email}")
    public ResponseEntity<Map<String, Boolean>> verificarEmail(@PathVariable String email) {
        boolean existe = usuarioService.existeEmail(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("existe", existe);
        return ResponseEntity.ok(response);
    }
}
