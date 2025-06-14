// sistema-resenas/ResenasService.js
class ResenasService {
    constructor(apiBase = '/api/resenas') {
        this.apiBase = apiBase;
        this.initializeGSAP();
    }

    // ===== INICIALIZACIÓN GSAP =====
    initializeGSAP() {
        if (typeof gsap !== 'undefined') {
            console.log('✅ GSAP disponible para ResenasService');
            this.gsapAvailable = true;
        } else {
            console.log('⚠️ GSAP no disponible, usando redirecciones simples');
            this.gsapAvailable = false;
        }
    }

    // ===== MÉTODO AUXILIAR PARA MANEJO DE RESPUESTAS =====
    async handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        // Si la respuesta tiene estructura { success: true, data: [...] }
        if (data.success !== undefined) {
            if (!data.success) {
                throw new Error(data.error || 'Error en la respuesta del servidor');
            }
            return data.data !== undefined ? data.data : data;
        }

        // Si es respuesta directa
        return data;
    }

    // ===== MÉTODOS DE REDIRECCIÓN CON GSAP =====
    async redirectWithAnimation(url, buttonSelector = null, loadingText = '⏳ Cargando...') {
        try {
            let button = null;

            if (buttonSelector) {
                button = typeof buttonSelector === 'string' ?
                    document.querySelector(buttonSelector) : buttonSelector;
            }

            if (this.gsapAvailable && button) {
                // Animación de click
                await this.animateButtonClick(button, loadingText);

                // Animación de salida de página
                await this.animatePageExit();
            } else if (button) {
                // Fallback sin GSAP
                button.classList.add('btn-loading');
                button.innerHTML = loadingText;
                await this.delay(500);
            }

            // Redireccionar
            window.location.href = url;

        } catch (error) {
            console.error('Error en redirección animada:', error);
            // Fallback directo
            window.location.href = url;
        }
    }

    async animateButtonClick(button, loadingText) {
        if (!this.gsapAvailable) return;

        return new Promise((resolve) => {
            const originalText = button.innerHTML;

            gsap.timeline()
                .to(button, {
                    scale: 0.95,
                    duration: 0.1,
                    ease: "power2.out"
                })
                .to(button, {
                    scale: 1.02,
                    duration: 0.15,
                    ease: "back.out(1.7)"
                })
                .to(button, {
                    scale: 1,
                    duration: 0.1,
                    ease: "power2.out",
                    onComplete: () => {
                        button.innerHTML = loadingText;
                        button.classList.add('btn-loading');

                        // Efecto de pulso mientras carga
                        gsap.to(button, {
                            scale: 1.05,
                            duration: 0.8,
                            ease: "power1.inOut",
                            yoyo: true,
                            repeat: 2,
                            onComplete: resolve
                        });
                    }
                });
        });
    }

    async animatePageExit() {
        if (!this.gsapAvailable) return;

        return new Promise((resolve) => {
            // Crear overlay de transición
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                z-index: 9999;
                opacity: 0;
                pointer-events: none;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Inter', sans-serif;
                font-size: 1.2rem;
                color: #2c3e50;
            `;
            overlay.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
                    <div>Cargando...</div>
                </div>
            `;

            document.body.appendChild(overlay);

            gsap.timeline()
                .to(overlay, {
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out"
                })
                .to('body > *:not(:last-child)', {
                    opacity: 0.3,
                    scale: 0.95,
                    duration: 0.4,
                    ease: "power2.out"
                }, "-=0.2")
                .call(resolve);
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== MÉTODOS PARA COMPRADORES =====
    async verificarDisponibilidad(compradorId, productoId) {
        try {
            const response = await fetch(
                `${this.apiBase}/comprador/${compradorId}/producto/${productoId}/puede-resenar`
            );

            const data = await this.handleResponse(response);

            // El controller devuelve: { success: true, puedeResenar: boolean, ... }
            return {
                puedeResenar: data.puedeResenar || false,
                compradorId: data.compradorId,
                productoId: data.productoId,
                message: data.message
            };
        } catch (error) {
            console.error('Error verificando disponibilidad:', error);
            throw error;
        }
    }

    async crearResena(compradorId, productoId, resenaData, buttonSelector = null) {
        try {
            if (buttonSelector) {
                const button = typeof buttonSelector === 'string' ?
                    document.querySelector(buttonSelector) : buttonSelector;

                if (this.gsapAvailable && button) {
                    await this.animateButtonClick(button, '💾 Guardando reseña...');
                }
            }

            const response = await fetch(
                `${this.apiBase}/comprador/${compradorId}/producto/${productoId}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(resenaData)
                }
            );

            const data = await this.handleResponse(response);

            // Mostrar notificación de éxito
            if (this.gsapAvailable) {
                this.showSuccessNotification('✅ Reseña creada exitosamente');
            }

            // El controller devuelve: { success: true, data: Resena, message: string }
            return data; // Ya es la reseña creada
        } catch (error) {
            console.error('Error creando reseña:', error);

            // Mostrar notificación de error
            if (this.gsapAvailable) {
                this.showErrorNotification('❌ Error al crear la reseña');
            }

            throw error;
        }
    }

    async obtenerResenasEscritas(compradorId) {
        try {
            const response = await fetch(`${this.apiBase}/comprador/${compradorId}/escritas`);

            const data = await this.handleResponse(response);

            // El controller devuelve: { success: true, data: [Resena], total: number }
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error obteniendo reseñas escritas:', error);
            return [];
        }
    }

    async obtenerEstadisticasComprador(compradorId) {
        try {
            const response = await fetch(`${this.apiBase}/comprador/${compradorId}/estadisticas`);

            const data = await this.handleResponse(response);

            return {
                compradorId: data.compradorId,
                totalResenasEscritas: data.totalResenasEscritas || 0
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas del comprador:', error);
            return { compradorId, totalResenasEscritas: 0 };
        }
    }

    // ===== MÉTODOS PARA VENDEDORES =====
    async obtenerEstadisticasVendedor(vendedorId) {
        try {
            const response = await fetch(`${this.apiBase}/vendedor/${vendedorId}/estadisticas`);

            const data = await this.handleResponse(response);

            // El controller devuelve: { success: true, vendedorId, totalResenasRecibidas, resenasVerificadas, promedioCalificacion }
            return {
                vendedorId: data.vendedorId,
                promedioCalificacion: data.promedioCalificacion || 0,
                totalResenasRecibidas: data.totalResenasRecibidas || 0,
                resenasVerificadas: data.resenasVerificadas || 0
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                vendedorId,
                promedioCalificacion: 0,
                totalResenasRecibidas: 0,
                resenasVerificadas: 0
            };
        }
    }

    async obtenerResenasRecibidas(vendedorId) {
        try {
            const response = await fetch(`${this.apiBase}/vendedor/${vendedorId}/recibidas`);

            const data = await this.handleResponse(response);

            // El controller devuelve: { success: true, data: [Resena], total: number }
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error obteniendo reseñas recibidas:', error);
            return [];
        }
    }

    async obtenerPromedioVendedor(vendedorId) {
        try {
            const response = await fetch(`${this.apiBase}/vendedor/${vendedorId}/promedio`);

            const data = await this.handleResponse(response);

            return data.promedioCalificacion || 0;
        } catch (error) {
            console.error('Error obteniendo promedio del vendedor:', error);
            return 0;
        }
    }

    // ===== MÉTODOS PARA PRODUCTOS =====
    async obtenerResenasProducto(productoId, soloVerificadas = false) {
        try {
            const endpoint = soloVerificadas ?
                `${this.apiBase}/producto/${productoId}/verificadas` :
                `${this.apiBase}/producto/${productoId}`;

            const response = await fetch(endpoint);

            const data = await this.handleResponse(response);

            // El controller devuelve: { success: true, data: [Resena], total: number }
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error obteniendo reseñas del producto:', error);
            return [];
        }
    }

    async obtenerPromedioProducto(productoId) {
        try {
            const response = await fetch(`${this.apiBase}/producto/${productoId}/promedio`);

            const data = await this.handleResponse(response);

            // El controller devuelve: { success: true, productoId, promedioCalificacion, totalResenas }
            return {
                promedio: data.promedioCalificacion || 0,
                total: data.totalResenas || 0,
                productoId: data.productoId
            };
        } catch (error) {
            console.error('Error obteniendo promedio:', error);
            return { promedio: 0, total: 0, productoId };
        }
    }

    async contarResenasProducto(productoId) {
        try {
            const data = await this.obtenerPromedioProducto(productoId);
            return data.total;
        } catch (error) {
            console.error('Error contando reseñas del producto:', error);
            return 0;
        }
    }

    // ===== MÉTODOS GENERALES =====
    async obtenerTodasResenas() {
        try {
            const response = await fetch(`${this.apiBase}`);

            const data = await this.handleResponse(response);

            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error obteniendo todas las reseñas:', error);
            return [];
        }
    }

    async obtenerResenaPorId(id) {
        try {
            const response = await fetch(`${this.apiBase}/${id}`);

            const data = await this.handleResponse(response);

            return data;
        } catch (error) {
            console.error('Error obteniendo reseña por ID:', error);
            return null;
        }
    }

    async actualizarResena(id, resenaData, buttonSelector = null) {
        try {
            if (buttonSelector) {
                const button = typeof buttonSelector === 'string' ?
                    document.querySelector(buttonSelector) : buttonSelector;

                if (this.gsapAvailable && button) {
                    await this.animateButtonClick(button, '📝 Actualizando...');
                }
            }

            const response = await fetch(`${this.apiBase}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resenaData)
            });

            const data = await this.handleResponse(response);

            // Mostrar notificación de éxito
            if (this.gsapAvailable) {
                this.showSuccessNotification('✅ Reseña actualizada exitosamente');
            }

            return data;
        } catch (error) {
            console.error('Error actualizando reseña:', error);

            if (this.gsapAvailable) {
                this.showErrorNotification('❌ Error al actualizar la reseña');
            }

            throw error;
        }
    }

    async eliminarResena(id, buttonSelector = null) {
        try {
            if (buttonSelector) {
                const button = typeof buttonSelector === 'string' ?
                    document.querySelector(buttonSelector) : buttonSelector;

                if (this.gsapAvailable && button) {
                    await this.animateButtonClick(button, '🗑️ Eliminando...');
                }
            }

            const response = await fetch(`${this.apiBase}/${id}`, {
                method: 'DELETE'
            });

            const data = await this.handleResponse(response);

            // Mostrar notificación de éxito
            if (this.gsapAvailable) {
                this.showSuccessNotification('✅ Reseña eliminada exitosamente');
            }

            return data.message || 'Reseña eliminada correctamente';
        } catch (error) {
            console.error('Error eliminando reseña:', error);

            if (this.gsapAvailable) {
                this.showErrorNotification('❌ Error al eliminar la reseña');
            }

            throw error;
        }
    }

    async obtenerResenasConCalificacion(calificacion) {
        try {
            const response = await fetch(`${this.apiBase}/calificacion/${calificacion}`);

            const data = await this.handleResponse(response);

            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error obteniendo reseñas por calificación:', error);
            return [];
        }
    }

    async obtenerEstadisticasGenerales() {
        try {
            const response = await fetch(`${this.apiBase}/estadisticas/generales`);

            const data = await this.handleResponse(response);

            return {
                totalResenas: data.totalResenas || 0,
                promedioGeneral: data.promedioGeneral || 0,
                distribucionCalificaciones: data.distribucionCalificaciones || {}
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas generales:', error);
            return {
                totalResenas: 0,
                promedioGeneral: 0,
                distribucionCalificaciones: {}
            };
        }
    }

    // ===== MÉTODOS DE NOTIFICACIONES GSAP =====
    showSuccessNotification(message) {
        if (!this.gsapAvailable) {
            console.log(message);
            return;
        }

        this.showNotification(message, 'success');
    }

    showErrorNotification(message) {
        if (!this.gsapAvailable) {
            console.error(message);
            return;
        }

        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            color: white;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Colores según el tipo
        const colors = {
            success: 'linear-gradient(135deg, #27ae60, #2ecc71)',
            error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            info: 'linear-gradient(135deg, #3498db, #2980b9)'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animación de entrada y salida
        gsap.timeline()
            .to(notification, {
                x: 0,
                duration: 0.5,
                ease: "back.out(1.7)"
            })
            .to(notification, {
                x: '100%',
                duration: 0.3,
                ease: "power2.in",
                delay: 3,
                onComplete: () => notification.remove()
            });
    }

    // ===== MÉTODOS AUXILIARES =====
    generarEstrellas(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? '⭐' : '☆';
        }
        return stars;
    }

    formatearFecha(fecha) {
        if (!fecha) return 'Fecha no disponible';

        try {
            return new Date(fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return 'Fecha inválida';
        }
    }

    // ===== MÉTODOS DE VALIDACIÓN =====
    validarCalificacion(calificacion) {
        return calificacion && calificacion >= 1 && calificacion <= 5;
    }

    validarComentario(comentario, maxLength = 500) {
        return !comentario || comentario.length <= maxLength;
    }

    // ===== MÉTODOS PARA TESTING =====
    async testConexion() {
        try {
            const response = await fetch(`${this.apiBase}/estadisticas/generales`);
            const data = await this.handleResponse(response);
            console.log('✅ Conexión API exitosa:', data);

            if (this.gsapAvailable) {
                this.showSuccessNotification('✅ Conexión API exitosa');
            }

            return true;
        } catch (error) {
            console.error('❌ Error de conexión API:', error);

            if (this.gsapAvailable) {
                this.showErrorNotification('❌ Error de conexión API');
            }

            return false;
        }
    }

    // ===== MÉTODOS DE REDIRECCIÓN ESPECÍFICOS =====
    async irALogin(buttonSelector = null) {
        await this.redirectWithAnimation(
            'http://localhost:3000/login',
            buttonSelector,
            '🔐 Iniciando sesión...'
        );
    }

    async irARegistro(buttonSelector = null) {
        await this.redirectWithAnimation(
            'http://localhost:3000/registro',
            buttonSelector,
            '📝 Registrando...'
        );
    }

    async irAHistoria(buttonSelector = null) {
        await this.redirectWithAnimation(
            'http://localhost:3000/historia',
            buttonSelector,
            'ℹ️ Cargando historia...'
        );
    }

    async irADashboard(buttonSelector = null) {
        await this.redirectWithAnimation(
            'http://localhost:3000/dashboard',
            buttonSelector,
            '📊 Cargando dashboard...'
        );
    }

    async irAProductos(buttonSelector = null) {
        await this.redirectWithAnimation(
            'http://localhost:3000/productos',
            buttonSelector,
            '🛍️ Cargando productos...'
        );
    }
}

// Exportar para uso en otras clases
window.ResenasService = ResenasService;

// Crear instancia global
window.resenasService = new ResenasService();

// Log de inicialización
console.log('📡 ResenasService con GSAP cargado - Compatible con controller Spring Boot');

// Ejemplo de uso:
/*
// Para redireccionar con animación:
resenasService.irALogin('.login-btn');
resenasService.irARegistro('.register-btn');
resenasService.irAHistoria('.about-btn');

// Para crear reseña con animación:
resenasService.crearResena(1, 1, {
    calificacion: 5,
    comentario: "Excelente producto"
}, '.submit-btn');

// Para actualizar con animación:
resenasService.actualizarResena(1, {
    calificacion: 4,
    comentario: "Muy bueno"
}, '.update-btn');
*/
