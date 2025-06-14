package com.minimalecommerce.app.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ImagenService {

    private String getUploadPath() {
        String projectDir = System.getProperty("user.dir");
        String uploadPath = projectDir + "/backend/src/main/resources/static/imagenes-productos/";

        // Si no existe ese directorio, usar una ruta alternativa
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadPath = projectDir + "/src/main/resources/static/imagenes-productos/";
            uploadDir = new File(uploadPath);
        }

        // Logs para debug
        System.out.println("=== DEBUG RUTAS ImagenService ===");
        System.out.println("Directorio proyecto: " + projectDir);
        System.out.println("Ruta upload final: " + uploadPath);
        System.out.println("Directorio existe: " + uploadDir.exists());

        // Crear directorio si no existe
        if (!uploadDir.exists()) {
            boolean created = uploadDir.mkdirs();
            System.out.println("Directorio creado: " + created);
        }

        return uploadPath;
    }

    public String guardarImagen(MultipartFile archivo) throws IOException {
        // Validar que el archivo no esté vacío
        if (archivo.isEmpty()) {
            throw new IOException("El archivo está vacío");
        }

        // Validar tipo de archivo
        String contentType = archivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IOException("Solo se permiten archivos de imagen");
        }

        // Validar tamaño (máximo 5MB)
        if (archivo.getSize() > 5 * 1024 * 1024) {
            throw new IOException("El archivo es demasiado grande. Máximo 5MB permitidos");
        }

        // Obtener ruta de upload
        String uploadPath = getUploadPath();

        // Generar nombre único
        String originalFileName = archivo.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String nuevoNombre = UUID.randomUUID().toString() + fileExtension;

        // Guardar archivo
        Path rutaArchivo = Paths.get(uploadPath + nuevoNombre);
        System.out.println("Guardando imagen en: " + rutaArchivo.toAbsolutePath());

        Files.copy(archivo.getInputStream(), rutaArchivo, StandardCopyOption.REPLACE_EXISTING);

        System.out.println("✅ Imagen guardada correctamente: " + nuevoNombre);
        return nuevoNombre;
    }

    public boolean eliminarImagen(String nombreArchivo) {
        try {
            String uploadPath = getUploadPath();
            Path rutaArchivo = Paths.get(uploadPath + nombreArchivo);

            if (Files.exists(rutaArchivo)) {
                Files.delete(rutaArchivo);
                System.out.println("✅ Imagen eliminada: " + nombreArchivo);
                return true;
            } else {
                System.out.println("⚠️ Archivo no encontrado: " + nombreArchivo);
                return false;
            }
        } catch (IOException e) {
            System.err.println("❌ Error eliminando imagen: " + e.getMessage());
            return false;
        }
    }

    public boolean existeImagen(String nombreArchivo) {
        String uploadPath = getUploadPath();
        Path rutaArchivo = Paths.get(uploadPath + nombreArchivo);
        return Files.exists(rutaArchivo);
    }

    // Método para obtener las imágenes actuales de un producto
    public List<String> obtenerImagenesProducto(String imagenesString) {
        List<String> imagenes = new ArrayList<>();

        if (imagenesString != null && !imagenesString.trim().isEmpty()) {
            // Dividir por comas y limpiar espacios
            String[] imagenesArray = imagenesString.split(",");
            for (String imagen : imagenesArray) {
                String imagenLimpia = imagen.trim();
                if (!imagenLimpia.isEmpty()) {
                    imagenes.add(imagenLimpia);
                }
            }
        }

        return imagenes;
    }

    // Método para eliminar múltiples imágenes
    public boolean eliminarImagenes(List<String> nombresArchivos) {
        boolean todoEliminado = true;

        for (String nombreArchivo : nombresArchivos) {
            if (!eliminarImagen(nombreArchivo)) {
                System.err.println("⚠️ No se pudo eliminar: " + nombreArchivo);
                todoEliminado = false;
            }
        }

        return todoEliminado;
    }

    // Método para reemplazar imágenes de un producto
    public List<String> reemplazarImagenesProducto(MultipartFile[] nuevasImagenes, String imagenesAnteriores) throws IOException {
        List<String> nuevosNombres = new ArrayList<>();

        try {
            // 1. Subir nuevas imágenes primero
            for (MultipartFile archivo : nuevasImagenes) {
                String nuevoNombre = guardarImagen(archivo);
                nuevosNombres.add(nuevoNombre);
            }

            // 2. Eliminar imágenes anteriores después de subir las nuevas (por seguridad)
            if (imagenesAnteriores != null && !imagenesAnteriores.trim().isEmpty()) {
                List<String> imagenesAEliminar = obtenerImagenesProducto(imagenesAnteriores);
                eliminarImagenes(imagenesAEliminar);
                System.out.println("✅ Imágenes anteriores eliminadas: " + imagenesAEliminar);
            }

            System.out.println("✅ Imágenes reemplazadas correctamente: " + nuevosNombres);
            return nuevosNombres;

        } catch (Exception e) {
            // Si algo falla, limpiar las nuevas imágenes que se pudieron subir
            eliminarImagenes(nuevosNombres);
            throw new IOException("Error al reemplazar imágenes: " + e.getMessage());
        }
    }

    // Método para agregar imágenes adicionales (sin eliminar las existentes)
    public List<String> agregarImagenesProducto(MultipartFile[] nuevasImagenes, String imagenesExistentes) throws IOException {
        List<String> nuevosNombres = new ArrayList<>();

        // Subir nuevas imágenes
        for (MultipartFile archivo : nuevasImagenes) {
            String nuevoNombre = guardarImagen(archivo);
            nuevosNombres.add(nuevoNombre);
        }

        // Combinar con existentes
        List<String> imagenesFinales = obtenerImagenesProducto(imagenesExistentes);
        imagenesFinales.addAll(nuevosNombres);

        System.out.println("✅ Imágenes agregadas: " + nuevosNombres);
        System.out.println("✅ Total imágenes del producto: " + imagenesFinales);

        return imagenesFinales;
    }

    // Método para eliminar todas las imágenes de un producto
    public boolean eliminarTodasImagenesProducto(String imagenesString) {
        if (imagenesString == null || imagenesString.trim().isEmpty()) {
            System.out.println("ℹ️ No hay imágenes que eliminar");
            return true;
        }

        List<String> imagenes = obtenerImagenesProducto(imagenesString);
        boolean resultado = eliminarImagenes(imagenes);

        System.out.println("✅ Eliminación de imágenes del producto: " + resultado);
        return resultado;
    }
}
