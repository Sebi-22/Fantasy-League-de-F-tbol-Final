// ============================================
// CLASE PARA MANEJAR LOGIN
// ============================================

class SistemaLogin {
  constructor() {
    this.usuariosDemo = [
      {
        email: 'demo@fantasyliga.com',
        password: 'demo123',
        name: 'Usuario Demo'
      }
    ];
  }

  // Obtener usuarios guardados
  obtenerUsuariosGuardados() {
    const usuariosTexto = localStorage.getItem('fantasyUsers');
    if (usuariosTexto) {
      // Convertir texto a array de objetos
      const usuarios = JSON.parse(usuariosTexto);
      return usuarios;
    }
    return this.usuariosDemo;
  }

  // Guardar usuarios
  guardarUsuarios(usuarios) {
    // Convertir array a texto
    const usuariosTexto = JSON.stringify(usuarios);
    localStorage.setItem('fantasyUsers', usuariosTexto);
  }

  // Validar email
  validarEmail(email) {
    // Verificar si tiene @ y punto
    if (email.indexOf('@') === -1) return false;
    if (email.indexOf('.') === -1) return false;
    
    const partes = email.split('@');
    const antesArroba = partes[0];
    const despuesArroba = partes[1];
    
    if (antesArroba.length === 0) return false;
    if (!despuesArroba || despuesArroba.length === 0) return false;
    
    return true;
  }

  // Quitar espacios del inicio y final de un texto
  quitarEspacios(texto) {
    let inicio = 0;
    let fin = texto.length - 1;
    
    // Buscar primer carácter no espacio
    while (inicio < texto.length && texto[inicio] === ' ') {
      inicio = inicio + 1;
    }
    
    // Buscar último carácter no espacio
    while (fin >= 0 && texto[fin] === ' ') {
      fin = fin - 1;
    }
    
    // Extraer substring sin espacios
    let resultado = '';
    for (let i = inicio; i <= fin; i++) {
      resultado = resultado + texto[i];
    }
    
    return resultado;
  }

  // Mostrar error en campo
  mostrarErrorCampo(campoId, mensaje) {
    const campo = document.getElementById(campoId);
    const errorDiv = document.getElementById(campoId + 'Error');
    
    campo.classList.add('is-invalid');
    if (errorDiv) {
      errorDiv.textContent = mensaje;
    }
  }

  // Limpiar error de campo
  limpiarErrorCampo(campoId) {
    const campo = document.getElementById(campoId);
    const errorDiv = document.getElementById(campoId + 'Error');
    
    campo.classList.remove('is-invalid');
    if (errorDiv) {
      errorDiv.textContent = '';
    }
  }

  // Mostrar alerta
  mostrarAlerta(mensaje, tipo = 'danger') {
    const alerta = document.getElementById('loginAlert');
    alerta.className = 'alert alert-' + tipo;
    alerta.textContent = mensaje;
    alerta.classList.remove('d-none');
    
    const self = this;
    setTimeout(function() {
      alerta.classList.add('d-none');
    }, 5000);
  }

  // Configurar botón para ver/ocultar contraseña
  configurarTogglePassword() {
    const botonToggle = document.getElementById('togglePassword');
    const inputPassword = document.getElementById('password');
    
    if (botonToggle && inputPassword) {
      botonToggle.addEventListener('click', function() {
        const tipoActual = inputPassword.getAttribute('type');
        const nuevoTipo = tipoActual === 'password' ? 'text' : 'password';
        inputPassword.setAttribute('type', nuevoTipo);
        botonToggle.textContent = nuevoTipo === 'password' ? '👁️' : '🙈';
      });
    }
  }

