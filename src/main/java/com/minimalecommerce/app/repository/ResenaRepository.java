package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Resena;
import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {

    // Métodos básicos
    List<Resena> findByProducto(Producto producto);
    List<Resena> findByProductoId(Long productoId);
    List<Resena> findByUsuario(Usuario usuario);
    List<Resena> findByUsuarioId(Long usuarioId);
    List<Resena> findByCalificacion(Integer calificacion);

    // Contadores
    Long countByUsuarioId(Long usuarioId);
    Long countByProductoId(Long productoId);

    // Verificaciones de existencia
    boolean existsByUsuarioIdAndProductoId(Long usuarioId, Long productoId);

    // Promedios
    @Query("SELECT AVG(r.calificacion) FROM Resena r WHERE r.producto.id = :productoId")
    Double obtenerPromedioCalificacion(@Param("productoId") Long productoId);

    @Query("SELECT AVG(r.calificacion) FROM Resena r")
    Double obtenerPromedioCalificacionGeneral();

    // Métodos para compradores (usando usuarioid como comprador)
    @Query("SELECT COUNT(r) > 0 FROM Resena r WHERE r.usuario.id = :compradorId AND r.producto.id = :productoId")
    boolean existeResenaDelCompradorParaProducto(@Param("compradorId") Long compradorId, @Param("productoId") Long productoId);

    @Query("SELECT r FROM Resena r WHERE r.usuario.id = :compradorId ORDER BY r.fecharesena DESC")
    List<Resena> findResenasEscritasPorComprador(@Param("compradorId") Long compradorId);

    @Query("SELECT COUNT(r) FROM Resena r WHERE r.usuario.id = :compradorId")
    Long countByCompradorId(@Param("compradorId") Long compradorId);

    // Métodos para vendedores (usando la relación producto->vendedor)
    @Query("SELECT r FROM Resena r WHERE r.producto.vendedor.id = :vendedorId ORDER BY r.fecharesena DESC")
    List<Resena> findResenasRecibidasPorVendedor(@Param("vendedorId") Long vendedorId);

    @Query("SELECT AVG(r.calificacion) FROM Resena r WHERE r.producto.vendedor.id = :vendedorId")
    Double obtenerPromedioCalificacionVendedor(@Param("vendedorId") Long vendedorId);

    @Query("SELECT COUNT(r) FROM Resena r WHERE r.producto.vendedor.id = :vendedorId")
    Long countByVendedorId(@Param("vendedorId") Long vendedorId);

    // Para reseñas verificadas (cuando agregues el campo)
    @Query("SELECT r FROM Resena r WHERE r.producto.id = :productoId")
    List<Resena> findResenasVerificadasPorProducto(@Param("productoId") Long productoId);

    @Query("SELECT COUNT(r) FROM Resena r WHERE r.producto.vendedor.id = :vendedorId")
    Long countByVendedorIdAndVerificadaTrue(@Param("vendedorId") Long vendedorId);

    // Métodos adicionales
    @Query("SELECT r FROM Resena r WHERE r.producto.id = :productoId ORDER BY r.fecharesena DESC")
    List<Resena> findTopByProductoIdOrderByFecharesenaDesc(@Param("productoId") Long productoId, int limite);
}
