// perfil.js - Sistema completo para usuarios compradores
class PerfilUsuario {
    constructor() {
        this.usuarioActual = null;
        this.tipoUsuario = null;
        this.apiBaseURL = 'http://localhost:8080/api';
        this.editMode = false;
        this.selectedImages = []; // Array para almacenar las imágenes seleccionadas
        this.selectedEditImages = []; // Array para imágenes de editar producto
        this.productosVendedor = []; // Array para almacenar productos del vendedor
        this.categoriasVendedor = []; // Array para categorías con productos
        this.filtroEstadoActual = 'activos'; // Estado actual del filtro
        this.filtroCategoriaActual = null; // Categoría actual del filtro
        this.modoReemplazarImagenes = false; // Flag para modo reemplazar imágenes
        this.init();
    }

    async init() {
        try {
            this.mostrarLoadingScreen();
            await this.cargarUsuario();

            if (this.tipoUsuario === 'VENDEDOR') {
                await this.cargarCategorias();
            }

            this.setupEventListeners();
            this.initAnimaciones();
            this.configurarPerfil();

            setTimeout(() => {
                this.ocultarLoadingScreen();
            }, 1000);
        } catch (error) {
            console.error('Error inicializando perfil:', error);
            this.ocultarLoadingScreen();
            this.mostrarToast('Error al cargar el perfil', 'error');
        }
    }

    mostrarLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.display = 'flex';

        gsap.to('.loading-spinner', {
            rotation: 360,
            duration: 1,
            repeat: -1,
            ease: "none"
        });
    }

    ocultarLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const container = document.querySelector('.perfil-container');

        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                loadingScreen.style.display = 'none';
            }
        });

        gsap.to(container, {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out"
        });
    }

    async cargarUsuario() {
        // Obtener datos del localStorage
        const usuarioId = localStorage.getItem('usuarioId');
        const token = localStorage.getItem('token');
        const usuarioGuardado = localStorage.getItem('usuario');

        console.log('Debug - Datos en localStorage:', {usuarioId, token, usuarioGuardado});

        // VERIFICACIÓN SIMPLE - Solo verificar que existan
        if (!usuarioId || !token) {
            console.log('No hay token o usuarioId, redirigiendo a login');
            window.location.href = 'login';
            return;
        }

        // CARGAR DATOS INMEDIATAMENTE desde localStorage
        if (usuarioGuardado) {
            try {
                this.usuarioActual = JSON.parse(usuarioGuardado);
                this.tipoUsuario = this.usuarioActual.tipousuario ||
                    this.usuarioActual.tipoUsuario ||
                    'COMPRADOR';

                console.log('Usuario cargado desde localStorage:', this.usuarioActual);
                console.log('Tipo de usuario detectado:', this.tipoUsuario);

                this.mostrarDatosUsuario();
            } catch (error) {
                console.error('Error parseando usuario desde localStorage:', error);
                // Crear usuario básico si hay error parseando
                this.crearUsuarioBasico(usuarioId);
            }
        } else {
            // Si no hay datos en localStorage, crear usuario básico
            this.crearUsuarioBasico(usuarioId);
        }

        // OPCIONAL: Intentar actualizar desde el servidor EN SEGUNDO PLANO
        this.actualizarDatosServidor(usuarioId, token);
    }

// Función auxiliar para crear usuario básico
    crearUsuarioBasico(usuarioId) {
        this.usuarioActual = {
            id: usuarioId,
            nombre: 'Usuario',
            email: 'usuario@ejemplo.com',
            telefono: '',
            direccion: '',
            tipousuario: 'COMPRADOR'
        };
        this.tipoUsuario = 'COMPRADOR';
        this.mostrarDatosUsuario();
        console.log('Usuario básico creado');
    }

    // Cargar categorías para el modal de productos
    async cargarCategorias() {
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
                const select = document.getElementById('productoCategoria');

                if (select) {
                    // Limpiar opciones existentes excepto la primera
                    select.innerHTML = '<option value="">Seleccionar categoría</option>';

                    categorias.forEach(categoria => {
                        const option = document.createElement('option');
                        option.value = categoria.id;
                        option.textContent = categoria.nombre;
                        select.appendChild(option);
                    });

                    console.log('Categorías cargadas:', categorias);
                }
            } else {
                throw new Error('Error al cargar categorías');
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
            this.mostrarToast('Error al cargar categorías', 'error');
        }
    }

