// preorden.js - Sistema completo mejorado con animaciones 3D avanzadas
class PreordenManager {
    constructor() {
        this.apiBaseURL = 'http://localhost:8080/api';
        this.usuarioActual = null;
        this.tipoUsuario = null;
        this.preordenes = [];
        this.productos = [];
        this.productoSeleccionado = null;
        this.currentStep = 1;
        this.filtros = {
            estado: '',
            fecha: ''
        };
        this.animationsEnabled = true;
        this.currentView = 'list'; // Default a list view
        this.init();
    }

    async init() {
        try {
            this.mostrarLoadingScreen();
            await this.cargarUsuario();

            // ✅ CONFIGURAR INTERFAZ SEGÚN TIPO DE USUARIO
            this.configurarInterfazPorTipoUsuario();

            if (this.tipoUsuario === 'VENDEDOR') {
                await this.cargarProductosPreorden();
                await this.cargarPreordenesVendedor();
            } else {
                await this.cargarPreordenesComprador();
            }

            this.setupEventListeners();
            this.ocultarLoadingScreenSimple();
            this.actualizarEstadisticas();
            this.aplicarEfectos3DSimples();

        } catch (error) {
            console.error('Error inicializando PreordenManager:', error);
            this.ocultarLoadingScreenSimple();
            this.mostrarToast('Error al cargar preórdenes', 'error');
        }
    }

    configurarInterfazPorTipoUsuario() {
        const headerTitle = document.querySelector('.page-title');
        const btnNuevaPreorden = document.getElementById('btnNuevaPreorden');

        if (this.tipoUsuario === 'VENDEDOR') {
            // Configuración para vendedores
            if (headerTitle) {
                headerTitle.innerHTML = `
                <span class="title-icon">🏪</span>
                Gestión de Preórdenes
            `;
            }

            if (btnNuevaPreorden) {
                btnNuevaPreorden.innerHTML = `
                <span class="btn-icon">🔍</span>
                <span>Ver Productos de Preorden</span>
            `;
                btnNuevaPreorden.onclick = () => this.navegarAProductosPreorden();
            }

        } else {
            // Configuración para compradores
            if (headerTitle) {
                headerTitle.innerHTML = `
                <span class="title-icon">⏳</span>
                Mis Preórdenes
            `;
            }

            if (btnNuevaPreorden) {
                btnNuevaPreorden.innerHTML = `
                <span class="btn-icon">🛒</span>
                <span>Explorar Productos de Preorden</span>
            `;
                btnNuevaPreorden.onclick = () => this.navegarAProductosPreorden();
            }
        }
    }

    async cargarProductosPreorden() {
        try {
            const response = await fetch(`${this.apiBaseURL}/productos/preorden`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.productosPreorden = await response.json();
                console.log('Productos de preorden cargados:', this.productosPreorden);
            } else {
                throw new Error('Error al cargar productos de preorden');
            }
        } catch (error) {
            console.error('Error cargando productos de preorden:', error);
            this.productosPreorden = [];
        }
    }

