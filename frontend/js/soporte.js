// soporte.js - Página de Soporte con GSAP y ScrambleText

class SoportePage {
    constructor() {
        this.currentSection = 'compradores';

        // FORZAR INMEDIATAMENTE antes de cualquier animación
        this.forceCompradoresInmediato();

        this.init();
    }

    // Función para forzar compradores INMEDIATAMENTE
    forceCompradoresInmediato() {
        const compradoresSection = document.getElementById('compradores-section');
        const vendedoresSection = document.getElementById('vendedores-section');
        const compradoresBtn = document.querySelector('.nav-btn[data-target="compradores"]');

        // Forzar compradores visible INMEDIATAMENTE
        if (compradoresSection) {
            compradoresSection.classList.add('active');
            compradoresSection.style.display = 'block';
            compradoresSection.style.opacity = '1';
            compradoresSection.style.visibility = 'visible';
            compradoresSection.style.transform = 'translateY(0)';
        }

        // Ocultar vendedores
        if (vendedoresSection) {
            vendedoresSection.classList.remove('active');
            vendedoresSection.style.display = 'none';
        }

        // Activar botón de compradores
        if (compradoresBtn) {
            compradoresBtn.classList.add('active');
        }

        console.log('✅ Compradores forzado a visible INMEDIATAMENTE');
    }

