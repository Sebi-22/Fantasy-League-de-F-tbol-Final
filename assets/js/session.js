// session.js - utilidades de sesión para Fantasy League
// Provee: getSession(), isLoggedIn(), logout(), initSessionUI()

function getSession() {
  const sessionData = sessionStorage.getItem('fantasySession') || localStorage.getItem('fantasySession');
  if (!sessionData) return null;
  try {
    return JSON.parse(sessionData);
  } catch (e) {
    console.error('session.js: error parsing session data', e);
    return null;
  }
}

function isLoggedIn() {
  const s = getSession();
  return !!(s && s.loggedIn);
}

function logout(redirectToIndex = true) {
  try {
    sessionStorage.removeItem('fantasySession');
    localStorage.removeItem('fantasySession');
  } catch (e) {
    console.error('session.js: error clearing session', e);
  }

  if (redirectToIndex) {
    // Si estamos en una subpágina (/paginas/*), volver al index con ../
    const isInSubpage = window.location.pathname.includes('/paginas/');
    window.location.href = isInSubpage ? '../index.html' : 'index.html';
  } else {
    initSessionUI();
  }
}

// Escapa texto para evitar inyección simple en el DOM
function _escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initSessionUI() {
  const container = document.getElementById('navSession');
  if (!container) return;

  // Detectar si el placeholder está dentro de un dropdown menu
  const parentIsDropdownMenu = container.parentElement && container.parentElement.classList && container.parentElement.classList.contains('dropdown-menu');

  if (isLoggedIn()) {
    const s = getSession();
    const displayName = _escapeHtml(s.name || s.email || 'Usuario');
    
    // Detectar si estamos en una subpágina para ajustar rutas
    const isInSubpage = window.location.pathname.includes('/paginas/');
    const paginasPrefix = isInSubpage ? '' : 'paginas/';

    if (parentIsDropdownMenu) {
      // Renderizar opciones como items del dropdown
      container.innerHTML = `\
        <a class="dropdown-item disabled text-secondary">${displayName}</a>\
        <a class="dropdown-item" href="${paginasPrefix}equipo.html">Mi equipo</a>\
        <a class="dropdown-item" href="${paginasPrefix}seleccion.html">Seleccionar</a>\
        <hr class="dropdown-divider">\
        <button class="dropdown-item" id="logoutBtn">Cerrar sesión</button>`;

      const logoutBtn = container.querySelector('#logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          logout(true);
        });
      }
    } else {
      // Fuera de dropdown: renderizar un dropdown-toggle nav item
      container.classList.add('dropdown');
      container.innerHTML = `\
        <a class="nav-link dropdown-toggle" href="#" id="userMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">${displayName}</a>\
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuLink">\
          <li><a class="dropdown-item" href="${paginasPrefix}equipo.html">Mi equipo</a></li>\
          <li><a class="dropdown-item" href="${paginasPrefix}seleccion.html">Seleccionar</a></li>\
          <li><hr class="dropdown-divider"></li>\
          <li><button class="dropdown-item" id="logoutBtn">Cerrar sesión</button></li>\
        </ul>`;

      const logoutBtn = container.querySelector('#logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          logout(true);
        });
      }
    }
  } else {
    // No hay sesión: mostrar link para iniciar sesión
    // Detectar si estamos en una subpágina para ajustar rutas
    const isInSubpage = window.location.pathname.includes('/paginas/');
    const loginPath = isInSubpage ? 'login.html' : 'paginas/login.html';

    if (parentIsDropdownMenu) {
      container.innerHTML = `<a class="dropdown-item" href="${loginPath}">Iniciar sesión</a>`;
    } else {
      container.classList.remove('dropdown');
      container.innerHTML = `<a class="nav-link" href="${loginPath}">Iniciar sesión</a>`;
    }
  }
}

// Inicializar cuando el DOM esté listo
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initSessionUI();
  });
}