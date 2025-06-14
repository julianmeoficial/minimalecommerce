/* blog.js - Sistema Premium de Blog con Optimización para Lectura */

class BlogManager {
    constructor() {
        // Configuración base
        this.articulos = [];
        this.articulosFiltrados = [];
        this.categorias = [];
        this.currentFilter = 'all';
        this.currentSort = 'recent';
        this.currentView = 'grid';
        this.isLoading = false;
        this.isEditing = false;
        this.currentArticle = null;
        this.tipoUsuario = 'COMPRADOR';
        this.usuarioActual = null;

        // Configuración API
        this.apiBaseURL = 'http://localhost:8080/api';
        this.config = {
            itemsPerPage: 12,
            autoRefresh: 30000,
            maxRetries: 3
        };

        // Flags de control
        this.initialized = false;
        this.listenersConfigured = false;
        this.permisosAplicados = false;
        this.userTypeDetected = false;
        this.actionButtonsConfigured = false;
        this.delegatedListenersConfigured = false;
        this.modalOpenRequested = false;
        this.filterTimeout = null;
        this.searchTimeout = null;

        // Inicialización
        this.init();
    }

    async init() {
        // Evitar inicialización múltiple
        if (this.initialized) {
            console.log('⚠️ BlogManager ya inicializado, saltando...');
            return;
        }

        console.log('📰 Iniciando sistema de blog premium...');

        try {
            // Inicializar flags
            this.initialized = false;
            this.listenersConfigured = false;
            this.permisosAplicados = false;
            this.userTypeDetected = false;
            this.actionButtonsConfigured = false;

            // Mostrar loading
            this.mostrarLoadingScreen();

            // Verificar autenticación y detectar usuario
            await this.verificarAutenticacion();
            await this.cargarDatosUsuario();

            // Configurar event listeners
            this.setupEventListeners();
            this.setupTimeDisplay();

            // Cargar datos
            await this.cargarCategorias();
            await this.cargarArticulos();

                        // NO configurar botones automáticamente para evitar apertura del modal
            // this.setupActionButtons(); // COMENTADO TEMPORALMENTE

            // Configurar solo después de interacción del usuario
            setTimeout(() => {
                if (this.tipoUsuario === 'VENDEDOR') {
                    this.configurarBotonesVendedor();
                }
            }, 2000); // 2 segundos de delay para evitar auto-apertura


            // Configurar animaciones
            this.setupAnimaciones();

            // Personalizar interfaz
            this.personalizarInterfaz();

            // Detectar alto contraste
            this.detectarAltaContrasacion();

            // Ocultar loading y mostrar contenido
            this.ocultarLoadingScreen();
            this.forzarVisibilidadContenido();

            // Actualizar componentes UI después de cargar todo
            this.actualizarComponentesUI();

            // Marcar como inicializado
            this.initialized = true;
            console.log('✅ BlogManager inicializado correctamente');

        } catch (error) {
            console.error('❌ Error iniciando sistema de blog:', error);
            this.ocultarLoadingScreen();
            this.mostrarToast('Error al cargar el sistema de blog', 'error');

            // Mostrar contenido básico sin animaciones
            setTimeout(() => {
                this.forzarVisibilidadContenido();
            }, 500);
        }
    }

    async verificarAutenticacion() {
        // Verificar autenticación PRIMERO (igual que categorias.js)
        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');

        if (userSession) {
            try {
                this.usuarioActual = JSON.parse(userSession);
                console.log('👤 Usuario autenticado:', this.usuarioActual);

                if (this.usuarioActual && this.usuarioActual.user) {
                    // Detectar tipo de usuario (IGUAL que categorias.js)
                    this.tipoUsuario = (
                        this.usuarioActual.user?.tipoUsuario ||
                        this.usuarioActual.user?.tipousuario ||
                        'COMPRADOR'
                    ).toUpperCase();

                    console.log('🔍 Tipo de usuario detectado:', this.tipoUsuario);
                } else {
                    this.tipoUsuario = 'COMPRADOR';
                }
            } catch (error) {
                console.error('Error parsing user session:', error);
                this.tipoUsuario = 'COMPRADOR';
            }
        } else {
            this.tipoUsuario = 'COMPRADOR';
        }

        // Aplicar al body para CSS (igual que categorias.js)
        document.body.setAttribute('data-user-type', this.tipoUsuario);
        console.log('✅ Body data-user-type aplicado:', this.tipoUsuario);

        // Marcar como detectado
        this.userTypeDetected = true;

        // Aplicar permisos SOLO UNA VEZ
        setTimeout(() => {
            this.aplicarPermisosPorTipoUsuario();
        }, 100);
    }

    async cargarDatosUsuario() {
        if (this.usuarioActual && this.usuarioActual.user) {
            console.log('📊 Datos de usuario cargados:', this.usuarioActual.user.nombre);
        }
    }

