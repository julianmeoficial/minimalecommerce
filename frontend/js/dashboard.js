// dashboard.js - Homepage con animaciones GSAP

class DashboardPage {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 3;
        this.slideInterval = null;
        this.userData = null;

        this.init();
    }

    init() {
        console.log('Inicializando Dashboard...');


        // Registrar plugins GSAP
        gsap.registerPlugin(ScrollTrigger);

        // Verificar autenticación
        this.checkAuthentication();

        // Configurar datos del usuario
        this.setupUserData();

        // Configurar animaciones iniciales
        this.setupInitialAnimations();

        // Configurar carrusel
        this.setupCarousel();

        // Configurar navegación
        this.setupNavigation();

        // Configurar botones de acción
        this.setupActionButtons();

        // Configurar categorías
        this.setupCategories();

        // Configurar scroll animations
        this.setupScrollAnimations();

        // Configurar responsive
        this.setupResponsive();

        // Cargar listeners del carrito/favoritos
        this.initCarritoListener();

        // LLAMADA ÚNICA MÁS SIMPLE:
        setTimeout(() => {
            this.personalizarBotonesPorTipoUsuario();
        }, 1000);

        console.log('Dashboard inicializado correctamente');

        // Observador de mutaciones para detectar cambios en el DOM
        const observer = new MutationObserver(() => {
            this.personalizarBotonesPorTipoUsuario();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    checkAuthentication() {
        // Verificar si hay sesión activa
        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');

        if (!userSession) {
            // Si no hay sesión, redirigir a login
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
                // Truncar nombre si es muy largo
                const displayName = userName.length > 12 ? userName.substring(0, 12) + '...' : userName;
                userNameElement.textContent = displayName;
                userNameElement.title = userName; // Tooltip con nombre completo
            }

            // MANTENER SOLO ESTA LÍNEA (sin debug-user-type):
            const tipoUsuario = this.userData.user.tipousuario || this.userData.user.tipoUsuario || 'COMPRADOR';
            document.body.setAttribute('data-user-type', tipoUsuario.toUpperCase());

            console.log('🏷️ Tipo de usuario marcado en body:', tipoUsuario.toUpperCase());

            // Configurar contador del carrito (simulado por ahora)
            this.updateCartCounter(0);
        }
    }

    setupInitialAnimations() {
        // Timeline principal
        const tl = gsap.timeline();

        // Animar header
        tl.from('.header-container', {
            duration: 0.8,
            y: -100,
            opacity: 0,
            ease: "power2.out"
        });

        // Animar logo
        tl.from('.logo-icon', {
            duration: 0.6,
            scale: 0,
            rotation: -180,
            ease: "back.out(1.7)"
        }, "-=0.4");

        tl.from('.logo-text', {
            duration: 0.6,
            x: -20,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.4");

        // Animar navegación con botones
        tl.from('.nav-button', {
            duration: 0.6,
            y: -30,
            opacity: 0,
            scale: 0.8,
            stagger: 0.1,
            ease: "back.out(1.7)",
            onComplete: () => {
                // Limpiar todas las propiedades GSAP
                gsap.set('.nav-button', {
                    clearProps: "all",
                    opacity: 1,
                    visibility: 'visible',
                    display: 'flex'
                });

                gsap.set('.nav-button svg', {
                    clearProps: "all",
                    opacity: 1,
                    visibility: 'visible'
                });

                console.log('Navegación limpiada y forzada a visible');
            }
        }, "-=0.3");

        // Animar botones de acción
        tl.from('.user-actions > *', {
            duration: 0.5,
            scale: 0,
            opacity: 0,
            stagger: 0.1,
            ease: "back.out(1.7)"
        }, "-=0.2");

        // Animar carrusel
        tl.from('.carousel-container', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.3");

        // Configurar hover effects del logo
        this.setupLogoAnimations();

        // Forzar visibilidad final de navegación (ACTUALIZADA)
        tl.call(() => {
            const navButtons = document.querySelectorAll('.nav-button');
            const navIcons = document.querySelectorAll('.nav-button svg');
            const navElements = document.querySelectorAll('.main-navigation, .nav-list');

            navElements.forEach(el => {
                el.style.opacity = '1';
                el.style.visibility = 'visible';
                el.style.display = 'flex';
                gsap.set(el, { clearProps: "all", opacity: 1, visibility: 'visible' });
            });

            navButtons.forEach(button => {
                button.style.opacity = '1';
                button.style.visibility = 'visible';
                button.style.display = 'flex';
                gsap.set(button, { clearProps: "all", opacity: 1, visibility: 'visible' });
            });

            navIcons.forEach(icon => {
                icon.style.opacity = '1';
                icon.style.visibility = 'visible';
                gsap.set(icon, { clearProps: "all", opacity: 1, visibility: 'visible' });
            });

            console.log('Navegación completamente visible y limpia');
        });
    }

    setupLogoAnimations() {
        const logoIcon = document.getElementById('animated-logo');
        const logoText = document.getElementById('logo-text');

        if (logoIcon && logoText) {
            logoIcon.addEventListener('mouseenter', () => {
                gsap.to(logoIcon, {
                    duration: 0.3,
                    scale: 1.1,
                    rotation: 5,
                    ease: "power2.out"
                });

                gsap.to(logoText, {
                    duration: 0.3,
                    scale: 1.05,
                    ease: "power2.out"
                });
            });

            logoIcon.addEventListener('mouseleave', () => {
                gsap.to(logoIcon, {
                    duration: 0.3,
                    scale: 1,
                    rotation: 0,
                    ease: "power2.out"
                });

                gsap.to(logoText, {
                    duration: 0.3,
                    scale: 1,
                    ease: "power2.out"
                });
            });
        }
    }

    setupCarousel() {
        const track = document.getElementById('carousel-track');
        const indicators = document.querySelectorAll('.indicator');
        const slides = document.querySelectorAll('.carousel-slide');

        // Configurar indicadores
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });

        // Configurar botones de navegación
        this.setupCarouselNavigation();

        // Iniciar autoplay
        this.startCarouselAutoplay();

        // Pausar en hover
        track.addEventListener('mouseenter', () => {
            this.stopCarouselAutoplay();
        });

        track.addEventListener('mouseleave', () => {
            this.startCarouselAutoplay();
        });

        // Animar primer slide
        this.animateSlideContent(0);
    }

    goToSlide(slideIndex) {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');

        // Actualizar slide activo
        slides[this.currentSlide].classList.remove('active');
        indicators[this.currentSlide].classList.remove('active');

        this.currentSlide = slideIndex;

        slides[this.currentSlide].classList.add('active');
        indicators[this.currentSlide].classList.add('active');

        // Animar contenido del slide
        this.animateSlideContent(slideIndex);
    }

    animateSlideContent(slideIndex) {
        const slide = document.querySelector(`[data-slide="${slideIndex}"]`);

        if (slide) {
            const title = slide.querySelector('.slide-title');
            const description = slide.querySelector('.slide-description');
            const button = slide.querySelector('.slide-button');
            const image = slide.querySelector('.image-placeholder');

            // Reset animations
            gsap.set([title, description, button, image], {
                opacity: 0,
                y: 30,
                scale: 0.9
            });

            // Animar entrada
            const tl = gsap.timeline();

            tl.to([title, description, button], {
                duration: 0.8,
                opacity: 1,
                y: 0,
                scale: 1,
                stagger: 0.2,
                ease: "power2.out"
            });

            tl.to(image, {
                duration: 0.6,
                opacity: 1,
                y: 0,
                scale: 1,
                ease: "back.out(1.7)"
            }, "-=0.4");
        }
    }

    startCarouselAutoplay() {
        this.slideInterval = setInterval(() => {
            const nextSlide = (this.currentSlide + 1) % this.totalSlides;
            this.goToSlide(nextSlide);
        }, 5000);
    }

    stopCarouselAutoplay() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-button');

        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();

                // Remover active de todos
                navButtons.forEach(b => b.classList.remove('active'));

                // Agregar active al clickeado
                button.classList.add('active');

                // Animar transición con GSAP
                gsap.to(button, {
                    duration: 0.2,
                    scale: 0.95,
                    ease: "power2.out",
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        gsap.to(button, {
                            duration: 0.3,
                            scale: 1,
                            ease: "back.out(1.7)"
                        });
                    }
                });

                // Animar ícono
                const icon = button.querySelector('svg');
                gsap.to(icon, {
                    duration: 0.4,
                    rotation: 360,
                    ease: "power2.out"
                });

                // Navegación real a páginas
                const section = button.dataset.section;
                console.log('Navegando a:', section);

                // Implementar navegación real
                switch(section) {
                    case 'inicio':
                        // Ya estamos en el dashboard/inicio
                        break;
                    case 'categorias':
                        window.location.href = '/categorias';
                        break;
                    case 'cupones':
                        console.log('Navegando a cupones...');
                        window.location.href = '/cupones';
                        break;
                    case 'blog':
                        console.log('Navegando a blog...');
                        window.location.href = '/blog';
                        break;
                    case 'eventos':
                        console.log('Navegando a eventos...');
                        window.location.href = '/eventos';
                        break;
                    default:
                        console.log('Sección no implementada:', section);
                }
            });
        });
    }

    setupActionButtons() {
        // Botón de perfil
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this.showProfileMenu();
            });
        }

        // Botón de notificaciones
        const notificationBtn = document.getElementById('notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }

        // Botón de redes sociales
        const socialBtn = document.getElementById('social-share');
        if (socialBtn) {
            this.setupSocialButton(socialBtn);
        }

        // Configurar botones del carrusel
        this.setupCarouselButtons();

        // PERSONALIZAR BOTONES DESPUÉS DE CONFIGURAR TODO
        setTimeout(() => {
            this.personalizarBotonesPorTipoUsuario();
        }, 100);
    }

    personalizarBotonesPorTipoUsuario() {
        console.log('🔧 Personalizando botones por tipo de usuario...');

        // DETECCIÓN MEJORADA DEL TIPO DE USUARIO
        let tipoUsuario = 'COMPRADOR'; // Por defecto

        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
        if (userSession) {
            try {
                const userData = JSON.parse(userSession);

                // MÚLTIPLES MÉTODOS DE DETECCIÓN
                tipoUsuario =
                    userData.user?.tipoUsuario ||     // Mayúsculas
                    userData.user?.tipousuario ||     // Minúsculas (tu caso)
                    userData.tipoUsuario ||           // Directo mayúsculas
                    userData.tipousuario ||           // Directo minúsculas
                    'COMPRADOR';                      // Fallback

                // NORMALIZAR A MAYÚSCULAS
                tipoUsuario = tipoUsuario.toUpperCase();

                console.log('🔍 Session completa:', userData);
                console.log('🔍 Usuario detectado:', userData.user);
                console.log('🔍 Tipo raw:', userData.user?.tipousuario);
                console.log('✅ Tipo final:', tipoUsuario);

            } catch (error) {
                console.error('Error parsing user session:', error);
            }
        }

        // Actualizar el body con el tipo correcto (SIN debug class)
        document.body.setAttribute('data-user-type', tipoUsuario);
        console.log('🏷️ Body actualizado con tipo:', tipoUsuario);

        // SELECCIONAR ELEMENTOS ESPECÍFICOS
        const cartSection = document.querySelector('.cart-section');
        const favoritesSection = document.querySelector('.favorites-section');
        const cartBtn = document.getElementById('cart-btn');
        const favoritesBtn = document.getElementById('favorites-btn');

        console.log('🔍 Elementos encontrados:', {
            cartSection: !!cartSection,
            favoritesSection: !!favoritesSection,
            cartBtn: !!cartBtn,
            favoritesBtn: !!favoritesBtn
        });

        if (tipoUsuario === 'VENDEDOR') {
            console.log('🚫 OCULTANDO botones para VENDEDOR...');

            // OCULTAR ELEMENTOS PARA VENDEDORES
            if (cartSection) {
                cartSection.classList.add('vendedor-hidden');
                console.log('✅ Cart section ocultada');
            }
            if (favoritesSection) {
                favoritesSection.classList.add('vendedor-hidden');
                console.log('✅ Favorites section ocultada');
            }
            if (cartBtn) {
                cartBtn.classList.add('vendedor-hidden');
                console.log('✅ Cart button ocultado');
            }
            if (favoritesBtn) {
                favoritesBtn.classList.add('vendedor-hidden');
                console.log('✅ Favorites button ocultado');
            }

            console.log('✅ VENDEDOR: Botones ocultados correctamente');

        } else {
            console.log('👤 MOSTRANDO botones para COMPRADOR...');

            // MOSTRAR ELEMENTOS PARA COMPRADORES
            if (cartSection) {
                cartSection.classList.remove('vendedor-hidden');
            }
            if (favoritesSection) {
                favoritesSection.classList.remove('vendedor-hidden');
            }
            if (cartBtn) {
                cartBtn.classList.remove('vendedor-hidden');
            }
            if (favoritesBtn) {
                favoritesBtn.classList.remove('vendedor-hidden');
            }

            // CONFIGURAR EVENT LISTENERS PARA COMPRADORES
            if (cartBtn && !cartBtn.hasAttribute('data-listener-added')) {
                cartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🛒 Clic en carrito');
                    this.openCart();
                });
                cartBtn.setAttribute('data-listener-added', 'true');
            }

            if (favoritesBtn && !favoritesBtn.hasAttribute('data-listener-added')) {
                favoritesBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('❤️ Clic en favoritos');
                    this.openFavorites();
                });
                favoritesBtn.setAttribute('data-listener-added', 'true');
            }

            console.log('✅ COMPRADOR: Botones configurados correctamente');
        }
    }

    // AGREGAR método para abrir favoritos
    openFavorites() {
        console.log('🔍 Abriendo favoritos...');

        // Verificar que el usuario sea comprador
        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
        if (userSession) {
            try {
                const userData = JSON.parse(userSession);
                const tipoUsuario = userData.user?.tipoUsuario;

                if (tipoUsuario === 'VENDEDOR') {
                    console.log('❌ Vendedor no puede acceder a favoritos');
                    return;
                }
            } catch (error) {
                console.error('Error verificando usuario:', error);
            }
        }

        // Animar botón antes de navegar
        const favoritesBtn = document.getElementById('favorites-btn');
        if (favoritesBtn && typeof gsap !== 'undefined') {
            gsap.to(favoritesBtn, {
                duration: 0.3,
                scale: 0.9,
                ease: "power2.inOut",
                onComplete: () => {
                    console.log('Navegando a /favoritos');
                    window.location.href = '/favoritos';
                }
            });
        } else {
            console.log('Navegando directamente a /favoritos');
            window.location.href = '/favoritos';
        }
    }

    //Contador de favoritos
    updateFavoritesCounter(count) {
        const favoritesBtn = document.getElementById('favorites-btn');
        if (favoritesBtn) {
            favoritesBtn.setAttribute('data-quantity', count);

            // Animar contador si cambió
            if (count > 0 && typeof gsap !== 'undefined') {
                gsap.to(favoritesBtn, {
                    duration: 0.3,
                    scale: 1.1,
                    ease: "back.out(1.7)",
                    yoyo: true,
                    repeat: 1
                });
            }
        }
    }

    // Método para actualizar contador de notificaciones
    updateNotificationsCounter(count) {
        const notificationBtn = document.getElementById('notification-btn');
        if (notificationBtn) {
            notificationBtn.setAttribute('data-quantity', count);

            // Animar contador si cambió
            if (count > 0 && typeof gsap !== 'undefined') {
                gsap.to(notificationBtn, {
                    duration: 0.3,
                    scale: 1.1,
                    ease: "back.out(1.7)",
                    yoyo: true,
                    repeat: 1
                });

                // Efecto especial para notificaciones no leídas
                gsap.to(notificationBtn, {
                    duration: 0.5,
                    boxShadow: "0 0 20px rgba(102, 126, 234, 0.5)",
                    ease: "power2.out",
                    yoyo: true,
                    repeat: 3
                });
            }
        }
    }

