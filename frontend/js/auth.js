// auth.js - Sistema de autenticación con animaciones espectaculares

class AuthSystem {
    constructor() {
        this.apiBaseURL = 'http://localhost:8080/api';
        this.init();
    }

    init() {
        this.setupPageAnimations();
        this.setupValidation();
        this.setupFormHandlers();
        this.setupTogglePassword();
        this.setupResponsiveAnimations();
    }

    setupPageAnimations() {
        // Detectar si es página de registro
        const isRegistroPage = window.location.pathname.includes('registro');
        if (isRegistroPage) {
            document.body.classList.add('registro-page');
        }

        // Configurar GSAP
        // Timeline principal para entrada de página
        const mainTl = gsap.timeline();

        // Animar fondo
        mainTl.from('.bg-layer-1', {
            duration: 1.5,
            scale: 1.2,
            opacity: 0,
            ease: "power2.out"
        });

        mainTl.from('.bg-layer-2', {
            duration: 1.5,
            scale: 0.8,
            opacity: 0,
            ease: "power2.out"
        }, "-=1.2");

        mainTl.from('.bg-layer-3', {
            duration: 1.5,
            scale: 1.1,
            opacity: 0,
            ease: "power2.out"
        }, "-=1.2");

        // Animar overlay oscuro
        mainTl.from('.dark-overlay', {
            duration: 1,
            opacity: 0,
            ease: "power2.out"
        }, "-=0.8");

        // Animar logo
        mainTl.from('.floating-logo', {
            duration: 0.8,
            y: -50,
            opacity: 0,
            ease: "back.out(1.7)"
        }, "-=0.5");

        // Animar contenedor del formulario
        mainTl.from('.form-container', {
            duration: 1,
            y: 80,
            opacity: 0,
            scale: 0.9,
            ease: "back.out(1.7)"
        }, "-=0.6");

        // Animar elementos del formulario secuencialmente
        mainTl.from('.form-header', {
            duration: 0.6,
            y: 30,
            opacity: 0,
            ease: "power2.out",
            onComplete: () => {
                gsap.set('.form-header', { clearProps: "all" });
            }
        }, "-=0.4");

        // Animación especial para campos en dos columnas (solo registro)
        if (document.querySelector('.two-columns')) {
            mainTl.from('.two-columns .field-group', {
                duration: 0.5,
                y: 20,
                opacity: 0,
                stagger: 0.1,
                ease: "power2.out",
                onComplete: () => {
                    gsap.set('.two-columns .field-group', { clearProps: "all" });
                    gsap.set('.field-group', { opacity: 1, visibility: 'visible' });
                }
            }, "-=0.3");

            mainTl.from('.user-types .user-type-card', {
                duration: 0.5,
                scale: 0.9,
                opacity: 0,
                stagger: 0.1,
                ease: "back.out(1.7)"
            }, "-=0.2");
        } else {
            // Animación normal para login
            mainTl.from('.field-group', {
                duration: 0.5,
                y: 20,
                opacity: 0,
                stagger: 0.1,
                ease: "power2.out",
                onComplete: () => {
                    gsap.set('.field-group', { clearProps: "all" });
                    gsap.set('.field-group', { opacity: 1, visibility: 'visible' });
                }
            }, "-=0.3");
        }

        mainTl.from('.field-group', {
            duration: 0.5,
            y: 20,
            opacity: 0,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.3");

        mainTl.from('.submit-btn', {
            duration: 0.6,
            y: 20,
            opacity: 0,
            scale: 0.95,
            ease: "back.out(1.7)",
            onComplete: () => {
                gsap.set('.submit-btn', { clearProps: "all" });
                gsap.set('.submit-btn', { opacity: 1, visibility: 'visible', transform: 'none' });
            }
        }, "-=0.2");

        // Animar botones de tipo de usuario MÁS RÁPIDO (solo en registro)
        if (document.querySelector('.user-types')) {
            // Primero asegurar que el contenedor esté visible (sin delay)
            mainTl.call(() => {
                const userTypes = document.querySelector('.user-types');
                userTypes.classList.add('visible');
                gsap.set(userTypes, {
                    opacity: 1,
                    visibility: 'visible',
                    clearProps: 'transform'
                });
            });

            // Luego animar las tarjetas (MUY rápido)
            mainTl.to('.user-types', {
                duration: 0.1,
                y: 0,
                ease: "power2.out"
            });

            mainTl.from('.user-type-card', {
                duration: 0.08,
                scale: 0.5,
                opacity: 0,
                y: 30,
                stagger: 0.02,
                ease: "back.out(1.7)",
                onStart: () => {
                    document.querySelectorAll('.user-type-card').forEach(card => {
                        card.style.visibility = 'visible';
                        card.style.display = 'flex';
                    });
                },
                onComplete: () => {
                    // Asegurar visibilidad final
                    document.querySelectorAll('.user-type-card').forEach(card => {
                        card.classList.add('loaded', 'ready');
                        gsap.set(card, {
                            opacity: 1,
                            visibility: 'visible',
                            clearProps: 'transform,scale'
                        });
                    });
                    // Iniciar animaciones de patrones inmediatamente
                    this.animateUserTypePatterns();
                }
            });
        }

        // Verificación final para asegurar visibilidad de botones de usuario
        mainTl.call(() => {
            if (document.querySelector('.user-types')) {
                const userTypes = document.querySelector('.user-types');
                const userCards = document.querySelectorAll('.user-type-card');

                // Forzar visibilidad final
                gsap.set(userTypes, {
                    opacity: 1,
                    visibility: 'visible',
                    display: 'grid'
                });

                userCards.forEach(card => {
                    gsap.set(card, {
                        opacity: 1,
                        visibility: 'visible',
                        display: 'flex',
                        scale: 1
                    });
                    card.classList.add('ready');
                });

                console.log('Botones de tipo de usuario forzados a visible');
            }
        });

        mainTl.from('.form-footer', {
            duration: 0.5,
            y: 20,
            opacity: 0,
            ease: "power2.out",
            onComplete: () => {
                gsap.set('.form-footer', { clearProps: "all" });
                gsap.set('.form-footer', { opacity: 1, visibility: 'visible' });
            }
        }, "-=0.1");

        // Animar partículas
        mainTl.from('.particle', {
            duration: 1,
            scale: 0,
            opacity: 0,
            stagger: 0.2,
            ease: "back.out(1.7)"
        }, "-=1");

        // Configurar animaciones continuas
        this.setupContinuousAnimations();

        // Animaciones específicas para registro
        if (document.querySelector('.registro-page')) {
            // Animar burbujas glass
            mainTl.from('.glass-bubble', {
                duration: 1.5,
                scale: 0,
                opacity: 0,
                stagger: 0.3,
                ease: "back.out(1.7)"
            }, "-=1");

            // Configurar animaciones de tipo de usuario
            this.setupUserTypeAnimations();
        }
    }

    setupContinuousAnimations() {
        // Animación continua de partículas
        gsap.to('.particle', {
            duration: 8,
            y: "random(-30, 30)",
            x: "random(-30, 30)",
            rotation: "random(-180, 180)",
            scale: "random(0.8, 1.2)",
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            stagger: {
                amount: 3,
                from: "random"
            }
        });

        // Animación sutil del formulario
        gsap.to('.form-container', {
            duration: 4,
            y: -5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
        });

        // Efectos de hover mejorados
        this.setupHoverEffects();
    }

    setupHoverEffects() {
        // Hover en inputs
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('focus', () => {
                gsap.to(input.parentElement, {
                    duration: 0.3,
                    scale: 1.02,
                    ease: "power2.out"
                });

                gsap.to(input.parentElement.querySelector('.input-line'), {
                    duration: 0.3,
                    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                    ease: "power2.out"
                });
            });

            input.addEventListener('blur', () => {
                gsap.to(input.parentElement, {
                    duration: 0.3,
                    scale: 1,
                    ease: "power2.out"
                });
            });
        });

        // Hover en botón
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('mouseenter', () => {
                gsap.to(submitBtn, {
                    duration: 0.3,
                    scale: 1.05,
                    ease: "power2.out"
                });
            });

            submitBtn.addEventListener('mouseleave', () => {
                gsap.to(submitBtn, {
                    duration: 0.3,
                    scale: 1,
                    ease: "power2.out"
                });
            });
        }
    }

    setupResponsiveAnimations() {
        // Configurar animaciones responsivas con GSAP matchMedia
        let mm = gsap.matchMedia();

        // Desktop
        mm.add("(min-width: 769px)", () => {
            // Efecto parallax en background
            gsap.to('.bg-layer-2', {
                duration: 20,
                x: 50,
                y: 30,
                rotation: 5,
                ease: "none",
                repeat: -1,
                yoyo: true
            });

            gsap.to('.bg-layer-3', {
                duration: 25,
                x: -30,
                y: 50,
                rotation: -3,
                ease: "none",
                repeat: -1,
                yoyo: true
            });
        });

        // Mobile
        mm.add("(max-width: 768px)", () => {
            // Animaciones más suaves para móvil
            gsap.set('.particle', { display: 'none' });

            gsap.to('.bg-layer-2, .bg-layer-3', {
                duration: 30,
                rotation: 360,
                ease: "none",
                repeat: -1
            });
        });
    }

    setupUserTypeAnimations() {
        const userTypeOptions = document.querySelectorAll('.user-type-option');

        userTypeOptions.forEach(option => {
            const input = option.querySelector('input');
            const card = option.querySelector('.user-type-card');
            const patternElements = card.querySelectorAll('.pattern-element');
            const indicator = card.querySelector('.selection-indicator');

            option.addEventListener('click', (e) => {
                // Prevenir doble click
                if (card.classList.contains('clicking')) return;
                card.classList.add('clicking');

                // Crear efecto ripple
                this.createRippleEffect(card, e);

                // Feedback táctil inmediato
                this.provideTactileFeedback(card, patternElements);

                // Deseleccionar todas las opciones
                userTypeOptions.forEach(opt => {
                    const otherCard = opt.querySelector('.user-type-card');
                    const otherIndicator = opt.querySelector('.selection-indicator');
                    const otherPatterns = opt.querySelectorAll('.pattern-element');

                    otherCard.classList.remove('feedback-active', 'clicked');

                    gsap.to(otherCard, {
                        duration: 0.4,
                        scale: 1,
                        y: 0,
                        ease: "power2.out"
                    });

                    gsap.to(otherIndicator, {
                        duration: 0.3,
                        scale: 0,
                        opacity: 0,
                        ease: "back.in(1.7)"
                    });

                    otherPatterns.forEach(pattern => {
                        pattern.classList.remove('burst');
                    });
                });

                // Animar la opción seleccionada
                card.classList.add('feedback-active', 'clicked');

                gsap.to(card, {
                    duration: 0.5,
                    scale: 1.02,
                    y: -8,
                    ease: "back.out(1.7)"
                });

                // Animar indicador de selección
                gsap.to(indicator, {
                    duration: 0.4,
                    scale: 1,
                    opacity: 1,
                    ease: "back.out(1.7)",
                    delay: 0.1
                });

                // Efecto burst en patrones
                patternElements.forEach((element, index) => {
                    element.classList.add('burst');
                    setTimeout(() => {
                        element.classList.remove('burst');
                    }, 800);

                    gsap.to(element, {
                        duration: 0.8,
                        rotation: 720,
                        scale: 1.3,
                        delay: index * 0.05,
                        ease: "power2.out",
                        yoyo: true,
                        repeat: 1
                    });
                });

                // Vibración sutil de la tarjeta
                gsap.to(card, {
                    duration: 0.1,
                    x: 2,
                    repeat: 3,
                    yoyo: true,
                    ease: "power2.inOut",
                    onComplete: () => {
                        gsap.set(card, { x: 0 });
                        card.classList.remove('clicking');
                    }
                });

                // Sonido visual (flash de color)
                this.createColorFlash(card);
            });

            // Efectos de hover mejorados
            card.addEventListener('mouseenter', () => {
                if (!input.checked && !card.classList.contains('clicking')) {
                    gsap.to(card, {
                        duration: 0.3,
                        y: -4,
                        scale: 1.01,
                        ease: "power2.out"
                    });

                    gsap.to(patternElements, {
                        duration: 0.4,
                        scale: 1.1,
                        stagger: 0.03,
                        ease: "power2.out"
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                if (!input.checked) {
                    gsap.to(card, {
                        duration: 0.3,
                        y: 0,
                        scale: 1,
                        ease: "power2.out"
                    });

                    gsap.to(patternElements, {
                        duration: 0.4,
                        scale: 1,
                        ease: "power2.out"
                    });
                }
            });
        });
    }

    animateUserTypePatterns() {
        // Animar patrones de forma escalonada después de que aparezcan las tarjetas
        const allPatternElements = document.querySelectorAll('.pattern-element');

        allPatternElements.forEach((element, index) => {
            element.classList.add('loading');

            // Animación de entrada escalonada (más rápida para patrones)
            gsap.from(element, {
                duration: 0.1,
                scale: 0,
                rotation: -180,
                opacity: 0,
                delay: index * 0.006,
                ease: "back.out(1.7)",
                onComplete: () => {
                    element.classList.remove('loading');
                    // Iniciar animaciones continuas
                    this.startContinuousPatternAnimation(element, index);
                }
            });
        });
    }

    startContinuousPatternAnimation(element, index) {
        // Animación continua de flotación
        gsap.to(element, {
            duration: 6 + (index % 3),
            y: "random(-15, 15)",
            x: "random(-10, 10)",
            rotation: "random(-180, 180)",
            scale: "random(0.9, 1.1)",
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: index * 0.2
        });

        // Animación de parpadeo sutil
        gsap.to(element, {
            duration: 4 + (index % 2),
            opacity: "random(0.5, 0.8)",
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true,
            delay: index * 0.3
        });
    }

    provideTactileFeedback(card, patternElements) {
        // Feedback inmediato al hacer click
        gsap.to(card, {
            duration: 0.05,
            scale: 0.98,
            ease: "power2.inOut",
            yoyo: true,
            repeat: 1
        });

        // Explosion de patrones
        patternElements.forEach((element, index) => {
            gsap.to(element, {
                duration: 0.2,
                scale: 1.4,
                delay: index * 0.02,
                ease: "power2.out",
                yoyo: true,
                repeat: 1
            });
        });
    }

    createRippleEffect(card, event) {
        const ripple = document.createElement('div');
        ripple.className = 'selection-ripple';

        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        card.appendChild(ripple);
        ripple.classList.add('active');

        setTimeout(() => {
            if (card.contains(ripple)) {
                card.removeChild(ripple);
            }
        }, 800);
    }

    createColorFlash(card) {
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.right = '0';
        flash.style.bottom = '0';
        flash.style.background = 'linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(67, 233, 123, 0.3))';
        flash.style.borderRadius = '20px';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '1';

        card.appendChild(flash);

        gsap.from(flash, {
            duration: 0.4,
            opacity: 0,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(flash, {
                    duration: 0.4,
                    opacity: 0,
                    ease: "power2.in",
                    onComplete: () => {
                        if (card.contains(flash)) {
                            card.removeChild(flash);
                        }
                    }
                });
            }
        });
    }

    initPatternAnimations() {
        // Animar todos los elementos de patrón continuamente
        const allPatternElements = document.querySelectorAll('.pattern-element');

        allPatternElements.forEach((element, index) => {
            // Animación continua de flotación
            gsap.to(element, {
                duration: 8 + (index % 3),
                y: "random(-20, 20)",
                x: "random(-15, 15)",
                rotation: "random(-180, 180)",
                scale: "random(0.8, 1.2)",
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: index * 0.2
            });

            // Animación de parpadeo sutil
            gsap.to(element, {
                duration: 3 + (index % 2),
                opacity: "random(0.4, 0.8)",
                ease: "power2.inOut",
                repeat: -1,
                yoyo: true,
                delay: index * 0.5
            });
        });
    }

    setupValidation() {
        // Validación con animaciones
        const inputs = document.querySelectorAll('.form-input');

        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateFieldWithAnimation(input));
            input.addEventListener('input', () => this.clearErrorWithAnimation(input));
        });

        // Validación especial para confirmar contraseña
        const confirmPassword = document.getElementById('confirm-password');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
        }
    }

    validateFieldWithAnimation(input) {
        const isValid = this.validateField(input);

        if (!isValid) {
            // Animación de error
            gsap.to(input, {
                duration: 0.1,
                x: -5,
                repeat: 5,
                yoyo: true,
                ease: "power2.inOut",
                onComplete: () => {
                    gsap.set(input, { x: 0 });
                }
            });
        }

        return isValid;
    }

    clearErrorWithAnimation(input) {
        const errorElement = input.parentElement.parentElement.querySelector('.field-error');
        if (errorElement && errorElement.classList.contains('show')) {
            gsap.to(errorElement, {
                duration: 0.3,
                opacity: 0,
                y: -10,
                ease: "power2.in",
                onComplete: () => {
                    errorElement.classList.remove('show');
                    errorElement.textContent = '';
                }
            });
        }

        input.style.borderBottomColor = '';
    }

    showErrorWithAnimation(input, message) {
        const errorElement = input.parentElement.parentElement.querySelector('.field-error');
        if (errorElement && message) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            input.style.borderBottomColor = '#e53e3e';

            gsap.from(errorElement, {
                duration: 0.3,
                opacity: 0,
                y: -10,
                ease: "power2.out"
            });
        }
    }

    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.id;
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'email':
                isValid = this.validateEmail(value);
                errorMessage = isValid ? '' : 'Ingresa un correo electrónico válido';
                break;

            case 'password':
                isValid = this.validatePassword(value);
                errorMessage = isValid ? '' : 'La contraseña debe tener al menos 6 caracteres';
                break;

            case 'nombre':
                isValid = value.length >= 2;
                errorMessage = isValid ? '' : 'El nombre debe tener al menos 2 caracteres';
                break;

            case 'telefono':
                isValid = this.validatePhone(value);
                errorMessage = isValid ? '' : 'Ingresa un número de teléfono válido';
                break;

            case 'direccion':
                isValid = value.length >= 5;
                errorMessage = isValid ? '' : 'La dirección debe tener al menos 5 caracteres';
                break;
        }

        this.showErrorWithAnimation(input, errorMessage);
        return isValid;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    validatePhone(phone) {
        const phoneRegex = /^[\+]?[\s\-\(\)]?[\d\s\-\(\)]{8,}$/;
        return phoneRegex.test(phone);
    }

    validatePasswordMatch() {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirm-password');

        if (password && confirmPassword) {
            const isMatch = password.value === confirmPassword.value;
            const errorMessage = isMatch ? '' : 'Las contraseñas no coinciden';
            this.showErrorWithAnimation(confirmPassword, errorMessage);
            return isMatch;
        }
        return true;
    }

    setupFormHandlers() {
        // Formulario de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLoginWithAnimation(e));
        }

        // Formulario de registro
        const registroForm = document.getElementById('registro-form');
        if (registroForm) {
            registroForm.addEventListener('submit', (e) => this.handleRegistroWithAnimation(e));
        }
    }

    async handleRegistroWithAnimation(e) {
        e.preventDefault();

        // Obtener datos del formulario
        const formData = {
            nombre: document.getElementById('nombre').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            direccion: document.getElementById('direccion').value.trim(),
            password: document.getElementById('password').value,
            tipoUsuario: document.querySelector('input[name="tipoUsuario"]:checked').value
        };

        // Validar todos los campos
        let isValid = true;
        Object.keys(formData).forEach(key => {
            if (key !== 'tipoUsuario') {
                const input = document.getElementById(key);
                if (!this.validateFieldWithAnimation(input)) {
                    isValid = false;
                }
            }
        });

        // Validar contraseñas coincidan
        if (!this.validatePasswordMatch()) {
            isValid = false;
        }

        // Validar términos
        const terms = document.getElementById('terms');
        if (!terms.checked) {
            this.showGeneralErrorWithAnimation('Debes aceptar los términos y condiciones');
            isValid = false;
        }

        if (!isValid) {
            this.showGeneralErrorWithAnimation('Por favor, completa todos los campos correctamente');
            return;
        }

        const button = document.getElementById('registro-btn');
        this.setButtonLoadingWithAnimation(button, true);

        try {
            const response = await fetch(`${this.apiBaseURL}/usuarios/registro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccessWithAnimation('¡Cuenta creada exitosamente! Redirigiendo al login...');

                // Animación de salida
                gsap.to('.form-container', {
                    duration: 0.8,
                    scale: 0.9,
                    opacity: 0,
                    y: -50,
                    ease: "power2.in"
                });

                setTimeout(() => {
                    window.location.href = 'login';
                }, 2000);

            } else {
                this.showGeneralErrorWithAnimation(data.message || 'Error al crear la cuenta');
            }
        } catch (error) {
            console.error('Error de registro:', error);
            this.showGeneralErrorWithAnimation('Error de conexión. Intenta nuevamente.');
        } finally {
            this.setButtonLoadingWithAnimation(button, false);
        }
    }

    async handleLoginWithAnimation(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        // Validar campos
        if (!this.validateEmail(email) || !this.validatePassword(password)) {
            this.showGeneralErrorWithAnimation('Por favor, completa todos los campos correctamente');
            return;
        }

        const button = document.getElementById('login-btn');
        this.setButtonLoadingWithAnimation(button, true);

        try {
            console.log('Intentando login con:', { email, password: '***' });

            const response = await fetch(`${this.apiBaseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            console.log('Status de respuesta:', response.status);

            const data = await response.json();
            console.log('Datos recibidos:', data);

            if (response.ok && data.success) {
                console.log('Login exitoso, procesando datos...');

                // Guardar token
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuarioId', data.user.id.toString());

                // Normalizar el objeto usuario (ajustar según respuesta del backend)
                const usuarioNormalizado = {
                    id: data.user.id,
                    nombre: data.user.nombre,
                    email: data.user.email,
                    telefono: data.user.telefono || '',
                    direccion: data.user.direccion || '',
                    tipousuario: data.user.tipousuario || 'COMPRADOR'
                };

                localStorage.setItem('usuario', JSON.stringify(usuarioNormalizado));

                console.log('Datos guardados correctamente');

                if (remember) {
                    localStorage.setItem('userSession', JSON.stringify(data));
                }

                // Animación de éxito
                this.showSuccessWithAnimation('¡Bienvenido! Redirigiendo al dashboard...');

                // Animación de salida
                gsap.to('.form-container', {
                    duration: 0.8,
                    scale: 0.9,
                    opacity: 0,
                    y: -50,
                    ease: "power2.in"
                });

                // REDIRECCIÓN AL DASHBOARD
                setTimeout(() => {
                    console.log('Redirigiendo al dashboard...');
                    window.location.href = 'dashboard';
                }, 1500);

            } else {
                console.error('Error en login:', data);
                this.showGeneralErrorWithAnimation(data.message || 'Error al iniciar sesión');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            this.showGeneralErrorWithAnimation('Error de conexión. Verifica que el servidor esté ejecutándose.');
        } finally {
            this.setButtonLoadingWithAnimation(button, false);
        }
    }

    setButtonLoadingWithAnimation(button, isLoading) {
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');

        if (isLoading) {
            gsap.to(btnText, {
                duration: 0.3,
                opacity: 0,
                scale: 0.9,
                ease: "power2.in",
                onComplete: () => {
                    btnText.style.display = 'none';
                    btnLoader.style.display = 'block';
                    btnLoader.classList.add('active');

                    gsap.from(btnLoader, {
                        duration: 0.3,
                        opacity: 0,
                        scale: 0.9,
                        ease: "back.out(1.7)"
                    });
                }
            });

            button.disabled = true;
        } else {
            gsap.to(btnLoader, {
                duration: 0.3,
                opacity: 0,
                scale: 0.9,
                ease: "power2.in",
                onComplete: () => {
                    btnLoader.style.display = 'none';
                    btnLoader.classList.remove('active');
                    btnText.style.display = 'block';

                    gsap.from(btnText, {
                        duration: 0.3,
                        opacity: 0,
                        scale: 0.9,
                        ease: "back.out(1.7)"
                    });
                }
            });

            button.disabled = false;
        }
    }

    showGeneralErrorWithAnimation(message) {
        const errorElement = document.getElementById('general-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');

            gsap.from(errorElement, {
                duration: 0.5,
                y: 20,
                opacity: 0,
                scale: 0.95,
                ease: "back.out(1.7)"
            });

            // Efecto de shake en el formulario
            gsap.to('.form-container', {
                duration: 0.1,
                x: -5,
                repeat: 5,
                yoyo: true,
                ease: "power2.inOut",
                onComplete: () => {
                    gsap.set('.form-container', { x: 0 });
                }
            });
        }
    }

    showSuccessWithAnimation(message) {
        // Crear elemento de éxito
        const successElement = document.createElement('div');
        successElement.className = 'fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl z-50';
        successElement.style.backdropFilter = 'blur(10px)';
        successElement.textContent = message;

        document.body.appendChild(successElement);

        // Animación de entrada
        gsap.from(successElement, {
            duration: 0.5,
            x: 100,
            opacity: 0,
            scale: 0.9,
            ease: "back.out(1.7)"
        });

        // Eliminar después de 3 segundos
        setTimeout(() => {
            gsap.to(successElement, {
                duration: 0.3,
                x: 100,
                opacity: 0,
                scale: 0.9,
                ease: "power2.in",
                onComplete: () => {
                    if (document.body.contains(successElement)) {
                        document.body.removeChild(successElement);
                    }
                }
            });
        }, 3000);
    }

    setupTogglePassword() {
        const toggleButtons = document.querySelectorAll('.password-toggle');

        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);

                // Animación del icono
                gsap.to(button, {
                    duration: 0.3,
                    rotation: 180,
                    ease: "back.out(1.7)",
                    onComplete: () => {
                        gsap.set(button, { rotation: 0 });
                    }
                });
            });
        });
    }
}

// Inicializar sistema de autenticación
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
});
