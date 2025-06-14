// historia.js - Timeline de Historia con GSAP avanzado

class HistoriaPage {
    constructor() {
        this.masterTimeline = null;
        this.init();

        // Verificación periódica de visibilidad
        setInterval(() => {
            this.forceElementsVisible();
        }, 2000);
    }

    init() {
        // Registrar plugins de GSAP
        gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText);

        // Crear timeline maestro
        this.createMasterTimeline();

        // Configurar responsive
        this.setupResponsive();
    }

    /**
     * Forzar visibilidad de elementos críticos para evitar problemas de scroll
     * y asegurar que la experiencia del usuario no se vea afectada por animaciones.
     */
    // Función para forzar visibilidad de elementos críticos
    forceElementsVisible() {
        // Elementos que deben permanecer siempre visibles
        const criticalElements = [
            '.timeline-container',
            '.timeline-card',
            '.timeline-content',
            '.timeline-year-badge',
            '.values-container',
            '.value-card',
            '.history-header'
        ];

        criticalElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '1';
                element.style.visibility = 'visible';
                element.style.display = element.classList.contains('timeline-container') ? 'block' :
                    element.classList.contains('values-container') ? 'block' :
                        element.classList.contains('timeline-year-badge') ? 'block' :
                            element.style.display || 'block';
            });
        });

        // Forzar específicamente los badges de año
        const yearBadges = document.querySelectorAll('.timeline-year-badge');
        yearBadges.forEach(badge => {
            badge.style.opacity = '1';
            badge.style.visibility = 'visible';
            badge.style.display = 'block';
            badge.style.transform = 'scale(1)';
        });

        console.log('✅ Elementos críticos y badges forzados a visible');
    }

    createMasterTimeline() {
        // Primero forzar visibilidad de elementos clave
        this.forceElementsVisible();

        // Timeline maestro que controlará toda la secuencia
        this.masterTimeline = gsap.timeline({
            onComplete: () => {
                // Asegurar que todo permanezca visible al final
                this.forceElementsVisible();
            }
        });

        // Agregar subtimelines en secuencia
        this.masterTimeline
            .add(this.createIntroTimeline())
            .add(this.createTimelineAnimation(), "+=0.5")
            .add(this.createValuesAnimation(), "+=1");

        // Configurar animaciones de scroll independientes
        this.setupScrollAnimations();
    }

    createIntroTimeline() {
        const introTL = gsap.timeline();

        // Logo
        introTL.from('.floating-logo', {
            duration: 1,
            y: -100,
            opacity: 0,
            ease: "back.out(1.7)"
        });

        // Título con ScrambleText
        introTL.add(() => {
            this.setupScrambleText();
        }, "-=0.5");

        // Header container
        introTL.from('.history-header', {
            duration: 1.2,
            y: 80,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.8");

        // Subtítulo con SplitText
        introTL.add(() => {
            this.setupSubtitleAnimation();
        }, "-=0.5");

        return introTL;
    }

    createTimelineAnimation() {
        const timelineTL = gsap.timeline();

        // Línea de tiempo central
        timelineTL.fromTo('.timeline-line', {
            scaleY: 0,
            transformOrigin: "top"
        }, {
            duration: 2,
            scaleY: 1,
            ease: "power2.out"
        });

        // Animar eventos de timeline secuencialmente
        const events = document.querySelectorAll('.timeline-event');

        events.forEach((event, index) => {
            const isLeft = event.classList.contains('timeline-left');

            timelineTL.from(event.querySelector('.timeline-card'), {
                duration: 0.8,
                x: isLeft ? -100 : 100,
                opacity: 0,
                scale: 0.8,
                ease: "back.out(1.7)"
            }, `-=${index === 0 ? 1.5 : 0.3}`);

            timelineTL.from(event.querySelector('.timeline-year'), {
                duration: 0.5,
                scale: 0,
                opacity: 0,
                ease: "back.out(2)"
            }, "-=0.5");

            // Agregar animación de texto para cada evento
            timelineTL.add(() => {
                this.animateEventContent(event);
            }, "-=0.3");

            // Forzar visibilidad después de cada animación
            timelineTL.call(() => {
                event.style.opacity = '1';
                event.style.visibility = 'visible';
                const card = event.querySelector('.timeline-card');
                if (card) {
                    card.style.opacity = '1';
                    card.style.visibility = 'visible';
                }
            });
        });

        return timelineTL;
    }

    createValuesAnimation() {
        const valuesTL = gsap.timeline();

        // Container de valores
        valuesTL.from('.values-container', {
            duration: 1,
            y: 100,
            opacity: 0,
            ease: "power2.out"
        });

        // Título de valores
        valuesTL.from('.values-title', {
            duration: 0.8,
            scale: 0.5,
            opacity: 0,
            ease: "back.out(1.7)"
        }, "-=0.5");

        // Cards de valores con stagger
        valuesTL.from('.value-card', {
            duration: 0.6,
            y: 50,
            opacity: 0,
            scale: 0.9,
            stagger: 0.2,
            ease: "power2.out"
        }, "-=0.3");

        return valuesTL;
    }

    setupScrambleText() {
        const title = document.querySelector('#scramble-title .title-text');

        if (title) {
            const originalText = title.textContent;

            gsap.from(title, {
                duration: 3,
                scrambleText: {
                    text: originalText,
                    chars: "✨🎨🚀💫⭐🌟💎🔮",
                    revealDelay: 0.5,
                    speed: 0.3
                },
                ease: "none"
            });
        }
    }

    setupSubtitleAnimation() {
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
                delay: 2
            });
        }
    }

    animateEventContent(event) {
        const title = event.querySelector('.timeline-title');
        const content = event.querySelector('.timeline-text');

        if (title) {
            const splitTitle = new SplitText(title, { type: "words" });
            gsap.from(splitTitle.words, {
                duration: 0.6,
                opacity: 0,
                y: 20,
                stagger: 0.1,
                ease: "power2.out"
            });
        }

        if (content) {
            const splitContent = new SplitText(content, { type: "lines,words" });
            gsap.from(splitContent.words, {
                duration: 0.5,
                opacity: 0,
                x: -10,
                stagger: 0.02,
                ease: "power2.out",
                delay: 0.3
            });
        }
    }

    setupScrollAnimations() {
        // Parallax para el fondo cósmico
        gsap.to('.cosmic-container', {
            rotation: 360,
            ease: "none",
            scrollTrigger: {
                trigger: '.main-container',
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });

        // Efectos de hover para cards de timeline
        const timelineCards = document.querySelectorAll('.timeline-card');
        timelineCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.3,
                    scale: 1.05,
                    z: 50,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.3,
                    scale: 1,
                    z: 0,
                    ease: "power2.out"
                });
            });
        });

        // Animación de valores en scroll
        const valueCards = document.querySelectorAll('.value-card');
        valueCards.forEach((card, index) => {
            const valueTexts = card.querySelectorAll('.split-text');

            valueTexts.forEach(text => {
                const splitText = new SplitText(text, { type: "words" });

                gsap.from(splitText.words, {
                    duration: 0.6,
                    opacity: 0,
                    y: 20,
                    stagger: 0.05,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                });
            });

            // Hover effects para value cards con delay escalonado
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.4,
                    rotationY: 10,
                    z: 30,
                    ease: "power2.out",
                    delay: index * 0.005 // Efecto cascada
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

        // Footer animation
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

        // Efecto parallax en título principal
        gsap.to('.history-title', {
            y: -50,
            scale: 0.95,
            ease: "none",
            scrollTrigger: {
                trigger: '.history-header',
                start: "top top",
                end: "bottom top",
                scrub: 1
            }
        });
    }

    setupResponsive() {
        let mm = gsap.matchMedia();

        // Desktop - efectos más elaborados
        mm.add("(min-width: 1025px)", () => {
            // Efectos 3D más pronunciados
            const timelineCards = document.querySelectorAll('.timeline-card');
            timelineCards.forEach(card => {
                ScrollTrigger.create({
                    trigger: card,
                    start: "top 80%",
                    end: "bottom 20%",
                    onEnter: () => {
                        gsap.to(card, {
                            duration: 0.8,
                            rotationY: 5,
                            z: 20,
                            ease: "power2.out"
                        });
                    },
                    onLeave: () => {
                        gsap.to(card, {
                            duration: 0.8,
                            rotationY: 0,
                            z: 0,
                            ease: "power2.out"
                        });
                    }
                });
            });
        });

        // Mobile - simplificar animaciones
        mm.add("(max-width: 768px)", () => {
            // Reducir complejidad de animaciones
            gsap.set('.cosmic-container', {
                scale: 0.6,
                opacity: 0.1
            });
        });
    }

    // Métodos de control público
    playTimeline() {
        this.masterTimeline.play();
    }

    pauseTimeline() {
        this.masterTimeline.pause();
    }

    restartTimeline() {
        this.masterTimeline.restart();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const historiaPage = new HistoriaPage();

    // Controles de debug (remover en producción)
    window.historiaTimeline = historiaPage;
});

// Manejar resize de ventana
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});
