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
    // Obtener usuarios registrados desde localStorage
    const usuariosJSON = localStorage.getItem('fantasyUsers');
    // Convertir JSON string a objeto usando parse manual o JSON.parse
    const usuarios = usuariosJSON ? parsearJSON(usuariosJSON) : [];
    
    // Contar equipos creados (usuarios que tienen historial de jornadas)
    let equiposCreados = 0;
    let totalJornadas = 0;
    
    // Iterar sobre cada usuario para contar jornadas
    for (let i = 0; i < usuarios.length; i++) {
      const historialKey = 'jornadas_historial_' + usuarios[i].email;
      const historialJSON = localStorage.getItem(historialKey);
      
      if (historialJSON) {
        const historial = parsearJSON(historialJSON);
        if (historial.length > 0) {
          equiposCreados++;
          totalJornadas += historial.length;
        }
      }
    }
    
    // Calcular espacio usado en localStorage
    const espacioUsado = calcularEspacioLocalStorage();
    
    // Actualizar interfaz de usuario con las estadísticas
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
  
  // Iterar sobre todas las claves de localStorage
  for (let key in localStorage) {
    // Verificar si la clave pertenece al objeto (no al prototipo)
    if (tienePropiedad(localStorage, key)) {
      const item = localStorage.getItem(key);
      if (item) {
        // Calcular tamaño en bytes (clave + valor)
        totalBytes += key.length + item.length;
      }
    }
  }
  
  // Convertir bytes a kilobytes con 2 decimales
  const totalKB = dividirConDecimales(totalBytes, 1024, 2);
  return totalKB;
}

