package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = loginData.get("email");
            String password = loginData.get("password");

            Usuario usuario = usuarioService.authenticateUser(email, password);

            if (usuario != null) {
                // Limpiar contraseña antes de enviar
                usuario.setPassword(null);

                response.put("success", true);
                response.put("message", "Login exitoso");
                response.put("user", usuario);

                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Credenciales inválidas");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error en el servidor: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
