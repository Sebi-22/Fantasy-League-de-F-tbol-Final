// ============================================
// CLASE PARA MANEJAR LOGIN
// ============================================

class SistemaLogin {
  constructor() {
    // Usuarios de demostración predefinidos
    this.usuariosDemo = [
      {
        email: 'demo@fantasyliga.com',
        password: 'demo123',
        name: 'Usuario Demo'
      }
    ];
  }

  // ============================================
  // OBTENER USUARIOS GUARDADOS EN LOCALSTORAGE
  // ============================================
  obtenerUsuariosGuardados() {
    const usuariosTexto = localStorage.getItem('fantasyUsers');
    if (usuariosTexto) {
      // Convertir texto JSON a array de objetos
      const usuarios = this.parsearJSON(usuariosTexto);
      return usuarios;
    }
    return this.usuariosDemo;
  }

  // ============================================
  // GUARDAR USUARIOS EN LOCALSTORAGE
  // ============================================
  guardarUsuarios(usuarios) {
    // Convertir array a texto JSON
    const usuariosTexto = this.stringificarJSON(usuarios);
    localStorage.setItem('fantasyUsers', usuariosTexto);
  }

  // ============================================
  // VALIDAR EMAIL
  // ============================================
  validarEmail(email) {
    // Verificar si tiene @ y punto
    if (this.buscarCaracter(email, '@') === -1) return false;
    if (this.buscarCaracter(email, '.') === -1) return false;
    
    // Dividir por @ para validar partes
    const indiceSeparador = this.buscarCaracter(email, '@');
    const antesArroba = this.extraerHasta(email, indiceSeparador);
    const despuesArroba = this.extraerDesde(email, indiceSeparador + 1);
    
    if (antesArroba.length === 0) return false;
    if (!despuesArroba || despuesArroba.length === 0) return false;
    
    return true;
  }

  // ============================================
  // QUITAR ESPACIOS DEL INICIO Y FINAL
  // ============================================
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

  // ============================================
  // MOSTRAR ERROR EN CAMPO
  // ============================================
  mostrarErrorCampo(campoId, mensaje) {
    const campo = document.getElementById(campoId);
    const errorDiv = document.getElementById(campoId + 'Error');
    
    campo.classList.add('is-invalid');
    if (errorDiv) {
      errorDiv.textContent = mensaje;
    }
  }

  // ============================================
  // LIMPIAR ERROR DE CAMPO
  // ============================================
  limpiarErrorCampo(campoId) {
    const campo = document.getElementById(campoId);
    const errorDiv = document.getElementById(campoId + 'Error');
    
    campo.classList.remove('is-invalid');
    if (errorDiv) {
      errorDiv.textContent = '';
    }
  }

  // ============================================
  // MOSTRAR ALERTA
  // ============================================
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

  // ============================================
  // CONFIGURAR BOTÓN PARA VER/OCULTAR CONTRASEÑA
  // ============================================
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

  // ============================================
  // MANEJAR EL LOGIN
  // ============================================
  procesarLogin(evento) {
    evento.preventDefault();
    
    // Limpiar errores previos
    this.limpiarErrorCampo('email');
    this.limpiarErrorCampo('password');
    document.getElementById('loginAlert').classList.add('d-none');
    
    // Obtener valores de los campos
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
    
    // Mostrar loading en botón
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
      
      // Buscar usuario que coincida con email y password
      let usuarioEncontrado = null;
      for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email && usuarios[i].password === password) {
          usuarioEncontrado = usuarios[i];
          break;
        }
      }
      
      if (usuarioEncontrado) {
        // Login exitoso - crear sesión
        const fechaActual = new Date();
        const datosSesion = {
          email: usuarioEncontrado.email,
          name: usuarioEncontrado.name || usuarioEncontrado.username,
          loggedIn: true,
          loginTime: fechaActual.toString(),
          username: usuarioEncontrado.username
        };
        
        // Convertir objeto a texto JSON
        const textoSesion = self.stringificarJSON(datosSesion);
        
        // Guardar según la opción "Recordarme"
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

  // ============================================
  // RECUPERAR CONTRASEÑA
  // ============================================
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

  // ============================================
  // VERIFICAR SI YA HAY SESIÓN ACTIVA
  // ============================================
  verificarSesionExistente() {
    const sesionStorage = sessionStorage.getItem('fantasySession');
    const sesionLocal = localStorage.getItem('fantasySession');
    
    const sesion = sesionStorage || sesionLocal;
    
    if (sesion) {
      try {
        // Convertir texto a objeto
        const datosSesion = this.parsearJSON(sesion);
        if (datosSesion.loggedIn) {
          window.location.href = 'game.html';
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
      }
    }
  }

  // ============================================
  // MANEJAR PARÁMETROS DE LA URL
  // ============================================
  manejarParametrosURL() {
    const url = window.location.search;
    if (!url) return;
    
    // Extraer parámetros manualmente
    const parametros = {};
    const textoSinInterrogacion = this.extraerDesde(url, 1);
    const partes = this.dividirPor(textoSinInterrogacion, '&');
    
    for (let i = 0; i < partes.length; i++) {
      const par = this.dividirPor(partes[i], '=');
      if (par.length === 2) {
        parametros[par[0]] = decodeURIComponent(par[1]);
      }
    }
    
    // Prellenar email si viene en URL
    if (parametros.email) {
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.value = parametros.email;
      }
    }
    
    // Mostrar mensaje si viene de registro
    if (parametros.registered === 'true') {
      this.mostrarAlerta('¡Registro exitoso! Ahora inicia sesión con tu nueva cuenta', 'success');
    }
  }

  // ============================================
  // INICIALIZAR SISTEMA
  // ============================================
  inicializar() {
    // Verificar sesión existente
    this.verificarSesionExistente();
    
    // Manejar parámetros de URL
    this.manejarParametrosURL();
    
    // Setup del formulario de login
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

  // ============================================
  // UTILIDADES - REEMPLAZO DE MÉTODOS MODERNOS
  // ============================================

  // Parsear JSON
  parsearJSON(texto) {
    return JSON.parse(texto);
  }

  // Stringificar JSON
  stringificarJSON(objeto) {
    return JSON.stringify(objeto);
  }

  // Buscar posición de carácter
  buscarCaracter(texto, caracter) {
    for (let i = 0; i < texto.length; i++) {
      if (texto[i] === caracter) {
        return i;
      }
    }
    return -1;
  }

  // Extraer desde posición hasta el final
  extraerDesde(texto, desde) {
    let resultado = '';
    for (let i = desde; i < texto.length; i++) {
      resultado += texto[i];
    }
    return resultado;
  }

  // Extraer desde inicio hasta posición
  extraerHasta(texto, hasta) {
    let resultado = '';
    for (let i = 0; i < hasta && i < texto.length; i++) {
      resultado += texto[i];
    }
    return resultado;
  }

  // Dividir texto por separador
  dividirPor(texto, separador) {
    const resultado = [];
    let actual = '';
    
    for (let i = 0; i < texto.length; i++) {
      if (texto[i] === separador) {
        resultado.push(actual);
        actual = '';
      } else {
        actual += texto[i];
      }
    }
    
    if (actual.length > 0 || texto.length > 0) {
      resultado.push(actual);
    }
    
    return resultado;
  }
}

// ============================================
// INICIALIZAR CUANDO CARGUE LA PÁGINA
// ============================================
const sistemaLogin = new SistemaLogin();

document.addEventListener('DOMContentLoaded', function() {
  sistemaLogin.inicializar();
});