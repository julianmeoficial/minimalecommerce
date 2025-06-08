package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Cupon;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.TipoCupon;
import com.minimalecommerce.app.repository.CuponRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CuponService {

    @Autowired
    private CuponRepository cuponRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Crear nuevo cupón
    public Cupon crearCupon(Cupon cupon) {
        if (cupon.getCreador() == null || cupon.getCreador().getId() == null) {
            throw new RuntimeException("Debe especificar un creador válido");
        }

        Optional<Usuario> creador = usuarioRepository.findById(cupon.getCreador().getId());
        if (!creador.isPresent()) {
            throw new RuntimeException("Creador no encontrado");
        }

        // Verificar que el código no exista
        if (cuponRepository.existsByCodigo(cupon.getCodigo())) {
            throw new RuntimeException("Ya existe un cupón con ese código");
        }

        cupon.setCreador(creador.get());
        cupon.setActivo(true);
        cupon.setUsosactuales(0);

        return cuponRepository.save(cupon);
    }

    // Obtener cupones por vendedor
    public List<Cupon> obtenerCuponesPorVendedor(Long vendedorId) {
        return cuponRepository.findByCreadorId(vendedorId);
    }

    // Obtener cupones activos por vendedor
    public List<Cupon> obtenerCuponesActivosPorVendedor(Long vendedorId) {
        return cuponRepository.findByCreadorIdAndActivoTrue(vendedorId);
    }

    // Buscar cupón por código
    public Optional<Cupon> buscarPorCodigo(String codigo) {
        return cuponRepository.findByCodigo(codigo);
    }

    // Validar y aplicar cupón
    public Cupon aplicarCupon(String codigo, BigDecimal montoOriginal) {
        Optional<Cupon> cuponOpt = cuponRepository.findByCodigo(codigo);
        if (!cuponOpt.isPresent()) {
            throw new RuntimeException("Cupón no encontrado");
        }

        Cupon cupon = cuponOpt.get();
        if (!cupon.esValido()) {
            throw new RuntimeException("Cupón no válido o expirado");
        }

        // Incrementar usos
        cupon.setUsosactuales(cupon.getUsosactuales() + 1);

        // Si alcanzó el máximo de usos, desactivar
        if (cupon.getUsosactuales() >= cupon.getUsosmaximo()) {
            cupon.setActivo(false);
        }

        return cuponRepository.save(cupon);
    }

    // Obtener cupones válidos
    public List<Cupon> obtenerCuponesValidos() {
        return cuponRepository.findCuponesValidos(LocalDateTime.now());
    }

    // Obtener cupones válidos por vendedor
    public List<Cupon> obtenerCuponesValidosPorVendedor(Long vendedorId) {
        return cuponRepository.findCuponesValidosPorVendedor(vendedorId, LocalDateTime.now());
    }

    // Desactivar cupón
    public Cupon desactivarCupon(Long cuponId) {
        Optional<Cupon> cupon = cuponRepository.findById(cuponId);
        if (cupon.isPresent()) {
            cupon.get().setActivo(false);
            return cuponRepository.save(cupon.get());
        }
        throw new RuntimeException("Cupón no encontrado");
    }

    // Actualizar cupón
    public Cupon actualizarCupon(Long id, Cupon cupon) {
        Optional<Cupon> cuponExistente = cuponRepository.findById(id);
        if (cuponExistente.isPresent()) {
            cupon.setId(id);
            cupon.setCreador(cuponExistente.get().getCreador());
            return cuponRepository.save(cupon);
        }
        throw new RuntimeException("Cupón no encontrado");
    }

    // Contar cupones activos por vendedor
    public Long contarCuponesActivos(Long vendedorId) {
        return cuponRepository.countByCreadorIdAndActivoTrue(vendedorId);
    }

    // Obtener cupones próximos a vencer
    public List<Cupon> obtenerCuponesProximosAVencer(Long vendedorId, int dias) {
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime fechaLimite = ahora.plusDays(dias);
        return cuponRepository.findCuponesProximosAVencer(vendedorId, ahora, fechaLimite);
    }
}
