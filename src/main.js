document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация иконок Lucide
    lucide.createIcons();

    // 2. Мобильное меню (Базовая логика)
    const burger = document.querySelector('.header__burger');
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');

    if (burger) {
        burger.addEventListener('click', () => {
            // В будущем здесь добавим красивую анимацию открытия
            nav.classList.toggle('active');
            
            // Если мы на мобильном, нужно добавить стили для открытия меню
            // (Логику добавим в CSS, когда будем полировать адаптив)
            console.log('Menu toggled'); 
        });
    }

    // 3. Эффект скролла для хедера
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(11, 14, 20, 0.95)';
            header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        } else {
            header.style.background = 'rgba(11, 14, 20, 0.8)';
            header.style.boxShadow = 'none';
        }
    });
});