    async cargarPreordenesVendedor() {
        try {
            const endpoint = `${this.apiBaseURL}/preordenes/vendedor/${this.usuarioActual.id}`;
            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.preordenes = await response.json();
                console.log('Preórdenes de vendedor cargadas:', this.preordenes);
                this.mostrarPreordenesVendedor();
            } else {
                throw new Error('Error al cargar preórdenes del vendedor');
            }
        } catch (error) {
            console.error('Error cargando preórdenes de vendedor:', error);
            this.preordenes = [];
            this.mostrarEstadoVacio();
        }
    }

    async cargarPreordenesComprador() {
        try {
            const endpoint = `${this.apiBaseURL}/preordenes/usuario/${this.usuarioActual.id}`;
            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.preordenes = await response.json();
                console.log('Preórdenes de comprador cargadas:', this.preordenes);
                this.mostrarPreordenesComprador();
            } else {
                throw new Error('Error al cargar preórdenes del comprador');
            }
        } catch (error) {
            console.error('Error cargando preórdenes de comprador:', error);
            this.preordenes = [];
            this.mostrarEstadoVacio();
        }
    }

    mostrarPreordenesVendedor() {
        const container = document.getElementById('preordenesContainer');
        container.innerHTML = '';

        if (this.preordenes.length === 0) {
            this.mostrarEstadoVacio('No tienes preórdenes de clientes aún');
            return;
        }

        const preordenesFiltradas = this.aplicarFiltros(this.preordenes);

        preordenesFiltradas.forEach((preorden, index) => {
            const preordenCard = this.crearPreordenCardVendedor(preorden);
            container.appendChild(preordenCard);

            // Animación de entrada
            gsap.set(preordenCard, { opacity: 0, y: 50, scale: 0.9 });
            gsap.to(preordenCard, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                delay: index * 0.1,
                ease: "back.out(1.7)"
            });
        });
    }

    mostrarPreordenesComprador() {
        const container = document.getElementById('preordenesContainer');
        container.innerHTML = '';

        if (this.preordenes.length === 0) {
            this.mostrarEstadoVacio('No tienes preórdenes aún');
            return;
        }

        const preordenesFiltradas = this.aplicarFiltros(this.preordenes);

        preordenesFiltradas.forEach((preorden, index) => {
            const preordenCard = this.crearPreordenCardComprador(preorden);
            container.appendChild(preordenCard);

            // Animación de entrada
            gsap.set(preordenCard, { opacity: 0, y: 50, scale: 0.9 });
            gsap.to(preordenCard, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                delay: index * 0.1,
                ease: "back.out(1.7)"
            });
        });
    }

    crearPreordenCardVendedor(preorden) {
        const card = document.createElement('div');
        card.className = 'preorden-card vendedor-card';

        const fecha = new Date(preorden.fechapreorden).toLocaleDateString('es-ES');
        const fechaEntrega = preorden.fechaestimadaentrega ?
            new Date(preorden.fechaestimadaentrega).toLocaleDateString('es-ES') : 'Por definir';

        card.innerHTML = `
        <div class="preorden-header">
            <div class="preorden-id">Preorden #${preorden.id}</div>
            <div class="preorden-estado estado-${preorden.estado.toLowerCase()}">
                ${this.getEstadoTexto(preorden.estado)}
            </div>
            <div class="preorden-acciones-vendedor">
                <button class="btn-cambiar-estado" onclick="preordenManager.cambiarEstadoPreorden(${preorden.id})">
                    🔄 Cambiar Estado
                </button>
            </div>
        </div>

        <div class="preorden-cliente">
            <div class="cliente-info">
                <h4>Cliente: ${preorden.usuario?.nombre || 'Usuario'}</h4>
                <p>Email: ${preorden.usuario?.email || 'No disponible'}</p>
            </div>
        </div>

        <div class="preorden-producto">
            <div class="producto-imagen">
                ${this.obtenerImagenProducto(preorden.producto)}
            </div>
            <div class="producto-info">
                <h4>${preorden.producto?.nombre || 'Producto no disponible'}</h4>
                <p>Cantidad: ${preorden.cantidad}</p>
                <p>Precio: $${Number(preorden.preciopreorden).toLocaleString('es-ES')}</p>
            </div>
        </div>

        <div class="preorden-detalles">
            <div class="detalle-item">
                <span>Total:</span>
                <span>$${(preorden.preciopreorden * preorden.cantidad).toLocaleString('es-ES')}</span>
            </div>
            <div class="detalle-item">
                <span>Fecha Pedido:</span>
                <span>${fecha}</span>
            </div>
            <div class="detalle-item">
                <span>Entrega Estimada:</span>
                <span>${fechaEntrega}</span>
            </div>
        </div>

        ${preorden.notas ? `
            <div class="preorden-notas">
                <h5>Notas del cliente:</h5>
                <p>${preorden.notas}</p>
            </div>
        ` : ''}
    `;

        return card;
    }

    crearPreordenCardComprador(preorden) {
        const card = document.createElement('div');
        card.className = 'preorden-card comprador-card';
        card.onclick = () => this.verDetallePreorden(preorden.id);

        const fecha = new Date(preorden.fechapreorden).toLocaleDateString('es-ES');
        const fechaEntrega = preorden.fechaestimadaentrega ?
            new Date(preorden.fechaestimadaentrega).toLocaleDateString('es-ES') : 'Por definir';

        card.innerHTML = `
        <div class="preorden-header">
            <div class="preorden-id">Preorden #${preorden.id}</div>
            <div class="preorden-estado estado-${preorden.estado.toLowerCase()}">
                ${this.getEstadoTexto(preorden.estado)}
            </div>
        </div>

        <div class="preorden-producto">
            <div class="producto-imagen">
                ${this.obtenerImagenProducto(preorden.producto)}
            </div>
            <div class="producto-info">
                <h4>${preorden.producto?.nombre || 'Producto no disponible'}</h4>
                <p>Cantidad: ${preorden.cantidad}</p>
            </div>
        </div>

        <div class="preorden-detalles">
            <div class="detalle-item">
                <span>Total:</span>
                <span>$${(preorden.preciopreorden * preorden.cantidad).toLocaleString('es-ES')}</span>
            </div>
            <div class="detalle-item">
                <span>Fecha Pedido:</span>
                <span>${fecha}</span>
            </div>
            <div class="detalle-item">
                <span>Entrega Estimada:</span>
                <span>${fechaEntrega}</span>
            </div>
            <div class="detalle-item">
                <span>Estado:</span>
                <span>${this.getEstadoTexto(preorden.estado)}</span>
            </div>
        </div>

        ${preorden.notas ? `
            <div class="preorden-notas">
                <h5>Mis notas:</h5>
                <p>${preorden.notas}</p>
            </div>
        ` : ''}

        <div class="preorden-acciones-comprador">
            ${preorden.estado === 'PENDIENTE' ? `
                <button class="btn-cancelar-preorden" onclick="event.stopPropagation(); preordenManager.cancelarPreorden(${preorden.id})">
                    ❌ Cancelar Preorden
                </button>
            ` : ''}
            <button class="btn-contactar-vendedor" onclick="event.stopPropagation(); preordenManager.contactarVendedor(${preorden.producto?.vendedor?.id || 'N/A'})">
                💬 Contactar Vendedor
            </button>
        </div>
    `;

        return card;
    }

    obtenerImagenProducto(producto) {
        if (!producto || !producto.imagen) {
            return '<div class="placeholder-icon">📦</div>';
        }

        const imagenes = producto.imagen.split(/[|,]/).filter(img => img.trim());
        if (imagenes.length === 0) {
            return '<div class="placeholder-icon">📦</div>';
        }

        const primeraImagen = imagenes[0].trim();
        return `<img src="http://localhost:8080/imagenes-productos/${primeraImagen}" 
                 alt="${producto.nombre}" 
                 onerror="this.parentNode.innerHTML='<div class=\\"placeholder-icon\\">📦</div>';">`;
    }

    navegarAProductosPreorden() {
        // Navegar a categorías con filtro de productos de preorden
        window.location.href = '/categorias?preorden=true';
    }

    crearProductoPreorden() {
        // Navegar a crear producto con flag de preorden
        window.location.href = '/categorias?crear=preorden';
    }

    async cambiarEstadoPreorden(preordenId) {
        this.mostrarModalCambiarEstado(preordenId);
    }

    mostrarModalCambiarEstado(preordenId) {
        const preorden = this.preordenes.find(p => p.id === preordenId);
        if (!preorden) return;

        const modal = document.createElement('div');
        modal.id = 'modal-cambiar-estado';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
        <div class="modal-content estado-modal">
            <div class="modal-header">
                <h3>
                    <span class="modal-icon">🔄</span>
                    Cambiar Estado - Preorden #${preordenId}
                </h3>
                <button class="modal-close" onclick="preordenManager.cerrarModalEstado()">×</button>
            </div>

            <div class="modal-body">
                <div class="estado-actual-info">
                    <h4>Estado Actual</h4>
                    <div class="estado-badge-grande estado-${preorden.estado.toLowerCase()}">
                        ${this.getEstadoTexto(preorden.estado)}
                    </div>
                </div>

                <div class="estados-disponibles">
                    <h4>Seleccionar Nuevo Estado</h4>
                    <div class="estados-grid">
                        <div class="estado-option ${preorden.estado === 'PENDIENTE' ? 'disabled' : ''}" 
                             data-estado="PENDIENTE" onclick="preordenManager.seleccionarEstado('PENDIENTE')">
                            <div class="estado-icon">⏳</div>
                            <span>Pendiente</span>
                        </div>
                        <div class="estado-option ${preorden.estado === 'CONFIRMADA' ? 'disabled' : ''}" 
                             data-estado="CONFIRMADA" onclick="preordenManager.seleccionarEstado('CONFIRMADA')">
                            <div class="estado-icon">✅</div>
                            <span>Confirmada</span>
                        </div>
                        <div class="estado-option ${preorden.estado === 'PRODUCCION' ? 'disabled' : ''}" 
                             data-estado="PRODUCCION" onclick="preordenManager.seleccionarEstado('PRODUCCION')">
                            <div class="estado-icon">🔧</div>
                            <span>En Producción</span>
                        </div>
                        <div class="estado-option ${preorden.estado === 'LISTA' ? 'disabled' : ''}" 
                             data-estado="LISTA" onclick="preordenManager.seleccionarEstado('LISTA')">
                            <div class="estado-icon">📦</div>
                            <span>Lista</span>
                        </div>
                        <div class="estado-option ${preorden.estado === 'ENTREGADA' ? 'disabled' : ''}" 
                             data-estado="ENTREGADA" onclick="preordenManager.seleccionarEstado('ENTREGADA')">
                            <div class="estado-icon">🎉</div>
                            <span>Entregada</span>
                        </div>
                        <div class="estado-option ${preorden.estado === 'CANCELADA' ? 'disabled' : ''}" 
                             data-estado="CANCELADA" onclick="preordenManager.seleccionarEstado('CANCELADA')">
                            <div class="estado-icon">❌</div>
                            <span>Cancelada</span>
                        </div>
                    </div>
                </div>

                <div class="estado-seleccionado" id="estado-seleccionado" style="display: none;">
                    <h4>Estado Seleccionado</h4>
                    <div class="estado-preview" id="estado-preview"></div>
                </div>
            </div>

            <div class="modal-actions">
                <button class="modal-btn primary" id="btn-confirmar-estado" onclick="preordenManager.confirmarCambioEstado(${preordenId})" disabled>
                    <span class="btn-icon">✅</span>
                    Confirmar Cambio
                </button>
                <button class="modal-btn secondary" onclick="preordenManager.cerrarModalEstado()">
                    Cancelar
                </button>
            </div>
        </div>
    `;

        document.body.appendChild(modal);
        this.animarModalEntrada(modal);
    }

    seleccionarEstado(estado) {
        // Remover selección anterior
        document.querySelectorAll('.estado-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Seleccionar nuevo estado
        const option = document.querySelector(`[data-estado="${estado}"]`);
        if (option && !option.classList.contains('disabled')) {
            option.classList.add('selected');

            // Mostrar preview
            const preview = document.getElementById('estado-preview');
            const container = document.getElementById('estado-seleccionado');

            if (preview && container) {
                preview.innerHTML = `
                <div class="estado-badge-grande estado-${estado.toLowerCase()}">
                    ${this.getEstadoTexto(estado)}
                </div>
            `;

                container.style.display = 'block';

                // Habilitar botón confirmar
                const btnConfirmar = document.getElementById('btn-confirmar-estado');
                if (btnConfirmar) {
                    btnConfirmar.disabled = false;
                }

                // Guardar estado seleccionado
                this.estadoSeleccionado = estado;
            }
        }
    }

    async confirmarCambioEstado(preordenId) {
        if (!this.estadoSeleccionado) return;

        try {
            const response = await fetch(`${this.apiBaseURL}/preordenes/${preordenId}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ estado: this.estadoSeleccionado })
            });

            if (response.ok) {
                this.mostrarToast(`Estado actualizado a: ${this.getEstadoTexto(this.estadoSeleccionado)}`, 'success');
                this.cerrarModalEstado();
                await this.cargarPreordenesVendedor();
            } else {
                throw new Error('Error al actualizar estado');
            }
        } catch (error) {
            console.error('Error actualizando estado:', error);
            this.mostrarToast('Error al actualizar estado', 'error');
        }
    }

    cerrarModalEstado() {
        const modal = document.getElementById('modal-cambiar-estado');
        if (modal) {
            modal.remove();
            this.estadoSeleccionado = null;
            document.body.style.overflow = '';
        }
    }

    mostrarModalCambiarEstado(preordenId) {
        const preorden = this.preordenes.find(p => p.id === preordenId);
        if (!preorden) return;

        const modal = document.createElement('div');
        modal.id = 'modal-cambiar-estado';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
        <div class="modal-content estado-modal">
            <div class="modal-header">
                <h3>
                    <span class="modal-icon">🔄</span>
                    Cambiar Estado - Preorden #${preordenId}
                </h3>
                <button class="modal-close" onclick="preordenManager.cerrarModalEstado()">×</button>
            </div>

            <div class="modal-body">
                <div class="estado-actual-info">
                    <h4>Estado Actual</h4>
                    <div class="estado-badge-grande estado-${preorden.estado.toLowerCase()}">
                        ${this.getEstadoTexto(preorden.estado)}
                    </div>
                </div>

                <div class="estados-disponibles">
                    <h4>Seleccionar Nuevo Estado</h4>
                    <div class="estados-grid">
                        <div class="estado-option ${preorden.estado === 'PENDIENTE' ? 'disabled' : ''}" 
                             data-estado="PENDIENTE" onclick="preordenManager.seleccionarEstado('PENDIENTE')">
                            <div class="estado-icon">⏳</div>
                            <span>Pendiente</span>
                        </div>
                        <div class="estado-option ${preorden.estado === 'CONFIRMADA' ? 'disabled' : ''}" 
                             data-estado="CONFIRMADA" onclick="preordenManager.seleccionarEstado('CONFIRMADA')">
                            <div class="estado-icon">✅</div>
                            <span>Confirmada</span>
                        </div>
                        <div class="estado-option ${preorden.estado === 'PRODUCCION' ? 'disabled' : ''}" 
                             data-estado="PRODUCCION" onclick="preordenManager.seleccionarEstado('PRODUCCION')">
                            <div class="estado-icon">🔧</div>
                            <span>En Producción</span>
                        </div>
                        <div class="estado-option ${preorden.estado === 'LISTA' ? 'disabled' : ''}" 
                             data-estado="LISTA" onclick="preordenManager.seleccionarEstado('LISTA')">
                            <div class="estado-icon">📦</div>
                            <span>Lista</span>
                        </div>
                        <div class="estado-option ${preorden.estado === 'ENTREGADA' ? 'disabled' : ''}" 
                             data-estado="ENTREGADA" onclick="preordenManager.seleccionarEstado('ENTREGADA')">
                            <div class="estado-icon">🎉</div>
                            <span>Entregada</span>
                        </div>
                        <div class="estado-option ${preorden.estado === 'CANCELADA' ? 'disabled' : ''}" 
                             data-estado="CANCELADA" onclick="preordenManager.seleccionarEstado('CANCELADA')">
                            <div class="estado-icon">❌</div>
                            <span>Cancelada</span>
                        </div>
                    </div>
                </div>

                <div class="estado-seleccionado" id="estado-seleccionado" style="display: none;">
                    <h4>Estado Seleccionado</h4>
                    <div class="estado-preview" id="estado-preview"></div>
                </div>
            </div>

            <div class="modal-actions">
                <button class="modal-btn primary" id="btn-confirmar-estado" onclick="preordenManager.confirmarCambioEstado(${preordenId})" disabled>
                    <span class="btn-icon">✅</span>
                    Confirmar Cambio
                </button>
                <button class="modal-btn secondary" onclick="preordenManager.cerrarModalEstado()">
                    Cancelar
                </button>
            </div>
        </div>
    `;

        document.body.appendChild(modal);
        this.animarModalEntrada(modal);
    }

    seleccionarEstado(estado) {
        // Remover selección anterior
        document.querySelectorAll('.estado-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Seleccionar nuevo estado
        const option = document.querySelector(`[data-estado="${estado}"]`);
        if (option && !option.classList.contains('disabled')) {
            option.classList.add('selected');

            // Mostrar preview
            const preview = document.getElementById('estado-preview');
            const container = document.getElementById('estado-seleccionado');

            preview.innerHTML = `
            <div class="estado-badge-grande estado-${estado.toLowerCase()}">
                ${this.getEstadoTexto(estado)}
            </div>
        `;

            container.style.display = 'block';

            // Habilitar botón confirmar
            document.getElementById('btn-confirmar-estado').disabled = false;

            // Guardar estado seleccionado
            this.estadoSeleccionado = estado;
        }
    }

    async confirmarCambioEstado(preordenId) {
        if (!this.estadoSeleccionado) return;

        try {
            const response = await fetch(`${this.apiBaseURL}/preordenes/${preordenId}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ estado: this.estadoSeleccionado })
            });

            if (response.ok) {
                this.mostrarToast(`Estado actualizado a: ${this.getEstadoTexto(this.estadoSeleccionado)}`, 'success');
                this.cerrarModalEstado();
                await this.cargarPreordenesVendedor();
            } else {
                throw new Error('Error al actualizar estado');
            }
        } catch (error) {
            console.error('Error actualizando estado:', error);
            this.mostrarToast('Error al actualizar estado', 'error');
        }
    }

    cerrarModalEstado() {
        const modal = document.getElementById('modal-cambiar-estado');
        if (modal) {
            modal.remove();
            this.estadoSeleccionado = null;
            document.body.style.overflow = '';
        }
    }

    async cancelarPreorden(preordenId) {
        const motivo = prompt('¿Por qué deseas cancelar esta preorden?');

        if (motivo) {
            try {
                const response = await fetch(`${this.apiBaseURL}/preordenes/${preordenId}/cancelar`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ motivo })
                });

                if (response.ok) {
                    this.mostrarToast('Preorden cancelada correctamente', 'success');
                    await this.cargarPreordenesComprador(); // Recargar preórdenes
                } else {
                    throw new Error('Error al cancelar preorden');
                }
            } catch (error) {
                console.error('Error cancelando preorden:', error);
                this.mostrarToast('Error al cancelar preorden', 'error');
            }
        }
    }

    contactarVendedor(vendedorId) {
        this.mostrarToast('Función de contacto en desarrollo', 'info');
    }

    ocultarLoadingScreenSimple() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    aplicarEfectos3DSimples() {
        // Efectos 3D suaves para las cards
        const cards = document.querySelectorAll('.stat-card, .preorden-card');
        cards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    rotationY: 5,
                    rotationX: -2,
                    z: 20,
                    scale: 1.05,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationY: 0,
                    rotationX: 0,
                    z: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }


    async iniciarSecuenciaAnimacionCompleta() {
        const tl = gsap.timeline();

        // 1. Preparar elementos
        gsap.set(['.nav-header', '.stats-section', '.filters-section', '.preordenes-section'], {
            opacity: 0
        });

        // 2. Ocultar loading screen con transición suave
        tl.to('#loadingScreen', {
            opacity: 0,
            scale: 0.8,
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
                document.getElementById('loadingScreen').style.display = 'none';
            }
        })

            // 3. Animar fondo con ondas líquidas
            .to('body::before', {
                opacity: 1,
                duration: 1.5,
                ease: "power2.out"
            }, "-=0.5")

            // 4. Header con efecto líquido
            .to('.nav-header', {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "back.out(1.7)",
                onComplete: () => {
                    this.addLiquidEffect('.nav-header');
                }
            }, "-=1")

            // 5. Stats cards con animación 3D mejorada
            .add(() => {
                this.animarStatsCardsEspecial();
            }, "-=0.5")

            // 6. Filters con neumorphism
            .to('.filters-section', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                onComplete: () => {
                    this.addNeumorphismEffect('.filters-section');
                }
            }, "-=1.2")

            // 7. Preordenes section
            .to('.preordenes-section', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.6")

            // 8. Mostrar preórdenes con efecto 3D especial
            .add(() => {
                this.mostrarPreordenesConEfecto3D();
            }, "-=0.3")

            // 9. Habilitar todas las interacciones
            .add(() => {
                this.habilitarTodasLasInteracciones();
            });

        return tl;
    }

    animarStatsCardsEspecial() {
        const cards = document.querySelectorAll('.stat-card');

        cards.forEach((card, index) => {
            // Configurar posición inicial 3D extrema
            gsap.set(card, {
                rotationX: 90,
                rotationY: 45,
                z: -300,
                scale: 0.3,
                opacity: 0,
                transformOrigin: "center center"
            });

            // Animación de caída con rebote líquido
            const tl = gsap.timeline({ delay: index * 0.2 });

            tl.to(card, {
                rotationX: 0,
                rotationY: 0,
                z: 0,
                scale: 1,
                opacity: 1,
                duration: 1.5,
                ease: "back.out(2)",
                onComplete: () => {
                    // Efecto de splash líquido al aterrizar
                    this.createLiquidSplash(card);
                }
            })
                .to(card, {
                    scale: 1.1,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.out"
                }, "-=0.3");

            // Añadir efectos continuos
            this.setupAdvancedCardEffects(card);
        });
    }

    createLiquidSplash(element) {
        // Crear múltiples ondas de splash
        for (let i = 0; i < 3; i++) {
            const splash = document.createElement('div');
            splash.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 100px;
                height: 100px;
                background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                transform: translate(-50%, -50%) scale(0);
                z-index: -1;
            `;
            element.appendChild(splash);

            gsap.to(splash, {
                scale: 2 + i * 0.5,
                opacity: 0,
                duration: 1 + i * 0.2,
                ease: "power2.out",
                onComplete: () => {
                    splash.remove();
                }
            });
        }
    }

    setupAdvancedCardEffects(card) {
        // Efecto de flotación continua
        gsap.to(card, {
            y: -5,
            duration: 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });

        // Hover effect mejorado con perspectiva 3D
        card.addEventListener('mouseenter', () => {
            if (this.animationsEnabled) {
                gsap.to(card, {
                    rotationY: 8,
                    rotationX: -3,
                    z: 30,
                    scale: 1.08,
                    duration: 0.4,
                    ease: "power2.out"
                });

                // Añadir efecto de onda líquida
                this.addRippleEffect(card, event);
            }
        });

        card.addEventListener('mouseleave', () => {
            if (this.animationsEnabled) {
                gsap.to(card, {
                    rotationY: 0,
                    rotationX: 0,
                    z: 0,
                    scale: 1,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        });
    }

    addRippleEffect(element, event) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = (event?.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
        const y = (event?.clientY || rect.top + rect.height / 2) - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            transform: scale(0);
            z-index: 1;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        gsap.to(ripple, {
            scale: 2,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
                ripple.remove();
            }
        });
    }

    addLiquidEffect(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        element.classList.add('liquid-animation');

        // Añadir brillo líquido
        const shine = document.createElement('div');
        shine.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            z-index: 1;
            pointer-events: none;
        `;
        element.style.position = 'relative';
        element.appendChild(shine);

        // Animar el brillo
        gsap.to(shine, {
            left: '100%',
            duration: 2,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 3
        });
    }

    addNeumorphismEffect(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        // Añadir sombras neumórficas dinámicas
        gsap.to(element, {
            boxShadow: "12px 12px 24px rgba(180, 195, 215, 0.6), -12px -12px 24px rgba(255, 255, 255, 0.9)",
            duration: 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
    }

    mostrarPreordenesConEfecto3D() {
        // Esta función se ejecutará cuando se muestren las preórdenes
        // El efecto 3D se aplicará individualmente a cada card
        console.log('Efecto 3D activado para preórdenes');
    }

    habilitarTodasLasInteracciones() {
        this.animationsEnabled = true;
        console.log('Todas las interacciones habilitadas');

        // Añadir efectos de shimmer a botones interactivos
        const interactiveElements = document.querySelectorAll('.nav-btn, .filter-btn, .view-btn');
        interactiveElements.forEach(element => {
            this.addAdvancedShimmerEffect(element);
        });
    }

    addAdvancedShimmerEffect(element) {
        const shimmer = document.createElement('div');
        shimmer.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
                transparent, 
                rgba(255,255,255,0.4), 
                rgba(240,248,255,0.6), 
                rgba(255,255,255,0.4), 
                transparent);
            animation: shimmerFlow 4s infinite;
            pointer-events: none;
            z-index: 1;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(shimmer);

        // Añadir CSS para la animación si no existe
        if (!document.querySelector('#shimmer-advanced-styles')) {
            const style = document.createElement('style');
            style.id = 'shimmer-advanced-styles';
            style.textContent = `
                @keyframes shimmerFlow {
                    0% { left: -100%; opacity: 0; }
                    50% { left: 50%; opacity: 1; }
                    100% { left: 100%; opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    mostrarLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.display = 'flex';

        // Animación líquida del spinner
        gsap.to('.loading-spinner', {
            rotation: 360,
            duration: 2,
            repeat: -1,
            ease: "none"
        });

        // Animación de respiración en el texto
        gsap.to('.loading-content p', {
            opacity: 0.4,
            scale: 0.95,
            duration: 1.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    }

    // Métodos de carga de datos (sin cambios)
    async cargarUsuario() {
        const usuarioId = localStorage.getItem('usuarioId');
        const token = localStorage.getItem('token');
        const usuarioGuardado = localStorage.getItem('usuario');

        if (!usuarioId || !token) {
            console.log('No hay token o usuarioId, redirigiendo a login');
            window.location.href = 'login';
            return;
        }

        if (usuarioGuardado) {
            try {
                this.usuarioActual = JSON.parse(usuarioGuardado);
                this.tipoUsuario = this.usuarioActual.tipousuario || 'COMPRADOR';
                console.log('Usuario cargado:', this.usuarioActual);
            } catch (error) {
                console.error('Error parseando usuario:', error);
                this.crearUsuarioBasico(usuarioId);
            }
        } else {
            this.crearUsuarioBasico(usuarioId);
        }
    }

    crearUsuarioBasico(usuarioId) {
        this.usuarioActual = {
            id: usuarioId,
            nombre: 'Usuario',
            email: 'usuario@ejemplo.com',
            tipousuario: 'COMPRADOR'
        };
        this.tipoUsuario = 'COMPRADOR';
        console.log('Usuario básico creado');
    }

    async cargarProductos() {
        try {
            const response = await fetch(`${this.apiBaseURL}/productos`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const productos = await response.json();
                this.productos = productos.filter(p => p.activo && p.stock > 0);
                console.log('Productos disponibles:', this.productos);
            } else {
                throw new Error('Error al cargar productos');
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
            this.productos = [];
        }
    }

    async cargarPreordenes() {
        try {
            const endpoint = this.tipoUsuario === 'VENDEDOR'
                ? `${this.apiBaseURL}/preordenes/vendedor/${this.usuarioActual.id}`
                : `${this.apiBaseURL}/preordenes/usuario/${this.usuarioActual.id}`;

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.preordenes = await response.json();
                console.log('Preórdenes cargadas:', this.preordenes);
                // No llamar mostrarPreordenes aquí, se hará en la secuencia de animación
            } else {
                throw new Error('Error al cargar preórdenes');
            }
        } catch (error) {
            console.error('Error cargando preórdenes:', error);
            this.preordenes = [];
        }
    }

    mostrarPreordenes() {
        const container = document.getElementById('preordenesContainer');
        container.innerHTML = '';

        if (this.preordenes.length === 0) {
            this.mostrarEstadoVacio();
            return;
        }

        const preordenesFiltradas = this.aplicarFiltros(this.preordenes);

        if (preordenesFiltradas.length === 0) {
            this.mostrarEstadoVacio('No se encontraron preórdenes con los filtros aplicados');
            return;
        }

        preordenesFiltradas.forEach((preorden, index) => {
            const preordenCard = this.crearPreordenCard(preorden);
            container.appendChild(preordenCard);

            // Aplicar animación 3D especial para caída desde el cielo
            gsap.set(preordenCard, {
                opacity: 0,
                y: -300,
                z: -200,
                rotationX: 90,
                rotationY: 15,
                scale: 0.5,
                transformStyle: "preserve-3d"
            });

            // Animación de caída 3D con sombra
            gsap.to(preordenCard, {
                opacity: 1,
                y: 0,
                z: 0,
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                duration: 1.5,
                delay: index * 0.15,
                ease: "bounce.out",
                onStart: () => {
                    preordenCard.classList.add('liquid-drop-3d');
                },
                onComplete: () => {
                    // Efecto de impacto al aterrizar
                    this.createImpactEffect(preordenCard);
                }
            });
        });
    }

    createImpactEffect(element) {
        // Crear ondas de impacto
        const impact = document.createElement('div');
        impact.style.cssText = `
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            height: 10px;
            background: radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%);
            border-radius: 50%;
            filter: blur(5px);
            animation: impactWave 0.8s ease-out forwards;
        `;

        element.style.position = 'relative';
        element.appendChild(impact);

        // CSS para el efecto de impacto
        if (!document.querySelector('#impact-styles')) {
            const style = document.createElement('style');
            style.id = 'impact-styles';
            style.textContent = `
                @keyframes impactWave {
                    0% { 
                        transform: translateX(-50%) scale(0.5); 
                        opacity: 0;
                    }
                    50% { 
                        transform: translateX(-50%) scale(1.2); 
                        opacity: 1;
                    }
                    100% { 
                        transform: translateX(-50%) scale(1.5); 
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            impact.remove();
        }, 800);
    }

    crearPreordenCard(preorden) {
        const card = document.createElement('div');
        card.className = 'preorden-card';
        card.onclick = () => this.verDetallePreorden(preorden.id);

        const fecha = new Date(preorden.fechapreorden).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const fechaEntrega = preorden.fechaestimadaentrega
            ? new Date(preorden.fechaestimadaentrega).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
            : 'Por definir';

        let imagenProducto = '📦';
        if (preorden.producto && preorden.producto.imagen) {
            const imagenes = preorden.producto.imagen.split(',').filter(img => img.trim());
            if (imagenes.length > 0) {
                imagenProducto = `<img src="<http://localhost:8080/imagenes-productos/${imagenes>[0].trim()}" 
                                      alt="${preorden.producto.nombre}" 
                                      onerror="this.parentNode.innerHTML='📦';">`;
            }
        }

        card.innerHTML = `
            <div class="preorden-header">
                <div class="preorden-id">Preorden #${preorden.id}</div>
                <div class="preorden-estado estado-${preorden.estado.toLowerCase()}">
                    ${this.getEstadoTexto(preorden.estado)}
                </div>
            </div>

            <div class="preorden-producto">
                <div class="producto-imagen">
                    ${imagenProducto}
                </div>
                <div class="producto-info">
                    <h4>${preorden.producto ? preorden.producto.nombre : 'Producto no disponible'}</h4>
                    <p>Cantidad: ${preorden.cantidad}</p>
                </div>
            </div>

            <div class="preorden-detalles">
                <div class="detalle-item">
                    <div class="detalle-label">Precio Unitario</div>
                    <div class="detalle-valor">$${Number(preorden.preciopreorden).toLocaleString('es-ES', {minimumFractionDigits: 2})}</div>
                </div>
                <div class="detalle-item">
                    <div class="detalle-label">Total</div>
                    <div class="detalle-valor">$${(preorden.preciopreorden * preorden.cantidad).toLocaleString('es-ES', {minimumFractionDigits: 2})}</div>
                </div>
                <div class="detalle-item">
                    <div class="detalle-label">Entrega Estimada</div>
                    <div class="detalle-valor">${fechaEntrega}</div>
                </div>
                <div class="detalle-item">
                    <div class="detalle-label">Estado</div>
                    <div class="detalle-valor">${this.getEstadoTexto(preorden.estado)}</div>
                </div>
            </div>

            <div class="preorden-footer">
                <div class="preorden-fecha">Creada: ${fecha}</div>
                <div class="preorden-total">$${(preorden.preciopreorden * preorden.cantidad).toLocaleString('es-ES', {minimumFractionDigits: 2})}</div>
            </div>
        `;

        return card;
    }

    aplicarFiltros(preordenes) {
        let filtradas = [...preordenes];

        if (this.filtros.estado) {
            filtradas = filtradas.filter(p => p.estado === this.filtros.estado);
        }

        if (this.filtros.fecha) {
            const ahora = new Date();
            let fechaLimite;

            switch (this.filtros.fecha) {
                case 'ultima-semana':
                    fechaLimite = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'ultimo-mes':
                    fechaLimite = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'ultimos-3-meses':
                    fechaLimite = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    fechaLimite = null;
            }

            if (fechaLimite) {
                filtradas = filtradas.filter(p => new Date(p.fechapreorden) >= fechaLimite);
            }
        }

        return filtradas;
    }

    mostrarEstadoVacio(mensaje = null) {
        const container = document.getElementById('preordenesContainer');
        const mensajeDefault = mensaje || 'No tienes preórdenes aún';
        const descripcion = mensaje || 'Crea tu primera preorden para reservar productos especiales';

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⏳</div>
                <h3>${mensajeDefault}</h3>
                <p>${descripcion}</p>
            </div>
        `;

        gsap.fromTo(container.querySelector('.empty-state'),
            {opacity: 0, y: 30, scale: 0.9},
            {opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)"}
        );
    }

    actualizarEstadisticas() {
        const total = this.preordenes.length;
        const pendientes = this.preordenes.filter(p => p.estado === 'PENDIENTE').length;
        const confirmadas = this.preordenes.filter(p => p.estado === 'CONFIRMADA').length;
        const montoTotal = this.preordenes.reduce((sum, p) => sum + (p.preciopreorden * p.cantidad), 0);

        this.animarContador('totalPreordenes', 0, total);
        this.animarContador('preordenesPendientes', 0, pendientes);
        this.animarContador('preordenesConfirmadas', 0, confirmadas);
        this.animarContador('montoTotal', 0, montoTotal, '$');
    }

    animarContador(elementId, from, to, prefix = '', decimals = 0) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const obj = {value: from};
        gsap.to(obj, {
            value: to,
            duration: 3,
            ease: "power2.out",
            onUpdate: () => {
                const value = decimals > 0 ? obj.value.toFixed(decimals) : Math.round(obj.value);
                element.textContent = `${prefix}${Number(value).toLocaleString('es-ES', {minimumFractionDigits: decimals})}`;
            }
        });
    }

    setupEventListeners() {
        // Botón nueva preorden
        const btnNuevaPreorden = document.getElementById('btnNuevaPreorden');
        if (btnNuevaPreorden) {
            btnNuevaPreorden.addEventListener('click', () => {
                this.abrirModalNuevaPreorden();
            });
        }

        // Filtros
        const filtroEstado = document.getElementById('filtroEstado');
        if (filtroEstado) {
            filtroEstado.addEventListener('change', (e) => {
                this.filtros.estado = e.target.value;
                this.mostrarPreordenes();
            });
        }

        const filtroFecha = document.getElementById('filtroFecha');
        if (filtroFecha) {
            filtroFecha.addEventListener('change', (e) => {
                this.filtros.fecha = e.target.value;
                this.mostrarPreordenes();
            });
        }

        // Reset filtros
        const btnResetFiltros = document.getElementById('btnResetFiltros');
        if (btnResetFiltros) {
            btnResetFiltros.addEventListener('click', () => {
                this.resetearFiltros();
            });
        }

        // View controls
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const container = document.getElementById('preordenesContainer');
                const view = btn.dataset.view;
                this.currentView = view;
                container.className = `preordenes-container ${view}-view`;

                // Reanimar las cards con el nuevo layout
                this.reanimarCards();
            });
        });
    }

    reanimarCards() {
        const cards = document.querySelectorAll('.preorden-card');
        cards.forEach((card, index) => {
            gsap.fromTo(card,
                {opacity: 0.7, scale: 0.95, y: 20},
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: "power2.out"
                }
            );
        });
    }

    abrirModalNuevaPreorden() {
        this.mostrarToast('Función de crear preorden en desarrollo', 'info');
    }

    resetearFiltros() {
        this.filtros = { estado: '', fecha: '' };
        document.getElementById('filtroEstado').value = '';
        document.getElementById('filtroFecha').value = '';
        this.mostrarPreordenes();
        this.mostrarToast('Filtros limpiados', 'info');
    }

    getEstadoTexto(estado) {
        const estados = {
            'PENDIENTE': 'Pendiente',
            'CONFIRMADA': 'Confirmada',
            'PRODUCCION': 'En Producción',
            'LISTA': 'Lista',
            'ENTREGADA': 'Entregada',
            'CANCELADA': 'Cancelada'
        };
        return estados[estado] || estado;
    }

    async verDetallePreorden(preordenId) {
        try {
            console.log('🔍 Cargando detalle de preorden:', preordenId);

            // ✅ BUSCAR DIRECTAMENTE EN EL ARRAY LOCAL PRIMERO
            const preordenLocal = this.preordenes.find(p => p.id === preordenId);

            if (preordenLocal) {
                console.log('✅ Preorden encontrada localmente:', preordenLocal);

                if (this.tipoUsuario === 'VENDEDOR') {
                    this.mostrarDetalleVendedor(preordenLocal);
                } else {
                    this.mostrarDetalleComprador(preordenLocal);
                }
                return;
            }

            // Si no está local, buscar en API
            const response = await fetch(`${this.apiBaseURL}/preordenes/${preordenId}`);

            if (response.ok) {
                const detalle = await response.json();
                console.log('✅ Detalle desde API:', detalle);

                if (this.tipoUsuario === 'VENDEDOR') {
                    this.mostrarDetalleVendedor(detalle);
                } else {
                    this.mostrarDetalleComprador(detalle);
                }
            } else {
                throw new Error('Error al cargar detalle de preorden');
            }
        } catch (error) {
            console.error('❌ Error cargando detalle:', error);
            this.mostrarToast('Error al cargar detalle de preorden', 'error');
        }
    }

    // ==================== POPUP DETALLE PARA COMPRADORES ====================

    mostrarDetalleComprador(preorden) {
        // ✅ CORREGIR: preorden viene directamente, no como {pedido, items}
        console.log('📋 Mostrando detalle para comprador:', preorden);

        const modal = document.createElement('div');
        modal.id = 'modal-detalle-comprador';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
        <div class="modal-content detalle-comprador-modal">
            <div class="modal-header">
                <h3>
                    <span class="modal-icon">📋</span>
                    Detalle Preorden #${preorden.id}
                </h3>
                <button class="modal-close" onclick="preordenManager.cerrarDetalleModal()">×</button>
            </div>

            <div class="modal-body">
                <div class="preorden-status-card">
                    <div class="status-badge estado-${preorden.estado.toLowerCase()}">
                        ${this.getEstadoTexto(preorden.estado)}
                    </div>
                    <div class="status-info">
                        <p><strong>Fecha de Pedido:</strong> ${new Date(preorden.fechapreorden).toLocaleDateString('es-ES')}</p>
                        <p><strong>Entrega Estimada:</strong> ${preorden.fechaestimadaentrega ? new Date(preorden.fechaestimadaentrega).toLocaleDateString('es-ES') : 'Por definir'}</p>
                    </div>
                </div>

                <div class="producto-detalle-card">
                    <div class="producto-imagen-detalle">
                        ${this.obtenerImagenProducto(preorden.producto)}
                    </div>
                    <div class="producto-info-detalle">
                        <h4>${preorden.producto?.nombre || 'Producto no disponible'}</h4>
                        <p class="categoria-detalle">${preorden.producto?.categoria?.nombre || 'Sin categoría'}</p>
                        <div class="precio-detalle">
                            <span class="precio-unitario">$${Number(preorden.preciopreorden).toLocaleString('es-ES')} c/u</span>
                            <span class="cantidad-detalle">Cantidad: ${preorden.cantidad}</span>
                        </div>
                    </div>
                </div>

                ${preorden.notas ? `
                    <div class="notas-detalle-card">
                        <h5>📝 Mis Especificaciones</h5>
                        <p>${preorden.notas}</p>
                    </div>
                ` : ''}

                <div class="resumen-pago-card">
                    <div class="resumen-item">
                        <span>Subtotal:</span>
                        <span>$${(preorden.preciopreorden * preorden.cantidad).toLocaleString('es-ES')}</span>
                    </div>
                    <div class="resumen-total">
                        <span>Total:</span>
                        <span>$${(preorden.preciopreorden * preorden.cantidad).toLocaleString('es-ES')}</span>
                    </div>
                </div>

                <div class="timeline-estado">
                    <h5>📈 Progreso de tu Preorden</h5>
                    <div class="timeline">
                        <div class="timeline-item ${this.isEstadoCompleto('PENDIENTE', preorden.estado) ? 'completado' : ''} ${preorden.estado === 'PENDIENTE' ? 'actual' : ''}">
                            <div class="timeline-dot">⏳</div>
                            <span>Pendiente</span>
                        </div>
                        <div class="timeline-item ${this.isEstadoCompleto('CONFIRMADA', preorden.estado) ? 'completado' : ''} ${preorden.estado === 'CONFIRMADA' ? 'actual' : ''}">
                            <div class="timeline-dot">✅</div>
                            <span>Confirmada</span>
                        </div>
                        <div class="timeline-item ${this.isEstadoCompleto('PRODUCCION', preorden.estado) ? 'completado' : ''} ${preorden.estado === 'PRODUCCION' ? 'actual' : ''}">
                            <div class="timeline-dot">🔧</div>
                            <span>En Producción</span>
                        </div>
                        <div class="timeline-item ${this.isEstadoCompleto('LISTA', preorden.estado) ? 'completado' : ''} ${preorden.estado === 'LISTA' ? 'actual' : ''}">
                            <div class="timeline-dot">📦</div>
                            <span>Lista</span>
                        </div>
                        <div class="timeline-item ${this.isEstadoCompleto('ENTREGADA', preorden.estado) ? 'completado' : ''} ${preorden.estado === 'ENTREGADA' ? 'actual' : ''}">
                            <div class="timeline-dot">🎉</div>
                            <span>Entregada</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                ${preorden.estado === 'PENDIENTE' ? `
                    <button class="modal-btn danger" onclick="preordenManager.cancelarPreorden(${preorden.id})">
                        <span class="btn-icon">❌</span>
                        Cancelar Preorden
                    </button>
                ` : ''}
                <button class="modal-btn secondary" onclick="preordenManager.contactarVendedor(${preorden.producto?.vendedor?.id || 'N/A'})">
                    <span class="btn-icon">💬</span>
                    Contactar Vendedor
                </button>
                <button class="modal-btn tertiary" onclick="preordenManager.cerrarDetalleModal()">
                    Cerrar
                </button>
            </div>
        </div>
    `;

        document.body.appendChild(modal);
        this.animarModalEntrada(modal);
    }

// ==================== POPUP DETALLE PARA VENDEDORES ====================

    mostrarDetalleVendedor(detalle) {
        const { pedido, items } = detalle;
        const preorden = pedido; // El pedido es la preorden

        const modal = document.createElement('div');
        modal.id = 'modal-detalle-vendedor';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
        <div class="modal-content detalle-vendedor-modal">
            <div class="modal-header">
                <h3>
                    <span class="modal-icon">🏪</span>
                    Gestionar Preorden #${preorden.id}
                </h3>
                <button class="modal-close" onclick="preordenManager.cerrarDetalleModal()">×</button>
            </div>

            <div class="modal-body">
                <div class="cliente-info-card">
                    <h4>👤 Información del Cliente</h4>
                    <div class="cliente-datos">
                        <p><strong>Nombre:</strong> ${preorden.usuario?.nombre || 'Usuario'}</p>
                        <p><strong>Email:</strong> ${preorden.usuario?.email || 'No disponible'}</p>
                        <p><strong>Fecha del Pedido:</strong> ${new Date(preorden.fechapreorden).toLocaleDateString('es-ES')}</p>
                    </div>
                </div>

                <div class="producto-detalle-card">
                    <div class="producto-imagen-detalle">
                        ${this.obtenerImagenProducto(preorden.producto)}
                    </div>
                    <div class="producto-info-detalle">
                        <h4>${preorden.producto?.nombre || 'Producto no disponible'}</h4>
                        <div class="precio-detalle">
                            <span class="precio-unitario">$${Number(preorden.preciopreorden).toLocaleString('es-ES')} c/u</span>
                            <span class="cantidad-detalle">Cantidad: ${preorden.cantidad}</span>
                            <span class="total-detalle">Total: $${(preorden.preciopreorden * preorden.cantidad).toLocaleString('es-ES')}</span>
                        </div>
                    </div>
                </div>

                ${preorden.notas ? `
                    <div class="notas-detalle-card">
                        <h5>📝 Especificaciones del Cliente</h5>
                        <p>${preorden.notas}</p>
                    </div>
                ` : ''}

                <div class="estado-gestion-card">
                    <h5>🔄 Gestión de Estado</h5>
                    <div class="estado-actual">
                        <span>Estado Actual:</span>
                        <span class="estado-badge estado-${preorden.estado.toLowerCase()}">
                            ${this.getEstadoTexto(preorden.estado)}
                        </span>
                    </div>
                    
                    <div class="cambiar-estado">
                        <label for="nuevo-estado">Cambiar a:</label>
                        <select id="nuevo-estado" class="estado-select">
                            <option value="">Seleccionar nuevo estado</option>
                            <option value="PENDIENTE" ${preorden.estado === 'PENDIENTE' ? 'disabled' : ''}>⏳ Pendiente</option>
                            <option value="CONFIRMADA" ${preorden.estado === 'CONFIRMADA' ? 'disabled' : ''}>✅ Confirmada</option>
                            <option value="PRODUCCION" ${preorden.estado === 'PRODUCCION' ? 'disabled' : ''}>🔧 En Producción</option>
                            <option value="LISTA" ${preorden.estado === 'LISTA' ? 'disabled' : ''}>📦 Lista para Entrega</option>
                            <option value="ENTREGADA" ${preorden.estado === 'ENTREGADA' ? 'disabled' : ''}>🎉 Entregada</option>
                            <option value="CANCELADA" ${preorden.estado === 'CANCELADA' ? 'disabled' : ''}>❌ Cancelada</option>
                        </select>
                        <button class="btn-cambiar-estado" onclick="preordenManager.actualizarEstadoDesdeModal(${preorden.id})">
                            Actualizar Estado
                        </button>
                    </div>

                    <div class="fecha-entrega">
                        <label for="fecha-entrega-estimada">Fecha de Entrega Estimada:</label>
                        <input type="date" id="fecha-entrega-estimada" value="${preorden.fechaestimadaentrega ? preorden.fechaestimadaentrega.split('T')[0] : ''}">
                        <button class="btn-actualizar-fecha" onclick="preordenManager.actualizarFechaEntrega(${preorden.id})">
                            Actualizar Fecha
                        </button>
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                <button class="modal-btn primary" onclick="preordenManager.actualizarEstadoDesdeModal(${preorden.id})">
                    <span class="btn-icon">🔄</span>
                    Actualizar Estado
                </button>
                <button class="modal-btn secondary" onclick="preordenManager.contactarCliente('${preorden.usuario?.email || ''}')">
                    <span class="btn-icon">📧</span>
                    Contactar Cliente
                </button>
                <button class="modal-btn tertiary" onclick="preordenManager.cerrarDetalleModal()">
                    Cerrar
                </button>
            </div>
        </div>
    `;

        document.body.appendChild(modal);
        this.animarModalEntrada(modal);
    }

// ==================== MÉTODOS DE SOPORTE ====================

    isEstadoCompleto(estadoCheck, estadoActual) {
        const orden = ['PENDIENTE', 'CONFIRMADA', 'PRODUCCION', 'LISTA', 'ENTREGADA'];
        const indexCheck = orden.indexOf(estadoCheck);
        const indexActual = orden.indexOf(estadoActual);

        return indexActual >= indexCheck;
    }

    async actualizarEstadoDesdeModal(preordenId) {
        const nuevoEstado = document.getElementById('nuevo-estado').value;

        if (!nuevoEstado) {
            this.mostrarToast('Por favor selecciona un estado', 'warning');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseURL}/preordenes/${preordenId}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (response.ok) {
                this.mostrarToast(`Estado actualizado a: ${this.getEstadoTexto(nuevoEstado)}`, 'success');
                this.cerrarDetalleModal();

                // Recargar preórdenes según el tipo de usuario
                if (this.tipoUsuario === 'VENDEDOR') {
                    await this.cargarPreordenesVendedor();
                } else {
                    await this.cargarPreordenesComprador();
                }
            } else {
                throw new Error('Error al actualizar estado');
            }
        } catch (error) {
            console.error('Error actualizando estado:', error);
            this.mostrarToast('Error al actualizar estado', 'error');
        }
    }

    async actualizarFechaEntrega(preordenId) {
        const nuevaFecha = document.getElementById('fecha-entrega-estimada').value;

        if (!nuevaFecha) {
            this.mostrarToast('Por favor selecciona una fecha', 'warning');
            return;
        }

        this.mostrarToast('Función de actualizar fecha en desarrollo', 'info');
    }

    contactarCliente(email) {
        if (email) {
            window.location.href = `mailto:${email}?subject=Consulta sobre tu preorden`;
        } else {
            this.mostrarToast('Email del cliente no disponible', 'warning');
        }
    }

    animarModalEntrada(modal) {
        // Mostrar overlay
        gsap.set(modal, { opacity: 0 });
        gsap.to(modal, { opacity: 1, duration: 0.3, ease: "power2.out" });

        // Animar entrada del modal
        const modalContent = modal.querySelector('.modal-content');
        gsap.fromTo(modalContent,
            {
                opacity: 0,
                scale: 0.7,
                y: -50
            },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.5,
                ease: "back.out(1.7)",
                delay: 0.1
            }
        );

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';

        // Cerrar con ESC
        this.modalKeyHandler = (e) => {
            if (e.key === 'Escape') {
                this.cerrarDetalleModal();
            }
        };
        document.addEventListener('keydown', this.modalKeyHandler);

        // Cerrar al hacer click fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.cerrarDetalleModal();
            }
        });
    }

    cerrarDetalleModal() {
        const modals = document.querySelectorAll('#modal-detalle-comprador, #modal-detalle-vendedor');

        modals.forEach(modal => {
            if (modal) {
                const modalContent = modal.querySelector('.modal-content');

                // Animar salida
                gsap.to(modalContent, {
                    opacity: 0,
                    scale: 0.7,
                    y: -50,
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
        });
    }

    mostrarToast(mensaje, tipo = 'info') {
        const container = document.getElementById('toastContainer');

        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.textContent = mensaje;

        container.appendChild(toast);

        // Animar entrada con efecto líquido mejorado
        gsap.fromTo(toast,
            {x: 400, opacity: 0, scale: 0.8, rotationY: 90},
            {
                x: 0,
                opacity: 1,
                scale: 1,
                rotationY: 0,
                duration: 0.6,
                ease: "back.out(1.7)"
            }
        );

        setTimeout(() => {
            gsap.to(toast, {
                x: 400,
                opacity: 0,
                scale: 0.8,
                rotationY: -90,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    if (container.contains(toast)) {
                        container.removeChild(toast);
                    }
                }
            });
        }, 4000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.preordenManager = new PreordenManager();
});