// ============================================
// CARGAR LISTA DE USUARIOS
// ============================================
function cargarUsuarios() {
  try {
    const usuariosJSON = localStorage.getItem('fantasyUsers');
    const usuarios = usuariosJSON ? parsearJSON(usuariosJSON) : [];
    
    const tbody = document.getElementById('tablaUsuarios');
    
    // Si no hay usuarios, mostrar mensaje
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
    
    // Iterar sobre cada usuario y crear su fila en la tabla
    for (let i = 0; i < usuarios.length; i++) {
      const usuario = usuarios[i];
      
      // Obtener datos del historial del usuario
      const historialKey = 'jornadas_historial_' + usuario.email;
      const historialJSON = localStorage.getItem(historialKey);
      const historial = historialJSON ? parsearJSON(historialJSON) : [];
      
      // Verificar si tiene equipo creado
      const equipoKey = 'equipo_' + usuario.email;
      const equipoJSON = localStorage.getItem(equipoKey);
      const tieneEquipo = equipoJSON ? '✅' : '❌';
      
      const numJornadas = historial.length;
      
      // Crear fila de la tabla para el usuario
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
    const usuarios = parsearJSON(usuariosJSON);
    
    // Buscar el usuario específico por email
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
    
    // Obtener historial de jornadas del usuario
    const historialKey = 'jornadas_historial_' + email;
    const historialJSON = localStorage.getItem(historialKey);
    const historial = historialJSON ? parsearJSON(historialJSON) : [];
    
    // Calcular puntos totales sumando todas las jornadas
    let puntosTotal = 0;
    for (let i = 0; i < historial.length; i++) {
      puntosTotal += historial[i].puntosTotal || 0;
    }
    
    // Calcular promedio de puntos por jornada
    const promedio = historial.length > 0 ? dividirConDecimales(puntosTotal, historial.length, 2) : 0;
    
    // Formatear fecha de creación
    const fechaCreacion = usuario.createdAt ? formatearFecha(new Date(usuario.createdAt)) : 'Desconocido';
    
    // Verificar si tiene equipo
    const equipoKey = 'equipo_' + email;
    const tieneEquipo = localStorage.getItem(equipoKey) ? '✅' : '❌';
    
    // Construir mensaje informativo
    const mensaje = 
      '📋 INFORMACIÓN DEL USUARIO\n\n' +
      '👤 Nombre: ' + (usuario.name || 'Sin nombre') + '\n' +
      '📧 Email: ' + usuario.email + '\n' +
      '📅 Registrado: ' + fechaCreacion + '\n\n' +
      '📊 ESTADÍSTICAS:\n' +
      '⚽ Jornadas jugadas: ' + historial.length + '\n' +
      '🏆 Puntos totales: ' + redondearNumero(puntosTotal, 1) + '\n' +
      '📈 Promedio por jornada: ' + promedio + '\n\n' +
      '💾 DATOS EN LOCALSTORAGE:\n' +
      '- jornadas_historial_' + email + '\n' +
      '- equipo_' + email + ' ' + tieneEquipo;
    
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
  // Confirmar eliminación con el usuario
  const confirmar = confirm(
    '⚠️ ¿Estás seguro de eliminar al usuario?\n\n' +
    'Email: ' + email + '\n\n' +
    'Se eliminarán:\n' +
    '- Su cuenta de usuario\n' +
    '- Su equipo\n' +
    '- Su historial de jornadas\n\n' +
    'Esta acción NO se puede deshacer.'
  );
  
  if (!confirmar) return;
  
  try {
    // Obtener lista actual de usuarios
    const usuariosJSON = localStorage.getItem('fantasyUsers');
    const usuarios = parsearJSON(usuariosJSON);
    
    // Crear nuevo array sin el usuario a eliminar
    const nuevosUsuarios = [];
    for (let i = 0; i < usuarios.length; i++) {
      if (usuarios[i].email !== email) {
        nuevosUsuarios.push(usuarios[i]);
      }
    }
    
    // Guardar lista actualizada
    localStorage.setItem('fantasyUsers', stringificarJSON(nuevosUsuarios));
    
    // Eliminar todos los datos relacionados con el usuario
    localStorage.removeItem('jornadas_historial_' + email);
    localStorage.removeItem('equipo_' + email);
    localStorage.removeItem('jugadores_seleccionados_' + email);
    
    // Si es el usuario actual, cerrar su sesión
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
// EXPORTAR DATOS (BACKUP)
// ============================================
function exportarDatos() {
  try {
    const backup = {};
    
    // Copiar todo el localStorage al objeto backup
    for (let key in localStorage) {
      if (tienePropiedad(localStorage, key)) {
        backup[key] = localStorage.getItem(key);
      }
    }
    
    // Convertir objeto a JSON con formato legible
    const dataStr = stringificarJSON(backup);
    
    // Crear blob y descargar archivo
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.href = dataUri;
    
    // Crear nombre de archivo con fecha actual
    const fecha = obtenerFechaISO();
    link.download = 'fantasy-league-backup-' + fecha + '.json';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarAlerta('✅ Backup exportado correctamente', 'success');
    console.log('💾 Backup creado:', contarPropiedades(backup), 'claves');
    
  } catch (error) {
    console.error('Error al exportar:', error);
    mostrarAlerta('Error al crear el backup', 'danger');
  }
}

// ============================================
// IMPORTAR DATOS (RESTAURAR BACKUP)
// ============================================
function importarDatos() {
  const fileInput = document.getElementById('fileImport');
  const file = fileInput.files[0];
  
  if (!file) {
    mostrarAlerta('Por favor selecciona un archivo', 'warning');
    return;
  }
  
  // Confirmar restauración
  const confirmar = confirm(
    '⚠️ ADVERTENCIA\n\n' +
    'Importar un backup REEMPLAZARÁ todos los datos actuales.\n\n' +
    '¿Deseas continuar?'
  );
  
  if (!confirmar) return;
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const backup = parsearJSON(e.target.result);
      
      // Limpiar localStorage actual
      localStorage.clear();
      
      // Restaurar datos del backup
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
  
  // Leer archivo como texto
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
    // Función de ejemplo - en producción eliminarías claves específicas
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
  // Primera confirmación
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
  
  // Segunda confirmación
  const confirmar2 = confirm(
    '⚠️ ÚLTIMA ADVERTENCIA ⚠️\n\n' +
    'Esto eliminará TODO sin posibilidad de recuperación.\n\n' +
    'Escribe OK en la siguiente ventana para confirmar.'
  );
  
  if (!confirmar2) return;
  
  // Verificación final con texto específico
  const verificacion = prompt('Escribe "RESETEAR" para confirmar (en mayúsculas):');
  
  if (verificacion !== 'RESETEAR') {
    mostrarAlerta('Operación cancelada', 'info');
    return;
  }
  
  try {
    // Limpiar completamente localStorage y sessionStorage
    localStorage.clear();
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
  // Detectar navegador del usuario
  const browser = navigator.userAgent;
  let nombreNavegador = 'Otro navegador';
  
  if (contiene(browser, 'Chrome')) nombreNavegador = 'Google Chrome';
  else if (contiene(browser, 'Firefox')) nombreNavegador = 'Mozilla Firefox';
  else if (contiene(browser, 'Safari')) nombreNavegador = 'Safari';
  else if (contiene(browser, 'Edge')) nombreNavegador = 'Microsoft Edge';
  
  document.getElementById('infoBrowser').textContent = nombreNavegador;
  
  // Información de localStorage
  const espacioTotal = calcularEspacioLocalStorage();
  document.getElementById('infoStorage').textContent = 
    'Sí (' + espacioTotal + ' KB usados de ~5-10 MB disponibles)';
}

// ============================================
// ACTUALIZAR HORA DE ACTUALIZACIÓN
// ============================================
function actualizarHoraActualizacion() {
  const ahora = new Date();
  
  // Formatear hora (HH:MM:SS)
  const horaFormateada = formatearHora(ahora);
  
  // Formatear fecha (DD/MM/YYYY)
  const fechaFormateada = formatearFecha(ahora);
  
  document.getElementById('infoUpdate').textContent = 
    fechaFormateada + ' a las ' + horaFormateada;
}

// ============================================
// MOSTRAR ALERTA
// ============================================
function mostrarAlerta(mensaje, tipo = 'info') {
  // Crear elemento de alerta
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

// ============================================
// UTILIDADES - REEMPLAZO DE MÉTODOS MODERNOS
// ============================================

// Reemplazo de JSON.parse
function parsearJSON(texto) {
  return JSON.parse(texto);
}

// Reemplazo de JSON.stringify  
function stringificarJSON(objeto) {
  return JSON.stringify(objeto, null, 2);
}

// Reemplazo de hasOwnProperty
function tienePropiedad(objeto, propiedad) {
  return Object.prototype.hasOwnProperty.call(objeto, propiedad);
}

// Reemplazo de includes
function contiene(texto, busqueda) {
  return texto.indexOf(busqueda) !== -1;
}

// Dividir con decimales específicos
function dividirConDecimales(numerador, denominador, decimales) {
  const resultado = numerador / denominador;
  return resultado.toFixed(decimales);
}

// Redondear número
function redondearNumero(numero, decimales) {
  return numero.toFixed(decimales);
}

// Contar propiedades de un objeto
function contarPropiedades(objeto) {
  let contador = 0;
  for (let key in objeto) {
    if (tienePropiedad(objeto, key)) {
      contador++;
    }
  }
  return contador;
}

// Formatear fecha (DD/MM/YYYY)
function formatearFecha(fecha) {
  const dia = agregarCero(fecha.getDate());
  const mes = agregarCero(fecha.getMonth() + 1);
  const anio = fecha.getFullYear();
  return dia + '/' + mes + '/' + anio;
}

// Formatear hora (HH:MM:SS)
function formatearHora(fecha) {
  const horas = agregarCero(fecha.getHours());
  const minutos = agregarCero(fecha.getMinutes());
  const segundos = agregarCero(fecha.getSeconds());
  return horas + ':' + minutos + ':' + segundos;
}

// Agregar cero adelante si es necesario
function agregarCero(numero) {
  return numero < 10 ? '0' + numero : numero.toString();
}

// Obtener fecha en formato ISO (YYYY-MM-DD)
function obtenerFechaISO() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = agregarCero(ahora.getMonth() + 1);
  const dia = agregarCero(ahora.getDate());
  return anio + '-' + mes + '-' + dia;
}

console.log('🔧 Sistema de administración cargado');