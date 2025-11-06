// ============================================
// CLASE PARA MANEJAR REGISTRO DE USUARIOS
// ============================================

class SistemaRegistro {
  constructor() {
    // Constructor vacío
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

  // Obtener usuarios guardados
  obtenerUsuariosGuardados() {
    const usuariosTexto = localStorage.getItem('fantasyUsers');
    if (usuariosTexto) {
      const usuarios = JSON.parse(usuariosTexto);
      return usuarios;
    }
    return [];
  }

  // Guardar usuarios
  guardarUsuarios(usuarios) {
    const usuariosTexto = JSON.stringify(usuarios);
    localStorage.setItem('fantasyUsers', usuariosTexto);
  }

  // Validar email
  validarEmail(email) {
    if (email.indexOf('@') === -1) return false;
    if (email.indexOf('.') === -1) return false;
    
    const partes = email.split('@');
    const antesArroba = partes[0];
    const despuesArroba = partes[1];
    
    if (antesArroba.length === 0) return false;
    if (!despuesArroba || despuesArroba.length === 0) return false;
    
    return true;
  }

  // Validar nombre
  validarNombre(nombre) {
    const nombreLimpio = this.quitarEspacios(nombre);
    return nombreLimpio.length >= 3;
  }

  // Validar contraseña
  validarPassword(password) {
    const longitudMinima = 6;
    
    // Verificar si tiene mayúsculas
    let tieneMayusculas = false;
    for (let i = 0; i < password.length; i++) {
      if (password[i] >= 'A' && password[i] <= 'Z') {
        tieneMayusculas = true;
        break;
      }
    }
    
    // Verificar si tiene minúsculas
    let tieneMinusculas = false;
    for (let i = 0; i < password.length; i++) {
      if (password[i] >= 'a' && password[i] <= 'z') {
        tieneMinusculas = true;
        break;
      }
    }
    
    // Verificar si tiene números
    let tieneNumeros = false;
    for (let i = 0; i < password.length; i++) {
      if (password[i] >= '0' && password[i] <= '9') {
        tieneNumeros = true;
        break;
      }
    }
    
    // Verificar si tiene caracteres especiales
    const caracteresEspeciales = '!@#$%^&*(),.?":{}|<>';
    let tieneEspeciales = false;
    for (let i = 0; i < password.length; i++) {
      if (caracteresEspeciales.indexOf(password[i]) !== -1) {
        tieneEspeciales = true;
        break;
      }
    }
    
    return {
      esValida: password.length >= longitudMinima,
      longitud: password.length >= longitudMinima,
      tieneMayusculas: tieneMayusculas,
      tieneMinusculas: tieneMinusculas,
      tieneNumeros: tieneNumeros,
      tieneEspeciales: tieneEspeciales,
      fortaleza: this.calcularFortalezaPassword(password)
    };
  }

  // Calcular fortaleza de contraseña
  calcularFortalezaPassword(password) {
    let fortaleza = 0;
    
    if (password.length >= 6) fortaleza = fortaleza + 20;
    if (password.length >= 8) fortaleza = fortaleza + 20;
    if (password.length >= 12) fortaleza = fortaleza + 10;
    
    // Verificar minúsculas
    for (let i = 0; i < password.length; i++) {
      if (password[i] >= 'a' && password[i] <= 'z') {
        fortaleza = fortaleza + 15;
        break;
      }
    }
    
    // Verificar mayúsculas
    for (let i = 0; i < password.length; i++) {
      if (password[i] >= 'A' && password[i] <= 'Z') {
        fortaleza = fortaleza + 15;
        break;
      }
    }
    
    // Verificar números
    for (let i = 0; i < password.length; i++) {
      if (password[i] >= '0' && password[i] <= '9') {
        fortaleza = fortaleza + 10;
        break;
      }
    }
    
    // Verificar caracteres especiales
    const especiales = '!@#$%^&*(),.?":{}|<>';
    for (let i = 0; i < password.length; i++) {
      if (especiales.indexOf(password[i]) !== -1) {
        fortaleza = fortaleza + 10;
        break;
      }
    }
    
    // Limitar a 100 máximo
    if (fortaleza > 100) fortaleza = 100;
    
    return fortaleza;
  }

  // Actualizar indicador de fortaleza
  actualizarIndicadorFortaleza(password) {
    const barraFortaleza = document.getElementById('passwordStrength');
    const validacion = this.validarPassword(password);
    const fortaleza = validacion.fortaleza;
    
    barraFortaleza.style.width = fortaleza + '%';
    
    if (fortaleza < 40) {
      barraFortaleza.className = 'progress-bar bg-danger';
    } else if (fortaleza < 70) {
      barraFortaleza.className = 'progress-bar bg-warning';
    } else {
      barraFortaleza.className = 'progress-bar bg-success';
    }
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
    const alerta = document.getElementById('signupAlert');
    alerta.className = 'alert alert-' + tipo;
    alerta.textContent = mensaje;
    alerta.classList.remove('d-none');
    
    setTimeout(function() {
      alerta.classList.add('d-none');
    }, 5000);
  }

  // Configurar botones para ver/ocultar contraseñas
  configurarTogglesPassword() {
    // Toggle para contraseña
    const togglePassword = document.getElementById('togglePassword');
    const inputPassword = document.getElementById('password');
    
    if (togglePassword && inputPassword) {
      togglePassword.addEventListener('click', function() {
        const tipoActual = inputPassword.getAttribute('type');
        const nuevoTipo = tipoActual === 'password' ? 'text' : 'password';
        inputPassword.setAttribute('type', nuevoTipo);
        togglePassword.textContent = nuevoTipo === 'password' ? '👁️' : '🙈';
      });
    }
    
    // Toggle para confirmar contraseña
    const toggleConfirm = document.getElementById('toggleConfirmPassword');
    const inputConfirm = document.getElementById('confirmPassword');
    
    if (toggleConfirm && inputConfirm) {
      toggleConfirm.addEventListener('click', function() {
        const tipoActual = inputConfirm.getAttribute('type');
        const nuevoTipo = tipoActual === 'password' ? 'text' : 'password';
        inputConfirm.setAttribute('type', nuevoTipo);
        toggleConfirm.textContent = nuevoTipo === 'password' ? '👁️' : '🙈';
      });
    }
  }

  // Convertir texto a minúsculas
  convertirAMinusculas(texto) {
    let resultado = '';
    for (let i = 0; i < texto.length; i++) {
      const char = texto[i];
      if (char >= 'A' && char <= 'Z') {
        // Convertir a minúscula sumando 32 en ASCII
        const codigoMinuscula = char.charCodeAt(0) + 32;
        resultado = resultado + String.fromCharCode(codigoMinuscula);
      } else {
        resultado = resultado + char;
      }
    }
    return resultado;
  }

  // Manejar el registro
  procesarRegistro(evento) {
    evento.preventDefault();
    
    // Limpiar errores previos
    this.limpiarErrorCampo('fullName');
    this.limpiarErrorCampo('email');
    this.limpiarErrorCampo('password');
    this.limpiarErrorCampo('confirmPassword');
    document.getElementById('signupAlert').classList.add('d-none');
    
    // Obtener valores
    const nombreCompletoSinLimpiar = document.getElementById('fullName').value;
    const nombreCompleto = this.quitarEspacios(nombreCompletoSinLimpiar);
    
    const emailSinLimpiar = document.getElementById('email').value;
    const email = this.quitarEspacios(emailSinLimpiar);
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const aceptaTerminos = document.getElementById('acceptTerms').checked;
    
    // Validaciones
    let hayError = false;
    
    // Validar nombre
    if (!nombreCompleto || nombreCompleto.length === 0) {
      this.mostrarErrorCampo('fullName', 'Por favor ingresa tu nombre completo');
      hayError = true;
    } else if (!this.validarNombre(nombreCompleto)) {
      this.mostrarErrorCampo('fullName', 'El nombre debe tener al menos 3 caracteres');
      hayError = true;
    }
    
    // Validar email
    if (!email || email.length === 0) {
      this.mostrarErrorCampo('email', 'Por favor ingresa tu correo electrónico');
      hayError = true;
    } else if (!this.validarEmail(email)) {
      this.mostrarErrorCampo('email', 'Por favor ingresa un correo electrónico válido');
      hayError = true;
    } else {
      // Verificar si el email ya existe
      const usuarios = this.obtenerUsuariosGuardados();
      let emailExiste = false;
      
      const emailMinusculas = this.convertirAMinusculas(email);
      
      for (let i = 0; i < usuarios.length; i++) {
        const emailUsuarioMinusculas = this.convertirAMinusculas(usuarios[i].email);
        if (emailUsuarioMinusculas === emailMinusculas) {
          emailExiste = true;
          break;
        }
      }
      
      if (emailExiste) {
        this.mostrarErrorCampo('email', 'Este correo electrónico ya está registrado');
        hayError = true;
      }
    }
    
    // Validar contraseña
    const validacionPassword = this.validarPassword(password);
    if (!password || password.length === 0) {
      this.mostrarErrorCampo('password', 'Por favor ingresa una contraseña');
      hayError = true;
    } else if (!validacionPassword.esValida) {
      this.mostrarErrorCampo('password', 'La contraseña debe tener al menos 6 caracteres');
      hayError = true;
    }
    
    // Validar confirmación de contraseña
    if (!confirmPassword || confirmPassword.length === 0) {
      this.mostrarErrorCampo('confirmPassword', 'Por favor confirma tu contraseña');
      hayError = true;
    } else if (password !== confirmPassword) {
      this.mostrarErrorCampo('confirmPassword', 'Las contraseñas no coinciden');
      hayError = true;
    }
    
    // Validar términos
    if (!aceptaTerminos) {
      this.mostrarAlerta('Debes aceptar los términos y condiciones para continuar');
      hayError = true;
    }
    
    if (hayError) return;
    
    // Mostrar loading
    const botonRegistro = document.getElementById('signupBtn');
    const textoBoton = document.getElementById('signupBtnText');
    const spinnerBoton = document.getElementById('signupBtnSpinner');
    
    botonRegistro.disabled = true;
    textoBoton.classList.add('d-none');
    spinnerBoton.classList.remove('d-none');
    
    // Simular registro en servidor (asíncrono)
    const self = this;
    setTimeout(function() {
      // Crear nuevo usuario
      const fechaActual = new Date();
      const timestamp = fechaActual.getTime();
      
      const nuevoUsuario = {
        id: timestamp,
        name: nombreCompleto,
        email: email,
        password: password,
        createdAt: fechaActual.toString()
      };
      
      // Guardar usuario
      const usuarios = self.obtenerUsuariosGuardados();
      usuarios.push(nuevoUsuario);
      self.guardarUsuarios(usuarios);
      
      // Mostrar éxito y redirigir
      self.mostrarAlerta('¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...', 'success');
      
      setTimeout(function() {
        window.location.href = 'login.html?email=' + encodeURIComponent(email) + '&registered=true';
      }, 1500);
      
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
          window.location.href = '../game.html';
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error);
      }
    }
  }

