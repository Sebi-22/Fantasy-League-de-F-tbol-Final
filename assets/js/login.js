// Usuarios demo (en producción, esto vendría de una API/base de datos)
const DEMO_USERS = [
  {
    email: 'demo@fantasyliga.com',
    password: 'demo123',
    name: 'Usuario Demo'
  }
];

// Función para obtener usuarios almacenados
function getStoredUsers() {
  const users = localStorage.getItem('fantasyUsers');
  return users ? JSON.parse(users) : DEMO_USERS;
}

// Función para guardar usuarios
function saveUsers(users) {
  localStorage.setItem('fantasyUsers', JSON.stringify(users));
}

// Función para validar email
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Función para mostrar error en campo
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorDiv = document.getElementById(`${fieldId}Error`);
  
  field.classList.add('is-invalid');
  if (errorDiv) {
    errorDiv.textContent = message;
  }
}

// Función para limpiar errores
function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorDiv = document.getElementById(`${fieldId}Error`);
  
  field.classList.remove('is-invalid');
  if (errorDiv) {
    errorDiv.textContent = '';
  }
}

// Función para mostrar alerta
function showAlert(message, type = 'danger') {
  const alert = document.getElementById('loginAlert');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alert.classList.remove('d-none');
  
  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    alert.classList.add('d-none');
  }, 5000);
}

// Función para toggle de contraseña
function setupPasswordToggle() {
  const toggleBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }
}

// Función para manejar el login
function handleLogin(e) {
  e.preventDefault();
  
  // Limpiar errores previos
  clearFieldError('email');
  clearFieldError('password');
  document.getElementById('loginAlert').classList.add('d-none');
  
  // Obtener valores
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  // Validaciones
  let hasError = false;
  
  if (!email) {
    showFieldError('email', 'Por favor ingresa tu correo electrónico');
    hasError = true;
  } else if (!isValidEmail(email)) {
    showFieldError('email', 'Por favor ingresa un correo electrónico válido');
    hasError = true;
  }
  
  if (!password) {
    showFieldError('password', 'Por favor ingresa tu contraseña');
    hasError = true;
  }
  
  if (hasError) return;
  
  // Mostrar loading
  const loginBtn = document.getElementById('loginBtn');
  const loginBtnText = document.getElementById('loginBtnText');
  const loginBtnSpinner = document.getElementById('loginBtnSpinner');
  
  loginBtn.disabled = true;
  loginBtnText.classList.add('d-none');
  loginBtnSpinner.classList.remove('d-none');
  
  // Simular llamada a API
  setTimeout(() => {
    const users = getStoredUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Login exitoso
      const sessionData = {
        email: user.email,
        name: user.name,
        loggedIn: true,
        loginTime: new Date().toISOString()
      };
      
      // Guardar sesión
      if (rememberMe) {
        localStorage.setItem('fantasySession', JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem('fantasySession', JSON.stringify(sessionData));
      }
      
      // Redirigir al dashboard
      showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
      
      setTimeout(() => {
        window.location.href = 'game.html';
      }, 1000);
      
    } else {
      // Login fallido
      loginBtn.disabled = false;
      loginBtnText.classList.remove('d-none');
      loginBtnSpinner.classList.add('d-none');
      
      showAlert('Correo electrónico o contraseña incorrectos. Intenta con: demo@fantasyliga.com / demo123');
    }
  }, 1500);
}

// Función para recuperar contraseña
function handlePasswordRecovery() {
  const recoverEmail = document.getElementById('recoverEmail').value.trim();
  const recoverBtn = document.getElementById('recoverBtn');
  
  if (!recoverEmail || !isValidEmail(recoverEmail)) {
    alert('Por favor ingresa un correo electrónico válido');
    return;
  }
  
  // Simular envío de email
  recoverBtn.disabled = true;
  recoverBtn.textContent = 'Enviando...';
  
  setTimeout(() => {
    alert(`Se ha enviado un enlace de recuperación a ${recoverEmail}\n\n(Esta es una versión demo - no se envió un email real)`);
    recoverBtn.disabled = false;
    recoverBtn.textContent = 'Enviar enlace';
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
    if (modal) modal.hide();
    
    document.getElementById('recoverEmail').value = '';
  }, 1500);
}

// Función para verificar si hay sesión activa
function checkExistingSession() {
  const sessionStorage_data = sessionStorage.getItem('fantasySession');
  const localStorage_data = localStorage.getItem('fantasySession');
  
  const session = sessionStorage_data || localStorage_data;
  
  if (session) {
    try {
      const sessionData = JSON.parse(session);
      if (sessionData.loggedIn) {
        // Ya hay una sesión activa, redirigir
        window.location.href = '../game.html';
      }
    } catch (e) {
      console.error('Error al verificar sesión:', e);
    }
  }
}

// Función para manejar parámetros de URL
function handleURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');
  const registered = urlParams.get('registered');
  
  // Si viene desde el registro, pre-llenar el email y mostrar mensaje
  if (email) {
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.value = decodeURIComponent(email);
    }
  }
  
  // Mostrar mensaje de bienvenida si acaba de registrarse
  if (registered === 'true') {
    showAlert('¡Registro exitoso! Ahora inicia sesión con tu nueva cuenta', 'success');
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Verificar sesión existente
  checkExistingSession();
  
  // Manejar parámetros de URL
  handleURLParams();
  
  // Setup del formulario
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Setup de toggle de contraseña
  setupPasswordToggle();
  
  // Setup de recuperación de contraseña
  const recoverBtn = document.getElementById('recoverBtn');
  if (recoverBtn) {
    recoverBtn.addEventListener('click', handlePasswordRecovery);
  }
  
  // Limpiar errores al escribir
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (emailInput) {
    emailInput.addEventListener('input', () => clearFieldError('email'));
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('input', () => clearFieldError('password'));
  }
  
  // Inicializar usuarios demo si no existen
  const users = localStorage.getItem('fantasyUsers');
  if (!users) {
    saveUsers(DEMO_USERS);
  }
});