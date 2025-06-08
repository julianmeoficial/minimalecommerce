package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.TipoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Métodos existentes
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Usuario> findByActivoTrue();
    List<Usuario> findByNombreContainingIgnoreCase(String nombre);

    @Query("SELECT u FROM Usuario u WHERE u.email = :email AND u.password = :password AND u.activo = true")
    Optional<Usuario> findByEmailAndPassword(@Param("email") String email, @Param("password") String password);

    // NUEVOS MÉTODOS: Por tipo de usuario
    List<Usuario> findByTipousuario(TipoUsuario tipousuario);

    List<Usuario> findByTipousuarioAndActivoTrue(TipoUsuario tipousuario);

    @Query("SELECT u FROM Usuario u WHERE u.tipousuario = :tipo AND u.activo = true")
    List<Usuario> findUsuariosActivosPorTipo(@Param("tipo") TipoUsuario tipo);

    // Contar usuarios por tipo
    Long countByTipousuario(TipoUsuario tipousuario);
}
