/**
 * EventosManager - Sistema de Gestión de Eventos Premium
 * Versión simplificada y optimizada para funcionar con el backend actual
 */

class EventosManager {
    constructor() {
        this.eventos = [];
        this.filteredEventos = [];
        this.currentFilter = 'upcoming';
        this.currentSort = 'date';
        this.currentView = 'cards';
        this.isLoading = false;
        this.editingEvent = null;
        this.tipoUsuario = 'COMPRADOR'; // Se determinará dinámicamente

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

        this.config = {
            apiUrl: '/api/eventos',
            apiBaseURL: 'http://localhost:8080/api',
            itemsPerPage: 12,
            autoRefresh: 30000, // 30 segundos
            maxRetries: 3
        };

        // Inicialización ÚNICA
        this.init();
    }

    // ==================== INICIALIZACIÓN ====================

    async init() {
        // Evitar inicialización múltiple
        if (this.initialized) {
            console.log('⚠️ EventosManager ya inicializado, saltando...');
            return;
        }

        console.log('🎪 Inicializando EventosManager...');

        try {
            // Inicializar flags
            this.initialized = false;
            this.listenersConfigured = false;
            this.permisosAplicados = false;
            this.userTypeDetected = false;
            this.actionButtonsConfigured = false;

            // Configurar elementos básicos
            this.setupEventListeners();
            this.setupTimeDisplay();
            this.detectUserType();

            // Cargar eventos iniciales
            await this.cargarEventos();

            // Configurar botones específicos DESPUÉS de cargar
            setTimeout(() => {
                this.setupActionButtons();
            }, 300);

            // Configurar auto-refresh
            this.setupAutoRefresh();

            // Marcar como inicializado
            this.initialized = true;
            console.log('✅ EventosManager inicializado correctamente');

            // Verificar que no hay modals abiertos y forzar cierre
            setTimeout(() => {
                this.forzarCierreModals();
            }, 100);

            setTimeout(() => {
                this.forzarCierreModals();
            }, 500);

        } catch (error) {
            console.error('❌ Error inicializando EventosManager:', error);
            this.mostrarError('Error al cargar los eventos');
        }
    }

