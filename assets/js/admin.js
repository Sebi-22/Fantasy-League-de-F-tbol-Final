// ============================================
// SISTEMA DE ADMINISTRACIÓN
// ============================================

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  verificarAccesoAdmin();
  cargarDatos();
  configurarInfoSistema();
});

// ============================================
// VERIFICAR ACCESO (Opcional - para producción)
// ============================================
function verificarAccesoAdmin() {
  // Por ahora permitimos acceso a todos
  // En producción, aquí verificarías si el usuario es admin
  console.log('✅ Acceso permitido al panel de administración');
}

// ============================================
// CARGAR TODOS LOS DATOS
// ============================================
function cargarDatos() {
  cargarEstadisticas();
  cargarUsuarios();
  actualizarHoraActualizacion();
}

// ============================================
// CARGAR ESTADÍSTICAS DEL SISTEMA
// ============================================
function cargarEstadisticas() {
  try {
    // Obtener usuarios registrados
    const usuariosJSON = localStorage.getItem('fantasyUsers');
    const usuarios = usuariosJSON ? JSON.parse(usuariosJSON) : [];
    
    // Contar equipos creados (usuarios que tienen historial de jornadas)
    let equiposCreados = 0;
    let totalJornadas = 0;
    
    for (let i = 0; i < usuarios.length; i++) {
      const historialKey = `jornadas_historial_${usuarios[i].email}`;
      const historialJSON = localStorage.getItem(historialKey);
      
      if (historialJSON) {
        const historial = JSON.parse(historialJSON);
        if (historial.length > 0) {
          equiposCreados++;
          totalJornadas += historial.length;
        }
      }
    }
    
    // Calcular espacio usado en localStorage
    const espacioUsado = calcularEspacioLocalStorage();
    
    // Actualizar UI
    document.getElementById('totalUsuarios').textContent = usuarios.length;
    document.getElementById('totalEquipos').textContent = equiposCreados;
    document.getElementById('totalJornadas').textContent = totalJornadas;
    document.getElementById('espacioUsado').textContent = espacioUsado;
    
    console.log('📊 Estadísticas cargadas:', {
      usuarios: usuarios.length,
      equipos: equiposCreados,
      jornadas: totalJornadas,
      espacio: espacioUsado + ' KB'
    });
    
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
    mostrarAlerta('Error al cargar estadísticas del sistema', 'danger');
  }
}

// ============================================
// CALCULAR ESPACIO USADO EN LOCALSTORAGE
// ============================================
function calcularEspacioLocalStorage() {
  let totalBytes = 0;
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const item = localStorage.getItem(key);
      if (item) {
        // Calcular tamaño en bytes (key + value)
        totalBytes += key.length + item.length;
      }
    }
  }
  
  // Convertir a KB
  const totalKB = (totalBytes / 1024).toFixed(2);
  return totalKB;
}

