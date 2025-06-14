// Sistema de Reseñas - Versión Limpia
class SistemaResenas {
    constructor() {
        this.apiBase = '/api/resenas';
        this.currentRole = 'comprador';
        this.selectedRating = 0;

        this.init();
    }

    init() {
        this.initElements();
        this.initEvents();
        this.loadInitialData();

        console.log('✅ Sistema de Reseñas iniciado correctamente');
    }

    initElements() {
        // Botones de rol
        this.btnComprador = document.getElementById('btn-comprador');
        this.btnVendedor = document.getElementById('btn-vendedor');

        // Vistas
        this.vistaComprador = document.getElementById('vista-comprador');
        this.vistaVendedor = document.getElementById('vista-vendedor');

        // Formulario
        this.formResena = document.getElementById('form-resena');
        this.stars = document.querySelectorAll('.star');
        this.ratingValue = document.getElementById('rating-value');
        this.mensaje = document.getElementById('mensaje');

        // Loading
        this.loading = document.getElementById('loading');
    }

    initEvents() {
        // Cambio de rol
        this.btnComprador?.addEventListener('click', () => this.switchRole('comprador'));
        this.btnVendedor?.addEventListener('click', () => this.switchRole('vendedor'));

        // Rating stars
        this.stars.forEach(star => {
            star.addEventListener('click', (e) => this.selectRating(e.target.dataset.rating));
            star.addEventListener('mouseenter', (e) => this.hoverRating(e.target.dataset.rating));
        });

        // Formulario
        this.formResena?.addEventListener('submit', (e) => this.submitResena(e));

        // Botones
        document.getElementById('btn-verificar')?.addEventListener('click', () => this.verificarDisponibilidad());
        document.getElementById('btn-cargar')?.addEventListener('click', () => this.cargarDatosVendedor());
    }

    switchRole(role) {
        this.currentRole = role;

        // Actualizar botones
        document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));

        if (role === 'comprador') {
            this.btnComprador?.classList.add('active');
            this.vistaComprador?.classList.add('active');
            this.vistaVendedor?.classList.remove('active');
        } else {
            this.btnVendedor?.classList.add('active');
            this.vistaVendedor?.classList.add('active');
            this.vistaComprador?.classList.remove('active');
        }

        console.log(`Cambiado a rol: ${role}`);
    }

    selectRating(rating) {
        this.selectedRating = parseInt(rating);
        this.ratingValue.value = this.selectedRating;
        this.updateStars(this.selectedRating);
        console.log(`Rating seleccionado: ${this.selectedRating}`);
    }

    hoverRating(rating) {
        this.updateStars(parseInt(rating));
    }

    updateStars(rating) {
        this.stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
                star.textContent = '★';
            } else {
                star.classList.remove('active');
                star.textContent = '☆';
            }
        });
    }

    async verificarDisponibilidad() {
        const compradorId = document.getElementById('comprador-id')?.value;
        const productoId = document.getElementById('producto-id')?.value;

        if (!compradorId || !productoId) {
            this.showMessage('Ingresa tu ID y el ID del producto', 'warning');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch(
                `${this.apiBase}/comprador/${compradorId}/producto/${productoId}/puede-resenar`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.puedeResenar) {
                    this.showMessage('✅ Puedes escribir una reseña para este producto', 'success');
                    document.getElementById('btn-enviar').disabled = false;
                } else {
                    this.showMessage('❌ Ya has escrito una reseña para este producto', 'error');
                    document.getElementById('btn-enviar').disabled = true;
                }
            } else {
                throw new Error('Error al verificar disponibilidad');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('Error al verificar disponibilidad', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async submitResena(e) {
        e.preventDefault();

        const compradorId = document.getElementById('comprador-id')?.value;
        const productoId = document.getElementById('producto-id')?.value;
        const comentario = document.getElementById('comentario')?.value;

        if (!compradorId || !productoId || !this.selectedRating) {
            this.showMessage('Completa todos los campos obligatorios', 'warning');
            return;
        }

        const resenaData = {
            calificacion: this.selectedRating,
            comentario: comentario || ''
        };

        this.showLoading(true);

        try {
            const response = await fetch(
                `${this.apiBase}/comprador/${compradorId}/producto/${productoId}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(resenaData)
                }
            );

            if (response.ok) {
                this.showMessage('🎉 Reseña enviada correctamente', 'success');
                this.formResena.reset();
                this.selectedRating = 0;
                this.updateStars(0);
                document.getElementById('btn-enviar').disabled = true;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al enviar reseña');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async cargarDatosVendedor() {
        const vendedorId = document.getElementById('vendedor-id')?.value;

        if (!vendedorId) {
            this.showMessage('Ingresa tu ID de vendedor', 'warning');
            return;
        }

        this.showLoading(true);

        try {
            // Cargar estadísticas
            const statsResponse = await fetch(`${this.apiBase}/vendedor/${vendedorId}/estadisticas`);

            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                document.getElementById('promedio').textContent = (stats.promedioCalificacion || 0).toFixed(1);
                document.getElementById('total-resenas').textContent = stats.totalResenasRecibidas || 0;
                document.getElementById('verificadas').textContent = stats.resenasVerificadas || 0;
            }

            this.showMessage('✅ Datos cargados correctamente', 'success');
        } catch (error) {
            console.error('Error:', error);
            this.showMessage('Error al cargar datos', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    loadInitialData() {
        // Cargar datos iniciales si es necesario
        console.log('Cargando datos iniciales...');
    }

    showMessage(text, type) {
        if (!this.mensaje) return;

        this.mensaje.className = `message ${type}`;
        this.mensaje.textContent = text;
        this.mensaje.style.display = 'block';

        setTimeout(() => {
            this.mensaje.style.display = 'none';
        }, 5000);
    }

    showLoading(show) {
        if (!this.loading) return;

        if (show) {
            this.loading.classList.remove('hidden');
        } else {
            this.loading.classList.add('hidden');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaResenas = new SistemaResenas();
});

console.log('📄 Script cargado correctamente');

// Test - eliminar después
document.body.style.border = "5px solid green";
console.log("🟢 JavaScript funcionando correctamente");
