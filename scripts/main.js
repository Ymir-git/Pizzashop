const checkbox = document.querySelector('.check-icon');
const menu = document.querySelector('.menu');
const shadow = document.querySelector('body > .shadow');
const body = document.body;
const iconMenu = document.querySelector('.icon-menu');

// Login modal elements
const loginModal = document.getElementById('loginModal');
const loginButtons = document.querySelectorAll('.login-btn');
const loginCloseBtn = document.querySelector('.login-modal__close');
let lastFocusedBeforeLogin = null;

// Cart modal elements
const cartModal = document.getElementById('cartModal');
const cartOpenBtn = document.querySelector('.bag');
const cartCloseBtn = document.querySelector('.cart-modal__close');
const cartPanel = document.querySelector('.cart-modal__panel');
let lastFocusedBeforeCart = null;

function setShadow(open) {
  if (!shadow) return;
  shadow.classList.toggle('shadow--open', open);
}

function openLoginModal() {
  if (!loginModal) return;
  lastFocusedBeforeLogin = document.activeElement;
  loginModal.classList.add('login-modal--open');
  setShadow(true);
  body.classList.add('no-scroll');
  // Focus first field
  const firstInput = loginModal.querySelector('input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])');
  if (firstInput) firstInput.focus();
}

function openCartModal() {
  if (!cartModal) return;
  lastFocusedBeforeCart = document.activeElement;
  cartModal.classList.add('cart-modal--open');
  setShadow(true);
  body.classList.add('no-scroll');
  const focusable = cartModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable) focusable.focus();
}

function closeLoginModal() {
  if (!loginModal) return;
  loginModal.classList.remove('login-modal--open');
  // if menu is not open, remove shadow
  const menuOpen = menu && menu.classList.contains('menu--open');
  const cartOpen = cartModal && cartModal.classList.contains('cart-modal--open');
  setShadow(!!(menuOpen || cartOpen));
  if (!menuOpen && !cartOpen) body.classList.remove('no-scroll');
  if (lastFocusedBeforeLogin && typeof lastFocusedBeforeLogin.focus === 'function') {
    lastFocusedBeforeLogin.focus();
  }
}

function closeCartModal() {
  if (!cartModal) return;
  cartModal.classList.remove('cart-modal--open');
  const menuOpen = menu && menu.classList.contains('menu--open');
  const loginOpen = loginModal && loginModal.classList.contains('login-modal--open');
  setShadow(!!(menuOpen || loginOpen));
  if (!menuOpen && !loginOpen) body.classList.remove('no-scroll');
  if (lastFocusedBeforeCart && typeof lastFocusedBeforeCart.focus === 'function') {
    lastFocusedBeforeCart.focus();
  }
}

function setMenuState(open) {
  if (!menu) return;
  if (open) {
    menu.classList.add('menu--open');
    setShadow(true);
    body.classList.add('no-scroll');
  } else {
    menu.classList.remove('menu--open');
    // keep shadow if login modal is open
    const loginOpen = loginModal && loginModal.classList.contains('login-modal--open');
    setShadow(!!loginOpen);
    if (!loginOpen) body.classList.remove('no-scroll');
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

// 3) Клик по затемнению: закрываем меню/логин/корзину и СНИМАЕМ чекбокс
if (shadow) {
  shadow.addEventListener('click', (e) => {
    if (e.target === shadow) {
      if (loginModal && loginModal.classList.contains('login-modal--open')) {
        closeLoginModal();
      }
      if (cartModal && cartModal.classList.contains('cart-modal--open')) {
        closeCartModal();
      }
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

// 4.1) Закрытие корзины свайпом вправо (Pointer Events с фолбэком на Touch)
(() => {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  const thresholdX = 60; // минимальная горизонтальная дистанция, px
  const restraintY = 80; // допустимое вертикальное отклонение, px

  const isCartOpen = () => !!cartModal && cartModal.classList.contains('cart-modal--open');

  const onStart = (x, y) => {
    if (!isCartOpen()) return;
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
    if (dx > thresholdX && Math.abs(dy) < restraintY && isCartOpen()) {
      closeCartModal();
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

  // Навешиваем на панель и фон корзины
  addPointerHandlers(cartPanel);
  addPointerHandlers(cartModal);
})();

// 5) Login modal wiring
if (loginButtons && loginButtons.length) {
  loginButtons.forEach(btn => btn.addEventListener('click', openLoginModal));
}
if (loginCloseBtn) {
  loginCloseBtn.addEventListener('click', closeLoginModal);
}
if (loginModal) {
  // close on outside click
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) closeLoginModal();
  });
}

// 6) Cart modal wiring
if (cartOpenBtn) {
  cartOpenBtn.addEventListener('click', openCartModal);
}
if (cartCloseBtn) {
  cartCloseBtn.addEventListener('click', closeCartModal);
}
if (cartModal) {
  cartModal.addEventListener('click', (e) => {
    // click on backdrop area (not panel)
    if (e.target === cartModal) closeCartModal();
  });
}

// Global ESC handler for both modals
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (loginModal && loginModal.classList.contains('login-modal--open')) {
      closeLoginModal();
    }
    if (cartModal && cartModal.classList.contains('cart-modal--open')) {
      closeCartModal();
    }
  }
});
