// cupones.js - Sistema Premium de Gestión de Cupones con API Integrada
class CuponesManager {
    constructor() {
        this.apiBaseURL = 'http://localhost:8080/api/cupones';
        this.usuarioActual = null;
        this.tipoUsuario = 'COMPRADOR';
        this.cupones = [];
        this.filteredCupones = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentView = 'grid';
        this.currentModal = null;
        this.estadisticasCache = null;
        this.filtros = {
            tipo: '',
            valor: '',
            estado: '',
            busqueda: ''
        };
        this.init();
    }

    async init() {
        try {
            console.log('🎫 Iniciando sistema de cupones premium...');

            this.mostrarLoadingScreen();
            await this.verificarAutenticacion();
            await this.cargarDatosUsuario();
            await this.cargarCupones();

            this.setupEventListeners();
            this.setupAnimaciones();
            this.personalizarInterfaz();

            setTimeout(() => {
                this.ocultarLoadingScreen();
                this.iniciarAnimacionEntrada();

                // FORZAR VISIBILIDAD DESPUÉS DE CARGAR
                setTimeout(() => {
                    this.forzarVisibilidadCupones();
                }, 500);
            }, 1500);

        } catch (error) {
            console.error('❌ Error iniciando sistema de cupones:', error);
            this.ocultarLoadingScreen();
            this.mostrarToast('Error al cargar el sistema de cupones', 'error');
        }
    }

    // ==================== AUTENTICACIÓN Y DATOS USUARIO ====================

    async verificarAutenticacion() {
        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
        const token = localStorage.getItem('token');

        if (!userSession || !token) {
            console.log('❌ No hay sesión activa, redirigiendo a login...');
            window.location.href = '/login';
            return;
        }

        try {
            this.usuarioActual = JSON.parse(userSession);
            console.log('✅ Usuario autenticado:', this.usuarioActual);
        } catch (error) {
            console.error('❌ Error parseando sesión:', error);
            window.location.href = '/login';
        }
    }

    async cargarDatosUsuario() {
        if (this.usuarioActual?.user) {
            const userData = this.usuarioActual.user;
            this.tipoUsuario = (userData.tipousuario || userData.tipoUsuario || 'COMPRADOR').toUpperCase();

            console.log(`👤 Tipo de usuario: ${this.tipoUsuario}`);

            // Configurar atributo en body para CSS
            document.body.setAttribute('data-user-type', this.tipoUsuario);

            // Actualizar nombre en perfil si existe
            const perfilBtn = document.querySelector('.profile-btn span:last-child');
            if (perfilBtn) {
                perfilBtn.textContent = userData.nombre || 'Usuario';
            }
        }
    }

    // ==================== CARGA DE DATOS ACTUALIZADA CON API REAL ====================

    async cargarCupones() {
        try {
            console.log('📥 Cargando cupones desde API...');

            let endpoint;
            if (this.tipoUsuario === 'VENDEDOR') {
                // Para vendedores: sus propios cupones
                endpoint = `${this.apiBaseURL}/vendedor/${this.usuarioActual.user.id}`;
            } else {
                // Para compradores: cupones válidos disponibles
                endpoint = `${this.apiBaseURL}/validos`;
            }

            console.log(`🔗 Endpoint: ${endpoint}`);
            console.log(`👤 Tipo Usuario: ${this.tipoUsuario}`);

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`📡 Respuesta API Status: ${response.status}`);

            if (response.ok) {
                this.cupones = await response.json();
                console.log(`✅ ${this.cupones.length} cupones cargados desde API`);
                console.log('📋 Cupones data:', this.cupones);

                // Procesar cupones para añadir estado calculado
                this.cupones = this.cupones.map(cupon => ({
                    ...cupon,
                    estadoCalculado: this.calcularEstadoCupon(cupon)
                }));

                console.log('🔄 Cupones procesados con estados:', this.cupones);

                this.aplicarFiltros();

                if (this.tipoUsuario === 'VENDEDOR') {
                    await this.cargarEstadisticasCompletas();
                    this.actualizarEstadisticas();
                    console.log('📊 Estadísticas de vendedor actualizadas');
                }
            } else {
                const errorText = await response.text();
                console.error(`❌ Error API: ${response.status} - ${errorText}`);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error cargando cupones desde API:', error);
            this.cupones = [];

            // Mostrar datos de prueba si hay error de API
            this.mostrarDatosDePrueba();

            this.mostrarToast(`Error de conexión con API. Mostrando datos de prueba.`, 'warning');
        }
    }

    // Función para mostrar datos de prueba cuando falla la API
    mostrarDatosDePrueba() {
        console.log('🧪 Mostrando datos de prueba...');

        this.cupones = [
            {
                id: 1,
                codigo: 'DESCUENTO20',
                tipo: 'PORCENTAJE',
                valor: 20,
                descripcion: 'Descuento del 20% en toda la tienda',
                fechainicio: new Date().toISOString(),
                fechavencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                usosmaximo: 100,
                usosactuales: 25,
                activo: true,
                estadoCalculado: 'activo'
            },
            {
                id: 2,
                codigo: 'VERANO2025',
                tipo: 'MONTO_FIJO',
                valor: 15000,
                descripcion: 'Descuento fijo de $15.000 en compras superiores a $50.000',
                fechainicio: new Date().toISOString(),
                fechavencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                usosmaximo: 50,
                usosactuales: 45,
                activo: true,
                estadoCalculado: 'proximo-vencer'
            },
            {
                id: 3,
                codigo: 'PRIMERAVEZ',
                tipo: 'PORCENTAJE',
                valor: 15,
                descripcion: 'Descuento especial para nuevos clientes',
                fechainicio: new Date().toISOString(),
                fechavencimiento: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                usosmaximo: 200,
                usosactuales: 180,
                activo: true,
                estadoCalculado: 'activo'
            }
        ];

        this.aplicarFiltros();

        if (this.tipoUsuario === 'VENDEDOR') {
            this.actualizarEstadisticas();
        }
    }

