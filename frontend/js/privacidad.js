// privacidad.js - Página de Política de Privacidad con GSAP ScrambleText y SplitText

class PrivacidadPage {
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

        // Configurar navegación
        this.setupNavigation();

        // Configurar animaciones de fondo
        this.setupBackgroundAnimations();

        // Configurar responsive
        this.setupResponsive();
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

        // Header
        tl.from('.privacy-header', {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.3");

        // Contenedores principales
        tl.from('.privacy-content', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.4");

        tl.from('.privacy-navigation', {
            duration: 0.6,
            x: 50,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.5");
    }

    setupScrambleText() {
        const title = document.querySelector('#scramble-title .title-text');

        if (title) {
            // Configurar texto inicial
            const originalText = title.textContent;

            // Efecto de entrada con ScrambleText
            gsap.from(title, {
                duration: 2,
                scrambleText: {
                    text: originalText,
                    chars: "🔒🛡️🔑🔐👁️",
                    revealDelay: 0.5,
                    speed: 0.3
                },
                ease: "none",
                delay: 1
            });

            // Efecto hover con ScrambleText
            title.addEventListener('mouseenter', () => {
                gsap.to(title, {
                    duration: 1,
                    scrambleText: {
                        text: originalText,
                        chars: "🔒🛡️🔑🔐",
                        revealDelay: 0.2,
                        speed: 0.5
                    },
                    ease: "none"
                });
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
                delay: 2.5
            });
        }

        // Animar títulos de sección
        const sectionTitles = document.querySelectorAll('.split-title');
        sectionTitles.forEach(title => {
            const splitTitle = new SplitText(title, { type: "words" });

            gsap.from(splitTitle.words, {
                duration: 0.6,
                opacity: 0,
                y: 20,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: title,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar contenido de secciones
        const sectionContents = document.querySelectorAll('.split-content');
        sectionContents.forEach(content => {
            const paragraphs = content.querySelectorAll('p');

            paragraphs.forEach((paragraph, index) => {
                const splitParagraph = new SplitText(paragraph, { type: "lines,words" });

                gsap.from(splitParagraph.words, {
                    duration: 0.8,
                    opacity: 0,
                    y: 15,
                    stagger: 0.02,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: paragraph,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    },
                    delay: index * 0.1
                });
            });
        });

        // Animar listas
        const lists = document.querySelectorAll('.split-list');
        lists.forEach(list => {
            const listItems = list.querySelectorAll('li');

            listItems.forEach(item => {
                const splitItem = new SplitText(item, { type: "words" });

                gsap.from(splitItem.words, {
                    duration: 0.6,
                    opacity: 0,
                    x: -20,
                    stagger: 0.03,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: item,
                        start: "top 90%",
                        toggleActions: "play none none reverse"
                    }
                });
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
        // Animación del título en scroll
        gsap.to('.privacy-title', {
            y: -20,
            scale: 0.98,
            ease: "none",
            scrollTrigger: {
                trigger: '.privacy-header',
                start: "top top",
                end: "bottom top",
                scrub: 1
            }
        });

        // Animar secciones al hacer scroll
        const sections = document.querySelectorAll('.privacy-section');

        sections.forEach((section, index) => {
            gsap.from(section, {
                duration: 0.8,
                y: 30,
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

        // Navegación activa
        this.setupActiveNavigation();
    }

    setupActiveNavigation() {
        const sections = document.querySelectorAll('.privacy-section');
        const navLinks = document.querySelectorAll('.nav-link');

        ScrollTrigger.batch(sections, {
            onEnter: (elements) => {
                const currentSection = elements[0];
                const sectionNumber = currentSection.dataset.section;

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.dataset.target === sectionNumber) {
                        link.classList.add('active');

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

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const targetSection = document.querySelector(`[data-section="${link.dataset.target}"]`);
                if (targetSection) {
                    const offsetTop = targetSection.getBoundingClientRect().top + window.pageYOffset - 100;

                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    gsap.to(targetSection, {
                        duration: 0.3,
                        backgroundColor: 'rgba(52, 152, 219, 0.05)',
                        ease: "power2.out",
                        yoyo: true,
                        repeat: 1
                    });

                    navLinks.forEach(nav => nav.classList.remove('active'));
                    link.classList.add('active');
                }
            });

            link.addEventListener('mouseenter', () => {
                if (!link.classList.contains('active')) {
                    gsap.to(link, {
                        duration: 0.3,
                        x: 5,
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
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
        const securityIcons = document.querySelectorAll('.security-icon');

        securityIcons.forEach((icon, index) => {
            // Posición inicial aleatoria
            gsap.set(icon, {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotation: Math.random() * 45
            });

            // Animación más sutil para iconos de seguridad
            gsap.to(icon, {
                duration: 30 + index * 3,
                x: `+=${Math.random() * 80 - 40}`,
                y: `+=${Math.random() * 80 - 40}`,
                rotation: `+=${Math.random() * 60}`,
                ease: "none",
                repeat: -1,
                yoyo: true
            });

            // Efecto de opacidad para crear profundidad
            gsap.to(icon, {
                duration: 5 + index,
                opacity: Math.random() * 0.08 + 0.05,
                ease: "power2.inOut",
                repeat: -1,
                yoyo: true
            });

            // Efecto de escala muy sutil
            gsap.to(icon, {
                duration: 8 + index,
                scale: Math.random() * 0.2 + 0.9,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });
        });

        // Parallax sutil en el fondo
        gsap.to('.bg-layer', {
            duration: 40,
            backgroundPosition: '100% 100%',
            ease: "none",
            repeat: -1,
            yoyo: true
        });
    }

    setupResponsive() {
        let mm = gsap.matchMedia();

        // Desktop
        mm.add("(min-width: 1025px)", () => {
            gsap.to('.security-icons', {
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
            gsap.set('.security-icon', {
                display: 'none'
            });
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PrivacidadPage();
});

// Manejar resize de ventana
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});
