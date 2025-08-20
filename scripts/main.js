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

// 4) Закрытие меню свайпом вправо (Pointer Events с фолбэком на Touch)
(() => {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  const thresholdX = 60; // минимальная горизонтальная дистанция, px
  const restraintY = 80; // допустимое вертикальное отклонение, px

  const isMenuOpen = () => !!menu && menu.classList.contains('menu--open');

  const onStart = (x, y) => {
    if (!isMenuOpen()) return;
    startX = x;
    startY = y;
    tracking = true;
  };

  const onMove = (x, y, e) => {
    if (!tracking) return;
    const dx = x - startX;
    const dy = y - startY;
    // если движение преимущественно горизонтальное, отключим скролл
    if (Math.abs(dx) > Math.abs(dy)) {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
    }
  };

  const onEnd = (x, y) => {
    if (!tracking) return;
    tracking = false;
    const dx = x - startX;
    const dy = y - startY;

    // свайп вправо: положительный dx, малое вертикальное смещение
    if (dx > thresholdX && Math.abs(dy) < restraintY && isMenuOpen()) {
      setMenuState(false);
      if (checkbox) checkbox.checked = false;
    }
  };

  const addPointerHandlers = (el) => {
    if (!el) return;

    // Pointer Events
    if (window.PointerEvent) {
      el.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return; // игнорируем мышь
        onStart(e.clientX, e.clientY);
      });
      el.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse') return;
        onMove(e.clientX, e.clientY, e);
      }, { passive: false });
      const finish = (e) => {
        if (e.pointerType === 'mouse') return;
        onEnd(e.clientX, e.clientY);
      };
      el.addEventListener('pointerup', finish);
      el.addEventListener('pointercancel', () => { tracking = false; });
      return;
    }

    // Touch fallback
    el.addEventListener('touchstart', (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      onStart(t.clientX, t.clientY);
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      onMove(t.clientX, t.clientY, e);
    }, { passive: false });

    el.addEventListener('touchend', (e) => {
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      onEnd(t.clientX, t.clientY);
    }, { passive: true });

    el.addEventListener('touchcancel', () => { tracking = false; });
  };

  // Навешиваем на перекрывающие элементы при открытом меню
  addPointerHandlers(menu);
  addPointerHandlers(shadow);
})();
