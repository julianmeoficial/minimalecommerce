package com.minimalecommerce.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*", "https://localhost:*", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    // AGREGAR ESTA CONFIGURACIÓN PARA SERVIR IMÁGENES
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir archivos estáticos desde resources/static
        registry.addResourceHandler("/imagenes-productos/**")
                .addResourceLocations("classpath:/static/imagenes-productos/")
                .setCacheControl(CacheControl.maxAge(2, TimeUnit.HOURS).cachePublic());

        // Log para debug
        System.out.println("=== CONFIGURACIÓN DE RECURSOS ESTÁTICOS ===");
        System.out.println("Handler configurado: /imagenes-productos/**");
        System.out.println("Ubicación: classpath:/static/imagenes-productos/");
        System.out.println("============================================");
    }
}
