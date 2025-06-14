// producto.js - Sistema completo de página de producto integrado con API
class ProductoDetalle {
    constructor() {
        this.productoId = null;
        this.producto = null;
        this.usuario = null;
        this.tipoUsuario = 'COMPRADOR';
        this.apiBaseURL = 'http://localhost:8080/api';
        this.currentImageIndex = 0;
        this.imagenes = [];
        this.esFavorito = false;

        this.init();
    }

    async init() {
        try {
            // Mostrar loading
            this.mostrarLoading();

            // Obtener ID del producto desde URL
            this.obtenerProductoId();

            // Verificar autenticación y cargar usuario
            this.verificarAutenticacion();
            await this.cargarUsuario();

            // Configurar event listeners
            this.setupEventListeners();

            // Cargar producto
            await this.cargarProducto();

            // Configurar animaciones
            this.setupAnimaciones();

            // Ocultar loading
            setTimeout(() => {
                this.ocultarLoading();
            }, 800);

        } catch (error) {
            console.error('Error inicializando página de producto:', error);
            this.mostrarError('Error al cargar el producto');
        }
    }

    obtenerProductoId() {
        const urlParams = new URLSearchParams(window.location.search);
        this.productoId = urlParams.get('id');

        if (!this.productoId) {
            window.location.href = '/categorias';
            return;
        }

        console.log('Producto ID:', this.productoId);
    }

    verificarAutenticacion() {
        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');

        if (!userSession) {
            window.location.href = '/login';
            return;
        }

        try {
            this.usuario = JSON.parse(userSession);

            // ✅ DETECCIÓN CORRECTA DE TIPO DE USUARIO (igual que perfil.js)
            this.tipoUsuario = this.usuario.user?.tipousuario ||
                this.usuario.user?.tipoUsuario ||
                this.usuario.tipousuario ||
                this.usuario.tipoUsuario ||
                'COMPRADOR';

            console.log('Usuario autenticado:', this.tipoUsuario, 'ID:', this.usuario.user?.id || this.usuario.id);
            console.log('Datos completos del usuario:', this.usuario);

        } catch (error) {
            console.error('Error parseando sesión de usuario:', error);
            window.location.href = '/login';
        }
    }

    async cargarUsuario() {
        // Obtener datos del localStorage (similar a perfil.js)
        const usuarioId = localStorage.getItem('usuarioId');
        const token = localStorage.getItem('token');
        const usuarioGuardado = localStorage.getItem('usuario');

        console.log('Debug - Datos en localStorage:', {usuarioId, token, usuarioGuardado});

        // VERIFICACIÓN SIMPLE - Solo verificar que existan
        if (!usuarioId || !token) {
            console.log('No hay token o usuarioId, redirigiendo a login');
            window.location.href = '/login';
            return;
        }

        // CARGAR DATOS INMEDIATAMENTE desde localStorage
        if (usuarioGuardado) {
            try {
                const usuarioCompleto = JSON.parse(usuarioGuardado);

                // Actualizar datos del usuario con información completa
                this.usuario = {
                    user: usuarioCompleto,
                    ...usuarioCompleto
                };

                this.tipoUsuario = usuarioCompleto.tipousuario ||
                    usuarioCompleto.tipoUsuario ||
                    'COMPRADOR';

                console.log('Usuario cargado desde localStorage:', this.usuario);
                console.log('Tipo de usuario detectado:', this.tipoUsuario);

            } catch (error) {
                console.error('Error parseando usuario desde localStorage:', error);
                // Crear usuario básico si hay error parseando
                this.usuario = {
                    user: {
                        id: usuarioId,
                        tipousuario: 'COMPRADOR'
                    }
                };
                this.tipoUsuario = 'COMPRADOR';
            }
        } else {
            // Si no hay datos en localStorage, crear usuario básico
            this.usuario = {
                user: {
                    id: usuarioId,
                    tipousuario: 'COMPRADOR'
                }
            };
            this.tipoUsuario = 'COMPRADOR';
        }
    }

    async cargarProducto() {
        try {
            const response = await fetch(`${this.apiBaseURL}/productos/${this.productoId}`);

            if (!response.ok) {
                throw new Error('Producto no encontrado');
            }

            this.producto = await response.json();
            console.log('Producto cargado:', this.producto);

            this.mostrarInformacionProducto();
            this.configurarGaleria();
            await this.verificarFavorito();
            this.configurarAcciones();

            // ✅ AGREGAR ESTA LÍNEA
            await this.verificarProductoEnCarrito();

            await this.cargarResenas();

        } catch (error) {
            console.error('Error cargando producto:', error);
            this.mostrarError('No se pudo cargar el producto');
        }
    }

    async verificarFavorito() {
        try {
            const response = await fetch(
                `${this.apiBaseURL}/favoritos/usuario/${this.usuario.user.id}/producto/${this.productoId}/verificar`
            );

            if (response.ok) {
                const result = await response.json();
                this.esFavorito = result.estaEnFavoritos;
                console.log('Es favorito:', this.esFavorito);
            }
        } catch (error) {
            console.error('Error verificando favorito:', error);
        }
    }

