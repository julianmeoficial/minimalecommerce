package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    // Buscar categoría por nombre
    Optional<Categoria> findByNombre(String nombre);

    // Verificar si existe una categoría por nombre
    boolean existsByNombre(String nombre);

    // Buscar categorías que contengan texto en el nombre
    @Query("SELECT c FROM Categoria c WHERE c.nombre LIKE %?1%")
    java.util.List<Categoria> findByNombreContaining(String texto);
}
