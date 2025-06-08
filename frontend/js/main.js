// main.js - Funcionalidad principal del MinimalEcommerce

// Configuración global de la aplicación
const CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api',
    CATEGORIAS: ['tecnologia', 'hogar', 'moda', 'mascotas', 'manualidades'],
    ANIMATION_DURATION: 0.6,
    LOADER_DURATION: 3500
};

/**
 * Clase principal del MinimalEcommerce
 * Maneja toda la funcionalidad del frontend minimalista
 */
class MinimalEcommerce {
    constructor() {
        this.productos = [];
        this.categoriaActual = 'todas';
        this.carrito = JSON.parse(localStorage.getItem('carritoitems')) || [];
        this.usuario = JSON.parse(localStorage.getItem('usuario')) || null;

        this.init();
    }

    /**
     * Inicialización de la aplicación
     */
    async init() {
        try {
            await this.configurarEventos();
            await this.cargarProductos();
            this.configurarAnimacionesGSAP();
            this.configurarResponsiveDesign();
            this.actualizarContadorCarrito();

            console.log('MinimalEcommerce inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando MinimalEcommerce:', error);
            this.manejarError(error);
        }
    }

    /**
     * Configurar todos los event listeners
     */
    configurarEventos() {
        // Eventos de categorías
        document.querySelectorAll('.categoria-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoria = e.target.dataset.categoria;
                this.filtrarPorCategoria(categoria);
                this.actualizarCategoriaActiva(e.target);
            });
        });

        // Evento del carrito
        const carritoBtn = document.getElementById('carrito-btn');
        if (carritoBtn) {
            carritoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.mostrarCarrito();
            });
        }

        // Eventos de búsqueda (si existe)
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.buscarProductos(e.target.value);
            });
        }

        // Eventos de redimensionamiento de ventana
        window.addEventListener('resize', () => {
            this.manejarRedimensionamiento();
        });

        // Eventos de scroll para animaciones
        window.addEventListener('scroll', () => {
            this.manejarScroll();
        });
    }

    /**
     * Cargar productos desde la API
     */
    async cargarProductos() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/productos`);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            this.productos = await response.json();
            this.mostrarProductos(this.productos);

        } catch (error) {
            console.warn('Error cargando productos de la API, usando datos de ejemplo:', error);
            this.cargarProductosEjemplo();
        }
    }

    /**
     * Cargar productos de ejemplo para desarrollo
     */
    cargarProductosEjemplo() {
        this.productos = [
            {
                id: 1,
                nombre: 'Smartphone Pro',
                precio: 599.99,
                categoria: 'tecnologia',
                imagen: '/images/smartphone.jpg',
                descripcion: 'Último modelo con cámara avanzada y diseño minimalista'
            },
            {
                id: 2,
                nombre: 'Lámpara LED Minimalista',
                precio: 49.99,
                categoria: 'hogar',
                imagen: '/images/lampara.jpg',
                descripcion: 'Iluminación inteligente para espacios modernos'
            },
            {
                id: 3,
                nombre: 'Camiseta Básica',
                precio: 29.99,
                categoria: 'moda',
                imagen: '/images/camiseta.jpg',
                descripcion: 'Algodón orgánico, corte minimalista'
            },
            {
                id: 4,
                nombre: 'Juguete Interactivo',
                precio: 19.99,
                categoria: 'mascotas',
                imagen: '/images/juguete.jpg',
                descripcion: 'Entretenimiento seguro para tu mascota'
            },
            {
                id: 5,
                nombre: 'Kit de Pintura',
                precio: 34.99,
                categoria: 'manualidades',
                imagen: '/images/pintura.jpg',
                descripcion: 'Set completo para proyectos creativos'
            }
        ];

        this.mostrarProductos(this.productos);
    }

    /**
     * Mostrar productos en el grid con animaciones GSAP
     */
    mostrarProductos(productos) {
        const grid = document.getElementById('productos-grid');
        if (!grid) return;

        // Animación de salida de productos existentes
        gsap.to('.producto-card', {
            duration: 0.3,
            opacity: 0,
            y: -20,
            stagger: 0.05,
            ease: "power2.in",
            onComplete: () => {
                grid.innerHTML = '';
                this.renderizarProductos(productos, grid);
            }
        });
    }

    /**
     * Renderizar productos en el DOM
     */
    renderizarProductos(productos, grid) {
        productos.forEach((producto, index) => {
            const productoElement = this.crearElementoProducto(producto);
            grid.appendChild(productoElement);

            // Animación de entrada con GSAP
            gsap.from(productoElement, {
                duration: CONFIG.ANIMATION_DURATION,
                y: 50,
                opacity: 0,
                scale: 0.9,
                delay: index * 0.1,
                ease: "power2.out"
            });
        });
    }

    /**
     * Crear elemento HTML para un producto
     */
    crearElementoProducto(producto) {
        const div = document.createElement('div');
        div.className = 'bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 producto-card border border-gray-100';

        div.innerHTML = `
            <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-50">
                <img src="${producto.imagen || '/images/placeholder.jpg'}" 
                     alt="${producto.nombre}" 
                     class="w-full h-48 object-cover object-center transition-transform duration-300 hover:scale-105"
                     loading="lazy">
            </div>
            <div class="p-4">
                <div class="mb-2">
                    <span class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full uppercase tracking-wide">
                        ${producto.categoria}
                    </span>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">${producto.nombre}</h3>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">${producto.descripcion}</p>
                <div class="flex items-center justify-between">
                    <p class="text-xl font-bold text-gray-900">$${producto.precio.toFixed(2)}</p>
                    <button onclick="app.agregarAlCarrito(${producto.id})" 
                            class="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors duration-200 agregar-btn">
                        Agregar
                    </button>
                </div>
            </div>
        `;

        // Efectos hover con GSAP
        div.addEventListener('mouseenter', () => {
            gsap.to(div, {duration: 0.3, y: -5, ease: "power2.out"});
        });

        div.addEventListener('mouseleave', () => {
            gsap.to(div, {duration: 0.3, y: 0, ease: "power2.out"});
        });

        return div;
    }

    /**
     * Filtrar productos por categoría
     */
    filtrarPorCategoria(categoria) {
        this.categoriaActual = categoria;

        const productosFiltrados = categoria === 'todas'
            ? this.productos
            : this.productos.filter(p => p.categoria === categoria);

        this.mostrarProductos(productosFiltrados);

        // Actualizar URL sin recargar página
        const url = categoria === 'todas' ? '/' : `/${categoria}`;
        window.history.pushState({categoria}, '', url);
    }

    /**
     * Actualizar categoría activa en el menú
     */
    actualizarCategoriaActiva(elementoActivo) {
        document.querySelectorAll('.categoria-link').forEach(link => {
            link.classList.remove('text-gray-900', 'font-medium');
            link.classList.add('text-gray-600');
        });

        elementoActivo.classList.remove('text-gray-600');
        elementoActivo.classList.add('text-gray-900', 'font-medium');
    }

    /**
     * Agregar producto al carrito
     */
    async agregarAlCarrito(productoId) {
        try {
            const producto = this.productos.find(p => p.id === productoId);
            if (!producto) return;

            const itemExistente = this.carrito.find(item => item.id === productoId);

            if (itemExistente) {
                itemExistente.cantidad++;
            } else {
                this.carrito.push({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    imagen: producto.imagen,
                    cantidad: 1
                });
            }

            this.guardarCarritoEnStorage();
            this.actualizarContadorCarrito();
            this.mostrarNotificacionCarrito(producto.nombre);

        } catch (error) {
            console.error('Error agregando producto al carrito:', error);
        }
    }

    /**
     * Mostrar notificación de producto agregado
     */
    mostrarNotificacionCarrito(nombreProducto) {
        // Crear notificación temporal
        const notificacion = document.createElement('div');
        notificacion.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        notificacion.textContent = `${nombreProducto} agregado al carrito`;

        document.body.appendChild(notificacion);

        // Animación de entrada y salida
        gsap.from(notificacion, {duration: 0.3, x: 100, opacity: 0});
        gsap.to(notificacion, {duration: 0.3, x: 100, opacity: 0, delay: 2,
            onComplete: () => document.body.removeChild(notificacion)
        });
    }

    /**
     * Configurar animaciones GSAP
     */
    configurarAnimacionesGSAP() {
        // Animación del header al hacer scroll
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const header = document.querySelector('header');

            if (scrollTop > lastScrollTop && scrollTop > 100) {
                gsap.to(header, {duration: 0.3, y: -100, ease: "power2.inOut"});
            } else {
                gsap.to(header, {duration: 0.3, y: 0, ease: "power2.inOut"});
            }
            lastScrollTop = scrollTop;
        });

        // Animación de elementos al entrar en viewport
        gsap.registerPlugin(ScrollTrigger);

        gsap.utils.toArray('.animate-on-scroll').forEach(element => {
            gsap.from(element, {
                duration: 0.8,
                y: 50,
                opacity: 0,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    }

    /**
     * Configurar diseño responsivo
     */
    configurarResponsiveDesign() {
        const manejarCambioTamaño = () => {
            const width = window.innerWidth;
            const grid = document.getElementById('productos-grid');

            if (grid) {
                if (width < 640) {
                    grid.className = 'grid grid-cols-1 gap-6 px-4';
                } else if (width < 768) {
                    grid.className = 'grid grid-cols-2 gap-6 px-4';
                } else if (width < 1024) {
                    grid.className = 'grid grid-cols-3 gap-8 px-4';
                } else {
                    grid.className = 'grid grid-cols-4 gap-8 px-4';
                }
            }
        };

        // Ejecutar al cargar y al redimensionar
        manejarCambioTamaño();
        window.addEventListener('resize', manejarCambioTamaño);
    }

    /**
     * Manejar redimensionamiento de ventana
     */
    manejarRedimensionamiento() {
        // Reiniciar animaciones si es necesario
        gsap.set('.producto-card', {clearProps: "all"});

        // Reconfigurar grid
        this.configurarResponsiveDesign();
    }

    /**
     * Manejar scroll de página
     */
    manejarScroll() {
        const scrollY = window.scrollY;

        // Parallax sutil en hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            gsap.to(heroSection, {
                duration: 0.3,
                y: scrollY * 0.5,
                ease: "none"
            });
        }
    }

    /**
     * Actualizar contador del carrito
     */
    actualizarContadorCarrito() {
        const contador = document.getElementById('carrito-contador');
        if (contador) {
            const totalItems = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
            contador.textContent = totalItems;

            // Animación del contador
            if (totalItems > 0) {
                gsap.from(contador, {duration: 0.3, scale: 1.5, ease: "back.out(1.7)"});
            }
        }
    }

    /**
     * Guardar carrito en localStorage
     */
    guardarCarritoEnStorage() {
        localStorage.setItem('carritoitems', JSON.stringify(this.carrito));
    }

    /**
     * Mostrar carrito (implementar según necesidades)
     */
    mostrarCarrito() {
        // Redirigir a página de carrito o mostrar modal
        window.location.href = '/carrito';
    }

    /**
     * Buscar productos
     */
    buscarProductos(termino) {
        const productosFiltrados = this.productos.filter(producto =>
            producto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            producto.descripcion.toLowerCase().includes(termino.toLowerCase())
        );

        this.mostrarProductos(productosFiltrados);
    }

    /**
     * Manejar errores de la aplicación
     */
    manejarError(error) {
        console.error('Error en MinimalEcommerce:', error);

        // Mostrar mensaje de error al usuario
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        errorDiv.textContent = 'Error cargando la aplicación. Intenta recargar la página.';

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MinimalEcommerce();
});

// Manejar navegación del historial
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.categoria) {
        window.app.filtrarPorCategoria(event.state.categoria);
    }
});

// Exportar para uso global
window.MinimalEcommerce = MinimalEcommerce;
window.CONFIG = CONFIG;
