package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Direccion;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.repository.DireccionRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DireccionService {

    @Autowired
    private DireccionRepository direccionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Crear nueva dirección
    public Direccion crearDireccion(Direccion direccion) {
        if (direccion.getUsuario() == null || direccion.getUsuario().getId() == null) {
            throw new RuntimeException("Debe especificar un usuario válido");
        }

        Optional<Usuario> usuario = usuarioRepository.findById(direccion.getUsuario().getId());
        if (!usuario.isPresent()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        direccion.setUsuario(usuario.get());
        direccion.setActiva(true);

        // Si es la primera dirección, marcarla como principal
        Long cantidadDirecciones = direccionRepository.countByUsuarioIdAndActivaTrue(direccion.getUsuario().getId());
        if (cantidadDirecciones == 0 || direccion.getPrincipal()) {
            // Si va a ser principal, quitar principal de las demás
            if (direccion.getPrincipal()) {
                quitarPrincipalAnterior(direccion.getUsuario().getId());
            }
            direccion.setPrincipal(cantidadDirecciones == 0 ? true : direccion.getPrincipal());
        }

        return direccionRepository.save(direccion);
    }

    // Obtener direcciones por usuario
    public List<Direccion> obtenerDireccionesPorUsuario(Long usuarioId) {
        return direccionRepository.findByUsuarioIdActivasOrdenadas(usuarioId);
    }

    // Obtener dirección principal
    public Optional<Direccion> obtenerDireccionPrincipal(Long usuarioId) {
        return direccionRepository.findByUsuarioIdAndPrincipalTrue(usuarioId);
    }

    // Establecer como principal
    public Direccion establecerComoPrincipal(Long direccionId) {
        Optional<Direccion> direccion = direccionRepository.findById(direccionId);
        if (!direccion.isPresent()) {
            throw new RuntimeException("Dirección no encontrada");
        }

        // Quitar principal de las demás direcciones del usuario
        quitarPrincipalAnterior(direccion.get().getUsuario().getId());

        // Establecer como principal
        direccion.get().setPrincipal(true);
        return direccionRepository.save(direccion.get());
    }

    // Actualizar dirección
    public Direccion actualizarDireccion(Long id, Direccion direccion) {
        Optional<Direccion> direccionExistente = direccionRepository.findById(id);
        if (direccionExistente.isPresent()) {
            direccion.setId(id);
            direccion.setUsuario(direccionExistente.get().getUsuario());

            // Si se marca como principal, quitar principal de las demás
            if (direccion.getPrincipal()) {
                quitarPrincipalAnterior(direccion.getUsuario().getId());
            }

            return direccionRepository.save(direccion);
        }
        throw new RuntimeException("Dirección no encontrada");
    }

    // Desactivar dirección
    public void desactivarDireccion(Long id) {
        Optional<Direccion> direccion = direccionRepository.findById(id);
        if (direccion.isPresent()) {
            direccion.get().setActiva(false);
            direccion.get().setPrincipal(false);
            direccionRepository.save(direccion.get());
        }
    }

    // Método privado para quitar principal anterior
    private void quitarPrincipalAnterior(Long usuarioId) {
        Optional<Direccion> direccionPrincipalAnterior = direccionRepository.findByUsuarioIdAndPrincipalTrue(usuarioId);
        if (direccionPrincipalAnterior.isPresent()) {
            direccionPrincipalAnterior.get().setPrincipal(false);
            direccionRepository.save(direccionPrincipalAnterior.get());
        }
    }

    // Contar direcciones activas
    public Long contarDirecciones(Long usuarioId) {
        return direccionRepository.countByUsuarioIdAndActivaTrue(usuarioId);
    }
}
