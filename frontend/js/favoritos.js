// favoritos.js - Sistema de Favoritos integrado con API
class FavoritosApp {
    constructor() {
        this.favoritos = [];
        this.productosFiltrados = [];
        this.vistaActual = 'grid';
        this.filtros = {
            categoria: '',
            precioMin: null,
            precioMax: null,
            ordenPor: 'reciente'
        };

        this.usuario = null;
        this.apiBaseURL = 'http://localhost:8080/api';
        this.inicializado = false;

        this.init();
    }

    async init() {
        if (this.inicializado) return;

        try {
            console.log('🚀 Inicializando FavoritosApp...');

            this.verificarAutenticacion();
            this.configurarEventListeners();
            await this.cargarFavoritosDesdeAPI();
            this.renderizarFavoritos();
            this.actualizarEstadisticas();
            // ✅ SIN ANIMACIONES

            this.inicializado = true;
            console.log('✅ FavoritosApp inicializado correctamente');

        } catch (error) {
            console.error('❌ Error inicializando favoritos:', error);
            this.mostrarError('Error al cargar favoritos');
        }
    }

    verificarAutenticacion() {
        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');

        if (!userSession) {
            window.location.href = '/login';
            return;
        }

        try {
            this.usuario = JSON.parse(userSession);
            console.log('Usuario autenticado en favoritos:', this.usuario.user?.id);
        } catch (error) {
            console.error('Error parsing user session:', error);
            window.location.href = '/login';
        }
    }

    // ==================== CARGA DE DATOS DESDE API ====================

    async cargarFavoritosDesdeAPI() {
        try {
            console.log('🔍 Cargando favoritos desde API...');

            const response = await fetch(`${this.apiBaseURL}/favoritos/usuario/${this.usuario.user.id}`);

            if (response.ok) {
                const favoritosAPI = await response.json();
                console.log('✅ Favoritos cargados desde API:', favoritosAPI.length);

                // Transformar datos de API al formato esperado
                this.favoritos = favoritosAPI.map(favorito => ({
                    id: favorito.producto.id,
                    nombre: favorito.producto.nombre,
                    descripcion: favorito.producto.descripcion,
                    precio: favorito.producto.precio,
                    imagen: favorito.producto.imagen,
                    categoria: favorito.producto.categoria?.nombre || 'Sin categoría',
                    stock: favorito.producto.stock,
                    fechaAgregado: favorito.fechaagregado,
                    notificarStock: favorito.notificarstock,
                    favoritoId: favorito.id // ID del registro de favorito
                }));

                this.productosFiltrados = [...this.favoritos];
                console.log('📦 Favoritos procesados:', this.favoritos.length);

            } else {
                console.log('⚠️ No se pudieron cargar favoritos o lista vacía');
                this.favoritos = [];
                this.productosFiltrados = [];
            }
        } catch (error) {
            console.error('❌ Error cargando favoritos desde API:', error);
            this.favoritos = [];
            this.productosFiltrados = [];
        }
    }

