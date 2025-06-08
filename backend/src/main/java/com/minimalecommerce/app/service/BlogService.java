package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Blog;
import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.model.Categoria;
import com.minimalecommerce.app.repository.BlogRepository;
import com.minimalecommerce.app.repository.UsuarioRepository;
import com.minimalecommerce.app.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BlogService {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    // Obtener todos los blogs publicados
    public List<Blog> obtenerBlogsPublicados() {
        return blogRepository.findBlogsPublicadosOrdenados();
    }

    // Obtener blog por ID
    public Optional<Blog> obtenerBlogPorId(Long id) {
        return blogRepository.findById(id);
    }

    // Crear nuevo blog
    public Blog crearBlog(Blog blog) {
        if (blog.getAutor() == null || blog.getAutor().getId() == null) {
            throw new RuntimeException("Debe especificar un autor válido");
        }

        Optional<Usuario> autor = usuarioRepository.findById(blog.getAutor().getId());
        if (!autor.isPresent()) {
            throw new RuntimeException("Autor no encontrado");
        }

        blog.setAutor(autor.get());

        // Validar categoría si se especifica
        if (blog.getCategoria() != null && blog.getCategoria().getId() != null) {
            Optional<Categoria> categoria = categoriaRepository.findById(blog.getCategoria().getId());
            if (!categoria.isPresent()) {
                throw new RuntimeException("Categoría no encontrada");
            }
            blog.setCategoria(categoria.get());
        }

        return blogRepository.save(blog);
    }

    // Obtener blogs por autor
    public List<Blog> obtenerBlogsPorAutor(Long autorId) {
        return blogRepository.findByAutorId(autorId);
    }

    // Obtener blogs por categoría
    public List<Blog> obtenerBlogsPorCategoria(Long categoriaId) {
        return blogRepository.findByCategoriaId(categoriaId);
    }

    // Buscar blogs por título
    public List<Blog> buscarBlogs(String titulo) {
        return blogRepository.findByTituloContainingIgnoreCaseAndPublicadoTrue(titulo);
    }

    // Buscar blogs por contenido
    public List<Blog> buscarBlogsPorContenido(String palabra) {
        return blogRepository.buscarPorContenido(palabra);
    }

    // Publicar blog
    public Blog publicarBlog(Long blogId) {
        Optional<Blog> blog = blogRepository.findById(blogId);
        if (blog.isPresent()) {
            blog.get().setPublicado(true);
            return blogRepository.save(blog.get());
        }
        throw new RuntimeException("Blog no encontrado");
    }

    // Actualizar blog
    public Blog actualizarBlog(Long id, Blog blog) {
        Optional<Blog> blogExistente = blogRepository.findById(id);
        if (blogExistente.isPresent()) {
            blog.setId(id);
            return blogRepository.save(blog);
        }
        throw new RuntimeException("Blog no encontrado");
    }

    // Eliminar blog
    public void eliminarBlog(Long id) {
        blogRepository.deleteById(id);
    }
}
