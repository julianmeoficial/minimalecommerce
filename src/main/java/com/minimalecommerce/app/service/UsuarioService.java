package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.TipoUsuario;
import com.minimalecommerce.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Registrar nuevo usuario (por defecto COMPRADOR)
    public Usuario registrarUsuario(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("Ya existe un usuario con ese email");
        }

        usuario.setId(null);
        usuario.setActivo(true);

        // Si no se especifica tipo, por defecto es COMPRADOR
        if (usuario.getTipousuario() == null) {
            usuario.setTipousuario(TipoUsuario.COMPRADOR);
        }

        return usuarioRepository.save(usuario);
    }

    // Registrar vendedor específicamente
    public Usuario registrarVendedor(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("Ya existe un usuario con ese email");
        }

        usuario.setId(null);
        usuario.setActivo(true);
        usuario.setTipousuario(TipoUsuario.VENDEDOR);

        return usuarioRepository.save(usuario);
    }

    // Métodos existentes
    public Optional<Usuario> login(String email, String password) {
        return usuarioRepository.findByEmailAndPassword(email, password);
    }

    public Optional<Usuario> obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Optional<Usuario> obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public List<Usuario> obtenerUsuariosActivos() {
        return usuarioRepository.findByActivoTrue();
    }

    // NUEVOS MÉTODOS: Por tipo de usuario
    public List<Usuario> obtenerCompradores() {
        return usuarioRepository.findByTipousuarioAndActivoTrue(TipoUsuario.COMPRADOR);
    }

    public List<Usuario> obtenerVendedores() {
        return usuarioRepository.findByTipousuarioAndActivoTrue(TipoUsuario.VENDEDOR);
    }

    public List<Usuario> obtenerUsuariosPorTipo(TipoUsuario tipo) {
        return usuarioRepository.findByTipousuario(tipo);
    }

    public Long contarUsuariosPorTipo(TipoUsuario tipo) {
        return usuarioRepository.countByTipousuario(tipo);
    }

    // Cambiar tipo de usuario
    public Usuario cambiarTipoUsuario(Long usuarioId, TipoUsuario nuevoTipo) {
        Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);
        if (usuario.isPresent()) {
            usuario.get().setTipousuario(nuevoTipo);
            return usuarioRepository.save(usuario.get());
        }
        throw new RuntimeException("Usuario no encontrado");
    }

    // Métodos existentes continuos...
    public Usuario actualizarUsuario(Long id, Usuario usuario) {
        Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);
        if (usuarioExistente.isPresent()) {
            usuario.setId(id);
            return usuarioRepository.save(usuario);
        }
        throw new RuntimeException("Usuario no encontrado");
    }

    public void desactivarUsuario(Long id) {
        Optional<Usuario> usuario = usuarioRepository.findById(id);
        if (usuario.isPresent()) {
            usuario.get().setActivo(false);
            usuarioRepository.save(usuario.get());
        }
    }

    public List<Usuario> buscarUsuarios(String nombre) {
        return usuarioRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public boolean existeEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }
}