    mostrarInformacionProducto() {
        // Actualizar breadcrumb
        document.getElementById('product-category').textContent =
            this.producto.categoria?.nombre || 'Categoría';
        document.getElementById('product-name').textContent =
            this.producto.nombre || 'Producto';

        // Información principal
        document.getElementById('product-title').textContent = this.producto.nombre;
        document.getElementById('product-description').textContent =
            this.producto.descripcion || 'Sin descripción disponible';

        // Precio
        const precio = Number(this.producto.precio);
        document.getElementById('current-price').textContent =
            `$${precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;

        // Stock
        const stockElement = document.getElementById('stock-status');
        if (this.producto.stock <= 0) {
            stockElement.textContent = 'Agotado';
            stockElement.classList.add('out-of-stock');
        } else {
            stockElement.textContent = `Stock: ${this.producto.stock} disponibles`;
        }

        // ✅ AGREGAR VERIFICACIÓN DE PREORDEN
        console.log('🔍 Verificando si es producto de preorden:', this.producto.espreorden);

        // Mostrar badge de preorden si aplica
        if (this.producto.espreorden) {
            const stockElement = document.getElementById('stock-status');
            stockElement.innerHTML = `
            <span class="preorden-badge-inline">⏳ Producto de Preorden</span>
            <span class="preorden-info-text">Fabricado bajo pedido</span>
        `;
            stockElement.classList.add('preorden-status');
        }

        // Rating (simulado por ahora)
        document.getElementById('rating-count').textContent =
            `(${Math.floor(Math.random() * 50) + 10} reseñas)`;
    }

    configurarGaleria() {
        if (!this.producto.imagen) {
            this.mostrarImagenPlaceholder();
            return;
        }

        // Procesar imágenes (separadas por | o ,)
        this.imagenes = this.producto.imagen.split(/[|,]/)
            .filter(img => img.trim())
            .map(img => img.trim());

        if (this.imagenes.length === 0) {
            this.mostrarImagenPlaceholder();
            return;
        }

        // Configurar imagen principal con animación
        this.mostrarImagenPrincipal(0);

        // Configurar thumbnails
        this.configurarThumbnails();

        // Agregar evento de carga a la imagen principal
        const mainImage = document.getElementById('main-image');
        mainImage.addEventListener('load', () => {
            mainImage.classList.add('loaded');

            // Animar entrada si hay GSAP
            if (typeof gsap !== 'undefined') {
                gsap.from('.thumbnail', {
                    opacity: 0,
                    scale: 0.8,
                    y: 20,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "back.out(1.7)",
                    delay: 0.3
                });
            }
        });
    }

    mostrarImagenPrincipal(index) {
        if (index < 0 || index >= this.imagenes.length) return;

        this.currentImageIndex = index;
        const mainImage = document.getElementById('main-image');
        const mainContainer = document.querySelector('.main-image-container');
        const imageUrl = `${this.apiBaseURL.replace('/api', '')}/imagenes-productos/${this.imagenes[index]}`;

        console.log('🖼️ Cambiando a imagen:', index, imageUrl);

        // Crear una imagen temporal para obtener las dimensiones
        const tempImage = new Image();
        tempImage.onload = () => {
            const aspectRatio = tempImage.naturalWidth / tempImage.naturalHeight;

            // Adaptar el container según las proporciones de la imagen
            if (aspectRatio > 1.2) {
                // Imagen panorámica (más ancha)
                mainContainer.style.aspectRatio = '16/9';
                mainContainer.style.maxHeight = '500px';
            } else if (aspectRatio < 0.8) {
                // Imagen vertical (más alta)
                mainContainer.style.aspectRatio = '3/4';
                mainContainer.style.maxHeight = '800px';
            } else {
                // Imagen cuadrada o cercana
                mainContainer.style.aspectRatio = '1';
                mainContainer.style.maxHeight = '750px';
            }

            // Agregar clase para indicar que la imagen está cargada
            mainContainer.classList.add('image-loaded');

            // Animar el cambio si hay GSAP
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(mainImage,
                    { opacity: 0, scale: 0.95 },
                    { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
                );
            }
        };

        tempImage.src = imageUrl;
        mainImage.src = imageUrl;
        mainImage.alt = this.producto.nombre;

        // Actualizar thumbnail activo con animación
        document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            if (i === index) {
                thumb.classList.add('active');
                // Animar el thumbnail activo
                if (typeof gsap !== 'undefined') {
                    gsap.to(thumb, {
                        scale: 1.05,
                        duration: 0.3,
                        ease: "back.out(1.7)"
                    });
                }
            } else {
                thumb.classList.remove('active');
                if (typeof gsap !== 'undefined') {
                    gsap.to(thumb, {
                        scale: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            }
        });

        // Scroll automático para mostrar thumbnail activo
        const activeThumb = document.querySelector('.thumbnail.active');
        if (activeThumb) {
            activeThumb.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }

    configurarThumbnails() {
        const container = document.getElementById('thumbnail-container');
        container.innerHTML = '';

        if (this.imagenes.length <= 1) {
            // Si solo hay una imagen, ocultar el container
            container.style.display = 'none';
            return;
        }

        // Mostrar el container si hay múltiples imágenes
        container.style.display = 'flex';

        this.imagenes.forEach((imagen, index) => {
            const thumbnailWrapper = document.createElement('div');
            thumbnailWrapper.className = 'thumbnail';

            const thumbnail = document.createElement('img');
            thumbnail.src = `${this.apiBaseURL.replace('/api', '')}/imagenes-productos/${imagen}`;
            thumbnail.alt = `${this.producto.nombre} - Imagen ${index + 1}`;
            thumbnail.loading = 'lazy';

            thumbnailWrapper.appendChild(thumbnail);
            thumbnailWrapper.onclick = () => this.mostrarImagenPrincipal(index);

            // Agregar clase active a la primera imagen
            if (index === 0) {
                thumbnailWrapper.classList.add('active');
            }

            container.appendChild(thumbnailWrapper);
        });

        // Animar entrada de thumbnails si hay GSAP
        if (typeof gsap !== 'undefined') {
            gsap.fromTo('.thumbnail',
                {
                    opacity: 0,
                    scale: 0.8,
                    y: 20
                },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "back.out(1.7)",
                    delay: 0.3
                }
            );
        }
    }

    mostrarImagenPlaceholder() {
        const mainImage = document.getElementById('main-image');
        mainImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk1YTVhNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfk6YgU2luIGltYWdlbjwvdGV4dD48L3N2Zz4=';
        mainImage.alt = 'Sin imagen disponible';
    }

    configurarAcciones() {
        const actionsContainer = document.getElementById('product-actions');
        actionsContainer.innerHTML = '';

        console.log('🔍 Configurando acciones para:', this.tipoUsuario);
        console.log('🔍 Es producto propio:', this.esProductoPropio());
        console.log('🔍 Vendedor del producto:', this.producto.vendedor?.id);
        console.log('🔍 Usuario actual:', this.usuario.user?.id || this.usuario.id);

        // ✅ AGREGAR BOTÓN DE CARRITO PARA COMPRADORES
        if (this.tipoUsuario === 'COMPRADOR') {
            this.agregarBotonCarritoHeader();
        }
        console.log('🔍 Es producto propio:', this.esProductoPropio());
        console.log('🔍 Vendedor del producto:', this.producto.vendedor?.id);
        console.log('🔍 Usuario actual:', this.usuario.user?.id || this.usuario.id);

        if (this.tipoUsuario === 'VENDEDOR' && this.esProductoPropio()) {
            // ✅ VENDEDOR PROPIETARIO DEL PRODUCTO
            console.log('✅ Configurando acciones para VENDEDOR PROPIETARIO');
            actionsContainer.innerHTML = `
            <button class="action-btn primary" onclick="productoDetalle.editarProducto()">
                <span class="btn-icon">✏️</span>
                Editar Producto
            </button>
            <button class="action-btn secondary" onclick="productoDetalle.verMetricas()">
                <span class="btn-icon">📊</span>
                Ver Métricas
            </button>
            <button class="action-btn tertiary" onclick="productoDetalle.verPreordenesGestion()">
                <span class="btn-icon">📋</span>
                Gestionar Preórdenes
            </button>
            <button class="action-btn danger" onclick="productoDetalle.toggleEstadoProducto()">
                <span class="btn-icon">${this.producto.activo ? '🚫' : '✅'}</span>
                ${this.producto.activo ? 'Desactivar' : 'Activar'}
            </button>
        `;
        } else if (this.tipoUsuario === 'VENDEDOR') {
            // ✅ VENDEDOR VIENDO PRODUCTO DE OTRO
            console.log('✅ Configurando acciones para VENDEDOR (producto de otro)');
            actionsContainer.innerHTML = `
            <button class="action-btn secondary disabled" disabled>
                <span class="btn-icon">👁️</span>
                Solo Vista (Producto de otro vendedor)
            </button>
        `;
        } else if (this.tipoUsuario === 'COMPRADOR') {
            // ✅ COMPRADOR - VERIFICAR TIPO DE PRODUCTO
            console.log('✅ Configurando acciones para COMPRADOR');
            console.log('🔍 Verificando tipo de producto - espreorden:', this.producto.espreorden);

            if (this.producto.espreorden === true || this.producto.espreorden === 1) {
                console.log('✅ Es producto de preorden, configurando acciones de preorden');
                this.configurarAccionesPreorden();
            } else {
                console.log('✅ Es producto normal, configurando acciones normales');
                this.configurarAccionesNormales();
            }
        } else {
            // ✅ FALLBACK - USUARIO NO IDENTIFICADO
            console.log('⚠️ Tipo de usuario no identificado:', this.tipoUsuario);
            actionsContainer.innerHTML = `
            <button class="action-btn secondary disabled" disabled>
                <span class="btn-icon">⚠️</span>
                Usuario no identificado
            </button>
        `;
        }
    }

    configurarAccionesNormales() {
        const actionsContainer = document.getElementById('product-actions');
        const stockDisponible = this.producto.stock > 0;
        const iconoFavorito = this.esFavorito ? '❤️' : '🤍';
        const textoFavorito = this.esFavorito ? 'En Favoritos' : 'Agregar a Favoritos';

        actionsContainer.innerHTML = `
        <button class="action-btn primary" ${!stockDisponible ? 'disabled' : ''} 
                onclick="productoDetalle.agregarAlCarrito(event)">
            <span class="btn-icon">🛒</span>
            ${stockDisponible ? 'Agregar al Carrito' : 'Sin Stock'}
        </button>
        <button id="btn-favorito" class="action-btn secondary ${this.esFavorito ? 'favorito-activo' : ''}" 
                onclick="productoDetalle.toggleFavorito()">
            <span class="btn-icon">${iconoFavorito}</span>
            ${textoFavorito}
        </button>
        <button class="action-btn secondary" onclick="productoDetalle.contactarVendedor()">
            <span class="btn-icon">💬</span>
            Contactar Vendedor
        </button>`;
    }

    configurarAccionesPreorden() {
        const actionsContainer = document.getElementById('product-actions');
        const iconoFavorito = this.esFavorito ? '❤️' : '🤍';
        const textoFavorito = this.esFavorito ? 'En Favoritos' : 'Agregar a Favoritos';

        actionsContainer.innerHTML = `
        <button class="action-btn primary preorden-btn" onclick="productoDetalle.abrirModalPreorden()">
            <span class="btn-icon">⏳</span>
            Hacer Preorden
        </button>
        <button id="btn-favorito" class="action-btn secondary ${this.esFavorito ? 'favorito-activo' : ''}" 
                onclick="productoDetalle.toggleFavorito()">
            <span class="btn-icon">${iconoFavorito}</span>
            ${textoFavorito}
        </button>
        <button class="action-btn secondary" onclick="productoDetalle.contactarVendedor()">
            <span class="btn-icon">💬</span>
            Contactar Vendedor
        </button>
    `;

        // Agregar información de preorden
        this.mostrarInformacionPreorden();
    }

    mostrarInformacionPreorden() {
        const infoContainer = document.querySelector('.product-info-container');

        // Verificar si ya existe el badge para no duplicarlo
        if (infoContainer.querySelector('.preorden-badge')) {
            return;
        }

        // Agregar badge de preorden
        const badge = document.createElement('div');
        badge.className = 'preorden-badge';
        badge.innerHTML = `
        <span class="badge-icon">⏳</span>
        <span class="badge-text">Producto de Preorden</span>
    `;

        infoContainer.insertBefore(badge, infoContainer.firstChild);

        // Agregar información adicional
        const infoPreorden = document.createElement('div');
        infoPreorden.className = 'preorden-info';
        infoPreorden.innerHTML = `
        <h4>📋 Información de Preorden</h4>
        <ul>
            <li>✅ Producto fabricado bajo pedido</li>
            <li>⏱️ Tiempo de entrega personalizable</li>
            <li>🎨 Posibilidad de personalización</li>
            <li>💰 Precio fijo garantizado</li>
        </ul>
    `;

        // Insertar después de la descripción
        const descripcion = document.querySelector('.product-description');
        if (descripcion && !descripcion.nextElementSibling?.classList.contains('preorden-info')) {
            descripcion.parentNode.insertBefore(infoPreorden, descripcion.nextSibling);
        }
    }
    async verificarProductoEnCarrito() {
        try {
            const response = await fetch(`${this.apiBaseURL}/carrito/usuario/${this.usuario.user.id}`);

            if (response.ok) {
                const carritoItems = await response.json();
                const itemExistente = carritoItems.find(item =>
                    item.producto && item.producto.id === parseInt(this.productoId)
                );

                if (itemExistente) {
                    this.actualizarBotonCarrito(itemExistente);
                }
            }
        } catch (error) {
            console.log('Error verificando producto en carrito:', error);
        }
    }

    actualizarBotonCarrito(itemCarrito) {
        const actionsContainer = document.getElementById('product-actions');
        const botonCarrito = actionsContainer.querySelector('.action-btn.primary');

        if (botonCarrito && itemCarrito) {
            const cantidadEnCarrito = itemCarrito.cantidad;
            const stockDisponible = this.producto.stock;

            if (cantidadEnCarrito >= stockDisponible) {
                // Producto ya tiene el máximo en carrito
                botonCarrito.innerHTML = `
                <span class="btn-icon">✅</span>
                En Carrito (${cantidadEnCarrito}/${stockDisponible})
            `;
                botonCarrito.disabled = true;
                botonCarrito.style.opacity = '0.6';
                botonCarrito.onclick = () => {
                    this.mostrarToast('Producto ya está en el carrito con el stock máximo', 'info');
                };
            } else {
                // Se puede agregar más
                botonCarrito.innerHTML = `
                <span class="btn-icon">🛒</span>
                Agregar Más (${cantidadEnCarrito} en carrito)
            `;
            }
        }
    }

    esProductoPropio() {
        const usuarioId = this.usuario.user?.id || this.usuario.id;
        const vendedorId = this.producto.vendedor?.id;

        console.log('🔍 Verificando propiedad del producto:');
        console.log('   Usuario ID:', usuarioId);
        console.log('   Vendedor ID:', vendedorId);
        console.log('   Es propietario:', usuarioId === vendedorId);

        return usuarioId === vendedorId;
    }

    // ✅ MÉTODO PARA VENDEDORES - REDIRIGIR A PREÓRDENES
    verPreordenesGestion() {
        console.log('🏪 Redirigiendo a gestión de preórdenes');
        window.location.href = '/preorden';
    }

    async cargarResenas() {
        try {
            const response = await fetch(`${this.apiBaseURL}/resenas/producto/${this.productoId}`);

            if (response.ok) {
                const resenas = await response.json();
                this.mostrarResenas(resenas);
            } else {
                this.mostrarEstadoVacioResenas();
            }
        } catch (error) {
            console.error('Error cargando reseñas:', error);
            this.mostrarEstadoVacioResenas();
        }
    }

    mostrarResenas(resenas) {
        const container = document.getElementById('reviews-content');

        if (resenas.length === 0) {
            this.mostrarEstadoVacioResenas();
            return;
        }

        container.innerHTML = resenas.map(resena => `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-author">${resena.usuario?.nombre || 'Usuario Anónimo'}</span>
                    <span class="review-date">${new Date(resena.fecha).toLocaleDateString('es-ES')}</span>
                </div>
                <div class="review-rating">${'★'.repeat(resena.calificacion)}${'☆'.repeat(5 - resena.calificacion)}</div>
                <div class="review-text">${resena.comentario || 'Sin comentario'}</div>
            </div>
        `).join('');

        // Animar entrada de reseñas
        gsap.fromTo('.review-card',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
        );
    }

    mostrarEstadoVacioResenas() {
        document.getElementById('reviews-content').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⭐</div>
                <h3>No hay reseñas aún</h3>
                <p>Sé el primero en dejar una reseña de este producto</p>
            </div>
        `;
    }

