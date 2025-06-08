package com.minimalecommerce.app.service;

import com.minimalecommerce.app.model.Categoria;
import com.minimalecommerce.app.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    // Obtener todas las categorías
    public List<Categoria> obtenerTodasCategorias() {
        return categoriaRepository.findAll();
    }

    // Obtener categoría por ID
    public Optional<Categoria> obtenerCategoriaPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    // Obtener categoría por nombre
    public Optional<Categoria> obtenerCategoriaPorNombre(String nombre) {
        return categoriaRepository.findByNombre(nombre);
    }

    // Crear nueva categoría
    public Categoria crearCategoria(Categoria categoria) {
        if (categoriaRepository.existsByNombre(categoria.getNombre())) {
            throw new RuntimeException("Ya existe una categoría con ese nombre");
        }
        return categoriaRepository.save(categoria);
    }

    // Actualizar categoría
    public Categoria actualizarCategoria(Long id, Categoria categoria) {
        Optional<Categoria> categoriaExistente = categoriaRepository.findById(id);
        if (categoriaExistente.isPresent()) {
            categoria.setId(id);
            return categoriaRepository.save(categoria);
        }
        throw new RuntimeException("Categoría no encontrada");
    }

    // Eliminar categoría
    public void eliminarCategoria(Long id) {
        categoriaRepository.deleteById(id);
    }

    // Buscar categorías por texto
    public List<Categoria> buscarCategorias(String texto) {
        return categoriaRepository.findByNombreContaining(texto);
    }
}