    async cargarCategorias() {
        try {
            console.log('📥 Cargando categorías...');

            const response = await fetch(`${this.apiBaseURL}/categorias`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.categorias = await response.json();
                console.log(`✅ ${this.categorias.length} categorías cargadas`);
                this.renderizarCategorias();
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error cargando categorías:', error);
            this.categorias = [];
        }
    }

    async cargarArticulos() {
        try {
            console.log('📥 Cargando artículos...');

            let endpoint;
            if (this.tipoUsuario === 'VENDEDOR') {
                // Para vendedores: todos sus artículos (publicados y borradores)
                endpoint = `${this.apiBaseURL}/blogs/autor/${this.usuarioActual.user.id}`;
            } else {
                // Para compradores: solo artículos publicados
                endpoint = `${this.apiBaseURL}/blogs`;
            }

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const articulosRaw = await response.json();
                console.log(`✅ ${articulosRaw.length} artículos cargados para ${this.tipoUsuario}`);

                // Procesar artículos para agregar propiedades necesarias
                this.articulos = articulosRaw.map(articulo => this.procesarArticulo(articulo));

                this.aplicarFiltros();

                if (this.tipoUsuario === 'VENDEDOR') {
                    this.actualizarEstadisticas();
                } else {
                    this.cargarArticulosPopulares();
                }
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error cargando artículos:', error);
            this.articulos = [];
            this.mostrarEstadoVacio('Error al cargar artículos', 'Intenta recargar la página');
        }
    }

    procesarArticulo(articulo) {
        // Mapear campos del backend según la estructura de la base de datos
        return {
            ...articulo,
            // Mapear autorid a autor (manejo seguro)
            autor: articulo.autorid ? {
                id: articulo.autorid.id || articulo.autorid,
                nombre: articulo.autorid.nombre || articulo.autorid.username || 'Autor desconocido'
            } : { id: null, nombre: 'Autor desconocido' },

            // Mapear categoriaid a categoria (manejo seguro)
            categoria: articulo.categoriaid ? {
                id: articulo.categoriaid.id || articulo.categoriaid,
                nombre: articulo.categoriaid.nombre || 'General'
            } : { id: null, nombre: 'General' },

            // Asegurar fechapublicacion
            fechapublicacion: articulo.fechapublicacion || new Date().toISOString(),

            // Asegurar campos requeridos
            titulo: articulo.titulo || 'Sin título',
            resumen: articulo.resumen || 'Sin resumen',
            contenido: articulo.contenido || '',
            publicado: articulo.publicado || false,
            imagen: articulo.imagen || null,

            // Calcular tiempo de lectura
            tiempoLectura: this.calcularTiempoLectura(articulo.contenido || ''),

            // Formatear fecha
            fechaFormateada: this.formatearFecha(new Date(articulo.fechapublicacion || new Date()))
        };
    }

    setupEventListeners() {
        // Evitar configurar múltiples veces
        if (this.listenersConfigured) {
            console.log('⚠️ Event listeners ya configurados, saltando...');
            return;
        }

        // Búsqueda con debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                // Limpiar timeout anterior
                if (this.searchTimeout) {
                    clearTimeout(this.searchTimeout);
                }

                // Ejecutar búsqueda después de 300ms sin escribir
                this.searchTimeout = setTimeout(() => {
                    this.buscarArticulos(e.target.value);
                }, 300);
            });
        }

        // Ordenamiento
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.cambiarOrdenamiento(e.target.value);
            });
        }

        // Modos de vista
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    const view = e.target.dataset.view;
                    if (view) {
                        this.cambiarVista(view);
                    }
                } catch (error) {
                    console.error('Error en cambio de vista:', error);
                }
            });
        });

        // Configurar delegación de eventos dinámicos
        this.setupDelegatedEventListeners();

        // Modal handlers
        this.setupModalHandlers();

        // Marcar como configurado
        this.listenersConfigured = true;
        console.log('🔧 Event listeners configurados correctamente');
    }

    setupDelegatedEventListeners() {
        // Evitar configurar múltiples veces
        if (this.delegatedListenersConfigured) {
            console.log('⚠️ Event listeners delegados ya configurados, saltando...');
            return;
        }

        // Delegación de eventos para botones dinámicos
        this.handleDelegatedClick = (e) => {
            // Filtros de categoría
            if (e.target.closest('.category-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const categoria = e.target.closest('.category-btn').dataset.category;
                if (categoria) {
                    this.filtrarPorCategoria(categoria);
                }
            }

            // Quick actions para vendedores
            if (e.target.closest('.quick-action-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const filter = e.target.closest('.quick-action-btn').dataset.filter;
                if (filter) {
                    this.filtrarPorEstado(filter);
                }
            }

            // Ver artículo
            if (e.target.closest('.article-card') && !e.target.closest('.action-btn-small')) {
                e.preventDefault();
                e.stopPropagation();
                const articleId = e.target.closest('.article-card').dataset.articleId;
                if (articleId) {
                    console.log('📖 Click en artículo:', articleId);
                    this.verArticulo(articleId);
                }
            }

            // Botones de acción en artículos
            if (e.target.closest('.action-btn-small')) {
                e.preventDefault();
                e.stopPropagation();
                const action = e.target.closest('.action-btn-small').dataset.action;
                const articleId = e.target.closest('.article-card')?.dataset.articleId;
                if (action && articleId) {
                    this.ejecutarAccionArticulo(action, articleId);
                }
            }
        };

        document.addEventListener('click', this.handleDelegatedClick);
        this.delegatedListenersConfigured = true;
        console.log('🎯 Event listeners delegados configurados');
    }

    setupModalHandlers() {
        // Modal de editor
        const closeEditorModal = document.getElementById('closeEditorModal');
        if (closeEditorModal) {
            closeEditorModal.addEventListener('click', () => {
                this.cerrarEditor();
            });
        }

        // Botón volver al blog
        const btnBackToBlog = document.getElementById('btnBackToBlog');
        if (btnBackToBlog) {
            btnBackToBlog.addEventListener('click', () => {
                this.volverAlBlog();
            });
        }

        // Botón compartir artículo
        const btnShareArticle = document.getElementById('btnShareArticle');
        if (btnShareArticle) {
            btnShareArticle.addEventListener('click', () => {
                if (this.currentArticle) {
                    this.compartirArticulo(this.currentArticle.id);
                }
            });
        }

        // Modal de compartir
        const closeShareModal = document.getElementById('closeShareModal');
        if (closeShareModal) {
            closeShareModal.addEventListener('click', () => {
                this.cerrarModal('shareModal');
            });
        }

        // Cerrar modals con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarTodosLosModals();
            }
        });

        // Cerrar modals clickeando fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-editor') ||
                e.target.classList.contains('modal-share')) {
                this.cerrarTodosLosModals();
            }
        });
    }

    setupTimeDisplay() {
        // Actualizar tiempo cada minuto
        setInterval(() => {
            this.actualizarTiemposRelativos();
        }, 60000);
    }

    setupAnimaciones() {
        // Verificar que GSAP esté disponible
        if (typeof gsap === 'undefined') {
            console.warn('GSAP no está disponible');
            return;
        }

        try {
            // Registrar plugins de GSAP si están disponibles
            if (typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
            }
            if (typeof TextPlugin !== 'undefined') {
                gsap.registerPlugin(TextPlugin);
            }

            // Configurar elementos iniciales solo si existen
            const blogElements = document.querySelectorAll('.blog-container > *');
            if (blogElements.length > 0) {
                gsap.set(blogElements, { opacity: 0, y: 30 });
            }
        } catch (error) {
            console.warn('Error configurando animaciones GSAP:', error);
        }
    }

    aplicarPermisosPorTipoUsuario() {
        // Evitar ejecutar múltiples veces
        if (this.permisosAplicados) {
            console.log('⚠️ Permisos ya aplicados, saltando...');
            return;
        }

        console.log(`🔒 Aplicando permisos para tipo de usuario: ${this.tipoUsuario}`);

        // Mostrar/ocultar elementos según el tipo de usuario
        const vendedorElements = document.querySelectorAll('.vendedor-only');
        const compradorElements = document.querySelectorAll('.comprador-only');

        vendedorElements.forEach(element => {
            if (this.tipoUsuario === 'VENDEDOR') {
                element.style.display = '';
                element.classList.remove('hidden');
            } else {
                element.style.display = 'none';
                element.classList.add('hidden');
            }
        });

        compradorElements.forEach(element => {
            if (this.tipoUsuario === 'COMPRADOR') {
                element.style.display = '';
                element.classList.remove('hidden');
            } else {
                element.style.display = 'none';
                element.classList.add('hidden');
            }
        });

        // Configurar header según tipo de usuario
        this.configurarHeaderPorTipoUsuario();

        // Marcar como aplicado
        this.permisosAplicados = true;
        console.log(`✅ Permisos aplicados para: ${this.tipoUsuario}`);
    }

    configurarHeaderPorTipoUsuario() {
        const pageTitle = document.querySelector('.title-text');
        const dashboard = document.getElementById('vendorDashboard');

        if (this.tipoUsuario === 'VENDEDOR') {
            if (pageTitle) pageTitle.textContent = 'Mi Blog Editorial';
            if (dashboard) dashboard.style.display = 'block';
        } else {
            if (pageTitle) pageTitle.textContent = 'Blog Premium';
            if (dashboard) dashboard.style.display = 'none';
        }
    }

    setupActionButtons() {
        // Solo configurar si es vendedor y no está ya configurado
        if (this.tipoUsuario === 'VENDEDOR' && !this.actionButtonsConfigured) {
            const btnNuevoArticulo = document.getElementById('btnNuevoArticulo');
            if (btnNuevoArticulo) {
                // Remover listeners existentes
                btnNuevoArticulo.removeEventListener('click', this.handleNuevoArticuloClick);

                // Crear función bound para poder removerla después
                this.handleNuevoArticuloClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // VERIFICACIÓN ESTRICTA: Solo clicks reales y confiables
                    if (!e.isTrusted || e.type !== 'click') {
                        console.log('⚠️ Click no confiable detectado - IGNORADO');
                        return;
                    }

                    console.log('🆕 Click REAL en Nuevo Artículo - Vendedor ID:', this.usuarioActual.user.id);
                    this.abrirEditor();
                };

                btnNuevoArticulo.addEventListener('click', this.handleNuevoArticuloClick);
                btnNuevoArticulo.style.display = 'flex';

                // Configurar botón empty state también
                this.setupEmptyStateButton();

                this.actionButtonsConfigured = true;
                console.log('✅ Botón Nuevo Artículo configurado para VENDEDOR');
            }
        } else if (this.tipoUsuario === 'COMPRADOR') {
            const btnNuevoArticulo = document.getElementById('btnNuevoArticulo');
            if (btnNuevoArticulo) {
                btnNuevoArticulo.style.display = 'none';
            }
        }
    }

    configurarBotonesVendedor() {
        const btnNuevoArticulo = document.getElementById('btnNuevoArticulo');
        if (btnNuevoArticulo && !this.actionButtonsConfigured) {
            btnNuevoArticulo.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🆕 Click MANUAL en Nuevo Artículo');
                this.abrirEditor();
            });

            btnNuevoArticulo.style.display = 'flex';
            this.actionButtonsConfigured = true;
            console.log('✅ Botón configurado SIN auto-apertura');
        }
    }

    setupEmptyStateButton() {
        const emptyStateBtn = document.getElementById('emptyStateAction');
        if (emptyStateBtn && this.tipoUsuario === 'VENDEDOR') {
            // Verificar que no tenga onclick en HTML
            emptyStateBtn.removeAttribute('onclick');

            // Remover listeners existentes
            emptyStateBtn.removeEventListener('click', this.handleEmptyStateClick);

            this.handleEmptyStateClick = (e) => {
                e.preventDefault();
                e.stopPropagation();

                // VERIFICACIÓN ESTRICTA: Solo clicks reales del usuario
                if (!e.isTrusted || e.type !== 'click') {
                    console.log('⚠️ Click en empty state no confiable - IGNORADO');
                    return;
                }

                console.log('🆕 Click REAL en botón empty state');
                this.abrirEditor();
            };

            emptyStateBtn.addEventListener('click', this.handleEmptyStateClick);
            console.log('✅ Botón empty state configurado');
        }
    }

    // Continuación de la PRIMERA PARTE...

    personalizarInterfaz() {
        // Personalizar según tipo de usuario
        if (this.tipoUsuario === 'VENDEDOR') {
            this.personalizarParaVendedor();
        } else {
            this.personalizarParaComprador();
        }
    }

    personalizarParaVendedor() {
        // Cambiar textos para vendedores
        const motivationTitle = document.getElementById('motivationTitle');
        const motivationDesc = document.getElementById('motivationDesc');
        const motivationBtnText = document.getElementById('motivationBtnText');

        if (motivationTitle) motivationTitle.textContent = '¡Crea contenido increíble!';
        if (motivationDesc) motivationDesc.textContent = 'Comparte tu experiencia y conecta con más clientes';
        if (motivationBtnText) motivationBtnText.textContent = 'Ver Mis Productos';
    }

    personalizarParaComprador() {
        // Mantener textos originales para compradores
        const motivationTitle = document.getElementById('motivationTitle');
        const motivationDesc = document.getElementById('motivationDesc');
        const motivationBtnText = document.getElementById('motivationBtnText');

        if (motivationTitle) motivationTitle.textContent = '¡Explora y aprende algo nuevo!';
        if (motivationDesc) motivationDesc.textContent = 'Descubre productos increíbles inspirados en nuestros artículos';
        if (motivationBtnText) motivationBtnText.textContent = 'Explorar Categorías';
    }

    detectarAltaContrasacion() {
        // Detectar preferencias de accesibilidad
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
    }

    // ==================== RENDERIZADO Y FILTROS ====================

    renderizarCategorias() {
        const container = document.getElementById('categoriesFilter');
        if (!container) return;

        // Botón "Todas" siempre presente
        let html = `
            <button class="category-btn active" data-category="all" aria-pressed="true">
                <span class="category-icon">📚</span>
                <span class="category-name">Todas</span>
                <span class="category-count" id="countAll">${this.articulos.length}</span>
            </button>
        `;

        // Agregar categorías dinámicas
        this.categorias.forEach(categoria => {
            const count = this.articulos.filter(art =>
                art.categoria && art.categoria.id === categoria.id
            ).length;

            html += `
                <button class="category-btn" data-category="${categoria.id}" aria-pressed="false">
                    <span class="category-icon">${this.getCategoriaIcon(categoria.nombre)}</span>
                    <span class="category-name">${categoria.nombre}</span>
                    <span class="category-count">${count}</span>
                </button>
            `;
        });

        container.innerHTML = html;
        console.log(`📂 ${this.categorias.length} categorías renderizadas`);
    }

    getCategoriaIcon(nombre) {
        const iconos = {
            'Tecnología': '💻',
            'Moda': '👗',
            'Hogar': '🏠',
            'Deportes': '⚽',
            'Salud': '🏥',
            'Educación': '📚',
            'Viajes': '✈️',
            'Comida': '🍕',
            'Arte': '🎨',
            'Música': '🎵'
        };
        return iconos[nombre] || '📄';
    }

    aplicarFiltros() {
        let articulosFiltrados = [...this.articulos];

        // Filtrar por categoría
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'draft' || this.currentFilter === 'published' || this.currentFilter === 'scheduled') {
                // Filtros de estado para vendedores
                articulosFiltrados = articulosFiltrados.filter(articulo => {
                    switch (this.currentFilter) {
                        case 'draft':
                            return !articulo.publicado;
                        case 'published':
                            return articulo.publicado;
                        case 'scheduled':
                            return articulo.fechapublicacion && new Date(articulo.fechapublicacion) > new Date();
                        default:
                            return true;
                    }
                });
            } else {
                // Filtro por categoría
                articulosFiltrados = articulosFiltrados.filter(articulo =>
                    articulo.categoria && articulo.categoria.id.toString() === this.currentFilter.toString()
                );
            }
        }

        this.articulosFiltrados = articulosFiltrados;
        this.mostrarArticulos();
        this.actualizarContadoresCategorias();
    }

    filtrarPorCategoria(categoriaId) {
        // Limpiar timeout anterior
        if (this.filterTimeout) {
            clearTimeout(this.filterTimeout);
        }

        this.filterTimeout = setTimeout(() => {
            this.currentFilter = categoriaId;

            // Actualizar UI de categorías
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });

            const activeBtn = document.querySelector(`[data-category="${categoriaId}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.setAttribute('aria-pressed', 'true');
            }

            this.aplicarFiltros();
            console.log('🔍 Filtrado por categoría:', categoriaId);
        }, 100);
    }

    filtrarPorEstado(estado) {
        if (this.tipoUsuario !== 'VENDEDOR') return;

        this.currentFilter = estado;

        // Actualizar UI de quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-filter="${estado}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.aplicarFiltros();
        console.log('🔍 Filtrado por estado:', estado);
    }

    buscarArticulos(query) {
        if (!query.trim()) {
            this.aplicarFiltros();
            return;
        }

        const searchTerm = query.toLowerCase();

        // Aplicar filtros primero, luego buscar
        this.aplicarFiltros();

        this.articulosFiltrados = this.articulosFiltrados.filter(articulo =>
            articulo.titulo.toLowerCase().includes(searchTerm) ||
            (articulo.resumen && articulo.resumen.toLowerCase().includes(searchTerm)) ||
            (articulo.contenido && articulo.contenido.toLowerCase().includes(searchTerm)) ||
            (articulo.autor && articulo.autor.nombre.toLowerCase().includes(searchTerm))
        );

        this.mostrarArticulos();
        console.log(`🔍 Búsqueda: "${query}" - ${this.articulosFiltrados.length} resultados en ${this.articulos.length} artículos totales`);
    }

    cambiarOrdenamiento(orden) {
        this.currentSort = orden;

        this.articulosFiltrados.sort((a, b) => {
            switch (orden) {
                case 'recent':
                    return new Date(b.fechapublicacion) - new Date(a.fechapublicacion);
                case 'popular':
                    return (b.vistas || 0) - (a.vistas || 0);
                case 'title':
                    return a.titulo.localeCompare(b.titulo);
                case 'author':
                    return a.autor.nombre.localeCompare(b.autor.nombre);
                default:
                    return 0;
            }
        });

        this.mostrarArticulos();
        console.log('📊 Ordenamiento cambiado a:', orden);
    }

    cambiarVista(vista) {
        this.currentView = vista;

        // Actualizar UI de vista
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });

        const activeBtn = document.querySelector(`[data-view="${vista}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.setAttribute('aria-pressed', 'true');
        }

        // Cambiar clases del grid
        const grid = document.getElementById('articlesGrid');
        if (grid) {
            grid.className = `articles-grid ${vista}-view`;
        }

        console.log('👁️ Vista cambiada a:', vista);
    }

    mostrarArticulos() {
        const container = document.getElementById('articlesGrid');
        const loadingElement = document.getElementById('loadingArticles');
        const emptyElement = document.getElementById('emptyState');

        if (!container) return;

        // Ocultar loading y empty state
        if (loadingElement) loadingElement.style.display = 'none';
        if (emptyElement) emptyElement.style.display = 'none';

        if (this.articulosFiltrados.length === 0) {
            this.mostrarEstadoVacio();
            return;
        }

        // Renderizar artículos
        const html = this.articulosFiltrados.map(articulo =>
            this.renderizarArticuloCard(articulo)
        ).join('');

        container.innerHTML = html;

        // Animar entrada si GSAP está disponible
        this.animarArticulos();

        console.log(`📋 Mostrando ${this.articulosFiltrados.length} artículos en vista ${this.currentView}`);
    }

    renderizarArticuloCard(articulo) {
        const isOwner = this.tipoUsuario === 'VENDEDOR' &&
            this.usuarioActual &&
            this.usuarioActual.user &&
            articulo.autor &&
            articulo.autor.id === this.usuarioActual.user.id;

        return `
            <article class="article-card" data-article-id="${articulo.id}">
                <div class="article-image">
                    ${articulo.imagen
            ? `<img src="${articulo.imagen}" alt="${articulo.titulo}" loading="lazy">`
            : `<div class="article-image-placeholder">📰</div>`
        }
                    <div class="article-image-overlay"></div>
                </div>
                
                <div class="article-content">
                    <div class="article-meta">
                        <span class="article-category">${articulo.categoria?.nombre || 'General'}</span>
                        <span class="article-date">📅 ${articulo.fechaFormateada}</span>
                        <span class="article-reading-time">⏱️ ${articulo.tiempoLectura} min</span>
                    </div>
                    
                    <h3 class="article-title">${articulo.titulo}</h3>
                    <p class="article-summary">${articulo.resumen}</p>
                    
                    <div class="article-footer">
                        <div class="article-author">
                            <div class="author-avatar">
                                <img src="/images/default-avatar.png" alt="${articulo.autor.nombre}">
                            </div>
                            <span>${articulo.autor.nombre}</span>
                        </div>
                        
                        <div class="article-actions">
                            ${isOwner ? `
                                <button class="action-btn-small" data-action="edit" title="Editar artículo">
                                    ✏️
                                </button>
                                <button class="action-btn-small" data-action="delete" title="Eliminar artículo">
                                    🗑️
                                </button>
                            ` : `
                                <button class="action-btn-small" data-action="share" title="Compartir artículo">
                                    📤
                                </button>
                                <button class="action-btn-small" data-action="bookmark" title="Marcar como favorito">
                                    🔖
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    mostrarEstadoVacio(titulo = 'No hay artículos disponibles', mensaje = 'No se encontraron artículos que coincidan con tu búsqueda') {
        const emptyElement = document.getElementById('emptyState');
        const emptyMessage = document.getElementById('emptyStateMessage');
        const emptyAction = document.getElementById('emptyStateAction');

        if (emptyElement) {
            emptyElement.style.display = 'block';

            if (emptyMessage) {
                emptyMessage.textContent = mensaje;
            }

            if (emptyAction && this.tipoUsuario === 'VENDEDOR') {
                emptyAction.style.display = 'flex';
            }
        }
    }

    animarArticulos() {
        const cards = document.querySelectorAll('.article-card');

        if (cards.length === 0) return;

        if (typeof gsap !== 'undefined') {
            try {
                gsap.fromTo(cards,
                    {
                        opacity: 0,
                        y: 50,
                        scale: 0.9,
                        rotationX: 15
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotationX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: "back.out(1.7)"
                    }
                );
            } catch (error) {
                console.warn('Error animando artículos:', error);
                // Fallback: mostrar elementos sin animación
                cards.forEach(card => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                });
            }
        } else {
            // Fallback sin GSAP
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                    card.style.transition = 'all 0.6s ease';
                }, index * 100);
            });
        }
    }

    // ==================== ACCIONES DE ARTÍCULOS ====================

    ejecutarAccionArticulo(accion, articuloId) {
        switch (accion) {
            case 'edit':
                this.editarArticulo(articuloId);
                break;
            case 'delete':
                this.eliminarArticulo(articuloId);
                break;
            case 'share':
                this.compartirArticulo(articuloId);
                break;
            case 'bookmark':
                this.marcarFavorito(articuloId);
                break;
            default:
                console.warn('Acción no reconocida:', accion);
        }
    }

    async verArticulo(articuloId) {
        try {
            console.log('📖 Viendo artículo:', articuloId);

            // Cargar artículo completo desde API
            const response = await fetch(`${this.apiBaseURL}/blogs/${articuloId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Artículo no encontrado');
            }

            const articulo = await response.json();

            // Procesar artículo para asegurar compatibilidad
            this.currentArticle = this.procesarArticulo(articulo);

            this.mostrarVistaArticulo(this.currentArticle);
            this.setupProgresoLectura();
            this.generateTOC();

        } catch (error) {
            console.error('❌ Error cargando artículo:', error);
            this.mostrarToast('Error al cargar el artículo', 'error');
        }
    }

    mostrarVistaArticulo(articulo) {
        // Ocultar vista principal y mostrar vista de artículo
        const mainContainer = document.querySelector('.blog-container');
        const articleContainer = document.getElementById('articleViewContainer');

        if (mainContainer) mainContainer.style.display = 'none';
        if (articleContainer) {
            articleContainer.style.display = 'block';
            this.renderizarArticuloCompleto(articulo);
        }

        // Mostrar herramientas flotantes
        const floatingTools = document.getElementById('floatingTools');
        if (floatingTools) floatingTools.style.display = 'flex';
    }

    volverAlBlog() {
        // Ocultar vista de artículo y mostrar vista principal
        const mainContainer = document.querySelector('.blog-container');
        const articleContainer = document.getElementById('articleViewContainer');
        const floatingTools = document.getElementById('floatingTools');

        if (articleContainer) articleContainer.style.display = 'none';
        if (mainContainer) mainContainer.style.display = 'block';
        if (floatingTools) floatingTools.style.display = 'none';

        // Limpiar artículo actual
        this.currentArticle = null;

        console.log('⬅️ Volviendo al blog principal');
    }

    renderizarArticuloCompleto(articulo) {
        const container = document.getElementById('articleContent');
        if (!container) return;

        const html = `
            <div class="article-header-content">
                <h1 class="article-title-main">${articulo.titulo}</h1>
                <p class="article-summary-main">${articulo.resumen}</p>
                <div class="article-meta-main">
                    <span>📅 ${articulo.fechaFormateada}</span>
                    <span>👤 ${articulo.autor.nombre}</span>
                    <span>⏱️ ${articulo.tiempoLectura} min de lectura</span>
                    <span>📂 ${articulo.categoria?.nombre || 'General'}</span>
                </div>
            </div>

            ${articulo.imagen ? `
                <div class="article-featured-image">
                    <img src="${articulo.imagen}" alt="${articulo.titulo}">
                </div>
            ` : ''}

            <div class="article-body">
                ${articulo.contenido}
            </div>
        `;

        container.innerHTML = html;
    }

    async editarArticulo(articuloId) {
        if (this.tipoUsuario !== 'VENDEDOR') {
            this.mostrarToast('Solo los vendedores pueden editar artículos', 'error');
            return;
        }

        try {
            // Cargar artículo completo desde API
            const response = await fetch(`${this.apiBaseURL}/blogs/${articuloId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Artículo no encontrado');
            }

            const articulo = await response.json();

            // Verificar que el usuario puede editar este artículo
            if (articulo.autorid?.id !== this.usuarioActual.user.id) {
                this.mostrarToast('Solo puedes editar tus propios artículos', 'error');
                return;
            }

            this.currentArticle = this.procesarArticulo(articulo);
            this.isEditing = true;
            this.llenarFormularioEditor(this.currentArticle);
            this.abrirEditor();

            console.log('✏️ Editando artículo:', this.currentArticle.titulo);

        } catch (error) {
            console.error('❌ Error cargando artículo para editar:', error);
            this.mostrarToast('Error al cargar el artículo', 'error');
        }
    }

    async eliminarArticulo(articuloId) {
        if (this.tipoUsuario !== 'VENDEDOR') {
            this.mostrarToast('Solo los vendedores pueden eliminar artículos', 'error');
            return;
        }

        if (!confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseURL}/blogs/${articuloId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error del servidor:', response.status, errorText);
                throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
            }

            // Recargar artículos
            await this.cargarArticulos();
            this.mostrarToast('Artículo eliminado correctamente', 'success');

            console.log('🗑️ Artículo eliminado:', articuloId);

        } catch (error) {
            console.error('❌ Error eliminando artículo:', error);
            this.mostrarToast('Error al eliminar el artículo', 'error');
        }
    }

    async compartirArticulo(articuloId) {
        const articulo = this.articulos.find(a => a.id.toString() === articuloId.toString());
        if (!articulo) return;

        const shareData = {
            title: articulo.titulo,
            text: `Lee este interesante artículo: ${articulo.titulo}`,
            url: `${window.location.origin}/blog/articulo/${articuloId}`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                console.log('📤 Artículo compartido via Web Share API');
            } else {
                // Abrir modal de compartir
                this.abrirModalCompartir(shareData);
            }
        } catch (error) {
            console.error('❌ Error compartiendo artículo:', error);
            this.mostrarToast('Error al compartir el artículo', 'error');
        }
    }

    marcarFavorito(articuloId) {
        // Implementar lógica de favoritos
        this.mostrarToast('Función de favoritos llegará pronto 🚀', 'info');
        console.log('🔖 Marcando como favorito:', articuloId);
    }

    // ==================== ESTADÍSTICAS Y CONTADORES ====================

    actualizarEstadisticas() {
        if (this.tipoUsuario !== 'VENDEDOR') return;

        const totalArticulos = this.articulos.length;
        const articulosPublicados = this.articulos.filter(a => a.publicado).length;
        const totalVistas = this.articulos.reduce((sum, a) => sum + (a.vistas || 0), 0);
        const engagement = totalVistas > 0 ? Math.round((articulosPublicados / totalVistas) * 100) : 0;

        // Actualizar elementos del DOM
        this.actualizarElemento('totalArticulos', totalArticulos);
        this.actualizarElemento('articulosPublicados', articulosPublicados);
        this.actualizarElemento('totalVistas', totalVistas);
        this.actualizarElemento('engagementPromedio', `${engagement}%`);

        console.log('📊 Estadísticas actualizadas para vendedor');
    }

    actualizarContadoresCategorias() {
        // Actualizar contador "Todas"
        const countAll = document.getElementById('countAll');
        if (countAll) countAll.textContent = this.articulos.length;

        // Actualizar contadores de categorías específicas
        this.categorias.forEach(categoria => {
            const count = this.articulos.filter(art =>
                art.categoria && art.categoria.id === categoria.id
            ).length;

            const countElement = document.querySelector(`[data-category="${categoria.id}"] .category-count`);
            if (countElement) countElement.textContent = count;
        });

        // Actualizar contadores de estados para vendedores
        if (this.tipoUsuario === 'VENDEDOR') {
            const drafts = this.articulos.filter(a => !a.publicado).length;
            const published = this.articulos.filter(a => a.publicado).length;
            const scheduled = this.articulos.filter(a =>
                a.fechapublicacion && new Date(a.fechapublicacion) > new Date()
            ).length;

            this.actualizarElemento('countDrafts', drafts);
            this.actualizarElemento('countPublished', published);
            this.actualizarElemento('countScheduled', scheduled);
        }
    }

    actualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    }

    // ==================== UTILIDADES ====================

    calcularTiempoLectura(contenido) {
        if (!contenido) return 0;

        const palabras = contenido.replace(/<[^>]*>/g, '').split(/\s+/).length;
        return Math.max(1, Math.ceil(palabras / 200)); // 200 palabras por minuto
    }

    formatearFecha(fecha) {
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    actualizarTiemposRelativos() {
        // Actualizar tiempos relativos cada minuto
        document.querySelectorAll('.article-date').forEach(element => {
            const fecha = element.dataset.fecha;
            if (fecha) {
                element.textContent = this.formatearTiempoRelativo(new Date(fecha));
            }
        });
    }

    formatearTiempoRelativo(fecha) {
        const ahora = new Date();
        const diff = ahora - fecha;
        const minutos = Math.floor(diff / 60000);
        const horas = Math.floor(minutos / 60);
        const dias = Math.floor(horas / 24);

        if (minutos < 1) return 'Ahora mismo';
        if (minutos < 60) return `Hace ${minutos} min`;
        if (horas < 24) return `Hace ${horas}h`;
        if (dias < 7) return `Hace ${dias} días`;

        return this.formatearFecha(fecha);
    }

    // Continuación de la SEGUNDA PARTE...

    cargarArticulosPopulares() {
        if (this.tipoUsuario === 'VENDEDOR') return;

        // Para compradores, mostrar artículos más populares
        const populares = [...this.articulos]
            .filter(a => a.publicado)
            .sort((a, b) => (b.vistas || 0) - (a.vistas || 0))
            .slice(0, 5);

        const container = document.getElementById('popularArticles');
        if (!container) return;

        if (populares.length === 0) {
            container.innerHTML = '<p class="no-popular">No hay artículos populares aún</p>';
            return;
        }

        const html = populares.map(articulo => `
            <div class="popular-article" data-article-id="${articulo.id}">
                <div class="popular-thumbnail">
                    ${articulo.imagen
            ? `<img src="${articulo.imagen}" alt="${articulo.titulo}" loading="lazy">`
            : '<div class="popular-placeholder">📰</div>'
        }
                </div>
                <div class="popular-info">
                    <h4 class="popular-title">${articulo.titulo}</h4>
                    <div class="popular-meta">
                        <span>👁️ ${articulo.vistas || 0}</span>
                        <span>⏱️ ${articulo.tiempoLectura} min</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
        console.log(`⭐ ${populares.length} artículos populares cargados`);
    }

    // ==================== MODALES Y EDITOR ====================

    abrirEditor() {
        if (this.tipoUsuario !== 'VENDEDOR') {
            this.mostrarToast('Solo los vendedores pueden crear artículos', 'error');
            return;
        }

        // VERIFICACIÓN ESTRICTA: Solo abrir con interacción real del usuario
        const stack = new Error().stack;
        const esClickReal = stack.includes('HTMLButtonElement') ||
            stack.includes('click') ||
            stack.includes('handleNuevoArticuloClick') ||
            stack.includes('handleEmptyStateClick');

        if (!esClickReal) {
            console.log('⚠️ Intento de abrir editor sin interacción del usuario - BLOQUEADO');
            return;
        }

        // Verificar que el modal no esté ya abierto
        const modal = document.getElementById('editorModal');
        if (modal && modal.style.display === 'flex') {
            console.log('⚠️ Editor ya está abierto');
            return;
        }

        this.isEditing = false;
        this.currentArticle = null;
        this.resetearFormularioEditor();
        this.abrirModal('editorModal');
        this.configurarEditor();

        console.log('✍️ Editor abierto para crear nuevo artículo');
    }

    cerrarEditor() {
        this.cerrarModal('editorModal');
        this.isEditing = false;
        this.currentArticle = null;
        this.resetearFormularioEditor();

        console.log('❌ Editor cerrado');
    }

    abrirModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal ${modalId} no encontrado`);
            return;
        }

        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Animar apertura si GSAP está disponible
        if (typeof gsap !== 'undefined') {
            try {
                gsap.fromTo(modal,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.3, ease: "power2.out" }
                );

                const content = modal.querySelector('.modal-content-editor, .modal-content-share');
                if (content) {
                    gsap.fromTo(content,
                        { scale: 0.8, y: 50 },
                        { scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
                    );
                }
            } catch (error) {
                console.warn('Error en animación de modal:', error);
            }
        }

        console.log(`📖 Modal abierto: ${modalId}`);
    }

    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Animar cierre si GSAP está disponible
        if (typeof gsap !== 'undefined') {
            try {
                gsap.to(modal, {
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: () => {
                        modal.style.display = 'none';
                        modal.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = 'auto';
                    }
                });

                const content = modal.querySelector('.modal-content-editor, .modal-content-share');
                if (content) {
                    gsap.to(content, {
                        scale: 0.8,
                        y: 50,
                        duration: 0.3,
                        ease: "power2.in"
                    });
                }
            } catch (error) {
                console.warn('Error en animación de cierre:', error);
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = 'auto';
            }
        } else {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
        }

        console.log(`📖 Modal cerrado: ${modalId}`);
    }

    cerrarTodosLosModals() {
        const modals = document.querySelectorAll('.modal-editor, .modal-share');
        modals.forEach(modal => {
            if (modal.style.display !== 'none') {
                this.cerrarModal(modal.id);
            }
        });
    }

    // ==================== EDITOR WYSIWYG ====================

    configurarEditor() {
        this.setupEditorEventListeners();
        this.setupContadoresPalabras();
        this.setupImageUpload();
        this.setupAutoguardado();
        this.cargarCategoriasEnEditor();

        console.log('⚙️ Editor configurado');
    }

    setupEditorEventListeners() {
        // Pestañas del editor
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.target.dataset.tab;
                if (tabName) {
                    this.cambiarPestanaEditor(tabName);
                }
            });
        });

        // Toolbar WYSIWYG
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.dataset.action;
                if (action) {
                    this.ejecutarComandoEditor(action);
                }
            });
        });

        // Editor de contenido
        const editor = document.getElementById('wysiwygEditor');
        if (editor) {
            editor.addEventListener('input', () => {
                this.actualizarContadoresPalabras();
                this.actualizarPreview();
            });

            editor.addEventListener('paste', (e) => {
                // Limpiar formato al pegar
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
            });
        }

        // Formulario
        const form = document.getElementById('editorForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                this.guardarArticulo(e);
            });
        }

        // Botones de acción
        const saveAsDraft = document.getElementById('saveAsDraft');
        if (saveAsDraft) {
            saveAsDraft.addEventListener('click', () => {
                this.guardarBorrador();
            });
        }

        const cancelEditor = document.getElementById('cancelEditor');
        if (cancelEditor) {
            cancelEditor.addEventListener('click', () => {
                this.cerrarEditor();
            });
        }

        // Contadores de caracteres
        this.setupContadoresPalabras();
    }

    setupContadoresPalabras() {
        // Contador de título
        const titleInput = document.getElementById('articleTitle');
        const titleCounter = document.getElementById('titleCounter');

        if (titleInput && titleCounter) {
            titleInput.addEventListener('input', () => {
                titleCounter.textContent = titleInput.value.length;
            });
        }

        // Contador de resumen
        const summaryInput = document.getElementById('articleSummary');
        const summaryCounter = document.getElementById('summaryCounter');

        if (summaryInput && summaryCounter) {
            summaryInput.addEventListener('input', () => {
                summaryCounter.textContent = summaryInput.value.length;
            });
        }

        // Contador de meta descripción
        const metaInput = document.getElementById('metaDescription');
        const metaCounter = document.getElementById('metaCounter');

        if (metaInput && metaCounter) {
            metaInput.addEventListener('input', () => {
                metaCounter.textContent = metaInput.value.length;
            });
        }
    }

    actualizarContadoresPalabras() {
        const editor = document.getElementById('wysiwygEditor');
        const wordCountElement = document.getElementById('wordCount');
        const readingTimeElement = document.getElementById('readingTime');

        if (!editor || !wordCountElement || !readingTimeElement) return;

        const text = editor.textContent || editor.innerText || '';
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 palabras por minuto

        wordCountElement.textContent = `${wordCount} palabras`;
        readingTimeElement.textContent = `${readingTime} min de lectura`;
    }

    setupImageUpload() {
        const uploadArea = document.getElementById('imageUploadArea');
        const fileInput = document.getElementById('imageFileInput');
        const selectBtn = document.getElementById('selectImageBtn');
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImage');
        const removeBtn = document.getElementById('removeImageBtn');
        const placeholder = document.getElementById('uploadPlaceholder');

        if (!uploadArea || !fileInput) return;

        // Click en área de upload
        if (selectBtn) {
            selectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fileInput.click();
            });
        }

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-accent)';
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageFile(files[0]);
            }
        });

        // Selección de archivo
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImageFile(e.target.files[0]);
            }
        });

        // Remover imagen
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.removeSelectedImage();
            });
        }
    }

    handleImageFile(file) {
        if (!file.type.startsWith('image/')) {
            this.mostrarToast('Por favor selecciona un archivo de imagen válido', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            this.mostrarToast('La imagen no puede ser mayor a 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImage');
            const placeholder = document.getElementById('uploadPlaceholder');

            if (preview && previewImg && placeholder) {
                previewImg.src = e.target.result;
                placeholder.style.display = 'none';
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }

    removeSelectedImage() {
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('uploadPlaceholder');
        const fileInput = document.getElementById('imageFileInput');

        if (preview && placeholder && fileInput) {
            preview.style.display = 'none';
            placeholder.style.display = 'block';
            fileInput.value = '';
        }
    }

    setupAutoguardado() {
        // Configurar autoguardado cada 30 segundos
        this.autosaveInterval = setInterval(() => {
            if (this.isEditing || this.editorContent) {
                this.autoguardarBorrador();
            }
        }, 30000);

        console.log('💾 Autoguardado configurado');
    }

    autoguardarBorrador() {
        const formData = this.recopilarDatosFormulario();
        if (!formData.titulo && !formData.contenido) return;

        // Guardar en localStorage como respaldo
        const borrador = {
            ...formData,
            timestamp: new Date().toISOString(),
            autoguardado: true
        };

        localStorage.setItem('blog_borrador', JSON.stringify(borrador));

        // Actualizar indicador
        const indicator = document.getElementById('autosaveIndicator');
        if (indicator) {
            const statusText = indicator.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Guardado automáticamente';
                statusText.style.color = 'var(--success-gradient)';

                setTimeout(() => {
                    statusText.style.color = '';
                }, 2000);
            }
        }
    }

    cambiarPestanaEditor(tab) {
        // Remover active de todas las pestañas
        document.querySelectorAll('.editor-tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });

        // Remover active de todos los paneles
        document.querySelectorAll('.editor-panel').forEach(p => {
            p.classList.remove('active');
        });

        // Activar pestaña seleccionada
        const activeTab = document.querySelector(`[data-tab="${tab}"]`);
        const activePanel = document.getElementById(`panel${tab.charAt(0).toUpperCase() + tab.slice(1)}`);

        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.setAttribute('aria-selected', 'true');
        }

        if (activePanel) {
            activePanel.classList.add('active');
        }

        // Actualizar preview si es necesario
        if (tab === 'preview') {
            this.actualizarPreview();
        }

        console.log(`📑 Pestaña cambiada a: ${tab}`);
    }

    ejecutarComandoEditor(action) {
        const editor = document.getElementById('wysiwygEditor');
        if (!editor) return;

        editor.focus();

        switch (action) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'underline':
                document.execCommand('underline', false, null);
                break;
            case 'h2':
                document.execCommand('formatBlock', false, '<h2>');
                break;
            case 'h3':
                document.execCommand('formatBlock', false, '<h3>');
                break;
            case 'link':
                const url = prompt('Ingresa la URL:');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
                break;
            case 'list':
                document.execCommand('insertUnorderedList', false, null);
                break;
            case 'image':
                const imgUrl = prompt('Ingresa la URL de la imagen:');
                if (imgUrl) {
                    document.execCommand('insertImage', false, imgUrl);
                }
                break;
        }

        // Actualizar contadores después del comando
        this.actualizarContadoresPalabras();
    }

    actualizarPreview() {
        const previewContainer = document.getElementById('previewArticle');
        if (!previewContainer) return;

        const formData = this.recopilarDatosFormulario();

        const previewHTML = `
            <div class="preview-header">
                <h1 class="preview-title">${formData.titulo || 'Título del artículo'}</h1>
                <p class="preview-summary">${formData.resumen || 'Resumen del artículo'}</p>
                <div class="preview-meta">
                    <span>📅 ${new Date().toLocaleDateString('es-ES')}</span>
                    <span>👤 ${this.usuarioActual.user.nombre}</span>
                    <span>⏱️ ${this.calcularTiempoLectura(formData.contenido || '')} min</span>
                </div>
            </div>
            <div class="preview-content">
                ${formData.contenido || '<p>Contenido del artículo...</p>'}
            </div>
        `;

        previewContainer.innerHTML = previewHTML;
    }

    cargarCategoriasEnEditor() {
        const select = document.getElementById('articleCategory');
        if (!select) {
            console.warn('⚠️ Select de categorías no encontrado');
            return;
        }

        // Limpiar opciones existentes
        select.innerHTML = '<option value="">Seleccionar categoría</option>';

        // Agregar categorías
        this.categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nombre;
            select.appendChild(option);
        });

        // Remover el atributo required temporalmente para evitar errores
        select.removeAttribute('required');

        console.log(`📂 ${this.categorias.length} categorías cargadas en editor`);
    }

    recopilarDatosFormulario() {
        const titulo = document.getElementById('articleTitle')?.value.trim();
        const resumen = document.getElementById('articleSummary')?.value.trim();
        const contenido = document.getElementById('wysiwygEditor')?.innerHTML.trim();
        const categoriaId = document.getElementById('articleCategory')?.value;
        const publicado = document.getElementById('isPublished')?.checked || false;

        // Estructura exacta según tu tabla blog
        const formData = {
            titulo: titulo || '',
            resumen: resumen || '',
            contenido: contenido || '',
            publicado: publicado,
            fechapublicacion: new Date().toISOString(),
            imagen: null // Por ahora null, implementar después
        };

        // Autor como objeto (según tu controller Spring Boot)
        if (this.usuarioActual && this.usuarioActual.user && this.usuarioActual.user.id) {
            formData.autorid = {
                id: this.usuarioActual.user.id
            };
        }

        // Categoría como objeto (según tu controller Spring Boot)
        if (categoriaId && categoriaId !== '' && categoriaId !== 'null') {
            formData.categoriaid = {
                id: parseInt(categoriaId)
            };
        }

        console.log('🔍 Estructura de datos para enviar:', {
            titulo: formData.titulo,
            resumen: formData.resumen,
            contenido: formData.contenido?.substring(0, 50) + '...',
            publicado: formData.publicado,
            fechapublicacion: formData.fechapublicacion,
            autorid: formData.autorid,
            categoriaid: formData.categoriaid
        });

        return formData;
    }

    validarFormulario(data) {
        console.log('🔍 Validando formulario:', data);

        if (!data.titulo || data.titulo.trim() === '') {
            this.mostrarToast('El título es obligatorio', 'error');
            return false;
        }

        if (!data.resumen || data.resumen.trim() === '') {
            this.mostrarToast('El resumen es obligatorio', 'error');
            return false;
        }

        if (!data.contenido || data.contenido === '<br>' || data.contenido.trim() === '') {
            this.mostrarToast('El contenido es obligatorio', 'error');
            return false;
        }

        if (!data.autorid || !data.autorid.id) {
            this.mostrarToast('Error: Usuario no identificado', 'error');
            console.error('❌ Usuario actual:', this.usuarioActual);
            return false;
        }

        console.log('✅ Formulario validado para BD');
        return true;
    }

    async guardarArticulo(e) {
        e.preventDefault();

        if (this.tipoUsuario !== 'VENDEDOR') {
            this.mostrarToast('Solo los vendedores pueden crear artículos', 'error');
            return;
        }

        const formData = this.recopilarDatosFormulario();
        if (!this.validarFormulario(formData)) {
            return;
        }

        try {
            this.mostrarLoadingBoton(true);

            const url = this.isEditing
                ? `${this.apiBaseURL}/blogs/${this.currentArticle.id}`
                : `${this.apiBaseURL}/blogs`;

            const method = this.isEditing ? 'PUT' : 'POST';

            console.log('📤 Datos antes de enviar:', formData);

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('📥 Respuesta del servidor:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error del servidor:', response.status, errorText);
                throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
            }

            console.log('📥 Respuesta del servidor:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const articulo = await response.json();

            // Cerrar modal y recargar
            this.cerrarEditor();
            await this.cargarArticulos();

            const mensaje = this.isEditing ? 'Artículo actualizado correctamente' : 'Artículo creado correctamente';
            this.mostrarToast(mensaje, 'success');

            console.log(`💾 Artículo ${this.isEditing ? 'actualizado' : 'creado'}:`, articulo.titulo);

        } catch (error) {
            console.error('❌ Error guardando artículo:', error);
            this.mostrarToast('Error al guardar el artículo', 'error');
        } finally {
            this.mostrarLoadingBoton(false);
        }
    }

    async guardarBorrador() {
        if (this.tipoUsuario !== 'VENDEDOR') {
            this.mostrarToast('Solo los vendedores pueden guardar borradores', 'error');
            return;
        }

        const formData = this.recopilarDatosFormulario();
        if (!formData.titulo) {
            this.mostrarToast('El título es obligatorio para guardar borrador', 'error');
            return;
        }

        try {
            // Marcar como borrador
            formData.publicado = false;
            // El autor ya está incluido en recopilarDatosFormulario()

            const url = this.isEditing
                ? `${this.apiBaseURL}/blogs/${this.currentArticle.id}`
                : `${this.apiBaseURL}/blogs`;

            const method = this.isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const articulo = await response.json();
            this.mostrarToast('Borrador guardado correctamente', 'success');

            console.log('💾 Borrador guardado:', articulo.titulo);

        } catch (error) {
            console.error('❌ Error guardando borrador:', error);
            this.mostrarToast('Error al guardar el borrador', 'error');
        }
    }

    llenarFormularioEditor(articulo) {
        // Llenar campos del formulario
        const titleInput = document.getElementById('articleTitle');
        if (titleInput) titleInput.value = articulo.titulo || '';

        const summaryInput = document.getElementById('articleSummary');
        if (summaryInput) summaryInput.value = articulo.resumen || '';

        const contentEditor = document.getElementById('wysiwygEditor');
        if (contentEditor) contentEditor.innerHTML = articulo.contenido || '';

        const categorySelect = document.getElementById('articleCategory');
        if (categorySelect && articulo.categoria) {
            categorySelect.value = articulo.categoria.id;
        }

        const publishedCheckbox = document.getElementById('isPublished');
        if (publishedCheckbox) publishedCheckbox.checked = articulo.publicado || false;

        // Actualizar contadores
        this.actualizarContadoresPalabras();

        console.log('📝 Formulario llenado para edición');
    }

    resetearFormularioEditor() {
        // Limpiar todos los campos
        const form = document.getElementById('editorForm');
        if (form) form.reset();

        const editor = document.getElementById('wysiwygEditor');
        if (editor) editor.innerHTML = '';

        // Resetear imagen
        this.removeSelectedImage();

        // Resetear contadores
        this.actualizarContadoresPalabras();

        console.log('🔄 Formulario del editor reseteado');
    }

    // ==================== FUNCIONES DE UTILIDAD ====================

    mostrarLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('show');
            loadingScreen.style.display = 'flex';

            // Solo usar GSAP si está disponible
            if (typeof gsap !== 'undefined') {
                try {
                    // Animación del spinner
                    const spinner = document.querySelector('.loading-spinner-blog');
                    if (spinner) {
                        gsap.to(spinner, {
                            rotation: 360,
                            duration: 1.5,
                            repeat: -1,
                            ease: "none"
                        });
                    }

                    // Animación del texto
                    const loadingText = document.querySelector('.loading-content p');
                    if (loadingText) {
                        gsap.to(loadingText, {
                            opacity: 0.6,
                            duration: 1.5,
                            yoyo: true,
                            repeat: -1,
                            ease: "power2.inOut"
                        });
                    }
                } catch (error) {
                    console.warn('Error en animaciones de loading:', error);
                }
            }
        }
    }

    ocultarLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            // Ocultar inmediatamente
            loadingScreen.style.display = 'none';
            loadingScreen.style.opacity = '0';
            loadingScreen.classList.remove('show');

            // Forzar visibilidad del contenido
            this.forzarVisibilidadContenido();
        }
    }

    forzarVisibilidadContenido() {
        // Forzar visibilidad de elementos críticos
        const elementos = [
            '.blog-container',
            '.nav-header',
            '.breadcrumbs',
            '.blog-hero',
            '.vendor-dashboard',
            '.content-layout',
            '.sidebar-left',
            '.sidebar-right',
            '.main-content',
            '.articles-container',
            '.articles-grid'
        ];

        elementos.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.opacity = '1';
                element.style.visibility = 'visible';
                element.style.display = '';
                element.style.transform = 'translateY(0)';
            }
        });

        // Forzar visibilidad de todas las tarjetas de artículos
        document.querySelectorAll('.article-card').forEach(card => {
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.style.display = 'block';
            card.style.transform = 'translateY(0)';
        });

        console.log('✅ Visibilidad del contenido forzada');
    }

    actualizarComponentesUI() {
        // Ejecutar con delay para asegurar que los datos estén listos
        setTimeout(() => {
            this.cargarArticulosPopulares();
            this.actualizarContadoresCategorias();

            if (this.tipoUsuario === 'VENDEDOR') {
                this.actualizarEstadisticas();
            }

            console.log('🔄 Componentes UI actualizados');
        }, 100);
    }

    mostrarLoadingBoton(mostrar) {
        const btn = document.getElementById('publishArticle');
        if (!btn) return;

        if (mostrar) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    abrirModalCompartir(shareData) {
        const modal = document.getElementById('shareModal');
        const urlInput = document.getElementById('shareUrl');

        if (modal && urlInput) {
            urlInput.value = shareData.url;
            this.abrirModal('shareModal');

            // Configurar botones de compartir
            document.querySelectorAll('.share-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const platform = e.target.closest('.share-btn').dataset.platform;
                    this.compartirEnPlataforma(platform, shareData);
                });
            });

            // Configurar botón copiar
            const copyBtn = document.getElementById('copyLinkBtn');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(shareData.url);
                    this.mostrarToast('Enlace copiado al portapapeles', 'success');
                });
            }
        }
    }

    compartirEnPlataforma(platform, shareData) {
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`
        };

        if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400');
        }
    }

    mostrarToast(mensaje, tipo = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-blog ${tipo}`;
        toast.textContent = mensaje;

        container.appendChild(toast);

        // Mostrar toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Ocultar después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);

        console.log(`📢 Toast mostrado: ${mensaje} (${tipo})`);
    }

    mostrarError(mensaje) {
        this.mostrarToast(mensaje, 'error');
        console.error(`❌ Error: ${mensaje}`);
    }

    // ==================== FUNCIONES DE LECTURA ====================

    setupProgresoLectura() {
        const progressBar = document.getElementById('readingProgress');
        if (!progressBar) return;

        const updateProgress = () => {
            const article = document.getElementById('articleContent');
            if (!article) return;

            const scrollTop = window.pageYOffset;
            const docHeight = article.offsetHeight;
            const winHeight = window.innerHeight;
            const scrollPercent = scrollTop / (docHeight - winHeight);
            const progress = Math.min(100, Math.max(0, scrollPercent * 100));

            const progressFill = progressBar.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
                progressBar.setAttribute('aria-valuenow', Math.round(progress));
            }
        };

        window.addEventListener('scroll', updateProgress);
        updateProgress();
    }

    generateTOC() {
        const article = document.getElementById('articleContent');
        const tocList = document.getElementById('tocList');

        if (!article || !tocList) return;

        const headings = article.querySelectorAll('h2, h3');
        if (headings.length === 0) return;

        const tocHTML = Array.from(headings).map((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;

            return `
                <li>
                    <a href="#${id}" class="toc-link">
                        ${heading.textContent}
                    </a>
                </li>
            `;
        }).join('');

        tocList.innerHTML = tocHTML;

        // Configurar navegación del TOC
        document.querySelectorAll('.toc-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // ==================== LIMPIEZA Y DESTRUCCIÓN ====================

    destruir() {
        // Limpiar intervalos
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }

        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
        }

        // Limpiar timeouts
        if (this.filterTimeout) {
            clearTimeout(this.filterTimeout);
        }

        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Limpiar event listeners
        this.limpiarEventListeners();

        // Cerrar modals abiertos
        this.cerrarTodosLosModals();

        console.log('🧹 BlogManager limpiado correctamente');
    }

    limpiarEventListeners() {
        if (this.handleDelegatedClick) {
            document.removeEventListener('click', this.handleDelegatedClick);
        }
        if (this.handleNuevoArticuloClick) {
            const btnNuevoArticulo = document.getElementById('btnNuevoArticulo');
            if (btnNuevoArticulo) {
                btnNuevoArticulo.removeEventListener('click', this.handleNuevoArticuloClick);
            }
        }
        if (this.handleEmptyStateClick) {
            const emptyStateBtn = document.getElementById('emptyStateAction');
            if (emptyStateBtn) {
                emptyStateBtn.removeEventListener('click', this.handleEmptyStateClick);
            }
        }
        console.log('🧹 Event listeners limpiados');
    }
}

// Inicialización global
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando sistema de blog premium...');
    window.blogManager = new BlogManager();
});

// Exportar para uso global
window.BlogManager = BlogManager;

// Manejo de errores globales
window.addEventListener('error', (event) => {
    console.error('❌ Error global capturado:', event.error);
    if (window.blogManager) {
        window.blogManager.mostrarError('Ha ocurrido un error inesperado');
    }
});

// Limpiar al salir de la página
window.addEventListener('beforeunload', () => {
    if (window.blogManager) {
        window.blogManager.destruir();
    }
});

console.log('✅ Sistema de blog inicializado globalmente');