// ACTUALIZAR método  Carrito listener
    initCarritoListener() {
        // Carrito
        document.addEventListener('carrito-actualizado', (e) => {
            this.updateCartCounter(e.detail.cantidad);
        });

        // Favoritos
        document.addEventListener('favoritos-actualizado', (e) => {
            this.updateFavoritesCounter(e.detail.cantidad);
        });

        // AGREGAR: Notificaciones
        document.addEventListener('notificaciones-actualizado', (e) => {
            this.updateNotificationsCounter(e.detail.cantidad);
        });

        // Cargar contadores iniciales
        const carritoData = localStorage.getItem('carrito');
        if (carritoData) {
            const carrito = JSON.parse(carritoData);
            const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
            this.updateCartCounter(totalItems);
        }

        const favoritosData = localStorage.getItem('favoritos');
        if (favoritosData) {
            const favoritos = JSON.parse(favoritosData);
            this.updateFavoritesCounter(favoritos.length);
        }

        // AGREGAR: Cargar contador de notificaciones
        this.cargarContadorNotificaciones();
    }

    // Método para cargar contador de notificaciones
    async cargarContadorNotificaciones() {
        try {
            const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
            if (!userSession) return;

            const userData = JSON.parse(userSession);
            const usuarioId = userData.user?.id;
            const tipoUsuario = (userData.user?.tipousuario || userData.user?.tipoUsuario || 'COMPRADOR').toUpperCase();

            if (!usuarioId) return;

            if (tipoUsuario === 'COMPRADOR') {
                // Para compradores: contar notificaciones no leídas
                const response = await fetch(`http://localhost:8080/api/notificaciones/usuario/${usuarioId}/no-leidas`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const notificacionesNoLeidas = await response.json();
                    this.updateNotificationsCounter(notificacionesNoLeidas.length);
                    console.log('📨 Notificaciones no leídas:', notificacionesNoLeidas.length);
                }
            } else {
                // Para vendedores: mostrar badge pero sin número específico
                this.updateNotificationsCounter(0);
                console.log('📤 Centro de notificaciones para vendedor configurado');
            }
        } catch (error) {
            console.error('Error cargando contador de notificaciones:', error);
            this.updateNotificationsCounter(0);
        }
    }

    setupSocialButton(socialBtn) {
        const socialCards = socialBtn.querySelectorAll('.social-card');

        socialCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                const social = card.dataset.social;
                this.shareOnSocial(social);

                // Animación de click
                gsap.to(card, {
                    duration: 0.2,
                    scale: 0.9,
                    ease: "power2.out",
                    yoyo: true,
                    repeat: 1
                });
            });
        });
    }

    shareOnSocial(platform) {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent('¡Descubre MinimalStore - Tu ecommerce minimalista!');

        const shareUrls = {
            instagram: '#', // Instagram no permite share directo
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            whatsapp: `https://wa.me/?text=${text} ${url}`
        };

        if (shareUrls[platform] && shareUrls[platform] !== '#') {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    }

    // Método para actualizar contador del carrito desde otras páginas
    updateCartCounter(count) {
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.setAttribute('data-quantity', count);

            // Animar contador si cambió
            if (count > 0 && typeof gsap !== 'undefined') {
                gsap.to(cartBtn, {
                    duration: 0.3,
                    scale: 1.1,
                    ease: "back.out(1.7)",
                    yoyo: true,
                    repeat: 1
                });
            }
        }
    }

    setupCategories() {
        const categoryCards = document.querySelectorAll('.category-card');

        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.navigateToCategory(category);
            });

            // Hover animations
            card.addEventListener('mouseenter', () => {
                gsap.to(card.querySelector('.category-icon'), {
                    duration: 0.3,
                    scale: 1.2,
                    rotation: 10,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card.querySelector('.category-icon'), {
                    duration: 0.3,
                    scale: 1,
                    rotation: 0,
                    ease: "power2.out"
                });
            });
        });
    }

    setupCategoryPatterns() {
        const categoryCards = document.querySelectorAll('.category-card');

        categoryCards.forEach(card => {
            const patterns = card.querySelectorAll('.pattern-element');

            // Animación continua de patrones
            patterns.forEach((pattern, index) => {
                gsap.to(pattern, {
                    duration: 12 + (index * 2),
                    x: `+=${Math.random() * 20 - 10}`,
                    y: `+=${Math.random() * 20 - 10}`,
                    rotation: `+=${Math.random() * 180}`,
                    scale: `+=${Math.random() * 0.3 - 0.15}`,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: index * 0.3
                });
            });

            // Efecto especial en hover con mayor contraste
            card.addEventListener('mouseenter', () => {
                gsap.to(patterns, {
                    duration: 0.6,
                    scale: 1.4,
                    opacity: 0.35,
                    ease: "power2.out"
                });

                gsap.to(card.querySelector('.pattern-bg'), {
                    duration: 0.6,
                    opacity: 0.25,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(patterns, {
                    duration: 0.6,
                    scale: 1,
                    opacity: 0.18,
                    ease: "power2.out"
                });

                gsap.to(card.querySelector('.pattern-bg'), {
                    duration: 0.6,
                    opacity: 0.18,
                    ease: "power2.out"
                });
            });
        });
    }

    setupScrollAnimations() {
        // Animar categorías sin delay - aparición instantánea
        gsap.set('.category-card', {
            opacity: 1,
            visibility: 'visible',
            y: 0
        });

        // Solo animar hover effects, no entrada
        this.setupCategoryPatterns();

        // Animar footer en scroll
        gsap.from('.footer-main > *', {
            duration: 0.6,
            y: 30,
            opacity: 0,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: '.footer-container',
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });
    }

    setupResponsive() {
        let mm = gsap.matchMedia();

        // Desktop
        mm.add("(min-width: 769px)", () => {
            // Efectos adicionales para desktop
        });

        // Mobile
        mm.add("(max-width: 768px)", () => {
            // Simplificar animaciones para móvil
            this.stopCarouselAutoplay();
        });
    }

// Navegación a categorías
    navigateToCategory(category) {
        console.log('Navegando a categoría:', category);

        // Verificar tipo de usuario antes de navegar
        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
        let tipoUsuario = 'COMPRADOR';

        if (userSession) {
            try {
                const userData = JSON.parse(userSession);
                tipoUsuario = (userData.user?.tipousuario || userData.user?.tipoUsuario || 'COMPRADOR').toUpperCase();
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        console.log('Navegando como:', tipoUsuario, 'a categoría:', category);

        // Animación antes de navegar
        const categoryCard = document.querySelector(`[data-category="${category}"]`);
        if (categoryCard && typeof gsap !== 'undefined') {
            gsap.to(categoryCard, {
                duration: 0.3,
                scale: 0.95,
                ease: "power2.inOut",
                onComplete: () => {
                    // Navegar con parámetro de categoría
                    window.location.href = `/categorias?categoria=${category}`;
                }
            });
        } else {
            // Navegación directa si no hay GSAP
            window.location.href = `/categorias?categoria=${category}`;
        }
    }

    showProfileMenu() {
        console.log('Mostrar menú de perfil');
        // Implementar menú de perfil
    }

    openCart() {
        console.log('Abriendo carrito');

        // Verificar si hay productos en el carrito
        const carritoData = localStorage.getItem('carrito');
        const carrito = carritoData ? JSON.parse(carritoData) : [];

        // Animar botón antes de navegar
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn && typeof gsap !== 'undefined') {
            gsap.to(cartBtn, {
                duration: 0.3,
                scale: 0.9,
                ease: "power2.inOut",
                onComplete: () => {
                    window.location.href = '/carrito';
                }
            });
        } else {
            window.location.href = '/carrito';
        }
    }

    toggleFavorites() {
        console.log('Toggle favoritos');
        // Implementar favoritos
    }

    showNotifications() {
        console.log('🔔 Abriendo centro de notificaciones...');

        // Animar botón antes de navegar
        const notificationBtn = document.getElementById('notification-btn');
        if (notificationBtn && typeof gsap !== 'undefined') {
            gsap.to(notificationBtn, {
                duration: 0.3,
                scale: 0.9,
                ease: "power2.inOut",
                onComplete: () => {
                    console.log('Navegando a /notificaciones');
                    window.location.href = '/notificaciones';
                }
            });
        } else {
            console.log('Navegando directamente a /notificaciones');
            window.location.href = '/notificaciones';
        }
    }

    setupCarouselButtons() {
        // Los botones ya están configurados con onclick en el HTML
        // Este método es para futuras mejoras o animaciones adicionales
        console.log('Botones del carrusel configurados');
    }

    setupCarouselNavigation() {
        const prevBtn = document.getElementById('prevSlide');
        const nextBtn = document.getElementById('nextSlide');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }
    }

    nextSlide() {
        const nextSlide = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextSlide);
        this.restartAutoSlide();
    }

    previousSlide() {
        const prevSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevSlide);
        this.restartAutoSlide();
    }

    restartAutoSlide() {
        // Reiniciar el auto-slide cuando se navega manualmente
        this.stopCarouselAutoplay();
        this.startCarouselAutoplay();
    }

} // FINAL DE LA CLASE DashboardPage