  // Manejar el login
  procesarLogin(evento) {
    evento.preventDefault();
    
    // Limpiar errores previos
    this.limpiarErrorCampo('email');
    this.limpiarErrorCampo('password');
    document.getElementById('loginAlert').classList.add('d-none');
    
    // Obtener valores
    const emailSinLimpiar = document.getElementById('email').value;
    const email = this.quitarEspacios(emailSinLimpiar);
    const password = document.getElementById('password').value;
    const recordarme = document.getElementById('rememberMe').checked;
    
    // Validaciones
    let hayError = false;
    
    if (!email || email.length === 0) {
      this.mostrarErrorCampo('email', 'Por favor ingresa tu correo electrónico');
      hayError = true;
    } else if (!this.validarEmail(email)) {
      this.mostrarErrorCampo('email', 'Por favor ingresa un correo electrónico válido');
      hayError = true;
    }
    
    if (!password || password.length === 0) {
      this.mostrarErrorCampo('password', 'Por favor ingresa tu contraseña');
      hayError = true;
    }
    
    if (hayError) return;
    
    // Mostrar loading
    const botonLogin = document.getElementById('loginBtn');
    const textoBoton = document.getElementById('loginBtnText');
    const spinnerBoton = document.getElementById('loginBtnSpinner');
    
    botonLogin.disabled = true;
    textoBoton.classList.add('d-none');
    spinnerBoton.classList.remove('d-none');
    
    // Simular llamada a servidor (asíncrono)
    const self = this;
    setTimeout(function() {
      const usuarios = self.obtenerUsuariosGuardados();
      
      // Buscar usuario que coincida
      let usuarioEncontrado = null;
      for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email && usuarios[i].password === password) {
          usuarioEncontrado = usuarios[i];
          break;
        }
      }
      
      if (usuarioEncontrado) {
        // Login exitoso
        const fechaActual = new Date();
        const datosSesion = {
          email: usuarioEncontrado.email,
          name: usuarioEncontrado.name || usuarioEncontrado.username,
          loggedIn: true,
          loginTime: fechaActual.toString(),
          username: usuarioEncontrado.username
        };
        
        // Convertir objeto a texto
        const textoSesion = JSON.stringify(datosSesion);
        
        if (recordarme) {
          localStorage.setItem('fantasySession', textoSesion);
        } else {
          sessionStorage.setItem('fantasySession', textoSesion);
        }
        
        // Guardar también el usuario logueado
        localStorage.setItem('loggedUser', email);
        
        self.mostrarAlerta('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
        
        setTimeout(function() {
          window.location.href = 'game.html';
        }, 1000);
        
      } else {
        // Login fallido
        botonLogin.disabled = false;
        textoBoton.classList.remove('d-none');
        spinnerBoton.classList.add('d-none');
        
        self.mostrarAlerta('Correo electrónico o contraseña incorrectos. Intenta con: demo@fantasyliga.com / demo123');
      }
    }, 1500);
  }

  // Recuperar contraseña
  procesarRecuperacion() {
    const emailRecuperarSinLimpiar = document.getElementById('recoverEmail').value;
    const emailRecuperar = this.quitarEspacios(emailRecuperarSinLimpiar);
    const botonRecuperar = document.getElementById('recoverBtn');
    
    if (!emailRecuperar || emailRecuperar.length === 0 || !this.validarEmail(emailRecuperar)) {
      alert('Por favor ingresa un correo electrónico válido');
      return;
    }
    
    botonRecuperar.disabled = true;
    botonRecuperar.textContent = 'Enviando...';
    
    setTimeout(function() {
      alert('Se ha enviado un enlace de recuperación a ' + emailRecuperar + '\n\n(Esta es una versión demo - no se envió un email real)');
      botonRecuperar.disabled = false;
      botonRecuperar.textContent = 'Enviar enlace';
      
      const modalElement = document.getElementById('forgotPasswordModal');
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
      
      document.getElementById('recoverEmail').value = '';
    }, 1500);
  }

  // Verificar si ya hay sesión activa
  verificarSesionExistente() {
    const sesionStorage = sessionStorage.getItem('fantasySession');
    const sesionLocal = localStorage.getItem('fantasySession');
    
    const sesion = sesionStorage || sesionLocal;
    
    if (sesion) {
      try {
        const datosSesion = JSON.parse(sesion);
        if (datosSesion.loggedIn) {
          window.location.href = 'game.html';
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
      }
    }
  }

  // Manejar parámetros de la URL
  manejarParametrosURL() {
    const url = window.location.search;
    if (!url) return;
    
    // Extraer parámetros manualmente
    const parametros = {};
    const textoSinInterrogacion = url.substring(1);
    const partes = textoSinInterrogacion.split('&');
    
    for (let i = 0; i < partes.length; i++) {
      const par = partes[i].split('=');
      if (par.length === 2) {
        parametros[par[0]] = decodeURIComponent(par[1]);
      }
    }
    
    if (parametros.email) {
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.value = parametros.email;
      }
    }
    
    if (parametros.registered === 'true') {
      this.mostrarAlerta('¡Registro exitoso! Ahora inicia sesión con tu nueva cuenta', 'success');
    }
  }

  // Inicializar sistema
  inicializar() {
    // Verificar sesión existente
    this.verificarSesionExistente();
    
    // Manejar parámetros de URL
    this.manejarParametrosURL();
    
    // Setup del formulario
    const formularioLogin = document.getElementById('loginForm');
    if (formularioLogin) {
      const self = this;
      formularioLogin.addEventListener('submit', function(e) {
        self.procesarLogin(e);
      });
    }
    
    // Setup de toggle de contraseña
    this.configurarTogglePassword();
    
    // Setup de recuperación de contraseña
    const botonRecuperar = document.getElementById('recoverBtn');
    if (botonRecuperar) {
      const self = this;
      botonRecuperar.addEventListener('click', function() {
        self.procesarRecuperacion();
      });
    }
    
    // Limpiar errores al escribir
    const inputEmail = document.getElementById('email');
    const inputPassword = document.getElementById('password');
    
    const self = this;
    if (inputEmail) {
      inputEmail.addEventListener('input', function() {
        self.limpiarErrorCampo('email');
      });
    }
    
    if (inputPassword) {
      inputPassword.addEventListener('input', function() {
        self.limpiarErrorCampo('password');
      });
    }
    
    // Inicializar usuarios demo si no existen
    const usuarios = localStorage.getItem('fantasyUsers');
    if (!usuarios) {
      this.guardarUsuarios(this.usuariosDemo);
    }
  }
}

// ============================================
// INICIALIZAR CUANDO CARGUE LA PÁGINA
// ============================================
const sistemaLogin = new SistemaLogin();

document.addEventListener('DOMContentLoaded', function() {
  sistemaLogin.inicializar();
});