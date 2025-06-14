package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Cupon;
import com.minimalecommerce.app.model.TipoCupon;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.repository.CuponRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CuponService {

    @Autowired
    private CuponRepository cuponRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ==================== OPERACIONES BÁSICAS ====================

    public List<Cupon> obtenerTodosCupones() {
        try {
            return cuponRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener cupones: " + e.getMessage());
        }
    }

    public List<Cupon> obtenerCuponesValidos() {
        try {
            LocalDateTime ahora = LocalDateTime.now();
            List<Cupon> cuponesValidos = cuponRepository.findCuponesValidos(ahora);

            // Log para debug
            System.out.println("✅ Cupones válidos encontrados: " + cuponesValidos.size());

            return cuponesValidos;
        } catch (Exception e) {
            System.err.println("❌ Error en obtenerCuponesValidos: " + e.getMessage());
            e.printStackTrace();

            // Fallback: devolver lista vacía en lugar de exception
            return new ArrayList<>();
        }
    }

    public List<Cupon> obtenerCuponesPorVendedor(Long vendedorId) {
        try {
            if (vendedorId == null) {
                throw new IllegalArgumentException("El ID del vendedor no puede ser null");
            }

            List<Cupon> cupones = cuponRepository.findByCreadorIdOrderByFechacreacionDesc(vendedorId);

            // Log para debug
            System.out.println("✅ Cupones del vendedor " + vendedorId + ": " + cupones.size());

            return cupones;
        } catch (Exception e) {
            System.err.println("❌ Error en obtenerCuponesPorVendedor: " + e.getMessage());
            e.printStackTrace();

            // Fallback: devolver lista vacía en lugar de exception
            return new ArrayList<>();
        }
    }

    public List<Cupon> obtenerCuponesActivosPorVendedor(Long vendedorId) {
        try {
            Usuario vendedor = usuarioRepository.findById(vendedorId)
                    .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));
            return cuponRepository.findByCreadorAndActivoTrue(vendedor);
        } catch (Exception e) {
            System.err.println("❌ Error en obtenerCuponesActivosPorVendedor: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public Optional<Cupon> obtenerCuponPorId(Long id) {
        try {
            return cuponRepository.findById(id);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener cupón por ID: " + e.getMessage());
        }
    }

    public Optional<Cupon> obtenerCuponPorCodigo(String codigo) {
        try {
            return cuponRepository.findByCodigoIgnoreCase(codigo.trim());
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener cupón por código: " + e.getMessage());
        }
    }

    // ==================== VALIDACIÓN Y USO DE CUPONES ====================

    public Cupon buscarPorCodigo(String codigo) {
        try {
            if (codigo == null || codigo.trim().isEmpty()) {
                throw new IllegalArgumentException("El código del cupón no puede estar vacío");
            }

            return cuponRepository.findByCodigoIgnoreCase(codigo.trim())
                    .orElseThrow(() -> new RuntimeException("Cupón no encontrado con código: " + codigo));

        } catch (Exception e) {
            throw new RuntimeException("Error al buscar cupón por código: " + e.getMessage());
        }
    }

    public Cupon validarYObtenerCupon(String codigo) {
        if (codigo == null || codigo.trim().isEmpty()) {
            throw new IllegalArgumentException("El código del cupón no puede estar vacío");
        }

        try {
            Cupon cupon = cuponRepository.findByCodigoIgnoreCase(codigo.trim())
                    .orElseThrow(() -> new RuntimeException("Cupón no encontrado"));

            if (!cupon.getActivo()) {
                throw new RuntimeException("El cupón está inactivo");
            }

            LocalDateTime ahora = LocalDateTime.now();

            if (ahora.isBefore(cupon.getFechainicio())) {
                throw new RuntimeException("El cupón aún no está vigente");
            }

            if (ahora.isAfter(cupon.getFechavencimiento())) {
                throw new RuntimeException("El cupón ha expirado");
            }

            if (cupon.getUsosactuales() >= cupon.getUsosmaximo()) {
                throw new RuntimeException("El cupón ha alcanzado su límite de usos");
            }

            return cupon;

        } catch (Exception e) {
            throw new RuntimeException("Error al validar cupón: " + e.getMessage());
        }
    }

    public BigDecimal calcularDescuento(Cupon cupon, BigDecimal montoBase) {
        try {
            if (cupon == null || montoBase == null || montoBase.compareTo(BigDecimal.ZERO) <= 0) {
                return BigDecimal.ZERO;
            }

            return cupon.calcularDescuento(montoBase);

        } catch (Exception e) {
            throw new RuntimeException("Error al calcular descuento: " + e.getMessage());
        }
    }

    public BigDecimal aplicarCupon(String codigo, BigDecimal montoBase) {
        try {
            Cupon cupon = validarYObtenerCupon(codigo);
            BigDecimal descuento = calcularDescuento(cupon, montoBase);

            // Incrementar uso del cupón
            cupon.incrementarUso();
            cuponRepository.save(cupon);

            return descuento;

        } catch (Exception e) {
            throw new RuntimeException("Error al aplicar cupón: " + e.getMessage());
        }
    }

    // ==================== GESTIÓN DE CUPONES ====================

    public Cupon crearCupon(Cupon cupon) {
        try {
            // Validaciones
            validarDatosCupon(cupon);

            // Verificar que el código no exista
            if (cuponRepository.existsByCodigoIgnoreCase(cupon.getCodigo())) {
                throw new RuntimeException("Ya existe un cupón con este código");
            }

            // VALIDAR Y ASIGNAR CREADOR SI NO EXISTE
            if (cupon.getCreador() == null || cupon.getCreador().getId() == null) {
                System.out.println("⚠️ Creador no asignado, buscando usuario por defecto");
                Usuario usuarioDefault = usuarioRepository.findById(1L)
                        .orElseThrow(() -> new RuntimeException("Usuario por defecto no encontrado"));
                cupon.setCreador(usuarioDefault);
            }

            // Establecer valores por defecto
            cupon.setFechacreacion(LocalDateTime.now());
            cupon.setUsosactuales(0);
            cupon.setActivo(true);

            return cuponRepository.save(cupon);

        } catch (Exception e) {
            throw new RuntimeException("Error al crear cupón: " + e.getMessage());
        }
    }

    public Cupon actualizarCupon(Long id, Cupon cuponActualizado) {
        try {
            Cupon cuponExistente = cuponRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Cupón no encontrado"));

            // Validar que el código no esté en uso por otro cupón
            if (!cuponExistente.getCodigo().equalsIgnoreCase(cuponActualizado.getCodigo())) {
                if (cuponRepository.existsByCodigoIgnoreCase(cuponActualizado.getCodigo())) {
                    throw new RuntimeException("Ya existe un cupón con este código");
                }
            }

            // Validar datos
            validarDatosCupon(cuponActualizado);

            // Actualizar campos
            cuponExistente.setCodigo(cuponActualizado.getCodigo());
            cuponExistente.setTipo(cuponActualizado.getTipo());
            cuponExistente.setValor(cuponActualizado.getValor());
            cuponExistente.setDescripcion(cuponActualizado.getDescripcion());
            cuponExistente.setFechainicio(cuponActualizado.getFechainicio());
            cuponExistente.setFechavencimiento(cuponActualizado.getFechavencimiento());
            cuponExistente.setUsosmaximo(cuponActualizado.getUsosmaximo());
            cuponExistente.setActivo(cuponActualizado.getActivo());

            return cuponRepository.save(cuponExistente);

        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar cupón: " + e.getMessage());
        }
    }

    public void desactivarCupon(Long id) {
        try {
            Cupon cupon = cuponRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Cupón no encontrado"));

            cupon.setActivo(false);
            cuponRepository.save(cupon);

        } catch (Exception e) {
            throw new RuntimeException("Error al desactivar cupón: " + e.getMessage());
        }
    }

    public void eliminarCupon(Long id) {
        try {
            if (!cuponRepository.existsById(id)) {
                throw new RuntimeException("Cupón no encontrado");
            }

            cuponRepository.deleteById(id);

        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar cupón: " + e.getMessage());
        }
    }

    // ==================== CONSULTAS ESPECIALIZADAS ====================

    public List<Cupon> obtenerCuponesProximosAVencer(int dias) {
        try {
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime fechaLimite = ahora.plusDays(dias);
            return cuponRepository.findCuponesProximosAVencer(ahora, fechaLimite);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener cupones próximos a vencer: " + e.getMessage());
        }
    }

    public List<Cupon> obtenerCuponesProximosAVencerPorVendedor(Long vendedorId, int dias) {
        try {
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime fechaLimite = ahora.plusDays(dias);
            return cuponRepository.findCuponesProximosAVencerByVendedor(vendedorId, ahora, fechaLimite);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener cupones próximos a vencer del vendedor: " + e.getMessage());
        }
    }

    public List<Cupon> obtenerCuponesPorTipo(TipoCupon tipo) {
        try {
            return cuponRepository.findByTipoAndActivoTrue(tipo);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener cupones por tipo: " + e.getMessage());
        }
    }

    public List<Cupon> buscarCupones(String texto) {
        try {
            return cuponRepository.findByDescripcionOrCodigoContaining(texto);
        } catch (Exception e) {
            throw new RuntimeException("Error al buscar cupones: " + e.getMessage());
        }
    }

    // ==================== ESTADÍSTICAS ====================

    public Long contarCuponesPorVendedor(Long vendedorId) {
        try {
            return cuponRepository.countByCreadorId(vendedorId);
        } catch (Exception e) {
            throw new RuntimeException("Error al contar cupones del vendedor: " + e.getMessage());
        }
    }

    public Long contarCuponesActivosPorVendedor(Long vendedorId) {
        try {
            return cuponRepository.countActivosByCreadorId(vendedorId);
        } catch (Exception e) {
            throw new RuntimeException("Error al contar cupones activos del vendedor: " + e.getMessage());
        }
    }

    public Long obtenerTotalUsosPorVendedor(Long vendedorId) {
        try {
            return cuponRepository.sumUsosActualesByCreadorId(vendedorId);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener total de usos del vendedor: " + e.getMessage());
        }
    }

    public List<Cupon> obtenerTopCuponesMasUsados() {
        try {
            return cuponRepository.findTopCuponesMasUsados();
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener top cupones más usados: " + e.getMessage());
        }
    }

    // ==================== MANTENIMIENTO ====================

    public int desactivarCuponesVencidos() {
        try {
            return cuponRepository.desactivarCuponesVencidos(LocalDateTime.now());
        } catch (Exception e) {
            throw new RuntimeException("Error al desactivar cupones vencidos: " + e.getMessage());
        }
    }

    // ==================== MÉTODOS ADICIONALES PARA FRONTEND ====================

    public List<Cupon> obtenerCuponesPorVendedorConEstadisticas(Long vendedorId) {
        try {
            List<Cupon> cupones = obtenerCuponesPorVendedor(vendedorId);

            // Añadir información adicional de estadísticas si es necesario
            return cupones.stream()
                    .peek(cupon -> {
                        // Calcular eficiencia
                        if (cupon.getUsosmaximo() > 0) {
                            double eficiencia = (double) cupon.getUsosactuales() / cupon.getUsosmaximo() * 100;
                            // Podrías agregar un campo calculado aquí si fuera necesario
                        }
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener cupones con estadísticas: " + e.getMessage());
        }
    }

    public Map<String, Object> obtenerEstadisticasCompletas(Long vendedorId) {
        try {
            Map<String, Object> estadisticas = new HashMap<>();

            // Contadores básicos
            estadisticas.put("totalCupones", contarCuponesPorVendedor(vendedorId));
            estadisticas.put("cuponesActivos", contarCuponesActivosPorVendedor(vendedorId));
            estadisticas.put("totalUsos", obtenerTotalUsosPorVendedor(vendedorId));

            // Cupones próximos a vencer
            List<Cupon> proximosVencer = obtenerCuponesProximosAVencerPorVendedor(vendedorId, 7);
            estadisticas.put("proximosVencer", proximosVencer.size());

            // Distribución por tipo
            List<Cupon> todosCupones = obtenerCuponesPorVendedor(vendedorId);
            long cuponesPorcentaje = todosCupones.stream()
                    .filter(c -> c.getTipo() == TipoCupon.PORCENTAJE)
                    .count();
            long cuponesMontoFijo = todosCupones.stream()
                    .filter(c -> c.getTipo() == TipoCupon.MONTO_FIJO)
                    .count();

            estadisticas.put("cuponesPorcentaje", cuponesPorcentaje);
            estadisticas.put("cuponesMontoFijo", cuponesMontoFijo);

            // Ahorro total estimado
            double ahorroTotal = todosCupones.stream()
                    .mapToDouble(cupon -> {
                        if (cupon.getTipo() == TipoCupon.MONTO_FIJO) {
                            return cupon.getValor().doubleValue() * cupon.getUsosactuales();
                        } else {
                            // Estimación para porcentajes (asumiendo compra promedio de $150)
                            return 150 * (cupon.getValor().doubleValue() / 100) * cupon.getUsosactuales();
                        }
                    })
                    .sum();

            estadisticas.put("ahorroTotal", ahorroTotal);

            return estadisticas;

        } catch (Exception e) {
            throw new RuntimeException("Error al obtener estadísticas completas: " + e.getMessage());
        }
    }

    // Método para buscar cupones con filtros avanzados
    public List<Cupon> buscarCuponesConFiltros(Long vendedorId, String tipo, String estado, String busqueda) {
        try {
            List<Cupon> cupones = obtenerCuponesPorVendedor(vendedorId);

            return cupones.stream()
                    .filter(cupon -> {
                        // Filtro por tipo
                        if (tipo != null && !tipo.isEmpty() && !cupon.getTipo().name().equals(tipo)) {
                            return false;
                        }

                        // Filtro por estado
                        if (estado != null && !estado.isEmpty()) {
                            String estadoCalculado = calcularEstadoCupon(cupon);
                            if (!estadoCalculado.equals(estado)) {
                                return false;
                            }
                        }

                        // Filtro por búsqueda
                        if (busqueda != null && !busqueda.isEmpty()) {
                            String busquedaLower = busqueda.toLowerCase();
                            return cupon.getCodigo().toLowerCase().contains(busquedaLower) ||
                                    (cupon.getDescripcion() != null &&
                                            cupon.getDescripcion().toLowerCase().contains(busquedaLower));
                        }

                        return true;
                    })
                    .collect(Collectors.toList());

        } catch (Exception e) {
            throw new RuntimeException("Error al buscar cupones con filtros: " + e.getMessage());
        }
    }

    private String calcularEstadoCupon(Cupon cupon) {
        LocalDateTime ahora = LocalDateTime.now();

        if (!cupon.getActivo()) {
            return "inactivo";
        }

        if (cupon.getUsosactuales() >= cupon.getUsosmaximo()) {
            return "agotado";
        }

        if (ahora.isBefore(cupon.getFechainicio())) {
            return "pendiente";
        }

        if (ahora.isAfter(cupon.getFechavencimiento())) {
            return "vencido";
        }

        // Próximo a vencer (menos de 7 días)
        long diferenciaDias = java.time.temporal.ChronoUnit.DAYS.between(ahora, cupon.getFechavencimiento());
        if (diferenciaDias <= 7) {
            return "proximo-vencer";
        }

        return "activo";
    }

    // ==================== VALIDACIONES PRIVADAS ====================

    private void validarDatosCupon(Cupon cupon) {
        if (cupon.getCodigo() == null || cupon.getCodigo().trim().isEmpty()) {
            throw new IllegalArgumentException("El código del cupón es obligatorio");
        }

        if (cupon.getCodigo().length() > 50) {
            throw new IllegalArgumentException("El código del cupón no puede exceder 50 caracteres");
        }

        if (cupon.getTipo() == null) {
            throw new IllegalArgumentException("El tipo de cupón es obligatorio");
        }

        if (cupon.getValor() == null || cupon.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El valor del cupón debe ser mayor a 0");
        }

        if (cupon.getTipo() == TipoCupon.PORCENTAJE && cupon.getValor().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("El porcentaje de descuento no puede ser mayor a 100%");
        }

        if (cupon.getUsosmaximo() == null || cupon.getUsosmaximo() <= 0) {
            throw new IllegalArgumentException("Los usos máximos deben ser mayor a 0");
        }

        if (cupon.getFechainicio() == null) {
            throw new IllegalArgumentException("La fecha de inicio es obligatoria");
        }

        if (cupon.getFechavencimiento() == null) {
            throw new IllegalArgumentException("La fecha de vencimiento es obligatoria");
        }

        if (cupon.getFechavencimiento().isBefore(cupon.getFechainicio())) {
            throw new IllegalArgumentException("La fecha de vencimiento debe ser posterior a la fecha de inicio");
        }

        if (cupon.getDescripcion() != null && cupon.getDescripcion().length() > 500) {
            throw new IllegalArgumentException("La descripción no puede exceder 500 caracteres");
        }

        if (cupon.getCreador() == null) {
            throw new IllegalArgumentException("El creador del cupón es obligatorio");
        }
    }
}
