const checkbox = document.querySelector('.check-icon');
const menu = document.querySelector('.menu');
const shadow = document.querySelector('body > .shadow');
const body = document.body;
const iconMenu = document.querySelector('.icon-menu');

function setMenuState(open) {
  if (!menu) return;
  if (open) {
    menu.classList.add('menu--open');
    if (shadow) shadow.classList.add('shadow--open');
    body.classList.add('no-scroll');
  } else {
    menu.classList.remove('menu--open');
    if (shadow) shadow.classList.remove('shadow--open');
    body.classList.remove('no-scroll');
  }
}

// 1) Слушаем чекбокс: меняем состояние меню в зависимости от checked
if (checkbox) {
  checkbox.addEventListener('change', () => {
    setMenuState(checkbox.checked);
  });
}

// 2) Фолбэк: если чекбокса нет, клик по иконке будет просто переключать меню
if (!checkbox && iconMenu) {
  iconMenu.addEventListener('click', () => {
    const willOpen = !menu.classList.contains('menu--open');
    setMenuState(willOpen);
  });
}

// 3) Клик по затемнению: закрываем меню и СНИМАЕМ чекбокс
if (shadow) {
  shadow.addEventListener('click', (e) => {
    if (e.target === shadow) {
      setMenuState(false);
      if (checkbox) checkbox.checked = false;
    }
  });
}

// 4) Закрытие меню свайпом вправо (тач-устройства)
(() => {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  const thresholdX = 60; // минимальная горизонтальная дистанция, px
  const restraintY = 80; // допустимое вертикальное отклонение, px

  const isMenuOpen = () => !!menu && menu.classList.contains('menu--open');

  const handleTouchStart = (e) => {
    if (!isMenuOpen()) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    startX = t.clientX;
    startY = t.clientY;
    tracking = true;
  };

  const handleTouchMove = (e) => {
    if (!tracking) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    // если движение преимущественно горизонтальное, отключим скролл
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches && e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // свайп вправо: положительный dx, малое вертикальное смещение
    if (dx > thresholdX && Math.abs(dy) < restraintY && isMenuOpen()) {
      setMenuState(false);
      if (checkbox) checkbox.checked = false;
    }
  };

  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  // passive: false нужен для preventDefault в move
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
})();
