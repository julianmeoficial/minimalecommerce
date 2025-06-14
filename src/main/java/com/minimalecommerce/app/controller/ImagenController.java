package com.minimalecommerce.app.controller;

import com.minimalecommerce.app.model.Usuario;
import com.minimalecommerce.app.service.UsuarioService;
import com.minimalecommerce.app.service.ImagenService; // CAMBIO: ImageService → ImagenService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.minimalecommerce.app.service.ProductoService;
import com.minimalecommerce.app.service.CategoriaService;
import com.minimalecommerce.app.model.Producto;
import com.minimalecommerce.app.model.Categoria;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/imagenes")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ImagenController {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private ImagenService imagenService; // CAMBIO: imageService → imagenService

    @PostMapping("/subir")
    public ResponseEntity<List<String>> subirImagenes(@RequestParam("archivos") MultipartFile[] archivos) {
        System.out.println("=== SUBIENDO IMÁGENES ===");
        System.out.println("Número de archivos recibidos: " + archivos.length);

        try {
            List<String> nombresArchivos = new ArrayList<>();

            for (int i = 0; i < archivos.length; i++) {
                MultipartFile archivo = archivos[i];
                System.out.println("Procesando archivo " + (i+1) + ": " + archivo.getOriginalFilename() +
                        ", Tamaño: " + archivo.getSize() + " bytes");

                String nombreArchivo = imagenService.guardarImagen(archivo);
                nombresArchivos.add(nombreArchivo);
                System.out.println("✅ Archivo guardado como: " + nombreArchivo);
            }

            System.out.println("✅ TODAS LAS IMÁGENES SUBIDAS CORRECTAMENTE");
            System.out.println("Nombres generados: " + nombresArchivos);

            return ResponseEntity.ok(nombresArchivos);

        } catch (Exception e) {
            System.err.println("❌ ERROR AL SUBIR IMÁGENES: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{nombreImagen}")
    public ResponseEntity<Map<String, Object>> eliminarImagen(@PathVariable String nombreImagen) {
        Map<String, Object> response = new HashMap<>();

        try {
            System.out.println("Intentando eliminar imagen: " + nombreImagen);

            boolean eliminada = imagenService.eliminarImagen(nombreImagen);

            if (eliminada) {
                response.put("success", true);
                response.put("mensaje", "Imagen eliminada correctamente");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("mensaje", "Imagen no encontrada");
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            System.err.println("❌ Error eliminando imagen: " + e.getMessage());
            response.put("error", "Error al eliminar imagen: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // ENDPOINT DE PRUEBA PARA VERIFICAR IMÁGENES
    @GetMapping("/test-imagenes")
    public ResponseEntity<Map<String, Object>> testImagenes() {
        Map<String, Object> response = new HashMap<>();

        try {
            String projectDir = System.getProperty("user.dir");
            String uploadPath = projectDir + "/backend/src/main/resources/static/imagenes-productos/";

            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadPath = projectDir + "/src/main/resources/static/imagenes-productos/";
                uploadDir = new File(uploadPath);
            }

            response.put("directorioExiste", uploadDir.exists());
            response.put("rutaAbsoluta", uploadDir.getAbsolutePath());
            response.put("esDirectorio", uploadDir.isDirectory());
            response.put("puedeEscribir", uploadDir.canWrite());

            if (uploadDir.exists()) {
                File[] archivos = uploadDir.listFiles();
                List<String> nombresArchivos = new ArrayList<>();
                if (archivos != null) {
                    for (File archivo : archivos) {
                        nombresArchivos.add(archivo.getName());
                    }
                }
                response.put("archivos", nombresArchivos);
                response.put("totalArchivos", archivos != null ? archivos.length : 0);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ENDPOINT PARA VERIFICAR SI UNA IMAGEN EXISTE
    @GetMapping("/verificar/{nombreImagen}")
    public ResponseEntity<Map<String, Object>> verificarImagen(@PathVariable String nombreImagen) {
        Map<String, Object> response = new HashMap<>();

        boolean existe = imagenService.existeImagen(nombreImagen);
        response.put("existe", existe);
        response.put("nombreImagen", nombreImagen);
        response.put("url", existe ? "/imagenes-productos/" + nombreImagen : null);

        return ResponseEntity.ok(response);
    }

    // Endpoint para reemplazar todas las imágenes de un producto
    @PostMapping("/editar/{productoId}")
    public ResponseEntity<Map<String, Object>> editarImagenesProducto(
            @PathVariable Long productoId,
            @RequestParam("archivos") MultipartFile[] nuevasImagenes) {

        Map<String, Object> response = new HashMap<>();

        try {
            System.out.println("=== EDITANDO IMÁGENES PRODUCTO ID: " + productoId + " ===");
            System.out.println("Nuevas imágenes recibidas: " + nuevasImagenes.length);

            // CORREGIR: Usar método correcto del ProductoService
            Producto producto = productoService.obtenerProductoPorId(productoId);
            if (producto == null) {
                response.put("error", "Producto no encontrado");
                return ResponseEntity.notFound().build();
            }

            String imagenesAnteriores = producto.getImagen();

            // Reemplazar imágenes
            List<String> nuevosNombres = imagenService.reemplazarImagenesProducto(nuevasImagenes, imagenesAnteriores);

            // Actualizar producto en BD
            producto.setImagen(String.join(",", nuevosNombres));
            productoService.actualizarProducto(productoId, producto);

            response.put("success", true);
            response.put("mensaje", "Imágenes del producto actualizadas correctamente");
            response.put("nuevasImagenes", nuevosNombres);
            response.put("totalImagenes", nuevosNombres.size());

            System.out.println("✅ EDICIÓN COMPLETADA");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ ERROR AL EDITAR IMÁGENES: " + e.getMessage());
            e.printStackTrace();
            response.put("error", "Error al editar imágenes: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Endpoint para agregar imágenes adicionales (sin eliminar existentes)
    @PostMapping("/agregar/{productoId}")
    public ResponseEntity<Map<String, Object>> agregarImagenesProducto(
            @PathVariable Long productoId,
            @RequestParam("archivos") MultipartFile[] nuevasImagenes) {

        Map<String, Object> response = new HashMap<>();

        try {
            System.out.println("=== AGREGANDO IMÁGENES PRODUCTO ID: " + productoId + " ===");

            // CORREGIR: Usar método correcto del ProductoService
            Producto producto = productoService.obtenerProductoPorId(productoId);
            if (producto == null) {
                response.put("error", "Producto no encontrado");
                return ResponseEntity.notFound().build();
            }

            String imagenesExistentes = producto.getImagen();

            // Agregar nuevas imágenes
            List<String> todasLasImagenes = imagenService.agregarImagenesProducto(nuevasImagenes, imagenesExistentes);

            // Limpiar campo imagen en BD
            producto.setImagen(null);
            productoService.actualizarProducto(productoId, producto);

            response.put("success", true);
            response.put("mensaje", "Imágenes agregadas correctamente");
            response.put("totalImagenes", todasLasImagenes.size());
            response.put("imagenes", todasLasImagenes);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ ERROR AL AGREGAR IMÁGENES: " + e.getMessage());
            response.put("error", "Error al agregar imágenes: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Endpoint para eliminar todas las imágenes de un producto
    @DeleteMapping("/producto/{productoId}")
    public ResponseEntity<Map<String, Object>> eliminarTodasImagenesProducto(@PathVariable Long productoId) {
        Map<String, Object> response = new HashMap<>();

        try {
            System.out.println("=== ELIMINANDO TODAS LAS IMÁGENES PRODUCTO ID: " + productoId + " ===");

            // CORREGIR: Usar método correcto del ProductoService
            Producto producto = productoService.obtenerProductoPorId(productoId);
            if (producto == null) {
                response.put("error", "Producto no encontrado");
                return ResponseEntity.notFound().build();
            }

            String imagenesActuales = producto.getImagen();

            // Eliminar imágenes del filesystem
            boolean eliminadas = imagenService.eliminarTodasImagenesProducto(imagenesActuales);

            // Limpiar campo imagen en BD
            producto.setImagen(null);
            productoService.actualizarProducto(productoId, producto);

            response.put("success", true);
            response.put("mensaje", "Todas las imágenes del producto eliminadas");
            response.put("imagenesEliminadas", eliminadas);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ ERROR AL ELIMINAR IMÁGENES DEL PRODUCTO: " + e.getMessage());
            response.put("error", "Error al eliminar imágenes: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Endpoint para obtener información de imágenes de un producto
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<Map<String, Object>> obtenerImagenesProducto(@PathVariable Long productoId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // CORREGIR: Usar método correcto del ProductoService
            Producto producto = productoService.obtenerProductoPorId(productoId);
            if (producto == null) {
                response.put("error", "Producto no encontrado");
                return ResponseEntity.notFound().build();
            }

            String imagenesString = producto.getImagen();
            List<String> imagenes = imagenService.obtenerImagenesProducto(imagenesString);

            // Verificar cuáles existen físicamente
            List<Map<String, Object>> imagenesInfo = new ArrayList<>();
            for (String imagen : imagenes) {
                Map<String, Object> info = new HashMap<>();
                info.put("nombre", imagen);
                info.put("existe", imagenService.existeImagen(imagen));
                info.put("url", "/imagenes-productos/" + imagen);
                imagenesInfo.add(info);
            }

            response.put("productoId", productoId);
            response.put("totalImagenes", imagenes.size());
            response.put("imagenes", imagenesInfo);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", "Error al obtener imágenes: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Agregar este método en ImagenController.java
    @GetMapping("/imagenes-productos/{filename:.+}")
    public ResponseEntity<Resource> servirImagen(@PathVariable String filename) {
        try {
            String uploadPath = getUploadPath(); // Método que ya tienes
            Path filePath = Paths.get(uploadPath).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG) // O detectar tipo automáticamente
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Método auxiliar para obtener ruta de upload
    private String getUploadPath() {
        String projectDir = System.getProperty("user.dir");
        String uploadPath = projectDir + "/backend/src/main/resources/static/imagenes-productos/";

        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadPath = projectDir + "/src/main/resources/static/imagenes-productos/";
        }

        return uploadPath;
    }
}
