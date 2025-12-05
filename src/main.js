// Глобальная переменная для математической капчи
let correctCaptchaAnswer = 0;

document.addEventListener('DOMContentLoaded', () => {
    // 0. Инициализация AOS
    AOS.init({
        duration: 800,
        once: true, 
        easing: 'ease-in-out'
    });

    // 1. Инициализация иконок Lucide
    lucide.createIcons();

    // 2. Мобильное меню
    const burger = document.querySelector('.header__burger');
    const nav = document.querySelector('.nav');
    const body = document.body;
    const navLinks = document.querySelectorAll('.nav__link');

    const toggleMenu = (isOpen) => {
        nav.classList.toggle('active', isOpen);
        body.classList.toggle('no-scroll', isOpen);
        
        const iconName = isOpen ? 'x' : 'menu';
        burger.innerHTML = `<i data-lucide="${iconName}"></i>`;
        lucide.createIcons();
    };

    if (burger && nav) {
        burger.addEventListener('click', () => {
            const isOpen = !nav.classList.contains('active');
            toggleMenu(isOpen);
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Закрываем меню и разблокируем скролл
                toggleMenu(false);
            });
        });
    }

    // 3. Эффект скролла для хедера
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.style.background = 'rgba(3, 7, 18, 0.9)';
            header.style.boxShadow = '0 4px 30px rgba(0,0,0,0.5)';
        } else {
            header.style.background = 'rgba(3, 7, 18, 0.7)';
            header.style.boxShadow = 'none';
        }
    });

    // 4. Hero Animation (Three.js - каркасная сфера)
    const initHero3D = () => {
        const container = document.getElementById('hero-canvas');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const geometry = new THREE.IcosahedronGeometry(10, 2);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x3B82F6, 
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        const innerGeo = new THREE.IcosahedronGeometry(6, 1);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0x8B5CF6, 
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        const innerSphere = new THREE.Mesh(innerGeo, innerMat);
        scene.add(innerSphere);

        camera.position.z = 22;

        const animate = () => {
            requestAnimationFrame(animate);
            
            sphere.rotation.x += 0.001;
            sphere.rotation.y += 0.002;
            
            innerSphere.rotation.x -= 0.002;
            innerSphere.rotation.y -= 0.001;

            sphere.position.y = Math.sin(Date.now() * 0.001) * 0.5;
            innerSphere.position.y = Math.sin(Date.now() * 0.001) * 0.5;

            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        // GSAP Text Animation (повторно, если вдруг не сработал ранее)
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            
            tl.from(".hero__badge", { y: 20, opacity: 0, duration: 0.8, delay: 0.2 })
              .from(".hero__title", { y: 30, opacity: 0, duration: 0.8 }, "-=0.6")
              .from(".hero__desc", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
              .from(".hero__actions", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
              .from(".hero__stats", { opacity: 0, duration: 1 }, "-=0.4")
              .from(".hero__visual", { scale: 0.8, opacity: 0, duration: 1.5, ease: "elastic.out(1, 0.5)" }, "-=1.2");
        }
    };
    initHero3D();


    // 5. FAQ Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion__header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            
            // Закрываем все остальные
            accordionHeaders.forEach(otherHeader => {
                const otherItem = otherHeader.parentElement;
                const otherContent = otherHeader.nextElementSibling;
                if (otherItem !== item && otherHeader.classList.contains('active')) {
                    otherHeader.classList.remove('active');
                    otherContent.style.maxHeight = null;
                    otherContent.classList.remove('active');
                }
            });

            // Открываем/закрываем текущий
            header.classList.toggle('active');
            content.classList.toggle('active');

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                // Устанавливаем max-height равным высоте содержимого
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });


    // 6. Contact Form Logic (Validation, Captcha, AJAX Simulation)
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const phoneInput = document.getElementById('phone');

    // Функция генерации капчи
    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operator = Math.random() > 0.5 ? '+' : '-';
        
        correctCaptchaAnswer = (operator === '+') ? num1 + num2 : num1 - num2;
        document.getElementById('captcha-question').textContent = `${num1} ${operator} ${num2} = ?`;
    };

    // Генерируем капчу при загрузке страницы
    if (form) generateCaptcha();

    // Валидация
    const validateField = (input, errorMessageElement, validationFunc, message) => {
        const isValid = validationFunc(input.value);
        if (!isValid) {
            errorMessageElement.textContent = message;
            input.classList.add('invalid');
        } else {
            errorMessageElement.textContent = '';
            input.classList.remove('invalid');
        }
        return isValid;
    };

    const isPhoneNumberValid = (value) => {
        // Проверяем, что содержит только цифры, '+' и пробелы, и имеет разумную длину
        const phoneRegex = /^\+?[\d\s]{7,20}$/;
        // Дополнительно проверяем, что в нем хотя бы 5 цифр
        const digitCount = (value.match(/\d/g) || []).length;
        return phoneRegex.test(value) && digitCount >= 5;
    };

    const validateForm = () => {
        let isFormValid = true;

        // Name
        isFormValid = validateField(
            document.getElementById('name'), 
            document.getElementById('name-error'), 
            (val) => val.trim().length > 2, 
            'Пожалуйста, введите ваше полное имя.'
        ) && isFormValid;

        // Email
        isFormValid = validateField(
            document.getElementById('email'), 
            document.getElementById('email-error'), 
            (val) => /\S+@\S+\.\S+/.test(val), 
            'Введите корректный Email адрес.'
        ) && isFormValid;

        // Phone (только цифры и +)
        isFormValid = validateField(
            document.getElementById('phone'), 
            document.getElementById('phone-error'), 
            isPhoneNumberValid, 
            'Введите корректный телефонный номер (только цифры и +).'
        ) && isFormValid;

        // Captcha
        const captchaInput = document.getElementById('captcha');
        isFormValid = validateField(
            captchaInput, 
            document.getElementById('captcha-error'), 
            (val) => parseInt(val) === correctCaptchaAnswer, 
            'Неправильный ответ на математический пример.'
        ) && isFormValid;
        
        // Agreement Checkbox
        const agreementCheckbox = document.getElementById('agreement');
        isFormValid = validateField(
            agreementCheckbox, 
            document.getElementById('agreement-error'), 
            (val) => agreementCheckbox.checked, 
            'Необходимо дать согласие на обработку данных.'
        ) && isFormValid;
        
        return isFormValid;
    };

    // Отправка формы (AJAX Simulation)
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (validateForm()) {
                // AJAX Simulation
                form.style.pointerEvents = 'none'; // Блокируем форму
                formMessage.classList.add('active');
                formMessage.innerHTML = 'Отправка данных...';

                setTimeout(() => {
                    // Имитация успешной отправки
                    formMessage.innerHTML = '<i data-lucide="check-circle" style="width: 48px; height: 48px; margin-bottom: 15px;"></i><p>Спасибо! Ваша заявка принята.</p><p style="font-size: 1rem;">Мы свяжемся с вами в ближайшее время.</p>';
                    lucide.createIcons();
                    form.reset();
                    generateCaptcha(); // Сброс капчи
                    
                    // Убираем сообщение через 4 секунды
                    setTimeout(() => {
                        formMessage.classList.remove('active');
                        form.style.pointerEvents = 'auto';
                    }, 4000);

                }, 1500); // Задержка 1.5 сек для имитации загрузки
            }
        });
    }

    // 7. Cookie Consent Logic
    const cookieConsent = document.getElementById('cookie-consent');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    const localStorageKey = 'blyzr-zune-cookies-accepted';

    const checkCookieConsent = () => {
        if (!localStorage.getItem(localStorageKey)) {
            setTimeout(() => {
                cookieConsent.classList.add('visible');
            }, 1000); // Показываем через 1 секунду
        }
    };

    const setCookieConsent = () => {
        localStorage.setItem(localStorageKey, 'true');
        cookieConsent.classList.remove('visible');
    };

    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', setCookieConsent);
        checkCookieConsent();
    }
});