// notificaciones.js - Sistema de Notificaciones con Patrón Neumorphic y GSAP

class NotificacionesApp {
    constructor() {
        this.tipoUsuario = this.detectarTipoUsuario();
        this.notificaciones = [];
        this.filtroActual = 'todas';
        this.usuariosDisponibles = [];
        this.usuariosSeleccionados = [];

        this.iconosPorTipo = {
            'PROMOCION': '🏷️',
            'NUEVO_PRODUCTO': '🆕',
            'DESCUENTO': '💰',
            'STOCK': '📦',
            'EVENTO': '🎉',
            'INFORMATIVA': 'ℹ️',
            'URGENTE': '🚨',
            'PRODUCTO': '🛍️',
            'PEDIDO': '📋',
            'CARRITO': '🛒',
            'SISTEMA': '⚙️'
        };

        this.init();
    }

    init() {
        this.configurarInterfazPorTipoUsuario();
        this.configurarEventListeners();
        this.cargarDatos();
        this.animarEntrada();
    }

    detectarTipoUsuario() {
        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
        if (userSession) {
            try {
                const userData = JSON.parse(userSession);
                return (userData.user?.tipousuario || userData.user?.tipoUsuario || 'COMPRADOR').toUpperCase();
            } catch (error) {
                console.error('Error detecting user type:', error);
            }
        }
        return 'COMPRADOR';
    }

    configurarInterfazPorTipoUsuario() {
        const tituloSeccion = document.getElementById('tituloSeccion');
        const lecturasSection = document.getElementById('lecturasSection');
        const creacionSection = document.getElementById('creacionSection');

        if (this.tipoUsuario === 'VENDEDOR') {
            if (tituloSeccion) tituloSeccion.textContent = 'Centro de Notificaciones - Vendedor';
            if (lecturasSection) lecturasSection.style.display = 'none';
            if (creacionSection) creacionSection.style.display = 'block';
            console.log('Interfaz configurada para VENDEDOR');
        } else {
            if (tituloSeccion) tituloSeccion.textContent = 'Mis Notificaciones';
            if (lecturasSection) lecturasSection.style.display = 'block';
            if (creacionSection) creacionSection.style.display = 'none';
            console.log('Interfaz configurada para COMPRADOR');
        }
    }

    configurarEventListeners() {
        // Botón volver
        const btnVolver = document.getElementById('btnVolver');
        if (btnVolver) {
            btnVolver.addEventListener('click', () => this.volver());
        }

        if (this.tipoUsuario === 'COMPRADOR') {
            this.configurarEventListenersComprador();
        } else {
            this.configurarEventListenersVendedor();
        }

        // Modales
        this.configurarEventListenersModales();
    }

