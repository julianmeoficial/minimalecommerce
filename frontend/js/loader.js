// loader.js - Loader con pantalla de construcción

class ConstructionLoader {
    constructor() {
        this.loaderContainer = document.getElementById('loader-container');
        this.constructionContainer = document.getElementById('construction-container');
        this.preloader = document.querySelector('.preloader');
        this.squares = document.querySelectorAll('.preloader__square');
        this.status = document.querySelector('.status');
        this.progressFill = document.querySelector('.progress-fill');
        this.progressText = document.querySelector('.progress-text');
        this.statusText = document.querySelector('.status-text');

        this.loadingSteps = [
            'Inicializando MinimalStore',
            'Conectando con servidor',
            'Cargando productos',
            'Configurando categorías',
            'Preparando interfaz'
        ];

        this.currentStep = 0;
        this.progress = 0;

        this.init();
    }

    init() {
        // Configurar GSAP
        gsap.set(this.constructionContainer, { opacity: 0, visibility: 'hidden' });

        // Iniciar secuencia de carga
        this.startLoadingSequence();

        // Simular carga de 5 segundos
        this.simulateDataLoading();
    }

    startLoadingSequence() {
        const tl = gsap.timeline();

        // Animación de entrada del preloader
        tl.from(this.preloader, {
            duration: 1.2,
            scale: 0,
            rotation: -180,
            ease: "back.out(1.7)"
        });

        // Animación secuencial de los cuadrados
        tl.from(this.squares, {
            duration: 0.8,
            scale: 0,
            rotation: 180,
            stagger: 0.15,
            ease: "back.out(1.7)"
        }, "-=0.8");

        // Animación del texto de estado
        tl.from(this.status, {
            duration: 0.6,
            y: 30,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.4");

        // Animación de la barra de progreso
        tl.from('.progress-container', {
            duration: 0.6,
            y: 20,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.3");

        // Efectos continuos
        this.startContinuousAnimations();
    }

    startContinuousAnimations() {
        // Respiración del preloader
        gsap.to(this.preloader, {
            duration: 3,
            scale: 1.05,
            ease: "power2.inOut",
            yoyo: true,
            repeat: -1
        });

        // Rotación de los cuadrados
        this.squares.forEach((square, index) => {
            gsap.to(square, {
                duration: 4 + index,
                rotation: 360,
                ease: "none",
                repeat: -1
            });
        });
    }

    simulateDataLoading() {
        const totalDuration = 5000; // 5 segundos
        const stepDuration = totalDuration / this.loadingSteps.length;

        const progressInterval = setInterval(() => {
            this.progress += 2;
            this.updateProgress(this.progress);

            if (this.progress >= 100) {
                clearInterval(progressInterval);
                setTimeout(() => {
                    this.showConstructionScreen();
                }, 500);
            }
        }, 100);

        // Actualizar pasos de carga
        this.loadingSteps.forEach((step, index) => {
            setTimeout(() => {
                this.updateLoadingStep(step);
            }, index * stepDuration);
        });
    }

    updateProgress(progress) {
        const clampedProgress = Math.min(progress, 100);

        gsap.to(this.progressFill, {
            duration: 0.3,
            width: `${clampedProgress}%`,
            ease: "power2.out"
        });

        gsap.to(this.progressText, {
            duration: 0.2,
            textContent: `${Math.round(clampedProgress)}%`,
            ease: "none"
        });
    }

    updateLoadingStep(stepText) {
        if (this.statusText) {
            gsap.to(this.statusText, {
                duration: 0.3,
                opacity: 0,
                y: -10,
                ease: "power2.in",
                onComplete: () => {
                    this.statusText.textContent = stepText;
                    gsap.to(this.statusText, {
                        duration: 0.3,
                        opacity: 1,
                        y: 0,
                        ease: "power2.out"
                    });
                }
            });
        }
    }

    showConstructionScreen() {
        const tl = gsap.timeline();

        // Ocultar loader
        tl.to(this.loaderContainer, {
            duration: 0.8,
            opacity: 0,
            scale: 0.9,
            ease: "power2.inOut",
            onComplete: () => {
                this.loaderContainer.style.display = 'none';
            }
        });

        // Mostrar pantalla de construcción
        tl.set(this.constructionContainer, {
            visibility: 'visible',
            display: 'flex'
        });

        tl.to(this.constructionContainer, {
            duration: 1,
            opacity: 1,
            ease: "power2.out"
        }, "-=0.4");

        // Animación del logo de construcción
        tl.from('.construction-logo', {
            duration: 1.2,
            scale: 0,
            rotation: -180,
            ease: "back.out(1.7)"
        }, "-=0.6");

        // Animación de los cuadrados del logo
        tl.from('.logo-square', {
            duration: 0.8,
            scale: 0,
            rotation: 180,
            stagger: 0.15,
            ease: "back.out(1.7)"
        }, "-=0.8");

        // Animación del texto
        tl.from('.construction-title', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.4");

        tl.from('.construction-subtitle', {
            duration: 0.6,
            y: 20,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.2");

        tl.from('.construction-dots', {
            duration: 0.6,
            y: 20,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.1");

        tl.from('.construction-info', {
            duration: 0.6,
            y: 20,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.1");
    }
}

class ConstructionLoader {
    constructor() {
        this.loaderContainer = document.getElementById('loader-container');
        this.constructionContainer = document.getElementById('construction-container');

        this.init();
    }

    init() {
        // Después de 5 segundos, cambiar a pantalla de construcción
        setTimeout(() => {
            this.showConstructionScreen();
        }, 5000);
    }

    showConstructionScreen() {
        // Ocultar loader original con GSAP
        gsap.to(this.loaderContainer, {
            duration: 0.8,
            opacity: 0,
            scale: 0.9,
            ease: "power2.inOut",
            onComplete: () => {
                this.loaderContainer.style.display = 'none';
                this.constructionContainer.style.display = 'flex';

                // Mostrar pantalla de construcción
                gsap.from(this.constructionContainer, {
                    duration: 1,
                    opacity: 0,
                    ease: "power2.out"
                });
            }
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ConstructionLoader();
});