// ============================================
// CARGAR LISTA DE USUARIOS
// ============================================
function cargarUsuarios() {
  try {
    const usuariosJSON = localStorage.getItem('fantasyUsers');
    const usuarios = usuariosJSON ? JSON.parse(usuariosJSON) : [];
    
    const tbody = document.getElementById('tablaUsuarios');
    
    if (usuarios.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-white-50">
            No hay usuarios registrados en el sistema
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = '';
    
    for (let i = 0; i < usuarios.length; i++) {
      const usuario = usuarios[i];
      
      // Obtener datos del usuario
      const historialKey = `jornadas_historial_${usuario.email}`;
      const historialJSON = localStorage.getItem(historialKey);
      const historial = historialJSON ? JSON.parse(historialJSON) : [];
      
      const equipoKey = `equipo_${usuario.email}`;
      const equipoJSON = localStorage.getItem(equipoKey);
      const tieneEquipo = equipoJSON ? '✅' : '❌';
      
      const numJornadas = historial.length;
      
      // Crear fila
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>
          <span class="badge bg-secondary">#${i + 1}</span>
        </td>
        <td class="fw-semibold">${usuario.name || 'Sin nombre'}</td>
        <td>
          <small class="text-white-50">${usuario.email}</small>
        </td>
        <td class="text-center">
          <span class="fs-5">${tieneEquipo}</span>
        </td>
        <td class="text-center">
          <span class="badge bg-info">${numJornadas}</span>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-info" onclick="verDetalleUsuario('${usuario.email}')" type="button" title="Ver detalles">
            👁️
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario('${usuario.email}')" type="button" title="Eliminar usuario">
            🗑️
          </button>
        </td>
      `;
      
      tbody.appendChild(fila);
    }
    
    console.log('👥 Usuarios cargados:', usuarios.length);
    
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    const tbody = document.getElementById('tablaUsuarios');
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4 text-danger">
          Error al cargar usuarios
        </td>
      </tr>
    `;
  }
}

// ============================================
// VER DETALLE DE USUARIO
// ============================================
function verDetalleUsuario(email) {
  try {
    const usuariosJSON = localStorage.getItem('fantasyUsers');
    const usuarios = JSON.parse(usuariosJSON);
    
    let usuario = null;
    for (let i = 0; i < usuarios.length; i++) {
      if (usuarios[i].email === email) {
        usuario = usuarios[i];
        break;
      }
    }
    
    if (!usuario) {
      mostrarAlerta('Usuario no encontrado', 'danger');
      return;
    }
    
    // Obtener historial
    const historialKey = `jornadas_historial_${email}`;
    const historialJSON = localStorage.getItem(historialKey);
    const historial = historialJSON ? JSON.parse(historialJSON) : [];
    
    // Calcular puntos totales
    let puntosTotal = 0;
    for (let i = 0; i < historial.length; i++) {
      puntosTotal += historial[i].puntosTotal || 0;
    }
    
    const promedio = historial.length > 0 ? (puntosTotal / historial.length).toFixed(2) : 0;
    
    // Mostrar información
    const mensaje = `
📋 INFORMACIÓN DEL USUARIO

👤 Nombre: ${usuario.name || 'Sin nombre'}
📧 Email: ${usuario.email}
📅 Registrado: ${usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString() : 'Desconocido'}

📊 ESTADÍSTICAS:
⚽ Jornadas jugadas: ${historial.length}
🏆 Puntos totales: ${puntosTotal.toFixed(1)}
📈 Promedio por jornada: ${promedio}

💾 DATOS EN LOCALSTORAGE:
- jornadas_historial_${email}
- equipo_${email} ${localStorage.getItem(`equipo_${email}`) ? '✅' : '❌'}
    `.trim();
    
    alert(mensaje);
    
  } catch (error) {
    console.error('Error al ver detalle:', error);
    mostrarAlerta('Error al obtener detalles del usuario', 'danger');
  }
}

// ============================================
// ELIMINAR USUARIO
// ============================================
function eliminarUsuario(email) {
  const confirmar = confirm(
    `⚠️ ¿Estás seguro de eliminar al usuario?\n\n` +
    `Email: ${email}\n\n` +
    `Se eliminarán:\n` +
    `- Su cuenta de usuario\n` +
    `- Su equipo\n` +
    `- Su historial de jornadas\n\n` +
    `Esta acción NO se puede deshacer.`
  );
  
  if (!confirmar) return;
  
  try {
    // Eliminar usuario de la lista
    const usuariosJSON = localStorage.getItem('fantasyUsers');
    const usuarios = JSON.parse(usuariosJSON);
    
    const nuevosUsuarios = [];
    for (let i = 0; i < usuarios.length; i++) {
      if (usuarios[i].email !== email) {
        nuevosUsuarios.push(usuarios[i]);
      }
    }
    
    localStorage.setItem('fantasyUsers', JSON.stringify(nuevosUsuarios));
    
    // Eliminar datos relacionados
    localStorage.removeItem(`jornadas_historial_${email}`);
    localStorage.removeItem(`equipo_${email}`);
    localStorage.removeItem(`jugadores_seleccionados_${email}`);
    
    // Si es el usuario actual, cerrar sesión
    const usuarioActual = localStorage.getItem('loggedUser');
    if (usuarioActual === email) {
      localStorage.removeItem('loggedUser');
      localStorage.removeItem('fantasySession');
      sessionStorage.removeItem('fantasySession');
    }
    
    mostrarAlerta('✅ Usuario eliminado correctamente', 'success');
    cargarDatos();
    
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    mostrarAlerta('Error al eliminar usuario', 'danger');
  }
}

// ============================================
// EXPORTAR DATOS
// ============================================
function exportarDatos() {
  try {
    const backup = {};
    
    // Copiar todo el localStorage
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        backup[key] = localStorage.getItem(key);
      }
    }
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Crear enlace de descarga
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    const fecha = new Date().toISOString().split('T')[0];
    link.download = `fantasy-league-backup-${fecha}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    mostrarAlerta('✅ Backup exportado correctamente', 'success');
    console.log('💾 Backup creado:', Object.keys(backup).length, 'claves');
    
  } catch (error) {
    console.error('Error al exportar:', error);
    mostrarAlerta('Error al crear el backup', 'danger');
  }
}

// ============================================
// IMPORTAR DATOS
// ============================================
function importarDatos() {
  const fileInput = document.getElementById('fileImport');
  const file = fileInput.files[0];
  
  if (!file) {
    mostrarAlerta('Por favor selecciona un archivo', 'warning');
    return;
  }
  
  const confirmar = confirm(
    '⚠️ ADVERTENCIA\n\n' +
    'Importar un backup REEMPLAZARÁ todos los datos actuales.\n\n' +
    '¿Deseas continuar?'
  );
  
  if (!confirmar) return;
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const backup = JSON.parse(e.target.result);
      
      // Limpiar localStorage actual
      localStorage.clear();
      
      // Restaurar datos
      for (let key in backup) {
        localStorage.setItem(key, backup[key]);
      }
      
      mostrarAlerta('✅ Backup restaurado correctamente. Recargando página...', 'success');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error al importar:', error);
      mostrarAlerta('Error: El archivo no es válido', 'danger');
    }
  };
  
  reader.readAsText(file);
}

// ============================================
// LIMPIAR CACHÉ
// ============================================
function limpiarCache() {
  const confirmar = confirm(
    '🧹 ¿Limpiar caché del sistema?\n\n' +
    'Esto eliminará datos temporales pero mantendrá:\n' +
    '- Usuarios registrados\n' +
    '- Equipos creados\n' +
    '- Historial de jornadas\n\n' +
    '¿Continuar?'
  );
  
  if (!confirmar) return;
  
  try {
    // Aquí podrías eliminar claves específicas de caché
    // Por ahora solo mostramos un mensaje
    
    mostrarAlerta('✅ Caché limpiado (función de ejemplo)', 'success');
    console.log('🧹 Caché limpiado');
    
  } catch (error) {
    console.error('Error al limpiar caché:', error);
    mostrarAlerta('Error al limpiar caché', 'danger');
  }
}

// ============================================
// RESETEAR SISTEMA COMPLETO
// ============================================
function resetearSistema() {
  const confirmar1 = confirm(
    '🔥 RESETEAR TODO EL SISTEMA\n\n' +
    '⚠️ ESTA ACCIÓN ES IRREVERSIBLE ⚠️\n\n' +
    'Se eliminarán:\n' +
    '- TODOS los usuarios\n' +
    '- TODOS los equipos\n' +
    '- TODAS las jornadas\n' +
    '- TODA la configuración\n\n' +
    '¿Estás COMPLETAMENTE seguro?'
  );
  
  if (!confirmar1) return;
  
  const confirmar2 = confirm(
    '⚠️ ÚLTIMA ADVERTENCIA ⚠️\n\n' +
    'Esto eliminará TODO sin posibilidad de recuperación.\n\n' +
    'Escribe OK en la siguiente ventana para confirmar.'
  );
  
  if (!confirmar2) return;
  
  const verificacion = prompt('Escribe "RESETEAR" para confirmar (en mayúsculas):');
  
  if (verificacion !== 'RESETEAR') {
    mostrarAlerta('Operación cancelada', 'info');
    return;
  }
  
  try {
    // Limpiar completamente localStorage
    localStorage.clear();
    
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    mostrarAlerta('🔥 Sistema reseteado. Redirigiendo...', 'success');
    
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 2000);
    
  } catch (error) {
    console.error('Error al resetear:', error);
    mostrarAlerta('Error al resetear el sistema', 'danger');
  }
}

// ============================================
// CONFIGURAR INFORMACIÓN DEL SISTEMA
// ============================================
function configurarInfoSistema() {
  // Información del navegador
  const browser = navigator.userAgent;
  document.getElementById('infoBrowser').textContent = 
    browser.includes('Chrome') ? 'Google Chrome' :
    browser.includes('Firefox') ? 'Mozilla Firefox' :
    browser.includes('Safari') ? 'Safari' :
    browser.includes('Edge') ? 'Microsoft Edge' :
    'Otro navegador';
  
  // Información de localStorage
  const espacioTotal = calcularEspacioLocalStorage();
  document.getElementById('infoStorage').textContent = 
    `Sí (${espacioTotal} KB usados de ~5-10 MB disponibles)`;
}

// ============================================
// ACTUALIZAR HORA DE ACTUALIZACIÓN
// ============================================
function actualizarHoraActualizacion() {
  const ahora = new Date();
  const horaFormateada = ahora.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const fechaFormateada = ahora.toLocaleDateString('es-ES');
  
  document.getElementById('infoUpdate').textContent = 
    `${fechaFormateada} a las ${horaFormateada}`;
}

// ============================================
// MOSTRAR ALERTA
// ============================================
function mostrarAlerta(mensaje, tipo = 'info') {
  // Crear alerta
  const alertaHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3" 
         role="alert" style="z-index: 9999; min-width: 300px;">
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  
  const temp = document.createElement('div');
  temp.innerHTML = alertaHTML;
  document.body.appendChild(temp.firstElementChild);
  
  // Auto-eliminar después de 5 segundos
  setTimeout(() => {
    const alertas = document.querySelectorAll('.alert');
    if (alertas.length > 0) {
      alertas[0].remove();
    }
  }, 5000);
}

console.log('🔧 Sistema de administración cargado');