// Получаем элементы
const openPopupBtn = document.querySelector('.open-popup');
const popup = document.querySelector('.popup');
const closePopupBtn = document.querySelector('.close-popup');

// Открытие попапа
openPopupBtn.addEventListener('click', () => {
    popup.style.display = 'flex';
});

// Закрытие попапа
closePopupBtn.addEventListener('click', () => {
    popup.style.display = 'none';
    // Останавливаем видео при закрытии
    const iframe = popup.querySelector('iframe');
    iframe.src = iframe.src; // Перезагружаем iframe, чтобы остановить видео
});

// Закрытие попапа при клике на фон
popup.addEventListener('click', (e) => {
    if (e.target === popup) {
        popup.style.display = 'none';
        const iframe = popup.querySelector('iframe');
        iframe.src = iframe.src; // Останавливаем видео
    }
});