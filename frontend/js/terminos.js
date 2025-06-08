// terminos.js - Página de Términos y Condiciones con GSAP

class TerminosPage {
    constructor() {
        this.init();
    }

    init() {
        // Registrar plugins de GSAP
        gsap.registerPlugin(ScrollTrigger, TextPlugin);

        // Configurar animaciones iniciales
        this.setupInitialAnimations();

        // Configurar animaciones de scroll
        this.setupScrollAnimations();

        // Configurar hover effects
        this.setupHoverEffects();

        // Configurar navegación
        this.setupNavigation();

        // Configurar animaciones de fondo
        this.setupBackgroundAnimations();

        // Configurar responsive
        this.setupResponsive();

        // Función de seguridad para evitar elementos desaparecidos
        setTimeout(() => {
            this.ensureElementsVisible();
        }, 2000);
    }

    // Asegurarse de que los elementos críticos siempre sean visibles
    // Función de seguridad para mantener elementos visibles
    ensureElementsVisible() {
        const criticalElements = [
            '.terms-title',
            '.terms-content',
            '.terms-navigation',
            '.floating-logo'
        ];

        criticalElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                gsap.set(element, {
                    opacity: 1,
                    visibility: 'visible'
                });
            }
        });
    }

    setupInitialAnimations() {
        // Animación de entrada de la página
        const tl = gsap.timeline();

        // Logo
        tl.from('.floating-logo', {
            duration: 0.8,
            y: -50,
            opacity: 0,
            ease: "back.out(1.7)"
        });

        // Ícono de documento
        tl.from('.document-icon-container', {
            duration: 1,
            y: 100,
            opacity: 0,
            scale: 0.8,
            ease: "back.out(1.7)"
        }, "-=0.5");

        // Título (con clearProps para evitar que desaparezca)
        tl.from('.terms-title', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: "power2.out",
            onComplete: () => {
                gsap.set('.terms-title', {
                    clearProps: "all",
                    opacity: 1,
                    visibility: 'visible'
                });
            }
        }, "-=0.3");

        // Subtítulo
        tl.from('.terms-subtitle', {
            duration: 0.6,
            y: 20,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.2");

        // Contenedores principales
        tl.from('.terms-content', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.4");

        tl.from('.terms-navigation', {
            duration: 0.6,
            x: 50,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.5");
    }

    setupScrollAnimations() {
        // Animar secciones al hacer scroll
        const sections = document.querySelectorAll('.terms-section');

        sections.forEach((section, index) => {
            gsap.from(section, {
                duration: 0.8,
                y: 50,
                opacity: 0,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse",
                    onEnter: () => {
                        section.classList.add('section-visible');
                        this.animateListItems(section);
                    }
                }
            });

            // Animar títulos de sección
            const title = section.querySelector('.section-title');
            if (title) {
                gsap.from(title, {
                    duration: 0.6,
                    x: -30,
                    opacity: 0,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: title,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                });
            }
        });

        // Animación suave del título en scroll (sin afectar opacity)
        gsap.to('.terms-title', {
            y: -20,
            scale: 0.98,
            ease: "none",
            scrollTrigger: {
                trigger: '.terms-header',
                start: "top top",
                end: "bottom top",
                scrub: 1,
                onUpdate: () => {
                    // Forzar que siempre sea visible
                    gsap.set('.terms-title', { opacity: 1, visibility: 'visible' });
                }
            }
        });

        // Efecto parallax en el título
        gsap.to('.title-text', {
            backgroundPosition: '200% center',
            ease: "none",
            scrollTrigger: {
                trigger: '.main-container',
                start: "top bottom",
                end: "bottom top",
                scrub: 2
            }
        });

        // Animación de navegación activa
        this.setupActiveNavigation();
    }

    animateListItems(section) {
        const listItems = section.querySelectorAll('.terms-list li');
        if (listItems.length > 0) {
            gsap.from(listItems, {
                duration: 0.4,
                x: -20,
                opacity: 0,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.3
            });
        }
    }

    setupActiveNavigation() {
        const sections = document.querySelectorAll('.terms-section');
        const navLinks = document.querySelectorAll('.nav-link');

        ScrollTrigger.batch(sections, {
            onEnter: (elements) => {
                const currentSection = elements[0];
                const sectionNumber = currentSection.dataset.section;

                // Actualizar navegación activa
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.dataset.target === sectionNumber) {
                        link.classList.add('active');

                        // Animar link activo
                        gsap.to(link, {
                            duration: 0.3,
                            scale: 1.05,
                            ease: "power2.out",
                            yoyo: true,
                            repeat: 1
                        });
                    }
                });
            },
            start: "top 50%",
            end: "bottom 50%"
        });
    }

    setupHoverEffects() {
        // Hover effect del ícono de documento
        const documentIcon = document.querySelector('.document-icon-container');
        const title = document.querySelector('.terms-title');

        if (documentIcon) {
            documentIcon.addEventListener('mouseenter', () => {
                gsap.to('.work-5', {
                    duration: 0.5,
                    rotationY: 10,
                    ease: "power2.out"
                });

                gsap.to('.document-layer', {
                    duration: 0.5,
                    rotationX: -30,
                    stagger: 0.1,
                    ease: "power2.out"
                });

                gsap.to('.document-front', {
                    duration: 0.5,
                    rotationX: -46,
                    y: 2,
                    ease: "power2.out"
                });
            });

            documentIcon.addEventListener('mouseleave', () => {
                gsap.to('.work-5', {
                    duration: 0.5,
                    rotationY: 0,
                    ease: "power2.out"
                });

                gsap.to('.document-layer', {
                    duration: 0.5,
                    rotationX: 0,
                    ease: "power2.out"
                });

                gsap.to('.document-front', {
                    duration: 0.5,
                    rotationX: 0,
                    y: 0,
                    ease: "power2.out"
                });
            });
        }

        // Hover effect del título
        if (title) {
            title.addEventListener('mouseenter', () => {
                // Asegurar que el título siga visible
                gsap.set(title, { opacity: 1, visibility: 'visible' });

                // Efecto de reflejo sutil
                gsap.fromTo('.title-glass-effect', {
                    left: '-100%'
                }, {
                    duration: 0.6,
                    left: '100%',
                    ease: "power2.out"
                });
            });

            title.addEventListener('mouseleave', () => {
                // Asegurar que el título siga visible
                gsap.set(title, { opacity: 1, visibility: 'visible' });

                // Reset del efecto
                gsap.set('.title-glass-effect', {
                    left: '-100%'
                });
            });
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const targetSection = document.querySelector(`[data-section="${link.dataset.target}"]`);
                if (targetSection) {
                    // Calcular posición correcta
                    const offsetTop = targetSection.getBoundingClientRect().top + window.pageYOffset - 100;

                    // Scroll suave usando scrollTo nativo (más compatible)
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    // Efecto de highlight en la sección
                    gsap.to(targetSection, {
                        duration: 0.3,
                        backgroundColor: 'rgba(52, 73, 94, 0.05)',
                        ease: "power2.out",
                        yoyo: true,
                        repeat: 1
                    });

                    // Actualizar navegación activa
                    navLinks.forEach(nav => nav.classList.remove('active'));
                    link.classList.add('active');
                }
            });

            // Hover effects en navegación
            link.addEventListener('mouseenter', () => {
                if (!link.classList.contains('active')) {
                    gsap.to(link, {
                        duration: 0.3,
                        x: 5,
                        backgroundColor: 'rgba(52, 73, 94, 0.1)',
                        ease: "power2.out"
                    });
                }
            });

            link.addEventListener('mouseleave', () => {
                if (!link.classList.contains('active')) {
                    gsap.to(link, {
                        duration: 0.3,
                        x: 0,
                        backgroundColor: 'transparent',
                        ease: "power2.out"
                    });
                }
            });
        });
    }

    setupBackgroundAnimations() {
        // Animar íconos flotantes (menos estorbosos)
        const floatingIcons = document.querySelectorAll('.floating-icon');

        floatingIcons.forEach((icon, index) => {
            // Posición inicial aleatoria
            gsap.set(icon, {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotation: Math.random() * 45
            });

            // Animación más sutil
            gsap.to(icon, {
                duration: 25 + index * 5,
                x: `+=${Math.random() * 100 - 50}`,
                y: `+=${Math.random() * 100 - 50}`,
                rotation: `+=${Math.random() * 90}`,
                ease: "none",
                repeat: -1,
                yoyo: true
            });

            // Efecto de opacidad más visible
            gsap.to(icon, {
                duration: 4 + index,
                opacity: Math.random() * 0.1 + 0.12,
                ease: "power2.inOut",
                repeat: -1,
                yoyo: true
            });

            // Efecto de escala sutil
            gsap.to(icon, {
                duration: 6 + index,
                scale: Math.random() * 0.3 + 0.9,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });
        });

        // Parallax sutil en el fondo
        gsap.to('.bg-layer', {
            duration: 30,
            backgroundPosition: '100% 100%',
            ease: "none",
            repeat: -1,
            yoyo: true
        });
    }

    setupResponsive() {
        // Configurar animaciones responsivas
        let mm = gsap.matchMedia();

        // Desktop
        mm.add("(min-width: 1025px)", () => {
            // Animaciones completas para desktop
            this.setupDesktopAnimations();
        });

        // Tablet
        mm.add("(max-width: 1024px) and (min-width: 769px)", () => {
            // Animaciones optimizadas para tablet
            this.setupTabletAnimations();
        });

        // Mobile
        mm.add("(max-width: 768px)", () => {
            // Animaciones simplificadas para móvil
            this.setupMobileAnimations();
        });
    }

    setupDesktopAnimations() {
        // Efecto parallax en scroll
        gsap.to('.floating-icons', {
            y: -100,
            ease: "none",
            scrollTrigger: {
                trigger: '.main-container',
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
    }

    setupTabletAnimations() {
        // Animaciones moderadas para tablet
        gsap.set('.floating-icon', {
            opacity: 0.05
        });
    }

    setupMobileAnimations() {
        // Animaciones mínimas para móvil
        gsap.set('.floating-icon', {
            display: 'none'
        });

        // Simplificar animaciones del ícono
        gsap.set('.document-layer', {
            rotationX: 0
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new TerminosPage();
});

// Manejar resize de ventana
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});