// Función auxiliar para actualizar datos del servidor (sin interrumpir la UI)
    async actualizarDatosServidor(usuarioId, token) {
        try {
            console.log('Intentando actualizar datos del servidor...');
            const response = await fetch(`${this.apiBaseURL}/usuarios/${usuarioId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const usuarioActualizado = await response.json();
                console.log('Datos actualizados del servidor:', usuarioActualizado);

                // Actualizar datos locales
                this.usuarioActual = usuarioActualizado;
                this.tipoUsuario = usuarioActualizado.tipousuario || usuarioActualizado.tipoUsuario || 'COMPRADOR';

                // Actualizar localStorage
                localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));

                // Refrescar UI con datos actualizados
                this.mostrarDatosUsuario();
                this.cargarInformacionPersonal();

                console.log('Datos del servidor aplicados exitosamente');
            } else {
                console.log('No se pudieron obtener datos del servidor, usando datos locales');
            }
        } catch (error) {
            console.log('Error conectando al servidor (modo offline):', error);
            // NO hacer nada, ya tenemos datos locales funcionando
        }
    }

    mostrarDatosUsuario() {
        const userName = document.getElementById('userName');
        const userBadge = document.getElementById('userBadge');
        const userEmail = document.getElementById('userEmail');
        const avatarText = document.getElementById('avatarText');

        if (userName) userName.textContent = this.usuarioActual.nombre || 'Usuario';
        if (userBadge) userBadge.textContent = this.tipoUsuario === 'COMPRADOR' ? 'Comprador' : 'Vendedor';
        if (userEmail) userEmail.textContent = this.usuarioActual.email || '';

        // Avatar con iniciales
        if (this.usuarioActual.nombre && avatarText) {
            const iniciales = this.usuarioActual.nombre
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase();
            avatarText.textContent = iniciales;
        }

        // Cargar información personal
        this.cargarInformacionPersonal();

        // Personalizar botones del header según tipo de usuario
        this.personalizarBotonesHeader();

        // LÍNEAS DE DEBUG:
        console.log('=== DEBUG USUARIO ===');
        console.log('Tipo de usuario:', this.tipoUsuario);
        console.log('Datos completos:', this.usuarioActual);
        console.log('=====================');

        // Animar entrada del header
        gsap.fromTo('.perfil-header',
            {opacity: 0, y: -30},
            {opacity: 1, y: 0, duration: 0.8, ease: "power2.out"}
        );
    }

    configurarPerfil() {
        // Generar navegación según tipo de usuario
        this.generarNavegacion();
        this.cargarSeccionPorDefecto();
    }

    personalizarBotonesHeader() {
        const btnExplorar = document.getElementById('btnExplorar');
        const btnCarrito = document.getElementById('btnCarrito');

        if (this.tipoUsuario === 'VENDEDOR') {
            // Cambiar "Explorar Productos" por "Crear Preorden"
            if (btnExplorar) {
                const iconSpan = btnExplorar.querySelector('.btn-icon');
                const textSpan = btnExplorar.querySelector('span:not(.btn-icon)');

                if (iconSpan) iconSpan.textContent = '📋';
                if (textSpan) textSpan.textContent = 'Crear Preorden';
            }

            // Cambiar "Mi Carrito" por "Enviar Notificación"
            if (btnCarrito) {
                const iconSpan = btnCarrito.querySelector('.btn-icon');
                const textSpan = btnCarrito.querySelector('span:not(.btn-icon):not(.badge)');
                const badge = btnCarrito.querySelector('.badge');

                if (iconSpan) iconSpan.textContent = '🔔';
                if (textSpan) textSpan.textContent = 'Enviar Notificación';

                // Ocultar el badge del carrito para vendedores
                if (badge) badge.style.display = 'none';
            }
        }
        // Para compradores, mantener los textos originales (no hacer nada)
    }

    // Generar navegación según tipo de usuario
    generarNavegacion() {
        const navContainer = document.getElementById('navContainer');
        const sectionsConfig = this.getSectionsConfig();

        navContainer.innerHTML = '';

        sectionsConfig.forEach((section, index) => {
            const button = document.createElement('button');
            button.className = 'nav-tab' + (index === 0 ? ' active' : '');
            button.dataset.section = section.id;

            // Iconos según la sección
            const iconos = {
                'informacion': '👤',
                'pedidos': '📦',
                'preordenes': '⏳',
                'direcciones': '📍',
                'favoritos': '❤️',
                'productos': '🛍️',
                'metricas': '📊',
                'resenas': '⭐'
            };

            button.innerHTML = `
            <span class="tab-icon">${iconos[section.id] || '📄'}</span>
            <span class="tab-text">${section.name}</span>
            ${this.needsBadge(section.id) ? `<span class="tab-badge" id="${section.id}Count">0</span>` : ''}
        `;

            // *** AGREGAR ESTE CÓDIGO ***
            button.addEventListener('click', () => {
                console.log(`Click en sección: ${section.id}`);
                this.mostrarSeccion(section.id);
            });

            navContainer.appendChild(button);

            // Animar entrada de cada botón
            gsap.fromTo(button,
                {opacity: 0, x: -20},
                {opacity: 1, x: 0, duration: 0.5, delay: index * 0.1, ease: "power2.out"}
            );
        });

        console.log(`Navegación generada para ${this.tipoUsuario}:`, sectionsConfig);
    }

    // Determinar qué secciones necesitan badge
    needsBadge(sectionId) {
        if (this.tipoUsuario === 'COMPRADOR') {
            const sectionsWithBadge = ['pedidos', 'preordenes', 'direcciones', 'favoritos'];
            return sectionsWithBadge.includes(sectionId);
        } else if (this.tipoUsuario === 'VENDEDOR') {
            // QUITAR CONTADORES para vendedores
            const sectionsWithBadge = [];
            return sectionsWithBadge.includes(sectionId);
        }
        return false;
    }

    // Configuración de secciones según tipo de usuario
    getSectionsConfig() {
        const baseSections = [
            {id: 'informacion', name: 'Mi Información'}
        ];

        if (this.tipoUsuario === 'COMPRADOR') {
            return [
                ...baseSections,
                {id: 'pedidos', name: 'Mis Pedidos'},
                {id: 'preordenes', name: 'Preórdenes'},
                {id: 'direcciones', name: 'Direcciones'},
                {id: 'favoritos', name: 'Favoritos'}
            ];
        } else if (this.tipoUsuario === 'VENDEDOR') {
            return [
                ...baseSections,
                {id: 'pedidos', name: 'Pedidos Recibidos'},
                {id: 'preordenes', name: 'Preórdenes Recibidas'},
                {id: 'productos', name: 'Mis Productos'},
                {id: 'metricas', name: 'Métricas'},
                {id: 'resenas', name: 'Reseñas'}
            ];
        }

        return baseSections;
    }

    cargarSeccionPorDefecto() {
        this.mostrarSeccion('informacion');
    }

    cargarInformacionPersonal() {
        document.getElementById('inputNombre').value = this.usuarioActual.nombre || '';
        document.getElementById('inputEmail').value = this.usuarioActual.email || '';
        document.getElementById('inputTelefono').value = this.usuarioActual.telefono || '';
        document.getElementById('inputDireccion').value = this.usuarioActual.direccion || '';

        // Animar las cards de información
        gsap.fromTo('.info-card',
            {opacity: 0, y: 20},
            {opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out"}
        );
    }

    mostrarSeccion(seccionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remover clase active de todos los tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Mostrar sección seleccionada
        const section = document.getElementById(`seccion${seccionId.charAt(0).toUpperCase() + seccionId.slice(1)}`);
        if (section) {
            section.classList.add('active');

            // Animar entrada de la sección
            gsap.fromTo(section,
                {opacity: 0, y: 30},
                {opacity: 1, y: 0, duration: 0.5, ease: "power2.out"}
            );
        }

        // Activar tab correspondiente
        const activeTab = document.querySelector(`[data-section="${seccionId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Cargar contenido específico de la sección
        this.cargarContenidoSeccion(seccionId);
    }

    async cargarContenidoSeccion(seccionId) {
        switch (seccionId) {
            case 'informacion':
                // Ya cargado
                break;
            case 'pedidos':
                if (this.tipoUsuario === 'COMPRADOR') {
                    await this.cargarPedidos();
                } else {
                    await this.cargarPedidosVendedor();
                }
                break;
            case 'preordenes':
                if (this.tipoUsuario === 'COMPRADOR') {
                    await this.cargarPreordenes();
                } else {
                    await this.cargarPreordenesVendedor();
                }
                break;
            case 'direcciones':
                await this.cargarDirecciones();
                break;
            case 'favoritos':
                await this.cargarFavoritos();
                break;
            case 'productos':
                await this.cargarProductosVendedor();
                break;
            case 'metricas':
                await this.cargarMetricas();
                break;
            case 'resenas':
                await this.cargarResenas();
                break;
        }
    }

    async cargarPedidos() {
        try {
            const response = await fetch(`${this.apiBaseURL}/pedidos/usuario/${this.usuarioActual.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const pedidos = await response.json();
                this.mostrarPedidos(pedidos);
                this.actualizarContador('pedidosCount', pedidos.length);
            } else {
                throw new Error('Error al cargar pedidos');
            }
        } catch (error) {
            console.error('Error cargando pedidos:', error);
            this.mostrarEstadoVacio('pedidosContainer', '📦', 'No tienes pedidos aún', 'Explora nuestros productos y haz tu primera compra');
        }
    }

    mostrarPedidos(pedidos) {
        const container = document.getElementById('pedidosContainer');
        container.innerHTML = '';

        if (pedidos.length === 0) {
            this.mostrarEstadoVacio('pedidosContainer', '📦', 'No tienes pedidos aún', 'Explora nuestros productos y haz tu primera compra');
            return;
        }

        pedidos.forEach((pedido, index) => {
            const pedidoCard = document.createElement('div');
            pedidoCard.className = 'pedido-card';

            const fecha = new Date(pedido.fechapedido).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            pedidoCard.innerHTML = `
                <div class="pedido-info">
                    <h4>Pedido #${pedido.id}</h4>
                    <p><strong>Fecha:</strong> ${fecha}</p>
                    <p><strong>Total:</strong> $${Number(pedido.total).toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
                    <p><strong>Dirección:</strong> ${pedido.direccionentrega || 'No especificada'}</p>
                </div>
                <div class="pedido-estado estado-${pedido.estado.toLowerCase()}">
                    ${this.getEstadoTexto(pedido.estado)}
                </div>
            `;

            pedidoCard.onclick = () => this.verDetallePedido(pedido.id);
            container.appendChild(pedidoCard);

            // Animar entrada
            gsap.fromTo(pedidoCard,
                {opacity: 0, x: -50},
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "power2.out"
                }
            );
        });
    }

    async cargarPreordenes() {
        try {
            const response = await fetch(`${this.apiBaseURL}/preordenes/usuario/${this.usuarioActual.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const preordenes = await response.json();
                this.mostrarPreordenes(preordenes);
                this.actualizarContador('preordenesCount', preordenes.length);
            } else {
                throw new Error('Error al cargar preórdenes');
            }
        } catch (error) {
            console.error('Error cargando preórdenes:', error);
            this.mostrarEstadoVacio('preordenesContainer', '⏳', 'No tienes preórdenes', 'Las preórdenes aparecerán aquí cuando reserves productos');
        }
    }

    mostrarPreordenes(preordenes) {
        const container = document.getElementById('preordenesContainer');
        container.innerHTML = '';

        if (preordenes.length === 0) {
            this.mostrarEstadoVacio('preordenesContainer', '⏳', 'No tienes preórdenes', 'Las preórdenes aparecerán aquí cuando reserves productos');
            return;
        }

        preordenes.forEach((preorden, index) => {
            const preordenCard = document.createElement('div');
            preordenCard.className = 'preorden-card';

            const fecha = new Date(preorden.fechapreorden).toLocaleDateString('es-ES');
            const fechaEntrega = preorden.fechaestimadaentrega ?
                new Date(preorden.fechaestimadaentrega).toLocaleDateString('es-ES') : 'Por definir';

            preordenCard.innerHTML = `
                <div class="preorden-info">
                    <h4>Preorden #${preorden.id}</h4>
                    <p><strong>Producto:</strong> ${preorden.producto ? preorden.producto.nombre : 'Producto no disponible'}</p>
                    <p><strong>Cantidad:</strong> ${preorden.cantidad}</p>
                    <p><strong>Precio:</strong> $${Number(preorden.preciopreorden).toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
                    <p><strong>Estado:</strong> ${preorden.estado}</p>
                    <p><strong>Fecha estimada:</strong> ${fechaEntrega}</p>
                    ${preorden.notas ? `<p><strong>Notas:</strong> ${preorden.notas}</p>` : ''}
                </div>
            `;

            container.appendChild(preordenCard);

            // Animar entrada
            gsap.fromTo(preordenCard,
                {opacity: 0, y: 30},
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "power2.out"
                }
            );
        });
    }

    async cargarDirecciones() {
        // Mostrar dirección principal del usuario
        const container = document.getElementById('direccionesContainer');
        container.innerHTML = '';

        if (this.usuarioActual.direccion) {
            const direccionCard = document.createElement('div');
            direccionCard.className = 'direccion-card principal';

            direccionCard.innerHTML = `
                <div class="direccion-info">
                    <h4>Dirección Principal</h4>
                    <p>${this.usuarioActual.direccion}</p>
                    <span class="direccion-badge">Principal</span>
                </div>
                <div class="direccion-acciones">
                    <button class="action-btn secondary" onclick="perfil.editarDireccionPrincipal()">
                        <span class="btn-icon">✏️</span>
                        Editar
                    </button>
                </div>
            `;

            container.appendChild(direccionCard);
            this.actualizarContador('direccionesCount', 1);

            // Animar entrada
            gsap.fromTo(direccionCard,
                {opacity: 0, scale: 0.9},
                {opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)"}
            );
        } else {
            this.mostrarEstadoVacio('direccionesContainer', '📍', 'No tienes direcciones', 'Agrega tu primera dirección para facilitar las entregas');
            this.actualizarContador('direccionesCount', 0);
        }
    }

    async cargarFavoritos() {
        try {
            const response = await fetch(`${this.apiBaseURL}/favoritos/usuario/${this.usuarioActual.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const favoritos = await response.json();
                this.mostrarFavoritos(favoritos);
                this.actualizarContador('favoritosCount', favoritos.length);
            } else {
                throw new Error('Error al cargar favoritos');
            }
        } catch (error) {
            console.error('Error cargando favoritos:', error);
            this.mostrarEstadoVacio('favoritosContainer', '❤️', 'No tienes productos favoritos', 'Agrega productos a favoritos para verlos aquí');
        }
    }

    mostrarFavoritos(favoritos) {
        const container = document.getElementById('favoritosContainer');
        container.innerHTML = '';

        if (favoritos.length === 0) {
            this.mostrarEstadoVacio('favoritosContainer', '❤️', 'No tienes productos favoritos', 'Agrega productos a favoritos para verlos aquí');
            return;
        }

        favoritos.forEach((favorito, index) => {
            const favoritoCard = document.createElement('div');
            favoritoCard.className = 'favorito-card';

            favoritoCard.innerHTML = `
                <div class="producto-imagen">📦</div>
                <div class="producto-info">
                    <h4>${favorito.producto ? favorito.producto.nombre : 'Producto no disponible'}</h4>
                    <div class="producto-precio">$${favorito.producto ? Number(favorito.producto.precio).toLocaleString('es-ES', {minimumFractionDigits: 2}) : '0.00'}</div>
                    <p>Stock: ${favorito.producto ? favorito.producto.stock : 'No disponible'}</p>
                    <div class="producto-acciones">
                        <button class="action-btn primary" onclick="perfil.verProducto(${favorito.producto ? favorito.producto.id : 0})">
                            <span class="btn-icon">👁️</span>
                            Ver
                        </button>
                        <button class="action-btn secondary" onclick="perfil.eliminarFavorito(${favorito.id})">
                            <span class="btn-icon">💔</span>
                            Quitar
                        </button>
                    </div>
                </div>
            `;

            container.appendChild(favoritoCard);

            // Animar entrada con efecto stagger
            gsap.fromTo(favoritoCard,
                {opacity: 0, scale: 0.8, y: 30},
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: "back.out(1.7)"
                }
            );
        });
    }

    mostrarEstadoVacio(containerId, icono, titulo, descripcion) {
        const container = document.getElementById(containerId);
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;">${icono}</div>
                <h3>${titulo}</h3>
                <p>${descripcion}</p>
                ${containerId === 'favoritosContainer' ? '<button class="action-btn primary" onclick="perfil.irAProductos()">Explorar Productos</button>' : ''}
            </div>
        `;

        // Animar estado vacío
        gsap.fromTo(container.querySelector('.empty-state'),
            {opacity: 0, y: 20},
            {opacity: 1, y: 0, duration: 0.5, ease: "power2.out"}
        );
    }

    setupEventListeners() {
        // Botón editar información
        const btnEditar = document.getElementById('btnEditarInfo');
        if (btnEditar) {
            btnEditar.addEventListener('click', () => {
                this.toggleEditMode();
            });
        }

        // Botones de cancelar y guardar
        const btnCancelar = document.getElementById('btnCancelar');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => {
                this.cancelarEdicion();
            });
        }

        const btnGuardar = document.getElementById('btnGuardar');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', () => {
                this.guardarInformacion();
            });
        }

        // Botones del header
        const btnExplorar = document.getElementById('btnExplorar');
        if (btnExplorar) {
            btnExplorar.addEventListener('click', () => {
                if (this.tipoUsuario === 'VENDEDOR') {
                    this.crearPreorden(); // Función nueva para vendedores
                } else {
                    this.irAProductos(); // Función original para compradores
                }
            });
        }

        const btnCarrito = document.getElementById('btnCarrito');
        if (btnCarrito) {
            btnCarrito.addEventListener('click', () => {
                if (this.tipoUsuario === 'VENDEDOR') {
                    this.enviarNotificacion(); // Función nueva para vendedores
                } else {
                    this.verCarrito(); // Función original para compradores
                }
            });
        }

        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                this.cerrarSesion();
            });
        }

        // Filtros
        const filtroEstado = document.getElementById('filtroEstado');
        if (filtroEstado) {
            filtroEstado.addEventListener('change', () => {
                this.filtrarPedidos();
            });
        }

        // Botones de vista de favoritos
        const viewBtns = document.querySelectorAll('.view-btn');
        if (viewBtns.length > 0) {
            viewBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    viewBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const container = document.getElementById('favoritosContainer');
                    const view = btn.dataset.view;
                    if (container) {
                        container.className = `favoritos-container ${view}-view`;
                    }
                });
            });
        }

        // Modal nueva dirección
        const btnNuevaDireccion = document.getElementById('btnNuevaDireccion');
        if (btnNuevaDireccion) {
            btnNuevaDireccion.addEventListener('click', () => {
                this.abrirModalDireccion();
            });
        }


        // ==================== EVENT LISTENERS PARA IMÁGENES ====================

        // Input de archivos
        const inputImagenes = document.getElementById('productoImagenes');
        if (inputImagenes) {
            inputImagenes.addEventListener('change', (e) => {
                this.handleImageSelection(e);
            });
        }

        // Drag and drop para imágenes
        const uploadArea = document.getElementById('imageUploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--secondary-color)';
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary-color)';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary-color)';

                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleImageFiles(files);
                }
            });
        }

        const formDireccion = document.getElementById('formDireccion');
        if (formDireccion) {
            formDireccion.addEventListener('submit', (e) => {
                this.guardarNuevaDireccion(e);
            });
        }

        // Cerrar modal al hacer click fuera
        const modals = document.querySelectorAll('.modal');
        if (modals.length > 0) {
            modals.forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.cerrarModal(modal.id);
                    }
                });
            });
        }

        // ==================== EVENT LISTENERS PARA VENDEDORES ====================

        // Botones específicos de vendedores
        const formEditarProducto = document.getElementById('formEditarProducto');
        if (formEditarProducto) {
            formEditarProducto.addEventListener('submit', (e) => this.guardarEditarProducto(e));
        }

        // Input de imágenes para editar
        const inputEditarImagenes = document.getElementById('editarProductoImagenes');
        if (inputEditarImagenes) {
            inputEditarImagenes.addEventListener('change', (e) => this.handleEditImageSelection(e));
        }

        // Drag and drop para imágenes de editar
        const editarUploadArea = document.getElementById('editarImageUploadArea');
        if (editarUploadArea) {
            editarUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                editarUploadArea.style.borderColor = 'var(--secondary-color)';
            });

            editarUploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                editarUploadArea.style.borderColor = 'var(--primary-color)';
            });

            editarUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                editarUploadArea.style.borderColor = 'var(--primary-color)';
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleEditImageFiles(files);
                }
            });
        }

        // Botones de periodo en métricas
        const periodoBtns = document.querySelectorAll('.periodo-btn');
        if (periodoBtns.length > 0) {
            periodoBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    periodoBtns.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.cargarMetricas(); // Recargar con nuevo periodo
                });
            });
        }

        // Filtro de reseñas
        const filtroCalificacion = document.getElementById('filtroCalificacion');
        if (filtroCalificacion) {
            filtroCalificacion.addEventListener('change', () => {
                this.filtrarResenas();
            });
        }

        //Botón nuevo producto
        const btnNuevoProducto = document.getElementById('btnNuevoProducto');
        if (btnNuevoProducto) {
            btnNuevoProducto.addEventListener('click', () => this.abrirModalProducto());
        }

        // Modal nuevo producto
        const formProducto = document.getElementById('formProducto');
        if (formProducto) {
            formProducto.addEventListener('submit', (e) => this.guardarNuevoProducto(e));
        }
    }

    initAnimaciones() {
        gsap.registerPlugin(ScrollTrigger);

        // Efecto hover en cards
        const cards = document.querySelectorAll('.info-card, .pedido-card, .favorito-card, .preorden-card, .direccion-card');

        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {scale: 1.02, duration: 0.3, ease: "power2.out"});
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {scale: 1, duration: 0.3, ease: "power2.out"});
            });
        });

        // Animación del avatar
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            avatar.addEventListener('click', () => {
                gsap.to(avatar, {
                    rotation: 360,
                    duration: 0.6,
                    ease: "power2.inOut"
                });
            });
        }

        // Animar navegación
        gsap.fromTo('.nav-container',
            {opacity: 0, y: 20},
            {opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3}
        );
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        const inputs = document.querySelectorAll('#seccionInformacion input, #seccionInformacion textarea');
        const btnEditar = document.getElementById('btnEditarInfo');
        const formActions = document.getElementById('formActions');

        if (this.editMode) {
            inputs.forEach(input => {
                input.removeAttribute('readonly');
                gsap.to(input.parentElement.querySelector('.field-line'), {
                    scaleX: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            btnEditar.style.display = 'none';
            formActions.classList.remove('hidden');

            gsap.fromTo(formActions,
                {opacity: 0, y: 20},
                {opacity: 1, y: 0, duration: 0.3, ease: "power2.out"}
            );
        }
    }

    cancelarEdicion() {
        this.editMode = false;
        this.cargarInformacionPersonal();

        const inputs = document.querySelectorAll('#seccionInformacion input, #seccionInformacion textarea');
        const btnEditar = document.getElementById('btnEditarInfo');
        const formActions = document.getElementById('formActions');

        inputs.forEach(input => {
            input.setAttribute('readonly', true);
            gsap.to(input.parentElement.querySelector('.field-line'), {
                scaleX: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        formActions.classList.add('hidden');
        btnEditar.style.display = 'flex';
    }

    async guardarInformacion() {
        // Validar campos requeridos
        const nombre = document.getElementById('inputNombre').value.trim();
        const email = document.getElementById('inputEmail').value.trim();
        const telefono = document.getElementById('inputTelefono').value.trim();
        const direccion = document.getElementById('inputDireccion').value.trim();

        if (!nombre || !email) {
            this.mostrarToast('Nombre y email son obligatorios', 'warning');
            return;
        }

        // Crear objeto usuario COMPLETO para el backend
        const usuarioActualizado = {
            id: this.usuarioActual.id,
            nombre: nombre,
            email: email,
            telefono: telefono,
            direccion: direccion,
            // Mantener campos existentes que no se editan
            password: this.usuarioActual.password, // El backend necesita este campo
            fecharegistro: this.usuarioActual.fecharegistro,
            activo: this.usuarioActual.activo !== undefined ? this.usuarioActual.activo : true,
            tipousuario: this.usuarioActual.tipousuario || 'COMPRADOR'
        };

        console.log('Enviando datos al backend:', usuarioActualizado);

        try {
            const response = await fetch(`${this.apiBaseURL}/usuarios/${this.usuarioActual.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(usuarioActualizado)
            });

            console.log('Respuesta del servidor:', response.status, response.statusText);

            if (response.ok) {
                const usuarioRespuesta = await response.json();
                console.log('Usuario actualizado recibido:', usuarioRespuesta);

                // Actualizar datos locales
                this.usuarioActual = usuarioRespuesta;
                localStorage.setItem('usuario', JSON.stringify(usuarioRespuesta));

                this.cancelarEdicion();
                this.mostrarDatosUsuario();
                this.mostrarToast('Información actualizada correctamente, refresca para ver los cambios', 'success');
            } else {
                // Leer el error específico del backend
                const errorData = await response.json().catch(() => ({message: 'Error desconocido'}));
                console.error('Error del backend:', errorData);
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error completo:', error);

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                this.mostrarToast('Error de conexión. Verifica que el servidor esté ejecutándose.', 'error');
            } else {
                this.mostrarToast(`Error al actualizar: ${error.message}`, 'error');
            }
        }
    }

    // Métodos de utilidad
    getEstadoTexto(estado) {
        const estados = {
            'PENDIENTE': 'Pendiente',
            'CONFIRMADO': 'Confirmado',
            'ENVIADO': 'Enviado',
            'ENTREGADO': 'Entregado',
            'CANCELADO': 'Cancelado'
        };
        return estados[estado] || estado;
    }

    actualizarContador(elementId, count) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    filtrarPedidos() {
        const filtro = document.getElementById('filtroEstado').value;
        const pedidos = document.querySelectorAll('.pedido-card');

        pedidos.forEach(pedido => {
            const estado = pedido.querySelector('.pedido-estado').textContent.toLowerCase();
            const mostrar = !filtro || estado.includes(filtro.toLowerCase());

            gsap.to(pedido, {
                opacity: mostrar ? 1 : 0.3,
                scale: mostrar ? 1 : 0.95,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }

    abrirModalDireccion() {
        const modal = document.getElementById('modalDireccion');
        modal.style.display = 'flex';

        gsap.fromTo(modal.querySelector('.modal-content'),
            {opacity: 0, scale: 0.7, y: -50},
            {opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)"}
        );
    }

    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);

        gsap.to(modal.querySelector('.modal-content'), {
            opacity: 0,
            scale: 0.7,
            y: -50,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                modal.style.display = 'none';
                if (modalId === 'modalDireccion') {
                    document.getElementById('formDireccion').reset();
                }
            }
        });
    }

    async guardarNuevaDireccion(e) {
        e.preventDefault();
        // Por ahora solo cerramos el modal
        this.cerrarModal('modalDireccion');
        this.mostrarToast('Funcionalidad en desarrollo', 'info');
    }

    async eliminarFavorito(favoritoId) {
        if (!confirm('¿Estás seguro de que quieres quitar este producto de favoritos?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseURL}/favoritos/${favoritoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.cargarFavoritos();
                this.mostrarToast('Producto eliminado de favoritos', 'success');
            } else {
                throw new Error('Error al eliminar favorito');
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarToast('Error al eliminar favorito', 'error');
        }
    }

    mostrarToast(mensaje, tipo = 'info') {
        const container = document.getElementById('toastContainer');

        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.textContent = mensaje;

        container.appendChild(toast);

        // Animar entrada
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Eliminar después de 4 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    // Métodos de navegación
    irAProductos() {
        window.location.href = 'categorias';
    }

    verCarrito() {
        window.location.href = 'carrito';
    }

    verProducto(productoId) {
        window.location.href = `producto?id=${productoId}`;
    }

    verDetallePedido(pedidoId) {
        this.mostrarToast('Función de detalle de pedido en desarrollo', 'info');
    }

    editarDireccionPrincipal() {
        this.mostrarSeccion('informacion');
        this.toggleEditMode();
    }

    cerrarSesion() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuarioId');
            localStorage.removeItem('usuario');
            window.location.href = 'login';
        }
    }


    // ==================== MÉTODOS PARA MANEJO DE IMÁGENES ====================

    handleImageSelection(event) {
        const files = event.target.files;
        this.handleImageFiles(files);
    }

    handleImageFiles(files) {
        const maxFiles = 3;
        const maxSizePerFile = 5 * 1024 * 1024; // 5MB

        if (files.length === 0) return;

        // Verificar límite total
        const totalAfterAdd = this.selectedImages.length + files.length;
        if (totalAfterAdd > maxFiles) {
            this.mostrarToast(`Máximo ${maxFiles} imágenes permitidas. Tienes ${this.selectedImages.length}, intentas agregar ${files.length}`, 'warning');
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

            // Agregar nueva imagen
            this.selectedImages.push(file);
            this.addImagePreview(file);
        });

        console.log(`Total imágenes seleccionadas: ${this.selectedImages.length}`);
    }

    addImagePreview(file) {
        const container = document.getElementById('imagePreviewContainer');
        const preview = document.createElement('div');
        preview.className = 'image-preview';

        const img = document.createElement('img');
        const removeBtn = document.createElement('button');
        removeBtn.className = 'image-remove';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => this.removeImage(file, preview);

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
            {opacity: 0, scale: 0.8},
            {opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)"}
        );
    }

    removeImage(file, previewElement) {
        // Remover del array
        this.selectedImages = this.selectedImages.filter(img => img !== file);

        // Animar salida y remover elemento
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

    // Métodos para manejar imágenes de editar
    handleEditImageSelection(event) {
        const files = event.target.files;
        this.handleEditImageFiles(files);
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
            {opacity: 0, scale: 0.8},
            {opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)"}
        );
    }

    removeEditImage(file, previewElement) {
        // Remover del array
        this.selectedEditImages = this.selectedEditImages.filter(img => img !== file);

        // Animar salida y remover elemento
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

    // Animar contador con GSAP
    animarContador(elementId, from, to, prefix = '', decimals = 0, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const obj = {value: from};

        gsap.to(obj, {
            value: to,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
                const value = decimals > 0 ? obj.value.toFixed(decimals) : Math.round(obj.value);
                element.textContent = `${prefix}${Number(value).toLocaleString('es-ES', {minimumFractionDigits: decimals})}${suffix}`;
            }
        });
    }

    // ==================== MÉTODOS PARA VENDEDORES ====================

    async cargarPedidosVendedor() {
        try {
            // Obtener productos del vendedor primero
            const productosResponse = await fetch(`${this.apiBaseURL}/productos/vendedor/${this.usuarioActual.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!productosResponse.ok) {
                throw new Error('Error al cargar productos');
            }

            const productos = await productosResponse.json();
            const productosIds = productos.map(p => p.id);

            // Simular pedidos de productos del vendedor (adaptar según tu backend)
            const pedidos = [
                {
                    id: 1,
                    fechapedido: new Date().toISOString(),
                    total: 299.99,
                    estado: 'CONFIRMADO',
                    usuario: {nombre: 'Juan Pérez', email: 'juan@email.com'},
                    direccionentrega: 'Calle 123, Ciudad'
                },
                {
                    id: 2,
                    fechapedido: new Date(Date.now() - 86400000).toISOString(),
                    total: 159.99,
                    estado: 'ENVIADO',
                    usuario: {nombre: 'María García', email: 'maria@email.com'},
                    direccionentrega: 'Avenida 456, Ciudad'
                }
            ];

            this.mostrarPedidosVendedor(pedidos);
            this.actualizarContador('pedidosCount', pedidos.length);
        } catch (error) {
            console.error('Error cargando pedidos del vendedor:', error);
            this.mostrarEstadoVacio('pedidosContainer', '📦', 'No tienes pedidos aún', 'Los pedidos de tus productos aparecerán aquí');
        }
    }

    mostrarPedidosVendedor(pedidos) {
        const container = document.getElementById('pedidosContainer');
        container.innerHTML = '';

        if (pedidos.length === 0) {
            this.mostrarEstadoVacio('pedidosContainer', '📦', 'No tienes pedidos aún', 'Los pedidos de tus productos aparecerán aquí');
            return;
        }

        pedidos.forEach((pedido, index) => {
            const pedidoCard = document.createElement('div');
            pedidoCard.className = 'pedido-card';

            const fecha = new Date(pedido.fechapedido).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            pedidoCard.innerHTML = `
            <div class="pedido-info">
                <h4>Pedido #${pedido.id}</h4>
                <p><strong>Cliente:</strong> ${pedido.usuario.nombre}</p>
                <p><strong>Email:</strong> ${pedido.usuario.email}</p>
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Total:</strong> $${Number(pedido.total).toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
                <p><strong>Dirección:</strong> ${pedido.direccionentrega}</p>
            </div>
            <div class="pedido-estado estado-${pedido.estado.toLowerCase()}">
                ${this.getEstadoTexto(pedido.estado)}
            </div>
        `;

            pedidoCard.onclick = () => this.verDetallePedidoVendedor(pedido.id);
            container.appendChild(pedidoCard);

            // Animar entrada
            gsap.fromTo(pedidoCard,
                {opacity: 0, x: -50},
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "power2.out"
                }
            );
        });
    }

    async cargarPreordenesVendedor() {
        try {
            const response = await fetch(`${this.apiBaseURL}/preordenes/vendedor/${this.usuarioActual.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const preordenes = await response.json();
                this.mostrarPreordenesVendedor(preordenes);
                this.actualizarContador('preordenesCount', preordenes.length);
            } else {
                throw new Error('Error al cargar preórdenes');
            }
        } catch (error) {
            console.error('Error cargando preórdenes del vendedor:', error);
            this.mostrarEstadoVacio('preordenesContainer', '⏳', 'No tienes preórdenes', 'Las preórdenes de tus productos aparecerán aquí');
        }
    }

    mostrarPreordenesVendedor(preordenes) {
        const container = document.getElementById('preordenesContainer');
        container.innerHTML = '';

        if (preordenes.length === 0) {
            this.mostrarEstadoVacio('preordenesContainer', '⏳', 'No tienes preórdenes', 'Las preórdenes de tus productos aparecerán aquí');
            return;
        }

        preordenes.forEach((preorden, index) => {
            const preordenCard = document.createElement('div');
            preordenCard.className = 'preorden-card';

            const fecha = new Date(preorden.fechapreorden).toLocaleDateString('es-ES');
            const fechaEntrega = preorden.fechaestimadaentrega ?
                new Date(preorden.fechaestimadaentrega).toLocaleDateString('es-ES') : 'Por definir';

            preordenCard.innerHTML = `
            <div class="preorden-info">
                <h4>Preorden #${preorden.id}</h4>
                <p><strong>Cliente:</strong> ${preorden.usuario ? preorden.usuario.nombre : 'Usuario'}</p>
                <p><strong>Producto:</strong> ${preorden.producto ? preorden.producto.nombre : 'Producto'}</p>
                <p><strong>Cantidad:</strong> ${preorden.cantidad}</p>
                <p><strong>Precio:</strong> $${Number(preorden.preciopreorden).toLocaleString('es-ES', {minimumFractionDigits: 2})}</p>
                <p><strong>Estado:</strong> ${preorden.estado}</p>
                <p><strong>Fecha estimada:</strong> ${fechaEntrega}</p>
                ${preorden.notas ? `<p><strong>Notas:</strong> ${preorden.notas}</p>` : ''}
            </div>
            <div class="preorden-acciones">
                <button class="action-btn primary" onclick="perfil.actualizarEstadoPreorden(${preorden.id})">
                    Actualizar Estado
                </button>
            </div>
        `;

            container.appendChild(preordenCard);

            // Animar entrada
            gsap.fromTo(preordenCard,
                {opacity: 0, y: 30},
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "power2.out"
                }
            );
        });
    }

    async cargarProductosVendedor() {
        try {
            const response = await fetch(`${this.apiBaseURL}/productos/vendedor/${this.usuarioActual.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const productos = await response.json();
                console.log('Productos del vendedor cargados:', productos);

                // Guardar productos para filtrado
                this.productosVendedor = productos;

                // Actualizar estadísticas
                this.actualizarStatsProductos(productos);

                // Cargar categorías para filtros
                await this.cargarCategoriasParaFiltros(productos);

                // Configurar listeners para filtros
                this.configurarFiltrosProductos();

                // Mostrar productos activos por defecto
                this.filtrarYMostrarProductos('activos');

            } else {
                throw new Error('Error al cargar productos');
            }
        } catch (error) {
            console.error('Error cargando productos del vendedor:', error);
            this.mostrarEstadoVacioPersonalizado('productosVendedorContainer', '📦', 'Error al cargar productos', 'Verifica tu conexión e intenta nuevamente');
        }
    }

    mostrarProductosOrganizados(productosOrganizados) {
        const container = document.getElementById('productosVendedorContainer');
        if (!container) return;

        container.innerHTML = '';

        // OBTENER TODOS LOS PRODUCTOS PLANOS (sin organizar por carpetas)
        const todosLosProductos = [];
        Object.keys(productosOrganizados).forEach(categoriaId => {
            const categoriaData = productosOrganizados[categoriaId];
            todosLosProductos.push(...categoriaData.productos);
        });

        if (todosLosProductos.length === 0) {
            const estadoActual = document.getElementById('mostrarActivos')?.checked ? 'activos' : 'pausados';
            this.mostrarEstadoVacioFiltrado(estadoActual);
            return;
        }

        // CREAR GRID DIRECTO DE PRODUCTOS (SIN HEADERS DE CATEGORÍA)
        const productosGrid = document.createElement('div');
        productosGrid.className = 'productos-grid-directo';

        todosLosProductos.forEach((producto, index) => {
            const productoCard = document.createElement('div');
            productoCard.className = `producto-vendedor-card ${producto.stock < 10 ? 'bajo-stock' : ''} ${!producto.activo ? 'sin-stock' : ''}`;

            // USAR EL MÉTODO generarHTMLProductoVendedorSimplificado
            productoCard.innerHTML = this.generarHTMLProductoVendedorSimplificado(producto);

            productosGrid.appendChild(productoCard);

            // Animar entrada de cada producto
            gsap.fromTo(productoCard,
                {opacity: 0, scale: 0.8, y: 30},
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.5,
                    delay: index * 0.05,
                    ease: "back.out(1.7)"
                }
            );
        });

        container.appendChild(productosGrid);
        // Mostrar contenedor de productos
        setTimeout(() => this.initLazyLoading(), 100);
    }

    generarHTMLProductoVendedorSimplificado(producto) {
        // Procesar imagen principal con mejor detección
        let imagenSrc = null;
        let hayImagen = false;

        if (producto.imagen && producto.imagen.trim()) {
            console.log('Imagen raw del producto:', producto.imagen); // Debug

            // Probar diferentes separadores comunes
            let imagenesArray = [];
            if (producto.imagen.includes('|')) {
                imagenesArray = producto.imagen.split('|').filter(img => img.trim());
            } else if (producto.imagen.includes(',')) {
                imagenesArray = producto.imagen.split(',').filter(img => img.trim());
            } else if (producto.imagen.includes(';')) {
                imagenesArray = producto.imagen.split(';').filter(img => img.trim());
            } else {
                imagenesArray = [producto.imagen.trim()];
            }

            console.log('Imágenes procesadas:', imagenesArray); // Debug

            if (imagenesArray.length > 0 && imagenesArray[0].trim()) {
                const nombreImagen = imagenesArray[0].trim();
                imagenSrc = `http://localhost:8080/imagenes-productos/${nombreImagen}`;
                hayImagen = true;
                console.log('URL final de imagen:', imagenSrc); // Debug
            }
        }

        // Determinar estado
        const estadoClase = !producto.activo ? 'pausado' : producto.stock < 10 ? 'bajo-stock' : 'activo';
        const estadoTexto = !producto.activo ? 'PAUSADO' : producto.stock < 10 ? 'BAJO STOCK' : 'ACTIVO';
        const estadoIcono = !producto.activo ? '⏸️' : producto.stock < 10 ? '⚠️' : '✅';

        return `
        <div class="producto-imagen-container">
            ${hayImagen ?
            `<img data-src="${imagenSrc}" 
                     src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmMGYwZjAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlMGUwZTAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4MCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjE1MCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2FyZ2FuZG8uLi48L3RleHQ+PC9zdmc+"
                     alt="${producto.nombre}" 
                     class="producto-imagen-principal lazy-load"
                     loading="lazy">` :
            `<div class="producto-sin-imagen">📦</div>`
        }
            
            <div class="producto-estado-badge ${estadoClase}">
                <span class="estado-icon">${estadoIcono}</span>
                <span class="estado-text">${estadoTexto}</span>
            </div>
        </div>
        
        <div class="producto-info-section">
            <h4 class="producto-titulo-card">${producto.nombre}</h4>
            <p class="producto-categoria-tag">${producto.categoria ? producto.categoria.nombre : 'Sin categoría'}</p>
            <p class="producto-descripcion-card">${producto.descripcion.length > 80 ?
            producto.descripcion.substring(0, 80) + '...' :
            producto.descripcion}</p>
            
            <div class="producto-detalles-grid">
                <div class="detalle-precio">
                    <span class="precio-label">Precio</span>
                    <span class="precio-valor">$${Number(producto.precio).toLocaleString('es-ES', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="detalle-stock">
                    <span class="stock-label">Stock</span>
                    <span class="stock-valor ${producto.stock < 10 ? 'stock-bajo' : ''}">${producto.stock}</span>
                </div>
            </div>
        </div>
        
        <div class="producto-acciones-section">
            <button class="action-btn-card primary" onclick="perfil.editarProducto(${producto.id})" title="Editar Producto">
                <span class="btn-icon">✏️</span>
                <span class="btn-text">Editar</span>
            </button>
            <button class="action-btn-card secondary" onclick="perfil.verEstadisticasProducto(${producto.id})" title="Ver Estadísticas">
                <span class="btn-icon">📊</span>
                <span class="btn-text">Stats</span>
            </button>
            <button class="action-btn-card ${producto.activo ? 'tertiary' : 'success'}" onclick="perfil.toggleProductoActivo(${producto.id}, ${producto.activo})" title="${producto.activo ? 'Pausar' : 'Activar'} Producto">
                <span class="btn-icon">${producto.activo ? '⏸️' : '▶️'}</span>
                <span class="btn-text">${producto.activo ? 'Pausar' : 'Activar'}</span>
            </button>
        </div>
    `;
    }

    crearCardProductoVendedor(producto) {
        const card = document.createElement('div');
        card.className = `producto-vendedor-card ${producto.stock < 10 ? 'bajo-stock' : ''} ${!producto.activo ? 'sin-stock' : ''}`;

        // Generar card HTML (usa el código existente pero simplificado)
        card.innerHTML = this.generarHTMLProductoVendedor(producto);

        return card;
    }

    actualizarStatsProductos(productos) {
        const total = productos.length;
        const activos = productos.filter(p => p.activo).length;
        const pausados = productos.filter(p => !p.activo).length;
        const bajoStock = productos.filter(p => p.stock < 10).length;

        // Animar contadores
        this.animarContador('totalProductos', 0, total);
        this.animarContador('productosActivos', 0, activos);
        this.animarContador('productosPausados', 0, pausados);
        this.animarContador('productosBajoStock', 0, bajoStock);

        // Actualizar contadores en toggle
        const activosCount = document.getElementById('activosCount');
        const pausadosCount = document.getElementById('pausadosCount');
        if (activosCount) activosCount.textContent = activos;
        if (pausadosCount) pausadosCount.textContent = pausados;
    }

    async cargarCategoriasParaFiltros(productos) {
        try {
            const response = await fetch(`${this.apiBaseURL}/categorias`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const todasCategorias = await response.json();

                // Filtrar solo categorías que tienen productos del vendedor
                const categoriasConProductos = todasCategorias.filter(categoria => {
                    return productos.some(producto =>
                        producto.categoria && producto.categoria.id === categoria.id
                    );
                });

                this.categoriasVendedor = categoriasConProductos;
                this.mostrarFiltrosCategorias(categoriasConProductos, productos);

            } else {
                console.warn('No se pudieron cargar categorías para filtros');
            }
        } catch (error) {
            console.error('Error cargando categorías para filtros:', error);
        }
    }

    mostrarFiltrosCategorias(categorias, productos) {
        const container = document.getElementById('categoriasFilterGrid');
        if (!container) return;

        container.innerHTML = '';

        categorias.forEach((categoria, index) => {
            // Contar productos por categoría y estado
            const productosActivosCategoria = productos.filter(p =>
                p.categoria && p.categoria.id === categoria.id && p.activo
            ).length;

            const productosPausadosCategoria = productos.filter(p =>
                p.categoria && p.categoria.id === categoria.id && !p.activo
            ).length;

            const btn = document.createElement('button');
            btn.className = 'categoria-filter-btn';
            btn.dataset.categoriaId = categoria.id;
            btn.dataset.activosCount = productosActivosCategoria;
            btn.dataset.pausadosCount = productosPausadosCategoria;

            btn.innerHTML = `
            <span class="categoria-name">${categoria.nombre}</span>
            <span class="categoria-count" id="count-cat-${categoria.id}">
                ${productosActivosCategoria} activos
            </span>
        `;

            btn.addEventListener('click', () => this.filtrarPorCategoria(categoria.id));
            container.appendChild(btn);

            // Animar entrada
            gsap.fromTo(btn,
                {opacity: 0, scale: 0.8, y: 20},
                {opacity: 1, scale: 1, y: 0, duration: 0.4, delay: index * 0.1, ease: "back.out(1.7)"}
            );
        });
    }

    configurarFiltrosProductos() {
        // Listeners para toggle de estado
        const radioActivos = document.getElementById('mostrarActivos');
        const radioPausados = document.getElementById('mostrarPausados');

        if (radioActivos) {
            radioActivos.addEventListener('change', () => {
                if (radioActivos.checked) {
                    this.filtrarYMostrarProductos('activos');
                    this.actualizarContadoresCategorias('activos');
                }
            });
        }

        if (radioPausados) {
            radioPausados.addEventListener('change', () => {
                if (radioPausados.checked) {
                    this.filtrarYMostrarProductos('pausados');
                    this.actualizarContadoresCategorias('pausados');
                }
            });
        }

        // Listener para reset de filtros
        const resetBtn = document.getElementById('resetFiltros');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetearFiltros();
            });
        }
    }

    filtrarYMostrarProductos(estado, categoriaId = null) {
        let productosFiltrados = this.productosVendedor.filter(producto => {
            const estadoCoincide = estado === 'activos' ? producto.activo : !producto.activo;
            const categoriaCoincide = !categoriaId || (producto.categoria && producto.categoria.id == categoriaId);

            return estadoCoincide && categoriaCoincide;
        });

        // Organizar por categoría
        const productosOrganizados = this.organizarProductosPorCategoria(productosFiltrados);

        // Actualizar UI
        this.actualizarTituloSeccion(estado, categoriaId);
        this.actualizarContadorVisible(productosFiltrados.length);
        this.mostrarProductosOrganizados(productosOrganizados);

        console.log(`Mostrando ${productosFiltrados.length} productos ${estado}${categoriaId ? ' de categoría específica' : ''}`);
    }

    organizarProductosPorCategoria(productos) {
        const productosOrganizados = {};

        productos.forEach(producto => {
            const categoriaNombre = producto.categoria ? producto.categoria.nombre : 'Sin Categoría';
            const categoriaId = producto.categoria ? producto.categoria.id : 'sin-categoria';

            if (!productosOrganizados[categoriaId]) {
                productosOrganizados[categoriaId] = {
                    nombre: categoriaNombre,
                    productos: []
                };
            }

            productosOrganizados[categoriaId].productos.push(producto);
        });

        return productosOrganizados;
    }

    generarHTMLProductoVendedor(producto) {
        // Procesar imágenes
        let imagenPrincipal = '📦'; // Emoji por defecto
        let imagenesArray = [];

        if (producto.imagen) {
            if (producto.imagen.includes('|')) {
                imagenesArray = producto.imagen.split('|').filter(img => img.trim());
            } else if (producto.imagen.includes(',')) {
                imagenesArray = producto.imagen.split(',').filter(img => img.trim());
            } else {
                imagenesArray = [producto.imagen.trim()];
            }

            if (imagenesArray.length > 0) {
                imagenPrincipal = `<img src="<http://localhost:8080/imagenes-productos/${imagenesArray > [0].trim()}" 
                                   alt="${producto.nombre}" 
                                   onerror="this.style.display='none'; this.parentNode.innerHTML='📦';">`;
            }
        }

        // Determinar estado visual
        const estadoClase = !producto.activo ? 'pausado' : producto.stock < 10 ? 'bajo-stock' : 'activo';
        const estadoTexto = !producto.activo ? 'PAUSADO' : producto.stock < 10 ? 'BAJO STOCK' : 'ACTIVO';
        const estadoIcono = !producto.activo ? '⏸️' : producto.stock < 10 ? '⚠️' : '✅';

        return `
        <div class="producto-imagen">
            ${imagenPrincipal}
            <div class="producto-estado ${estadoClase}">
                <span class="estado-icon">${estadoIcono}</span>
                <span class="estado-text">${estadoTexto}</span>
            </div>
        </div>
        
        <div class="producto-info">
            <h4 class="producto-titulo">${producto.nombre}</h4>
            <p class="producto-descripcion">${producto.descripcion.length > 100 ?
            producto.descripcion.substring(0, 100) + '...' :
            producto.descripcion}</p>
            
            <div class="producto-detalles">
                <div class="producto-precio">
                    $${Number(producto.precio).toLocaleString('es-ES', {minimumFractionDigits: 2})}
                </div>
                <div class="producto-stock">
                    Stock: <span class="${producto.stock < 10 ? 'stock-bajo' : ''}">${producto.stock}</span>
                </div>
                <div class="producto-categoria">
                    ${producto.categoria ? producto.categoria.nombre : 'Sin categoría'}
                </div>
            </div>
        </div>
        
        <div class="producto-acciones-vendedor">
            <button class="action-btn primary" onclick="perfil.editarProducto(${producto.id})">
                <span class="btn-icon">✏️</span>Editar
            </button>
            <button class="action-btn secondary" onclick="perfil.verEstadisticasProducto(${producto.id})">
                <span class="btn-icon">📊</span>Stats
            </button>
            <button class="action-btn ${producto.activo ? 'tertiary' : 'success'}" onclick="perfil.toggleProductoActivo(${producto.id}, ${producto.activo})">
                ${producto.activo ?
            '<span class="btn-icon">⏸️</span>Pausar' :
            '<span class="btn-icon">▶️</span>Activar'
        }
            </button>
        </div>
    `;
    }

    filtrarPorCategoria(categoriaId) {
        // Actualizar filtro actual
        this.filtroCategoriaActual = categoriaId;

        // Obtener estado actual
        const estadoActual = document.getElementById('mostrarActivos')?.checked ? 'activos' : 'pausados';

        // Filtrar y mostrar
        this.filtrarYMostrarProductos(estadoActual, categoriaId);

        // Actualizar botones de categoría
        document.querySelectorAll('.categoria-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.querySelector(`[data-categoria-id="${categoriaId}"]`)?.classList.add('active');
    }

    resetearFiltros() {
        this.filtroCategoriaActual = null;

        // Remover clase active de categorías
        document.querySelectorAll('.categoria-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Mostrar todos los productos del estado actual
        const estadoActual = document.getElementById('mostrarActivos')?.checked ? 'activos' : 'pausados';
        this.filtrarYMostrarProductos(estadoActual);
    }

    actualizarContadoresCategorias(estado) {
        this.categoriasVendedor?.forEach(categoria => {
            const count = this.productosVendedor.filter(p =>
                p.categoria && p.categoria.id === categoria.id &&
                (estado === 'activos' ? p.activo : !p.activo)
            ).length;

            const countElement = document.getElementById(`count-cat-${categoria.id}`);
            if (countElement) {
                countElement.textContent = `${count} ${estado}`;
            }
        });
    }

    actualizarTituloSeccion(estado, categoriaId = null) {
        const titulo = document.getElementById('seccionActualTitulo');
        if (titulo) {
            let textoTitulo = `Productos ${estado === 'activos' ? 'Activos' : 'Pausados'}`;
            if (categoriaId) {
                const categoria = this.categoriasVendedor?.find(c => c.id == categoriaId);
                if (categoria) {
                    textoTitulo += ` - ${categoria.nombre}`;
                }
            }
            titulo.textContent = textoTitulo;
        }
    }

    actualizarContadorVisible(cantidad) {
        const contador = document.getElementById('productosVisiblesCount');
        if (contador) {
            contador.textContent = cantidad;
        }
    }

    mostrarEstadoVacioFiltrado(estado) {
        const container = document.getElementById('productosVendedorContainer');
        if (!container) return;

        const icono = estado === 'activos' ? '✅' : '⏸️';
        const mensaje = estado === 'activos' ? 'No tienes productos activos' : 'No tienes productos pausados';
        const descripcion = estado === 'activos' ?
            'Activa algunos productos o crea nuevos para verlos aquí' :
            'Los productos pausados aparecerán aquí';

        container.innerHTML = `
        <div class="empty-state-filtered">
            <div class="empty-icon">${icono}</div>
            <h4>${mensaje}</h4>
            <p>${descripcion}</p>
        </div>
    `;
    }

    mostrarEstadoVacioPersonalizado(containerId, icono, titulo, descripcion) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
        <div class="empty-state">
            <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;">${icono}</div>
            <h3>${titulo}</h3>
            <p>${descripcion}</p>
        </div>
    `;
    }

    async cargarMetricas() {
        try {
            // Simular métricas (adaptar según tu backend)
            const metricas = {
                ventasTotales: 15420.50,
                pedidosCompletados: 87,
                calificacionPromedio: 4.7,
                visitasTienda: 1240
            };

            this.mostrarMetricas(metricas);
        } catch (error) {
            console.error('Error cargando métricas:', error);
            this.mostrarToast('Error al cargar métricas', 'error');
        }
    }

    mostrarMetricas(metricas) {
        // Animar contadores
        this.animarContador('ventasTotales', 0, metricas.ventasTotales, '$');
        this.animarContador('pedidosVendidos', 0, metricas.pedidosCompletados);
        this.animarContador('calificacionPromedio', 0, metricas.calificacionPromedio, '', 1);
        this.animarContador('visitasTienda', 0, metricas.visitasTienda);

        // Mostrar estrellas
        this.mostrarEstrellas('estrellasPromedio', metricas.calificacionPromedio);

        // Animar las cards de métricas
        gsap.fromTo('.metrica-card',
            {opacity: 0, scale: 0.8},
            {opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)"}
        );
    }

    async cargarResenas() {
        try {
            // Obtener reseñas de todos los productos del vendedor
            const response = await fetch(`${this.apiBaseURL}/resenas/vendedor/${this.usuarioActual.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const resenas = await response.json();
                this.mostrarResenas(resenas);
                this.actualizarResumenCalificaciones(resenas);
            } else {
                throw new Error('Error al cargar reseñas');
            }
        } catch (error) {
            console.error('Error cargando reseñas:', error);
            this.mostrarEstadoVacio('resenasContainer', '⭐', 'No tienes reseñas aún', 'Las reseñas de tus productos aparecerán aquí');
        }
    }

    mostrarResenas(resenas) {
        const container = document.getElementById('resenasContainer');
        container.innerHTML = '';

        if (resenas.length === 0) {
            this.mostrarEstadoVacio('resenasContainer', '⭐', 'No tienes reseñas aún', 'Las reseñas de tus productos aparecerán aquí');
            return;
        }

        resenas.forEach((resena, index) => {
            const resenaCard = document.createElement('div');
            resenaCard.className = 'resena-card';

            const fecha = new Date(resena.fecharesena).toLocaleDateString('es-ES');
            const iniciales = resena.usuario.nombre.split(' ').map(n => n[0]).join('').toUpperCase();

            resenaCard.innerHTML = `
            <div class="resena-header">
                <div class="resena-usuario">
                    <div class="resena-avatar">${iniciales}</div>
                    <div class="resena-info">
                        <h4>${resena.usuario.nombre}</h4>
                        <span class="resena-fecha">${fecha}</span>
                    </div>
                </div>
                <div class="resena-calificacion">
                    <span class="resena-estrellas">${this.generarEstrellas(resena.calificacion)}</span>
                    <span class="resena-numero">${resena.calificacion}/5</span>
                </div>
            </div>
            
            <div class="resena-producto">
                Producto: ${resena.producto ? resena.producto.nombre : 'Producto no disponible'}
            </div>
            
            <div class="resena-comentario">
                ${resena.comentario || 'Sin comentario'}
            </div>
            
            <div class="resena-acciones">
                <button class="action-btn secondary" onclick="perfil.responderResena(${resena.id})">
                    <span class="btn-icon">💬</span>
                    Responder
                </button>
                <button class="action-btn tertiary" onclick="perfil.reportarResena(${resena.id})">
                    <span class="btn-icon">⚠️</span>
                    Reportar
                </button>
            </div>
        `;

            container.appendChild(resenaCard);

            // Animar entrada
            gsap.fromTo(resenaCard,
                {opacity: 0, y: 30},
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "power2.out"
                }
            );
        });
    }

    actualizarResumenCalificaciones(resenas) {
        if (resenas.length === 0) return;

        const promedio = resenas.reduce((sum, r) => sum + r.calificacion, 0) / resenas.length;
        const distribucion = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};

        resenas.forEach(r => distribucion[r.calificacion]++);

        document.getElementById('promedioGeneral').textContent = promedio.toFixed(1);
        document.getElementById('estrellasGenerales').textContent = this.generarEstrellas(promedio);
        document.getElementById('totalResenas').textContent = `${resenas.length} reseña${resenas.length !== 1 ? 's' : ''}`;

        // Actualizar barras de progreso
        Object.keys(distribucion).forEach(estrella => {
            const porcentaje = (distribucion[estrella] / resenas.length) * 100;
            const barra = document.querySelector(`[data-estrella="${estrella}"]`);
            const contador = document.getElementById(`count${estrella}`);

            if (barra) {
                gsap.to(barra, {width: `${porcentaje}%`, duration: 1, ease: "power2.out"});
            }
            if (contador) {
                contador.textContent = distribucion[estrella];
            }
        });
    }

// Métodos auxiliares
    generarEstrellas(calificacion) {
        const estrellas = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= calificacion) {
                estrellas.push('★');
            } else if (i - 0.5 <= calificacion) {
                estrellas.push('☆');
            } else {
                estrellas.push('☆');
            }
        }
        return estrellas.join('');
    }

    mostrarEstrellas(elementId, calificacion) {
        const elemento = document.getElementById(elementId);
        if (elemento) {
            elemento.textContent = this.generarEstrellas(calificacion);
        }
    }

