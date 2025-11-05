// ============================================
// CLASE PARA MANEJAR LA PÁGINA DEL JUEGO
// ============================================

class PaginaJuego {
  constructor() {
    this.sesion = null;
  }

  // Verificar si está logueado
  estaLogueado() {
    const sesionStorage = sessionStorage.getItem('fantasySession');
    const sesionLocal = localStorage.getItem('fantasySession');
    
    const textoSesion = sesionStorage || sesionLocal;
    
    if (!textoSesion) return false;
    
    try {
      this.sesion = JSON.parse(textoSesion);
      return this.sesion.loggedIn === true;
    } catch (error) {
      return false;
    }
  }

  // Obtener sesión
  obtenerSesion() {
    if (this.sesion) return this.sesion;
    
    const sesionStorage = sessionStorage.getItem('fantasySession');
    const sesionLocal = localStorage.getItem('fantasySession');
    
    const textoSesion = sesionStorage || sesionLocal;
    
    if (!textoSesion) return null;
    
    try {
      this.sesion = JSON.parse(textoSesion);
      return this.sesion;
    } catch (error) {
      return null;
    }
  }

  // Mostrar mensaje de bienvenida
  mostrarBienvenida() {
    const mensajeBienvenida = document.getElementById('welcomeMsg');
    const tituloSesion = document.getElementById('pageTitle');
    const sesion = this.obtenerSesion();

    let nombre = 'Jugador';
    if (sesion) {
      if (sesion.name) {
        nombre = sesion.name;
      } else if (sesion.email) {
        nombre = sesion.email;
      }
    }

    if (mensajeBienvenida) {
      mensajeBienvenida.textContent = '¡Bienvenido, ' + nombre + '! Aquí podés gestionar tu equipo y participar en la liga.';
    }
    
    if (tituloSesion) {
      tituloSesion.textContent = 'Panel del juego';
    }
  }

  // Inicializar página
  inicializar() {
    // Verificar si está logueado
    if (!this.estaLogueado()) {
      // Redirigir al login
      window.location.href = 'login.html';
      return;
    }

    // Mostrar mensaje de bienvenida
    this.mostrarBienvenida();
  }
}

// ============================================
// INICIALIZAR CUANDO CARGUE LA PÁGINA
// ============================================
const paginaJuego = new PaginaJuego();

document.addEventListener('DOMContentLoaded', function() {
  paginaJuego.inicializar();
});