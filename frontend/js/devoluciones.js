// devoluciones.js - Página de Devoluciones con GSAP ScrambleText y SplitText

class DevolucionesPage {
    constructor() {
        this.init();
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

        // Configurar animaciones de fondo
        this.setupBackgroundAnimations();

        // Configurar responsive
        this.setupResponsive();
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
        tl.from('.returns-header', {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.3");

        // Contenedor principal con neumorphism
        tl.from('.returns-content-container', {
            duration: 1.2,
            scale: 0.9,
            opacity: 0,
            ease: "back.out(1.7)"
        }, "-=0.4");

        // Animación de la moneda
        tl.from('.coin-animation-section', {
            duration: 0.8,
            x: -100,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.6");
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
                    chars: "💰💵↩️✅💳🛡️📝💱",
                    revealDelay: 0.4,
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
                y: 20,
                stagger: 0.02,
                ease: "power2.out",
                delay: 3
            });
        }

        // Animar títulos de sección
        const sectionTitles = document.querySelectorAll('.split-title');
        sectionTitles.forEach(title => {
            gsap.from(title, {
                duration: 0.8,
                opacity: 0,
                x: -30,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: title,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar contenido de secciones
        const sectionContents = document.querySelectorAll('.split-content');
        sectionContents.forEach(content => {
            const splitContent = new SplitText(content, { type: "lines,words" });

            gsap.from(splitContent.words, {
                duration: 0.6,
                opacity: 0,
                y: 15,
                stagger: 0.02,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: content,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar listas
        const lists = document.querySelectorAll('.split-list');
        lists.forEach(list => {
            const listItems = list.querySelectorAll('li');

            listItems.forEach(item => {
                const splitItem = new SplitText(item, { type: "words" });

                gsap.from(splitItem.words, {
                    duration: 0.5,
                    opacity: 0,
                    x: -20,
                    stagger: 0.03,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: item,
                        start: "top 95%",
                        toggleActions: "play none none reverse"
                    }
                });
            });
        });

        // Animar textos de la moneda
        const coinTexts = document.querySelectorAll('.coin-text .split-text');
        coinTexts.forEach(text => {
            const splitText = new SplitText(text, { type: "words" });

            gsap.from(splitText.words, {
                duration: 0.6,
                opacity: 0,
                y: 20,
                stagger: 0.1,
                ease: "power2.out",
                delay: 1.5
            });
        });

        // Animar sección de envíos
        const shippingTexts = document.querySelectorAll('.shipping-card .split-text');
        shippingTexts.forEach(text => {
            const splitText = new SplitText(text, { type: "words" });

            gsap.from(splitText.words, {
                duration: 0.6,
                opacity: 0,
                y: 10,
                stagger: 0.05,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: text,
                    start: "top 90%",
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
                    duration: 0.6,
                    opacity: 0,
                    y: 10,
                    stagger: 0.05,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: paragraph,
                        start: "top 95%",
                        toggleActions: "play none none reverse"
                    }
                });
            });
        }
    }

    setupScrollAnimations() {
        // Animar secciones al hacer scroll
        const sections = document.querySelectorAll('.returns-section');

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
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar botón de envíos
        gsap.from('.shipping-button', {
            duration: 0.6,
            scale: 0.8,
            opacity: 0,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: '.shipping-button',
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });

        // Efecto parallax en el título
        gsap.to('.returns-title', {
            y: -30,
            scale: 0.98,
            ease: "none",
            scrollTrigger: {
                trigger: '.returns-header',
                start: "top top",
                end: "bottom top",
                scrub: 1
            }
        });
    }

    setupBackgroundAnimations() {
        // Animar patrones de fondo
        const patterns = document.querySelectorAll('.pattern-element');

        patterns.forEach((pattern, index) => {
            gsap.to(pattern, {
                duration: 15 + index * 3,
                x: `+=${Math.random() * 100 - 50}`,
                y: `+=${Math.random() * 100 - 50}`,
                rotation: `+=${Math.random() * 180}`,
                ease: "none",
                repeat: -1,
                yoyo: true
            });
        });

        // Efecto especial en hover de secciones
        const returnsSections = document.querySelectorAll('.returns-section');

        returnsSections.forEach(section => {
            section.addEventListener('mouseenter', () => {
                gsap.to(section, {
                    duration: 0.3,
                    scale: 1.02,
                    ease: "power2.out"
                });
            });

            section.addEventListener('mouseleave', () => {
                gsap.to(section, {
                    duration: 0.3,
                    scale: 1,
                    ease: "power2.out"
                });
            });
        });

        // Hover effect en tarjeta de envíos
        const shippingCard = document.querySelector('.shipping-card');
        if (shippingCard) {
            shippingCard.addEventListener('mouseenter', () => {
                gsap.to(shippingCard, {
                    duration: 0.4,
                    rotationY: 5,
                    z: 50,
                    ease: "power2.out"
                });
            });

            shippingCard.addEventListener('mouseleave', () => {
                gsap.to(shippingCard, {
                    duration: 0.4,
                    rotationY: 0,
                    z: 0,
                    ease: "power2.out"
                });
            });
        }

        // Animación especial para la moneda en hover
        const coinWrapper = document.querySelector('.coin-wrapper');
        if (coinWrapper) {
            coinWrapper.addEventListener('mouseenter', () => {
                gsap.to('.coin-border', {
                    duration: 0.5,
                    scale: 1.2,
                    ease: "back.out(1.7)"
                });

                gsap.to('.coin-symbol', {
                    duration: 0.3,
                    scale: 1.3,
                    color: '#d4af37',
                    ease: "power2.out"
                });
            });

            coinWrapper.addEventListener('mouseleave', () => {
                gsap.to('.coin-border', {
                    duration: 0.5,
                    scale: 1,
                    ease: "power2.out"
                });

                gsap.to('.coin-symbol', {
                    duration: 0.3,
                    scale: 1,
                    color: '#8b4513',
                    ease: "power2.out"
                });
            });
        }
    }

    setupResponsive() {
        let mm = gsap.matchMedia();

        // Desktop
        mm.add("(min-width: 769px)", () => {
            // Efectos de parallax más pronunciados en desktop
            gsap.to('.pattern-element', {
                y: -50,
                ease: "none",
                scrollTrigger: {
                    trigger: '.main-container',
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });
        });

        // Mobile
        mm.add("(max-width: 768px)", () => {
            // Simplificar animaciones para móvil
            gsap.set('.pattern-element', {
                scale: 0.8,
                opacity: 0.04
            });
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new DevolucionesPage();
});

// Manejar resize de ventana
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});
