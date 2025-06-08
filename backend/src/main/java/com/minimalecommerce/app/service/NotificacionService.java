package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Notificacion;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.TipoNotificacion;
import com.minimalecommerce.app.repository.NotificacionRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NotificacionService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Crear nueva notificación
    public Notificacion crearNotificacion(Notificacion notificacion) {
        if (notificacion.getUsuario() == null || notificacion.getUsuario().getId() == null) {
            throw new RuntimeException("Debe especificar un usuario válido");
        }

        Optional<Usuario> usuario = usuarioRepository.findById(notificacion.getUsuario().getId());
        if (!usuario.isPresent()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        notificacion.setUsuario(usuario.get());
        return notificacionRepository.save(notificacion);
    }

    // Obtener notificaciones por usuario
    public List<Notificacion> obtenerNotificacionesPorUsuario(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByFechacreacionDesc(usuarioId);
    }

    // Obtener notificaciones no leídas
    public List<Notificacion> obtenerNotificacionesNoLeidas(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdAndLeidaFalse(usuarioId);
    }

    // Contar notificaciones no leídas
    public Long contarNotificacionesNoLeidas(Long usuarioId) {
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuarioId);
    }

    // Marcar notificación como leída
    public Notificacion marcarComoLeida(Long notificacionId) {
        Optional<Notificacion> notificacion = notificacionRepository.findById(notificacionId);
        if (notificacion.isPresent()) {
            notificacion.get().setLeida(true);
            return notificacionRepository.save(notificacion.get());
        }
        throw new RuntimeException("Notificación no encontrada");
    }

    // Marcar todas como leídas
    public void marcarTodasComoLeidas(Long usuarioId) {
        notificacionRepository.marcarTodasComoLeidas(usuarioId);
    }

    // Obtener por tipo
    public List<Notificacion> obtenerPorTipo(Long usuarioId, TipoNotificacion tipo) {
        return notificacionRepository.findByUsuarioIdAndTipo(usuarioId, tipo);
    }

    // Eliminar notificación
    public void eliminarNotificacion(Long id) {
        notificacionRepository.deleteById(id);
    }
}
