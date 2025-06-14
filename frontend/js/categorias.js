// categorias.js - Página de Categorías con Neumorphism

class CategoriasPage {
    constructor() {
        this.currentCategory = 'all';
        this.currentSort = 'relevancia';
        this.currentView = 'grid';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.productos = [];
        this.filteredProducts = [];
        this.apiBaseURL = 'http://localhost:8080/api';
        this.userData = null;
        this.tipoUsuario = 'COMPRADOR';

        this.init();
    }

    async init() {
        console.log('Inicializando página de categorías...');

        // Registrar plugins GSAP
        gsap.registerPlugin(ScrollTrigger);

        // Verificar autenticación
        this.checkAuthentication();

        // Configurar datos del usuario
        this.setupUserData();

        // Verificar si hay categoría específica en URL
        this.checkUrlParams();

        // Configurar event listeners
        this.setupEventListeners();

        // Configurar animaciones iniciales
        this.setupInitialAnimations();

        // Cargar productos
        await this.loadProducts();

        // AGREGAR: Cargar categorías si es vendedor
        if (this.tipoUsuario === 'VENDEDOR') {
            console.log('🔄 Pre-cargando categorías para vendedor...');
            await this.cargarCategoriasModal();
        }

        // Personalizar por tipo de usuario
        this.personalizarPorTipoUsuario();

        console.log('Página de categorías inicializada correctamente');
    }

    checkAuthentication() {
        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');

        if (!userSession) {
            window.location.href = '/login';
            return;
        }

        try {
            this.userData = JSON.parse(userSession);
            console.log('Usuario autenticado:', this.userData);
        } catch (error) {
            console.error('Error parsing user session:', error);
            window.location.href = '/login';
        }
    }

    setupUserData() {
        if (this.userData && this.userData.user) {
            const userName = this.userData.user.nombre || 'Usuario';
            const userNameElement = document.getElementById('user-name');

            if (userNameElement) {
                const displayName = userName.length > 12 ? userName.substring(0, 12) + '...' : userName;
                userNameElement.textContent = displayName;
                userNameElement.title = userName;
            }

            // Detectar tipo de usuario
            this.tipoUsuario = (
                this.userData.user?.tipoUsuario ||
                this.userData.user?.tipousuario ||
                'COMPRADOR'
            ).toUpperCase();

            document.body.setAttribute('data-user-type', this.tipoUsuario);
            console.log('Tipo de usuario:', this.tipoUsuario);

            // Configurar contadores
            this.loadCartCounter();
            this.loadFavoritesCounter();
        }
    }


    checkUrlParams() {
        // Verificar si hay parámetro de categoría en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoriaParam = urlParams.get('categoria');

        if (categoriaParam) {
            console.log('📍 Categoría desde URL:', categoriaParam);
            console.log('👤 Tipo de usuario:', this.tipoUsuario);

            this.currentCategory = categoriaParam;

            // Actualizar título de página
            const titles = {
                tecnologia: 'Tecnología',
                hogar: 'Hogar',
                moda: 'Moda',
                mascotas: 'Mascotas',
                manualidades: 'Manualidades'
            };

            if (titles[categoriaParam]) {
                const pageTitle = document.getElementById('page-title');
                if (pageTitle) {
                    pageTitle.textContent = titles[categoriaParam];

                    // Animar título
                    gsap.fromTo(pageTitle,
                        { opacity: 0, y: -10 },
                        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
                    );
                }
            }

            // Marcar que venimos del dashboard para activar filtro después
            this.fromDashboard = true;
            console.log('🎯 Marcado para activar filtro automáticamente');
        }

        // ✅ AGREGAR VERIFICACIÓN DE PARÁMETRO PREORDEN
        const preordenParam = urlParams.get('preorden');
        const crearParam = urlParams.get('crear');

        if (preordenParam === 'true') {
            console.log('🔍 Mostrando solo productos de preorden');
            this.filtrarSoloPreorden = true;

            // Actualizar título
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = 'Productos de Preorden';
            }
        }