    setupEventListeners() {
        // Evitar configurar múltiples veces
        if (this.listenersConfigured) {
            console.log('⚠️ Event listeners ya configurados, saltando...');
            return;
        }

        // Filtros temporales con debounce
        document.querySelectorAll('.time-filter-btn').forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Debounce para evitar múltiples ejecuciones
                if (this.filterTimeout) {
                    clearTimeout(this.filterTimeout);
                }

                this.filterTimeout = setTimeout(() => {
                    try {
                        const filter = e.target.dataset.filter;
                        if (filter && filter !== this.currentFilter) {
                            this.changeFilter(filter);
                        }
                    } catch (error) {
                        console.error('Error en filtro temporal:', error);
                    }
                }, 100);
            });
        });

        // Ordenamiento
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.changeSorting(e.target.value);
            });
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
                    this.buscarEventos(e.target.value);
                }, 300);
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
                        this.changeView(view);
                    }
                } catch (error) {
                    console.error('Error en cambio de vista:', error);
                }
            });
        });
        // Modal handlers
        this.setupModalHandlers();

        // Configurar delegación de eventos dinámicos
        this.setupDelegatedEventListeners();

        // Marcar como configurado
        this.listenersConfigured = true;
        console.log('🔧 Event listeners configurados correctamente');
    }

    setupModalHandlers() {
        // Modal detalle
        const closeDetalle = document.getElementById('closeEventoDetalle');
        if (closeDetalle) {
            closeDetalle.addEventListener('click', () => {
                this.cerrarModal('eventoDetalleModal');
            });
        }

        // Modal editor
        const closeEditor = document.getElementById('closeEventoEditor');
        if (closeEditor) {
            closeEditor.addEventListener('click', () => {
                this.cerrarModal('eventoEditorModal');
            });
        }

        const cancelEditor = document.getElementById('cancelEditor');
        if (cancelEditor) {
            cancelEditor.addEventListener('click', () => {
                this.cerrarModal('eventoEditorModal');
            });
        }

        // Form submit
        const editorForm = document.getElementById('eventoEditorForm');
        if (editorForm) {
            editorForm.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
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
            if (e.target.classList.contains('modal-evento-detalle') ||
                e.target.classList.contains('modal-evento-editor')) {
                this.cerrarModal(e.target.id);
            }
        });
    }

    setupTimeDisplay() {
        const currentTimeDisplay = document.getElementById('currentTime');
        if (currentTimeDisplay) {
            const updateTime = () => {
                const now = new Date();
                const timeString = now.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                currentTimeDisplay.textContent = timeString;
            };

            updateTime();
            setInterval(updateTime, 1000);
        }
    }

    detectUserType() {
        // Evitar ejecutar múltiples veces
        if (this.userTypeDetected) {
            console.log('⚠️ Tipo de usuario ya detectado, saltando...');
            return;
        }

        // Verificar autenticación PRIMERO (igual que categorias.js)
        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');

        if (userSession) {
            try {
                this.userData = JSON.parse(userSession);
                console.log('👤 Usuario autenticado:', this.userData);

                if (this.userData && this.userData.user) {
                    // Detectar tipo de usuario (IGUAL que categorias.js)
                    this.tipoUsuario = (
                        this.userData.user?.tipoUsuario ||
                        this.userData.user?.tipousuario ||
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

    setupAutoRefresh() {
        if (this.config.autoRefresh > 0) {
            setInterval(() => {
                if (!this.isLoading) {
                    this.cargarEventos(true);
                }
            }, this.config.autoRefresh);
        }
    }

    // ==================== CARGA DE DATOS ====================

    async cargarEventos(silent = false) {
        if (!silent) {
            this.mostrarLoading(true);
        }

        try {
            // Preparar headers de autenticación
            const headers = {
                'Content-Type': 'application/json'
            };

            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(this.config.apiUrl, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const eventos = await response.json();

            // Procesar eventos
            this.eventos = eventos.map(evento => this.procesarEvento(evento));

            // Aplicar filtros y mostrar
            this.aplicarFiltros();
            this.mostrarEventos();
            this.actualizarContadores();
            this.actualizarProximoEvento();

            // Actualizar stats para vendedores
            if (this.tipoUsuario === 'VENDEDOR') {
                this.actualizarStatsVendedor();
            }

            if (!silent) {
                this.mostrarLoading(false);
            }

            console.log(`📅 ${this.eventos.length} eventos cargados`);

            // Actualizar componentes UI después de cargar
            this.actualizarComponentesUI();

        } catch (error) {
            console.error('❌ Error cargando eventos:', error);
            this.mostrarError('Error al cargar los eventos');
            this.mostrarLoading(false);
            this.mostrarEstadoVacio();
        }
    }

    procesarEvento(evento) {
        // Procesar fechas
        const fechaInicio = new Date(evento.fechainicio);
        const fechaFin = evento.fechafin ? new Date(evento.fechafin) : null;
        const ahora = new Date();

        // Determinar estado temporal
        let estadoTemporal = 'upcoming';
        if (fechaInicio <= ahora) {
            if (fechaFin && fechaFin >= ahora) {
                estadoTemporal = 'live';
            } else if (!fechaFin) {
                estadoTemporal = 'live'; // Asumimos que está en vivo si no hay fecha fin
            } else {
                estadoTemporal = 'past';
            }
        }

        // Determinar si es hoy
        const esHoy = fechaInicio.toDateString() === ahora.toDateString();

        // Determinar si es esta semana
        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - ahora.getDay());
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        const esSemana = fechaInicio >= inicioSemana && fechaInicio <= finSemana;

        return {
            ...evento,
            fechaInicioObj: fechaInicio,
            fechaFinObj: fechaFin,
            estadoTemporal,
            esHoy,
            esSemana,
            organizador: evento.usuario ? evento.usuario.nombre : 'Organizador'
        };
    }

    // ==================== FILTROS Y BÚSQUEDA ====================

    changeFilter(filter) {
        this.currentFilter = filter;

        // Actualizar UI de filtros con verificación de null
        document.querySelectorAll('.time-filter-btn').forEach(btn => {
            if (btn && btn.classList) {
                btn.classList.remove('active');
            }
        });

        const targetBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (targetBtn && targetBtn.classList) {
            targetBtn.classList.add('active');
        }

        // Aplicar filtros
        this.aplicarFiltros();
        this.mostrarEventos();
        this.actualizarTitulo();

        console.log('🔍 Filtro cambiado a:', filter);
    }

    changeSorting(sort) {
        this.currentSort = sort;
        this.aplicarFiltros();
        this.mostrarEventos();
        console.log('📊 Ordenamiento cambiado a:', sort);
    }

    changeView(view) {
        this.currentView = view;

        // Actualizar UI de vista con verificación de null
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            if (btn && btn.classList) {
                btn.classList.remove('active');
            }
        });

        const targetViewBtn = document.querySelector(`[data-view="${view}"]`);
        if (targetViewBtn && targetViewBtn.classList) {
            targetViewBtn.classList.add('active');
        }

        // Mostrar vista correspondiente
        const cardsView = document.getElementById('eventosCardsView');
        const listView = document.getElementById('eventosListView');

        if (cardsView && listView) {
            if (view === 'cards') {
                cardsView.style.display = 'grid';
                listView.style.display = 'none';
                if (cardsView.classList) cardsView.classList.add('active');
                if (listView.classList) listView.classList.remove('active');
            } else if (view === 'list') {
                cardsView.style.display = 'none';
                listView.style.display = 'block';
                if (listView.classList) listView.classList.add('active');
                if (cardsView.classList) cardsView.classList.remove('active');
            }
        }

        this.mostrarEventos();
        console.log('👁️ Vista cambiada a:', view);
    }

    aplicarFiltros() {
        let eventos = [...this.eventos];

        // Filtrar por estado temporal
        switch (this.currentFilter) {
            case 'upcoming':
                eventos = eventos.filter(e => e.estadoTemporal === 'upcoming');
                break;
            case 'live':
                eventos = eventos.filter(e => e.estadoTemporal === 'live');
                break;
            case 'today':
                eventos = eventos.filter(e => e.esHoy);
                break;
            case 'week':
                eventos = eventos.filter(e => e.esSemana && e.estadoTemporal !== 'past');
                break;
            case 'past':
                eventos = eventos.filter(e => e.estadoTemporal === 'past');
                break;
        }

        // Filtrar por usuario si es vendedor (CORREGIDO para usar userData)
        if (this.tipoUsuario === 'VENDEDOR' && this.userData && this.userData.user) {
            const usuarioId = this.userData.user.id;
            if (usuarioId) {
                eventos = eventos.filter(e => e.usuario && e.usuario.id === usuarioId);
                console.log(`🔍 Filtrando eventos del vendedor ID: ${usuarioId}`);
            }
        }

        // Ordenar
        switch (this.currentSort) {
            case 'date':
                eventos.sort((a, b) => a.fechaInicioObj - b.fechaInicioObj);
                break;
            case 'title':
                eventos.sort((a, b) => a.titulo.localeCompare(b.titulo));
                break;
            case 'recent':
                eventos.sort((a, b) => new Date(b.fechacreacion) - new Date(a.fechacreacion));
                break;
        }

        this.filteredEventos = eventos;
    }

    buscarEventos(query) {
        if (!query.trim()) {
            this.aplicarFiltros();
            this.mostrarEventos();
            return;
        }

        const searchTerm = query.toLowerCase();

        // Aplicar filtros primero, luego buscar
        this.aplicarFiltros();

        this.filteredEventos = this.filteredEventos.filter(evento =>
            evento.titulo.toLowerCase().includes(searchTerm) ||
            (evento.descripcion && evento.descripcion.toLowerCase().includes(searchTerm)) ||
            (evento.ubicacion && evento.ubicacion.toLowerCase().includes(searchTerm)) ||
            (evento.organizador && evento.organizador.toLowerCase().includes(searchTerm))
        );

        this.mostrarEventos();
        console.log(`🔍 Búsqueda: "${query}" - ${this.filteredEventos.length} resultados en ${this.eventos.length} eventos totales`);
    }

    // ==================== RENDERIZADO ====================

    mostrarEventos() {
        if (this.filteredEventos.length === 0) {
            this.mostrarEstadoVacio();
            return;
        }

        const container = this.currentView === 'cards'
            ? document.getElementById('eventosCardsView')
            : document.getElementById('eventosListView');

        if (!container) return;

        // Ocultar estado vacío
        const emptyState = document.getElementById('emptyStateEventos');
        if (emptyState) emptyState.style.display = 'none';

        // Renderizar eventos
        container.innerHTML = this.filteredEventos.map(evento =>
            this.currentView === 'cards'
                ? this.renderEventoCard(evento)
                : this.renderEventoListItem(evento)
        ).join('');

        // Animar entrada con GSAP
        gsap.fromTo(container.children,
            {
                opacity: 0,
                y: 30,
                scale: 0.9
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.7)"
                // NO ejecutar configurarBotonesAccionDinamicos aquí
            }
        );

        console.log(`📋 Mostrando ${this.filteredEventos.length} eventos en vista ${this.currentView}`);
    }

    renderEventoCard(evento) {
        const fechaFormateada = this.formatearFecha(evento.fechaInicioObj);
        const horaFormateada = this.formatearHora(evento.fechaInicioObj);

        return `
            <div class="evento-card" onclick="eventosManager.verDetalleEvento('${evento.id}')" data-evento-id="${evento.id}">
                <div class="evento-image">
                    ${evento.imagen
            ? `<img src="${evento.imagen}" alt="${evento.titulo}" loading="lazy">`
            : `<div class="evento-image-placeholder">🎪</div>`
        }
                </div>
                
                <div class="evento-content">
                    <div class="evento-meta">
                        <div class="evento-datetime">
                            <span>📅</span>
                            <span>${fechaFormateada} ${horaFormateada}</span>
                        </div>
                        ${evento.ubicacion ? `
                            <div class="evento-location">
                                <span>📍</span>
                                <span>${this.truncateText(evento.ubicacion, 30)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <h3 class="evento-title">${evento.titulo}</h3>
                    
                    ${evento.descripcion ? `
                        <p class="evento-description">${this.truncateText(evento.descripcion, 150)}</p>
                    ` : ''}
                    
                    <div class="evento-footer">
                        <div class="evento-organizer">
                            <span>👤</span>
                            <span>${evento.organizador}</span>
                        </div>
                        
                        <div class="evento-actions">
                            ${this.tipoUsuario === 'VENDEDOR' && this.puedeEditarEvento(evento) ? `
                                <button class="action-btn-evento edit-btn" onclick="event.stopPropagation(); eventosManager.editarEvento('${evento.id}')" title="Editar evento">
                                    <span class="btn-icon">✏️</span>
                                    <span class="btn-text">Editar</span>
                                </button>
                                <button class="action-btn-evento delete-btn" onclick="event.stopPropagation(); eventosManager.eliminarEvento('${evento.id}')" title="Eliminar evento">
                                    <span class="btn-icon">🗑️</span>
                                    <span class="btn-text">Eliminar</span>
                                </button>
                            ` : this.tipoUsuario === 'COMPRADOR' ? `
                                <button class="action-btn-evento share-btn" onclick="event.stopPropagation(); eventosManager.compartirEvento('${evento.id}')" title="Compartir evento">
                                    <span class="btn-icon">📤</span>
                                    <span class="btn-text">Compartir</span>
                                </button>
                            ` : ''}
                                <button class="action-btn-evento primary" onclick="event.stopPropagation(); eventosManager.verDetalleEvento('${evento.id}')">
                                Ver Detalles
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEventoListItem(evento) {
        const fechaFormateada = this.formatearFecha(evento.fechaInicioObj);
        const horaFormateada = this.formatearHora(evento.fechaInicioObj);

        return `
        <div class="evento-list-item" onclick="eventosManager.verDetalleEvento('${evento.id}')" data-evento-id="${evento.id}">
            <div class="evento-list-main">
                <div class="evento-list-image">
                    ${evento.imagen
            ? `<img src="${evento.imagen}" alt="${evento.titulo}" loading="lazy">`
            : `<div class="evento-image-placeholder">🎪</div>`
        }
                </div>
                
                <div class="evento-list-content">
                    <div class="evento-list-header">
                        <h3 class="evento-title">${evento.titulo}</h3>
                        <div class="evento-datetime">
                            <span>📅 ${fechaFormateada} ${horaFormateada}</span>
                        </div>
                    </div>
                    
                    <div class="evento-list-body">
                        ${evento.descripcion ? `
                            <p class="evento-description">${this.truncateText(evento.descripcion, 200)}</p>
                        ` : ''}
                        
                        <div class="evento-meta">
                            ${evento.ubicacion ? `
                                <span class="evento-location">📍 ${evento.ubicacion}</span>
                            ` : ''}
                            <span class="evento-organizer">👤 ${evento.organizador}</span>
                        </div>
                    </div>
                </div>
                
                <div class="evento-list-actions">
                    ${this.tipoUsuario === 'VENDEDOR' && this.puedeEditarEvento(evento) ? `
                        <button class="action-btn-evento secondary" onclick="event.stopPropagation(); eventosManager.editarEvento('${evento.id}')">
                            <span>✏️</span>
                            Editar
                        </button>
                        <button class="action-btn-evento danger" onclick="event.stopPropagation(); eventosManager.eliminarEvento('${evento.id}')">
                            <span>🗑️</span>
                            Eliminar
                        </button>
                    ` : ''}
                    <button class="action-btn-evento primary" onclick="event.stopPropagation(); eventosManager.verDetalleEvento('${evento.id}')">
                        <span>👁️</span>
                        Ver Detalles
                    </button>
                </div>
            </div>
        </div>
    `;
    }

    mostrarEstadoVacio() {
        const container = this.currentView === 'cards'
            ? document.getElementById('eventosCardsView')
            : document.getElementById('eventosListView');

        const emptyState = document.getElementById('emptyStateEventos');

        if (container) container.innerHTML = '';
        if (emptyState) {
            emptyState.style.display = 'block';

            // Actualizar mensaje según filtro
            const message = this.getEmptyStateMessage();
            const messageElement = document.getElementById('emptyStateMessage');
            if (messageElement) messageElement.textContent = message;
        }
    }

    getEmptyStateMessage() {
        switch (this.currentFilter) {
            case 'upcoming': return 'No hay eventos próximos';
            case 'live': return 'No hay eventos en vivo actualmente';
            case 'today': return 'No hay eventos programados para hoy';
            case 'week': return 'No hay eventos esta semana';
            case 'past': return 'No hay eventos pasados';
            default: return 'No se encontraron eventos';
        }
    }

    // ==================== ACCIONES DE EVENTOS ====================

    async verDetalleEvento(eventoId) {
        const evento = this.eventos.find(e => e.id.toString() === eventoId.toString());
        if (!evento) {
            this.mostrarError('Evento no encontrado');
            return;
        }

        console.log(`👁️ Mostrando detalle del evento para ${this.tipoUsuario}:`, evento.titulo);

        // Generar contenido del modal
        const content = this.generarDetalleEventoHTML(evento);

        // Mostrar modal
        const modal = document.getElementById('eventoDetalleModal');
        const contentContainer = document.getElementById('eventoDetalleContent');

        if (modal && contentContainer) {
            // Forzar visibilidad del modal antes de llenar contenido
            modal.style.display = 'flex';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            modal.style.zIndex = '9999';
            modal.classList.add('show');

            contentContainer.innerHTML = content;

            // Abrir modal con delay para asegurar que el contenido esté listo
            setTimeout(() => {
                this.abrirModal('eventoDetalleModal');
            }, 50);
        } else {
            console.error('❌ Modal o contenedor no encontrado');
        }
    }

    generarDetalleEventoHTML(evento) {
        const fechaFormateada = this.formatearFecha(evento.fechaInicioObj, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const horaFormateada = this.formatearHora(evento.fechaInicioObj);

        return `
            <div class="evento-detalle-header">
                ${evento.imagen ? `
                    <div class="evento-detalle-image">
                        <img src="${evento.imagen}" alt="${evento.titulo}">
                    </div>
                ` : ''}
                
                <div class="evento-detalle-info">
                    <h2 class="evento-detalle-title">${evento.titulo}</h2>
                    
                    <div class="evento-detalle-meta">
                        <div class="meta-item">
                            <span class="meta-icon">📅</span>
                            <div class="meta-content">
                                <strong>Fecha y Hora</strong>
                                <span>${fechaFormateada}</span>
                                <span>${horaFormateada}${evento.fechaFinObj ? ` - ${this.formatearHora(evento.fechaFinObj)}` : ''}</span>
                            </div>
                        </div>
                        
                        ${evento.ubicacion ? `
                            <div class="meta-item">
                                <span class="meta-icon">📍</span>
                                <div class="meta-content">
                                    <strong>Ubicación</strong>
                                    <span>${evento.ubicacion}</span>
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="meta-item">
                            <span class="meta-icon">👤</span>
                            <div class="meta-content">
                                <strong>Organizador</strong>
                                <span>${evento.organizador}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${evento.descripcion ? `
                <div class="evento-detalle-description">
                    <h3>Descripción</h3>
                    <p>${evento.descripcion}</p>
                </div>
            ` : ''}
            
            <div class="evento-detalle-actions">
                ${evento.ubicacion ? `
                    <button class="btn-primary-eventos" onclick="eventosManager.abrirUbicacion('${evento.ubicacion}')">
                        <span class="btn-icon">🗺️</span>
                        <span>Ver en Mapa</span>
                    </button>
                ` : ''}
                
                <button class="btn-primary-eventos" onclick="eventosManager.compartirEvento('${evento.id}')">
                    <span class="btn-icon">📤</span>
                    <span>Compartir</span>
                </button>
            </div>
        `;
    }

    abrirCrearEvento() {
        console.log('🆕 Intentando abrir formulario de crear evento...');

        if (this.tipoUsuario !== 'VENDEDOR') {
            this.mostrarAlertaFuncionNoDisponible('Crear eventos está disponible solo para vendedores');
            return;
        }

        // Marcar que se solicitó abrir el modal
        this.modalOpenRequested = true;

        // Resetear estado
        this.editingEvent = null;
        this.resetearFormulario();

        // Configurar modal
        const title = document.getElementById('eventoEditorTitle');
        if (title) title.textContent = '✨ Crear Evento';

        const saveBtn = document.getElementById('saveBtnText');
        if (saveBtn) saveBtn.textContent = 'Crear Evento';

        // Abrir modal con delay para asegurar que está listo
        setTimeout(() => {
            this.abrirModal('eventoEditorModal');
            console.log('➕ Formulario de crear evento abierto');
        }, 100);
    }

    async editarEvento(eventoId) {
        console.log('🔧 Iniciando edición de evento:', eventoId, 'Usuario:', this.tipoUsuario);

        if (this.tipoUsuario !== 'VENDEDOR') {
            this.mostrarAlertaFuncionNoDisponible('Editar eventos está disponible solo para vendedores');
            return;
        }

        const evento = this.eventos.find(e => e.id.toString() === eventoId.toString());
        if (!evento) {
            this.mostrarError('Evento no encontrado');
            return;
        }

        if (!this.puedeEditarEvento(evento)) {
            this.mostrarAlertaFuncionNoDisponible('Solo puedes editar tus propios eventos');
            return;
        }

        // Marcar que se solicitó abrir el modal
        this.modalOpenRequested = true;

        // Cerrar modal de detalle si está abierto
        this.cerrarModal('eventoDetalleModal');

        this.editingEvent = evento;

        // Llenar formulario con delay para asegurar que el modal esté listo
        setTimeout(() => {
            this.llenarFormulario(evento);

            const title = document.getElementById('eventoEditorTitle');
            if (title) title.textContent = '✏️ Editar Evento';

            const saveBtn = document.getElementById('saveBtnText');
            if (saveBtn) saveBtn.textContent = 'Actualizar Evento';

            console.log('📝 Formulario llenado para edición');
        }, 100);

        // Forzar que el modal sea un popup
        const modal = document.getElementById('eventoEditorModal');
        if (modal) {
            // Asegurar que esté en el nivel superior del DOM
            document.body.appendChild(modal);
        }

        this.abrirModal('eventoEditorModal');

        // Debug para verificar estado del modal
        setTimeout(() => {
            this.debugModalEditor();
        }, 200);

        console.log('✏️ Editando evento:', evento.titulo);

        console.log('✏️ Editando evento:', evento.titulo);
    }

    async eliminarEvento(eventoId) {
        const evento = this.eventos.find(e => e.id.toString() === eventoId.toString());
        if (!evento) {
            this.mostrarError('Evento no encontrado');
            return;
        }

        if (!confirm(`¿Estás seguro de que quieres eliminar el evento "${evento.titulo}"?`)) {
            return;
        }

        try {
            this.mostrarLoading(true);

            const response = await fetch(`${this.config.apiUrl}/${eventoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            // Recargar eventos
            await this.cargarEventos();

            this.mostrarToast('Evento eliminado correctamente', 'success');

            console.log('🗑️ Evento eliminado:', evento.titulo);

        } catch (error) {
            console.error('❌ Error eliminando evento:', error);
            this.mostrarError('Error al eliminar el evento');
        } finally {
            this.mostrarLoading(false);
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = this.recopilarDatosFormulario();
        if (!this.validarFormulario(formData)) {
            return;
        }

        try {
            this.mostrarLoadingBoton(true);

            const url = this.editingEvent
                ? `${this.config.apiUrl}/${this.editingEvent.id}`
                : this.config.apiUrl;

            const method = this.editingEvent ? 'PUT' : 'POST';

            // Agregar usuario actual (CORREGIDO)
            if (this.userData && this.userData.user && this.userData.user.id) {
                formData.usuario = { id: this.userData.user.id };
                console.log('👤 Asignando evento al usuario:', this.userData.user.id);
            } else {
                throw new Error('No se pudo identificar el usuario');
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const evento = await response.json();

            // Cerrar modal y recargar
            this.cerrarModal('eventoEditorModal');
            await this.cargarEventos();

            const mensaje = this.editingEvent ? 'Evento actualizado correctamente' : 'Evento creado correctamente';
            this.mostrarToast(mensaje, 'success');

            console.log(`💾 Evento ${this.editingEvent ? 'actualizado' : 'creado'}:`, evento.titulo);

        } catch (error) {
            console.error('❌ Error guardando evento:', error);
            this.mostrarError('Error al guardar el evento');
        } finally {
            this.mostrarLoadingBoton(false);
        }
    }

    // ==================== FORMULARIO ====================

    resetearFormulario() {
        const form = document.getElementById('eventoEditorForm');
        if (form) form.reset();
    }

    llenarFormulario(evento) {
        console.log('📝 Llenando formulario con datos:', evento);

        // Verificar que los elementos existan
        const campos = {
            eventoTitulo: evento.titulo || '',
            eventoDescripcion: evento.descripcion || '',
            eventoUbicacion: evento.ubicacion || '',
            eventoImagen: evento.imagen || ''
        };

        Object.entries(campos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = valor;
                console.log(`✅ Campo ${id} llenado con: ${valor}`);
            } else {
                console.error(`❌ Elemento ${id} no encontrado`);
            }
        });

        // Llenar fechas
        if (evento.fechaInicioObj) {
            const fechaInicioInput = document.getElementById('eventoFechaInicio');
            if (fechaInicioInput) {
                fechaInicioInput.value = this.formatDateTimeLocal(evento.fechaInicioObj);
                console.log('✅ Fecha inicio llenada');
            }
        } else if (evento.fechainicio) {
            const fechaInicioInput = document.getElementById('eventoFechaInicio');
            if (fechaInicioInput) {
                const fecha = new Date(evento.fechainicio);
                fechaInicioInput.value = this.formatDateTimeLocal(fecha);
                console.log('✅ Fecha inicio llenada desde fechainicio');
            }
        }

        if (evento.fechaFinObj) {
            const fechaFinInput = document.getElementById('eventoFechaFin');
            if (fechaFinInput) {
                fechaFinInput.value = this.formatDateTimeLocal(evento.fechaFinObj);
                console.log('✅ Fecha fin llenada');
            }
        } else if (evento.fechafin) {
            const fechaFinInput = document.getElementById('eventoFechaFin');
            if (fechaFinInput) {
                const fecha = new Date(evento.fechafin);
                fechaFinInput.value = this.formatDateTimeLocal(fecha);
                console.log('✅ Fecha fin llenada desde fechafin');
            }
        }
    }

    recopilarDatosFormulario() {
        return {
            titulo: document.getElementById('eventoTitulo').value.trim(),
            descripcion: document.getElementById('eventoDescripcion').value.trim(),
            fechainicio: document.getElementById('eventoFechaInicio').value,
            fechafin: document.getElementById('eventoFechaFin').value || null,
            ubicacion: document.getElementById('eventoUbicacion').value.trim(),
            imagen: document.getElementById('eventoImagen').value.trim(),
            activo: true
        };
    }

    validarFormulario(data) {
        if (!data.titulo) {
            this.mostrarError('El título es obligatorio');
            return false;
        }

        if (!data.descripcion) {
            this.mostrarError('La descripción es obligatoria');
            return false;
        }

        if (!data.fechainicio) {
            this.mostrarError('La fecha de inicio es obligatoria');
            return false;
        }

        // Validar que la fecha de inicio no sea pasada
        const fechaInicio = new Date(data.fechainicio);
        const ahora = new Date();

        if (fechaInicio < ahora && !this.editingEvent) {
            this.mostrarError('La fecha de inicio no puede ser en el pasado');
            return false;
        }

        // Validar fecha fin si está presente
        if (data.fechafin) {
            const fechaFin = new Date(data.fechafin);
            if (fechaFin <= fechaInicio) {
                this.mostrarError('La fecha de fin debe ser posterior a la fecha de inicio');
                return false;
            }
        }

        return true;
    }

    // ==================== UTILIDADES ====================

    actualizarContadores() {
        const contadores = {
            upcoming: this.eventos.filter(e => e.estadoTemporal === 'upcoming').length,
            live: this.eventos.filter(e => e.estadoTemporal === 'live').length,
            today: this.eventos.filter(e => e.esHoy).length,
            week: this.eventos.filter(e => e.esSemana && e.estadoTemporal !== 'past').length,
            past: this.eventos.filter(e => e.estadoTemporal === 'past').length
        };

        Object.entries(contadores).forEach(([filter, count]) => {
            const element = document.getElementById(`count${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
            if (element) element.textContent = count;
        });

        // Contadores adicionales
        const totalEventosCount = document.getElementById('totalEventosCount');
        if (totalEventosCount) totalEventosCount.textContent = this.eventos.length;

        const organizadoresCount = document.getElementById('organizadoresCount');
        if (organizadoresCount) {
            const organizadores = new Set(this.eventos.map(e => e.usuario?.id).filter(Boolean));
            organizadoresCount.textContent = organizadores.size;
        }
    }

    actualizarTitulo() {
        const titles = {
            upcoming: 'Eventos Próximos',
            live: 'Eventos en Vivo',
            today: 'Eventos de Hoy',
            week: 'Eventos de esta Semana',
            past: 'Eventos Pasados'
        };

        const titleElement = document.getElementById('contentTitle');
        if (titleElement) {
            titleElement.textContent = titles[this.currentFilter] || 'Eventos Disponibles';
        }
    }

    actualizarProximoEvento() {
        const spotlightContent = document.getElementById('spotlightContent');
        if (!spotlightContent) {
            console.log('⚠️ Elemento spotlightContent no encontrado');
            return;
        }

        // Filtrar eventos próximos de TODOS los eventos, no solo del vendedor
        let proximosEventos = this.eventos.filter(e => e.estadoTemporal === 'upcoming');

        // Si es vendedor, mostrar solo sus eventos próximos
        if (this.tipoUsuario === 'VENDEDOR' && this.userData && this.userData.user) {
            proximosEventos = proximosEventos.filter(e => e.usuario && e.usuario.id === this.userData.user.id);
        }

        proximosEventos = proximosEventos.sort((a, b) => a.fechaInicioObj - b.fechaInicioObj);

        console.log(`📅 Actualizando próximo evento: ${proximosEventos.length} eventos encontrados`);

        if (proximosEventos.length === 0) {
            spotlightContent.innerHTML = `
            <div class="no-next-event">
                <span class="no-event-icon">📅</span>
                <p class="loading-next-event">No hay eventos próximos</p>
                ${this.tipoUsuario === 'VENDEDOR' ? '<p class="create-event-hint">¡Crea tu primer evento!</p>' : ''}
            </div>
        `;
            return;
        }

        const proximoEvento = proximosEventos[0];
        const fechaFormateada = this.formatearFecha(proximoEvento.fechaInicioObj, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const horaFormateada = this.formatearHora(proximoEvento.fechaInicioObj);

        spotlightContent.innerHTML = `
            <div class="spotlight-evento" onclick="eventosManager.verDetalleEvento('${proximoEvento.id}')">
                <h3 class="spotlight-evento-title">${proximoEvento.titulo}</h3>
                <div class="spotlight-evento-meta">
                    <div class="spotlight-meta-item">
                        <span>📅</span>
                        <span>${fechaFormateada}</span>
                    </div>
                    <div class="spotlight-meta-item">
                        <span>⏰</span>
                        <span>${horaFormateada}</span>
                    </div>
                    ${proximoEvento.ubicacion ? `
                        <div class="spotlight-meta-item">
                            <span>📍</span>
                            <span>${this.truncateText(proximoEvento.ubicacion, 50)}</span>
                        </div>
                    ` : ''}
                </div>
                ${proximoEvento.descripcion ? `
                    <p class="spotlight-evento-description">${this.truncateText(proximoEvento.descripcion, 100)}</p>
                ` : ''}
            </div>
        `;
    }

    actualizarStatsVendedor() {
        if (this.tipoUsuario !== 'VENDEDOR') return;

        // Usar this.userData en lugar de localStorage
        if (!this.userData || !this.userData.user || !this.userData.user.id) return;

        const usuarioId = this.userData.user.id;
        const misEventos = this.eventos.filter(e => e.usuario && e.usuario.id === usuarioId);
        const eventosActivos = misEventos.filter(e => e.estadoTemporal === 'upcoming' || e.estadoTemporal === 'live');
        const eventosProximos = misEventos.filter(e => e.estadoTemporal === 'upcoming');

        const totalEventosElement = document.getElementById('totalEventos');
        if (totalEventosElement) totalEventosElement.textContent = misEventos.length;

        const eventosActivosElement = document.getElementById('eventosActivos');
        if (eventosActivosElement) eventosActivosElement.textContent = eventosActivos.length;

        const eventosProximosElement = document.getElementById('eventosProximos');
        if (eventosProximosElement) eventosProximosElement.textContent = eventosProximos.length;
    }

    formatearFecha(fecha, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        const finalOptions = { ...defaultOptions, ...options };

        return fecha.toLocaleDateString('es-ES', finalOptions);
    }

    formatearHora(fecha) {
        return fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDateTimeLocal(fecha) {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const hours = String(fecha.getHours()).padStart(2, '0');
        const minutes = String(fecha.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    getCurrentUserId() {
        if (this.userData && this.userData.user) {
            return this.userData.user.id;
        }
        return null;
    }

    // ==================== ACCIONES ADICIONALES ====================

    abrirUbicacion(ubicacion) {
        if (!ubicacion) {
            this.simularFuncionFutura('Visualización de ubicación en mapa');
            return;
        }

        // Si es una URL, abrirla directamente
        if (ubicacion.startsWith('http')) {
            window.open(ubicacion, '_blank');
            return;
        }

        // Si es una dirección, abrir en Google Maps
        const encodedAddress = encodeURIComponent(ubicacion);
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        window.open(mapsUrl, '_blank');

        console.log('🗺️ Abriendo ubicación:', ubicacion);
    }

    async compartirEvento(eventoId) {
        const evento = this.eventos.find(e => e.id.toString() === eventoId.toString());
        if (!evento) return;

        const shareData = {
            title: evento.titulo,
            text: `Te invito a este evento: ${evento.titulo}`,
            url: window.location.href + `?evento=${eventoId}`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                console.log('📤 Evento compartido via Web Share API');
            } else {
                // Fallback: copiar al portapapeles
                const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
                await navigator.clipboard.writeText(shareText);
                this.mostrarToast('Enlace copiado al portapapeles', 'success');
                console.log('📤 Evento copiado al portapapeles');
            }
        } catch (error) {
            console.error('❌ Error compartiendo evento:', error);
            this.mostrarError('Error al compartir el evento');
        }
    }

    // ==================== MODAL MANAGEMENT ====================

    abrirModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.log(`❌ Modal no encontrado: ${modalId}`);
            return;
        }

        // Verificar permisos solo para modal de editor
        if (modalId === 'eventoEditorModal') {
            if (this.tipoUsuario !== 'VENDEDOR') {
                console.log('❌ Intento de abrir modal de editor sin ser vendedor');
                return;
            }

            if (!this.modalOpenRequested) {
                console.log('❌ Modal de editor intentando abrirse automáticamente - BLOQUEADO');
                return;
            }

            // Resetear flag solo para editor
            this.modalOpenRequested = false;
        }

        // Para modal de detalle, siempre permitir
        if (modalId === 'eventoDetalleModal') {
            console.log(`✅ Abriendo modal de detalle para ${this.tipoUsuario}`);
        }

        // Para modal de editor, verificar vendedor
        if (modalId === 'eventoEditorModal') {
            console.log(`✅ Abriendo modal de editor para ${this.tipoUsuario}`);
            if (this.tipoUsuario !== 'VENDEDOR') {
                console.log('❌ Usuario no es vendedor, no puede abrir editor');
                return;
            }
        }

        // Forzar propiedades CSS para popup
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        modal.style.transform = 'scale(1)';
        modal.style.zIndex = '9999';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.background = 'rgba(0, 0, 0, 0.8)';
        modal.style.backdropFilter = 'blur(12px)';
        modal.classList.add('show');

        // Animar apertura con GSAP
        gsap.fromTo(modal,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power2.out" }
        );

        const modalContent = modal.querySelector('.modal-content-evento, .modal-content-evento-editor');
        if (modalContent) {
            gsap.fromTo(modalContent,
                { scale: 0.8, y: 50 },
                { scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
            );
        }

        // Bloquear scroll del body
        document.body.style.overflow = 'hidden';

        console.log(`📖 Modal abierto correctamente: ${modalId} para ${this.tipoUsuario}`);
    }

    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Animar cierre con GSAP
        gsap.to(modal, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                modal.style.display = 'none';
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });

        gsap.to(modal.querySelector('.modal-content-evento, .modal-content-evento-editor'), {
            scale: 0.8,
            y: 50,
            duration: 0.3,
            ease: "power2.in"
        });

        console.log(`📖 Modal cerrado: ${modalId}`);
    }

    cerrarTodosLosModals() {
        document.querySelectorAll('.modal-evento-detalle, .modal-evento-editor').forEach(modal => {
            if (modal.style.display === 'flex') {
                this.cerrarModal(modal.id);
            }
        });
    }

    // ==================== UI FEEDBACK ====================

    mostrarLoading(show) {
        this.isLoading = show;
        const loadingElement = document.getElementById('loadingEventos');

        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }

        if (show) {
            console.log('⏳ Mostrando loading...');
        }
    }

    mostrarLoadingBoton(show) {
        const saveBtn = document.getElementById('saveEventoBtn');
        if (!saveBtn) return;

        if (show) {
            saveBtn.classList.add('loading');
            saveBtn.disabled = true;
        } else {
            saveBtn.classList.remove('loading');
            saveBtn.disabled = false;
        }
    }

    mostrarToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) {
            console.log(`📢 Toast: ${message} (${type})`);
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast-eventos ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-close-btn" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        // Animar entrada
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-remove después de 5 segundos
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);

        console.log(`📢 Toast mostrado: ${message} (${type})`);
    }

    mostrarError(message) {
        this.mostrarToast(message, 'error');
        console.error('❌ Error:', message);
    }

    // ==================== EVENTOS DESTACADOS Y RECIENTES ====================

    cargarEventosDestacados() {
        const container = document.getElementById('featuredEventsList');
        if (!container || this.tipoUsuario !== 'COMPRADOR') return;

        // Obtener eventos destacados (próximos y populares)
        const eventosDestacados = this.eventos
            .filter(evento => evento.estadoTemporal === 'upcoming')
            .sort((a, b) => a.fechaInicioObj - b.fechaInicioObj)
            .slice(0, 5);

        if (eventosDestacados.length === 0) {
            container.innerHTML = '<p class="no-featured-events">No hay eventos destacados</p>';
            return;
        }

        container.innerHTML = eventosDestacados.map(evento => `
            <div class="featured-event" onclick="eventosManager.verDetalleEvento('${evento.id}')">
                <div class="featured-info">
                    <h4 class="featured-title">${evento.titulo}</h4>
                    <div class="featured-meta">
                        <span class="featured-date">${this.formatearFecha(evento.fechaInicioObj)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        console.log(`⭐ ${eventosDestacados.length} eventos destacados cargados`);
    }

    cargarEventosRecientes() {
        const container = document.getElementById('recentEventsList');
        if (!container || this.tipoUsuario !== 'COMPRADOR') return;

        // Obtener eventos recientes (últimos creados)
        const eventosRecientes = this.eventos
            .filter(evento => evento.fechacreacion)
            .sort((a, b) => new Date(b.fechacreacion) - new Date(a.fechacreacion))
            .slice(0, 5);

        if (eventosRecientes.length === 0) {
            container.innerHTML = '<p class="no-recent-events">No hay eventos recientes</p>';
            return;
        }

        container.innerHTML = eventosRecientes.map(evento => `
            <div class="recent-event-item" onclick="eventosManager.verDetalleEvento('${evento.id}')">
                <h4 class="recent-event-title">${evento.titulo}</h4>
                <div class="recent-event-date">${this.formatearFecha(evento.fechaInicioObj)}</div>
            </div>
        `).join('');

        console.log(`🕒 ${eventosRecientes.length} eventos recientes cargados`);
    }

    // ==================== CLEANUP Y DESTRUCTOR ====================

    destruir() {
        // Limpiar intervalos si existen
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
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

        console.log('🧹 EventosManager limpiado correctamente');
    }

    // ==================== MÉTODOS DE ACTUALIZACIÓN ====================

    async refrescarEventos() {
        console.log('🔄 Refrescando eventos...');
        await this.cargarEventos(true);
        this.mostrarToast('Eventos actualizados', 'success');
    }

    // ==================== EVENTOS ESPECIALES ====================

    // Actualizar eventos destacados cuando cambian los datos
    actualizarComponentesUI() {
        // Ejecutar con delay para asegurar que los datos estén listos
        setTimeout(() => {
            this.cargarEventosDestacados();
            this.cargarEventosRecientes();
            this.actualizarContadores();
            this.actualizarProximoEvento();

            if (this.tipoUsuario === 'VENDEDOR') {
                this.actualizarStatsVendedor();
            }

            console.log('🔄 Componentes UI actualizados');
        }, 100);
    }

    // ==================== GESTIÓN DE ERRORES ====================

    handleError(error, context = 'Operación') {
        console.error(`❌ Error en ${context}:`, error);

        let message = 'Ha ocurrido un error inesperado';

        if (error.message) {
            if (error.message.includes('404')) {
                message = 'El recurso solicitado no fue encontrado';
            } else if (error.message.includes('403')) {
                message = 'No tienes permisos para realizar esta acción';
            } else if (error.message.includes('500')) {
                message = 'Error interno del servidor';
            } else if (error.message.includes('Network')) {
                message = 'Error de conexión. Verifica tu internet';
            } else {
                message = error.message;
            }
        }

        this.mostrarError(message);
    }

    // ==================== FUNCIONES DE UTILIDAD ADICIONALES ====================

    // Calcular tiempo restante hasta un evento
    calcularTiempoRestante(fechaEvento) {
        const ahora = new Date();
        const diferencia = fechaEvento - ahora;

        if (diferencia <= 0) return null;

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

        if (dias > 0) return `${dias}d ${horas}h`;
        if (horas > 0) return `${horas}h ${minutos}m`;
        return `${minutos}m`;
    }

    // Determinar el estado de un evento
    determinarEstadoEvento(evento) {
        const ahora = new Date();
        const inicio = evento.fechaInicioObj;
        const fin = evento.fechaFinObj;

        if (inicio > ahora) return 'upcoming';
        if (fin && fin < ahora) return 'past';
        return 'live';
    }

    // ==================== INICIALIZACIÓN DE COMPONENTES ====================

    // Método que se ejecuta cuando todos los eventos están cargados
    onEventosCargados() {
        this.actualizarComponentesUI();

        // Trigger para cualquier plugin o sistema que dependa de los eventos
        document.dispatchEvent(new CustomEvent('eventosLoaded', {
            detail: { eventos: this.eventos, manager: this }
        }));

        console.log('📡 Evento personalizado "eventosLoaded" disparado');

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

    mostrarAlertaFuncionNoDisponible(mensaje) {
        this.mostrarToast(`${mensaje}. Esta función llegará pronto 🚀`, 'warning');
    }

// Validar si un evento es editable por el usuario actual (método corregido)
    puedeEditarEvento(evento) {
        // Solo vendedores pueden editar eventos
        if (this.tipoUsuario !== 'VENDEDOR') return false;

        // Verificar que tenemos datos del usuario
        if (!this.userData || !this.userData.user || !this.userData.user.id) return false;

        // El usuario puede editar solo sus propios eventos
        return evento.usuario && evento.usuario.id === this.userData.user.id;
    }

    configurarHeaderPorTipoUsuario() {
        const pageTitle = document.querySelector('.title-text');
        const dashboard = document.getElementById('vendorDashboardEventos');

        if (this.tipoUsuario === 'VENDEDOR') {
            if (pageTitle) pageTitle.textContent = 'Mis Eventos';
            if (dashboard) dashboard.style.display = 'block';
        } else {
            if (pageTitle) pageTitle.textContent = 'Eventos';
            if (dashboard) dashboard.style.display = 'none';
        }
    }

    setupActionButtons() {
        // Solo configurar si es vendedor y no está ya configurado
        if (this.tipoUsuario === 'VENDEDOR' && !this.actionButtonsConfigured) {
            const btnNuevoEvento = document.getElementById('btnNuevoEvento');
            if (btnNuevoEvento) {
                // Remover listeners existentes
                btnNuevoEvento.removeEventListener('click', this.handleNuevoEventoClick);

                // Crear función bound para poder removerla después
                this.handleNuevoEventoClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🆕 Click en Nuevo Evento - Vendedor ID:', this.userData.user.id);
                    this.abrirCrearEvento();
                };

                btnNuevoEvento.addEventListener('click', this.handleNuevoEventoClick);
                btnNuevoEvento.style.display = 'flex';

                // Configurar botón empty state también
                this.setupEmptyStateButton();

                this.actionButtonsConfigured = true;
                console.log('✅ Botón Nuevo Evento configurado para VENDEDOR');
            }
        } else if (this.tipoUsuario === 'COMPRADOR') {
            const btnNuevoEvento = document.getElementById('btnNuevoEvento');
            if (btnNuevoEvento) {
                btnNuevoEvento.style.display = 'none';
            }
        }
    }

    configurarBotonesAccionDinamicos() {
        // NO hacer nada aquí - los botones se manejan por delegación
        // console.log('⚙️ Configurando botones de acción dinámicos');
    }

    setupDelegatedEventListeners() {
        // Evitar configurar múltiples veces
        if (this.delegatedListenersConfigured) {
            console.log('⚠️ Event listeners delegados ya configurados, saltando...');
            return;
        }

        // Delegación de eventos para botones dinámicos
        this.handleDelegatedClick = (e) => {
            // Botones de editar evento
            if (e.target.closest('.action-btn-evento.edit-btn') || e.target.closest('[onclick*="editarEvento"]')) {
                e.preventDefault();
                e.stopPropagation();

                let eventoId = e.target.closest('[data-evento-id]')?.dataset.eventoId;

                // Si no encuentra el ID en data-evento-id, buscar en onclick
                if (!eventoId) {
                    const onclickAttr = e.target.closest('[onclick]')?.getAttribute('onclick');
                    if (onclickAttr) {
                        const match = onclickAttr.match(/editarEvento\(['"](\d+)['"]\)/);
                        if (match) {
                            eventoId = match[1];
                        }
                    }
                }

                if (eventoId && this.tipoUsuario === 'VENDEDOR') {
                    console.log('✏️ Click delegado en Editar Evento:', eventoId, 'Usuario:', this.tipoUsuario);
                    this.editarEvento(eventoId);
                } else {
                    console.log('❌ No se puede editar: eventoId=', eventoId, 'tipoUsuario=', this.tipoUsuario);
                }
            }

            // Botones de eliminar evento
            if (e.target.closest('.action-btn-evento.delete-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const eventoId = e.target.closest('[data-evento-id]')?.dataset.eventoId;
                if (eventoId) {
                    console.log('🗑️ Click delegado en Eliminar Evento:', eventoId);
                    this.eliminarEvento(eventoId);
                }
            }

            // Botones de compartir evento
            if (e.target.closest('.action-btn-evento.share-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const eventoId = e.target.closest('[data-evento-id]')?.dataset.eventoId;
                if (eventoId) {
                    console.log('📤 Click delegado en Compartir Evento:', eventoId);
                    this.compartirEvento(eventoId);
                }
            }
        };

        document.addEventListener('click', this.handleDelegatedClick);
        this.delegatedListenersConfigured = true;
        console.log('🎯 Event listeners delegados configurados');
    }

    limpiarEventListeners() {
        if (this.handleDelegatedClick) {
            document.removeEventListener('click', this.handleDelegatedClick);
        }
        if (this.handleNuevoEventoClick) {
            const btnNuevoEvento = document.getElementById('btnNuevoEvento');
            if (btnNuevoEvento) {
                btnNuevoEvento.removeEventListener('click', this.handleNuevoEventoClick);
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
                console.log('🆕 Click en botón empty state - NO auto-abrir');
                // Solo abrir si el usuario hace click explícitamente
                if (e.isTrusted) {
                    this.abrirCrearEvento();
                }
            };

            emptyStateBtn.addEventListener('click', this.handleEmptyStateClick);
            console.log('✅ Botón empty state configurado');
        }
    }

    forzarCierreModals() {
        const modals = document.querySelectorAll('.modal-evento-detalle, .modal-evento-editor');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
            modal.style.transform = 'scale(0)';
            modal.classList.remove('show');
        });

        document.body.style.overflow = 'auto';
        console.log('🔒 Modals forzados a cerrar');
    }

    debugModalEditor() {
        console.log('🔍 DEBUG: Estado del modal de editor');
        const modal = document.getElementById('eventoEditorModal');
        if (modal) {
            console.log('Modal encontrado:', modal);
            console.log('Display:', modal.style.display);
            console.log('Visibility:', modal.style.visibility);
            console.log('Opacity:', modal.style.opacity);
            console.log('Classes:', modal.className);
            console.log('Z-index:', modal.style.zIndex);

            const form = document.getElementById('eventoEditorForm');
            if (form) {
                console.log('Formulario encontrado:', form);
                console.log('Campos del formulario:');
                ['eventoTitulo', 'eventoDescripcion', 'eventoUbicacion', 'eventoImagen', 'eventoFechaInicio', 'eventoFechaFin'].forEach(id => {
                    const campo = document.getElementById(id);
                    console.log(`- ${id}:`, campo ? 'Encontrado' : 'NO ENCONTRADO');
                });
            } else {
                console.log('❌ Formulario NO encontrado');
            }
        } else {
            console.log('❌ Modal NO encontrado');
        }
    }

} //CIERRE CLASE

// ==================== INICIALIZACIÓN GLOBAL ====================

// Variable global para acceso desde HTML
window.eventosManager = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando sistema de eventos...');

    // Crear instancia global
    window.eventosManager = new EventosManager();

    // Exponer métodos globales para uso en HTML
    window.verDetalleEvento = (id) => window.eventosManager.verDetalleEvento(id);
    window.editarEvento = (id) => window.eventosManager.editarEvento(id);
    window.eliminarEvento = (id) => window.eventosManager.eliminarEvento(id);

    console.log('✅ Sistema de eventos inicializado globalmente');
});

// Cleanup cuando la página se descarga
window.addEventListener('beforeunload', () => {
    if (window.eventosManager) {
        window.eventosManager.destruir();
    }
});

// Manejo de errores globales
window.addEventListener('error', (e) => {
    console.error('❌ Error global capturado:', e.error);
    if (window.eventosManager) {
        window.eventosManager.handleError(e.error, 'Error global');
    }
});

// Manejo de errores de promesas no capturadas
window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Promesa rechazada no manejada:', e.reason);
    if (window.eventosManager) {
        window.eventosManager.handleError(e.reason, 'Promesa rechazada');
    }
    e.preventDefault();
});

// Export para uso en módulos (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventosManager;
}