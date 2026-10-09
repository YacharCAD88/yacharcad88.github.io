// Obtenemos elementos
const menuToggle = document.getElementById('menu-toggle');
const menuClose  = document.getElementById('menu-close');
const sideNav    = document.getElementById('side-nav');

// Función para abrir menú
function openMenu() {
  sideNav.classList.add('open');
  document.body.classList.add('menu-open');
}

// Función para cerrar menú
function closeMenu() {
  sideNav.classList.remove('open');
  document.body.classList.remove('menu-open');
}

// Eventos
menuToggle.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);

// Además, cerramos si el usuario hace clic fuera del menú
document.addEventListener('click', (e) => {
  if (!sideNav.contains(e.target) && !menuToggle.contains(e.target)) {
    closeMenu();
  }
});

// Finalmente para poder expandir o contraer el texto en el wrap
document.addEventListener('DOMContentLoaded', () => {
  // Seleccionamos todos los contenedores .review-js
  document.querySelectorAll('.review-js').forEach(review => {
    const btn = review.querySelector('.read-more');
    btn.addEventListener('click', () => {
      review.classList.toggle('expanded');
      // Cambiamos texto del botón según el estado
      btn.textContent = review.classList.contains('expanded')
        ? 'Leer menos'
        : 'Leer más';
    });
  });
});