    setupEventListeners() {
        // Botón volver
        document.getElementById('back-btn').addEventListener('click', () => {
            window.history.back();
        });

        // Botón escribir reseña
        document.getElementById('write-review-btn').addEventListener('click', () => {
            this.escribirResena();
        });

        // Zoom en imagen principal
        const mainImage = document.getElementById('main-image');
        mainImage.addEventListener('click', () => {
            this.toggleZoom();
        });

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.imagenAnterior();
            } else if (e.key === 'ArrowRight') {
                this.imagenSiguiente();
            }
        });
    }

    setupAnimaciones() {
        // Verificar que GSAP esté disponible
        if (typeof gsap === 'undefined') {
            console.warn('GSAP no está disponible');
            return;
        }

        // Verificar que los elementos existan antes de animar
        const productGallery = document.querySelector('.product-gallery');
        const productInfo = document.querySelector('.product-info-container');
        const reviewsContainer = document.querySelector('.reviews-container');

        if (!productGallery || !productInfo || !reviewsContainer) {
            console.warn('Algunos elementos no están disponibles para animación');
            return;
        }

        // Animación de entrada
        const tl = gsap.timeline();

        tl.from(productGallery, {
            opacity: 0,
            x: -50,
            duration: 0.8,
            ease: "power2.out"
        })
            .from(productInfo, {
                opacity: 0,
                x: 50,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.4")
            .from(reviewsContainer, {
                opacity: 0,
                y: 30,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.2");

        // Hover effects para botones
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, { scale: 1.05, duration: 0.2 });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { scale: 1, duration: 0.2 });
            });
        });
    }

    // ==================== MÉTODOS DE ACCIÓN CON API ====================

    async agregarAlCarrito(event) {
        console.log('🔍 Debug agregarAlCarrito:');
        console.log('- Event:', event);
        console.log('- Usuario ID:', this.usuario?.user?.id);
        console.log('- Producto ID:', this.productoId);
        console.log('- Producto completo:', this.producto);

        // Validaciones
        if (!this.usuario?.user?.id) {
            this.mostrarToast('Error: Usuario no autenticado', 'error');
            return;
        }

        if (!this.productoId) {
            this.mostrarToast('Error: Producto no válido', 'error');
            return;
        }

        if (this.producto.stock <= 0) {
            this.mostrarToast('Producto sin stock disponible', 'warning');
            return;
        }

        // ✅ NUEVA VALIDACIÓN: Verificar si ya está en el carrito
        try {
            console.log('🔍 Verificando si el producto ya está en el carrito...');
            const carritoResponse = await fetch(`${this.apiBaseURL}/carrito/usuario/${this.usuario.user.id}`);

            if (carritoResponse.ok) {
                const carritoItems = await carritoResponse.json();
                const itemExistente = carritoItems.find(item =>
                    item.producto && item.producto.id === parseInt(this.productoId)
                );

                if (itemExistente) {
                    const cantidadTotal = itemExistente.cantidad + 1;
                    if (cantidadTotal > this.producto.stock) {
                        this.mostrarToast(
                            `Ya tienes ${itemExistente.cantidad} unidad(es) en el carrito. Stock máximo: ${this.producto.stock}`,
                            'warning'
                        );
                        return;
                    }
                    console.log(`✅ Se puede agregar. Cantidad actual: ${itemExistente.cantidad}, Stock: ${this.producto.stock}`);
                }
            }
        } catch (error) {
            console.log('⚠️ No se pudo verificar el carrito, continuando...');
        }

        try {
            const carritoData = {
                usuarioId: this.usuario.user.id,
                productoId: parseInt(this.productoId),
                cantidad: 1
            };

            console.log('📦 Enviando al carrito:', carritoData);
            console.log('🌐 URL completa:', `${this.apiBaseURL}/carrito/agregar`);

            const response = await fetch(`${this.apiBaseURL}/carrito/agregar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(carritoData)
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Respuesta exitosa del servidor:', result);

                if (result.success) {
                    this.mostrarToast(result.mensaje || 'Producto agregado al carrito', 'success');

                    // Animación del botón
                    if (event && event.target) {
                        const btn = event.target.closest('.action-btn');
                        if (btn && typeof gsap !== 'undefined') {
                            gsap.to(btn, {
                                scale: 1.2,
                                duration: 0.2,
                                yoyo: true,
                                repeat: 1,
                                ease: "power2.out"
                            });
                        }
                    }

                    this.actualizarContadorCarrito();
                    console.log('✅ Producto agregado exitosamente al carrito');
                } else {
                    throw new Error(result.error || 'Error en la respuesta del servidor');
                }
            } else {
                // Manejar errores HTTP específicos
                let errorMessage = 'Error al agregar al carrito';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                    console.log('❌ Error del servidor:', errorData);

                    // ✅ MANEJO ESPECÍFICO PARA ERRORES DE STOCK
                    if (errorMessage.includes('Stock insuficiente')) {
                        errorMessage = `Este producto ya está en tu carrito. Stock disponible: ${this.producto.stock}`;
                    }
                } catch (e) {
                    console.log('❌ No se pudo parsear el error del servidor');
                    errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('❌ Error agregando al carrito:', error);
            this.mostrarToast('Error: ' + error.message, 'error');
        }
    }

    async toggleFavorito() {
        try {
            const favoritoData = {
                usuarioId: this.usuario.user.id,
                productoId: this.productoId
            };

            const response = await fetch(`${this.apiBaseURL}/favoritos/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(favoritoData)
            });

            if (response.ok) {
                const result = await response.json();
                this.esFavorito = result.esFavorito;

                // Actualizar botón
                this.actualizarBotonFavorito();

                this.mostrarToast(result.mensaje, 'success');

                // Animación del corazón
                const btn = document.getElementById('btn-favorito');
                const icon = btn.querySelector('.btn-icon');

                gsap.to(icon, {
                    scale: 1.5,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1,
                    ease: "back.out(1.7)"
                });

                console.log('✅ Favorito actualizado:', result);
            } else {
                throw new Error('Error al actualizar favorito');
            }
        } catch (error) {
            console.error('❌ Error en favorito:', error);
            this.mostrarToast('Error al actualizar favorito', 'error');
        }
    }

    actualizarBotonFavorito() {
        const btn = document.getElementById('btn-favorito');
        const icon = btn.querySelector('.btn-icon');
        const text = btn.querySelector('.btn-icon').nextSibling;

        if (this.esFavorito) {
            icon.textContent = '❤️';
            btn.innerHTML = '<span class="btn-icon">❤️</span>En Favoritos';
            btn.classList.add('favorito-activo');
        } else {
            icon.textContent = '🤍';
            btn.innerHTML = '<span class="btn-icon">🤍</span>Agregar a Favoritos';
            btn.classList.remove('favorito-activo');
        }
    }

    async actualizarContadorCarrito() {
        try {
            const response = await fetch(`${this.apiBaseURL}/carrito/contar/${this.usuario.user.id}`);

            if (response.ok) {
                const result = await response.json();
                console.log('📊 Contador actualizado:', result);

                // ✅ ACTUALIZAR TAMBIÉN EL CONTADOR DEL HEADER
                await this.actualizarContadorCarritoHeader();

                // Actualizar contador global si existe
                const contadorGlobal = document.querySelector('[data-cart-count]');
                if (contadorGlobal) {
                    // Usar cantidadProductos (suma total) para el contador visual
                    contadorGlobal.textContent = result.cantidadProductos || 0;

                    // Animar el contador si cambió
                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(contadorGlobal,
                            { scale: 1.5, color: '#4ade80' },
                            { scale: 1, color: 'inherit', duration: 0.5, ease: "back.out(1.7)" }
                        );
                    }
                }

                // Disparar evento para otros componentes
                document.dispatchEvent(new CustomEvent('carrito-actualizado', {
                    detail: {
                        cantidadItems: result.cantidadItems || 0,
                        cantidadProductos: result.cantidadProductos || 0
                    }
                }));

                console.log('✅ Contador de carrito actualizado correctamente');
            } else {
                console.log('⚠️ No se pudo actualizar el contador del carrito');
            }
        } catch (error) {
            console.error('❌ Error actualizando contador carrito:', error);
        }
    }

    // ==================== MÉTODOS DE PREORDEN ====================

    abrirModalPreorden() {
        this.mostrarModalPreorden();
    }

    mostrarModalPreorden() {
        const modal = document.createElement('div');
        modal.id = 'modal-preorden';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
        <div class="modal-content preorden-modal">
            <div class="modal-header">
                <h3>
                    <span class="modal-icon">⏳</span>
                    Hacer Preorden
                </h3>
                <button class="modal-close" onclick="productoDetalle.cerrarModalPreorden()">×</button>
            </div>

            <div class="modal-body">
                <div class="producto-preorden-info">
                    <div class="producto-imagen-modal">
                        <img src="${this.obtenerImagenPrincipal()}" alt="${this.producto.nombre}">
                    </div>
                    <div class="producto-datos">
                        <h4>${this.producto.nombre}</h4>
                        <p class="precio-preorden">$${Number(this.producto.precio).toLocaleString('es-ES')}</p>
                        <span class="categoria">${this.producto.categoria?.nombre || 'Sin categoría'}</span>
                    </div>
                </div>

                <form id="form-preorden" class="preorden-form">
                    <div class="form-group">
                        <label for="cantidad-preorden">
                            <span>📦</span> Cantidad que deseas
                        </label>
                        <div class="quantity-input">
                            <button type="button" class="qty-btn minus" onclick="productoDetalle.cambiarCantidad(-1)">−</button>
                            <input type="number" id="cantidad-preorden" name="cantidad" min="1" value="1" required readonly>
                            <button type="button" class="qty-btn plus" onclick="productoDetalle.cambiarCantidad(1)">+</button>
                        </div>
                        <small class="form-help">Mínimo 1 unidad</small>
                    </div>

                    <div class="form-group">
                        <label for="fecha-entrega">
                            <span>📅</span> ¿Cuándo lo necesitas?
                        </label>
                        <input type="date" id="fecha-entrega" name="fechaEntrega" required min="${this.obtenerFechaMinima()}">
                        <small class="form-help">Tiempo mínimo de fabricación: 7 días</small>
                    </div>

                    <div class="form-group">
                        <label for="notas-preorden">
                            <span>✏️</span> Personalización y detalles especiales
                        </label>
                        <textarea id="notas-preorden" name="notas" placeholder="Ejemplo: Color azul marino, talla XL, grabado personalizado, etc." maxlength="500" rows="4"></textarea>
                        <div class="char-counter">
                            <span id="notas-counter">0</span>/500 caracteres
                        </div>
                    </div>

                    <div class="precio-resumen">
                        <div class="resumen-item">
                            <span>💰 Precio unitario:</span>
                            <span id="precio-unitario-modal">$${Number(this.producto.precio).toLocaleString('es-ES')}</span>
                        </div>
                        <div class="resumen-item">
                            <span>📦 Cantidad:</span>
                            <span id="cantidad-mostrada">1 unidad</span>
                        </div>
                        <div class="resumen-total">
                            <span>💳 Total a pagar:</span>
                            <span id="total-preorden">$${Number(this.producto.precio).toLocaleString('es-ES')}</span>
                        </div>
                    </div>
                </form>
            </div>

            <div class="modal-actions">
                <button type="button" class="modal-btn secondary" onclick="productoDetalle.cerrarModalPreorden()">
                    <span class="btn-icon">❌</span>
                    Cancelar
                </button>
                <button type="button" class="modal-btn primary" onclick="productoDetalle.confirmarPreorden()">
                    <span class="btn-icon">✅</span>
                    Confirmar Preorden
                </button>
            </div>
        </div>
    `;

        document.body.appendChild(modal);
        this.configurarModalPreorden();
        this.animarEntradaModal(modal);
    }

    configurarModalPreorden() {
        // Contador de caracteres con validación
        const notasTextarea = document.getElementById('notas-preorden');
        const notasCounter = document.getElementById('notas-counter');

        if (notasTextarea && notasCounter) {
            notasTextarea.addEventListener('input', () => {
                const length = notasTextarea.value.length;
                notasCounter.textContent = length;

                // Cambiar color según proximidad al límite
                if (length > 450) {
                    notasCounter.style.color = 'var(--accent-red)';
                } else if (length > 350) {
                    notasCounter.style.color = 'var(--accent-orange)';
                } else {
                    notasCounter.style.color = 'var(--text-muted)';
                }
            });
        }

        // Validación en tiempo real para fecha
        const fechaInput = document.getElementById('fecha-entrega');
        if (fechaInput) {
            fechaInput.addEventListener('change', () => {
                this.validarFecha(fechaInput);
            });
        }

        // Actualizar total al cambiar cantidad
        const cantidadInput = document.getElementById('cantidad-preorden');
        if (cantidadInput) {
            cantidadInput.addEventListener('input', () => {
                this.actualizarTotalPreorden();
            });
        }

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';

        // Cerrar con ESC
        this.modalKeyHandler = (e) => {
            if (e.key === 'Escape') {
                this.cerrarModalPreorden();
            }
        };
        document.addEventListener('keydown', this.modalKeyHandler);

        // Cerrar al hacer click fuera del modal
        const modal = document.getElementById('modal-preorden');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.cerrarModalPreorden();
            }
        });
    }

    cambiarCantidad(delta) {
        const cantidadInput = document.getElementById('cantidad-preorden');
        if (cantidadInput) {
            const cantidadActual = parseInt(cantidadInput.value) || 1;
            const nuevaCantidad = Math.max(1, Math.min(99, cantidadActual + delta)); // Límite máximo de 99

            cantidadInput.value = nuevaCantidad;
            this.actualizarTotalPreorden();

            // Animar el botón presionado
            const boton = delta > 0 ?
                document.querySelector('.qty-btn.plus') :
                document.querySelector('.qty-btn.minus');

            if (boton && typeof gsap !== 'undefined') {
                gsap.to(boton, {
                    scale: 0.9,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.out"
                });
            }

            // Feedback haptico en móviles
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
    }

    actualizarTotalPreorden() {
        const cantidad = parseInt(document.getElementById('cantidad-preorden')?.value) || 1;
        const precioUnitario = this.producto.precio;
        const total = cantidad * precioUnitario;

        const cantidadMostrada = document.getElementById('cantidad-mostrada');
        const totalElement = document.getElementById('total-preorden');

        if (cantidadMostrada) {
            cantidadMostrada.textContent = cantidad === 1 ? '1 unidad' : `${cantidad} unidades`;
        }

        if (totalElement) {
            totalElement.textContent = `$${total.toLocaleString('es-ES')}`;

            // Animar el cambio de precio
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(totalElement,
                    { scale: 1.2, color: '#27ae60' },
                    { scale: 1, color: 'var(--accent-green)', duration: 0.4, ease: "back.out(1.7)" }
                );
            }
        }
    }

    // Nueva función para validar fecha
    validarFecha(input) {
        const fechaSeleccionada = new Date(input.value);
        const fechaMinima = new Date();
        fechaMinima.setDate(fechaMinima.getDate() + 7);

        const formGroup = input.closest('.form-group');
        let errorMsg = formGroup.querySelector('.error-message');
        let successMsg = formGroup.querySelector('.success-message');

        // Limpiar mensajes previos
        if (errorMsg) errorMsg.remove();
        if (successMsg) successMsg.remove();

        if (fechaSeleccionada < fechaMinima) {
            formGroup.classList.add('error');
            formGroup.classList.remove('success');

            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.innerHTML = '⚠️ La fecha debe ser al menos 7 días desde hoy';
            formGroup.appendChild(errorMsg);
        } else {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');

            successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.innerHTML = '✅ Fecha válida';
            formGroup.appendChild(successMsg);
        }
    }

// Nueva función para animar entrada del modal
    animarEntradaModal(modal) {
        if (typeof gsap !== 'undefined') {
            // Animar overlay
            gsap.fromTo(modal,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: "power2.out" }
            );

            // Animar modal
            const modalContent = modal.querySelector('.modal-content');
            gsap.fromTo(modalContent,
                {
                    opacity: 0,
                    scale: 0.7,
                    y: -50,
                    rotationX: -15
                },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotationX: 0,
                    duration: 0.6,
                    ease: "back.out(1.7)",
                    delay: 0.1
                }
            );

            // Animar elementos internos
            gsap.fromTo('.producto-preorden-info',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: "power2.out" }
            );

            gsap.fromTo('.form-group',
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, delay: 0.4, ease: "power2.out" }
            );

            gsap.fromTo('.precio-resumen',
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.5, delay: 0.6, ease: "back.out(1.7)" }
            );
        }
    }

    obtenerFechaMinima() {
        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 7); // Mínimo 7 días desde hoy
        return hoy.toISOString().split('T')[0];
    }

    obtenerImagenPrincipal() {
        if (this.imagenes && this.imagenes.length > 0) {
            return `${this.apiBaseURL.replace('/api', '')}/imagenes-productos/${this.imagenes[0]}`;
        }
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk1YTVhNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfk6Y8L3RleHQ+PC9zdmc+';
    }

    async confirmarPreorden() {
        try {
            const cantidad = parseInt(document.getElementById('cantidad-preorden').value);
            const fechaEntrega = document.getElementById('fecha-entrega').value;
            const notas = document.getElementById('notas-preorden').value;

            if (!fechaEntrega) {
                this.mostrarToast('Por favor selecciona una fecha de entrega', 'warning');
                return;
            }

            // Validar fecha mínima
            const fechaSeleccionada = new Date(fechaEntrega);
            const fechaMinima = new Date();
            fechaMinima.setDate(fechaMinima.getDate() + 7);

            if (fechaSeleccionada < fechaMinima) {
                this.mostrarToast('La fecha de entrega debe ser al menos 7 días desde hoy', 'warning');
                return;
            }

            const preordenData = {
                usuarioId: this.usuario.user.id,
                productoId: parseInt(this.productoId),
                cantidad: cantidad,
                fechaEstimadaEntrega: fechaEntrega + 'T12:00:00',
                notas: notas
            };

            console.log('📦 Enviando preorden:', preordenData);

            const response = await fetch(`${this.apiBaseURL}/preordenes/crear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preordenData)
            });

            if (response.ok) {
                const result = await response.json();

                if (result.success) {
                    this.mostrarToast('Preorden creada exitosamente', 'success');
                    this.cerrarModalPreorden();
                    this.mostrarConfirmacionPreorden(result.preorden);
                } else {
                    throw new Error(result.error || 'Error al crear preorden');
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear preorden');
            }

        } catch (error) {
            console.error('❌ Error creando preorden:', error);
            this.mostrarToast('Error al crear preorden: ' + error.message, 'error');
        }
    }

    mostrarConfirmacionPreorden(preorden) {
        const modal = document.createElement('div');
        modal.id = 'modal-confirmacion-preorden';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
        <div class="modal-content confirmacion-modal">
            <div class="confirmacion-header">
                <div class="confirmacion-icon">✅</div>
                <h3>¡Preorden Creada Exitosamente!</h3>
                <p>Tu preorden ha sido registrada correctamente</p>
            </div>

            <div class="confirmacion-detalles">
                <h4>Detalles de tu Preorden #${preorden.id}</h4>
                <div class="detalle-item">
                    <span>Producto:</span>
                    <span>${this.producto.nombre}</span>
                </div>
                <div class="detalle-item">
                    <span>Cantidad:</span>
                    <span>${preorden.cantidad} unidades</span>
                </div>
                <div class="detalle-item">
                    <span>Precio Total:</span>
                    <span>$${Number(preorden.cantidad * preorden.preciopreorden).toLocaleString('es-ES')}</span>
                </div>
                <div class="detalle-item">
                    <span>Fecha Estimada:</span>
                    <span>${new Date(preorden.fechaestimadaentrega).toLocaleDateString('es-ES')}</span>
                </div>
                <div class="detalle-item">
                    <span>Estado:</span>
                    <span class="estado-pendiente">Pendiente</span>
                </div>
            </div>

            <div class="confirmacion-acciones">
                <button class="modal-btn primary" onclick="window.location.href='/preordenes'">
                    Ver Mis Preórdenes
                </button>
                <button class="modal-btn secondary" onclick="productoDetalle.cerrarConfirmacionPreorden()">
                    Continuar Navegando
                </button>
            </div>
        </div>
    `;

        document.body.appendChild(modal);
    }

    cerrarModalPreorden() {
        const modal = document.getElementById('modal-preorden');
        if (modal) {
            const modalContent = modal.querySelector('.modal-content');

            // Animar salida
            gsap.to(modalContent, {
                opacity: 0,
                scale: 0.7,
                y: -50,
                rotationX: -15,
                duration: 0.3,
                ease: "power2.in"
            });

            gsap.to(modal, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                delay: 0.1,
                onComplete: () => {
                    modal.remove();
                    // Restaurar scroll del body
                    document.body.style.overflow = '';
                    // Remover event listener
                    if (this.modalKeyHandler) {
                        document.removeEventListener('keydown', this.modalKeyHandler);
                    }
                }
            });
        }
    }

    cerrarConfirmacionPreorden() {
        const modal = document.getElementById('modal-confirmacion-preorden');
        if (modal) {
            modal.remove();
        }
    }

    async verPreordenesExistentes() {
        try {
            const response = await fetch(`${this.apiBaseURL}/preordenes/producto/${this.productoId}`);

            if (response.ok) {
                const preordenes = await response.json();
                this.mostrarPreordenesProducto(preordenes);
            } else {
                this.mostrarToast('No se pudieron cargar las preórdenes', 'error');
            }
        } catch (error) {
            console.error('Error cargando preórdenes:', error);
            this.mostrarToast('Error al cargar preórdenes', 'error');
        }
    }

    mostrarPreordenesProducto(preordenes) {
        this.mostrarToast(`Este producto tiene ${preordenes.length} preórdenes activas`, 'info');
    }

    contactarVendedor() {
        this.mostrarToast('Función de contacto en desarrollo', 'info');
    }

    async editarProducto() {
        try {
            console.log('✏️ Abriendo editor de producto');

            // Cargar categorías para el selector
            const categorias = await this.cargarCategorias();
            this.mostrarModalEditarProducto(categorias);

        } catch (error) {
            console.error('Error abriendo editor:', error);
            this.mostrarToast('Error al cargar editor de producto', 'error');
        }
    }

    async cargarCategorias() {
        try {
            console.log('📂 Cargando categorías para el editor...');
            const response = await fetch(`${this.apiBaseURL}/categorias`);

            if (response.ok) {
                const categorias = await response.json();
                console.log('✅ Categorías cargadas:', categorias.length);
                console.log('📋 Categorías disponibles:', categorias);
                return categorias;
            } else {
                console.error('❌ Error HTTP al cargar categorías:', response.status);
                throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error cargando categorías:', error);
            this.mostrarToast('Error al cargar categorías: ' + error.message, 'error');
            return [];
        }
    }

    mostrarModalEditarProducto(categorias) {
        const modal = document.createElement('div');
        modal.id = 'modal-editar-producto';
        modal.className = 'modal-overlay fullscreen-modal';
        modal.innerHTML = `
        <div class="modal-content editor-modal">
            <div class="modal-header editor-header">
                <h3>
                    <span class="modal-icon">✏️</span>
                    Editar Producto - ${this.producto.nombre}
                </h3>
                <button class="modal-close" onclick="productoDetalle.cerrarModalEditor()">×</button>
            </div>

            <div class="modal-body editor-body">
                <form id="form-editar-producto" class="editor-form">
                    <div class="editor-grid">
                        <!-- Información Básica -->
                        <div class="editor-section info-basica">
                            <h4>📝 Información Básica</h4>
                            
                            <div class="form-group">
                                <label for="edit-nombre">Nombre del Producto *</label>
                                <input type="text" id="edit-nombre" value="${this.producto.nombre || ''}" required maxlength="100">
                                <small class="form-help">Mínimo 3 caracteres</small>
                            </div>
            
                            <div class="form-group">
                                <label for="edit-descripcion">Descripción *</label>
                                <textarea id="edit-descripcion" rows="4" required maxlength="500">${this.producto.descripcion || ''}</textarea>
                                <small class="form-help">Mínimo 10 caracteres</small>
                            </div>
            
                            <div class="form-group">
                                <label for="edit-categoria">Categoría *</label>
                                <select id="edit-categoria" required>
                                    <option value="">Seleccionar categoría</option>
                                    ${categorias.map(cat => `
                                        <option value="${cat.id}" ${cat.id === this.producto.categoria?.id ? 'selected' : ''}>
                                            ${cat.nombre}
                                        </option>
                                    `).join('')}
                                </select>
                                <small class="form-help">Categoría actual: ${this.producto.categoria?.nombre || 'No definida'}</small>
                            </div>
                        </div>
            
                        <!-- Gestión de Imágenes -->
                        <div class="editor-section gestion-imagenes">
                            <h4>🖼️ Gestión de Imágenes</h4>
                            
                            <div class="current-images">
                                <label>Imágenes Actuales</label>
                                <div id="current-images-grid">
                                    ${this.renderCurrentImages()}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Información de Imágenes</label>
                                <div class="image-info-box">
                                    <p><strong>📸 Imágenes actuales:</strong> ${this.imagenes ? this.imagenes.length : 0}</p>
                                    <p><small>Para cambiar imágenes, contacta al administrador</small></p>
                                </div>
                            </div>
                        </div>
            
                        <!-- Precio y Stock -->
                        <div class="editor-section precio-estadisticas">
                            <h4>💰 Precio y Stock</h4>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="edit-precio">Precio *</label>
                                    <input type="number" id="edit-precio" step="0.01" min="0.01" value="${this.producto.precio || ''}" required>
                                    <small class="form-help">Precio en pesos colombianos</small>
                                </div>
                                <div class="form-group">
                                    <label for="edit-stock">Stock *</label>
                                    <input type="number" id="edit-stock" min="0" value="${this.producto.stock || 0}" required>
                                    <small class="form-help">Cantidad disponible</small>
                                </div>
                            </div>
                            
                            <div class="switches-container">
                                <div class="toggle-card">
                                    <div class="toggle-info-compact">
                                        <span class="toggle-title-compact">Preorden</span>
                                        <span class="toggle-description-compact">Producto bajo pedido</span>
                                    </div>
                                    <label class="toggle-switch-compact">
                                        <input type="checkbox" id="edit-espreorden" ${this.producto.espreorden ? 'checked' : ''}>
                                        <span class="toggle-slider-compact"></span>
                                    </label>
                                </div>
                            
                                <div class="toggle-card">
                                    <div class="toggle-info-compact">
                                        <span class="toggle-title-compact">Activo</span>
                                        <span class="toggle-description-compact">Producto visible</span>
                                    </div>
                                    <label class="toggle-switch-compact">
                                        <input type="checkbox" id="edit-activo" ${this.producto.activo ? 'checked' : ''}>
                                        <span class="toggle-slider-compact"></span>
                                    </label>
                                </div>
                            </div>

                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-label">ID Producto</span>
                                    <span class="stat-value">#${this.producto.id}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Creado</span>
                                    <span class="stat-value">${new Date(this.producto.fechacreacion).toLocaleDateString('es-ES')}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Vendedor</span>
                                    <span class="stat-value">${this.producto.vendedor?.nombre || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            
            <div class="modal-actions editor-actions">
                <button type="button" class="modal-btn danger" onclick="productoDetalle.confirmarEliminarProducto()">
                    <span class="btn-icon">🗑️</span>
                    Eliminar
                </button>
                <button type="button" class="modal-btn secondary" onclick="productoDetalle.cerrarModalEditor()">
                    <span class="btn-icon">❌</span>
                    Cancelar
                </button>
                <button type="button" class="modal-btn primary" onclick="productoDetalle.guardarCambiosProducto()">
                    <span class="btn-icon">💾</span>
                    Guardar Cambios
                </button>
            </div>
        </div>
    `;

        document.body.appendChild(modal);
        this.configurarModalEditor();
        this.animarModalEntrada(modal);
    }

    renderCurrentImages() {
        if (!this.imagenes || this.imagenes.length === 0) {
            return '<p class="no-images">No hay imágenes actuales</p>';
        }

        const imageCount = this.imagenes.length;
        const imagesHTML = this.imagenes.map((imagen, index) => `
        <div class="image-item">
            <img src="${this.apiBaseURL.replace('/api', '')}/imagenes-productos/${imagen}" alt="Imagen ${index + 1}">
            <button type="button" class="remove-image-btn" onclick="productoDetalle.eliminarImagenActual(${index})">×</button>
        </div>
    `).join('');

        return `<div class="images-grid" data-image-count="${imageCount}">${imagesHTML}</div>`;
    }

    configurarModalEditor() {
        // Configurar preview de nuevas imágenes
        const fileInput = document.getElementById('edit-nuevas-imagenes');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.mostrarPreviewImagenes(e.target.files);
            });
        }

        // Configurar drag and drop para nuevas imágenes (basado en categorias.js)
        const uploadArea = document.querySelector('.file-upload-area');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary-blue)';
                uploadArea.style.background = 'rgba(52, 152, 219, 0.1)';
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                uploadArea.style.background = 'rgba(255, 255, 255, 0.1)';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                uploadArea.style.background = 'rgba(255, 255, 255, 0.1)';

                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    // Asignar archivos al input
                    fileInput.files = files;
                    this.mostrarPreviewImagenes(files);
                }
            });
        }

        // Configurar auto-resize del grid de imágenes
        this.actualizarGridImagenes();

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';

        // Cerrar con ESC
        this.editorKeyHandler = (e) => {
            if (e.key === 'Escape') {
                this.cerrarModalEditor();
            }
        };
        document.addEventListener('keydown', this.editorKeyHandler);
    }

// Nueva función para actualizar el grid
    actualizarGridImagenes() {
        const currentImagesGrid = document.getElementById('current-images-grid');
        if (currentImagesGrid && this.imagenes) {
            const imageCount = this.imagenes.length;
            const gridContainer = currentImagesGrid.querySelector('.images-grid');
            if (gridContainer) {
                gridContainer.setAttribute('data-image-count', imageCount);

                // Forzar re-render del grid después de un pequeño delay
                setTimeout(() => {
                    gridContainer.style.display = 'none';
                    gridContainer.offsetHeight; // Trigger reflow
                    gridContainer.style.display = 'grid';
                }, 100);
            }
        }
    }

    mostrarPreviewImagenes(files) {
        const previewContainer = document.getElementById('preview-images');
        const previewGrid = document.getElementById('preview-grid');

        if (!previewContainer || !previewGrid) {
            console.warn('Contenedores de preview no encontrados');
            return;
        }

        if (files.length === 0) {
            previewContainer.style.display = 'none';
            return;
        }

        previewContainer.style.display = 'block';
        previewGrid.innerHTML = '';

        // Validaciones antes de mostrar preview
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        let validFiles = 0;

        Array.from(files).forEach((file, index) => {
            // Validar tamaño
            if (file.size > maxSize) {
                this.mostrarToast(`Imagen ${file.name} muy grande (máx. 5MB)`, 'warning');
                return;
            }

            // Validar tipo
            if (!allowedTypes.includes(file.type)) {
                this.mostrarToast(`Formato no válido: ${file.name}`, 'warning');
                return;
            }

            validFiles++;

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageItem = document.createElement('div');
                imageItem.className = 'image-item preview-item';
                imageItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${index + 1}">
                <div class="image-info">
                    <small>${file.name}</small>
                    <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
                </div>
                <button type="button" class="remove-preview-btn" onclick="this.parentElement.remove()">×</button>
            `;
                previewGrid.appendChild(imageItem);

                // Animar entrada
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(imageItem,
                        { opacity: 0, scale: 0.8 },
                        { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
                    );
                }
            };
            reader.readAsDataURL(file);
        });

        if (validFiles === 0) {
            previewContainer.style.display = 'none';
            this.mostrarToast('No se seleccionaron imágenes válidas', 'warning');
        }
    }

    async guardarCambiosProducto() {
        try {
            console.log('💾 Iniciando guardado de cambios...');

            // OBTENER VALORES CON VALIDACIÓN EXPLÍCITA
            const nombre = document.getElementById('edit-nombre')?.value?.trim();
            const descripcion = document.getElementById('edit-descripcion')?.value?.trim();
            const precioInput = document.getElementById('edit-precio')?.value;
            const stockInput = document.getElementById('edit-stock')?.value;
            const categoriaInput = document.getElementById('edit-categoria')?.value;
            const espreorden = document.getElementById('edit-espreorden')?.checked || false;
            const activo = document.getElementById('edit-activo')?.checked || false;

            console.log('🔍 Valores obtenidos del formulario:');
            console.log('- Nombre:', nombre);
            console.log('- Descripción:', descripcion);
            console.log('- Precio input:', precioInput);
            console.log('- Stock input:', stockInput);
            console.log('- Categoria input:', categoriaInput);
            console.log('- Espreorden:', espreorden);
            console.log('- Activo:', activo);

            // VALIDACIONES MEJORADAS
            if (!nombre || nombre.length < 3) {
                this.mostrarToast('El nombre debe tener al menos 3 caracteres', 'warning');
                return;
            }

            if (!descripcion || descripcion.length < 10) {
                this.mostrarToast('La descripción debe tener al menos 10 caracteres', 'warning');
                return;
            }

            const precio = parseFloat(precioInput);
            if (isNaN(precio) || precio <= 0) {
                this.mostrarToast('El precio debe ser un número mayor a 0', 'warning');
                return;
            }

            const stock = parseInt(stockInput);
            if (isNaN(stock) || stock < 0) {
                this.mostrarToast('El stock no puede ser negativo', 'warning');
                return;
            }

            const categoriaId = parseInt(categoriaInput);
            if (isNaN(categoriaId) || categoriaId <= 0) {
                this.mostrarToast('Debe seleccionar una categoría válida', 'warning');
                console.error('❌ Error en categoría:', {
                    categoriaInput,
                    categoriaId,
                    isNaN: isNaN(categoriaId)
                });
                return;
            }

            const vendedorId = this.producto.vendedor?.id || this.usuario.user?.id || this.usuario.id;
            if (!vendedorId) {
                this.mostrarToast('Error: No se pudo identificar el vendedor', 'error');
                return;
            }

            // ESTRUCTURA CORRECTA BASADA EN CATEGORIAS.JS
            const datosProducto = {
                id: parseInt(this.productoId),
                nombre: nombre,
                descripcion: descripcion,
                precio: precio,
                stock: stock,
                categoria: { id: categoriaId }, // ESTRUCTURA ANIDADA COMO EN CATEGORIAS.JS
                vendedor: { id: vendedorId },   // ESTRUCTURA ANIDADA COMO EN CATEGORIAS.JS
                activo: activo,
                espreorden: espreorden,
                fechacreacion: this.producto.fechacreacion, // PRESERVAR FECHA ORIGINAL
                imagen: this.producto.imagen // PRESERVAR IMÁGENES EXISTENTES
            };

            console.log('📦 Datos finales a enviar:', datosProducto);
            console.log('✅ Datos validados correctamente');

            // Deshabilitar botón mientras se guarda
            const btnGuardar = document.querySelector('.modal-btn.primary');
            const textoOriginal = btnGuardar.innerHTML;
            btnGuardar.disabled = true;
            btnGuardar.innerHTML = '<span class="btn-icon">⏳</span>Guardando...';

            console.log('🌐 Enviando datos al servidor...');
            console.log('📍 URL:', `${this.apiBaseURL}/productos/${this.productoId}`);

            // USAR JSON CON HEADERS CORRECTOS
            const response = await fetch(`${this.apiBaseURL}/productos/${this.productoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(datosProducto)
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Producto actualizado:', result);

                this.mostrarToast('Producto actualizado exitosamente', 'success');
                this.cerrarModalEditor();

                // Recargar la página para mostrar los cambios
                setTimeout(() => {
                    window.location.reload();
                }, 1000);

            } else {
                // Manejo mejorado de errores
                let errorMessage = 'Error al actualizar producto';
                let errorDetails = null;

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                    errorDetails = errorData.details || null;
                    console.log('❌ Error del servidor:', errorData);
                } catch (e) {
                    console.log('❌ No se pudo parsear el error del servidor');
                    errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
                }

                // Mostrar detalles específicos del error
                if (errorDetails) {
                    console.error('❌ Detalles del error:', errorDetails);
                }

                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error('❌ Error guardando cambios:', error);

            // Mostrar error específico
            let mensajeError = 'Error al guardar cambios';
            if (error.message.includes('categoriaid')) {
                mensajeError = 'Error con la categoría seleccionada. Verifica que hayas seleccionado una categoría válida.';
            } else if (error.message.includes('500')) {
                mensajeError = 'Error interno del servidor. Verifica que todos los campos estén correctos.';
            } else if (error.message.includes('400')) {
                mensajeError = 'Datos inválidos. Revisa los campos del formulario.';
            } else {
                mensajeError = error.message;
            }

            this.mostrarToast(mensajeError, 'error');

            // Rehabilitar botón
            const btnGuardar = document.querySelector('.modal-btn.primary');
            if (btnGuardar) {
                btnGuardar.disabled = false;
                btnGuardar.innerHTML = '<span class="btn-icon">💾</span>Guardar Cambios';
            }
        }
    }

    async confirmarEliminarProducto() {
        const confirmar = confirm(`¿Estás seguro de que deseas eliminar el producto "${this.producto.nombre}"?\n\nEsta acción no se puede deshacer.`);

        if (confirmar) {
            try {
                const response = await fetch(`${this.apiBaseURL}/productos/eliminar-completo/${this.productoId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    this.mostrarToast('Producto eliminado exitosamente', 'success');
                    this.cerrarModalEditor();

                    // Redirigir a categorías después de eliminar
                    setTimeout(() => {
                        window.location.href = '/categorias';
                    }, 1000);

                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al eliminar producto');
                }

            } catch (error) {
                console.error('❌ Error eliminando producto:', error);
                this.mostrarToast('Error al eliminar producto: ' + error.message, 'error');
            }
        }
    }

    eliminarImagenActual(index) {
        // Implementar lógica para eliminar imagen específica
        this.mostrarToast('Función de eliminar imagen individual en desarrollo', 'info');
    }

    animarModalEntrada(modal) {
        if (typeof gsap !== 'undefined') {
            gsap.set(modal, { opacity: 0 });
            gsap.to(modal, { opacity: 1, duration: 0.4, ease: "power2.out" });

            const modalContent = modal.querySelector('.modal-content');
            gsap.fromTo(modalContent,
                {
                    opacity: 0,
                    scale: 0.8,
                    y: 50
                },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "back.out(1.7)",
                    delay: 0.1
                }
            );
        }
    }

    cerrarModalEditor() {
        const modal = document.getElementById('modal-editar-producto');
        if (modal) {
            if (typeof gsap !== 'undefined') {
                gsap.to(modal.querySelector('.modal-content'), {
                    opacity: 0,
                    scale: 0.8,
                    y: 50,
                    duration: 0.3,
                    ease: "power2.in"
                });

                gsap.to(modal, {
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.in",
                    delay: 0.1,
                    onComplete: () => {
                        modal.remove();
                        document.body.style.overflow = '';
                        if (this.editorKeyHandler) {
                            document.removeEventListener('keydown', this.editorKeyHandler);
                        }
                    }
                });
            } else {
                modal.remove();
                document.body.style.overflow = '';
                if (this.editorKeyHandler) {
                    document.removeEventListener('keydown', this.editorKeyHandler);
                }
            }
        }
    }

    verMetricas() {
        this.mostrarToast('Función de métricas en desarrollo', 'info');
    }

    async toggleEstadoProducto() {
        try {
            const nuevoEstado = !this.producto.activo;
            const accion = nuevoEstado ? 'activar' : 'desactivar';

            const confirmar = confirm(`¿Estás seguro de que deseas ${accion} este producto?`);

            if (confirmar) {
                console.log('🔄 Cambiando estado del producto...');

                const datosActualizacion = {
                    ...this.producto,
                    activo: nuevoEstado
                };

                const response = await fetch(`${this.apiBaseURL}/productos/${this.productoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosActualizacion)
                });

                if (response.ok) {
                    this.producto.activo = nuevoEstado;
                    this.mostrarToast(`Producto ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`, 'success');

                    // Actualizar el botón
                    this.configurarAcciones();

                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al cambiar estado del producto');
                }
            }

        } catch (error) {
            console.error('❌ Error cambiando estado:', error);
            this.mostrarToast('Error al cambiar estado del producto: ' + error.message, 'error');
        }
    }

    // ==================== NAVEGACIÓN DE IMÁGENES ====================

    imagenAnterior() {
        if (this.imagenes.length <= 1) return;

        const newIndex = this.currentImageIndex === 0
            ? this.imagenes.length - 1
            : this.currentImageIndex - 1;

        this.mostrarImagenPrincipal(newIndex);
    }

    imagenSiguiente() {
        if (this.imagenes.length <= 1) return;

        const newIndex = this.currentImageIndex === this.imagenes.length - 1
            ? 0
            : this.currentImageIndex + 1;

        this.mostrarImagenPrincipal(newIndex);
    }

    toggleZoom() {
        const mainImage = document.getElementById('main-image');
        const isZoomed = mainImage.style.transform.includes('scale');

        if (isZoomed) {
            gsap.to(mainImage, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            gsap.to(mainImage, {
                scale: 1.5,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }

    // ==================== UTILIDADES ====================

    mostrarLoading() {
        document.getElementById('loadingScreen').style.display = 'flex';
    }

    ocultarLoading() {
        const loadingScreen = document.getElementById('loadingScreen');

        if (!loadingScreen) {
            console.warn('Loading screen no encontrado');
            return;
        }

        if (typeof gsap !== 'undefined') {
            gsap.to(loadingScreen, {
                opacity: 0,
                scale: 0.8,
                duration: 0.5,
                ease: "power2.out",
                onComplete: () => {
                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                    }
                }
            });
        } else {
            loadingScreen.style.display = 'none';
        }
    }

    mostrarError(mensaje) {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
                <h1 style="color: var(--accent-red); margin-bottom: 1rem;">❌ Error</h1>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">${mensaje}</p>
                <button onclick="window.location.href='/categorias'" style="padding: 1rem 2rem; background: var(--primary-blue); color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Volver a Categorías
                </button>
            </div>
        `;
    }

    mostrarToast(mensaje, tipo = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.textContent = mensaje;

        container.appendChild(toast);

        // Animar entrada
        gsap.to(toast, {
            x: 0,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(1.7)"
        });

        // Eliminar después de 3 segundos
        setTimeout(() => {
            gsap.to(toast, {
                x: 400,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    if (container.contains(toast)) {
                        container.removeChild(toast);
                    }
                }
            });
        }, 3000);
    }

    // Función para validar datos antes del envío (basada en categorias.js)
    validarDatosProducto(datos) {
        const errores = [];

        if (!datos.nombre || datos.nombre.length < 3) {
            errores.push('El nombre debe tener al menos 3 caracteres');
        }

        if (!datos.descripcion || datos.descripcion.length < 10) {
            errores.push('La descripción debe tener al menos 10 caracteres');
        }

        if (isNaN(datos.precio) || datos.precio <= 0) {
            errores.push('El precio debe ser un número mayor a 0');
        }

        if (isNaN(datos.stock) || datos.stock < 0) {
            errores.push('El stock no puede ser negativo');
        }

        if (isNaN(datos.categoriaId) || datos.categoriaId <= 0) {
            errores.push('Debe seleccionar una categoría válida');
        }

        return errores;
    }

    // Función de debug para verificar formulario
    debugFormulario() {
        console.log('🔍 DEBUG - Estado del formulario:');
        console.log('- Nombre:', document.getElementById('edit-nombre')?.value);
        console.log('- Descripción:', document.getElementById('edit-descripcion')?.value);
        console.log('- Precio:', document.getElementById('edit-precio')?.value);
        console.log('- Stock:', document.getElementById('edit-stock')?.value);
        console.log('- Categoría:', document.getElementById('edit-categoria')?.value);
        console.log('- Espreorden:', document.getElementById('edit-espreorden')?.checked);
        console.log('- Activo:', document.getElementById('edit-activo')?.checked);

        // Verificar select de categorías
        const selectCategoria = document.getElementById('edit-categoria');
        if (selectCategoria) {
            console.log('- Select categoría encontrado:', selectCategoria);
            console.log('- Opciones disponibles:', selectCategoria.options.length);
            console.log('- Valor seleccionado:', selectCategoria.value);
            console.log('- Índice seleccionado:', selectCategoria.selectedIndex);

            Array.from(selectCategoria.options).forEach((option, index) => {
                console.log(`  Opción ${index}: value="${option.value}", text="${option.text}", selected=${option.selected}`);
            });
        } else {
            console.error('❌ Select de categoría no encontrado');
        }
    }

    // ==================== BOTÓN DE CARRITO EN HEADER ====================

    async agregarBotonCarritoHeader() {
        const cartContainer = document.getElementById('cart-button-container');

        // Crear botón de carrito
        const cartButton = document.createElement('button');
        cartButton.id = 'header-cart-btn';
        cartButton.className = 'cart-button';
        cartButton.innerHTML = `
        <span class="cart-icon">🛒</span>
        <span class="cart-count hidden" id="cart-count">0</span>
    `;

        // Event listener para redireccionar
        cartButton.addEventListener('click', () => {
            this.irAlCarrito();
        });

        cartContainer.appendChild(cartButton);

        // Cargar contador inicial
        await this.actualizarContadorCarritoHeader();

        // Animar entrada del botón
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(cartButton,
                {
                    scale: 0,
                    rotation: -180,
                    opacity: 0
                },
                {
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: "back.out(1.7)",
                    delay: 0.5
                }
            );
        }
    }

    async actualizarContadorCarritoHeader() {
        try {
            const response = await fetch(`${this.apiBaseURL}/carrito/contar/${this.usuario.user.id}`);

            if (response.ok) {
                const result = await response.json();
                const cartCount = document.getElementById('cart-count');
                const cantidadTotal = result.cantidadProductos || 0;

                if (cartCount) {
                    cartCount.textContent = cantidadTotal;

                    if (cantidadTotal > 0) {
                        cartCount.classList.remove('hidden');

                        // Animar actualización del contador
                        if (typeof gsap !== 'undefined') {
                            gsap.fromTo(cartCount,
                                { scale: 1.5, backgroundColor: '#27ae60' },
                                { scale: 1, backgroundColor: '#e74c3c', duration: 0.5, ease: "back.out(1.7)" }
                            );
                        }
                    } else {
                        cartCount.classList.add('hidden');
                    }
                }

                console.log('✅ Contador de carrito actualizado:', cantidadTotal);
            }
        } catch (error) {
            console.error('❌ Error actualizando contador carrito header:', error);
        }
    }

    irAlCarrito() {
        console.log('🛒 Redirigiendo al carrito...');

        // Animación de salida del botón
        const cartButton = document.getElementById('header-cart-btn');
        if (cartButton && typeof gsap !== 'undefined') {
            gsap.to(cartButton, {
                scale: 1.2,
                rotation: 360,
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {
                    // Redirigir después de la animación
                    window.location.href = 'http://localhost:3000/carrito';
                }
            });
        } else {
            // Redirigir directamente si no hay GSAP
            window.location.href = 'http://localhost:3000/carrito';
        }
    }

}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.productoDetalle = new ProductoDetalle();
});
