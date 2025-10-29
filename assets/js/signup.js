// Función para obtener usuarios almacenados
function getStoredUsers() {
  const users = localStorage.getItem('fantasyUsers');
  return users ? JSON.parse(users) : [];
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

// Función para validar nombre
function isValidName(name) {
  return name.trim().length >= 3;
}

// Función para validar contraseña
function validatePassword(password) {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength,
    length: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    strength: calculatePasswordStrength(password)
  };
}

// Función para calcular fortaleza de contraseña
function calculatePasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 6) strength += 20;
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/\d/.test(password)) strength += 10;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;
  
  return Math.min(strength, 100);
}

// Función para actualizar indicador de fortaleza
function updatePasswordStrength(password) {
  const strengthBar = document.getElementById('passwordStrength');
  const validation = validatePassword(password);
  const strength = validation.strength;
  
  strengthBar.style.width = `${strength}%`;
  
  // Cambiar color según fortaleza
  if (strength < 40) {
    strengthBar.className = 'progress-bar bg-danger';
  } else if (strength < 70) {
    strengthBar.className = 'progress-bar bg-warning';
  } else {
    strengthBar.className = 'progress-bar bg-success';
  }
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
  const alert = document.getElementById('signupAlert');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alert.classList.remove('d-none');
  
  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    alert.classList.add('d-none');
  }, 5000);
}

// Función para toggle de contraseñas
function setupPasswordToggles() {
  // Toggle para contraseña
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }
  
  // Toggle para confirmar contraseña
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  
  if (toggleConfirmPassword && confirmPasswordInput) {
    toggleConfirmPassword.addEventListener('click', () => {
      const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      confirmPasswordInput.setAttribute('type', type);
      toggleConfirmPassword.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }
}

// Función para manejar el registro
function handleSignup(e) {
  e.preventDefault();
  
  // Limpiar errores previos
  clearFieldError('fullName');
  clearFieldError('email');
  clearFieldError('password');
  clearFieldError('confirmPassword');
  document.getElementById('signupAlert').classList.add('d-none');
  
  // Obtener valores
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const acceptTerms = document.getElementById('acceptTerms').checked;
  
  // Validaciones
  let hasError = false;
  
  // Validar nombre
  if (!fullName) {
    showFieldError('fullName', 'Por favor ingresa tu nombre completo');
    hasError = true;
  } else if (!isValidName(fullName)) {
    showFieldError('fullName', 'El nombre debe tener al menos 3 caracteres');
    hasError = true;
  }
  
  // Validar email
  if (!email) {
    showFieldError('email', 'Por favor ingresa tu correo electrónico');
    hasError = true;
  } else if (!isValidEmail(email)) {
    showFieldError('email', 'Por favor ingresa un correo electrónico válido');
    hasError = true;
  } else {
    // Verificar si el email ya está registrado
    const users = getStoredUsers();
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (emailExists) {
      showFieldError('email', 'Este correo electrónico ya está registrado');
      hasError = true;
    }
  }
  
  // Validar contraseña
  const passwordValidation = validatePassword(password);
  if (!password) {
    showFieldError('password', 'Por favor ingresa una contraseña');
    hasError = true;
  } else if (!passwordValidation.isValid) {
    showFieldError('password', 'La contraseña debe tener al menos 6 caracteres');
    hasError = true;
  }
  
  // Validar confirmación de contraseña
  if (!confirmPassword) {
    showFieldError('confirmPassword', 'Por favor confirma tu contraseña');
    hasError = true;
  } else if (password !== confirmPassword) {
    showFieldError('confirmPassword', 'Las contraseñas no coinciden');
    hasError = true;
  }
  
  // Validar términos
  if (!acceptTerms) {
    showAlert('Debes aceptar los términos y condiciones para continuar');
    hasError = true;
  }
  
  if (hasError) return;
  
  // Mostrar loading
  const signupBtn = document.getElementById('signupBtn');
  const signupBtnText = document.getElementById('signupBtnText');
  const signupBtnSpinner = document.getElementById('signupBtnSpinner');
  
  signupBtn.disabled = true;
  signupBtnText.classList.add('d-none');
  signupBtnSpinner.classList.remove('d-none');
  
  // Simular registro en API
  setTimeout(() => {
    // Crear nuevo usuario
    const newUser = {
      id: Date.now(),
      name: fullName,
      email: email,
      password: password, // En producción, esto debería estar hasheado
      createdAt: new Date().toISOString()
    };
    
    // Guardar usuario
    const users = getStoredUsers();
    users.push(newUser);
    saveUsers(users);
    
    // Mostrar éxito y redirigir al login
    showAlert('¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...', 'success');
    
    setTimeout(() => {
      // Redirigir al login con el email pre-llenado
      window.location.href = `login.html?email=${encodeURIComponent(email)}&registered=true`;
    }, 1500);
    
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
        window.location.href = '../dashboard.html';
      }
    } catch (e) {
      console.error('Error al verificar sesión:', e);
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Verificar sesión existente
  checkExistingSession();
  
  // Setup del formulario
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
  
  // Setup de toggles de contraseña
  setupPasswordToggles();
  
  // Setup de indicador de fortaleza de contraseña
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      updatePasswordStrength(e.target.value);
      clearFieldError('password');
    });
  }
  
  // Limpiar errores al escribir
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  
  if (fullNameInput) {
    fullNameInput.addEventListener('input', () => clearFieldError('fullName'));
  }
  
  if (emailInput) {
    emailInput.addEventListener('input', () => clearFieldError('email'));
  }
  
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', () => clearFieldError('confirmPassword'));
  }
});