// ==================== FUNCIONES GLOBALES ====================

// Función global para usar desde la página de notificaciones
window.actualizarContadorNotificaciones = function(count) {
    // Si el dashboard está cargado, actualizar contador
    if (window.dashboardInstance) {
        window.dashboardInstance.updateNotificationsCounter(count);
    }

    // También disparar evento global
    document.dispatchEvent(new CustomEvent('notificaciones-actualizado', {
        detail: { cantidad: count }
    }));
};

// ==================== INICIALIZACIÓN ====================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardInstance = new DashboardPage();
});

// Manejar resize
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});

// Navegación al perfil
document.addEventListener('DOMContentLoaded', function() {
    const profileBtn = document.getElementById('profile-btn');

    if (profileBtn) {
        profileBtn.addEventListener('click', function(e) {
            e.preventDefault();

            console.log('Navegando a perfil...'); // Debug

            // Animación suave antes de navegar
            if (typeof gsap !== 'undefined') {
                gsap.to(profileBtn, {
                    duration: 0.2,
                    scale: 0.95,
                    ease: "power2.inOut",
                    onComplete: () => {
                        window.location.href = '/perfil';
                    }
                });
            } else {
                // Si no hay GSAP, navegar directamente
                window.location.href = '/perfil';
            }
        });
    }
});