    configurarEventListenersComprador() {
        // Filtros
        const filtros = document.querySelectorAll('.btn-filtro');
        filtros.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filtro = e.target.dataset.filtro;
                this.aplicarFiltro(filtro);
            });
        });

        // Acciones masivas
        const btnMarcarTodas = document.getElementById('btnMarcarTodasLeidas');
        const btnEliminarLeidas = document.getElementById('btnEliminarTodasLeidas');

        if (btnMarcarTodas) {
            btnMarcarTodas.addEventListener('click', () => this.marcarTodasComoLeidas());
        }

        if (btnEliminarLeidas) {
            btnEliminarLeidas.addEventListener('click', () => this.eliminarTodasLeidas());
        }
    }

    configurarEventListenersVendedor() {
        // Formulario
        const formulario = document.getElementById('formularioNotificacion');
        if (formulario) {
            formulario.addEventListener('submit', (e) => this.enviarNotificacion(e));
        }

        // Campos del formulario
        const destinatarios = document.getElementById('destinatarios');
        const tituloInput = document.getElementById('tituloNotificacion');
        const mensajeInput = document.getElementById('mensajeNotificacion');
        const tipoSelect = document.getElementById('tipoNotificacion');
        const programarCheck = document.getElementById('programarEnvio');

        if (destinatarios) {
            destinatarios.addEventListener('change', () => this.manejarCambioDestinatarios());
        }

        if (tituloInput) {
            tituloInput.addEventListener('input', () => {
                this.actualizarContador('titulo', tituloInput.value, 100);
                this.actualizarPreview();
            });
        }

        if (mensajeInput) {
            mensajeInput.addEventListener('input', () => {
                this.actualizarContador('mensaje', mensajeInput.value, 500);
                this.actualizarPreview();
            });
        }

        if (tipoSelect) {
            tipoSelect.addEventListener('change', () => this.actualizarPreview());
        }

        if (programarCheck) {
            programarCheck.addEventListener('change', () => this.toggleFechaProgramada());
        }

        // Botones adicionales
        const btnBorrador = document.getElementById('btnGuardarBorrador');
        if (btnBorrador) {
            btnBorrador.addEventListener('click', () => this.guardarBorrador());
        }
    }

    configurarEventListenersModales() {
        // Modal confirmación
        const modalClose = document.getElementById('modalClose');
        const btnCancelar = document.getElementById('btnCancelar');
        if (modalClose) modalClose.addEventListener('click', () => this.cerrarModal('modalConfirmacion'));
        if (btnCancelar) btnCancelar.addEventListener('click', () => this.cerrarModal('modalConfirmacion'));

        // Modal detalle
        const detalleModalClose = document.getElementById('detalleModalClose');
        if (detalleModalClose) detalleModalClose.addEventListener('click', () => this.cerrarModal('modalDetalle'));

        // Acciones del modal detalle
        const btnMarcarLeida = document.getElementById('btnMarcarLeida');
        const btnEliminarNotif = document.getElementById('btnEliminarNotificacion');

        if (btnMarcarLeida) {
            btnMarcarLeida.addEventListener('click', () => this.marcarComoLeidaDesdeModal());
        }

        if (btnEliminarNotif) {
            btnEliminarNotif.addEventListener('click', () => this.eliminarNotificacionDesdeModal());
        }

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarModal('modalConfirmacion');
                this.cerrarModal('modalDetalle');
            }
        });
    }

    // ==================== CARGA DE DATOS ====================

    async cargarDatos() {
        if (this.tipoUsuario === 'COMPRADOR') {
            await this.cargarNotificacionesComprador();
        } else {
            await this.cargarDatosVendedor();
        }
    }

    async cargarNotificacionesComprador() {
        try {
            const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
            if (!userSession) return;

            const userData = JSON.parse(userSession);
            const usuarioId = userData.user?.id;

            if (!usuarioId) return;

            console.log('Cargando notificaciones para usuario:', usuarioId);

            const response = await fetch(`http://localhost:8080/api/notificaciones/usuario/${usuarioId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.notificaciones = await response.json();
                console.log('Notificaciones cargadas:', this.notificaciones);
                this.renderizarNotificaciones();
                this.actualizarContadores();
            } else {
                console.error('Error cargando notificaciones:', response.status);
                this.mostrarEstadoVacio();
            }
        } catch (error) {
            console.error('Error:', error);
            this.mostrarEstadoVacio();
        }
    }

    async cargarDatosVendedor() {
        await Promise.all([
            this.cargarEstadisticasVendedor(),
            this.cargarUsuariosDisponibles(),
            this.cargarHistorialNotificaciones()
        ]);
    }

    async cargarEstadisticasVendedor() {
        try {
            const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
            if (!userSession) return;

            const userData = JSON.parse(userSession);
            const vendedorId = userData.user?.id;

            if (!vendedorId) return;

            console.log('Cargando estadísticas para vendedor:', vendedorId);

            const response = await fetch(`http://localhost:8080/api/notificaciones/estadisticas/${vendedorId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const stats = await response.json();
                console.log('Estadísticas cargadas:', stats);

                this.actualizarElemento('totalEnviadas', stats.totalEnviadas || 0);
                this.actualizarElemento('totalUsuarios', stats.totalUsuarios || 0);
                this.actualizarElemento('tasaLectura', stats.tasaLectura || '0%');
            } else {
                console.error('Error cargando estadísticas:', response.status);
                // Valores por defecto
                this.actualizarElemento('totalEnviadas', 0);
                this.actualizarElemento('totalUsuarios', 0);
                this.actualizarElemento('tasaLectura', '0%');
            }
        } catch (error) {
            console.error('Error:', error);
            // Valores por defecto en caso de error
            this.actualizarElemento('totalEnviadas', 0);
            this.actualizarElemento('totalUsuarios', 0);
            this.actualizarElemento('tasaLectura', '0%');
        }
    }

    async cargarUsuariosDisponibles() {
        try {
            // Aquí cargarías la lista de usuarios desde tu API
            // Por ahora simulo algunos usuarios
            this.usuariosDisponibles = [
                { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com' },
                { id: 2, nombre: 'María García', email: 'maria@email.com' },
                { id: 3, nombre: 'Carlos López', email: 'carlos@email.com' }
            ];
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        }
    }

    async cargarHistorialNotificaciones() {
        try {
            const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
            if (!userSession) {
                console.log('No hay sesión de usuario para cargar historial');
                return;
            }

            const userData = JSON.parse(userSession);
            const vendedorId = userData.user?.id;

            if (!vendedorId) {
                console.log('No se encontró ID de vendedor');
                return;
            }

            console.log('🔄 Cargando historial para vendedor:', vendedorId);

            const historialContainer = document.getElementById('historialLista');
            if (!historialContainer) {
                console.log('No se encontró contenedor de historial');
                return;
            }

            // Mostrar estado de carga
            historialContainer.innerHTML = '<div style="text-align: center; padding: 2rem;">Cargando historial...</div>';

            const response = await fetch(`http://localhost:8080/api/notificaciones/historial/${vendedorId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Respuesta del historial:', response.status, response.statusText);

            if (response.ok) {
                const historial = await response.json();
                console.log('📋 Historial cargado:', historial.length, 'notificaciones');
                console.log('📋 Datos del historial:', historial);

                if (historial.length === 0) {
                    historialContainer.innerHTML = `
                    <div class="historial-vacio">
                        <div style="text-align: center; padding: 2rem; color: #6b7280;">
                            <div style="font-size: 2rem; margin-bottom: 1rem;">📝</div>
                            <h4 style="margin-bottom: 0.5rem;">No hay notificaciones enviadas</h4>
                            <p style="margin: 0;">Las notificaciones que envíes aparecerán aquí.</p>
                        </div>
                    </div>
                `;
                } else {
                    historialContainer.innerHTML = historial.map(notif => `
                    <div class="historial-item">
                        <div class="historial-header">
                            <h4>${notif.titulo}</h4>
                            <span class="historial-fecha">${this.formatearFecha(notif.fechacreacion)}</span>
                        </div>
                        <div class="historial-info">
                            <span class="historial-tipo">${this.getIconoTipo(notif.tipo)} ${notif.tipo}</span>
                            <span class="historial-destinatario">${notif.destinatarioTipo || 'Individual'}</span>
                            <span class="historial-estado">${notif.estadoEnvio || 'Enviada'}</span>
                        </div>
                        <div class="historial-mensaje">
                            ${notif.mensaje.length > 100 ? notif.mensaje.substring(0, 100) + '...' : notif.mensaje}
                        </div>
                        ${notif.enlace ? `
                            <div class="historial-enlace">
                                <a href="${notif.enlace}" target="_blank" style="color: var(--primary-color); text-decoration: none; font-size: 0.9rem;">
                                    🔗 Ver enlace
                                </a>
                            </div>
                        ` : ''}
                        <div class="historial-destinatario-info" style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted);">
                            ${notif.usuario ? `Enviado a: ${notif.usuario.nombre || 'Usuario #' + notif.usuario.id}` : 'Enviado a múltiples usuarios'}
                        </div>
                    </div>
                `).join('');
                }
            } else {
                const errorText = await response.text();
                console.error('❌ Error del servidor:', response.status, errorText);
                historialContainer.innerHTML = `
                <div class="historial-error">
                    <div style="text-align: center; padding: 2rem; color: var(--error);">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                        <h4 style="margin-bottom: 0.5rem;">Error cargando historial</h4>
                        <p style="margin: 0; font-size: 0.9rem;">Status: ${response.status} - ${response.statusText}</p>
                        <button onclick="notificacionesApp.cargarHistorialNotificaciones()" 
                                style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            Reintentar
                        </button>
                    </div>
                </div>
            `;
            }
        } catch (error) {
            console.error('💥 Error en cargarHistorialNotificaciones:', error);
            const historialContainer = document.getElementById('historialLista');
            if (historialContainer) {
                historialContainer.innerHTML = `
                <div class="historial-error">
                    <div style="text-align: center; padding: 2rem; color: var(--error);">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">💥</div>
                        <h4 style="margin-bottom: 0.5rem;">Error de conexión</h4>
                        <p style="margin: 0; font-size: 0.9rem;">${error.message}</p>
                        <button onclick="notificacionesApp.cargarHistorialNotificaciones()" 
                                style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            Reintentar
                        </button>
                    </div>
                </div>
            `;
            }
        }
    }

    // ==================== RENDERIZADO COMPRADORES ====================

    renderizarNotificaciones() {
        const container = document.getElementById('notificacionesLista');
        if (!container) return;

        const notificacionesFiltradas = this.filtrarNotificaciones();

        if (notificacionesFiltradas.length === 0) {
            this.mostrarEstadoVacio();
            return;
        }

        this.ocultarEstadoVacio();

        container.innerHTML = notificacionesFiltradas.map(notif => `
        <div class="notificacion-item ${notif.leida ? 'leida' : 'no-leida'} ${this.getClaseTipo(notif.tipo)}" 
             data-id="${notif.id}" onclick="notificacionesApp.abrirDetalle(${notif.id})">
            <div class="notificacion-header">
                <div class="notificacion-tipo-titulo">
                    <div class="notificacion-tipo-icon">
                        ${this.getIconoTipo(notif.tipo)}
                    </div>
                    <h3 class="notificacion-titulo">${notif.titulo}</h3>
                </div>
                <div class="notificacion-meta">
                    <span class="notificacion-fecha">${this.formatearFecha(notif.fechacreacion)}</span>
                    <span class="notificacion-estado ${notif.leida ? 'estado-leida' : 'estado-no-leida'}">
                        ${notif.leida ? 'Leída' : 'Nueva'}
                    </span>
                </div>
            </div>
            <div class="notificacion-mensaje">
                ${notif.mensaje.length > 150 ? notif.mensaje.substring(0, 150) + '...' : notif.mensaje}
            </div>
            <div class="notificacion-acciones">
                ${!notif.leida ? `
                    <button class="btn-notif-accion btn-marcar-leida" onclick="event.stopPropagation(); notificacionesApp.marcarComoLeida(${notif.id})">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Marcar Leída
                    </button>
                ` : ''}
                <button class="btn-notif-accion btn-eliminar-notif" onclick="event.stopPropagation(); notificacionesApp.eliminarNotificacion(${notif.id})">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    </svg>
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');

        this.animarNotificaciones();
    }

    filtrarNotificaciones() {
        switch (this.filtroActual) {
            case 'no-leidas':
                return this.notificaciones.filter(n => !n.leida);
            case 'leidas':
                return this.notificaciones.filter(n => n.leida);
            default:
                return this.notificaciones;
        }
    }

    aplicarFiltro(filtro) {
        this.filtroActual = filtro;

        // Actualizar botones activos
        document.querySelectorAll('.btn-filtro').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filtro === filtro) {
                btn.classList.add('active');
            }
        });

        this.renderizarNotificaciones();
    }

    actualizarContadores() {
        const total = this.notificaciones.length;
        const noLeidas = this.notificaciones.filter(n => !n.leida).length;
        const leidas = this.notificaciones.filter(n => n.leida).length;

        this.actualizarElemento('contadorNotificaciones', total);
        this.actualizarElemento('totalTodas', total);
        this.actualizarElemento('totalNoLeidas', noLeidas);
        this.actualizarElemento('totalLeidas', leidas);
    }

    // ==================== ACCIONES COMPRADORES ====================

    async marcarComoLeida(notifId) {
        try {
            const response = await fetch(`http://localhost:8080/api/notificaciones/${notifId}/marcar-leida`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Actualizar localmente
                const notif = this.notificaciones.find(n => n.id === notifId);
                if (notif) {
                    notif.leida = true;
                    this.renderizarNotificaciones();
                    this.actualizarContadores();
                    this.mostrarToast('Notificación marcada como leída', 'success');
                }
            }
        } catch (error) {
            console.error('Error marcando como leída:', error);
            this.mostrarToast('Error al marcar como leída', 'error');
        }
    }

    async eliminarNotificacion(notifId) {
        if (!confirm('¿Estás seguro de eliminar esta notificación?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/notificaciones/${notifId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Remover localmente
                this.notificaciones = this.notificaciones.filter(n => n.id !== notifId);
                this.renderizarNotificaciones();
                this.actualizarContadores();
                this.mostrarToast('Notificación eliminada', 'success');
            }
        } catch (error) {
            console.error('Error eliminando notificación:', error);
            this.mostrarToast('Error al eliminar notificación', 'error');
        }
    }

    async marcarTodasComoLeidas() {
        const noLeidas = this.notificaciones.filter(n => !n.leida);

        if (noLeidas.length === 0) {
            this.mostrarToast('No hay notificaciones sin leer', 'info');
            return;
        }

        for (const notif of noLeidas) {
            await this.marcarComoLeida(notif.id);
        }
    }

    async eliminarTodasLeidas() {
        const leidas = this.notificaciones.filter(n => n.leida);

        if (leidas.length === 0) {
            this.mostrarToast('No hay notificaciones leídas para eliminar', 'info');
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar ${leidas.length} notificaciones leídas?`)) return;

        for (const notif of leidas) {
            await this.eliminarNotificacion(notif.id);
        }
    }

    abrirDetalle(notifId) {
        const notif = this.notificaciones.find(n => n.id === notifId);
        if (!notif) return;

        const modal = document.getElementById('modalDetalle');
        const titulo = document.getElementById('detalleModalTitulo');
        const contenido = document.getElementById('detalleContent');

        if (titulo) titulo.textContent = notif.titulo;
        if (contenido) {
            contenido.innerHTML = `
                <div class="detalle-notificacion">
                    <div class="detalle-header">
                        <span class="detalle-tipo">${this.getIconoTipo(notif.tipo)} ${notif.tipo}</span>
                      <span class="detalle-fecha">${this.formatearFecha(notif.fechacreacion)}</span>
                    </div>
                    <div class="detalle-mensaje">
                        ${notif.mensaje}
                    </div>
                    ${notif.enlace ? `
                        <div class="detalle-enlace">
                            <a href="${notif.enlace}" target="_blank" rel="noopener">Ver más información</a>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        // Guardar ID para acciones
        modal.dataset.notifId = notifId;
        modal.style.display = 'flex';

        // Animar entrada
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(modal.querySelector('.modal-content'),
                { opacity: 0, scale: 0.7 },
                { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
            );
        }

        // Marcar como leída si no lo está
        if (!notif.leida) {
            this.marcarComoLeida(notifId);
        }
    }

    // ==================== FUNCIONES VENDEDOR ====================

    manejarCambioDestinatarios() {
        const select = document.getElementById('destinatarios');
        const usuariosContainer = document.getElementById('usuariosPersonalizados');

        if (select.value === 'personalizado') {
            usuariosContainer.style.display = 'block';
            this.mostrarSelectorUsuarios();
        } else {
            usuariosContainer.style.display = 'none';
        }
    }

    mostrarSelectorUsuarios() {
        const container = document.getElementById('usuariosSelector');
        if (!container) return;

        container.innerHTML = this.usuariosDisponibles.map(usuario => `
            <div class="usuario-item" data-id="${usuario.id}" onclick="notificacionesApp.toggleUsuario(${usuario.id})">
                <div class="usuario-avatar">${usuario.nombre.charAt(0)}</div>
                <div class="usuario-info">
                    <span class="usuario-nombre">${usuario.nombre}</span>
                    <span class="usuario-email">${usuario.email}</span>
                </div>
            </div>
        `).join('');
    }

    toggleUsuario(usuarioId) {
        const index = this.usuariosSeleccionados.indexOf(usuarioId);
        const elemento = document.querySelector(`[data-id="${usuarioId}"]`);

        if (index > -1) {
            this.usuariosSeleccionados.splice(index, 1);
            elemento.classList.remove('selected');
        } else {
            this.usuariosSeleccionados.push(usuarioId);
            elemento.classList.add('selected');
        }
    }

    actualizarContador(tipo, texto, limite) {
        const contador = document.getElementById(`${tipo}Counter`);
        if (contador) {
            contador.textContent = texto.length;
            contador.style.color = texto.length > limite * 0.9 ? 'var(--error)' : 'var(--text-muted)';
        }
    }

    actualizarPreview() {
        const tipo = document.getElementById('tipoNotificacion').value;
        const titulo = document.getElementById('tituloNotificacion').value;
        const mensaje = document.getElementById('mensajeNotificacion').value;

        const previewTipo = document.getElementById('previewTipo');
        const previewTitulo = document.getElementById('previewTitulo');
        const previewMensaje = document.getElementById('previewMensaje');

        if (previewTipo) previewTipo.textContent = this.getIconoTipo(tipo);
        if (previewTitulo) previewTitulo.textContent = titulo || 'Título de la notificación';
        if (previewMensaje) previewMensaje.textContent = mensaje || 'El mensaje de tu notificación aparecerá aquí...';
    }

    toggleFechaProgramada() {
        const checkbox = document.getElementById('programarEnvio');
        const fechaContainer = document.getElementById('fechaProgramada');

        if (checkbox.checked) {
            fechaContainer.style.display = 'block';
            // Establecer fecha mínima como ahora
            const ahora = new Date();
            ahora.setMinutes(ahora.getMinutes() + 10); // Mínimo 10 minutos en el futuro
            document.getElementById('fechaEnvio').min = ahora.toISOString().slice(0, 16);
        } else {
            fechaContainer.style.display = 'none';
        }
    }

    async enviarNotificacion(e) {
        e.preventDefault();

        // CORREGIR: No usar FormData, usar los valores directamente
        const datos = {
            tipoNotificacion: document.getElementById('tipoNotificacion').value,
            destinatarios: document.getElementById('destinatarios').value,
            tituloNotificacion: document.getElementById('tituloNotificacion').value,
            mensajeNotificacion: document.getElementById('mensajeNotificacion').value,
            enlaceNotificacion: document.getElementById('enlaceNotificacion').value || null,
            programarEnvio: document.getElementById('programarEnvio').checked,
            fechaEnvio: document.getElementById('fechaEnvio').value || null
        };

        console.log('📋 Datos capturados del formulario:', datos);
        console.log('🔍 Tipo seleccionado:', datos.tipoNotificacion);
        console.log('📮 Destinatarios:', datos.destinatarios);

        // Validaciones
        if (!this.validarFormulario(datos)) return;

        const btnEnviar = document.getElementById('btnEnviarNotificacion');
        const textoOriginal = btnEnviar.innerHTML;
        btnEnviar.innerHTML = '<div class="loading-spinner"></div>Enviando...';
        btnEnviar.disabled = true;

        try {
            // OBTENER ID DEL VENDEDOR ACTUAL
            const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
            let remitenteId = null;

            if (userSession) {
                try {
                    const userData = JSON.parse(userSession);
                    remitenteId = userData.user?.id;
                    console.log('👤 Remitente ID:', remitenteId);
                } catch (error) {
                    console.error('Error obteniendo remitente:', error);
                }
            }

            // Preparar datos para envío (SIN DTO)
            const notificacionData = {
                titulo: datos.tituloNotificacion,
                mensaje: datos.mensajeNotificacion,
                tipo: datos.tipoNotificacion,
                destinatarios: datos.destinatarios,
                enlace: datos.enlaceNotificacion,
                remitenteId: remitenteId,
                usuariosSeleccionados: this.usuariosSeleccionados
            };

            console.log('🚀 Enviando notificación al backend:', notificacionData);

            const response = await fetch('http://localhost:8080/api/notificaciones', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notificacionData)
            });

            console.log('📡 Respuesta del servidor:', response.status, response.statusText);

            if (response.ok) {
                const resultado = await response.json();
                console.log('✅ Respuesta del servidor:', resultado);
                this.mostrarToast('Notificación enviada correctamente', 'success');
                this.limpiarFormulario();
                await this.cargarHistorialNotificaciones();
            } else {
                const error = await response.text();
                console.error('❌ Error del servidor:', error);
                throw new Error('Error al enviar notificación: ' + error);
            }
        } catch (error) {
            console.error('💥 Error:', error);
            this.mostrarToast('Error al enviar notificación: ' + error.message, 'error');
        } finally {
            btnEnviar.innerHTML = textoOriginal;
            btnEnviar.disabled = false;
        }
    }

    validarFormulario(datos) {
        console.log('📋 Validando formulario con datos:', datos);
        console.log('🔍 Tipo seleccionado RAW:', datos.tipoNotificacion);
        console.log('🔍 Tipo length:', datos.tipoNotificacion ? datos.tipoNotificacion.length : 'NULL');
        console.log('📮 Destinatarios RAW:', datos.destinatarios);

        // Verificar elemento select directamente
        const tipoSelect = document.getElementById('tipoNotificacion');
        console.log('🎯 Select element value:', tipoSelect ? tipoSelect.value : 'NOT FOUND');
        console.log('🎯 Select selectedIndex:', tipoSelect ? tipoSelect.selectedIndex : 'NOT FOUND');

        if (!datos.tipoNotificacion || datos.tipoNotificacion.trim() === '' || datos.tipoNotificacion === '') {
            console.log('❌ Error: No hay tipo seleccionado');
            console.log('❌ Valor recibido:', JSON.stringify(datos.tipoNotificacion));
            this.mostrarToast('Selecciona un tipo de notificación', 'warning');
            return false;
        }

        if (!datos.destinatarios || datos.destinatarios.trim() === '') {
            console.log('❌ Error: No hay destinatarios seleccionados');
            this.mostrarToast('Selecciona los destinatarios', 'warning');
            return false;
        }

        if (!datos.tituloNotificacion || datos.tituloNotificacion.trim() === '') {
            console.log('❌ Error: No hay título');
            this.mostrarToast('Ingresa un título', 'warning');
            return false;
        }

        if (!datos.mensajeNotificacion || datos.mensajeNotificacion.trim() === '') {
            console.log('❌ Error: No hay mensaje');
            this.mostrarToast('Ingresa un mensaje', 'warning');
            return false;
        }

        if (datos.destinatarios === 'personalizado' && (!this.usuariosSeleccionados || this.usuariosSeleccionados.length === 0)) {
            console.log('❌ Error: No hay usuarios seleccionados para envío personalizado');
            this.mostrarToast('Selecciona al menos un usuario', 'warning');
            return false;
        }

        console.log('✅ Formulario validado correctamente');
        return true;
    }

    limpiarFormulario() {
        document.getElementById('formularioNotificacion').reset();
        this.usuariosSeleccionados = [];
        document.getElementById('usuariosPersonalizados').style.display = 'none';
        this.actualizarPreview();
    }

    guardarBorrador() {
        const datos = new FormData(document.getElementById('formularioNotificacion'));
        const borrador = Object.fromEntries(datos);

        localStorage.setItem('borradorNotificacion', JSON.stringify(borrador));
        this.mostrarToast('Borrador guardado', 'success');
    }

    // ==================== UTILIDADES ====================

    getIconoTipo(tipo) {
        // Convertir a mayúsculas y reemplazar guiones
        const tipoNormalizado = tipo ? tipo.toString().toUpperCase().replace('-', '_') : 'INFORMATIVA';
        return this.iconosPorTipo[tipoNormalizado] || '📨';
    }

    getClaseTipo(tipo) {
        if (tipo === 'urgente') return 'urgente';
        if (tipo === 'promocion' || tipo === 'descuento') return 'promocion';
        return '';
    }

    formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMs / 3600000);
        const diffDias = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'Ahora';
        if (diffMin < 60) return `Hace ${diffMin} min`;
        if (diffHoras < 24) return `Hace ${diffHoras}h`;
        if (diffDias < 7) return `Hace ${diffDias} días`;

        return fecha.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: fecha.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined
        });
    }

    actualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    }

    mostrarEstadoVacio() {
        const container = document.getElementById('notificacionesLista');
        const estadoVacio = document.getElementById('notificacionesVacio');

        if (container) container.innerHTML = '';
        if (estadoVacio) estadoVacio.style.display = 'block';
    }

    ocultarEstadoVacio() {
        const estadoVacio = document.getElementById('notificacionesVacio');
        if (estadoVacio) estadoVacio.style.display = 'none';
    }

    mostrarToast(mensaje, tipo = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'success' ? 'var(--success)' : tipo === 'error' ? 'var(--error)' : tipo === 'warning' ? 'var(--warning)' : 'var(--primary-color)'};
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

        if (typeof gsap !== 'undefined') {
            gsap.fromTo(toast,
                { opacity: 0, x: 100 },
                { opacity: 1, x: 0, duration: 0.5, ease: "back.out(1.7)" }
            );
        }

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

    // ==================== MODALES ====================

    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
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
    }

    marcarComoLeidaDesdeModal() {
        const modal = document.getElementById('modalDetalle');
        const notifId = parseInt(modal.dataset.notifId);
        if (notifId) {
            this.marcarComoLeida(notifId);
            this.cerrarModal('modalDetalle');
        }
    }

    eliminarNotificacionDesdeModal() {
        const modal = document.getElementById('modalDetalle');
        const notifId = parseInt(modal.dataset.notifId);
        if (notifId) {
            this.eliminarNotificacion(notifId);
            this.cerrarModal('modalDetalle');
        }
    }

    volver() {
        if (typeof gsap !== 'undefined') {
            gsap.to('.notificaciones-main', {
                opacity: 0,
                y: 50,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => {
                    window.location.href = '/dashboard';
                }
            });
        } else {
            window.location.href = '/dashboard';
        }
    }

    // ==================== ANIMACIONES ====================

    animarEntrada() {
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline();

            tl.from('.notificaciones-header', {
                duration: 0.8,
                y: -50,
                opacity: 0,
                ease: "power2.out"
            });

            tl.from('.acciones-header', {
                duration: 0.6,
                y: -30,
                opacity: 0,
                ease: "power2.out"
            }, "-=0.4");

            if (this.tipoUsuario === 'VENDEDOR') {
                tl.from('.stats-section', {
                    duration: 0.6,
                    x: -50,
                    opacity: 0,
                    ease: "power2.out"
                }, "-=0.4");

                tl.from('.formulario-section', {
                    duration: 0.6,
                    x: 50,
                    opacity: 0,
                    ease: "power2.out"
                }, "-=0.6");
            }
        }
    }

    animarNotificaciones() {
        const notificaciones = document.querySelectorAll('.notificacion-item');
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(notificaciones,
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power2.out"
                }
            );
        }
    }
}

// Variables globales
window.notificacionesApp = null;

// Función para usar desde dashboard
window.abrirNotificaciones = function() {
    window.location.href = '/notificaciones';
};

// CSS adicional para loading spinner
const spinStyle = document.createElement('style');
spinStyle.textContent = `
    .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #ffffff;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-right: 0.5rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(spinStyle);