        if (crearParam === 'preorden') {
            console.log('➕ Crear nuevo producto de preorden');
            setTimeout(() => {
                this.abrirModalProductoPreorden();
            }, 500);
        }
    }

    setupEventListeners() {
        // Filtros de categoría
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.setActiveCategory(category);
            });
        });

        // Búsqueda
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        searchBtn.addEventListener('click', () => {
            this.handleSearch(searchInput.value);
        });

        // Ordenamiento
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.setSorting(e.target.value);
        });

        // Vista
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.setView(view);
            });
        });

        // Navegación
        document.getElementById('profile-btn').addEventListener('click', () => {
            window.location.href = '/perfil';
        });

        document.getElementById('cart-btn').addEventListener('click', () => {
            if (this.tipoUsuario === 'COMPRADOR') {
                window.location.href = '/carrito';
            }
        });

        document.getElementById('favorites-btn').addEventListener('click', () => {
            if (this.tipoUsuario === 'COMPRADOR') {
                window.location.href = '/favoritos';
            }
        });

        document.getElementById('notification-btn').addEventListener('click', () => {
            window.location.href = '/notificaciones';
        });

        // Logo click
        document.querySelector('.logo-section').addEventListener('click', () => {
            window.location.href = '/';
        });

        // Botón nuevo producto para vendedores
        const btnNuevoProducto = document.getElementById('btnNuevoProductoCategoria');
        if (btnNuevoProducto) {
            btnNuevoProducto.addEventListener('click', () => {
                this.abrirModalProducto();
            });
        }

        // Modal nuevo producto
        const formNuevoProducto = document.getElementById('formNuevoProductoCategoria');
        if (formNuevoProducto) {
            formNuevoProducto.addEventListener('submit', (e) => {
                this.crearNuevoProducto(e);
            });
        }

        // ==================== EVENT LISTENERS PARA IMÁGENES (basado en perfil.js) ====================

        // Input de archivos para EDITAR producto
        const inputEditarImagenes = document.getElementById('editarProductoImagenes');
        if (inputEditarImagenes) {
            inputEditarImagenes.addEventListener('change', (e) => {
                this.handleEditImageSelection(e);
            });
        }

        // Drag and drop para EDITAR imágenes (basado en perfil.js)
        const editarUploadArea = document.getElementById('editarImageUploadArea');
        if (editarUploadArea) {
            // Click para abrir selector de archivos
            editarUploadArea.addEventListener('click', () => {
                if (inputEditarImagenes) {
                    inputEditarImagenes.click();
                }
            });

            editarUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                editarUploadArea.style.borderColor = 'var(--primary-blue)';
                editarUploadArea.style.background = 'rgba(52, 152, 219, 0.1)';
            });

            editarUploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                editarUploadArea.style.borderColor = 'rgba(52, 152, 219, 0.3)';
                editarUploadArea.style.background = 'transparent';
            });

            editarUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                editarUploadArea.style.borderColor = 'rgba(52, 152, 219, 0.3)';
                editarUploadArea.style.background = 'transparent';

                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleEditImageFiles(files);
                }
            });
        }

        // Input de archivos para NUEVO producto
        const inputNuevasImagenes = document.getElementById('nuevoProductoImagenes');
        if (inputNuevasImagenes) {
            inputNuevasImagenes.addEventListener('change', (e) => {
                this.handleNewProductImageSelection(e);
            });
        }

        // Drag and drop para NUEVO producto (basado en perfil.js)
        const nuevoUploadArea = document.getElementById('nuevoImageUploadArea');
        if (nuevoUploadArea) {
            // Click para abrir selector de archivos
            nuevoUploadArea.addEventListener('click', () => {
                if (inputNuevasImagenes) {
                    inputNuevasImagenes.click();
                }
            });

            nuevoUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                nuevoUploadArea.style.borderColor = 'var(--primary-blue)';
                nuevoUploadArea.style.background = 'rgba(52, 152, 219, 0.1)';
            });

            nuevoUploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                nuevoUploadArea.style.borderColor = 'rgba(52, 152, 219, 0.3)';
                nuevoUploadArea.style.background = 'transparent';
            });

            nuevoUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                nuevoUploadArea.style.borderColor = 'rgba(52, 152, 219, 0.3)';
                nuevoUploadArea.style.background = 'transparent';

                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleNewProductImageFiles(files);
                }
            });
        } // CERRAR la llave del if (nuevoUploadArea)

        // ==================== EVENT LISTENERS PARA FORMULARIOS ====================

        // Formulario para EDITAR producto
        const formEditarProducto = document.getElementById('formEditarProductoCategoria');
        if (formEditarProducto) {
            formEditarProducto.addEventListener('submit', (e) => {
                this.guardarEdicionProducto(e);
            });
        }

        // ==================== CERRAR MODALES ====================

        // Cerrar modales al hacer click fuera
        const modales = document.querySelectorAll('.modal');
        modales.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal.id === 'modalEditarProducto') {
                        this.cerrarModalEdicion();
                    } else if (modal.id === 'modalNuevoProductoCategoria') {
                        this.cerrarModalProducto();
                    }
                }
            });
        });

        // Botones de cerrar en modales
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = e.target.closest('.modal');
                if (modal) {
                    if (modal.id === 'modalEditarProducto') {
                        this.cerrarModalEdicion();
                    } else if (modal.id === 'modalNuevoProductoCategoria') {
                        this.cerrarModalProducto();
                    }
                }
            });
        });
    } // CERRAR setupEventListeners()

    setupInitialAnimations() {
        // Timeline principal
        const tl = gsap.timeline();

        // Animar header
        tl.from('.header-container', {
            duration: 0.8,
            y: -50,
            opacity: 0,
            ease: "power2.out"
        });

        // Animar sidebar
        tl.from('.categories-sidebar', {
            duration: 0.8,
            x: -100,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.4");

        // Animar toolbar
        tl.from('.products-toolbar', {
            duration: 0.6,
            y: 30,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.3");

        // Animar filtros de categoría
        tl.from('.category-filter', {
            duration: 0.5,
            x: -20,
            opacity: 0,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.2");

        // Configurar animaciones de patrones después de que todo esté visible
        setTimeout(() => {
            this.setupCategoryPatterns();
        }, 1000);
    }

// AGREGAR ESTE MÉTODO NUEVO:
    setupCategoryPatterns() {
        console.log('🎨 Configurando hover simple para categorías...');

        const categoryCards = document.querySelectorAll('.category-filter');

        categoryCards.forEach((card) => {
            // Solo efectos hover simples, sin patrones
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.category-icon');
                if (icon) {
                    gsap.to(icon, {
                        duration: 0.3,
                        scale: 1.05,
                        ease: "back.out(1.4)"
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.category-icon');
                if (icon) {
                    gsap.to(icon, {
                        duration: 0.3,
                        scale: 1,
                        ease: "power2.out"
                    });
                }
            });
        });
    }

    async loadProducts() {
        try {
            this.showLoading();

            const response = await fetch(`${this.apiBaseURL}/productos`);
            if (response.ok) {
                this.productos = await response.json();

                // Cargar categorías disponibles
                await this.loadCategories();

                // Activar categoría desde URL si existe
                if (this.currentCategory !== 'all') {
                    console.log('🎯 Activando categoría desde URL:', this.currentCategory);

                    setTimeout(() => {
                        this.setActiveCategory(this.currentCategory);

                        // Si venimos del dashboard, hacer scroll suave y mostrar toast
                        if (this.fromDashboard) {
                            this.mostrarMensajeBienvenida(this.currentCategory);
                            this.fromDashboard = false;
                        }
                    }, 300); // Más tiempo para asegurar que el DOM esté listo
                } else {
                    // Aplicar filtros actuales
                    this.applyFilters();
                }


                console.log('Productos cargados:', this.productos.length);
            } else {
                throw new Error('Error al cargar productos');
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
            this.showEmptyState('Error al cargar productos', 'Intenta recargar la página');
        }
    }

    mostrarMensajeBienvenida(categoria) {
        const titles = {
            tecnologia: 'Tecnología',
            hogar: 'Hogar',
            moda: 'Moda',
            mascotas: 'Mascotas',
            manualidades: 'Manualidades'
        };

        const nombreCategoria = titles[categoria] || categoria;
        const tipoMensaje = this.tipoUsuario === 'VENDEDOR' ? 'Gestiona' : 'Explora';

        this.mostrarToast(`${tipoMensaje} productos de ${nombreCategoria}`, 'info');

        // Scroll suave hacia los productos
        setTimeout(() => {
            const productsArea = document.querySelector('.products-area');
            if (productsArea) {
                productsArea.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 500);
    }

    async loadCategories() {
        try {
            const response = await fetch(`${this.apiBaseURL}/categorias`);
            if (response.ok) {
                const categorias = await response.json();
                this.updateCategoryCounts(categorias);
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
        }
    }

    updateCategoryCounts(categorias) {
        // Contar productos por categoría
        const counts = {
            all: this.productos.length
        };

        categorias.forEach(categoria => {
            const count = this.productos.filter(p =>
                p.categoria && p.categoria.nombre.toLowerCase() === categoria.nombre.toLowerCase()
            ).length;

            counts[categoria.nombre.toLowerCase()] = count;
        });

        // Actualizar contadores en UI
        Object.entries(counts).forEach(([category, count]) => {
            const countElement = document.getElementById(`count-${category}`);
            if (countElement) {
                countElement.textContent = count;

                // Animar contador
                gsap.fromTo(countElement,
                    { scale: 0.8, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
                );
            }
        });
    }

    setActiveCategory(category) {
// Actualizar UI
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-category="${category}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');

            // Animar botón activo
            gsap.fromTo(activeBtn,
                { scale: 0.95, backgroundColor: 'rgba(52, 152, 219, 0.1)' },
                { scale: 1, backgroundColor: 'rgba(52, 152, 219, 0.2)', duration: 0.3, ease: "back.out(1.7)" }
            );

            console.log('✅ Filtro de categoría activado:', category);
        } else {
            console.warn('⚠️ No se encontró botón para categoría:', category);
        }

        // Actualizar estado
        this.currentCategory = category;
        this.currentPage = 1;

        // Actualizar título
        const titles = {
            all: 'Todos los Productos',
            tecnologia: 'Tecnología',
            hogar: 'Hogar',
            moda: 'Moda',
            mascotas: 'Mascotas',
            manualidades: 'Manualidades'
        };

        document.getElementById('page-title').textContent = titles[category] || 'Productos';

        // Aplicar filtros
        this.applyFilters();

        // Animar transición
        gsap.fromTo('.products-grid',
            { opacity: 0.5, scale: 0.98 },
            { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
        );
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.currentPage = 1;
        this.applyFilters();
    }

    setSorting(sortType) {
        this.currentSort = sortType;
        this.currentPage = 1;
        this.applyFilters();
    }

    setView(view) {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        const grid = document.getElementById('products-grid');
        grid.classList.toggle('list-view', view === 'list');

        this.currentView = view;

        // Animar cambio de vista
        gsap.fromTo(grid.children,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" }
        );
    }

    applyFilters() {
        let filtered = [...this.productos];

        // ✅ FILTRAR POR PREORDEN SI ES NECESARIO
        if (this.filtrarSoloPreorden) {
            filtered = filtered.filter(producto => producto.espreorden === true || producto.espreorden === 1);
            console.log('🔍 Productos de preorden filtrados:', filtered.length);
        }

        // Filtrar por categoría
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(producto =>
                producto.categoria &&
                producto.categoria.nombre.toLowerCase() === this.currentCategory
            );
        }

        // Filtrar por búsqueda
        if (this.searchQuery) {
            filtered = filtered.filter(producto =>
                producto.nombre.toLowerCase().includes(this.searchQuery) ||
                (producto.descripcion && producto.descripcion.toLowerCase().includes(this.searchQuery))
            );
        }

        // Ordenar
        this.sortProducts(filtered);

        // Guardar productos filtrados
        this.filteredProducts = filtered;

        // Mostrar productos
        this.displayProducts();

        // Actualizar contador
        this.updateProductsCount();
    }

    sortProducts(products) {
        switch (this.currentSort) {
            case 'precio-asc':
                products.sort((a, b) => a.precio - b.precio);
                break;
            case 'precio-desc':
                products.sort((a, b) => b.precio - a.precio);
                break;
            case 'nombre':
                products.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'fecha':
                products.sort((a, b) => new Date(b.fechacreacion) - new Date(a.fechacreacion));
                break;
            default: // relevancia
                // Mantener orden original o implementar lógica de relevancia
                break;
        }
    }

    displayProducts() {
        const grid = document.getElementById('products-grid');

        if (this.filteredProducts.length === 0) {
            this.showEmptyState('No se encontraron productos', 'Intenta con otros filtros o términos de búsqueda');
            return;
        }

        // Calcular productos para página actual
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);

        // Generar HTML
        grid.innerHTML = pageProducts.map((producto, index) => this.createProductCard(producto, index)).join('');

        // Configurar event listeners de productos
        this.setupProductListeners();

        // Animar entrada de productos
        gsap.fromTo('.product-card',
            { opacity: 0, y: 50, scale: 0.9 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.7)"
            }
        );

        // Debug de imágenes
        setTimeout(() => {
            this.debugImagenes();
        }, 1000);

        // Actualizar paginación
        this.updatePagination();
    }

// Debug para verificar rutas de imágenes
    debugImagenes() {
        console.log('=== DEBUG IMÁGENES CORREGIDO ===');
        this.filteredProducts.forEach((producto, index) => {
            if (producto.imagen) {
                // Manejar tanto comas como pipes
                const imagenes = producto.imagen.split(/[|,]/).filter(img => img.trim());
                const primeraImagen = imagenes.length > 0 ? imagenes[0].trim() : null;

                console.log(`Producto ${index + 1}: ${producto.nombre}`);
                console.log(`Imágenes RAW: "${producto.imagen}"`);
                console.log(`Separador detectado: ${producto.imagen.includes('|') ? 'PIPE |' : 'COMA ,'}`);
                console.log(`Imágenes array: [${imagenes.map(img => `"${img.trim()}"`).join(', ')}]`);
                console.log(`Primera imagen: "${primeraImagen}"`);

                if (primeraImagen) {
                    const url = `http://localhost:8080/imagenes-productos/${primeraImagen}`;
                    console.log(`URL generada: ${url}`);

                    // Verificar si la imagen existe
                    const testImg = new Image();
                    testImg.onload = () => console.log(`    ✅ Primera imagen carga correctamente`);
                    testImg.onerror = () => console.log(`    ❌ Error cargando primera imagen: ${url}`);
                    testImg.src = url;
                }
            } else {
                console.log(`Producto ${index + 1}: ${producto.nombre} - Sin imágenes`);
            }
        });
    }

    createProductCard(producto, index) {
        // Manejar tanto comas como pipes (productos viejos vs nuevos)
        const imagenes = producto.imagen ?
            producto.imagen.split(/[|,]/).filter(img => img.trim()) : [];
        const primeraImagen = imagenes.length > 0 ? imagenes[0].trim() : null;

        const precio = Number(producto.precio);
        const descuento = producto.descuento || 0;
        const precioOriginal = descuento > 0 ? precio / (1 - descuento / 100) : null;

        // BOTONES DIFERENTES SEGÚN TIPO DE USUARIO
        const botonesAccion = this.tipoUsuario === 'VENDEDOR' ?
            `<div class="product-actions vendedor-actions">
        <button class="action-btn edit" data-product-id="${producto.id}" title="Editar producto">
            ✏️
        </button>
        <button class="action-btn transform" data-product-id="${producto.id}" title="Transformar producto">
            🔄
        </button>
        <button class="action-btn analytics" data-product-id="${producto.id}" title="Ver métricas">
            📊
        </button>
    </div>` :
            `<div class="product-actions">
        <button class="action-btn favorite" data-product-id="${producto.id}" title="Agregar a favoritos" style="color: #95a5a6;">
            🤍
        </button>
        <button class="action-btn cart" data-product-id="${producto.id}" title="Agregar al carrito" ${producto.stock <= 0 ? 'disabled style="opacity: 0.5;"' : ''}>
            🛒
        </button>
    </div>`;

        return `
        <div class="product-card" data-product-id="${producto.id}">
            <div class="product-image-container">
                ${primeraImagen ?
            `<img src="http://localhost:8080/imagenes-productos/${primeraImagen.trim()}" 
                         alt="${producto.nombre}" 
                         class="product-image"
                         onerror="console.error('Error cargando imagen:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';"
                         onload="console.log('Imagen cargada:', this.src); this.style.display='block'; this.nextElementSibling.style.display='none';">
                     <div class="product-placeholder" style="display: none;">
                        <div class="placeholder-icon">📦</div>
                        <div class="placeholder-text">Imagen no disponible</div>
                     </div>` :
            `<div class="product-placeholder">
                        <div class="placeholder-icon">📦</div>
                        <div class="placeholder-text">Sin imagen</div>
                     </div>`
        }
                
                ${producto.nuevo ? '<div class="product-badge">Nuevo</div>' : ''}
                ${imagenes.length > 1 ? `<div class="image-count">+${imagenes.length - 1}</div>` : ''}
                
                ${botonesAccion}
            </div>
            
            <div class="product-info">
                <h3 class="product-title">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion || 'Sin descripción disponible'}</p>
                
                <div class="product-price">
                    <span class="current-price">$${precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                    ${precioOriginal ? `<span class="original-price">$${precioOriginal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>` : ''}
                    ${descuento > 0 ? `<span class="discount-badge">-${descuento}%</span>` : ''}
                </div>
                
                <div class="product-meta">
                    <div class="product-rating">
                        <span class="stars">★★★★☆</span>
                        <span class="rating-count">(${Math.floor(Math.random() * 50) + 10})</span>
                    </div>
                    <span class="product-stock ${producto.stock <= 0 ? 'out-of-stock' : ''}">
                        ${producto.stock <= 0 ? 'Agotado' : `${producto.stock} disponibles`}
                    </span>
                </div>
            </div>
        </div>
    `;
    }

    setupProductListeners() {
        // Click en producto para ir a detalles
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Evitar navegación si se hace click en botones de acción
                if (e.target.closest('.product-actions') ||
                    e.target.closest('.action-btn')) {
                    return;
                }

                const productId = card.dataset.productId;

                // Validar que existe el ID
                if (!productId) {
                    console.error('Product ID no encontrado');
                    return;
                }

                console.log('🔗 Navegando a producto:', productId);
                window.location.href = `/producto?id=${productId}`;
            });
        });

        if (this.tipoUsuario === 'VENDEDOR') {
            // BOTONES PARA VENDEDORES

            // Botones de editar
            document.querySelectorAll('.action-btn.edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.abrirModalEdicion(btn.dataset.productId);
                });
            });

            // Botones de transformar
            document.querySelectorAll('.action-btn.transform').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.transformarProducto(btn.dataset.productId);
                });
            });

            // Botones de métricas
            document.querySelectorAll('.action-btn.analytics').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.verMetricasProducto(btn.dataset.productId);
                });
            });

        } else {
            // BOTONES PARA COMPRADORES

            // Botones de favoritos
            document.querySelectorAll('.action-btn.favorite').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFavorite(btn.dataset.productId, btn);
                });
            });

            // Botones de carrito
            document.querySelectorAll('.action-btn.cart').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.addToCart(btn.dataset.productId, btn);
                });
            });
        }
    }

    async toggleFavorite(productId, btn) {
        try {
            console.log('❤️ Toggle favorito para producto:', productId);

            // Animar botón inmediatamente
            gsap.to(btn, {
                duration: 0.2,
                scale: 1.2,
                ease: "back.out(1.7)",
                yoyo: true,
                repeat: 1
            });

            // Llamar a la API de favoritos (misma lógica que favoritos.js)
            const response = await fetch(`${this.apiBaseURL}/favoritos/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usuarioId: this.userData.user.id,
                    productoId: parseInt(productId)
                })
            });

            if (response.ok) {
                const result = await response.json();

                if (result.esFavorito) {
                    // Producto agregado a favoritos
                    btn.innerHTML = '💖';
                    btn.style.color = '#e74c3c';
                    this.mostrarToast(`Producto agregado a favoritos`, 'success');

                    // Animar corazón
                    gsap.fromTo(btn,
                        { scale: 1.5, rotation: 0 },
                        { scale: 1, rotation: 360, duration: 0.6, ease: "back.out(1.7)" }
                    );
                } else {
                    // Producto eliminado de favoritos
                    btn.innerHTML = '🤍';
                    btn.style.color = '#95a5a6';
                    this.mostrarToast(`Producto eliminado de favoritos`, 'info');

                    // Animar corazón vacío
                    gsap.to(btn, {
                        scale: 0.8,
                        duration: 0.3,
                        yoyo: true,
                        repeat: 1,
                        ease: "power2.out"
                    });
                }

                // Actualizar contador de favoritos
                this.actualizarContadorFavoritos();

                console.log('✅ Favorito actualizado:', result.esFavorito ? 'agregado' : 'eliminado');

            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar favorito');
            }

        } catch (error) {
            console.error('❌ Error toggle favorito:', error);
            this.mostrarToast('Error al actualizar favorito: ' + error.message, 'error');

            // Restaurar botón en caso de error
            btn.innerHTML = '🤍';
            btn.style.color = '#95a5a6';
        }
    }

    async addToCart(productId, btn) {
        try {
            console.log('🛒 Agregando al carrito producto:', productId);

            // Verificar stock antes de agregar
            const producto = this.productos.find(p => p.id == productId);
            if (!producto) {
                this.mostrarToast('Producto no encontrado', 'error');
                return;
            }

            if (producto.stock <= 0) {
                this.mostrarToast('Producto sin stock disponible', 'warning');
                return;
            }

            // Animar botón inmediatamente
            gsap.to(btn, {
                duration: 0.3,
                scale: 1.3,
                rotation: 360,
                ease: "back.out(1.7)"
            });

            // Llamar a la API de carrito (misma lógica que carrito.js)
            const carritoData = {
                usuarioId: this.userData.user.id,
                productoId: parseInt(productId),
                cantidad: 1
            };

            const response = await fetch(`${this.apiBaseURL}/carrito/agregar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(carritoData)
            });

            if (response.ok) {
                const result = await response.json();

                if (result.success) {
                    this.mostrarToast(`${producto.nombre} agregado al carrito`, 'success');

                    // Animar éxito
                    gsap.to(btn, {
                        duration: 0.4,
                        scale: 1,
                        rotation: 0,
                        backgroundColor: '#27ae60',
                        ease: "back.out(1.7)",
                        onComplete: () => {
                            // Restaurar color original después de 1 segundo
                            setTimeout(() => {
                                gsap.to(btn, {
                                    backgroundColor: '',
                                    duration: 0.3
                                });
                            }, 1000);
                        }
                    });

                    // Actualizar contador de carrito
                    this.actualizarContadorCarrito();

                    console.log('✅ Producto agregado al carrito exitosamente');
                } else {
                    throw new Error(result.error || 'Error en la respuesta del servidor');
                }
            } else {
                const errorData = await response.json();
                let errorMessage = errorData.error || 'Error al agregar al carrito';

                // Manejo específico para errores de stock
                if (errorMessage.includes('Stock insuficiente')) {
                    errorMessage = `Ya tienes este producto en el carrito. Stock disponible: ${producto.stock}`;
                }

                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error('❌ Error agregando al carrito:', error);
            this.mostrarToast('Error: ' + error.message, 'error');

            // Animar error
            gsap.to(btn, {
                duration: 0.3,
                scale: 1,
                rotation: 0,
                backgroundColor: '#e74c3c',
                ease: "power2.out",
                onComplete: () => {
                    setTimeout(() => {
                        gsap.to(btn, {
                            backgroundColor: '',
                            duration: 0.3
                        });
                    }, 1000);
                }
            });
        }
    }

    async actualizarContadorFavoritos() {
        try {
            const response = await fetch(`${this.apiBaseURL}/favoritos/usuario/${this.userData.user.id}/contador`);

            if (response.ok) {
                const result = await response.json();
                const favBtn = document.getElementById('favorites-btn');
                if (favBtn) {
                    favBtn.setAttribute('data-quantity', result.totalFavoritos || 0);

                    // Animar contador
                    if (result.totalFavoritos > 0) {
                        gsap.fromTo(favBtn,
                            { scale: 1.2, color: '#e74c3c' },
                            { scale: 1, color: 'inherit', duration: 0.5, ease: "back.out(1.7)" }
                        );
                    }
                }
                console.log('✅ Contador favoritos actualizado:', result.totalFavoritos);
            }
        } catch (error) {
            console.error('❌ Error actualizando contador favoritos:', error);
        }
    }

    async actualizarContadorCarrito() {
        try {
            const response = await fetch(`${this.apiBaseURL}/carrito/contar/${this.userData.user.id}`);

            if (response.ok) {
                const result = await response.json();
                const cartBtn = document.getElementById('cart-btn');
                if (cartBtn) {
                    cartBtn.setAttribute('data-quantity', result.cantidadProductos || 0);

                    // Animar contador
                    if (result.cantidadProductos > 0) {
                        gsap.fromTo(cartBtn,
                            { scale: 1.2, color: '#3498db' },
                            { scale: 1, color: 'inherit', duration: 0.5, ease: "back.out(1.7)" }
                        );
                    }
                }
                console.log('✅ Contador carrito actualizado:', result.cantidadProductos);
            }
        } catch (error) {
            console.error('❌ Error actualizando contador carrito:', error);
        }
    }

    updateProductsCount() {
        const count = this.filteredProducts.length;
        const countText = count === 1 ? '1 producto' : `${count} productos`;
        document.getElementById('products-count').textContent = countText;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        const container = document.getElementById('pagination-container');

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Botón anterior
        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="prev">
                ‹
            </button>
        `;

        // Páginas
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
        }

        // Botón siguiente
        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="next">
                ›
            </button>
        `;

        container.innerHTML = paginationHTML;

        // Event listeners para paginación
        container.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;

                if (page === 'prev' && this.currentPage > 1) {
                    this.currentPage--;
                } else if (page === 'next' && this.currentPage < totalPages) {
                    this.currentPage++;
                } else if (!isNaN(page)) {
                    this.currentPage = parseInt(page);
                }

                this.displayProducts();
                this.scrollToTop();
            });
        });
    }

    scrollToTop() {
        gsap.to(window, {
            duration: 0.6,
            scrollTo: { y: 0 },
            ease: "power2.out"
        });
    }

    showLoading() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Cargando productos...</p>
            </div>
        `;
    }

    showEmptyState(title, description) {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3 class="empty-title">${title}</h3>
                <p class="empty-description">${description}</p>
            </div>
        `;
    }

    personalizarPorTipoUsuario() {
        if (this.tipoUsuario === 'VENDEDOR') {
            // Ocultar botones de carrito y favoritos para vendedores
            document.querySelectorAll('.cart-section, .favorites-section').forEach(el => {
                el.classList.add('vendedor-hidden');
            });
        }
    }

    loadCartCounter() {
        const carritoData = localStorage.getItem('carrito');
        if (carritoData) {
            const carrito = JSON.parse(carritoData);
            const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
            this.updateCartCounter(totalItems);
        }
    }

    loadFavoritesCounter() {
        const favoritosData = localStorage.getItem('favoritos');
        if (favoritosData) {
            const favoritos = JSON.parse(favoritosData);
            this.updateFavoritesCounter(favoritos.length);
        }
    }

    updateCartCounter(count) {
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.setAttribute('data-quantity', count);
        }
    }

    updateFavoritesCounter(count) {
        const favBtn = document.getElementById('favorites-btn');
        if (favBtn) {
            favBtn.setAttribute('data-quantity', count);
        }
    }

    // ==================== MÉTODOS PARA VENDEDORES ====================

    async abrirModalEdicion(productId) {
        try {
            console.log('🔧 Abriendo modal de edición para producto:', productId);

            // PASO 1: Obtener datos del producto (igual que perfil.js)
            const response = await fetch(`${this.apiBaseURL}/productos/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar producto');
            }

            const producto = await response.json();
            console.log('📦 Producto a editar:', producto);

            // PASO 2: Mostrar modal ANTES de cargar categorías (igual que perfil.js)
            const modal = document.getElementById('modalEditarProducto');
            modal.style.display = 'flex';

            // PASO 3: Limpiar imágenes seleccionadas (igual que perfil.js)
            this.selectedEditImages = [];
            document.getElementById('editarImagePreviewContainer').innerHTML = '';

            // PASO 4: Llenar formulario con datos del producto (igual que perfil.js)
            document.getElementById('editarProductoId').value = producto.id;
            document.getElementById('editarProductoNombre').value = producto.nombre;
            document.getElementById('editarProductoPrecio').value = producto.precio;
            document.getElementById('editarProductoStock').value = producto.stock;
            document.getElementById('editarProductoDescripcion').value = producto.descripcion;

            // PASO 5: Cargar categorías (método específico igual que perfil.js)
            await this.cargarCategoriasEditar();

            // PASO 6: Establecer categoría actual (igual que perfil.js)
            setTimeout(() => {
                if (producto.categoria && producto.categoria.id) {
                    const selectCategoria = document.getElementById('editarProductoCategoria');
                    if (selectCategoria) {
                        selectCategoria.value = producto.categoria.id;
                        console.log('✅ Categoría seleccionada:', producto.categoria.nombre);
                    } else {
                        console.error('❌ Selector de categoría no encontrado');
                    }
                }
            }, 100);

            // PASO 7: Establecer estado del toggle (igual que perfil.js)
            const toggleActivo = document.getElementById('editarProductoActivo');
            if (toggleActivo) {
                toggleActivo.checked = producto.activo;
            }

            // PASO 8: Mostrar imágenes actuales (igual que perfil.js)
            this.mostrarImagenesActuales(producto.imagen);

            // PASO 9: Animar modal (igual que perfil.js)
            gsap.fromTo(modal.querySelector('.modal-content'),
                { opacity: 0, scale: 0.7, y: -50 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
            );

            console.log('✅ Modal de edición abierto correctamente');

        } catch (error) {
            console.error('❌ Error abriendo modal de edición:', error);
            this.mostrarToast('Error al cargar datos del producto', 'error');
        }
    }

    mostrarImagenesActuales(imagenString) {
        const container = document.getElementById('imagenesActualesList');
        container.innerHTML = '';

        if (!imagenString) return;

        const imagenes = imagenString.split(/[|,]/).filter(img => img.trim());

        imagenes.forEach((imagen, index) => {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'imagen-actual';

            const nombreImagen = imagen.trim();
            const numeroImagen = index + 1;

            // Crear elementos separadamente para evitar problemas de comillas
            const img = document.createElement('img');
            img.src = `http://localhost:8080/imagenes-productos/${nombreImagen}`;
            img.alt = `Imagen ${numeroImagen}`;
            img.className = 'imagen-producto-actual';

            img.onerror = function() {
                console.error(`Error cargando imagen ${numeroImagen}: ${nombreImagen}`);
                this.style.display = 'none';

                const errorDiv = document.createElement('div');
                errorDiv.className = 'imagen-error-placeholder';
                errorDiv.innerHTML = `
                <div class="error-icon">📷</div>
                <div class="error-text">Error</div>
            `;

                this.parentElement.appendChild(errorDiv);
            };

            // Crear número indicador
            const numeroIndicador = document.createElement('div');
            numeroIndicador.className = 'numero-imagen';
            numeroIndicador.textContent = numeroImagen;

            // Crear botón eliminar
            const eliminarBtn = document.createElement('button');
            eliminarBtn.className = 'eliminar-imagen-btn';
            eliminarBtn.innerHTML = '×';
            eliminarBtn.title = `Eliminar imagen ${numeroImagen}`;
            eliminarBtn.onclick = () => this.eliminarImagenActual(nombreImagen, imageDiv);

            // Ensamblar elementos
            imageDiv.appendChild(img);
            imageDiv.appendChild(numeroIndicador);
            imageDiv.appendChild(eliminarBtn);
            container.appendChild(imageDiv);

            // Animar entrada
            gsap.fromTo(imageDiv,
                {opacity: 0, scale: 0.8},
                {opacity: 1, scale: 1, duration: 0.3, delay: index * 0.1, ease: "back.out(1.7)"}
            );
        });
    }

    async cargarCategoriasEditar() {
        const select = document.getElementById('editarProductoCategoria');
        if (select && select.children.length > 1) {
            console.log('✅ Categorías ya cargadas en selector editar');
            return; // Ya están cargadas
        }

        try {
            console.log('🔄 Cargando categorías para editar (método específico)...');

            const response = await fetch(`${this.apiBaseURL}/categorias`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const categorias = await response.json();
                console.log('✅ Categorías obtenidas para editar:', categorias);

                if (select) {
                    // Limpiar opciones existentes excepto la primera
                    select.innerHTML = '<option value="">Seleccionar categoría</option>';

                    categorias.forEach(categoria => {
                        const option = document.createElement('option');
                        option.value = categoria.id;
                        option.textContent = categoria.nombre;
                        select.appendChild(option);
                    });

                    console.log('✅ Selector editar llenado con', categorias.length, 'categorías');
                    console.log('✅ Opciones finales:', select.children.length);
                }
            } else {
                throw new Error('Error al cargar categorías');
            }
        } catch (error) {
            console.error('❌ Error cargando categorías para editar:', error);
            this.mostrarToast('Error al cargar categorías', 'error');
        }
    }

    async cargarCategoriasModal() {
        console.log('🔄 Cargando categorías para modales (método perfil.js)...');

        try {
            const response = await fetch(`${this.apiBaseURL}/categorias`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const categorias = await response.json();
                console.log('✅ Categorías obtenidas:', categorias);

                // LLENAR SELECTOR DE EDITAR (método perfil.js)
                const selectEditar = document.getElementById('editarProductoCategoria');
                if (selectEditar) {
                    console.log('🔧 Llenando selector editar con método perfil.js...');

                    // Limpiar opciones existentes excepto la primera
                    selectEditar.innerHTML = '<option value="">Seleccionar categoría</option>';

                    categorias.forEach(categoria => {
                        const option = document.createElement('option');
                        option.value = categoria.id;
                        option.textContent = categoria.nombre;
                        selectEditar.appendChild(option);
                    });

                    console.log('✅ Selector EDITAR llenado con', categorias.length, 'categorías');
                    console.log('✅ Total opciones en selector:', selectEditar.children.length);
                } else {
                    console.error('❌ No se encontró selector editarProductoCategoria');
                }

                // LLENAR SELECTOR DE NUEVO (método perfil.js)
                const selectNuevo = document.getElementById('nuevoProductoCategoria');
                if (selectNuevo) {
                    console.log('🔧 Llenando selector nuevo con método perfil.js...');

                    // Limpiar opciones existentes excepto la primera
                    selectNuevo.innerHTML = '<option value="">Seleccionar categoría</option>';

                    categorias.forEach(categoria => {
                        const option = document.createElement('option');
                        option.value = categoria.id;
                        option.textContent = categoria.nombre;
                        selectNuevo.appendChild(option);
                    });

                    console.log('✅ Selector NUEVO llenado con', categorias.length, 'categorías');
                } else {
                    console.error('❌ No se encontró selector nuevoProductoCategoria');
                }

                return categorias;
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error cargando categorías:', error);
            this.mostrarToast('Error al cargar categorías', 'error');
            return [];
        }
    }

    // MÉTODO DE DEBUG TEMPORAL - Agregar después de cargarCategoriasModal()
    async debugCategoriesEndpoint() {
        try {
            console.log('🔍 DEBUG: Verificando endpoint de categorías...');
            console.log('🔍 URL:', `${this.apiBaseURL}/categorias`);

            // Probar endpoint directo
            const response = await fetch(`${this.apiBaseURL}/categorias`);
            console.log('🔍 Response status:', response.status);
            console.log('🔍 Response headers:', [...response.headers.entries()]);

            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Data recibida:', data);
                console.log('🔍 Tipo de data:', typeof data);
                console.log('🔍 Es array:', Array.isArray(data));
                if (Array.isArray(data)) {
                    console.log('🔍 Cantidad elementos:', data.length);
                    data.forEach((cat, i) => console.log(`🔍 Categoría ${i}:`, cat));
                }
            } else {
                const errorText = await response.text();
                console.log('🔍 Error response:', errorText);
            }
        } catch (error) {
            console.error('🔍 Error en debug:', error);
        }
    }

    setupModalEventListeners() {
        // Event listener para el formulario
        const form = document.getElementById('formEditarProductoCategoria');
        form.onsubmit = (e) => this.guardarEdicionProducto(e);

        // Event listener para subir imágenes
        const inputImagenes = document.getElementById('editarProductoImagenes');
        inputImagenes.onchange = (e) => this.handleEditImageSelection(e);

        // Event listener para área de drag & drop
        const uploadArea = document.getElementById('editarImageUploadArea');
        uploadArea.onclick = () => inputImagenes.click();
    }

    handleEditImageSelection(event) {
        const files = event.target.files;
        this.handleEditImageFiles(files);
    }

    handleEditImageFiles(files) {
        const maxFiles = 3;
        const maxSizePerFile = 5 * 1024 * 1024; // 5MB

        if (files.length === 0) return;

        this.selectedEditImages = this.selectedEditImages || [];

        // Verificar límite total
        const totalAfterAdd = this.selectedEditImages.length + files.length;
        if (totalAfterAdd > maxFiles) {
            this.mostrarToast(`Máximo ${maxFiles} imágenes permitidas`, 'warning');
            return;
        }

        // Procesar cada archivo
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                this.mostrarToast('Solo se permiten archivos de imagen', 'error');
                return;
            }

            if (file.size > maxSizePerFile) {
                this.mostrarToast('Cada imagen debe ser menor a 5MB', 'error');
                return;
            }

            this.selectedEditImages.push(file);
            this.addEditImagePreview(file);
        });
    }

    addEditImagePreview(file) {
        const container = document.getElementById('editarImagePreviewContainer');
        const preview = document.createElement('div');
        preview.className = 'image-preview';

        const img = document.createElement('img');
        const removeBtn = document.createElement('button');
        removeBtn.className = 'image-remove';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => this.removeEditImage(file, preview);

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        preview.appendChild(img);
        preview.appendChild(removeBtn);
        container.appendChild(preview);

        // Animar entrada
        gsap.fromTo(preview,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
    }

    removeEditImage(file, previewElement) {
        this.selectedEditImages = this.selectedEditImages.filter(img => img !== file);

        gsap.to(previewElement, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                if (previewElement.parentNode) {
                    previewElement.parentNode.removeChild(previewElement);
                }
            }
        });
    }

    async guardarEdicionProducto(e) {
        e.preventDefault();

        const productoId = document.getElementById('editarProductoId').value;
        const nombre = document.getElementById('editarProductoNombre').value.trim();
        const precio = parseFloat(document.getElementById('editarProductoPrecio').value);
        const stock = parseInt(document.getElementById('editarProductoStock').value);
        const categoriaId = parseInt(document.getElementById('editarProductoCategoria').value);
        const descripcion = document.getElementById('editarProductoDescripcion').value.trim();

        // Validaciones (igual que perfil.js)
        if (!nombre || !precio || !stock || !categoriaId || !descripcion) {
            this.mostrarToast('Todos los campos son obligatorios', 'warning');
            return;
        }

        if (precio <= 0) {
            this.mostrarToast('El precio debe ser mayor a 0', 'warning');
            return;
        }

        if (stock < 0) {
            this.mostrarToast('El stock no puede ser negativo', 'warning');
            return;
        }

        // Mostrar loading en el botón (igual que perfil.js)
        const btnGuardar = document.querySelector('#formEditarProductoCategoria button[type="submit"]');
        const textoOriginal = btnGuardar.innerHTML;
        btnGuardar.innerHTML = '<span class="loading-spinner-small"></span>Guardando...';
        btnGuardar.disabled = true;

        try {
            // PASO 1: Obtener datos completos del producto actual (IGUAL QUE PERFIL.JS)
            console.log('🔄 Obteniendo datos actuales del producto...');
            const responseGet = await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!responseGet.ok) {
                throw new Error('Error al obtener datos del producto');
            }

            const productoActual = await responseGet.json();
            console.log('✅ Producto actual obtenido:', productoActual);

            // PASO 2: Actualizar datos básicos del producto (IGUAL QUE PERFIL.JS)
            const productoData = {
                id: parseInt(productoId),
                nombre: nombre,
                descripcion: descripcion,
                precio: precio,
                stock: stock,
                categoria: { id: categoriaId },
                vendedor: { id: this.userData.user.id }, // USAR ESTRUCTURA CORRECTA
                activo: productoActual.activo, // PRESERVAR estado actual
                fechacreacion: productoActual.fechacreacion, // PRESERVAR fecha original
                imagen: productoActual.imagen // PRESERVAR imágenes actuales
            };

            console.log('📝 Actualizando datos básicos del producto...');
            const response = await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(productoData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

            console.log('✅ Datos básicos actualizados correctamente');

            // PASO 3: Si hay nuevas imágenes, subirlas (IGUAL QUE PERFIL.JS)
            if (this.selectedEditImages && this.selectedEditImages.length > 0) {
                console.log('📷 Subiendo nuevas imágenes...');
                await this.subirNuevasImagenesCategoria(productoId);
            }

            this.mostrarToast('Producto actualizado correctamente', 'success');
            this.cerrarModalEdicion();

            // Recargar productos para mostrar cambios
            setTimeout(() => {
                this.loadProducts();
            }, 500);

        } catch (error) {
            console.error('❌ Error actualizando producto:', error);
            this.mostrarToast(`Error al actualizar producto: ${error.message}`, 'error');
        } finally {
            // Restaurar botón
            btnGuardar.innerHTML = textoOriginal;
            btnGuardar.disabled = false;
        }
    }

    async subirNuevasImagenesCategoria(productoId) {
        if (!this.selectedEditImages || this.selectedEditImages.length === 0) return;

        console.log(`🆕 Subiendo ${this.selectedEditImages.length} nuevas imágenes para producto ${productoId}`);

        const formData = new FormData();

        this.selectedEditImages.forEach((imagen, index) => {
            formData.append('archivos', imagen);
            console.log(`Nueva imagen ${index + 1}: ${imagen.name}`);
        });

        try {
            // Usar mismo endpoint que perfil.js
            const response = await fetch(`${this.apiBaseURL}/imagenes/subir`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                const nombresImagenes = await response.json();
                console.log('✅ Nuevas imágenes subidas:', nombresImagenes);

                // Agregar a las existentes (igual que perfil.js)
                await this.actualizarImagenesProductoCategoria(productoId, nombresImagenes);

                this.mostrarToast('Nuevas imágenes agregadas correctamente', 'success');
                return nombresImagenes;
            } else {
                const errorText = await response.text();
                throw new Error(`Error al subir nuevas imágenes: ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Error subiendo nuevas imágenes:', error);
            this.mostrarToast(`Error al subir nuevas imágenes: ${error.message}`, 'error');
            throw error;
        }
    }

    async actualizarImagenesProductoCategoria(productoId, nuevasImagenes) {
        try {
            console.log('🔄 Actualizando imágenes del producto (método perfil.js)...');

            // Obtener producto actual (igual que perfil.js)
            const responseGet = await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!responseGet.ok) {
                throw new Error('No se pudo obtener el producto');
            }

            const producto = await responseGet.json();
            console.log('📦 Producto actual:', producto);

            // Crear string de imágenes (igual que perfil.js)
            const imagenesString = Array.isArray(nuevasImagenes) ? nuevasImagenes.join(',') : nuevasImagenes;

            // Combinar con imágenes existentes si las hay (igual que perfil.js)
            let imagenesFinales = imagenesString;
            if (producto.imagen && producto.imagen.trim()) {
                imagenesFinales = producto.imagen + ',' + imagenesString;
            }

            console.log('🖼️ Imágenes finales a guardar:', imagenesFinales);

            // Actualizar SOLO el campo imagen (igual que perfil.js)
            const productoActualizado = {
                ...producto,
                imagen: imagenesFinales
            };

            const response = await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(productoActualizado)
            });

            if (response.ok) {
                console.log('✅ Imágenes actualizadas en el producto');
                return true;
            } else {
                const errorText = await response.text();
                console.error('❌ Error actualizando producto:', errorText);
                throw new Error('No se pudieron asociar las imágenes');
            }
        } catch (error) {
            console.error('❌ Error en actualizarImagenesProductoCategoria:', error);
            throw error;
        }
    }

    cerrarModalEdicion() {
        const modal = document.getElementById('modalEditarProducto');

        gsap.to(modal.querySelector('.modal-content'), {
            opacity: 0,
            scale: 0.7,
            y: -50,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                modal.style.display = 'none';

                // Limpiar formulario completamente
                const form = document.getElementById('formEditarProductoCategoria');
                if (form) {
                    form.reset();
                }

                // Limpiar previews de imágenes
                document.getElementById('editarImagePreviewContainer').innerHTML = '';
                document.getElementById('imagenesActualesList').innerHTML = '';

                // Limpiar arrays de imágenes
                this.selectedEditImages = [];
            }
        });
    }

    async eliminarImagenActual(nombreImagen, imagenDiv) {
        if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;

        try {
            console.log('🗑️ Eliminando imagen:', nombreImagen);

            // PASO 1: Remover visualmente PRIMERO (igual que perfil.js)
            if (imagenDiv) {
                gsap.to(imagenDiv, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: () => {
                        if (imagenDiv.parentNode) {
                            imagenDiv.parentNode.removeChild(imagenDiv);
                        }
                    }
                });
            }

            // PASO 2: Intentar eliminar del servidor EN SEGUNDO PLANO (igual que perfil.js)
            const response = await fetch(`${this.apiBaseURL}/imagenes/${nombreImagen}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                console.log('✅ Imagen eliminada del servidor');
                this.mostrarToast('Imagen eliminada correctamente', 'success');
            } else {
                console.warn('⚠️ No se pudo eliminar del servidor, pero se removió visualmente');
                this.mostrarToast('Imagen removida (verifica en el servidor)', 'warning');
            }

            // PASO 3: Actualizar la base de datos del producto (igual que perfil.js)
            await this.actualizarImagenesProductoEliminandoCategoria(nombreImagen);

        } catch (error) {
            console.error('❌ Error:', error);
            this.mostrarToast('Imagen removida visualmente', 'warning');
        }
    }

    async actualizarImagenesProductoEliminandoCategoria(nombreImagenEliminada) {
        try {
            const productoId = document.getElementById('editarProductoId').value;
            if (!productoId) return;

            console.log('🔄 Actualizando producto eliminando imagen:', nombreImagenEliminada);

            // Obtener producto actual (igual que perfil.js)
            const response = await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const producto = await response.json();

                if (producto.imagen) {
                    // Remover la imagen eliminada de la lista (igual que perfil.js)
                    const imagenesArray = producto.imagen.split(/[|,]/)
                        .map(img => img.trim())
                        .filter(img => img && img !== nombreImagenEliminada);

                    const nuevasImagenes = imagenesArray.join('|'); // Usar pipe como separador

                    // Actualizar producto (igual que perfil.js)
                    const productoActualizado = {
                        ...producto,
                        imagen: nuevasImagenes || null
                    };

                    const updateResponse = await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(productoActualizado)
                    });

                    if (updateResponse.ok) {
                        console.log('✅ Producto actualizado sin la imagen eliminada');
                    } else {
                        console.error('❌ Error actualizando producto');
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error actualizando producto después de eliminar imagen:', error);
        }
    }

    transformarProducto(productId) {
        // Implementar lógica de transformación
        this.mostrarToast('Función de transformar producto en desarrollo', 'info');
    }

    verMetricasProducto(productId) {
        // Implementar navegación a métricas del producto
        this.mostrarToast('Función de métricas en desarrollo', 'info');
    }

// Método para mostrar toast (si no existe)
    mostrarToast(mensaje, tipo = 'info') {
        // Crear container si no existe
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.style.cssText = `
        background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : tipo === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        padding: 12px 24px;
        margin: 8px 0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
        toast.textContent = mensaje;

        container.appendChild(toast);

        // Animar entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Eliminar después de 4 segundos
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    // ==================== MÉTODOS PARA CREAR PRODUCTOS ====================

    async abrirModalProducto() {
        try {
            console.log('➕ Abriendo modal de nuevo producto');

            // PRIMERO: Cargar categorías
            await this.cargarCategoriasModal();

            // SEGUNDO: Limpiar formulario
            document.getElementById('formNuevoProductoCategoria').reset();
            this.selectedNewImages = [];
            document.getElementById('nuevoImagePreviewContainer').innerHTML = '';

            // TERCERO: Mostrar modal
            const modal = document.getElementById('modalNuevoProductoCategoria');
            modal.style.display = 'flex';

            // Animar modal
            gsap.fromTo(modal.querySelector('.modal-content'),
                { opacity: 0, scale: 0.7, y: -50 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
            );

            console.log('✅ Modal de nuevo producto abierto correctamente');

        } catch (error) {
            console.error('❌ Error abriendo modal de producto:', error);
            this.mostrarToast('Error al abrir creador de producto', 'error');
        }
    }

    async cargarCategoriasModal() {
        try {
            const response = await fetch(`${this.apiBaseURL}/categorias`);
            if (response.ok) {
                const categorias = await response.json();
                const select = document.getElementById('nuevoProductoCategoria');

                // Limpiar opciones excepto la primera
                while (select.children.length > 1) {
                    select.removeChild(select.lastChild);
                }

                categorias.forEach(categoria => {
                    const option = document.createElement('option');
                    option.value = categoria.id;
                    option.textContent = categoria.nombre;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
        }
    }

    handleNewProductImageSelection(event) {
        const files = event.target.files;
        this.handleNewProductImageFiles(files);
    }

    handleNewProductImageFiles(files) {
        const maxFiles = 3;
        const maxSizePerFile = 5 * 1024 * 1024; // 5MB

        if (files.length === 0) return;

        this.selectedNewImages = this.selectedNewImages || [];

        // Verificar límite total
        const totalAfterAdd = this.selectedNewImages.length + files.length;
        if (totalAfterAdd > maxFiles) {
            this.mostrarToast(`Máximo ${maxFiles} imágenes permitidas`, 'warning');
            return;
        }

        // Procesar cada archivo
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                this.mostrarToast('Solo se permiten archivos de imagen', 'error');
                return;
            }

            if (file.size > maxSizePerFile) {
                this.mostrarToast('Cada imagen debe ser menor a 5MB', 'error');
                return;
            }

            this.selectedNewImages.push(file);
            this.addNewProductImagePreview(file);
        });
    }

    addNewProductImagePreview(file) {
        const container = document.getElementById('nuevoImagePreviewContainer');
        const preview = document.createElement('div');
        preview.className = 'image-preview';

        const img = document.createElement('img');
        const removeBtn = document.createElement('button');
        removeBtn.className = 'image-remove';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => this.removeNewProductImage(file, preview);

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        preview.appendChild(img);
        preview.appendChild(removeBtn);
        container.appendChild(preview);

        // Animar entrada
        gsap.fromTo(preview,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
    }

    removeNewProductImage(file, previewElement) {
        this.selectedNewImages = this.selectedNewImages.filter(img => img !== file);

        gsap.to(previewElement, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                if (previewElement.parentNode) {
                    previewElement.parentNode.removeChild(previewElement);
                }
            }
        });
    }

    async crearNuevoProducto(e) {
        e.preventDefault();

        const nombre = document.getElementById('nuevoProductoNombre').value.trim();
        const precio = parseFloat(document.getElementById('nuevoProductoPrecio').value);
        const stock = parseInt(document.getElementById('nuevoProductoStock').value);
        const categoriaId = parseInt(document.getElementById('nuevoProductoCategoria').value);
        const descripcion = document.getElementById('nuevoProductoDescripcion').value.trim();

        // Validaciones
        if (!nombre || !precio || !stock || !categoriaId || !descripcion) {
            this.mostrarToast('Todos los campos son obligatorios', 'warning');
            return;
        }

        if (precio <= 0) {
            this.mostrarToast('El precio debe ser mayor a 0', 'warning');
            return;
        }

        if (stock < 0) {
            this.mostrarToast('El stock no puede ser negativo', 'warning');
            return;
        }

        // Mostrar loading
        const btnGuardar = document.querySelector('#formNuevoProductoCategoria button[type="submit"]');
        const textoOriginal = btnGuardar.innerHTML;
        btnGuardar.innerHTML = '<span class="loading-spinner-small"></span>Creando...';
        btnGuardar.disabled = true;

        try {
            // Paso 1: Crear producto básico
            const productoData = {
                nombre: nombre,
                descripcion: descripcion,
                precio: precio,
                stock: stock,
                categoria: { id: categoriaId },
                vendedor: { id: this.userData.user.id },
                activo: true,
                imagen: '' // Se llenará después
            };

            console.log('📦 Creando producto:', productoData);

            const response = await fetch(`${this.apiBaseURL}/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(productoData)
            });

            if (response.ok) {
                const productoCreado = await response.json();
                console.log('✅ Producto creado:', productoCreado);

                // Paso 2: Subir imágenes si las hay
                if (this.selectedNewImages && this.selectedNewImages.length > 0) {
                    await this.subirImagenesNuevoProducto(productoCreado.id);
                }

                this.mostrarToast('Producto creado correctamente', 'success');
                this.cerrarModalProducto();

                // Recargar productos para mostrar el nuevo
                setTimeout(() => {
                    this.loadProducts();
                }, 500);

            } else {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }

        } catch (error) {
            console.error('❌ Error creando producto:', error);
            this.mostrarToast(`Error al crear producto: ${error.message}`, 'error');
        } finally {
            btnGuardar.innerHTML = textoOriginal;
            btnGuardar.disabled = false;
        }
    }

    async subirImagenesNuevoProducto(productoId) {
        if (!this.selectedNewImages || this.selectedNewImages.length === 0) return;

        console.log(`📷 Subiendo ${this.selectedNewImages.length} imágenes para producto ${productoId}`);

        const formData = new FormData();

        this.selectedNewImages.forEach((imagen, index) => {
            formData.append('archivos', imagen);
            console.log(`Nueva imagen ${index + 1}: ${imagen.name}`);
        });

        try {
            const response = await fetch(`${this.apiBaseURL}/imagenes/subir`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                const nombresImagenes = await response.json();
                console.log('✅ Imágenes subidas:', nombresImagenes);

                // Actualizar producto con imágenes
                await this.actualizarImagenesProductoNuevo(productoId, nombresImagenes);

                return nombresImagenes;
            } else {
                const errorText = await response.text();
                throw new Error(`Error al subir imágenes: ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Error subiendo imágenes:', error);
            this.mostrarToast(`Error al subir imágenes: ${error.message}`, 'error');
            throw error;
        }
    }

    async actualizarImagenesProductoNuevo(productoId, nombresImagenes) {
        try {
            console.log('🔄 Actualizando producto con imágenes...');

            // Obtener producto actual
            const response = await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const producto = await response.json();

                // Usar pipe como separador
                const imagenesCombinadas = nombresImagenes.join('|');

                // Actualizar producto con imágenes
                const productoActualizado = {
                    ...producto,
                    imagen: imagenesCombinadas
                };

                const updateResponse = await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(productoActualizado)
                });

                if (updateResponse.ok) {
                    console.log('✅ Imágenes actualizadas en el producto');
                } else {
                    throw new Error('Error al actualizar imágenes en la base de datos');
                }
            }
        } catch (error) {
            console.error('❌ Error actualizando imágenes del producto:', error);
            throw error;
        }
    }

    cerrarModalProducto() {
        const modal = document.getElementById('modalNuevoProductoCategoria');

        gsap.to(modal.querySelector('.modal-content'), {
            opacity: 0,
            scale: 0.7,
            y: -50,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                modal.style.display = 'none';

                // Limpiar formulario
                const form = document.getElementById('formNuevoProductoCategoria');
                if (form) {
                    form.reset();
                }

                // Limpiar previews de imágenes
                document.getElementById('nuevoImagePreviewContainer').innerHTML = '';

                // Limpiar array de imágenes
                this.selectedNewImages = [];
            }
        });
    }

    mostrarToast(mensaje, tipo = 'info') {
        // Crear contenedor si no existe
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(52, 152, 219, 0.3);
        color: #2c3e50;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        font-weight: 500;
        max-width: 300px;
        transform: translateX(400px);
        opacity: 0;
    `;

        // Colores según tipo
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };

        if (colors[tipo]) {
            toast.style.borderLeftColor = colors[tipo];
            toast.style.borderLeftWidth = '4px';
        }

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

}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.categoriasInstance = new CategoriasPage();
});

// Manejar resize
window.addEventListener('resize', () => {
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
});
