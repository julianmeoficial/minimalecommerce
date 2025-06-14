package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Notificacion;
import com.minimalecommerce.app.model.TipoUsuario;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.TipoNotificacion;
import com.minimalecommerce.app.repository.NotificacionRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificacionService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Crear nueva notificación individual (MANTENER ORIGINAL)
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

    // NUEVO: Crear notificación masiva usando Map (sin DTO)
    public List<Notificacion> crearNotificacionMasiva(java.util.Map<String, Object> datos) {
        // Extraer datos del Map que viene del frontend
        String titulo = (String) datos.get("titulo");
        String mensaje = (String) datos.get("mensaje");
        String tipo = (String) datos.get("tipo");
        String enlace = (String) datos.get("enlace");
        String destinatarios = (String) datos.get("destinatarios");
        Long remitenteId = datos.get("remitenteId") != null ?
                Long.valueOf(datos.get("remitenteId").toString()) : null;

        @SuppressWarnings("unchecked")
        List<Long> usuariosSeleccionados = (List<Long>) datos.get("usuariosSeleccionados");

        // Validar remitente (vendedor)
        Usuario remitente = null;
        if (remitenteId != null) {
            remitente = usuarioRepository.findById(remitenteId)
                    .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));
        }

        // Obtener lista de usuarios destinatarios
        List<Long> usuariosIds = obtenerUsuariosDestinatarios(destinatarios, usuariosSeleccionados);

        List<Notificacion> notificacionesCreadas = new ArrayList<>();

        for (Long usuarioId : usuariosIds) {
            Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);
            if (usuario.isPresent()) {
                Notificacion notificacion = new Notificacion();
                notificacion.setTitulo(titulo);
                notificacion.setMensaje(mensaje);
                notificacion.setTipo(convertirTipo(tipo));
                notificacion.setEnlace(enlace);
                notificacion.setUsuario(usuario.get());
                notificacion.setRemitente(remitente);

                // Configurar estado por defecto
                notificacion.setEstadoEnvio(Notificacion.EstadoEnvio.ENVIADA);
                notificacion.setPrioridad(Notificacion.Prioridad.NORMAL);

                if (usuariosIds.size() > 1) {
                    notificacion.setDestinatarioTipo(Notificacion.DestinatarioTipo.GRUPO);
                } else {
                    notificacion.setDestinatarioTipo(Notificacion.DestinatarioTipo.INDIVIDUAL);
                }

                notificacionesCreadas.add(notificacionRepository.save(notificacion));
            }
        }

        return notificacionesCreadas;
    }

    // Método auxiliar para convertir string a enum
    private TipoNotificacion convertirTipo(String tipo) {
        try {
            // Usar el método fromString del enum
            return TipoNotificacion.fromString(tipo);
        } catch (Exception e) {
            System.err.println("Error convirtiendo tipo: " + tipo + " - " + e.getMessage());
            return TipoNotificacion.INFORMATIVA;
        }
    }

    // Método auxiliar para obtener usuarios
    private List<Long> obtenerUsuariosDestinatarios(String criteria, List<Long> usuariosSeleccionados) {
        switch (criteria.toLowerCase()) {
            case "todos":
                return usuarioRepository.findAll().stream()
                        .map(Usuario::getId)
                        .collect(Collectors.toList());

            case "compradores":
                return usuarioRepository.findByTipousuario(TipoUsuario.COMPRADOR).stream()
                        .map(Usuario::getId)
                        .collect(Collectors.toList());

            case "personalizado":
                return usuariosSeleccionados != null ? usuariosSeleccionados : new ArrayList<>();

            default:
                return new ArrayList<>();
        }
    }

    // RESTO DE MÉTODOS ORIGINALES SIN CAMBIOS
    public List<Notificacion> obtenerNotificacionesPorUsuario(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByFechacreacionDesc(usuarioId);
    }

    public List<Notificacion> obtenerNotificacionesNoLeidas(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdAndLeidaFalse(usuarioId);
    }

    public Long contarNotificacionesNoLeidas(Long usuarioId) {
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuarioId);
    }

    public Notificacion marcarComoLeida(Long notificacionId) {
        Optional<Notificacion> notificacion = notificacionRepository.findById(notificacionId);
        if (notificacion.isPresent()) {
            Notificacion notif = notificacion.get();
            notif.setLeida(true);
            notif.setFechaLectura(LocalDateTime.now());
            return notificacionRepository.save(notif);
        }
        throw new RuntimeException("Notificación no encontrada");
    }

    public void marcarTodasComoLeidas(Long usuarioId) {
        List<Notificacion> notificaciones = notificacionRepository.findByUsuarioIdAndLeidaFalse(usuarioId);
        for (Notificacion notif : notificaciones) {
            notif.setLeida(true);
            notif.setFechaLectura(LocalDateTime.now());
            notificacionRepository.save(notif);
        }
    }

    public List<Notificacion> obtenerPorTipo(Long usuarioId, TipoNotificacion tipo) {
        return notificacionRepository.findByUsuarioIdAndTipo(usuarioId, tipo);
    }

    public void eliminarNotificacion(Long id) {
        notificacionRepository.deleteById(id);
    }

    // NUEVO: Estadísticas simples para vendedores
    public java.util.Map<String, Object> obtenerEstadisticasVendedor(Long vendedorId) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();

        LocalDateTime inicioDelDia = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        // Usar método simple para contar
        long enviosHoy = notificacionRepository.findAll().stream()
                .filter(n -> n.getRemitente() != null && n.getRemitente().getId().equals(vendedorId))
                .filter(n -> n.getFechacreacion().isAfter(inicioDelDia))
                .count();

        stats.put("totalEnviadas", enviosHoy);
        stats.put("totalUsuarios", usuarioRepository.countByTipousuario(TipoUsuario.COMPRADOR));
        stats.put("tasaLectura", "75%"); // Valor por defecto

        return stats;
    }

    // NUEVO: Obtener historial de notificaciones por vendedor
    public List<Notificacion> obtenerHistorialPorVendedor(Long vendedorId) {
        return notificacionRepository.findByRemitenteIdOrderByFechacreacionDesc(vendedorId);
    }
}