    // Función para limpiar todas las secciones
    clearAllSections() {
        const allSections = document.querySelectorAll('.support-section');

        allSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
            section.style.position = 'absolute';
            section.style.left = '-9999px';
        });

        console.log('🧹 Todas las secciones limpiadas');
    }

    init() {
        // Registrar plugins de GSAP
        gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText);

        // Configurar animaciones iniciales
        this.setupInitialAnimations();

        // Configurar ScrambleText para el título
        this.setupScrambleText();

        // Configurar SplitText para el contenido
        this.setupSplitText();

        // Configurar navegación entre secciones
        this.setupNavigation();

        // Configurar FAQ
        this.setupFAQ();

        // Configurar popup
        this.setupPopup();
    }
    // Función para forzar visibilidad inicial de compradores
    forceCompradoresVisible() {
        const compradoresSection = document.getElementById('compradores-section');
        const vendedoresSection = document.getElementById('vendedores-section');
        const compradoresBtn = document.querySelector('.nav-btn[data-target="compradores"]');
        const vendedoresBtn = document.querySelector('.nav-btn[data-target="vendedores"]');

        // Solo configurar estado inicial, no forzar estilos
        if (compradoresSection) {
            compradoresSection.classList.add('active');
        }

        if (vendedoresSection) {
            vendedoresSection.classList.remove('active');
        }

        // Asegurar botones correctos
        if (compradoresBtn) {
            compradoresBtn.classList.add('active');
        }
        if (vendedoresBtn) {
            vendedoresBtn.classList.remove('active');
        }

        this.currentSection = 'compradores';

        console.log('Estado inicial configurado para compradores');
    }

    setupInitialAnimations() {
        // Timeline principal
        const tl = gsap.timeline();

        // Logo
        tl.from('.floating-logo', {
            duration: 0.8,
            y: -50,
            opacity: 0,
            ease: "back.out(1.7)"
        });

        // Header
        tl.from('.support-header', {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.3");

        // Navegación
        tl.from('.support-navigation', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.4");

        // Forzar sección activa de compradores
        tl.call(() => {
            this.forceCompradoresVisible();
        });

        tl.from('.support-section.active', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.3");
    }

    setupScrambleText() {
        const title = document.querySelector('#scramble-title .title-text');

        if (title) {
            const originalText = title.textContent;

            // Efecto de entrada con ScrambleText
            gsap.from(title, {
                duration: 2.5,
                scrambleText: {
                    text: originalText,
                    chars: "🔒🛡️🔑💬📞📧❓❗",
                    revealDelay: 0.3,
                    speed: 0.4
                },
                ease: "none",
                delay: 1.2
            });
        }
    }

    setupSplitText() {
        // Animar subtítulo
        const subtitle = document.querySelector('.split-subtitle');
        if (subtitle) {
            const splitSubtitle = new SplitText(subtitle, { type: "words,chars" });

            gsap.from(splitSubtitle.chars, {
                duration: 0.8,
                opacity: 0,
                y: 20,
                stagger: 0.03,
                ease: "power2.out",
                delay: 3
            });
        }

        // Animar títulos de sección SIN SplitText para evitar espacios pegados
        const sectionTitles = document.querySelectorAll('.split-title');
        sectionTitles.forEach(title => {
            // Animación simple sin dividir palabras
            gsap.from(title, {
                duration: 0.8,
                opacity: 0,
                y: 30,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: title,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    }

    setupNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.support-section');

        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;

                // LIMPIAR ESTADO ANTERIOR
                this.clearAllSections();

                // Actualizar botones activos
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Cambiar sección
                this.switchSection(target);

                // Animación del botón
                gsap.to(btn, {
                    duration: 0.3,
                    scale: 0.95,
                    ease: "power2.out",
                    yoyo: true,
                    repeat: 1
                });
            });
        });
    }

    switchSection(targetSection) {
        const allSections = document.querySelectorAll('.support-section');
        const newSection = document.getElementById(`${targetSection}-section`);

        if (!newSection) return;

        // PASO 1: Ocultar TODAS las secciones inmediatamente
        allSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
        });

        // PASO 2: Mostrar solo la sección objetivo
        setTimeout(() => {
            newSection.classList.add('active');
            newSection.style.display = 'block';
            newSection.style.opacity = '1';
            newSection.style.visibility = 'visible';
            newSection.style.transform = 'translateY(0)';

            // Animación suave de entrada
            gsap.fromTo(newSection, {
                opacity: 0,
                y: 20
            }, {
                duration: 0.5,
                opacity: 1,
                y: 0,
                ease: "power2.out"
            });

            this.currentSection = targetSection;
        }, 50);

        // Marcar que ya se cambió de sección
        document.body.classList.add('section-switched');
    }

    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Cerrar otros FAQs
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        this.animateFAQClose(otherItem);
                    }
                });

                // Toggle FAQ actual
                if (isActive) {
                    item.classList.remove('active');
                    this.animateFAQClose(item);
                } else {
                    item.classList.add('active');
                    this.animateFAQOpen(item);
                }
            });
        });
    }

    animateFAQOpen(item) {
        const answer = item.querySelector('.faq-answer');
        const content = answer.innerHTML;

        // Crear SplitText para la respuesta
        const splitAnswer = new SplitText(answer, { type: "lines,words" });

        // Animar apertura
        gsap.fromTo(splitAnswer.words, {
            opacity: 0,
            y: 10
        }, {
            duration: 0.6,
            opacity: 1,
            y: 0,
            stagger: 0.02,
            ease: "power2.out",
            delay: 0.2
        });
    }

    animateFAQClose(item) {
        const answer = item.querySelector('.faq-answer');

        gsap.to(answer.children, {
            duration: 0.3,
            opacity: 0,
            y: -10,
            stagger: 0.01,
            ease: "power2.in"
        });
    }

    setupPopup() {
        const popupBtns = document.querySelectorAll('.other-problems-btn');
        const popupOverlay = document.getElementById('popup-overlay');
        const closeBtn = document.getElementById('close-popup');
        const cardTitle = document.getElementById('card-title');
        const cardEmail = document.getElementById('card-email');

        // Configurar botones de apertura
        popupBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                const userType = btn.dataset.userType;
                this.openPopup(userType);

                // Animación del botón
                gsap.to(btn, {
                    duration: 0.4,
                    scale: 1.1,
                    ease: "back.out(2)",
                    yoyo: true,
                    repeat: 1
                });
            });
        });

        // Botón de cierre
        closeBtn.addEventListener('click', () => {
            this.closePopup();
        });

        // Cerrar al hacer clic fuera
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                this.closePopup();
            }
        });
    }

    openPopup(userType) {
        const popupOverlay = document.getElementById('popup-overlay');
        const cardTitle = document.getElementById('card-title');
        const cardEmail = document.getElementById('card-email');

        // Configurar contenido según tipo de usuario
        if (userType === 'compradores') {
            cardTitle.textContent = 'Soporte Compradores';
            cardEmail.textContent = 'soporte-compradores@minimalstore.com';
        } else {
            cardTitle.textContent = 'Soporte Vendedores';
            cardEmail.textContent = 'soporte-vendedores@minimalstore.com';
        }

        // Mostrar overlay
        popupOverlay.classList.add('active');

        // Timeline de animación
        const tl = gsap.timeline();

        // Animación de ondas expandiéndose
        tl.fromTo('.wave-animation', {
            scale: 0,
            rotation: 0
        }, {
            duration: 1.5,
            scale: 3,
            rotation: 360,
            stagger: 0.2,
            ease: "power2.out"
        });

        // Animación de la tarjeta
        tl.fromTo('.support-card', {
            scale: 0,
            rotation: 180,
            opacity: 0
        }, {
            duration: 0.8,
            scale: 1,
            rotation: 0,
            opacity: 1,
            ease: "back.out(1.7)"
        }, "-=1");

        // Animar contenido de la tarjeta
        tl.from('.card-icon, .card-title, .card-email, .card-info', {
            duration: 0.6,
            y: 20,
            opacity: 0,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.4");
    }

    closePopup() {
        const popupOverlay = document.getElementById('popup-overlay');

        // Timeline de cierre
        const tl = gsap.timeline({
            onComplete: () => {
                popupOverlay.classList.remove('active');
            }
        });

        // Animar salida de tarjeta
        tl.to('.support-card', {
            duration: 0.5,
            scale: 0,
            rotation: -180,
            opacity: 0,
            ease: "back.in(1.7)"
        });

        // Animar salida de ondas
        tl.to('.wave-animation', {
            duration: 0.8,
            scale: 0,
            rotation: 0,
            stagger: 0.1,
            ease: "power2.in"
        }, "-=0.3");
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SoportePage();
});

// Manejar resize de ventana
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});