    configurarEventListeners() {
        // Botón volver
        const btnVolver = document.getElementById('btnVolver');
        if (btnVolver) {
            btnVolver.addEventListener('click', () => this.volver());
        }

        // Filtros
        const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
        const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');

        if (btnAplicarFiltros) {
            btnAplicarFiltros.addEventListener('click', () => this.aplicarFiltros());
        }

        if (btnLimpiarFiltros) {
            btnLimpiarFiltros.addEventListener('click', () => this.limpiarFiltros());
        }

        // Vista toggles
        const vistaBtns = document.querySelectorAll('.vista-btn');
        vistaBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const vista = btn.dataset.vista;
                this.cambiarVista(vista);
            });
        });

        // Acciones rápidas
        const btnAgregarTodos = document.getElementById('btnAgregarTodosCarrito');
        const btnCompartir = document.getElementById('btnCompartirFavoritos');
        const btnCrearLista = document.getElementById('btnCrearLista');
        const btnLimpiarTodos = document.getElementById('btnLimpiarFavoritos');

        if (btnAgregarTodos) btnAgregarTodos.addEventListener('click', () => this.agregarTodosAlCarrito());
        if (btnCompartir) btnCompartir.addEventListener('click', () => this.compartirFavoritos());
        if (btnCrearLista) btnCrearLista.addEventListener('click', () => this.crearListaPersonalizada());
        if (btnLimpiarTodos) btnLimpiarTodos.addEventListener('click', () => this.mostrarModalConfirmacion(
            'Limpiar Favoritos',
            '¿Estás seguro de eliminar todos tus favoritos?',
            () => this.limpiarTodosFavoritos()
        ));

        // Modal
        const modalClose = document.getElementById('modalClose');
        const btnCancelar = document.getElementById('btnCancelar');
        if (modalClose) modalClose.addEventListener('click', () => this.cerrarModal());
        if (btnCancelar) btnCancelar.addEventListener('click', () => this.cerrarModal());

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.cerrarModal();
        });

        // Filtros en tiempo real
        const filtroCategoria = document.getElementById('filtroCategoria');
        const precioMin = document.getElementById('precioMin');
        const precioMax = document.getElementById('precioMax');
        const ordenarPor = document.getElementById('ordenarPor');

        if (filtroCategoria) filtroCategoria.addEventListener('change', () => this.aplicarFiltros());
        if (precioMin) precioMin.addEventListener('input', () => this.debounce(() => this.aplicarFiltros(), 500)());
        if (precioMax) precioMax.addEventListener('input', () => this.debounce(() => this.aplicarFiltros(), 500)());
        if (ordenarPor) ordenarPor.addEventListener('change', () => this.aplicarFiltros());
    }

    // ==================== GESTIÓN DE FAVORITOS CON API ====================

    async eliminarFavorito(productoId) {
        try {
            console.log('🗑️ Eliminando favorito:', productoId);

            const response = await fetch(`${this.apiBaseURL}/favoritos/usuario/${this.usuario.user.id}/producto/${productoId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Actualizar lista local
                const index = this.favoritos.findIndex(fav => fav.id === productoId);
                if (index !== -1) {
                    const producto = this.favoritos[index];
                    this.favoritos.splice(index, 1);
                    this.aplicarFiltros(); // Re-aplicar filtros
                    this.actualizarEstadisticas();
                    this.mostrarNotificacion(`${producto.nombre} eliminado de favoritos`, 'info');

                    console.log('✅ Favorito eliminado exitosamente');
                }
            } else {
                throw new Error('Error al eliminar favorito');
            }
        } catch (error) {
            console.error('❌ Error eliminando favorito:', error);
            this.mostrarNotificacion('Error al eliminar favorito', 'error');
        }
    }

    async limpiarTodosFavoritos() {
        try {
            console.log('🧹 Limpiando todos los favoritos...');

            // Eliminar uno por uno (tu API no tiene endpoint para limpiar todos)
            const promesas = this.favoritos.map(favorito =>
                fetch(`${this.apiBaseURL}/favoritos/usuario/${this.usuario.user.id}/producto/${favorito.id}`, {
                    method: 'DELETE'
                })
            );

            await Promise.all(promesas);

            this.favoritos = [];
            this.productosFiltrados = [];
            this.renderizarFavoritos();
            this.actualizarEstadisticas();
            this.mostrarNotificacion('Todos los favoritos eliminados', 'info');
            this.cerrarModal();

            console.log('✅ Todos los favoritos eliminados');
        } catch (error) {
            console.error('❌ Error limpiando favoritos:', error);
            this.mostrarNotificacion('Error al limpiar favoritos', 'error');
        }
    }

    // ==================== FILTROS Y ORDENAMIENTO ====================

    aplicarFiltros() {
        const categoria = document.getElementById('filtroCategoria')?.value || '';
        const precioMin = parseFloat(document.getElementById('precioMin')?.value) || null;
        const precioMax = parseFloat(document.getElementById('precioMax')?.value) || null;
        const ordenPor = document.getElementById('ordenarPor')?.value || 'reciente';

        this.filtros = { categoria, precioMin, precioMax, ordenPor };

        // Aplicar filtros
        this.productosFiltrados = this.favoritos.filter(producto => {
            // Filtro por categoría
            if (categoria && producto.categoria !== categoria) return false;

            // Filtro por precio
            if (precioMin !== null && producto.precio < precioMin) return false;
            if (precioMax !== null && producto.precio > precioMax) return false;

            return true;
        });

        // Aplicar ordenamiento
        this.aplicarOrdenamiento();
        this.renderizarFavoritos();
    }

    aplicarOrdenamiento() {
        switch (this.filtros.ordenPor) {
            case 'reciente':
                this.productosFiltrados.sort((a, b) => new Date(b.fechaAgregado) - new Date(a.fechaAgregado));
                break;
            case 'precio-asc':
                this.productosFiltrados.sort((a, b) => a.precio - b.precio);
                break;
            case 'precio-desc':
                this.productosFiltrados.sort((a, b) => b.precio - a.precio);
                break;
            case 'nombre':
                this.productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'disponibilidad':
                this.productosFiltrados.sort((a, b) => (b.stock || 0) - (a.stock || 0));
                break;
        }
    }

    limpiarFiltros() {
        document.getElementById('filtroCategoria').value = '';
        document.getElementById('precioMin').value = '';
        document.getElementById('precioMax').value = '';
        document.getElementById('ordenarPor').value = 'reciente';

        this.filtros = { categoria: '', precioMin: null, precioMax: null, ordenPor: 'reciente' };
        this.productosFiltrados = [...this.favoritos];
        this.aplicarOrdenamiento();
        this.renderizarFavoritos();

        this.mostrarNotificacion('Filtros limpiados', 'info');
    }

    // ==================== RENDERIZADO ====================

    renderizarFavoritos() {
        const container = document.getElementById('favoritosGrid');
        const favoritosVacio = document.getElementById('favoritosVacio');
        const contador = document.getElementById('contadorFavoritos');

        if (!container) return;

        // Actualizar contador
        if (contador) contador.textContent = this.favoritos.length;

        // Mostrar/ocultar estado vacío
        if (this.productosFiltrados.length === 0) {
            container.innerHTML = '';
            if (favoritosVacio) {
                if (this.favoritos.length === 0) {
                    favoritosVacio.style.display = 'block';
                    favoritosVacio.querySelector('h3').textContent = 'Aún no tienes favoritos';
                    favoritosVacio.querySelector('p').textContent = 'Explora nuestros productos y guarda los que más te gusten';
                } else {
                    favoritosVacio.style.display = 'block';
                    favoritosVacio.querySelector('h3').textContent = 'No se encontraron resultados';
                    favoritosVacio.querySelector('p').textContent = 'Intenta ajustar los filtros para ver más productos';
                }
            }
            return;
        }

        if (favoritosVacio) favoritosVacio.style.display = 'none';

        // Aplicar clase de vista
        container.className = `favoritos-grid ${this.vistaActual === 'lista' ? 'lista' : ''}`;

        // Renderizar productos
        container.innerHTML = this.productosFiltrados.map((producto, index) => {
            const imagenUrl = producto.imagen ?
                `${this.apiBaseURL.replace('/api', '')}/imagenes-productos/${producto.imagen.split(/[|,]/)[0].trim()}` :
                null;

            return `
                <div class="favorito-card ${this.vistaActual === 'lista' ? 'lista-view' : ''}" data-producto-id="${producto.id}">
                    <div class="favorito-header">
                        <span class="fecha-agregado">${this.formatearFecha(producto.fechaAgregado)}</span>
                        <button class="btn-quitar-favorito" onclick="window.favoritosApp.eliminarFavorito(${producto.id})" title="Quitar de favoritos">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5 2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="producto-imagen-fav" onclick="window.favoritosApp.verProducto(${producto.id})">
                        ${imagenUrl ?
                `<img src="${imagenUrl}" alt="${producto.nombre}" loading="lazy">` :
                '<div style="color: #9ca3af; font-size: 2rem;">📦</div>'
            }
                    </div>
                    
                    <div class="producto-info-fav">
                        <h3 class="producto-nombre-fav">${producto.nombre}</h3>
                        <p class="producto-categoria-fav">${producto.categoria}</p>
                        <p class="producto-precio-fav">$${Number(producto.precio).toLocaleString('es-ES')}</p>
                        
                        <div class="producto-disponibilidad">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M9 12l2 2 4-4"/>
                            </svg>
                            <span class="${(producto.stock || 0) > 0 ? 'stock-disponible' : 'stock-agotado'}">
                                ${(producto.stock || 0) > 0 ? `Stock: ${producto.stock}` : 'Agotado'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="producto-acciones-fav">
                        <button class="btn-agregar-carrito" onclick="window.favoritosApp.agregarAlCarrito(${producto.id})" ${(producto.stock || 0) <= 0 ? 'disabled' : ''}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/>
                            </svg>
                            ${(producto.stock || 0) > 0 ? 'Agregar' : 'Agotado'}
                        </button>
                        <button class="btn-ver-producto" onclick="window.favoritosApp.verProducto(${producto.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            Ver
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // ✅ SIN ANIMACIONES
        console.log('🛒 Productos renderizados:', this.productosFiltrados.length);
    }

    cambiarVista(vista) {
        this.vistaActual = vista;

        // Actualizar botones activos
        document.querySelectorAll('.vista-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.vista === vista) {
                btn.classList.add('active');
            }
        });

        this.renderizarFavoritos();

        // Animar cambio de vista
        const container = document.getElementById('favoritosGrid');
        if (container && typeof gsap !== 'undefined') {
            gsap.fromTo(container,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        }
    }

    actualizarEstadisticas() {
        const total = this.favoritos.length;
        const mesActual = new Date().getMonth();
        const añoActual = new Date().getFullYear();

        const favoritosMes = this.favoritos.filter(fav => {
            const fecha = new Date(fav.fechaAgregado);
            return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
        }).length;

        const valorTotal = this.favoritos.reduce((total, fav) => total + (fav.precio || 0), 0);

        // Categoría más frecuente
        const categorias = {};
        this.favoritos.forEach(fav => {
            const cat = fav.categoria || 'Sin categoría';
            categorias[cat] = (categorias[cat] || 0) + 1;
        });

        const categoriaFavorita = Object.keys(categorias).reduce((a, b) =>
            categorias[a] > categorias[b] ? a : b, 'N/A');

        // Actualizar UI
        const elementos = {
            totalFavoritos: document.getElementById('totalFavoritos'),
            favoritosMes: document.getElementById('favoritosMes'),
            valorTotal: document.getElementById('valorTotal'),
            categoriaFavorita: document.getElementById('categoriaFavorita')
        };

        if (elementos.totalFavoritos) elementos.totalFavoritos.textContent = total;
        if (elementos.favoritosMes) elementos.favoritosMes.textContent = favoritosMes;
        if (elementos.valorTotal) elementos.valorTotal.textContent = `$${valorTotal.toLocaleString('es-ES')}`;
        if (elementos.categoriaFavorita) elementos.categoriaFavorita.textContent = total > 0 ? categoriaFavorita : '-';
    }

    // ==================== ACCIONES ====================

    async agregarAlCarrito(productoId) {
        try {
            const producto = this.favoritos.find(fav => fav.id === productoId);
            if (!producto || (producto.stock || 0) <= 0) {
                this.mostrarNotificacion('Producto sin stock disponible', 'warning');
                return;
            }

            const carritoData = {
                usuarioId: this.usuario.user.id,
                productoId: productoId,
                cantidad: 1
            };

            const response = await fetch(`${this.apiBaseURL}/carrito/agregar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(carritoData)
            });

            if (response.ok) {
                const result = await response.json();
                this.mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
                this.animarBotonCarrito(productoId);
                console.log('✅ Producto agregado al carrito desde favoritos');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al agregar al carrito');
            }
        } catch (error) {
            console.error('❌ Error agregando al carrito:', error);
            this.mostrarNotificacion('Error: ' + error.message, 'error');
        }
    }

    async agregarTodosAlCarrito() {
        const disponibles = this.productosFiltrados.filter(fav => (fav.stock || 0) > 0);

        if (disponibles.length === 0) {
            this.mostrarNotificacion('No hay productos disponibles para agregar', 'warning');
            return;
        }

        try {
            let agregados = 0;
            for (const producto of disponibles) {
                try {
                    await this.agregarAlCarrito(producto.id);
                    agregados++;
                } catch (error) {
                    console.log(`Error agregando ${producto.nombre}:`, error);
                }
            }

            this.mostrarNotificacion(`${agregados} productos agregados al carrito`, 'success');
        } catch (error) {
            this.mostrarNotificacion('Error agregando productos al carrito', 'error');
        }
    }

    verProducto(productoId) {
        console.log('🔍 Navegando a producto:', productoId);
        window.location.href = `/producto?id=${productoId}`;
    }

    compartirFavoritos() {
        if (navigator.share && this.favoritos.length > 0) {
            navigator.share({
                title: 'Mis Favoritos - MinimalStore',
                text: `Mira mis ${this.favoritos.length} productos favoritos en MinimalStore`,
                url: window.location.href
            });
        } else {
            // Fallback: copiar URL al portapapeles
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.mostrarNotificacion('Enlace copiado al portapapeles', 'success');
            });
        }
    }

    crearListaPersonalizada() {
        this.mostrarNotificacion('Función en desarrollo: Crear lista personalizada', 'info');
    }

    volver() {
        window.location.href = '/dashboard';
    }

    // ==================== UTILIDADES ====================

    formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        const ahora = new Date();
        const diffDias = Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24));

        if (diffDias === 0) return 'Hoy';
        if (diffDias === 1) return 'Ayer';
        if (diffDias < 7) return `Hace ${diffDias} días`;
        if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`;
        return fecha.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#4ade80' : tipo === 'error' ? '#ef4444' : tipo === 'warning' ? '#fbbf24' : '#667eea'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
            max-width: 300px;
        `;
        toast.textContent = mensaje;

        document.body.appendChild(toast);

        // Animar entrada
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(toast,
                { opacity: 0, x: 100 },
                { opacity: 1, x: 0, duration: 0.5, ease: "back.out(1.7)" }
            );
        }

        // Remover después de 3 segundos
        setTimeout(() => {
            if (typeof gsap !== 'undefined') {
                gsap.to(toast, {
                    opacity: 0,
                    x: 100,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: () => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }
                });
            } else {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }
        }, 3000);
    }

    animarBotonCarrito(productoId) {
        const card = document.querySelector(`[data-producto-id="${productoId}"]`);
        const boton = card?.querySelector('.btn-agregar-carrito');

        if (boton && typeof gsap !== 'undefined') {
            gsap.to(boton, {
                duration: 0.3,
                scale: 1.1,
                ease: "back.out(1.7)",
                yoyo: true,
                repeat: 1
            });
        }
    }

    mostrarError(mensaje) {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
                <h1 style="color: #ef4444; margin-bottom: 1rem;">❌ Error</h1>
                <p style="color: #6b7280; margin-bottom: 2rem;">${mensaje}</p>
                <button onclick="window.location.href='/dashboard'" style="padding: 1rem 2rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Volver al Dashboard
                </button>
            </div>
        `;
    }

    // ==================== MODAL ====================

    mostrarModalConfirmacion(titulo, mensaje, callback) {
        const modal = document.getElementById('modalConfirmacion');
        const modalTitulo = document.getElementById('modalTitulo');
        const modalMensaje = document.getElementById('modalMensaje');
        const btnConfirmar = document.getElementById('btnConfirmar');

        if (modalTitulo) modalTitulo.textContent = titulo;
        if (modalMensaje) modalMensaje.textContent = mensaje;

        // Configurar callback
        const nuevoConfirmar = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(nuevoConfirmar, btnConfirmar);
        nuevoConfirmar.addEventListener('click', () => {
            callback();
            this.cerrarModal();
        });

        modal.style.display = 'flex';

        // Animar entrada
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(modal.querySelector('.modal-content'),
                { opacity: 0, scale: 0.7 },
                { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
            );
        }
    }

    cerrarModal() {
        const modal = document.getElementById('modalConfirmacion');

        if (typeof gsap !== 'undefined') {
            gsap.to(modal.querySelector('.modal-content'), {
                opacity: 0,
                scale: 0.7,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    modal.style.display = 'none';
                }
            });
        } else {
            modal.style.display = 'none';
        }
    }

    // ==================== ANIMACIONES FUTURAS ====================


}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.favoritosApp = new FavoritosApp();
});
