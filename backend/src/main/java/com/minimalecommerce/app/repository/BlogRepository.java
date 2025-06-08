package com.minimalecommerce.app.repository;

import com.minimalecommerce.app.model.Blog;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {

    List<Blog> findByPublicadoTrue();
    List<Blog> findByAutor(Usuario autor);
    List<Blog> findByAutorId(Long autorId);
    List<Blog> findByCategoria(Categoria categoria);
    List<Blog> findByCategoriaId(Long categoriaId);

    @Query("SELECT b FROM Blog b WHERE b.publicado = true ORDER BY b.fechapublicacion DESC")
    List<Blog> findBlogsPublicadosOrdenados();

    List<Blog> findByTituloContainingIgnoreCaseAndPublicadoTrue(String titulo);

    @Query("SELECT b FROM Blog b WHERE b.contenido LIKE %:palabra% AND b.publicado = true")
    List<Blog> buscarPorContenido(@Param("palabra") String palabra);
}