  // Inicializar sistema
  inicializar() {
    // Verificar sesión existente
    this.verificarSesionExistente();
    
    // Setup del formulario
    const formularioRegistro = document.getElementById('signupForm');
    if (formularioRegistro) {
      const self = this;
      formularioRegistro.addEventListener('submit', function(e) {
        self.procesarRegistro(e);
      });
    }
    
    // Setup de toggles de contraseña
    this.configurarTogglesPassword();
    
    // Setup de indicador de fortaleza
    const inputPassword = document.getElementById('password');
    if (inputPassword) {
      const self = this;
      inputPassword.addEventListener('input', function(e) {
        self.actualizarIndicadorFortaleza(e.target.value);
        self.limpiarErrorCampo('password');
      });
    }
    
    // Limpiar errores al escribir
    const inputNombre = document.getElementById('fullName');
    const inputEmail = document.getElementById('email');
    const inputConfirm = document.getElementById('confirmPassword');
    
    const self = this;
    if (inputNombre) {
      inputNombre.addEventListener('input', function() {
        self.limpiarErrorCampo('fullName');
      });
    }
    
    if (inputEmail) {
      inputEmail.addEventListener('input', function() {
        self.limpiarErrorCampo('email');
      });
    }
    
    if (inputConfirm) {
      inputConfirm.addEventListener('input', function() {
        self.limpiarErrorCampo('confirmPassword');
      });
    }
  }
}

// ============================================
// INICIALIZAR CUANDO CARGUE LA PÁGINA
// ============================================
const sistemaRegistro = new SistemaRegistro();

document.addEventListener('DOMContentLoaded', function() {
  sistemaRegistro.inicializar();
});