    // Función para verificar conexión API
    async verificarConexionAPI() {
        try {
            console.log('🔍 Verificando conexión con API...');
            const response = await fetch(`${this.apiBaseURL.replace('/cupones', '')}/cupones/validos`, {
                method: 'HEAD',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log(`✅ API Status: ${response.status}`);
            return response.ok;
        } catch (error) {
            console.error('❌ Error verificando API:', error);
            return false;
        }
    }

// Función mejorada para crear cupón con validación completa
    async guardarCupon(e) {
        e.preventDefault();

        console.log('💾 Iniciando proceso de guardado de cupón...');

        // Verificar conexión API primero
        const apiConnected = await this.verificarConexionAPI();
        if (!apiConnected) {
            this.mostrarToast('Error de conexión con el servidor', 'error');
            return;
        }

        // Validar formulario
        const formData = this.obtenerDatosFormulario();
        console.log('📝 Datos del formulario:', formData);

        if (!this.validarFormulario(formData)) {
            return;
        }

        // Mostrar loading
        const btnGuardar = document.getElementById('btnGuardarCupon');
        const textoOriginal = btnGuardar.querySelector('.btn-text').textContent;

        btnGuardar.classList.add('loading');
        btnGuardar.querySelector('.btn-text').style.display = 'none';
        btnGuardar.querySelector('.btn-loader').style.display = 'block';
        btnGuardar.disabled = true;

        try {
            let response;
            let endpoint;
            let method;

            if (this.editandoCupon) {
                // Actualizar cupón existente
                endpoint = `${this.apiBaseURL}/${this.editandoCupon}`;
                method = 'PUT';
                console.log(`🔄 Actualizando cupón ID: ${this.editandoCupon}`);
            } else {
                // Crear nuevo cupón
                endpoint = this.apiBaseURL;
                method = 'POST';
                console.log('✨ Creando nuevo cupón');
            }

            console.log(`📡 ${method} ${endpoint}`);
            console.log('📤 Enviando datos:', formData);

            response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log(`📡 Respuesta: ${response.status}`);

            if (response.ok) {
                const cuponGuardado = await response.json();
                console.log('✅ Cupón guardado:', cuponGuardado);

                const accion = this.editandoCupon ? 'actualizado' : 'creado';
                this.mostrarToast(`Cupón ${accion} exitosamente`, 'success');

                this.cerrarModal('modalCupon');

                // Recargar cupones y estadísticas
                await this.cargarCupones();

                if (this.tipoUsuario === 'VENDEDOR') {
                    await this.cargarEstadisticasCompletas();
                    this.actualizarEstadisticas();
                }

                // Limpiar cache de estadísticas para forzar recarga
                this.estadisticasCache = null;

            } else {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                console.error('❌ Error del servidor:', errorData);
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error guardando cupón en API:', error);
            this.mostrarToast(`Error al guardar cupón: ${error.message}`, 'error');
        } finally {
            // Restaurar botón
            btnGuardar.classList.remove('loading');
            btnGuardar.querySelector('.btn-text').style.display = 'inline';
            btnGuardar.querySelector('.btn-loader').style.display = 'none';
            btnGuardar.querySelector('.btn-text').textContent = textoOriginal;
            btnGuardar.disabled = false;
        }
    }

    // ==================== CARGA DE ESTADÍSTICAS COMPLETAS ====================

    async cargarEstadisticasCompletas() {
        try {
            const vendedorId = this.usuarioActual.user.id;

            // Cargar múltiples endpoints en paralelo para estadísticas completas
            const [
                cuponesActivosResponse,
                contadorResponse,
                proximosVencerResponse
            ] = await Promise.all([
                fetch(`${this.apiBaseURL}/vendedor/${vendedorId}/activos`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(`${this.apiBaseURL}/vendedor/${vendedorId}/contador`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(`${this.apiBaseURL}/vendedor/${vendedorId}/proximos-vencer?dias=7`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            if (cuponesActivosResponse.ok && contadorResponse.ok && proximosVencerResponse.ok) {
                const cuponesActivos = await cuponesActivosResponse.json();
                const contadorData = await contadorResponse.json();
                const proximosVencer = await proximosVencerResponse.json();

                this.estadisticasCache = {
                    cuponesActivos,
                    contadorData,
                    proximosVencer,
                    fechaActualizacion: new Date()
                };

                console.log('✅ Estadísticas completas cargadas desde API');
            }
        } catch (error) {
            console.error('❌ Error cargando estadísticas completas:', error);
        }
    }

    calcularEstadoCupon(cupon) {
        const ahora = new Date();
        const fechaInicio = new Date(cupon.fechainicio);
        const fechaVencimiento = new Date(cupon.fechavencimiento);

        if (!cupon.activo) {
            return 'inactivo';
        }

        if (cupon.usosactuales >= cupon.usosmaximo) {
            return 'agotado';
        }

        if (ahora < fechaInicio) {
            return 'pendiente';
        }

        if (ahora > fechaVencimiento) {
            return 'vencido';
        }

        // Próximo a vencer (menos de 7 días)
        const diferenciaDias = (fechaVencimiento - ahora) / (1000 * 60 * 60 * 24);
        if (diferenciaDias <= 7) {
            return 'proximo-vencer';
        }

        return 'activo';
    }

    // ==================== GUARDADO DE CUPONES CON API REAL ====================

    async guardarCupon(e) {
        e.preventDefault();

        // Validar formulario
        const formData = this.obtenerDatosFormulario();
        if (!this.validarFormulario(formData)) {
            return;
        }

        // Mostrar loading
        const btnGuardar = document.getElementById('btnGuardarCupon');
        const textoOriginal = btnGuardar.querySelector('.btn-text').textContent;

        btnGuardar.classList.add('loading');
        btnGuardar.querySelector('.btn-text').style.display = 'none';
        btnGuardar.querySelector('.btn-loader').style.display = 'block';
        btnGuardar.disabled = true;

        try {
            let response;
            let endpoint;
            let method;

            if (this.editandoCupon) {
                // Actualizar cupón existente
                endpoint = `${this.apiBaseURL}/${this.editandoCupon}`;
                method = 'PUT';
            } else {
                // Crear nuevo cupón
                endpoint = this.apiBaseURL;
                method = 'POST';
            }

            response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const cuponGuardado = await response.json();

                const accion = this.editandoCupon ? 'actualizado' : 'creado';
                this.mostrarToast(`Cupón ${accion} exitosamente`, 'success');

                this.cerrarModal('modalCupon');

                // Recargar cupones y estadísticas
                await this.cargarCupones();

                if (this.tipoUsuario === 'VENDEDOR') {
                    await this.cargarEstadisticasCompletas();
                    this.actualizarEstadisticas();
                }

                // Limpiar cache de estadísticas para forzar recarga
                this.estadisticasCache = null;

            } else {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error guardando cupón en API:', error);
            this.mostrarToast(`Error al guardar cupón: ${error.message}`, 'error');
        } finally {
            // Restaurar botón
            btnGuardar.classList.remove('loading');
            btnGuardar.querySelector('.btn-text').style.display = 'inline';
            btnGuardar.querySelector('.btn-loader').style.display = 'none';
            btnGuardar.querySelector('.btn-text').textContent = textoOriginal;
            btnGuardar.disabled = false;
        }
    }
    
    obtenerDatosFormulario() {
        return {
            codigo: document.getElementById('cuponCodigo').value.trim().toUpperCase(),
            tipo: document.getElementById('cuponTipo').value,
            valor: parseFloat(document.getElementById('cuponValor').value),
            usosmaximo: parseInt(document.getElementById('cuponUsosMaximo').value),
            descripcion: document.getElementById('cuponDescripcion').value.trim(),
            fechainicio: new Date(document.getElementById('cuponFechaInicio').value).toISOString(),
            fechavencimiento: new Date(document.getElementById('cuponFechaVencimiento').value).toISOString(),
            activo: true,
            usosactuales: 0,
            creador: { id: this.usuarioActual.user.id }
        };
    }


    // ==================== ESTADÍSTICAS MEJORADAS CON API REAL ====================

    async mostrarEstadisticasDetalladas() {
        if (this.tipoUsuario !== 'VENDEDOR') {
            this.mostrarToast('Función disponible solo para vendedores', 'warning');
            return;
        }

        try {
            // Mostrar loading mientras carga
            this.mostrarToast('Cargando estadísticas detalladas...', 'info');

            // Cargar estadísticas actualizadas desde API
            await this.cargarEstadisticasCompletas();

            const stats = this.calcularEstadisticasDetalladas();

            const modal = document.getElementById('modalDetalleCupon');
            const content = document.getElementById('detalleContent');

            content.innerHTML = `
                <div class="estadisticas-detalladas-premium">
                    <div class="stats-header-premium">
                        <div class="stats-title-section">
                            <h3>📊 Dashboard de Estadísticas Avanzadas</h3>
                            <p>Análisis completo y en tiempo real del rendimiento de tus cupones</p>
                        </div>
                        <div class="stats-refresh">
                            <button class="refresh-btn" onclick="cuponesManager.refrescarEstadisticas()">
                                <span>🔄</span> Actualizar
                            </button>
                        </div>
                    </div>

                    <!-- KPIs Principales -->
                    <div class="kpis-grid-premium">
                        <div class="kpi-card primary">
                            <div class="kpi-icon">🎯</div>
                            <div class="kpi-content">
                                <div class="kpi-number" data-count="${stats.tasaUso}">${stats.tasaUso}%</div>
                                <div class="kpi-label">Tasa de Utilización</div>
                                <div class="kpi-trend ${stats.tendenciaUso >= 0 ? 'positive' : 'negative'}">
                                    ${stats.tendenciaUso >= 0 ? '📈' : '📉'} ${Math.abs(stats.tendenciaUso)}%
                                </div>
                            </div>
                        </div>
                        
                        <div class="kpi-card success">
                            <div class="kpi-icon">💰</div>
                            <div class="kpi-content">
                                <div class="kpi-number">$${stats.ahorroTotal.toLocaleString('es-ES')}</div>
                                <div class="kpi-label">Ahorro Total Generado</div>
                                <div class="kpi-sublabel">Promedio: $${stats.ahorroPromedio.toLocaleString('es-ES')}</div>
                            </div>
                        </div>
                        
                        <div class="kpi-card warning">
                            <div class="kpi-icon">⚡</div>
                            <div class="kpi-content">
                                <div class="kpi-number">${stats.cuponMasEficiente?.codigo || 'N/A'}</div>
                                <div class="kpi-label">Cupón Más Eficiente</div>
                                <div class="kpi-sublabel">${stats.cuponMasEficiente?.usosactuales || 0} usos</div>
                            </div>
                        </div>
                        
                        <div class="kpi-card danger ${stats.alertasUrgentes > 0 ? 'pulsing' : ''}">
                            <div class="kpi-icon">🚨</div>
                            <div class="kpi-content">
                                <div class="kpi-number">${stats.alertasUrgentes}</div>
                                <div class="kpi-label">Alertas Urgentes</div>
                                <div class="kpi-sublabel">${stats.proximosVencer} próximos a vencer</div>
                            </div>
                        </div>
                    </div>

                    <!-- Gráficos y Análisis -->
                        <div class="analytics-section">
                            <div class="analytics-grid">
                                <!-- Distribución por Tipo -->
                                <div class="chart-container">
                                <h4>📊 Distribución por Tipo de Cupón</h4>
                                <div class="chart-container">
                                <h4>📊 Distribución por Tipo de Cupón</h4>
                                <div class="chart-content">
                                    <div class="pie-visual-container">
                                        <div class="pie-chart-visual"></div>
                                    </div>
                                    <div class="chart-legend">
                                        <div class="legend-item">
                                            <span class="legend-color porcentaje"></span>
                                            <span>Porcentaje (${stats.cuponesPorcentaje})</span>
                                            <strong>${stats.porcentajePorcentaje.toFixed(1)}%</strong>
                                        </div>
                                        <div class="legend-item">
                                            <span class="legend-color monto-fijo"></span>
                                            <span>Monto Fijo (${stats.cuponesMontoFijo})</span>
                                            <strong>${stats.porcentajeMontoFijo.toFixed(1)}%</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Continúa con el chart de barras como alternativa -->
                            <div class="chart-container">
                                <h4>📈 Vista Detallada por Barras</h4>
                                <div class="chart-content">
                                    <div class="bar-chart-simple">
                                            <div class="chart-bar-item">
                                                <div class="bar-info">
                                                    <span class="bar-label">Porcentaje</span>
                                                    <span class="bar-value">${stats.cuponesPorcentaje} cupones</span>
                                                    <span class="bar-percentage">${stats.porcentajePorcentaje.toFixed(1)}%</span>
                                                </div>
                                                <div class="bar-container">
                                                    <div class="bar-fill porcentaje" style="width: ${stats.porcentajePorcentaje}%"></div>
                                                </div>
                                            </div>
                                            <div class="chart-bar-item">
                                                <div class="bar-info">
                                                    <span class="bar-label">Monto Fijo</span>
                                                    <span class="bar-value">${stats.cuponesMontoFijo} cupones</span>
                                                    <span class="bar-percentage">${stats.porcentajeMontoFijo.toFixed(1)}%</span>
                                                </div>
                                                <div class="bar-container">
                                                    <div class="bar-fill monto-fijo" style="width: ${stats.porcentajeMontoFijo}%"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            <!-- Estado de Cupones -->
                            <div class="chart-container">
                                <h4>🔥 Estado de Cupones</h4>
                                <div class="status-chart">
                                    ${Object.entries(stats.distribucionEstados).map(([estado, cantidad]) => `
                                        <div class="status-bar-item">
                                            <div class="status-info">
                                                <span class="status-indicator estado-${estado}"></span>
                                                <span class="status-label">${this.getEstadoTexto(estado)}</span>
                                                <span class="status-count">${cantidad}</span>
                                            </div>
                                            <div class="status-bar">
                                                <div class="status-bar-fill estado-${estado}" style="width: ${(cantidad/stats.total)*100}%"></div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Top Performers -->
                        <div class="top-performers">
                            <h4>🏆 Top 5 Cupones Más Exitosos</h4>
                            <div class="performers-list">
                                ${stats.topCupones.map((cupon, index) => `
                                    <div class="performer-item">
                                        <div class="performer-rank">#${index + 1}</div>
                                        <div class="performer-info">
                                            <div class="performer-code">${cupon.codigo}</div>
                                            <div class="performer-stats">
                                                <span>${cupon.usosactuales}/${cupon.usosmaximo} usos</span>
                                                <span class="performer-efficiency">${((cupon.usosactuales/cupon.usosmaximo)*100).toFixed(1)}% eficiencia</span>
                                            </div>
                                        </div>
                                        <div class="performer-value">
                                            ${cupon.tipo === 'PORCENTAJE' ? `${cupon.valor}%` : `$${cupon.valor.toLocaleString('es-ES')}`}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Insights y Recomendaciones AI -->
                    <div class="insights-section">
                        <h4>🤖 Insights Inteligentes & Recomendaciones</h4>
                        <div class="insights-grid">
                            <div class="insight-card">
                                <div class="insight-icon">💡</div>
                                <div class="insight-content">
                                    <h5>Optimización de Rendimiento</h5>
                                    <ul class="insight-list">
                                        ${stats.recomendaciones.slice(0, 3).map(rec => `<li>${rec}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="insight-card">
                                <div class="insight-icon">📈</div>
                                <div class="insight-content">
                                    <h5>Oportunidades de Crecimiento</h5>
                                    <div class="opportunity-item">
                                        <span>Potencial de conversión:</span>
                                        <strong>${stats.potencialConversion}%</strong>
                                    </div>
                                    <div class="opportunity-item">
                                        <span>Valor estimado adicional:</span>
                                        <strong>$${stats.valorPotencial.toLocaleString('es-ES')}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Acciones Rápidas -->
                    <div class="quick-actions">
                        <h4>⚡ Acciones Rápidas</h4>
                        <div class="quick-actions-grid">
                            <button class="quick-action-btn" onclick="cuponesManager.crearCuponInteligente()">
                                <span>🎯</span> Crear Cupón Inteligente
                            </button>
                            <button class="quick-action-btn" onclick="cuponesManager.extenderVigencia()">
                                <span>⏰</span> Extender Vigencias
                            </button>
                            <button class="quick-action-btn" onclick="cuponesManager.duplicarMejores()">
                                <span>🔄</span> Duplicar Mejores
                            </button>
                            <button class="quick-action-btn" onclick="cuponesManager.exportarReporte()">
                                <span>📊</span> Exportar Reporte
                            </button>
                        </div>
                    </div>
                </div>
            `;

            this.abrirModal('modalDetalleCupon');

            // Animar números y elementos
            this.animarKPIs();
            this.animarGraficos();

        } catch (error) {
            console.error('❌ Error mostrando estadísticas detalladas:', error);
            this.mostrarToast('Error al cargar estadísticas detalladas', 'error');
        }
    }

    calcularEstadisticasDetalladas() {
        const total = this.cupones.length;
        const totalUsos = this.cupones.reduce((sum, c) => sum + c.usosactuales, 0);
        const maxUsosPosibles = this.cupones.reduce((sum, c) => sum + c.usosmaximo, 0);

        const tasaUso = maxUsosPosibles > 0 ? Math.round((totalUsos / maxUsosPosibles) * 100) : 0;

        // Top cupones por eficiencia
        const topCupones = [...this.cupones]
            .filter(c => c.usosactuales > 0)
            .sort((a, b) => (b.usosactuales / b.usosmaximo) - (a.usosactuales / a.usosmaximo))
            .slice(0, 5);

        // Cupón más eficiente
        const cuponMasEficiente = topCupones[0] || null;

        // Cálculo de ahorro total y promedio
        const ahorroTotal = this.cupones.reduce((sum, cupon) => {
            if (cupon.tipo === 'MONTO_FIJO') {
                return sum + (cupon.valor * cupon.usosactuales);
            } else {
                // Estimación para porcentajes (asumiendo compra promedio de $150)
                return sum + (150 * (cupon.valor / 100) * cupon.usosactuales);
            }
        }, 0);

        const ahorroPromedio = totalUsos > 0 ? ahorroTotal / totalUsos : 0;

        // Próximos a vencer usando datos de API si están disponibles
        const proximosVencer = this.estadisticasCache?.proximosVencer?.length ||
            this.cupones.filter(c => {
                const fechaVencimiento = new Date(c.fechavencimiento);
                const ahora = new Date();
                const diferenciaDias = (fechaVencimiento - ahora) / (1000 * 60 * 60 * 24);
                return diferenciaDias <= 7 && diferenciaDias > 0 && c.activo;
            }).length;

        // Distribución por tipo
        const cuponesPorcentaje = this.cupones.filter(c => c.tipo === 'PORCENTAJE').length;
        const cuponesMontoFijo = this.cupones.filter(c => c.tipo === 'MONTO_FIJO').length;
        const porcentajePorcentaje = total > 0 ? (cuponesPorcentaje / total) * 100 : 0;
        const porcentajeMontoFijo = total > 0 ? (cuponesMontoFijo / total) * 100 : 0;

        // Distribución por estados
        const distribucionEstados = {};
        this.cupones.forEach(cupon => {
            const estado = cupon.estadoCalculado;
            distribucionEstados[estado] = (distribucionEstados[estado] || 0) + 1;
        });

        // Alertas urgentes
        const alertasUrgentes = proximosVencer +
            this.cupones.filter(c => c.usosactuales >= c.usosmaximo * 0.9).length;

        // Tendencia de uso (simulada - en producción usarías datos históricos)
        const tendenciaUso = Math.floor(Math.random() * 20) - 10; // -10 a +10

        // Potencial de conversión y valor
        const potencialConversion = Math.min(100, tasaUso + 25);
        const valorPotencial = ahorroTotal * 1.5;

        // Generar recomendaciones inteligentes
        const recomendaciones = this.generarRecomendacionesIA(tasaUso, proximosVencer, distribucionEstados, topCupones);

        return {
            total,
            tasaUso,
            tendenciaUso,
            cuponMasEficiente,
            ahorroTotal,
            ahorroPromedio,
            proximosVencer,
            alertasUrgentes,
            cuponesPorcentaje,
            cuponesMontoFijo,
            porcentajePorcentaje,
            porcentajeMontoFijo,
            distribucionEstados,
            topCupones,
            potencialConversion,
            valorPotencial,
            recomendaciones
        };
    }

    generarRecomendacionesIA(tasaUso, proximosVencer, distribucionEstados, topCupones) {
        const recomendaciones = [];

        if (tasaUso < 30) {
            recomendaciones.push('🎯 Considera crear cupones con valores más atractivos para aumentar la tasa de uso');
            recomendaciones.push('📢 Implementa campañas de marketing más agresivas para tus cupones');
        } else if (tasaUso > 80) {
            recomendaciones.push('🚀 ¡Excelente! Tus cupones tienen alta demanda. Considera crear más similares');
        }

        if (proximosVencer > 0) {
            recomendaciones.push(`⏰ Tienes ${proximosVencer} cupones próximos a vencer. Envía notificaciones urgentes`);
            recomendaciones.push('📧 Configura email marketing automático para cupones próximos a expirar');
        }

        if (topCupones.length > 0) {
            const mejorCupon = topCupones[0];
            recomendaciones.push(`🏆 Tu cupón "${mejorCupon.codigo}" es muy exitoso. Crea variaciones similares`);
        }

        if (distribucionEstados.agotado > distribucionEstados.activo) {
            recomendaciones.push('📈 Muchos cupones agotados indica alta demanda. Aumenta los límites de uso');
        }

        if (recomendaciones.length === 0) {
            recomendaciones.push('✨ Tu gestión de cupones es óptima. Mantén el excelente trabajo');
            recomendaciones.push('🔄 Considera experimentar con nuevos tipos de descuentos');
        }

        return recomendaciones;
    }

    animarKPIs() {
        // Animar números de KPIs
        document.querySelectorAll('.kpi-number[data-count]').forEach(element => {
            const targetValue = parseInt(element.dataset.count);
            const obj = { value: 0 };

            gsap.to(obj, {
                value: targetValue,
                duration: 2,
                ease: "power2.out",
                onUpdate: () => {
                    element.textContent = Math.round(obj.value) + '%';
                }
            });
        });

        // Animar cards con stagger
        const kpiCards = document.querySelectorAll('.kpi-card');
        if (kpiCards.length > 0) {
            gsap.fromTo(kpiCards,
                { y: 30, opacity: 0, scale: 0.9 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "back.out(1.7)"
                }
            );
        }
    }

    animarGraficos() {
        // Animar barras de estado
        const statusBars = document.querySelectorAll('.status-bar-fill');
        if (statusBars.length > 0) {
            gsap.fromTo(statusBars,
                { width: '0%' },
                {
                    width: function(index, element) {
                        return element.style.width || '0%';
                    },
                    duration: 1,
                    stagger: 0.2,
                    ease: "power2.out"
                }
            );
        }

        // Animar barras del chart
        const bars = document.querySelectorAll('.bar-fill');
        if (bars.length > 0) {
            gsap.fromTo(bars,
                { width: '0%' },
                {
                    width: function(index, element) {
                        return element.style.width || '0%';
                    },
                    duration: 1.5,
                    stagger: 0.3,
                    ease: "power2.out"
                }
            );
        }

        console.log('✅ Animaciones de gráficos aplicadas');
    }

    async refrescarEstadisticas() {
        try {
            this.mostrarToast('Actualizando estadísticas...', 'info');

            // Limpiar cache
            this.estadisticasCache = null;

            // Recargar datos
            await this.cargarCupones();

            // Mostrar estadísticas actualizadas
            this.mostrarEstadisticasDetalladas();

            this.mostrarToast('Estadísticas actualizadas correctamente', 'success');
        } catch (error) {
            console.error('❌ Error refrescando estadísticas:', error);
            this.mostrarToast('Error al actualizar estadísticas', 'error');
        }
    }

    // ==================== ACCIONES INTELIGENTES ====================

    async crearCuponInteligente() {
        try {
            // Analizar cupones exitosos para sugerir valores
            const cuponesExitosos = this.cupones.filter(c =>
                (c.usosactuales / c.usosmaximo) > 0.7 && c.estadoCalculado === 'activo'
            );

            let sugerencias = {
                tipo: 'PORCENTAJE',
                valor: 20,
                usosMaximo: 100
            };

            if (cuponesExitosos.length > 0) {
                const promedioValor = cuponesExitosos.reduce((sum, c) => sum + c.valor, 0) / cuponesExitosos.length;
                const promedioUsos = cuponesExitosos.reduce((sum, c) => sum + c.usosmaximo, 0) / cuponesExitosos.length;

                sugerencias = {
                    tipo: cuponesExitosos[0].tipo,
                    valor: Math.round(promedioValor),
                    usosMaximo: Math.round(promedioUsos)
                };
            }

            // Cerrar modal de estadísticas
            this.cerrarModal('modalDetalleCupon');

            // Llenar formulario con sugerencias
            document.getElementById('cuponTipo').value = sugerencias.tipo;
            document.getElementById('cuponValor').value = sugerencias.valor;
            document.getElementById('cuponUsosMaximo').value = sugerencias.usosMaximo;

            // Generar código único
            const codigoSugerido = `SMART${Date.now().toString().slice(-6)}`;
            document.getElementById('cuponCodigo').value = codigoSugerido;

            // Establecer fechas por defecto
            const ahora = new Date();
            const vencimiento = new Date(ahora.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 días

            document.getElementById('cuponFechaInicio').value = this.formatDateTimeLocal(ahora);
            document.getElementById('cuponFechaVencimiento').value = this.formatDateTimeLocal(vencimiento);

            this.actualizarPreview();
            this.abrirModal('modalCupon');

            this.mostrarToast('Cupón inteligente configurado con base en tus mejores cupones', 'success');
        } catch (error) {
            console.error('❌ Error creando cupón inteligente:', error);
            this.mostrarToast('Error al crear cupón inteligente', 'error');
        }
    }

    async extenderVigencia() {
        try {
            const proximosVencer = this.cupones.filter(c => {
                const fechaVencimiento = new Date(c.fechavencimiento);
                const ahora = new Date();
                const diferenciaDias = (fechaVencimiento - ahora) / (1000 * 60 * 60 * 24);
                return diferenciaDias <= 7 && diferenciaDias > 0 && c.activo;
            });

            if (proximosVencer.length === 0) {
                this.mostrarToast('No hay cupones próximos a vencer', 'info');
                return;
            }

            const confirmacion = confirm(`¿Extender la vigencia de ${proximosVencer.length} cupones por 30 días?`);
            if (!confirmacion) return;

            let exitosos = 0;
            for (const cupon of proximosVencer) {
                try {
                    const nuevaFecha = new Date(cupon.fechavencimiento);
                    nuevaFecha.setDate(nuevaFecha.getDate() + 30);

                    const response = await fetch(`${this.apiBaseURL}/${cupon.id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            ...cupon,
                            fechavencimiento: nuevaFecha.toISOString()
                        })
                    });

                    if (response.ok) exitosos++;
                } catch (error) {
                    console.error(`Error extendiendo cupón ${cupon.codigo}:`, error);
                }
            }

            this.mostrarToast(`${exitosos} cupones extendidos exitosamente`, 'success');
            await this.cargarCupones();
            this.cerrarModal('modalDetalleCupon');
        } catch (error) {
            console.error('❌ Error extendiendo vigencias:', error);
            this.mostrarToast('Error al extender vigencias', 'error');
        }
    }

    async duplicarMejores() {
        try {
            const mejoresCupones = this.cupones
                .filter(c => (c.usosactuales / c.usosmaximo) > 0.5)
                .sort((a, b) => (b.usosactuales / b.usosmaximo) - (a.usosactuales / a.usosmaximo))
                .slice(0, 3);

            if (mejoresCupones.length === 0) {
                this.mostrarToast('No hay cupones con suficiente rendimiento para duplicar', 'info');
                return;
            }

            const confirmacion = confirm(`¿Duplicar los ${mejoresCupones.length} mejores cupones?`);
            if (!confirmacion) return;

            let exitosos = 0;
            for (const cupon of mejoresCupones) {
                try {
                    const nuevoCodigo = `${cupon.codigo}_DUP_${Date.now().toString().slice(-4)}`;
                    const ahora = new Date();
                    const vencimiento = new Date(ahora.getTime() + (30 * 24 * 60 * 60 * 1000));

                    const nuevoCupon = {
                        codigo: nuevoCodigo,
                        tipo: cupon.tipo,
                        valor: cupon.valor,
                        usosmaximo: cupon.usosmaximo,
                        descripcion: `${cupon.descripcion} (Duplicado)`,
                        fechainicio: ahora.toISOString(),
                        fechavencimiento: vencimiento.toISOString(),
                        activo: true,
                        usosactuales: 0,
                        creador: { id: this.usuarioActual.user.id }
                    };

                    const response = await fetch(this.apiBaseURL, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(nuevoCupon)
                    });

                    if (response.ok) exitosos++;
                } catch (error) {
                    console.error(`Error duplicando cupón ${cupon.codigo}:`, error);
                }
            }

            this.mostrarToast(`${exitosos} cupones duplicados exitosamente`, 'success');
            await this.cargarCupones();
            this.cerrarModal('modalDetalleCupon');
        } catch (error) {
            console.error('❌ Error duplicando mejores cupones:', error);
            this.mostrarToast('Error al duplicar cupones', 'error');
        }
    }

    async exportarReporte() {
        try {
            this.mostrarToast('Generando reporte avanzado...', 'info');

            const stats = this.calcularEstadisticasDetalladas();

            const reporte = {
                fecha_generacion: new Date().toISOString(),
                vendedor: {
                    id: this.usuarioActual.user.id,
                    nombre: this.usuarioActual.user.nombre
                },
                resumen_ejecutivo: {
                    total_cupones: stats.total,
                    tasa_utilizacion: stats.tasaUso,
                    ahorro_total_generado: stats.ahorroTotal,
                    alertas_urgentes: stats.alertasUrgentes
                },
                kpis: {
                    cupones_activos: this.cupones.filter(c => c.estadoCalculado === 'activo').length,
                    cupones_agotados: this.cupones.filter(c => c.estadoCalculado === 'agotado').length,
                    cupones_vencidos: this.cupones.filter(c => c.estadoCalculado === 'vencido').length,
                    proximos_vencer: stats.proximosVencer
                },
                top_performers: stats.topCupones.map(c => ({
                    codigo: c.codigo,
                    tipo: c.tipo,
                    valor: c.valor,
                    usos_actuales: c.usosactuales,
                    usos_maximo: c.usosmaximo,
                    eficiencia: ((c.usosactuales / c.usosmaximo) * 100).toFixed(2)
                })),
                distribucion_tipos: {
                    porcentaje: stats.cuponesPorcentaje,
                    monto_fijo: stats.cuponesMontoFijo
                },
                recomendaciones: stats.recomendaciones,
                cupones_detallados: this.cupones.map(c => ({
                    id: c.id,
                    codigo: c.codigo,
                    tipo: c.tipo,
                    valor: c.valor,
                    descripcion: c.descripcion,
                    estado: c.estadoCalculado,
                    fecha_creacion: c.fechacreacion,
                    fecha_inicio: c.fechainicio,
                    fecha_vencimiento: c.fechavencimiento,
                    usos_actuales: c.usosactuales,
                    usos_maximo: c.usosmaximo,
                    activo: c.activo
                }))
            };

            // Crear y descargar archivo
            const blob = new Blob([JSON.stringify(reporte, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte_cupones_avanzado_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.mostrarToast('Reporte avanzado exportado correctamente', 'success');
            this.cerrarModal('modalDetalleCupon');
        } catch (error) {
            console.error('❌ Error exportando reporte:', error);
            this.mostrarToast('Error al exportar reporte', 'error');
        }
    }

    // ==================== DESACTIVAR CUPÓN CON API ====================

    async desactivarCupon(cuponId) {
        if (!confirm('¿Estás seguro de desactivar este cupón? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseURL}/${cuponId}/desactivar`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.mostrarToast('Cupón desactivado correctamente', 'success');
                this.cerrarModal('modalDetalleCupon');

                // Recargar cupones
                await this.cargarCupones();

                if (this.tipoUsuario === 'VENDEDOR') {
                    await this.cargarEstadisticasCompletas();
                    this.actualizarEstadisticas();
                }
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Error desactivando cupón:', error);
            this.mostrarToast('Error al desactivar cupón', 'error');
        }
    }

    // ==================== RESTO DEL CÓDIGO ORIGINAL ====================
    // [Incluir aquí todas las demás funciones del código original que no necesitan modificación]

    mostrarLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';

            // Animación del spinner
            gsap.to('.loading-spinner-premium', {
                rotation: 360,
                duration: 1.5,
                repeat: -1,
                ease: "none"
            });

            // Animación del texto
            gsap.to('.loading-content p', {
                opacity: 0.6,
                duration: 1.5,
                yoyo: true,
                repeat: -1,
                ease: "power2.inOut"
            });
        }
    }

    ocultarLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            gsap.to(loadingScreen, {
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                onComplete: () => {
                    loadingScreen.style.display = 'none';
                }
            });
        }
    }

    setupAnimaciones() {
        gsap.registerPlugin(ScrollTrigger);

        // Configurar animaciones de entrada CONTENIDAS
        const container = document.querySelector('.cupones-container');
        let tl = null;
        if (container) {
            tl = gsap.timeline({ paused: true });

            tl.from('.hero-section', {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });

            // Contener todas las animaciones dentro del container
            ScrollTrigger.batch('.cupon-card', {
                onEnter: (elements) => {
                    gsap.fromTo(elements,
                        { y: 30, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" }
                    );
                },
                onLeave: (elements) => {
                    gsap.to(elements, { y: -30, opacity: 0, duration: 0.3 });
                },
                onEnterBack: (elements) => {
                    gsap.to(elements, { y: 0, opacity: 1, duration: 0.6 });
                },
                start: "top bottom-=100",
                end: "bottom top+=100"
            });
        }

        this.timelineSetup = tl;
    }

    iniciarAnimacionEntrada() {
        const tl = gsap.timeline();

        // 1. Animar header
        tl.from('.nav-header', {
            y: -100,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)"
        })

            // 2. Animar hero section
            .from('.hero-section', {
                scale: 0.9,
                opacity: 0,
                duration: 1,
                ease: "power2.out"
            }, "-=0.4")

            // 3. Animar motivation box
            .from('.motivation-box', {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "back.out(1.7)"
            }, "-=0.6")

            // 4. Animar stats dashboard si es vendedor
            .from('.stats-dashboard', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.4")

            // 5. Animar action section
            .from('.action-section', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.3")

            // 6. Animar cupones section
            .from('.cupones-section', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.3")

            // 7. Marcar como cargado
            .add(() => {
                document.querySelector('.cupones-container').classList.add('loaded');
            });
    }

    personalizarInterfaz() {
        // Personalizar botón de motivación según tipo de usuario
        const motivationBtn = document.getElementById('motivationBtn');
        if (motivationBtn) {
            if (this.tipoUsuario === 'VENDEDOR') {
                motivationBtn.querySelector('.btn-text').textContent = 'Administrar Cupones';
                motivationBtn.onclick = () => this.abrirModalCupon();
            } else {
                motivationBtn.querySelector('.btn-text').textContent = 'Explorar Productos';
                motivationBtn.onclick = () => window.location.href = '/categorias';
            }
        }

        // Personalizar título del motivation box
        const motivationText = document.querySelector('.motivation-text h3');
        if (motivationText) {
            if (this.tipoUsuario === 'VENDEDOR') {
                motivationText.textContent = '¡Gestiona tus cupones de forma inteligente!';
            } else {
                motivationText.textContent = '¡No te pierdas las mejores ofertas!';
            }
        }

        const motivationDesc = document.querySelector('.motivation-text p');
        if (motivationDesc) {
            if (this.tipoUsuario === 'VENDEDOR') {
                motivationDesc.textContent = 'Crea cupones atractivos y aumenta tus ventas';
            } else {
                motivationDesc.textContent = 'Explora nuestro catálogo y aprovecha estos cupones exclusivos';
            }
        }
    }

    // ==================== EVENT LISTENERS ====================

    setupEventListeners() {
        // Filtros
        document.getElementById('filtroTipo')?.addEventListener('change', (e) => {
            this.filtros.tipo = e.target.value;
            this.aplicarFiltros();
        });

        document.getElementById('filtroValor')?.addEventListener('input', (e) => {
            this.filtros.valor = e.target.value;
            this.aplicarFiltros();
        });

        document.getElementById('filtroEstado')?.addEventListener('change', (e) => {
            this.filtros.estado = e.target.value;
            this.aplicarFiltros();
        });

        document.getElementById('buscarCupon')?.addEventListener('input', (e) => {
            this.filtros.busqueda = e.target.value;
            this.aplicarFiltros();
        });

        // Reset filtros
        document.getElementById('resetFilters')?.addEventListener('click', () => {
            this.resetearFiltros();
        });

        // Crear cupón
        document.getElementById('btnCrearCupon')?.addEventListener('click', () => {
            this.abrirModalCupon();
        });

        // View controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const view = btn.dataset.view;
                this.currentView = view;

                const container = document.getElementById('cuponesContainer');
                container.className = `cupones-grid ${view === 'list' ? 'list-view' : ''}`;

                this.animarCambioVista();
            });
        });

        // Form cupón
        document.getElementById('formCupon')?.addEventListener('submit', (e) => {
            this.guardarCupon(e);
        });

        // Actualizar preview en tiempo real
        this.setupPreviewActualizacion();

        // FAB para vendedores
        this.setupFAB();

        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.cerrarModal(this.currentModal);
            }
        });

        // Cerrar modales clickeando fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.cerrarModal(modal.id);
                }
            });
        });
    }

    setupPreviewActualizacion() {
        const campos = ['cuponCodigo', 'cuponTipo', 'cuponValor', 'cuponDescripcion', 'cuponFechaVencimiento'];

        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) {
                elemento.addEventListener('input', () => {
                    this.actualizarPreview();
                });
            }
        });
    }

    setupFAB() {
        const fabMain = document.getElementById('fabMain');
        const fabContainer = document.querySelector('.fab-container');

        if (fabMain && fabContainer) {
            fabMain.addEventListener('click', () => {
                fabContainer.classList.toggle('active');
            });

            // Opciones del FAB
            document.querySelectorAll('.fab-option').forEach(option => {
                option.addEventListener('click', () => {
                    const action = option.dataset.action;
                    this.ejecutarAccionFAB(action);
                    fabContainer.classList.remove('active');
                });
            });
        }
    }

    ejecutarAccionFAB(action) {
        switch (action) {
            case 'crear':
                this.abrirModalCupon();
                break;
            case 'estadisticas':
                this.mostrarEstadisticasDetalladas();
                break;
            case 'exportar':
                this.exportarReporte();
                break;
        }
    }

    // ==================== FILTROS Y BÚSQUEDA ====================

    aplicarFiltros() {
        let filtrados = [...this.cupones];

        // Filtro por tipo
        if (this.filtros.tipo) {
            filtrados = filtrados.filter(cupon => cupon.tipo === this.filtros.tipo);
        }

        // Filtro por valor mínimo
        if (this.filtros.valor && this.filtros.valor > 0) {
            filtrados = filtrados.filter(cupon => cupon.valor >= parseFloat(this.filtros.valor));
        }

        // Filtro por estado
        if (this.filtros.estado) {
            filtrados = filtrados.filter(cupon => {
                switch (this.filtros.estado) {
                    case 'activo':
                        return cupon.estadoCalculado === 'activo';
                    case 'proximo-vencer':
                        return cupon.estadoCalculado === 'proximo-vencer';
                    case 'agotados':
                        return cupon.estadoCalculado === 'agotado';
                    default:
                        return true;
                }
            });
        }

        // Filtro por búsqueda
        if (this.filtros.busqueda) {
            const busqueda = this.filtros.busqueda.toLowerCase();
            filtrados = filtrados.filter(cupon =>
                cupon.codigo.toLowerCase().includes(busqueda) ||
                cupon.descripcion.toLowerCase().includes(busqueda)
            );
        }

        this.filteredCupones = filtrados;
        this.currentPage = 1;
        this.mostrarCupones();
        this.actualizarPaginacion();
    }

    resetearFiltros() {
        this.filtros = {
            tipo: '',
            valor: '',
            estado: '',
            busqueda: ''
        };

        // Limpiar inputs
        document.getElementById('filtroTipo').value = '';
        document.getElementById('filtroValor').value = '';
        document.getElementById('filtroEstado').value = '';
        document.getElementById('buscarCupon').value = '';

        this.aplicarFiltros();
        this.mostrarToast('Filtros limpiados', 'info');
    }

    // ==================== VISUALIZACIÓN DE CUPONES ====================

    mostrarCupones() {
        const container = document.getElementById('cuponesContainer');

        if (!container) {
            console.error('❌ Container de cupones no encontrado');
            return;
        }

        if (this.filteredCupones.length === 0) {
            this.mostrarEstadoVacio();
            return;
        }

        // Calcular cupones para la página actual
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const cuponesParaMostrar = this.filteredCupones.slice(startIndex, endIndex);

        console.log(`📋 Mostrando ${cuponesParaMostrar.length} cupones de ${this.filteredCupones.length} total`);

        // Generar HTML con validación
        const cuponesHTML = cuponesParaMostrar.map((cupon, index) => {
            try {
                return this.crearCuponCard(cupon, index);
            } catch (error) {
                console.error('❌ Error creando card de cupón:', error, cupon);
                return '';
            }
        }).filter(html => html !== '').join('');

        container.innerHTML = cuponesHTML;

        // FORZAR VISIBILIDAD DE CUPONES
        this.forzarVisibilidadCupones();

        // Configurar event listeners
        this.setupCuponEventListeners();

        // Animar entrada con delay
        setTimeout(() => {
            this.animarCupones();
        }, 100);
    }

    // ==================== FORZAR VISIBILIDAD DE CUPONES ====================

    forzarVisibilidadCupones() {
        console.log('🔧 Forzando visibilidad de cupones...');

        const cupones = document.querySelectorAll('.cupon-card');
        const container = document.getElementById('cuponesContainer');

        if (container) {
            container.style.opacity = '1';
            container.style.visibility = 'visible';
            container.style.display = 'grid';
        }

        cupones.forEach((cupon, index) => {
            cupon.style.opacity = '1';
            cupon.style.visibility = 'visible';
            cupon.style.display = 'block';
            cupon.style.position = 'relative';
            cupon.style.zIndex = '1';

            console.log(`✅ Card ${index + 1} forzada a ser visible`);
        });

        console.log(`🎯 ${cupones.length} cupones forzados a ser visibles`);
    }

    crearCuponCard(cupon, index) {
        // Validar datos del cupón
        if (!cupon || !cupon.id) {
            console.error('❌ Cupón inválido:', cupon);
            return '';
        }

        const fechaVencimiento = new Date(cupon.fechavencimiento || Date.now()).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const usosActuales = cupon.usosactuales || 0;
        const usosMaximo = cupon.usosmaximo || 1;
        const porcentajeUso = Math.round((usosActuales / usosMaximo) * 100);

        const valorFormateado = cupon.tipo === 'PORCENTAJE'
            ? `${cupon.valor || 0}%`
            : `$${(cupon.valor || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;

        const estadoClass = cupon.estadoCalculado || 'activo';
        const estadoTexto = this.getEstadoTexto(estadoClass);

        // Botones según tipo de usuario
        const botones = this.tipoUsuario === 'VENDEDOR'
            ? this.getBotonesVendedor(cupon)
            : this.getBotonesComprador(cupon);

        return `
            <div class="cupon-card ${estadoClass}" data-cupon-id="${cupon.id}">
                <div class="cupon-header">
                    <div class="cupon-codigo">${cupon.codigo}</div>
                    <div class="cupon-valor">${valorFormateado}</div>
                </div>
                
                <div class="cupon-descripcion">${cupon.descripcion}</div>
                
                <div class="cupon-info">
                    <div class="info-item">
                        <div class="info-label">Estado</div>
                        <div class="info-value">${estadoTexto}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Válido hasta</div>
                        <div class="info-value">${fechaVencimiento}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Usos</div>
                        <div class="info-value">${cupon.usosactuales}/${cupon.usosmaximo}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Disponibilidad</div>
                        <div class="info-value">${100 - porcentajeUso}%</div>
                    </div>
                </div>
                
                <div class="cupon-actions">
                    ${botones}
                </div>
            </div>
        `;
    }

    getBotonesVendedor(cupon) {
        const puedeEditar = cupon.estadoCalculado === 'activo' || cupon.estadoCalculado === 'pendiente';

        return `
            <button class="action-btn" onclick="cuponesManager.verDetalleCupon(${cupon.id})">
                <span>👁️</span> Ver
            </button>
            ${puedeEditar ? `
                <button class="action-btn" onclick="cuponesManager.editarCupon(${cupon.id})">
                    <span>✏️</span> Editar
                </button>
            ` : ''}
            <button class="action-btn" onclick="cuponesManager.duplicarCupon(${cupon.id})">
                <span>📋</span> Duplicar
            </button>
        `;
    }

    getBotonesComprador(cupon) {
        const puedeUsar = cupon.estadoCalculado === 'activo';

        return `
        <button class="action-btn primary" onclick="cuponesManager.copiarCodigo('${cupon.codigo}', event)" ${!puedeUsar ? 'disabled' : ''}>
            <span>📋</span> Copiar Código
        </button>
        <button class="action-btn" onclick="cuponesManager.verDetalleCupon(${cupon.id})">
            <span>👁️</span> Detalles
        </button>
    `;
    }

    getEstadoTexto(estado) {
        const estados = {
            'activo': 'Activo',
            'proximo-vencer': 'Próximo a vencer',
            'vencido': 'Vencido',
            'agotado': 'Agotado',
            'inactivo': 'Inactivo',
            'pendiente': 'Pendiente'
        };
        return estados[estado] || 'Sin estado';
    }

    setupCuponEventListeners() {
        // Click en card para ver detalles (evitar si se hace click en botones)
        document.querySelectorAll('.cupon-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.cupon-actions')) {
                    const cuponId = parseInt(card.dataset.cuponId);
                    this.verDetalleCupon(cuponId);
                }
            });
        });
    }

    animarCupones() {
        const cards = document.querySelectorAll('.cupon-card');

        if (cards.length > 0) {
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
        }
    }

    animarCambioVista() {
        const cards = document.querySelectorAll('.cupon-card');
        const container = document.getElementById('cuponesContainer');

        if (cards.length > 0 && container) {
            // Contener animaciones dentro del grid
            gsap.set(container, { overflow: 'hidden' });

            gsap.fromTo(cards,
                {
                    opacity: 0,
                    y: 20,
                    scale: 0.95
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: "power2.out",
                    onComplete: () => {
                        gsap.set(container, { overflow: 'visible' });
                    }
                }
            );
        }
    }

    mostrarEstadoVacio(titulo = 'No hay cupones disponibles', descripcion = 'No se encontraron cupones que coincidan con los filtros seleccionados') {
        const container = document.getElementById('cuponesContainer');

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎫</div>
                <h3>${titulo}</h3>
                <p>${descripcion}</p>
                ${this.tipoUsuario === 'VENDEDOR' ? `
                    <button class="create-coupon-btn" onclick="cuponesManager.abrirModalCupon()">
                        <span class="btn-icon">✨</span>
                        <span class="btn-text">Crear Primer Cupón</span>
                    </button>
                ` : ''}
            </div>
        `;

        // Animar estado vacío
        gsap.fromTo('.empty-state',
            { opacity: 0, y: 30, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
        );
    }

    // ==================== ESTADÍSTICAS (VENDEDORES) ====================

    actualizarEstadisticas() {
        if (this.tipoUsuario !== 'VENDEDOR') return;

        const stats = this.calcularEstadisticas();

        this.animarContador('totalCupones', stats.total);
        this.animarContador('cuponesActivos', stats.activos);
        this.animarContador('totalUsos', stats.totalUsos);
        this.animarContador('ahorroGenerado', stats.ahorroGenerado, '$');
    }

    calcularEstadisticas() {
        const total = this.cupones.length;
        const activos = this.cupones.filter(c => c.estadoCalculado === 'activo').length;
        const totalUsos = this.cupones.reduce((sum, c) => sum + c.usosactuales, 0);

        // Calcular ahorro generado (estimación basada en usos y valores)
        const ahorroGenerado = this.cupones.reduce((sum, cupon) => {
            if (cupon.tipo === 'MONTO_FIJO') {
                return sum + (cupon.valor * cupon.usosactuales);
            } else {
                // Para porcentajes, estimamos un valor promedio de compra de $100
                const valorEstimado = 100 * (cupon.valor / 100);
                return sum + (valorEstimado * cupon.usosactuales);
            }
        }, 0);

        return {
            total,
            activos,
            totalUsos,
            ahorroGenerado
        };
    }

    animarContador(elementId, valor, prefijo = '') {
        const elemento = document.getElementById(elementId);
        if (!elemento) return;

        const obj = { value: 0 };
        gsap.to(obj, {
            value: valor,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
                const displayValue = Math.round(obj.value);
                if (prefijo === '$') {
                    elemento.textContent = `$${displayValue.toLocaleString('es-ES')}`;
                } else {
                    elemento.textContent = displayValue.toString();
                }
            }
        });
    }

    // ==================== ACCIONES DE CUPONES ====================

    async copiarCodigo(codigo, event = null) {
        try {
            await navigator.clipboard.writeText(codigo);
            this.mostrarToast(`Código "${codigo}" copiado al portapapeles`, 'success');

            // Efecto visual en el botón
            if (event) {
                const btn = event.target.closest('.action-btn');
                if (btn) {
                    gsap.to(btn, {
                        scale: 1.1,
                        duration: 0.2,
                        yoyo: true,
                        repeat: 1,
                        ease: "power2.out"
                    });
                }
            }
        } catch (error) {
            console.error('Error copiando código:', error);
            this.mostrarToast('Error al copiar código', 'error');
        }
    }

    async verDetalleCupon(cuponId) {
        try {
            const cupon = this.cupones.find(c => c.id === cuponId);
            if (!cupon) {
                this.mostrarToast('Cupón no encontrado', 'error');
                return;
            }

            console.log(`🔍 Mostrando detalle del cupón ID: ${cuponId}`);

            // Usar datos locales directamente para evitar problemas de CORS
            this.mostrarModalDetalle(cupon);

            // Opcional: Intentar cargar datos adicionales en segundo plano
            try {
                const response = await fetch(`${this.apiBaseURL}/${cuponId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const cuponDetallado = await response.json();
                    // Actualizar modal si hay diferencias
                    if (JSON.stringify(cupon) !== JSON.stringify(cuponDetallado)) {
                        this.mostrarModalDetalle(cuponDetallado);
                    }
                }
            } catch (apiError) {
                console.log('ℹ️ Usando datos locales (API no disponible)');
            }
        } catch (error) {
            console.error('❌ Error cargando detalle:', error);
            this.mostrarToast('Error al cargar detalles del cupón', 'error');
        }
    }

    mostrarModalDetalle(cupon) {
        const modal = document.getElementById('modalDetalleCupon');
        const content = document.getElementById('detalleContent');

        const fechaCreacion = new Date(cupon.fechacreacion).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const fechaInicio = new Date(cupon.fechainicio).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const fechaVencimiento = new Date(cupon.fechavencimiento).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const porcentajeUso = Math.round((cupon.usosactuales / cupon.usosmaximo) * 100);
        const valorFormateado = cupon.tipo === 'PORCENTAJE'
            ? `${cupon.valor}%`
            : `$${cupon.valor.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;

        content.innerHTML = `
            <div class="detalle-cupon-premium">
                <div class="detalle-header">
                    <div class="cupon-grande">
                        <div class="cupon-codigo-grande">${cupon.codigo}</div>
                        <div class="cupon-valor-grande">${valorFormateado}</div>
                        <div class="cupon-tipo">${cupon.tipo === 'PORCENTAJE' ? 'Descuento Porcentual' : 'Descuento Fijo'}</div>
                    </div>
                </div>

                <div class="detalle-info-grid">
                    <div class="info-section">
                        <h4>📋 Información General</h4>
                        <div class="info-list">
                            <div class="info-row">
                                <span>Descripción:</span>
                                <span>${cupon.descripcion}</span>
                            </div>
                            <div class="info-row">
                                <span>Estado:</span>
                                <span class="estado-badge ${cupon.estadoCalculado}">${this.getEstadoTexto(cupon.estadoCalculado)}</span>
                            </div>
                            <div class="info-row">
                                <span>Creado:</span>
                                <span>${fechaCreacion}</span>
                            </div>
                        </div>
                    </div>

                    <div class="info-section">
                        <h4>📅 Vigencia</h4>
                        <div class="info-list">
                            <div class="info-row">
                                <span>Inicio:</span>
                                <span>${fechaInicio}</span>
                            </div>
                            <div class="info-row">
                                <span>Vencimiento:</span>
                                <span>${fechaVencimiento}</span>
                            </div>
                        </div>
                    </div>

                    <div class="info-section">
                        <h4>📊 Estadísticas de Uso</h4>
                        <div class="uso-stats">
                            <div class="stat-item">
                                <div class="stat-number">${cupon.usosactuales}</div>
                                <div class="stat-label">Usos Actuales</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">${cupon.usosmaximo}</div>
                                <div class="stat-label">Usos Máximos</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">${porcentajeUso}%</div>
                                <div class="stat-label">Utilización</div>
                            </div>
                        </div>
                        
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${porcentajeUso}%"></div>
                        </div>
                    </div>
                </div>

                <div class="detalle-actions">
                    ${this.tipoUsuario === 'COMPRADOR' && cupon.estadoCalculado === 'activo' ? `
                        <button class="action-btn primary large" onclick="cuponesManager.copiarCodigo('${cupon.codigo}', event)">
                            <span>📋</span> Copiar Código
                        </button>
                        <button class="action-btn large" onclick="window.location.href='/categorias'">
                            <span>🛍️</span> Ir a Comprar
                        </button>
                    ` : ''}
                    
                    ${this.tipoUsuario === 'VENDEDOR' ? `
                        <button class="action-btn primary large" onclick="cuponesManager.editarCupon(${cupon.id})">
                            <span>✏️</span> Editar Cupón
                        </button>
                        <button class="action-btn large" onclick="cuponesManager.duplicarCupon(${cupon.id})">
                            <span>📋</span> Duplicar
                        </button>
                        <button class="action-btn danger large" onclick="cuponesManager.desactivarCupon(${cupon.id})">
                            <span>🚫</span> Desactivar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        this.abrirModal('modalDetalleCupon');
    }

    async editarCupon(cuponId) {
        try {
            const cupon = this.cupones.find(c => c.id === cuponId);
            if (!cupon) {
                this.mostrarToast('Cupón no encontrado', 'error');
                return;
            }

            // Cerrar modal de detalle si está abierto
            this.cerrarModal('modalDetalleCupon');

            // Llenar formulario con datos del cupón
            this.llenarFormularioCupon(cupon);

            // Cambiar título del modal
            document.getElementById('modalTitle').textContent = 'Editar Cupón Premium';

            // Cambiar texto del botón
            const btnGuardar = document.getElementById('btnGuardarCupon');
            btnGuardar.querySelector('.btn-text').textContent = 'Actualizar Cupón';

            // Marcar como edición
            this.editandoCupon = cuponId;

            // Abrir modal
            this.abrirModal('modalCupon');
        } catch (error) {
            console.error('Error editando cupón:', error);
            this.mostrarToast('Error al editar cupón', 'error');
        }
    }

    llenarFormularioCupon(cupon) {
        // Llenar campos del formulario
        document.getElementById('cuponCodigo').value = cupon.codigo;
        document.getElementById('cuponTipo').value = cupon.tipo;
        document.getElementById('cuponValor').value = cupon.valor;
        document.getElementById('cuponUsosMaximo').value = cupon.usosmaximo;
        document.getElementById('cuponDescripcion').value = cupon.descripcion;

        // Formatear fechas para inputs datetime-local
        const fechaInicio = new Date(cupon.fechainicio);
        const fechaVencimiento = new Date(cupon.fechavencimiento);

        document.getElementById('cuponFechaInicio').value = this.formatDateTimeLocal(fechaInicio);
        document.getElementById('cuponFechaVencimiento').value = this.formatDateTimeLocal(fechaVencimiento);

        // Actualizar preview
        this.actualizarPreview();

        // Actualizar contador de caracteres
        this.actualizarContadorCaracteres();
    }

    formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    async duplicarCupon(cuponId) {
        try {
            const cupon = this.cupones.find(c => c.id === cuponId);
            if (!cupon) {
                this.mostrarToast('Cupón no encontrado', 'error');
                return;
            }

            // Cerrar modal de detalle
            this.cerrarModal('modalDetalleCupon');

            // Llenar formulario con datos del cupón
            this.llenarFormularioCupon(cupon);

            // Modificar código para que sea único
            const nuevoCodigo = `${cupon.codigo}_COPY_${Date.now()}`;
            document.getElementById('cuponCodigo').value = nuevoCodigo;

            // Cambiar título del modal
            document.getElementById('modalTitle').textContent = 'Duplicar Cupón Premium';

            // Cambiar texto del botón
            const btnGuardar = document.getElementById('btnGuardarCupon');
            btnGuardar.querySelector('.btn-text').textContent = 'Crear Copia';

            // Limpiar edición
            this.editandoCupon = null;

            // Actualizar preview
            this.actualizarPreview();

            // Abrir modal
            this.abrirModal('modalCupon');

            this.mostrarToast('Datos copiados. Modifica el código si es necesario', 'info');
        } catch (error) {
            console.error('Error duplicando cupón:', error);
            this.mostrarToast('Error al duplicar cupón', 'error');
        }
    }

    // ==================== GESTIÓN DEL MODAL ====================

    abrirModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        this.currentModal = modalId;
        modal.style.display = 'flex';

        // Animación de entrada
        gsap.fromTo(modal.querySelector('.modal-content'),
            {opacity: 0, scale: 0.7, y: -50},
            {opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)"}
        );

        // Prevenir scroll en body
        document.body.style.overflow = 'hidden';
    }

    cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Animación de salida
        gsap.to(modal.querySelector('.modal-content'), {
            opacity: 0,
            scale: 0.7,
            y: -50,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                modal.style.display = 'none';
                this.currentModal = null;

                // Limpiar formulario si es el modal de cupón
                if (modalId === 'modalCupon') {
                    this.limpiarFormularioCupon();
                }

                // Restaurar scroll en body
                document.body.style.overflow = '';
            }
        });
    }

    limpiarFormularioCupon() {
        const form = document.getElementById('formCupon');
        if (form) {
            form.reset();
        }

        // Limpiar preview
        document.getElementById('previewCodigo').textContent = 'CODIGO';
        document.getElementById('previewValor').textContent = '0%';
        document.getElementById('previewDescripcion').textContent = 'Descripción del cupón';
        document.getElementById('previewValidez').textContent = 'Válido hasta: --';

        // Resetear valores por defecto
        document.getElementById('valorIndicador').textContent = '$';
        document.getElementById('descripcionCounter').textContent = '0';

        // Limpiar banderas
        this.editandoCupon = null;

        // Resetear título y botón
        document.getElementById('modalTitle').textContent = 'Crear Cupón Premium';
        const btnGuardar = document.getElementById('btnGuardarCupon');
        btnGuardar.querySelector('.btn-text').textContent = 'Crear Cupón';
    }

    abrirModalCupon() {
        this.abrirModal('modalCupon');
    }

    // ==================== GESTIÓN DEL FORMULARIO ====================

    actualizarPreview() {
        const codigo = document.getElementById('cuponCodigo').value || 'CODIGO';
        const tipo = document.getElementById('cuponTipo').value;
        const valor = document.getElementById('cuponValor').value || 0;
        const descripcion = document.getElementById('cuponDescripcion').value || 'Descripción del cupón';
        const fechaVencimiento = document.getElementById('cuponFechaVencimiento').value;

        // Actualizar código
        document.getElementById('previewCodigo').textContent = codigo.toUpperCase();

        // Actualizar valor con formato correcto
        const valorFormateado = tipo === 'PORCENTAJE' ? `${valor}%` : `$${Number(valor).toLocaleString('es-ES')}`;
        document.getElementById('previewValor').textContent = valorFormateado;

        // Actualizar indicador en el input
        document.getElementById('valorIndicador').textContent = tipo === 'PORCENTAJE' ? '%' : '$';

        // Actualizar descripción
        document.getElementById('previewDescripcion').textContent = descripcion;

        // Actualizar fecha de validez
        if (fechaVencimiento) {
            const fecha = new Date(fechaVencimiento).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('previewValidez').textContent = `Válido hasta: ${fecha}`;
        } else {
            document.getElementById('previewValidez').textContent = 'Válido hasta: --';
        }
    }

    actualizarContadorCaracteres() {
        const descripcion = document.getElementById('cuponDescripcion').value;
        document.getElementById('descripcionCounter').textContent = descripcion.length;
    }

    validarFormulario(formData) {
        // Validar campos requeridos
        if (!formData.codigo || !formData.tipo || !formData.descripcion) {
            this.mostrarToast('Todos los campos marcados con * son obligatorios', 'warning');
            return false;
        }

        // Validar código (solo letras, números y guiones)
        const codigoRegex = /^[A-Z0-9_-]+$/;
        if (!codigoRegex.test(formData.codigo)) {
            this.mostrarToast('El código solo puede contener letras, números, guiones y guiones bajos', 'warning');
            return false;
        }

        // Validar valor
        if (isNaN(formData.valor) || formData.valor <= 0) {
            this.mostrarToast('El valor debe ser un número mayor a 0', 'warning');
            return false;
        }

        // Validar porcentaje
        if (formData.tipo === 'PORCENTAJE' && formData.valor > 100) {
            this.mostrarToast('El porcentaje no puede ser mayor a 100%', 'warning');
            return false;
        }

        // Validar usos máximos
        if (isNaN(formData.usosmaximo) || formData.usosmaximo <= 0) {
            this.mostrarToast('Los usos máximos deben ser un número mayor a 0', 'warning');
            return false;
        }

        // Validar fechas
        const fechaInicio = new Date(formData.fechainicio);
        const fechaVencimiento = new Date(formData.fechavencimiento);
        const ahora = new Date();

        if (fechaVencimiento <= fechaInicio) {
            this.mostrarToast('La fecha de vencimiento debe ser posterior a la fecha de inicio', 'warning');
            return false;
        }

        if (fechaVencimiento <= ahora) {
            this.mostrarToast('La fecha de vencimiento debe ser futura', 'warning');
            return false;
        }

        return true;
    }

    // ==================== PAGINACIÓN ====================

    actualizarPaginacion() {
        const container = document.getElementById('paginationContainer');
        if (!container) return;

        const totalPages = Math.ceil(this.filteredCupones.length / this.itemsPerPage);

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Botón anterior
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    data-page="prev" ${this.currentPage === 1 ? 'disabled' : ''}>
                ‹
            </button>
        `;

        // Páginas
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
        }

        // Botón siguiente
        paginationHTML += `
            <button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    data-page="next" ${this.currentPage === totalPages ? 'disabled' : ''}>
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

                this.mostrarCupones();
                this.actualizarPaginacion();
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

    // ==================== UTILIDADES ====================

    mostrarToast(mensaje, tipo = 'info') {
        // Crear contenedor si no existe
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container premium';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.textContent = mensaje;

        container.appendChild(toast);

        // Animar entrada
        gsap.fromTo(toast,
            { x: 400, opacity: 0, scale: 0.8 },
            { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
        );

        // Añadir clase show
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Eliminar después de 4 segundos
        setTimeout(() => {
            gsap.to(toast, {
                x: 400,
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    if (container.contains(toast)) {
                        container.removeChild(toast);
                    }
                }
            });
        }, 4000);
    }

    // ==================== DEBUG CUPONES ====================

    debugCupones() {
        console.log('🔍 DEBUG: Analizando estado de cupones...');

        const container = document.getElementById('cuponesContainer');
        console.log('Container:', container);
        console.log('Container styles:', window.getComputedStyle(container));

        const cards = document.querySelectorAll('.cupon-card');
        console.log(`Total cards encontradas: ${cards.length}`);

        cards.forEach((card, index) => {
            const styles = window.getComputedStyle(card);
            console.log(`Card ${index + 1}:`, {
                opacity: styles.opacity,
                visibility: styles.visibility,
                display: styles.display,
                zIndex: styles.zIndex,
                background: styles.background,
                position: styles.position
            });
        });

        console.log('Datos de cupones:', this.cupones);
        console.log('Cupones filtrados:', this.filteredCupones);
    }

}

// ==================== FUNCIONES GLOBALES ====================

// Funciones para cerrar modales desde HTML
function cerrarModalCupon() {
    if (window.cuponesManager) {
        window.cuponesManager.cerrarModal('modalCupon');
    }
}

function cerrarModalDetalle() {
    if (window.cuponesManager) {
        window.cuponesManager.cerrarModal('modalDetalleCupon');
    }
}

// ==================== INICIALIZACIÓN ====================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎫 Inicializando sistema de cupones premium con API integrada...');
    window.cuponesManager = new CuponesManager();
});

// Manejar cambios de ventana
window.addEventListener('resize', () => {
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
});

// Prevenir cierre accidental
window.addEventListener('beforeunload', (e) => {
    if (window.cuponesManager && window.cuponesManager.currentModal) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de salir?';
    }
});
