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
