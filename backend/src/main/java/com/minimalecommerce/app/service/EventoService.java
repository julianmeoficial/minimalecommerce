package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Evento;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.repository.EventoRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventoService {

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Obtener todos los eventos activos
    public List<Evento> obtenerEventosActivos() {
        return eventoRepository.findByActivoTrue();
    }

    // Obtener evento por ID
    public Optional<Evento> obtenerEventoPorId(Long id) {
        return eventoRepository.findById(id);
    }

    // Crear nuevo evento
    public Evento crearEvento(Evento evento) {
        if (evento.getUsuario() == null || evento.getUsuario().getId() == null) {
            throw new RuntimeException("Debe especificar un usuario válido");
        }

        Optional<Usuario> usuario = usuarioRepository.findById(evento.getUsuario().getId());
        if (!usuario.isPresent()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        evento.setUsuario(usuario.get());
        evento.setActivo(true);

        return eventoRepository.save(evento);
    }

    // Obtener eventos por usuario
    public List<Evento> obtenerEventosPorUsuario(Long usuarioId) {
        return eventoRepository.findByUsuarioId(usuarioId);
    }

    // Obtener eventos próximos
    public List<Evento> obtenerEventosProximos() {
        return eventoRepository.findEventosProximos(LocalDateTime.now());
    }

    // Buscar eventos por título
    public List<Evento> buscarEventos(String titulo) {
        return eventoRepository.findByTituloContainingIgnoreCaseAndActivoTrue(titulo);
    }

    // Actualizar evento
    public Evento actualizarEvento(Long id, Evento evento) {
        Optional<Evento> eventoExistente = eventoRepository.findById(id);
        if (eventoExistente.isPresent()) {
            evento.setId(id);
            return eventoRepository.save(evento);
        }
        throw new RuntimeException("Evento no encontrado");
    }

    // Desactivar evento
    public void desactivarEvento(Long id) {
        Optional<Evento> evento = eventoRepository.findById(id);
        if (evento.isPresent()) {
            evento.get().setActivo(false);
            eventoRepository.save(evento.get());
        }
    }

    // Eliminar evento
    public void eliminarEvento(Long id) {
        eventoRepository.deleteById(id);
    }
}
