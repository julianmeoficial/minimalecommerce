// mision-vision.js - Misión y Visión con GSAP avanzado

class MisionVisionPage {
    constructor() {
        this.init();

        // Forzar visibilidad del texto cada 2 segundos
        setInterval(() => {
            this.forceTextVisibility();
            this.forceNavigationVisibility();
        }, 2000);
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

        // Configurar animaciones de scroll
        this.setupScrollAnimations();

        // Configurar animaciones de interacción
        this.setupInteractionAnimations();

        // Configurar responsive
        this.setupResponsive();
    }

    // Función de emergencia para forzar visibilidad de texto
    forceTextVisibility() {
        const textElements = [
            '.mission-text p',
            '.vision-text p',
            '.point-text',
            '.goal-text',
            '.connector-name',
            '.connector-description',
            '.highlight-text',
            '.card-title'
        ];

        textElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '1';
                element.style.visibility = 'visible';
                element.style.display = element.tagName === 'P' ? 'block' : 'inline-block';
                element.style.whiteSpace = 'normal';
                element.style.wordBreak = 'normal';
            });
        });

        console.log('✅ Texto forzado a visible');
    }

    // Función para forzar visibilidad de navegación
    forceNavigationVisibility() {
        const navigationElements = [
            '.navigation-section',
            '.nav-grid',
            '.nav-card',
            '.nav-title',
            '.nav-description',
            '.mission-footer'
        ];

        navigationElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '1';
                element.style.visibility = 'visible';
                element.style.display = selector === '.nav-grid' ? 'grid' : 'block';
            });
        });

        console.log('✅ Navegación final forzada a visible');
    }

    setupInitialAnimations() {
        // Timeline principal
        const tl = gsap.timeline();

        // Logo
        tl.from('.floating-logo', {
            duration: 1,
            y: -80,
            opacity: 0,
            ease: "back.out(1.7)"
        });

        // Header
        tl.from('.mission-header', {
            duration: 1.2,
            y: 60,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.3");

        // Contenedor principal
        tl.from('.mission-content-container', {
            duration: 1.5,
            scale: 0.9,
            opacity: 0,
            ease: "back.out(1.7)"
        }, "-=0.5");
    }

    setupScrambleText() {
        const title = document.querySelector('#scramble-title .title-text');

        if (title) {
            const originalText = title.textContent;

            gsap.from(title, {
                duration: 3,
                scrambleText: {
                    text: originalText,
                    chars: "🎯🌟💡🚀⭐✨🎨🌍",
                    revealDelay: 0.5,
                    speed: 0.3
                },
                ease: "none",
                delay: 1
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
                y: 30,
                rotationX: -90,
                stagger: 0.03,
                ease: "back.out(1.7)",
                delay: 3
            });
        }

        // Animar títulos de sección SIN fragmentar
        const sectionTitles = document.querySelectorAll('.split-title');
        sectionTitles.forEach(title => {
            gsap.from(title, {
                duration: 0.8,
                opacity: 0,
                y: 30,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: title,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                    onComplete: () => {
                        title.style.opacity = '1';
                        title.style.visibility = 'visible';
                    }
                }
            });
        });

        // Animar contenido principal SIN fragmentar
        const contentSections = document.querySelectorAll('.split-content');
        contentSections.forEach(content => {
            const paragraphs = content.querySelectorAll('p');

            paragraphs.forEach((paragraph, index) => {
                // Animación simple sin dividir palabras
                gsap.from(paragraph, {
                    duration: 0.8,
                    opacity: 0,
                    y: 30,
                    ease: "power2.out",
                    delay: index * 0.3,
                    scrollTrigger: {
                        trigger: paragraph,
                        start: "top 90%",
                        toggleActions: "play none none reverse",
                        onComplete: () => {
                            // Asegurar visibilidad final
                            paragraph.style.opacity = '1';
                            paragraph.style.visibility = 'visible';
                        }
                    }
                });
            });
        });

        // Animar puntos de misión SIN fragmentar
        const points = document.querySelectorAll('.split-point');
        points.forEach((point, index) => {
            gsap.from(point, {
                duration: 0.6,
                opacity: 0,
                x: -30,
                ease: "power2.out",
                delay: index * 0.2,
                scrollTrigger: {
                    trigger: point,
                    start: "top 95%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar metas de visión SIN fragmentar
        const goals = document.querySelectorAll('.split-goal');
        goals.forEach((goal, index) => {
            gsap.from(goal, {
                duration: 0.7,
                opacity: 0,
                x: 30,
                ease: "power2.out",
                delay: index * 0.25,
                scrollTrigger: {
                    trigger: goal,
                    start: "top 95%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar elementos conectores SIN fragmentar
        const connectorTexts = document.querySelectorAll('.connector-item .split-text');
        connectorTexts.forEach(text => {
            gsap.from(text, {
                duration: 0.6,
                opacity: 0,
                y: 20,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: text,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar navegación
        const navTexts = document.querySelectorAll('.nav-card .split-text');
        navTexts.forEach(text => {
            const splitText = new SplitText(text, { type: "words" });

            gsap.from(splitText.words, {
                duration: 0.5,
                opacity: 0,
                y: 10,
                stagger: 0.03,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: text,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar footer
        const footer = document.querySelector('.split-footer');
        if (footer) {
            const footerParagraphs = footer.querySelectorAll('p');

            footerParagraphs.forEach(paragraph => {
                const splitFooter = new SplitText(paragraph, { type: "words" });

                gsap.from(splitFooter.words, {
                    duration: 0.8,
                    opacity: 0,
                    y: 20,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: paragraph,
                        start: "top 90%",
                        toggleActions: "play none none reverse"
                    }
                });
            });
        }
    }

    setupScrollAnimations() {
        // Animar tarjetas principales
        const cards = document.querySelectorAll('.mission-card, .vision-card');
        cards.forEach((card, index) => {
            gsap.from(card, {
                duration: 1,
                x: index % 2 === 0 ? -100 : 100,
                opacity: 0,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar elementos conectores
        const connectorItems = document.querySelectorAll('.connector-item');
        gsap.from(connectorItems, {
            duration: 0.8,
            y: 50,
            opacity: 0,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: '.connector-grid',
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });

        // Animar navegación
        const navCards = document.querySelectorAll('.nav-card');
        gsap.from(navCards, {
            duration: 0.8,
            scale: 0.8,
            opacity: 0,
            stagger: 0.2,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: '.nav-grid',
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });

        // Parallax en título
        gsap.to('.mission-title', {
            y: -40,
            scale: 0.95,
            ease: "none",
            scrollTrigger: {
                trigger: '.mission-header',
                start: "top top",
                end: "bottom top",
                scrub: 1
            }
        });
    }

    setupInteractionAnimations() {
        // Hover effects para tarjetas principales
        const mainCards = document.querySelectorAll('.mission-card, .vision-card');
        mainCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.4,
                    rotationY: 3,
                    z: 30,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.4,
                    rotationY: 0,
                    z: 0,
                    ease: "power2.out"
                });
            });
        });

        // Hover effects para puntos y metas
        const interactiveItems = document.querySelectorAll('.point-item, .goal-item');
        interactiveItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                gsap.to(item, {
                    duration: 0.3,
                    scale: 1.02,
                    x: 15,
                    ease: "power2.out"
                });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(item, {
                    duration: 0.3,
                    scale: 1,
                    x: 0,
                    ease: "power2.out"
                });
            });
        });

        // Hover effects para elementos conectores
        const connectorItems = document.querySelectorAll('.connector-item');
        connectorItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                gsap.to(item, {
                    duration: 0.4,
                    rotationY: 10,
                    z: 20,
                    ease: "power2.out"
                });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(item, {
                    duration: 0.4,
                    rotationY: 0,
                    z: 0,
                    ease: "power2.out"
                });
            });
        });

        // Animación especial para iconos
        const icons = document.querySelectorAll('.card-icon, .connector-icon');
        icons.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                gsap.to(icon, {
                    duration: 0.3,
                    scale: 1.2,
                    rotation: 15,
                    ease: "back.out(1.7)"
                });
            });

            icon.addEventListener('mouseleave', () => {
                gsap.to(icon, {
                    duration: 0.3,
                    scale: 1,
                    rotation: 0,
                    ease: "power2.out"
                });
            });
        });
    }

    setupResponsive() {
        let mm = gsap.matchMedia();

        // Desktop - efectos más elaborados
        mm.add("(min-width: 769px)", () => {
            // Efectos parallax más pronunciados
            gsap.to('.ripple-container', {
                rotation: 360,
                ease: "none",
                scrollTrigger: {
                    trigger: '.main-container',
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 2
                }
            });
        });

        // Mobile - simplificar animaciones
        mm.add("(max-width: 768px)", () => {
            gsap.set('.ripple-container', {
                scale: 0.7,
                opacity: 0.4
            });
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new MisionVisionPage();
});

// Manejar resize de ventana
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});
