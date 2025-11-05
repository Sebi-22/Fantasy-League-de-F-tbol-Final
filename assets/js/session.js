// ============================================
// CLASE PARA MANEJAR LA SESIÓN DEL USUARIO
// ============================================

class SesionUsuario {
  constructor() {
    this.datosUsuario = null;
    this.estaLogueado = false;
  }

  // Obtener datos de sesión guardados
  obtenerSesion() {
    // Intentar obtener de sessionStorage
    let datosSesion = sessionStorage.getItem('fantasySession');
    
    // Si no hay en sessionStorage, intentar en localStorage
    if (!datosSesion) {
      datosSesion = localStorage.getItem('fantasySession');
    }

    if (!datosSesion) {
      return null;
    }

    try {
      // Convertir texto a objeto
      const objetoSesion = this.convertirTextoAObjeto(datosSesion);
      this.datosUsuario = objetoSesion;
      this.estaLogueado = objetoSesion.loggedIn;
      return objetoSesion;
    } catch (error) {
      console.error('Error al leer sesión:', error);
      return null;
    }
  }

  // Verificar si el usuario está logueado
  verificarLogin() {
    const sesion = this.obtenerSesion();
    if (sesion && sesion.loggedIn) {
      this.estaLogueado = true;
      return true;
    }
    this.estaLogueado = false;
    return false;
  }

  // Cerrar sesión
  cerrarSesion(redirigirAIndex = true) {
    try {
      sessionStorage.removeItem('fantasySession');
      localStorage.removeItem('fantasySession');
      this.datosUsuario = null;
      this.estaLogueado = false;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }

    if (redirigirAIndex) {
      const estaEnSubpagina = window.location.pathname.includes('/paginas/');
      window.location.href = estaEnSubpagina ? '../index.html' : 'index.html';
    }
  }

  // Escapar texto para evitar problemas en HTML
  escaparTexto(texto) {
    if (!texto) return '';
    let textoSeguro = texto;
    textoSeguro = textoSeguro.replace(/&/g, '&amp;');
    textoSeguro = textoSeguro.replace(/</g, '&lt;');
    textoSeguro = textoSeguro.replace(/>/g, '&gt;');
    textoSeguro = textoSeguro.replace(/"/g, '&quot;');
    textoSeguro = textoSeguro.replace(/'/g, '&#039;');
    return textoSeguro;
  }

  // Inicializar interfaz de sesión
  inicializarInterfaz() {
    const contenedor = document.getElementById('navSession');
    if (!contenedor) return;

    const parenteEsDropdown = contenedor.parentElement && 
                              contenedor.parentElement.classList && 
                              contenedor.parentElement.classList.contains('dropdown-menu');

    if (this.verificarLogin()) {
      const sesion = this.obtenerSesion();
      const nombreMostrar = this.escaparTexto(sesion.name || sesion.email || 'Usuario');
      
      const estaEnSubpagina = window.location.pathname.includes('/paginas/');
      const prefijoPaginas = estaEnSubpagina ? '' : 'paginas/';

      if (parenteEsDropdown) {
        contenedor.innerHTML = 
          '<a class="dropdown-item disabled text-secondary">' + nombreMostrar + '</a>' +
          '<a class="dropdown-item" href="' + prefijoPaginas + 'equipo.html">Mi equipo</a>' +
          '<a class="dropdown-item" href="' + prefijoPaginas + 'seleccion.html">Seleccionar</a>' +
          '<hr class="dropdown-divider">' +
          '<button class="dropdown-item" id="logoutBtn">Cerrar sesión</button>';

        const botonLogout = contenedor.querySelector('#logoutBtn');
        if (botonLogout) {
          const self = this;
          botonLogout.addEventListener('click', function(evento) {
            evento.preventDefault();
            self.cerrarSesion(true);
          });
        }
      } else {
        contenedor.classList.add('dropdown');
        contenedor.innerHTML = 
          '<a class="nav-link dropdown-toggle" href="#" id="userMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">' + 
          nombreMostrar + '</a>' +
          '<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuLink">' +
            '<li><a class="dropdown-item" href="' + prefijoPaginas + 'equipo.html">Mi equipo</a></li>' +
            '<li><a class="dropdown-item" href="' + prefijoPaginas + 'seleccion.html">Seleccionar</a></li>' +
            '<li><hr class="dropdown-divider"></li>' +
            '<li><button class="dropdown-item" id="logoutBtn">Cerrar sesión</button></li>' +
          '</ul>';

        const botonLogout = contenedor.querySelector('#logoutBtn');
        if (botonLogout) {
          const self = this;
          botonLogout.addEventListener('click', function(evento) {
            evento.preventDefault();
            self.cerrarSesion(true);
          });
        }
      }
    } else {
      const estaEnSubpagina = window.location.pathname.includes('/paginas/');
      const rutaLogin = estaEnSubpagina ? 'login.html' : 'paginas/login.html';

      if (parenteEsDropdown) {
        contenedor.innerHTML = '<a class="dropdown-item" href="' + rutaLogin + '">Iniciar sesión</a>';
      } else {
        contenedor.classList.remove('dropdown');
        contenedor.innerHTML = '<a class="nav-link" href="' + rutaLogin + '">Iniciar sesión</a>';
      }
    }
  }

  // Convertir objeto a texto (reemplazo de JSON.stringify)
  convertirObjetoATexto(objeto) {
    return JSON.stringify(objeto);
  }

  // Convertir texto a objeto (reemplazo de JSON.parse)
  convertirTextoAObjeto(texto) {
    return JSON.parse(texto);
  }
}

// ============================================
// CREAR INSTANCIA GLOBAL
// ============================================
const sistemaSession = new SesionUsuario();

// Funciones globales para compatibilidad
function getSession() {
  return sistemaSession.obtenerSesion();
}

function isLoggedIn() {
  return sistemaSession.verificarLogin();
}

function logout(redirigir = true) {
  sistemaSession.cerrarSesion(redirigir);
}

function initSessionUI() {
  sistemaSession.inicializarInterfaz();
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
  sistemaSession.inicializarInterfaz();
});