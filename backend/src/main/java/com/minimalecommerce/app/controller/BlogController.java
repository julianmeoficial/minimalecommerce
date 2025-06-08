package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Blog;
import com.minimalecommerce.app.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    @Autowired
    private BlogService blogService;

    @GetMapping
    public ResponseEntity<List<Blog>> obtenerBlogsPublicados() {
        List<Blog> blogs = blogService.obtenerBlogsPublicados();
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Blog> obtenerBlogPorId(@PathVariable Long id) {
        Optional<Blog> blog = blogService.obtenerBlogPorId(id);
        return blog.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Blog> crearBlog(@RequestBody Blog blog) {
        Blog nuevoBlog = blogService.crearBlog(blog);
        return ResponseEntity.ok(nuevoBlog);
    }

    @GetMapping("/autor/{autorId}")
    public ResponseEntity<List<Blog>> obtenerBlogsPorAutor(@PathVariable Long autorId) {
        List<Blog> blogs = blogService.obtenerBlogsPorAutor(autorId);
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<Blog>> obtenerBlogsPorCategoria(@PathVariable Long categoriaId) {
        List<Blog> blogs = blogService.obtenerBlogsPorCategoria(categoriaId);
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/buscar/{titulo}")
    public ResponseEntity<List<Blog>> buscarBlogs(@PathVariable String titulo) {
        List<Blog> blogs = blogService.buscarBlogs(titulo);
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/contenido/{palabra}")
    public ResponseEntity<List<Blog>> buscarBlogsPorContenido(@PathVariable String palabra) {
        List<Blog> blogs = blogService.buscarBlogsPorContenido(palabra);
        return ResponseEntity.ok(blogs);
    }

    @PutMapping("/{id}/publicar")
    public ResponseEntity<Blog> publicarBlog(@PathVariable Long id) {
        Blog blogPublicado = blogService.publicarBlog(id);
        return ResponseEntity.ok(blogPublicado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Blog> actualizarBlog(@PathVariable Long id, @RequestBody Blog blog) {
        Blog blogActualizado = blogService.actualizarBlog(id, blog);
        return ResponseEntity.ok(blogActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarBlog(@PathVariable Long id) {
        blogService.eliminarBlog(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Blog eliminado correctamente");
        return ResponseEntity.ok(response);
    }
}
