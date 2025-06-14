// Esperar a que todo esté completamente cargado
window.addEventListener('load', function() {
    console.log('Página completamente cargada');
    initializeWelcomePage();
});

function initializeWelcomePage() {
    // Verificar que GSAP esté disponible
    if (typeof gsap === 'undefined') {
        console.error('GSAP no está cargado');
        return;
    }

    console.log('Inicializando animaciones GSAP');

    // Timeline principal para la entrada
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Animación de entrada secuencial
    tl.to('.welcome-header', {
        duration: 1,
        opacity: 1,
        y: 0,
        ease: "back.out(1.7)"
    })
        .to('.welcome-content', {
            duration: 1,
            opacity: 1,
            y: 0,
            ease: "power2.out"
        }, "-=0.5")
        .to('.welcome-btn', {
            duration: 0.8,
            opacity: 1,
            x: 0,
            stagger: 0.2,
            ease: "power2.out"
        }, "-=0.3")
        .to('.welcome-footer', {
            duration: 1,
            opacity: 1,
            y: 0,
            ease: "power2.out"
        }, "-=0.5");

    // Rest of your JavaScript code here...
    setupButtonAnimations();
    setupParticleEffects();
}

function setupButtonAnimations() {
    const buttons = document.querySelectorAll('.welcome-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.dataset.action;
            console.log('Botón presionado:', action);

            // Agregar efecto de carga
            this.classList.add('btn-loading');

            setTimeout(() => {
                if (action === 'about') {
                    window.location.href = 'http://localhost:3000/historia';
                } else {
                    console.log(`Redireccionar a: ${action}`);
                    // Aquí puedes agregar las redirecciones para login y register
                }
                this.classList.remove('btn-loading');
            }, 1000);
        });
    });
}

function setupParticleEffects() {
    // Animación de las partículas flotantes
    gsap.to('.particle', {
        duration: 6,
        y: "-=50",
        x: "+=30",
        rotation: 360,
        ease: "power1.inOut",
        stagger: 1,
        repeat: -1,
        yoyo: true
    });
}
