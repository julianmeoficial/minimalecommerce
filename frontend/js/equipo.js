// equipo.js - Página de Equipo con GSAP y Hover Effects Avanzados

class EquipoPage {
    constructor() {
        this.init();

        // Forzar visibilidad periódicamente
        setInterval(() => {
            this.forceCreatorsVisibility();
        }, 1000);
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

        // Configurar efectos de hover avanzados
        this.setupAdvancedHoverEffects();

        // Configurar responsive
        this.setupResponsive();

        // Forzar visibilidad
        this.forceVisibility();
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
        tl.from('.team-header', {
            duration: 1.2,
            y: 60,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.3");

        // Secciones principales
        tl.from('.team-intro-section', {
            duration: 1,
            scale: 0.9,
            opacity: 0,
            ease: "back.out(1.7)"
        }, "-=0.4");
    }

    setupScrambleText() {
        const title = document.querySelector('#scramble-title .title-text');

        if (title) {
            const originalText = title.textContent;

            gsap.from(title, {
                duration: 3,
                scrambleText: {
                    text: originalText,
                    chars: "👥💼🚀⭐🎯💡🏆🌟",
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

        // Animar títulos de sección
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
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar contenido de introducción
        const introContent = document.querySelector('.split-content');
        if (introContent) {
            const paragraphs = introContent.querySelectorAll('p');

            paragraphs.forEach((paragraph, index) => {
                gsap.from(paragraph, {
                    duration: 0.8,
                    opacity: 0,
                    y: 30,
                    ease: "power2.out",
                    delay: index * 0.3,
                    scrollTrigger: {
                        trigger: paragraph,
                        start: "top 90%",
                        toggleActions: "play none none reverse"
                    }
                });
            });
        }

        // Animar estadísticas
        const stats = document.querySelectorAll('.split-stat');
        stats.forEach((stat, index) => {
            gsap.from(stat, {
                duration: 0.8,
                scale: 0.8,
                opacity: 0,
                ease: "back.out(1.7)",
                delay: index * 0.2,
                scrollTrigger: {
                    trigger: stat,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar nombres de miembros
        const memberNames = document.querySelectorAll('.split-name');
        memberNames.forEach(name => {
            const splitName = new SplitText(name, { type: "chars" });

            gsap.from(splitName.chars, {
                duration: 0.6,
                opacity: 0,
                y: 20,
                stagger: 0.05,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: name,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar roles
        const memberRoles = document.querySelectorAll('.split-role');
        memberRoles.forEach(role => {
            gsap.from(role, {
                duration: 0.6,
                opacity: 0,
                x: 20,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: role,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar skills
        const skills = document.querySelectorAll('.split-skill');
        skills.forEach((skill, index) => {
            gsap.from(skill, {
                duration: 0.5,
                scale: 0,
                opacity: 0,
                ease: "back.out(1.7)",
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: skill.closest('.member-skills'),
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar descripciones
        const descriptions = document.querySelectorAll('.split-description');
        descriptions.forEach(desc => {
            gsap.from(desc, {
                duration: 0.8,
                opacity: 0,
                y: 20,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: desc,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar elementos de colaboración
        const collabTexts = document.querySelectorAll('.collaboration-section .split-text');
        collabTexts.forEach(text => {
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

        // Animar resultado de colaboración
        const resultSection = document.querySelector('.split-result');
        if (resultSection) {
            gsap.from(resultSection, {
                duration: 1,
                scale: 0.9,
                opacity: 0,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: resultSection,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        }

        // Animar navegación
        const navTexts = document.querySelectorAll('.nav-card .split-text');
        navTexts.forEach(text => {
            gsap.from(text, {
                duration: 0.5,
                opacity: 0,
                y: 10,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: text,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar todo el texto del contenido principal//
        const textContents = document.querySelectorAll('p:not(.split-content p)');
        textContents.forEach((text, index) => {
            const splitText = new SplitText(text, { type: "words" });

            gsap.from(splitText.words, {
                duration: 0.6,
                opacity: 0,
                y: 20,
                stagger: 0.02,
                ease: "power2.out",
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: text,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar texto de cards de miembros
        const memberTexts = document.querySelectorAll('.member-description p');
        memberTexts.forEach(text => {
            const splitText = new SplitText(text, { type: "words" });

            gsap.from(splitText.words, {
                duration: 0.5,
                opacity: 0,
                y: 15,
                stagger: 0.03,
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

            // Animar containers de texto con neumorphism
            const textCards = document.querySelectorAll('.split-card');
            textCards.forEach((card, index) => {
                // Animación de entrada
                gsap.from(card, {
                    duration: 0.8,
                    y: 50,
                    opacity: 0,
                    scale: 0.95,
                    ease: "back.out(1.7)",
                    delay: index * 0.3,
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                });

                // Animación del texto dentro de la card
                const cardText = card.querySelector('.split-text');
                if (cardText) {
                    const splitCardText = new SplitText(cardText, { type: "words" });

                    gsap.from(splitCardText.words, {
                        duration: 0.6,
                        opacity: 0,
                        y: 20,
                        stagger: 0.02,
                        ease: "power2.out",
                        delay: (index * 0.3) + 0.4,
                        scrollTrigger: {
                            trigger: card,
                            start: "top 85%",
                            toggleActions: "play none none reverse"
                        }
                    });
                }
            });
        }
    }

    setupScrollAnimations() {
        // Animar secciones principales
        const mainSections = document.querySelectorAll('.team-intro-section, .team-members-section, .collaboration-section');
        mainSections.forEach((section, index) => {
            gsap.from(section, {
                duration: 1,
                y: 50,
                opacity: 0,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animar cards del equipo CON forzado de visibilidad
        const teamCards = document.querySelectorAll('.team-card');
        gsap.from(teamCards, {
            duration: 0.8,
            y: 50,
            opacity: 0,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: '.team-grid',
                start: "top 80%",
                toggleActions: "play none none reverse",
                onComplete: () => {
                    // Forzar visibilidad después de animación
                    teamCards.forEach(card => {
                        card.style.opacity = '1';
                        card.style.visibility = 'visible';
                        card.style.display = 'flex';
                    });
                }
            }
        });

        // Animar colaboración
        const collabCards = document.querySelectorAll('.collaboration-card');
        gsap.from(collabCards, {
            duration: 0.8,
            x: 100,
            opacity: 0,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: '.collaboration-content',
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });

        // Parallax en título
        gsap.to('.team-title', {
            y: -40,
            scale: 0.95,
            ease: "none",
            scrollTrigger: {
                trigger: '.team-header',
                start: "top top",
                end: "bottom top",
                scrub: 1
            }
        });

        // Animación de movimiento sutil continuo para las cards
        const textCards = document.querySelectorAll('.text-card');
        textCards.forEach((card, index) => {
            gsap.to(card, {
                duration: 4 + index,
                y: index % 2 === 0 ? 5 : -5,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: index * 0.5
            });
        });

        // Animación especial para el icono del equipo
        const teamIcon = document.querySelector('.team-icon-card');
        if (teamIcon) {
            // Animación de entrada
            gsap.from(teamIcon, {
                duration: 1.2,
                scale: 0,
                rotation: 180,
                opacity: 0,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: teamIcon,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });

            // Animación de los puntos de colores
            const dots = teamIcon.querySelectorAll('.red-dot, .yellow-dot, .green-dot');
            gsap.from(dots, {
                duration: 0.6,
                scale: 0,
                stagger: 0.1,
                ease: "bounce.out",
                delay: 0.8,
                scrollTrigger: {
                    trigger: teamIcon,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });

            // Animación continua de flotación
            gsap.to(teamIcon, {
                duration: 3,
                y: -8,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });

            // Pulso de los puntos de colores
            gsap.to(dots, {
                duration: 2,
                scale: 1.1,
                stagger: 0.3,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: 1
            });
        }
    }

    setupAdvancedHoverEffects() {
        // Hover effects para cards del equipo
        const teamCards = document.querySelectorAll('.team-card');
        teamCards.forEach(card => {
            const profileImg = card.querySelector('.profile-img');
            const memberName = card.querySelector('.member-name');
            const skills = card.querySelectorAll('.skill-tag');
            const button = card.querySelector('.member-button');

            card.addEventListener('mouseenter', () => {
                // Animar card
                gsap.to(card, {
                    duration: 0.4,
                    rotationY: 5,
                    z: 50,
                    ease: "power2.out"
                });

                // Animar imagen de perfil
                gsap.to(profileImg, {
                    duration: 0.3,
                    scale: 1.15,
                    rotation: 10,
                    ease: "back.out(1.7)"
                });

                // Animar nombre
                gsap.to(memberName, {
                    duration: 0.3,
                    scale: 1.05,
                    ease: "power2.out"
                });

                // Animar skills secuencialmente
                gsap.to(skills, {
                    duration: 0.3,
                    scale: 1.1,
                    stagger: 0.05,
                    ease: "power2.out"
                });

                // Animar botón
                gsap.to(button, {
                    duration: 0.3,
                    scale: 1.05,
                    y: -3,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                // Resetear todas las animaciones
                gsap.to(card, {
                    duration: 0.4,
                    rotationY: 0,
                    z: 0,
                    ease: "power2.out"
                });

                gsap.to(profileImg, {
                    duration: 0.3,
                    scale: 1,
                    rotation: 0,
                    ease: "power2.out"
                });

                gsap.to(memberName, {
                    duration: 0.3,
                    scale: 1,
                    ease: "power2.out"
                });

                gsap.to(skills, {
                    duration: 0.3,
                    scale: 1,
                    ease: "power2.out"
                });

                gsap.to(button, {
                    duration: 0.3,
                    scale: 1,
                    y: 0,
                    ease: "power2.out"
                });
            });
        });

        // Hover effects para estadísticas
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                gsap.to(item, {
                    duration: 0.3,
                    scale: 1.05,
                    rotationY: 10,
                    ease: "power2.out"
                });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(item, {
                    duration: 0.3,
                    scale: 1,
                    rotationY: 0,
                    ease: "power2.out"
                });
            });
        });

        // Hover effects para containers de texto
        const textCards = document.querySelectorAll('.text-card');
        textCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.3,
                    scale: 1.02,
                    rotationY: 2,
                    z: 20,
                    ease: "power2.out"
                });

                // Efecto especial para la card azul
                if (card.classList.contains('primary-card')) {
                    gsap.to(card, {
                        duration: 0.3,
                        boxShadow: "16px 16px 32px rgba(52, 152, 219, 0.3), -16px -16px 32px rgba(255, 255, 255, 0.9)",
                        ease: "power2.out"
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.3,
                    scale: 1,
                    rotationY: 0,
                    z: 0,
                    ease: "power2.out"
                });

                // Resetear sombra de la card azul
                if (card.classList.contains('primary-card')) {
                    gsap.to(card, {
                        duration: 0.3,
                        boxShadow: "8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.8)",
                        ease: "power2.out"
                    });
                }
            });
        });

        // Hover effects avanzados para el icono del equipo
        const teamIconCard = document.querySelector('.team-icon-card');
        if (teamIconCard) {
            const iconTitle = teamIconCard.querySelector('.icon-title');
            const dots = teamIconCard.querySelectorAll('.red-dot, .yellow-dot, .green-dot');

            teamIconCard.addEventListener('mouseenter', () => {
                // Animar la card
                gsap.to(teamIconCard, {
                    duration: 0.5,
                    rotationY: 5,
                    z: 30,
                    ease: "power2.out"
                });

                // Animar el título
                gsap.to(iconTitle, {
                    duration: 0.3,
                    scale: 1.1,
                    color: "#3498db",
                    ease: "power2.out"
                });

                // Animar los puntos secuencialmente
                gsap.to(dots, {
                    duration: 0.3,
                    rotation: 360,
                    scale: 1.3,
                    stagger: 0.1,
                    ease: "power2.out"
                });
            });

            teamIconCard.addEventListener('mouseleave', () => {
                // Resetear animaciones
                gsap.to(teamIconCard, {
                    duration: 0.5,
                    rotationY: 0,
                    z: 0,
                    ease: "power2.out"
                });

                gsap.to(iconTitle, {
                    duration: 0.3,
                    scale: 1,
                    color: "#2c3e50",
                    ease: "power2.out"
                });

                gsap.to(dots, {
                    duration: 0.3,
                    rotation: 0,
                    scale: 1,
                    ease: "power2.out"
                });
            });
        }
    }

    setupResponsive() {
        let mm = gsap.matchMedia();

        // Desktop - efectos más elaborados
        mm.add("(min-width: 769px)", () => {
            // Efectos parallax más pronunciados
            gsap.to('.particle', {
                y: -100,
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
            gsap.set('.particle', {
                scale: 0.5,
                opacity: 0.3
            });
        });
    }

    forceVisibility() {
        // Forzar visibilidad de elementos críticos
        const criticalElements = [
            '.navigation-section',
            '.nav-grid',
            '.nav-card',
            '.team-footer'
        ];

        criticalElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '1';
                element.style.visibility = 'visible';
                element.style.display = selector === '.nav-grid' ? 'grid' : 'block';
            });
        });

        console.log('✅ Elementos críticos del equipo forzados a visible');
    }

    // Función específica para forzar visibilidad de creadores
    forceCreatorsVisibility() {
        const teamElements = [
            '.team-members-section',
            '.members-container',
            '.team-grid',
            '.team-card',
            '.julian-card',
            '.monica-card',
            '.collaboration-section',
            '.collaboration-container',
            '.collaboration-content'
        ];

        teamElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.opacity = '1';
                element.style.visibility = 'visible';
                element.style.display = selector.includes('grid') ? 'grid' :
                    selector.includes('card') && !selector.includes('grid') ? 'flex' : 'block';
            });
        });

        // Forzar específicamente las cards del equipo
        const teamCards = document.querySelectorAll('.team-card');
        teamCards.forEach(card => {
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.opacity = '1';
            card.style.visibility = 'visible';
        });

        // Forzar específicamente los nombres
        const memberNames = document.querySelectorAll('.member-name');
        memberNames.forEach(name => {
            name.style.opacity = '1';
            name.style.visibility = 'visible';
            name.style.display = 'block';
            name.textContent = name.textContent || (name.closest('.julian-card') ? 'Julián Espitia' : 'Mónica Vellojín');
        });

        // Centrar título
        const title = document.querySelector('.members-title');
        if (title) {
            title.style.textAlign = 'center';
            title.style.margin = '0 auto 4rem auto';
            title.style.display = 'block';
            title.style.width = '100%';
        }

        console.log('✅ Creadores forzados a visible');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new EquipoPage();
});

// Manejar resize de ventana
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});
