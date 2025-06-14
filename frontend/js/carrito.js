// carrito.js - Sistema completo integrado con API - VERSIÓN CORREGIDA
class CarritoApp {
    constructor() {
        // ✅ PREVENIR MÚLTIPLES INSTANCIAS
        if (window.carritoAppInstance) {
            console.log('⚠️ CarritoApp ya está inicializado, retornando instancia existente');
            return window.carritoAppInstance;
        }

        this.usuario = null;
        this.carritoItems = [];
        this.cuponAplicado = null;
        this.totales = {
            subtotal: 0,
            envio: 0,
            descuento: 0,
            total: 0
        };

        this.apiBaseURL = 'http://localhost:8080/api';
        this.envioGratis = 50000;
        this.costoEnvio = 5000;
        this.inicializado = false;
        this.listenersConfigurados = false;

        // ✅ MARCAR COMO INSTANCIA ÚNICA
        window.carritoAppInstance = this;

        this.init();
    }

    async init() {
        // ✅ PREVENIR MÚLTIPLES INICIALIZACIONES
        if (this.inicializado) {
            console.log('⚠️ CarritoApp ya fue inicializado, saltando...');
            return;
        }

        try {
            console.log('🚀 Inicializando CarritoApp...');

            // Verificar autenticación
            this.verificarAutenticacion();

            // Configurar event listeners UNA SOLA VEZ
            this.configurarEventListeners();

            // Cargar datos
            await this.cargarCarrito();
            await this.cargarCuponesDisponibles();

            // Ver historial de pedidos
            document.getElementById('btnVerHistorial')?.addEventListener('click', () => this.mostrarHistorialPedidos());

            // ✅ MARCAR COMO INICIALIZADO
            this.inicializado = true;
            console.log('✅ CarritoApp inicializado correctamente');

        } catch (error) {
            console.error('❌ Error inicializando carrito:', error);
            this.mostrarError('Error al cargar el carrito: ' + error.message);
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
            console.log('Usuario autenticado en carrito:', this.usuario.user?.id);
        } catch (error) {
            console.error('Error parsing user session:', error);
            window.location.href = '/login';
        }
    }