// Métodos de acciones para vendedores
    async actualizarEstadoPreorden(preordenId) {
        this.mostrarToast('Función de actualizar estado en desarrollo', 'info');
    }

    async editarProducto(productoId) {
        try {
            // Obtener datos del producto
            const response = await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const producto = await response.json();
                this.abrirModalEditarProducto(producto);
            } else {
                throw new Error('Error al obtener producto');
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarToast('Error al cargar producto', 'error');
        }
    }

    abrirModalEditarProducto(producto) {
        const modal = document.getElementById('modalEditarProducto');

        // Limpiar imágenes seleccionadas
        this.selectedEditImages = [];
        document.getElementById('editarImagePreviewContainer').innerHTML = '';

        // Llenar formulario con datos del producto
        document.getElementById('editarProductoId').value = producto.id;
        document.getElementById('editarProductoNombre').value = producto.nombre;
        document.getElementById('editarProductoPrecio').value = producto.precio;
        document.getElementById('editarProductoStock').value = producto.stock;
        document.getElementById('editarProductoDescripcion').value = producto.descripcion;

        // Cargar categorías si no están cargadas
        this.cargarCategoriasEditar();

        // Establecer categoría actual
        setTimeout(() => {
            if (producto.categoria && producto.categoria.id) {
                document.getElementById('editarProductoCategoria').value = producto.categoria.id;
            }
        }, 100);

        // Establecer estado del toggle
        const toggleActivo = document.getElementById('editarProductoActivo');
        if (toggleActivo) {
            toggleActivo.checked = producto.activo;
        }

        // Mostrar imágenes actuales
        this.mostrarImagenesActuales(producto.imagen);

        // Mostrar modal con animación
        modal.style.display = 'flex';
        gsap.fromTo(modal.querySelector('.modal-content'),
            {opacity: 0, scale: 0.7, y: -50},
            {opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)"}
        );
    }

    async cargarCategoriasEditar() {
        const select = document.getElementById('editarProductoCategoria');
        if (select.children.length > 1) return; // Ya están cargadas

        try {
            const response = await fetch(`${this.apiBaseURL}/categorias`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const categorias = await response.json();

                // Limpiar opciones existentes excepto la primera
                select.innerHTML = '<option value="">Seleccionar categoría</option>';

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

    mostrarImagenesActuales(imagenes) {
        const container = document.getElementById('imagenesActualesContainer');
        container.innerHTML = '';

        if (!imagenes) {
            container.innerHTML = '<p class="no-images-message">Sin imágenes actuales</p>';
            return;
        }

        // Probar diferentes separadores
        let imagenesArray = [];
        if (imagenes.includes('|')) {
            imagenesArray = imagenes.split('|').filter(img => img.trim());
        } else if (imagenes.includes(',')) {
            imagenesArray = imagenes.split(',').filter(img => img.trim());
        } else {
            imagenesArray = [imagenes.trim()];
        }

        console.log('Imágenes del producto:', imagenes);
        console.log('Imágenes procesadas:', imagenesArray);

        if (imagenesArray.length === 0) {
            container.innerHTML = '<p class="no-images-message">Sin imágenes actuales</p>';
            return;
        }

        imagenesArray.forEach((imagen, index) => {
            const imagenDiv = document.createElement('div');
            imagenDiv.className = 'imagen-actual';

            const nombreImagen = imagen.trim();
            const rutaImagen = `http://localhost:8080/imagenes-productos/${nombreImagen}`;

            imagenDiv.innerHTML = `
            <img src="${rutaImagen}" 
                 alt="Imagen producto" 
                 onload="console.log('Imagen cargada: ${nombreImagen}')"
                 onerror="console.error('Error cargando imagen: ${nombreImagen}'); this.style.display='none'; this.parentNode.innerHTML='<div class=imagen-error>❌ Error cargando imagen</div>';">
            <button class="eliminar-imagen" onclick="perfil.eliminarImagenActual('${nombreImagen}', ${index})" title="Eliminar imagen">×</button>
        `;
            container.appendChild(imagenDiv);

            gsap.fromTo(imagenDiv,
                {opacity: 0, scale: 0.8},
                {opacity: 1, scale: 1, duration: 0.3, delay: index * 0.1, ease: "back.out(1.7)"}
            );
        });
    }

    async eliminarImagenActual(nombreImagen, index) {
        if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;

        try {
            console.log('🗑️ Eliminando imagen:', nombreImagen);

            // PASO 1: Remover visualmente PRIMERO (para mejor UX)
            const imagenDiv = document.querySelectorAll('.imagen-actual')[index];
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

            // PASO 2: Intentar eliminar del servidor EN SEGUNDO PLANO
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

            // PASO 3: Actualizar la base de datos del producto
            await this.actualizarImagenesProductoEliminando(nombreImagen);

        } catch (error) {
            console.error('❌ Error:', error);
            this.mostrarToast('Imagen removida visualmente', 'warning');
        }
    }

    async guardarEditarProducto(e) {
        e.preventDefault();

        const productoId = document.getElementById('editarProductoId').value;
        const nombre = document.getElementById('editarProductoNombre').value.trim();
        const precio = parseFloat(document.getElementById('editarProductoPrecio').value);
        const stock = parseInt(document.getElementById('editarProductoStock').value);
        const categoriaId = parseInt(document.getElementById('editarProductoCategoria').value);
        const descripcion = document.getElementById('editarProductoDescripcion').value.trim();

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

        // Mostrar loading en el botón
        const btnGuardar = document.querySelector('#formEditarProducto button[type="submit"]');
        const textoOriginal = btnGuardar.innerHTML;
        btnGuardar.innerHTML = '<span class="loading-spinner-small"></span>Guardando...';
        btnGuardar.disabled = true;

        try {
            // PRIMERO: Obtener datos completos del producto actual
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
            console.log('Producto actual obtenido:', productoActual);

            // Obtener estado del toggle si existe
            const estadoActivo = document.getElementById('editarProductoActivo') ?
                document.getElementById('editarProductoActivo').checked :
                productoActual.activo;

            // Actualizar datos básicos del producto PRESERVANDO campos importantes
            const productoData = {
                id: parseInt(productoId),
                nombre: nombre,
                descripcion: descripcion,
                precio: precio,
                stock: stock,
                categoria: {id: categoriaId},
                vendedor: {id: this.usuarioActual.id},
                activo: estadoActivo,
                fechacreacion: productoActual.fechacreacion, // PRESERVAR fecha original
                imagen: productoActual.imagen // PRESERVAR imágenes actuales
            };

            const response = await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(productoData)
            });

            if (response.ok) {
                // Si hay nuevas imágenes, subirlas
                if (this.selectedEditImages.length > 0) {
                    await this.subirNuevasImagenes(productoId);
                }

                this.mostrarToast('Producto actualizado correctamente', 'success');
                this.cerrarModal('modalEditarProducto');

                // Recargar productos si está en la sección activa
                if (document.getElementById('seccionProductos').classList.contains('active')) {
                    await this.cargarProductosVendedor();
                }
            } else {
                const errorData = await response.json().catch(() => ({error: 'Error desconocido'}));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error actualizando producto:', error);
            this.mostrarToast(`Error al actualizar producto: ${error.message}`, 'error');
        } finally {
            // Restaurar botón
            btnGuardar.innerHTML = textoOriginal;
            btnGuardar.disabled = false;
        }
    }

    async subirNuevasImagenes(productoId) {
        if (this.selectedEditImages.length === 0) return;

        console.log(`🆕 Subiendo ${this.selectedEditImages.length} nuevas imágenes para producto ${productoId}`);

        const formData = new FormData();

        this.selectedEditImages.forEach((imagen, index) => {
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
                console.log('✅ Nuevas imágenes subidas:', nombresImagenes);

                // Agregar a las existentes
                await this.actualizarImagenesProducto(productoId, nombresImagenes);

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

    async actualizarImagenesProductoEliminando(nombreImagenEliminada) {
        try {
            const productoId = document.getElementById('editarProductoId').value;
            if (!productoId) return;

            // Obtener producto actual
            const response = await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const producto = await response.json();

                if (producto.imagen) {
                    // Remover la imagen eliminada de la lista
                    const imagenesArray = producto.imagen.split(',')
                        .map(img => img.trim())
                        .filter(img => img && img !== nombreImagenEliminada);

                    const nuevasImagenes = imagenesArray.join(',');

                    // Actualizar producto
                    const productoActualizado = {
                        ...producto,
                        imagen: nuevasImagenes || null
                    };

                    await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(productoActualizado)
                    });

                    console.log('✅ Producto actualizado sin la imagen eliminada');
                }
            }
        } catch (error) {
            console.error('Error actualizando producto después de eliminar imagen:', error);
        }
    }

    async toggleProductoActivo(productoId, estadoActual) {
        const nuevoEstado = !estadoActual;
        const accion = nuevoEstado ? 'activar' : 'pausar';

        if (!confirm(`¿Estás seguro de ${accion} este producto?`)) return;

        try {
            // Obtener datos actuales del producto
            const responseGet = await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!responseGet.ok) throw new Error('Error al obtener producto');

            const producto = await responseGet.json();

            // Actualizar solo el estado activo
            const productoActualizado = {
                ...producto,
                activo: nuevoEstado
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
                this.mostrarToast(`Producto ${nuevoEstado ? 'activado' : 'pausado'} correctamente`, 'success');

                // Recargar productos
                if (document.getElementById('seccionProductos').classList.contains('active')) {
                    await this.cargarProductosVendedor();
                }
            } else {
                throw new Error('Error al actualizar estado del producto');
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarToast(`Error al ${accion} producto`, 'error');
        }
    }

    verEstadisticasProducto(productoId) {
        const modal = document.getElementById('modalStatsProducto');

        // Resetear valores
        document.getElementById('statsVentas').textContent = '0';
        document.getElementById('statsVistas').textContent = '0';
        document.getElementById('statsRating').textContent = '0.0';
        document.getElementById('statsIngresos').textContent = '$0';

        // Mostrar modal
        modal.style.display = 'flex';
        gsap.fromTo(modal.querySelector('.modal-content'),
            {opacity: 0, scale: 0.7, y: -50},
            {opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)"}
        );

        // Animar las tarjetas de stats
        gsap.fromTo('.stat-card',
            {opacity: 0, y: 30},
            {opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2}
        );

        // Animar el mensaje
        gsap.fromTo('.stats-message',
            {opacity: 0, scale: 0.9},
            {opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)", delay: 0.5}
        );

        // Animación de contadores (simulada)
        this.animarContadores();
    }

    animarContadores() {
        // Simular algunos números para mostrar la animación
        const ventas = Math.floor(Math.random() * 50);
        const vistas = Math.floor(Math.random() * 500);
        const rating = (Math.random() * 5).toFixed(1);
        const ingresos = Math.floor(Math.random() * 1000);

        // Animar contadores
        this.animarContador('statsVentas', 0, ventas, '', 0);
        this.animarContador('statsVistas', 0, vistas, '', 0);
        this.animarContador('statsRating', 0, parseFloat(rating), '', 1);
        this.animarContador('statsIngresos', 0, ingresos, '$', 0);
    }


    async eliminarProducto() {
        const productoId = document.getElementById('editarProductoId').value;
        const nombreProducto = document.getElementById('editarProductoNombre').value;

        if (!confirm(`¿Estás ABSOLUTAMENTE SEGURO de eliminar el producto "${nombreProducto}"?\n\nEsta acción NO se puede deshacer.`)) {
            return;
        }

        if (!confirm('Esta acción eliminará permanentemente el producto y toda su información. ¿Continuar?')) {
            return;
        }

        try {
            // CAMBIAR: Usar endpoint específico para eliminar completamente
            const response = await fetch(`${this.apiBaseURL}/productos/eliminar-completo/${productoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.mostrarToast('Producto eliminado completamente de la base de datos', 'success');
                this.cerrarModal('modalEditarProducto');

                if (document.getElementById('seccionProductos').classList.contains('active')) {
                    await this.cargarProductosVendedor();
                }
            } else {
                // Si no existe el endpoint específico, usar el método de marcar como eliminado
                const responseMarkAsDeleted = await fetch(`${this.apiBaseURL}/productos/${productoId}/marcar-eliminado`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (responseMarkAsDeleted.ok) {
                    this.mostrarToast('Producto marcado como eliminado', 'success');
                    this.cerrarModal('modalEditarProducto');

                    if (document.getElementById('seccionProductos').classList.contains('active')) {
                        await this.cargarProductosVendedor();
                    }
                } else {
                    throw new Error('No se pudo eliminar el producto');
                }
            }
        } catch (error) {
            console.error('Error eliminando producto:', error);
            this.mostrarToast(`Error al eliminar producto: ${error.message}`, 'error');
        }
    }

    responderResena(resenaId) {
        this.mostrarToast('Función de responder reseña en desarrollo', 'info');
    }

    reportarResena(resenaId) {
        this.mostrarToast('Función de reportar reseña en desarrollo', 'info');
    }

    verDetallePedidoVendedor(pedidoId) {
        this.mostrarToast('Función de detalle de pedido en desarrollo', 'info');
    }

    async guardarNuevoProducto(e) {
        e.preventDefault();

        const nombre = document.getElementById('productoNombre').value.trim();
        const precio = parseFloat(document.getElementById('productoPrecio').value);
        const stock = parseInt(document.getElementById('productoStock').value);
        const categoriaId = parseInt(document.getElementById('productoCategoria').value);
        const descripcion = document.getElementById('productoDescripcion').value.trim();

        // Validaciones
        if (!nombre || !precio || !stock || !categoriaId || !descripcion) {
            this.mostrarToast('Todos los campos son obligatorios', 'warning');
            return;
        }

        if (precio <= 0) {
            this.mostrarToast('El precio debe ser mayor a 0', 'warning');
            return;
        }

        if (stock <= 0) {
            this.mostrarToast('El stock debe ser mayor a 0', 'warning');
            return;
        }

        if (this.selectedImages.length === 0) {
            this.mostrarToast('Debes agregar al menos una imagen', 'warning');
            return;
        }

        const btnGuardar = document.querySelector('#formProducto button[type="submit"]');
        const textoOriginal = btnGuardar.innerHTML;
        btnGuardar.innerHTML = '<span class="loading-spinner-small"></span>Guardando...';
        btnGuardar.disabled = true;

        try {
            // PASO 1: Crear el producto SIN imágenes
            const productoData = {
                nombre: nombre,
                descripcion: descripcion,
                precio: precio,
                stock: stock,
                categoria: { id: categoriaId },
                vendedor: { id: this.usuarioActual.id },
                activo: true
            };

            console.log('🔨 Creando producto:', productoData);

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
                console.log('✅ Producto creado con ID:', productoCreado.id);

                // PASO 2: Subir imágenes y asociarlas al producto
                if (this.selectedImages.length > 0) {
                    await this.subirImagenesProducto(productoCreado.id);
                }

                this.mostrarToast('Producto creado correctamente', 'success');
                this.cerrarModal('modalProducto');

                // Recargar productos si está en la sección activa
                if (document.getElementById('seccionProductos').classList.contains('active')) {
                    await this.cargarProductosVendedor();
                }
            } else {
                const errorText = await response.text();
                console.error('❌ Error del servidor:', errorText);
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Error creando producto:', error);
            this.mostrarToast(`Error al crear producto: ${error.message}`, 'error');
        } finally {
            btnGuardar.innerHTML = textoOriginal;
            btnGuardar.disabled = false;
        }
    }

    async subirImagenesProducto(productoId) {
        if (this.selectedImages.length === 0) return;

        console.log(`=== SUBIENDO ${this.selectedImages.length} IMÁGENES PARA PRODUCTO ${productoId} ===`);

        const formData = new FormData();

        this.selectedImages.forEach((imagen, index) => {
            formData.append('archivos', imagen);
            console.log(`Imagen ${index + 1}: ${imagen.name}, Tamaño: ${imagen.size} bytes`);
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

                // INMEDIATAMENTE asociar al producto
                await this.actualizarImagenesProducto(productoId, nombresImagenes);

                return nombresImagenes;
            } else {
                const errorText = await response.text();
                console.error('❌ Error del servidor:', errorText);
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Error subiendo imágenes:', error);
            this.mostrarToast(`Error al subir imágenes: ${error.message}`, 'error');
            throw error;
        }
    }

    async actualizarImagenesProducto(productoId, nuevasImagenes) {
        try {
            console.log('🔄 Actualizando imágenes del producto:', productoId, nuevasImagenes);

            // Obtener producto actual
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

            // Crear string de imágenes
            const imagenesString = Array.isArray(nuevasImagenes) ? nuevasImagenes.join(',') : nuevasImagenes;

            // Combinar con imágenes existentes si las hay
            let imagenesFinales = imagenesString;
            if (producto.imagen && producto.imagen.trim()) {
                imagenesFinales = producto.imagen + ',' + imagenesString;
            }

            console.log('🖼️ Imágenes finales a guardar:', imagenesFinales);

            // Actualizar SOLO el campo imagen
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
            console.error('❌ Error en actualizarImagenesProducto:', error);
            throw error;
        }
    }

    filtrarResenas() {
        const filtro = document.getElementById('filtroCalificacion').value;
        const resenas = document.querySelectorAll('.resena-card');

        resenas.forEach(resena => {
            const calificacion = resena.querySelector('.resena-numero').textContent.split('/')[0];
            const mostrar = !filtro || calificacion === filtro;

            gsap.to(resena, {
                opacity: mostrar ? 1 : 0.3,
                scale: mostrar ? 1 : 0.95,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }

    // MÉTODOS PARA MODAL DE NUEVO PRODUCTO
    abrirModalProducto() {
        const modal = document.getElementById('modalProducto');
        if (modal) {
            // Limpiar formulario
            document.getElementById('formProducto').reset();
            this.selectedImages = [];
            document.getElementById('imagePreviewContainer').innerHTML = '';

            // Mostrar modal
            modal.style.display = 'flex';

            // Animar entrada
            gsap.fromTo(modal.querySelector('.modal-content'),
                {opacity: 0, scale: 0.7, y: -50},
                {opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)"}
            );
        }
    }

// ==================== NUEVOS MÉTODOS PARA EDITAR IMÁGENES ====================

    async eliminarTodasImagenesProducto(productoId) {
        if (!confirm('¿Estás seguro de eliminar TODAS las imágenes de este producto?')) return;
        try {
            // Obtener producto actual
            const response = await fetch(`${this.apiBaseURL}/productos/${productoId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const producto = await response.json();

                // Limpiar campo imagen
                const productoActualizado = {
                    ...producto,
                    imagen: null
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
                    // Limpiar visualmente
                    document.getElementById('imagenesActualesContainer').innerHTML = '<p class="no-images-message">Sin imágenes actuales</p>';
                    this.mostrarToast('Todas las imágenes eliminadas', 'success');
                }
            }
        } catch (error) {
            console.error('Error eliminando todas las imágenes:', error);
            this.mostrarToast('Error al eliminar imágenes', 'error');
        }
    }

// AGREGAR método faltante handleEditImageFiles
    handleEditImageFiles(files) {
        const maxFiles = 3;
        const maxSizePerFile = 5 * 1024 * 1024; // 5MB

        if (files.length === 0) return;

        // Si está en modo reemplazar, limpiar las imágenes seleccionadas
        if (this.modoReemplazarImagenes) {
            this.selectedEditImages = [];
            document.getElementById('editarImagePreviewContainer').innerHTML = '';
            this.modoReemplazarImagenes = false;
        }

        // Verificar límite total
        const totalAfterAdd = this.selectedEditImages.length + files.length;
        if (totalAfterAdd > maxFiles) {
            this.mostrarToast(`Máximo ${maxFiles} imágenes permitidas. Tienes ${this.selectedEditImages.length}, intentas agregar ${files.length}`, 'warning');
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

            // Agregar nueva imagen
            this.selectedEditImages.push(file);
            this.addEditImagePreview(file);
        });

        console.log(`Total imágenes seleccionadas: ${this.selectedEditImages.length}`);
    }

    // Inicializar lazy loading para imágenes
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');

                        if (src) {
                            // Mostrar loading
                            img.classList.add('loading');

                            // Cargar imagen real
                            const newImg = new Image();
                            newImg.onload = () => {
                                img.src = src;
                                img.classList.remove('loading');
                                img.classList.add('loaded');
                                observer.unobserve(img);
                            };
                            newImg.onerror = () => {
                                img.classList.remove('loading');
                                img.classList.add('error');
                                observer.unobserve(img);
                            };
                            newImg.src = src;
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });

            // Observar todas las imágenes lazy
            document.querySelectorAll('.lazy-load').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback para navegadores antiguos
            document.querySelectorAll('.lazy-load').forEach(img => {
                const src = img.getAttribute('data-src');
                if (src) img.src = src;
            });
        }
    }

// Métodos para funciones de vendedor
    crearPreorden() {
        console.log('Redirigiendo a preórdenes...');
        // Redireccionar a la página de preórdenes
        window.location.href = '/preorden';
    }

    enviarNotificacion() {
        console.log('Redirigiendo a notificaciones...');
        // Redireccionar a la página de notificaciones
        window.location.href = '/notificaciones';
    }

} // FINAL DE LA CLASE PerfilUsuario

// Funciones globales para el HTML
function cerrarModal(modalId) {
    window.perfil.cerrarModal(modalId);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.perfil = new PerfilUsuario();
});