    configurarEventListeners() {
        // ✅ PREVENIR MÚLTIPLES EVENT LISTENERS
        if (this.listenersConfigurados) {
            console.log('⚠️ Event listeners ya configurados, saltando...');
            return;
        }

        // Botón volver
        document.getElementById('btnVolver')?.addEventListener('click', () => this.volver());

        // Limpiar carrito
        document.getElementById('btnLimpiarCarrito')?.addEventListener('click', () => {
            this.mostrarModalConfirmacion(
                'Limpiar Carrito',
                '¿Estás seguro de eliminar todos los productos?',
                () => this.limpiarCarrito()
            );
        });

        // Aplicar cupón
        document.getElementById('btnAplicarCupon')?.addEventListener('click', () => this.aplicarCupon());

        // Enter en input de cupón
        document.getElementById('inputCupon')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.aplicarCupon();
        });

        // Proceder al pago
        document.getElementById('btnProcederPago')?.addEventListener('click', () => this.procederPago());

        // Guardar lista
        document.getElementById('btnGuardarLista')?.addEventListener('click', () => this.guardarLista());

        // Modal
        document.getElementById('modalClose')?.addEventListener('click', () => this.cerrarModal());
        document.getElementById('btnCancelar')?.addEventListener('click', () => this.cerrarModal());

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.cerrarModal();
        });

        this.listenersConfigurados = true;
        console.log('✅ Event listeners configurados');
    }

    // ==================== CARGA DE DATOS ====================

    async cargarCarrito() {
        try {
            const response = await fetch(`${this.apiBaseURL}/carrito/usuario/${this.usuario.user.id}`);

            if (response.ok) {
                this.carritoItems = await response.json();
                console.log('✅ Carrito cargado:', this.carritoItems.length, 'items');

                this.renderizarCarrito();
                this.calcularTotales();
                this.actualizarResumen();

            } else {
                console.log('Carrito vacío o error al cargar');
                this.carritoItems = [];
                this.renderizarCarrito();
            }
        } catch (error) {
            console.error('❌ Error cargando carrito:', error);
            this.carritoItems = [];
            this.renderizarCarrito();
        }
    }

    async cargarCuponesDisponibles() {
        try {
            const response = await fetch(`${this.apiBaseURL}/cupones/validos`);

            if (response.ok) {
                const cupones = await response.json();
                this.renderizarCuponesDisponibles(cupones.slice(0, 3));
                console.log('✅ Cupones disponibles cargados:', cupones.length);
            }
        } catch (error) {
            console.error('❌ Error cargando cupones:', error);
        }
    }

    // ==================== RENDERIZADO ====================

    renderizarCarrito() {
        const container = document.getElementById('productosLista');
        const carritoVacio = document.getElementById('carritoVacio');
        const contador = document.getElementById('contadorItems');

        if (!container) return;

        // Actualizar contador
        const totalItems = this.carritoItems.reduce((total, item) => total + item.cantidad, 0);
        if (contador) contador.textContent = totalItems;

        if (this.carritoItems.length === 0) {
            container.innerHTML = '';
            if (carritoVacio) carritoVacio.style.display = 'block';
            console.log('📦 Carrito vacío mostrado');
            return;
        }

        if (carritoVacio) carritoVacio.style.display = 'none';

        container.innerHTML = this.carritoItems.map((item) => {
            const producto = item.producto;
            const imagenUrl = producto.imagen ?
                `${this.apiBaseURL.replace('/api', '')}/imagenes-productos/${producto.imagen.split(/[|,]/)[0].trim()}` :
                null;

            return `
                <div class="producto-carrito" data-item-id="${item.id}">
                    <div class="producto-imagen">
                        ${imagenUrl ?
                `<img src="${imagenUrl}" alt="${producto.nombre}" loading="lazy">` :
                '<div style="color: #9ca3af; font-size: 2rem;">📦</div>'
            }
                    </div>
                    
                    <div class="producto-info">
                        <h3 class="producto-nombre">${producto.nombre}</h3>
                        <p class="producto-categoria">${producto.categoria?.nombre || 'Sin categoría'}</p>
                        <p class="producto-precio">$${Number(item.preciounitario).toLocaleString('es-ES')}</p>
                    </div>
                    
                    <div class="producto-controles">
                        <div class="cantidad-controles">
                            <button class="btn-cantidad" onclick="window.carritoAppInstance.actualizarCantidad(${item.id}, ${item.cantidad - 1})">
                                -
                            </button>
                            <span class="cantidad-valor">${item.cantidad}</span>
                            <button class="btn-cantidad" onclick="window.carritoAppInstance.actualizarCantidad(${item.id}, ${item.cantidad + 1})">
                                +
                            </button>
                        </div>
                        
                        <button class="btn-eliminar-producto" onclick="window.carritoAppInstance.eliminarItem(${item.id})" title="Eliminar producto">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        console.log('🛒 Productos renderizados:', this.carritoItems.length);
    }

    renderizarCuponesDisponibles(cupones) {
        const container = document.getElementById('cuponesLista');

        if (!cupones || cupones.length === 0) {
            container.innerHTML = '<p class="no-cupones">No hay cupones disponibles</p>';
            return;
        }

        container.innerHTML = cupones.map(cupon => `
            <div class="cupon-item-mini" onclick="window.carritoAppInstance.aplicarCuponDesdeItem('${cupon.codigo}')">
                <div class="cupon-mini-info">
                    <span class="cupon-mini-codigo">${cupon.codigo}</span>
                    <span class="cupon-mini-valor">
                        ${cupon.tipo === 'PORCENTAJE' ? `${cupon.valor}% OFF` : `$${cupon.valor.toLocaleString('es-ES')} OFF`}
                    </span>
                </div>
                <button class="btn-aplicar-mini">Aplicar</button>
            </div>
        `).join('');
    }

    // ==================== GESTIÓN DE ITEMS ====================

    async actualizarCantidad(itemId, nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            this.eliminarItem(itemId);
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseURL}/carrito/actualizar-cantidad`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    itemId: itemId,
                    cantidad: nuevaCantidad
                })
            });

            if (response.ok) {
                await this.cargarCarrito();
                this.mostrarToast('Cantidad actualizada', 'success');
            } else {
                throw new Error('Error al actualizar cantidad');
            }
        } catch (error) {
            console.error('❌ Error actualizando cantidad:', error);
            this.mostrarToast('Error al actualizar cantidad', 'error');
        }
    }

    async eliminarItem(itemId) {
        try {
            const response = await fetch(`${this.apiBaseURL}/carrito/eliminar/${itemId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.cargarCarrito();
                this.mostrarToast('Producto eliminado del carrito', 'success');
            } else {
                throw new Error('Error al eliminar producto');
            }
        } catch (error) {
            console.error('❌ Error eliminando item:', error);
            this.mostrarToast('Error al eliminar producto', 'error');
        }
    }

    async limpiarCarrito() {
        try {
            const response = await fetch(`${this.apiBaseURL}/carrito/limpiar/${this.usuario.user.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.carritoItems = [];
                this.cuponAplicado = null;
                this.renderizarCarrito();
                this.calcularTotales();
                this.actualizarResumen();
                this.ocultarCuponAplicado();
                this.mostrarToast('Carrito vaciado correctamente', 'success');
            } else {
                throw new Error('Error al limpiar carrito');
            }
        } catch (error) {
            console.error('❌ Error limpiando carrito:', error);
            this.mostrarToast('Error al limpiar carrito', 'error');
        }

        this.cerrarModal();
    }

    // ==================== CÁLCULOS ====================

    calcularTotales() {
        this.totales.subtotal = this.carritoItems.reduce((total, item) => {
            return total + (Number(item.preciounitario) * item.cantidad);
        }, 0);

        this.totales.envio = this.totales.subtotal >= this.envioGratis ? 0 : this.costoEnvio;

        this.totales.descuento = this.cuponAplicado ?
            this.calcularDescuentoCupon(this.totales.subtotal) : 0;

        this.totales.total = this.totales.subtotal + this.totales.envio - this.totales.descuento;
    }

    calcularDescuentoCupon(subtotal) {
        if (!this.cuponAplicado) return 0;

        if (this.cuponAplicado.tipo === 'PORCENTAJE') {
            return subtotal * (this.cuponAplicado.valor / 100);
        } else {
            return Math.min(this.cuponAplicado.valor, subtotal);
        }
    }

    actualizarResumen() {
        const elementos = {
            subtotalMonto: document.getElementById('subtotalMonto'),
            envioMonto: document.getElementById('envioMonto'),
            descuentoMonto: document.getElementById('descuentoMonto'),
            totalMonto: document.getElementById('totalMonto'),
            descuentoLine: document.getElementById('descuentoLine')
        };

        if (elementos.subtotalMonto) {
            elementos.subtotalMonto.textContent = `$${this.totales.subtotal.toLocaleString('es-ES')}`;
        }

        if (elementos.envioMonto) {
            elementos.envioMonto.textContent = this.totales.envio === 0 ?
                'Gratis' : `$${this.totales.envio.toLocaleString('es-ES')}`;
        }

        if (elementos.descuentoMonto) {
            elementos.descuentoMonto.textContent = `-$${this.totales.descuento.toLocaleString('es-ES')}`;
        }

        if (elementos.totalMonto) {
            elementos.totalMonto.textContent = `$${this.totales.total.toLocaleString('es-ES')}`;
        }

        // Mostrar/ocultar línea de descuento
        if (elementos.descuentoLine) {
            elementos.descuentoLine.style.display = this.totales.descuento > 0 ? 'flex' : 'none';
        }

        // Actualizar estado del botón de pago
        const btnPago = document.getElementById('btnProcederPago');
        if (btnPago) {
            btnPago.disabled = this.carritoItems.length === 0;
            btnPago.style.opacity = this.carritoItems.length === 0 ? '0.5' : '1';
        }
    }

    // ==================== GESTIÓN DE CUPONES ====================

    async aplicarCupon() {
        const inputCupon = document.getElementById('inputCupon');
        const codigo = inputCupon.value.trim();

        if (!codigo) {
            this.mostrarMensajeCupon('Ingresa un código de cupón', 'error');
            return;
        }

        const btnAplicar = document.getElementById('btnAplicarCupon');

        // Mostrar loading
        btnAplicar.disabled = true;
        btnAplicar.querySelector('.btn-text').style.display = 'none';
        btnAplicar.querySelector('.btn-loader').style.display = 'inline';

        try {
            const response = await fetch(`${this.apiBaseURL}/cupones/aplicar`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    codigo: codigo,
                    montoOriginal: this.totales.subtotal
                })
            });

            const result = await response.json();

            if (result.success) {
                this.cuponAplicado = result.cupon;
                this.mostrarCuponAplicado(result.cupon);
                this.calcularTotales();
                this.actualizarResumen();
                this.mostrarMensajeCupon(result.mensaje, 'success');
                this.mostrarToast('Cupón aplicado correctamente', 'success');
                inputCupon.value = '';
            } else {
                this.mostrarMensajeCupon(result.error, 'error');
                this.mostrarToast(result.error, 'error');
            }
        } catch (error) {
            console.error('❌ Error aplicando cupón:', error);
            this.mostrarMensajeCupon('Error al aplicar cupón', 'error');
            this.mostrarToast('Error al aplicar cupón', 'error');
        } finally {
            // Restaurar botón
            btnAplicar.disabled = false;
            btnAplicar.querySelector('.btn-text').style.display = 'inline';
            btnAplicar.querySelector('.btn-loader').style.display = 'none';
        }
    }

    aplicarCuponDesdeItem(codigo) {
        document.getElementById('inputCupon').value = codigo;
        this.aplicarCupon();
    }

    removerCupon() {
        this.cuponAplicado = null;
        this.calcularTotales();
        this.actualizarResumen();
        this.ocultarCuponAplicado();
        this.mostrarToast('Cupón removido', 'success');
    }

    mostrarCuponAplicado(cupon) {
        const cuponAplicadoDiv = document.getElementById('cuponAplicado');
        const cuponCodigo = document.getElementById('cuponCodigo');
        const cuponDescripcion = document.getElementById('cuponDescripcion');

        cuponCodigo.textContent = cupon.codigo;
        cuponDescripcion.textContent = cupon.descripcion;

        cuponAplicadoDiv.style.display = 'flex';

        // Configurar botón remover
        document.getElementById('btnRemoverCupon').onclick = () => this.removerCupon();
    }

    ocultarCuponAplicado() {
        const cuponAplicadoDiv = document.getElementById('cuponAplicado');
        cuponAplicadoDiv.style.display = 'none';
    }

    mostrarMensajeCupon(mensaje, tipo) {
        const mensajeDiv = document.getElementById('cuponMensaje');

        mensajeDiv.textContent = mensaje;
        mensajeDiv.className = `cupon-mensaje ${tipo}`;
        mensajeDiv.style.display = 'block';

        // Ocultar después de 3 segundos
        setTimeout(() => {
            mensajeDiv.style.display = 'none';
        }, 3000);
    }

    // ==================== PROCESO DE PAGO ====================

    async procederPago() {
        if (this.carritoItems.length === 0) {
            this.mostrarToast('Tu carrito está vacío', 'warning');
            return;
        }

        // Mostrar popup de procesando pago
        this.mostrarPopupPago();

        try {
            // Simular procesamiento de pago
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Procesar pedido
            const response = await fetch(`${this.apiBaseURL}/carrito/procesar-pedido`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    usuarioId: this.usuario.user.id,
                    direccionEntrega: 'Dirección por defecto',
                    cuponId: this.cuponAplicado?.id || null
                })
            });

            if (response.ok) {
                const resultado = await response.json();

                // Cerrar popup de procesando
                this.cerrarPopupPago();

                // Mostrar resumen de orden
                this.mostrarResumenOrden(resultado.pedido, resultado.items);

                // Limpiar carrito local
                this.carritoItems = [];
                this.cuponAplicado = null;
                this.renderizarCarrito();
                this.calcularTotales();
                this.actualizarResumen();

            } else {
                throw new Error('Error al procesar el pedido');
            }
        } catch (error) {
            console.error('❌ Error procesando pago:', error);
            this.cerrarPopupPago();
            this.mostrarToast('Error al procesar el pago', 'error');
        }
    }

    mostrarPopupPago() {
        const popup = document.createElement('div');
        popup.id = 'popup-pago';
        popup.className = 'modal-overlay';
        popup.innerHTML = `
            <div class="modal-content" style="text-align: center; max-width: 400px;">
                <div class="loading-payment">
                    <div class="payment-spinner"></div>
                    <h3 style="margin: 1rem 0;">Procesando Pago</h3>
                    <p style="color: var(--text-secondary);">Por favor espera mientras procesamos tu pago...</p>
                    <div class="payment-progress">
                        <div class="progress-bar"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
    }

    cerrarPopupPago() {
        const popup = document.getElementById('popup-pago');
        if (popup) {
            popup.remove();
        }
    }

    mostrarResumenOrden(pedido, items) {
        const popup = document.createElement('div');
        popup.id = 'popup-resumen';
        popup.className = 'modal-overlay';
        popup.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="orden-exitosa">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="font-size: 4rem; color: #27ae60;">✅</div>
                    <h2 style="color: #27ae60; margin: 1rem 0;">¡Pago Exitoso!</h2>
                    <p style="color: #6b7280;">Tu pedido ha sido procesado correctamente</p>
                </div>
                
                <div class="resumen-pedido" style="background: #f8f9fa; border-radius: 12px; padding: 1.5rem; margin: 1rem 0;">
                    <h3>Resumen del Pedido #${pedido.id}</h3>
                    <div class="pedido-info" style="margin: 1rem 0;">
                        <p><strong>Fecha:</strong> ${new Date(pedido.fechapedido).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
                        <p><strong>Estado:</strong> <span style="color: #f39c12; font-weight: bold; text-transform: capitalize;">${pedido.estado}</span></p>
                        <p><strong>Total:</strong> <span style="color: #27ae60; font-weight: bold;">$${Number(pedido.total).toLocaleString('es-ES')}</span></p>
                        <p><strong>Dirección:</strong> ${pedido.direccionentrega}</p>
                    </div>
                    
                    <div class="items-pedido" style="margin-top: 1rem;">
                        <h4>Productos (${items?.length || 0} items):</h4>
                        <div style="max-height: 200px; overflow-y: auto; margin-top: 0.5rem;">
                            ${items && items.length > 0 ? items.map(item => `
                                <div class="item-resumen" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
                                    <div style="flex: 1;">
                                        <span style="font-weight: 600;">${item.producto?.nombre || 'Producto'}</span>
                                        <br>
                                        <small style="color: #6b7280;">${item.producto?.categoria?.nombre || 'Sin categoría'}</small>
                                    </div>
                                    <div style="text-align: right;">
                                        <span style="font-weight: 600;">${item.cantidad}x $${Number(item.preciounitario).toLocaleString('es-ES')}</span>
                                        <br>
                                        <small style="color: #27ae60;">Subtotal: $${Number(item.cantidad * item.preciounitario).toLocaleString('es-ES')}</small>
                                    </div>
                                </div>
                            `).join('') : '<p style="text-align: center; color: #6b7280;">No hay items en el pedido</p>'}
                        </div>
                    </div>
                </div>
                
                <div class="acciones-resumen" style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button class="btn-secondary" onclick="window.carritoAppInstance.cerrarResumenOrden(); window.location.href='/dashboard'" style="flex: 1; padding: 1rem; border: none; border-radius: 12px; background: #e5e7eb; color: #374151; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                        Seguir Comprando
                    </button>
                    <button class="btn-primary" onclick="window.carritoAppInstance.cerrarResumenOrden(); window.location.href='/perfil'" style="flex: 1; padding: 1rem; border: none; border-radius: 12px; background: #667eea; color: white; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                        Ver Mis Pedidos
                    </button>
                </div>
                
                <div style="text-align: center; margin-top: 1rem;">
                    <button onclick="window.carritoAppInstance.cerrarResumenOrden()" style="background: none; border: none; color: #6b7280; text-decoration: underline; cursor: pointer;">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;

        document.body.appendChild(popup);

        // Animar entrada del popup
        setTimeout(() => {
            popup.style.opacity = '1';
        }, 10);
    }

    cerrarResumenOrden() {
        const popup = document.getElementById('popup-resumen');
        if (popup) {
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.remove();
            }, 300);
        }
    }

    // ==================== INTERFAZ DE HISTORIAL ====================

    async mostrarHistorialPedidos() {
        try {
            const pedidos = await this.obtenerHistorialPedidos();

            const popup = document.createElement('div');
            popup.id = 'popup-historial';
            popup.className = 'modal-overlay';
            popup.innerHTML = `
            <div class="modal-content" style="max-width: 900px; max-height: 80vh; overflow-y: auto;">
                <div class="historial-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
                    <h2 style="margin: 0; color: #1f2937;">📋 Historial de Pedidos</h2>
                    <button onclick="window.carritoAppInstance.cerrarHistorial()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">×</button>
                </div>
                
                <div class="pedidos-lista">
                    ${pedidos.length > 0 ? pedidos.map(pedido => `
                        <div class="pedido-card" style="background: #f8f9fa; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; border-left: 4px solid ${this.getEstadoColor(pedido.estado)};">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                <div>
                                    <h3 style="margin: 0 0 0.5rem 0; color: #1f2937;">Pedido #${pedido.id}</h3>
                                    <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">
                                        ${new Date(pedido.fechapedido).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}
                                    </p>
                                </div>
                                <div style="text-align: right;">
                                    <span style="background: ${this.getEstadoColor(pedido.estado)}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">
                                        ${pedido.estado}
                                    </span>
                                    <p style="margin: 0.5rem 0 0 0; font-weight: 600; color: #27ae60;">
                                        $${Number(pedido.total).toLocaleString('es-ES')}
                                    </p>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">
                                    <strong>Productos:</strong> ${pedido.cantidadItems} items
                                </p>
                                <p style="margin: 0.25rem 0 0 0; color: #6b7280; font-size: 0.9rem;">
                                    <strong>Dirección:</strong> ${pedido.direccionentrega}
                                </p>
                            </div>
                            
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="window.carritoAppInstance.verDetallePedido(${pedido.id})" style="padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">
                                    Ver Detalle
                                </button>
                                ${pedido.estado === 'PENDIENTE' ? `
                                    <button onclick="window.carritoAppInstance.cancelarPedido(${pedido.id})" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">
                                        Cancelar
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('') : `
                        <div style="text-align: center; padding: 3rem; color: #6b7280;">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">📦</div>
                            <h3>No tienes pedidos aún</h3>
                            <p>Cuando realices tu primera compra, aparecerá aquí</p>
                            <button onclick="window.carritoAppInstance.cerrarHistorial(); window.location.href='/dashboard'" style="padding: 1rem 2rem; background: #667eea; color: white; border: none; border-radius: 12px; cursor: pointer; margin-top: 1rem;">
                                Explorar Productos
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;

            document.body.appendChild(popup);

        } catch (error) {
            console.error('❌ Error mostrando historial:', error);
            this.mostrarToast('Error al cargar historial de pedidos', 'error');
        }
    }

    async verDetallePedido(pedidoId) {
        try {
            const detalle = await this.obtenerDetallePedido(pedidoId);

            if (detalle) {
                this.mostrarResumenOrden(detalle.pedido, detalle.items);
            }
        } catch (error) {
            console.error('❌ Error viendo detalle:', error);
            this.mostrarToast('Error al cargar detalle del pedido', 'error');
        }
    }

    getEstadoColor(estado) {
        const colores = {
            'PENDIENTE': '#f39c12',
            'CONFIRMADO': '#3498db',
            'ENVIADO': '#9b59b6',
            'ENTREGADO': '#27ae60',
            'CANCELADO': '#e74c3c'
        };
        return colores[estado] || '#6b7280';
    }

    cerrarHistorial() {
        const popup = document.getElementById('popup-historial');
        if (popup) {
            popup.remove();
        }
    }

    // ==================== GESTIÓN DE PEDIDOS ====================

    async obtenerHistorialPedidos() {
        try {
            console.log('📋 Obteniendo historial de pedidos...');

            const response = await fetch(`${this.apiBaseURL}/pedidos/usuario/${this.usuario.user.id}`);

            if (response.ok) {
                const pedidos = await response.json();
                console.log('✅ Historial de pedidos obtenido:', pedidos.length);
                return pedidos;
            } else {
                throw new Error('Error al obtener historial de pedidos');
            }
        } catch (error) {
            console.error('❌ Error obteniendo historial:', error);
            return [];
        }
    }

    async obtenerDetallePedido(pedidoId) {
        try {
            console.log('🔍 Obteniendo detalle del pedido:', pedidoId);

            const response = await fetch(`${this.apiBaseURL}/pedidos/${pedidoId}`);

            if (response.ok) {
                const detalle = await response.json();
                console.log('✅ Detalle del pedido obtenido:', detalle);
                return detalle;
            } else {
                throw new Error('Error al obtener detalle del pedido');
            }
        } catch (error) {
            console.error('❌ Error obteniendo detalle:', error);
            return null;
        }
    }

    async obtenerEstadisticasPedidos() {
        try {
            console.log('📊 Obteniendo estadísticas de pedidos...');

            const response = await fetch(`${this.apiBaseURL}/pedidos/usuario/${this.usuario.user.id}/estadisticas`);

            if (response.ok) {
                const estadisticas = await response.json();
                console.log('✅ Estadísticas obtenidas:', estadisticas);
                return estadisticas;
            } else {
                throw new Error('Error al obtener estadísticas');
            }
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return null;
        }
    }

// ==================== MÉTODOS PARA VENDEDORES ====================

    async obtenerPedidosVendedor(vendedorId) {
        try {
            console.log('🏪 Obteniendo pedidos para vendedor:', vendedorId);

            const response = await fetch(`${this.apiBaseURL}/pedidos/vendedor/${vendedorId}`);

            if (response.ok) {
                const pedidos = await response.json();
                console.log('✅ Pedidos de vendedor obtenidos:', pedidos.length);
                return pedidos;
            } else {
                throw new Error('Error al obtener pedidos del vendedor');
            }
        } catch (error) {
            console.error('❌ Error obteniendo pedidos de vendedor:', error);
            return [];
        }
    }

    async actualizarEstadoPedido(pedidoId, nuevoEstado) {
        try {
            console.log('🔄 Actualizando estado del pedido:', pedidoId, 'a:', nuevoEstado);

            const response = await fetch(`${this.apiBaseURL}/pedidos/${pedidoId}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estado: nuevoEstado
                })
            });

            if (response.ok) {
                const resultado = await response.json();
                console.log('✅ Estado actualizado exitosamente:', resultado);
                this.mostrarToast(`Estado actualizado a: ${nuevoEstado}`, 'success');
                return resultado;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar estado');
            }
        } catch (error) {
            console.error('❌ Error actualizando estado:', error);
            this.mostrarToast('Error al actualizar estado: ' + error.message, 'error');
            return null;
        }
    }

    // ==================== UTILIDADES ====================

    guardarLista() {
        const listaGuardada = {
            fecha: new Date().toISOString(),
            items: this.carritoItems,
            total: this.totales.subtotal
        };

        const listasGuardadas = JSON.parse(localStorage.getItem('listasGuardadas') || '[]');
        listasGuardadas.push(listaGuardada);
        localStorage.setItem('listasGuardadas', JSON.stringify(listasGuardadas));

        this.mostrarToast('Lista guardada correctamente', 'success');
    }

    volver() {
        window.location.href = '/dashboard';
    }

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
    }

    cerrarModal() {
        const modal = document.getElementById('modalConfirmacion');
        modal.style.display = 'none';
    }

    mostrarToast(mensaje, tipo = 'info') {
        const container = document.getElementById('toastContainer') || document.body;
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

        container.appendChild(toast);

        // Remover después de 3 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
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
}

// ✅ INICIALIZACIÓN CONTROLADA
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que no exista ya una instancia
    if (!window.carritoAppInstance) {
        console.log('🚀 Creando nueva instancia de CarritoApp');
        window.carritoApp = new CarritoApp();
    } else {
        console.log('⚠️ Usando instancia existente de CarritoApp');
        window.carritoApp = window.carritoAppInstance;
    }
});
