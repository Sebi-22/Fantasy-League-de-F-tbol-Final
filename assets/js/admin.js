document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Admin panel iniciado');
  debugLocalStorage();
  cargarDatos();
  mostrarInfoSistema();
});

function debugLocalStorage() {
  console.log('=== DEBUG LOCALSTORAGE ===');
  console.log('Total de items:', localStorage.length);
  
  // Listar todas las claves
  const claves = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    claves.push(key);
  }
  console.log('Claves encontradas:', claves);
  
  // Buscar específicamente usuarios
  const usuariosKey = 'usuariosFantasy';
  const usuarios = localStorage.getItem(usuariosKey);
  console.log('usuariosFantasy:', usuarios);
  
  if (usuarios) {
    try {
      const parsed = JSON.parse(usuarios);
      console.log('Usuarios parseados:', parsed);
      console.log('Cantidad de usuarios:', parsed.length);
    } catch (e) {
      console.error('Error al parsear usuarios:', e);
    }
  } else {
    console.warn('⚠️ No se encontró la clave "usuariosFantasy"');
  }
}

function cargarDatos() {
  console.log('📊 Cargando datos del sistema...');
  cargarEstadisticas();
  cargarUsuarios();
}

function cargarEstadisticas() {
  console.log('📈 Cargando estadísticas...');
  
  const usuariosRaw = localStorage.getItem('usuariosFantasy');
  console.log('Raw usuariosFantasy:', usuariosRaw);
  
  let usuarios = [];
  if (usuariosRaw) {
    try {
      usuarios = JSON.parse(usuariosRaw);
      console.log('✅ Usuarios cargados:', usuarios.length);
    } catch (e) {
      console.error('❌ Error parseando usuarios:', e);
    }
  } else {
    console.warn('⚠️ No hay datos de usuariosFantasy');
  }
  
  document.getElementById('totalUsuarios').textContent = usuarios.length;

  let totalEquipos = 0;
  let totalJornadas = 0;

  usuarios.forEach(user => {
    console.log('Procesando usuario:', user.username || user.email);
    
    // Buscar equipo con diferentes variantes de clave
    const equipoKey1 = `miEquipoFantasy_${user.username}`;
    const equipoKey2 = `miEquipoFantasy_${user.email}`;
    const equipoKey3 = `miEquipoFantasy`;
    
    let tieneEquipo = false;
    if (localStorage.getItem(equipoKey1)) {
      console.log('  ✅ Equipo encontrado en:', equipoKey1);
      tieneEquipo = true;
    } else if (localStorage.getItem(equipoKey2)) {
      console.log('  ✅ Equipo encontrado en:', equipoKey2);
      tieneEquipo = true;
    } else if (localStorage.getItem(equipoKey3)) {
      console.log('  ✅ Equipo encontrado en:', equipoKey3);
      tieneEquipo = true;
    } else {
      console.log('  ❌ No tiene equipo');
    }
    
    if (tieneEquipo) totalEquipos++;

    // Buscar historial de jornadas con diferentes variantes
    const jornadasKey1 = `jornadas_historial_${user.username}`;
    const jornadasKey2 = `jornadas_historial_${user.email}`;
    
    let historial = [];
    const hist1 = localStorage.getItem(jornadasKey1);
    const hist2 = localStorage.getItem(jornadasKey2);
    
    if (hist1) {
      try {
        historial = JSON.parse(hist1);
        console.log('  📅 Jornadas encontradas:', historial.length, 'en', jornadasKey1);
      } catch (e) {
        console.error('  ❌ Error parsing historial:', e);
      }
    } else if (hist2) {
      try {
        historial = JSON.parse(hist2);
        console.log('  📅 Jornadas encontradas:', historial.length, 'en', jornadasKey2);
      } catch (e) {
        console.error('  ❌ Error parsing historial:', e);
      }
    } else {
      console.log('  ❌ No tiene jornadas');
    }
    
    totalJornadas += historial.length;
  });

  console.log('📊 Totales - Usuarios:', usuarios.length, 'Equipos:', totalEquipos, 'Jornadas:', totalJornadas);

  document.getElementById('totalEquipos').textContent = totalEquipos;
  document.getElementById('totalJornadas').textContent = totalJornadas;

  // Calcular espacio usado
  let espacioTotal = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      espacioTotal += localStorage[key].length + key.length;
    }
  }
  const espacioKB = Math.round(espacioTotal / 1024);
  console.log('💾 Espacio usado:', espacioKB, 'KB');
  document.getElementById('espacioUsado').textContent = espacioKB;
}

function cargarUsuarios() {
  const tbody = document.getElementById('tablaUsuarios');
  const usuarios = JSON.parse(localStorage.getItem('usuariosFantasy') || '[]');

  if (usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-white-50">No hay usuarios registrados</td></tr>';
    return;
  }

  let html = '';
  usuarios.forEach(user => {
    // Buscar equipo con diferentes variantes
    const equipoKey1 = `miEquipoFantasy_${user.username}`;
    const equipoKey2 = `miEquipoFantasy_${user.email}`;
    
    let tieneEquipo = '❌';
    let equipoData = null;
    
    if (localStorage.getItem(equipoKey1)) {
      tieneEquipo = '✅';
      try {
        equipoData = JSON.parse(localStorage.getItem(equipoKey1));
      } catch (e) {}
    } else if (localStorage.getItem(equipoKey2)) {
      tieneEquipo = '✅';
      try {
        equipoData = JSON.parse(localStorage.getItem(equipoKey2));
      } catch (e) {}
    }

    // Buscar historial con diferentes variantes
    const jornadasKey1 = `jornadas_historial_${user.username}`;
    const jornadasKey2 = `jornadas_historial_${user.email}`;
    
    let historial = [];
    const hist1 = localStorage.getItem(jornadasKey1);
    const hist2 = localStorage.getItem(jornadasKey2);
    
    if (hist1) {
      try {
        historial = JSON.parse(hist1);
      } catch (e) {}
    } else if (hist2) {
      try {
        historial = JSON.parse(hist2);
      } catch (e) {}
    }

    // Calcular puntos totales
    let puntosTotal = 0;
    historial.forEach(j => {
      puntosTotal += j.puntosTotal || 0;
    });

    html += `
      <tr>
        <td>
          <strong>${user.username || 'N/A'}</strong>
          ${equipoData ? `<br><small class="text-success">👥 ${equipoData.jugadores?.length || 0} jugadores</small>` : ''}
        </td>
        <td>${user.nombre || user.name || 'N/A'}</td>
        <td>${user.email || 'N/A'}</td>
        <td class="text-center">
          ${tieneEquipo}
          ${equipoData ? `<br><small class="text-white-50">$${equipoData.presupuestoDisponible?.toFixed(1) || 0}M restante</small>` : ''}
        </td>
        <td class="text-center">
          <span class="badge bg-info">${historial.length}</span>
          ${historial.length > 0 ? `<br><small class="text-warning">${puntosTotal.toFixed(1)} pts</small>` : ''}
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-info me-1" onclick="verDetallesUsuario('${user.username}')" title="Ver detalles">
            👁️
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario('${user.username}')">
            🗑️
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function verDetallesUsuario(username) {
  const usuarios = JSON.parse(localStorage.getItem('usuariosFantasy') || '[]');
  const user = usuarios.find(u => u.username === username);
  
  if (!user) {
    alert('Usuario no encontrado');
    return;
  }

  // Buscar equipo
  const equipoKey1 = `miEquipoFantasy_${user.username}`;
  const equipoKey2 = `miEquipoFantasy_${user.email}`;
  let equipoData = null;
  
  if (localStorage.getItem(equipoKey1)) {
    equipoData = JSON.parse(localStorage.getItem(equipoKey1));
  } else if (localStorage.getItem(equipoKey2)) {
    equipoData = JSON.parse(localStorage.getItem(equipoKey2));
  }

  // Buscar historial
  const jornadasKey1 = `jornadas_historial_${user.username}`;
  const jornadasKey2 = `jornadas_historial_${user.email}`;
  let historial = [];
  
  if (localStorage.getItem(jornadasKey1)) {
    historial = JSON.parse(localStorage.getItem(jornadasKey1));
  } else if (localStorage.getItem(jornadasKey2)) {
    historial = JSON.parse(localStorage.getItem(jornadasKey2));
  }

  // Calcular estadísticas
  let puntosTotal = 0;
  historial.forEach(j => {
    puntosTotal += j.puntosTotal || 0;
  });
  const promedio = historial.length > 0 ? (puntosTotal / historial.length).toFixed(2) : 0;

  // Mostrar información
  let mensaje = `
📊 DETALLES DEL USUARIO
━━━━━━━━━━━━━━━━━━━━━━

👤 Usuario: ${user.username}
📧 Email: ${user.email || 'N/A'}
👨‍💼 Nombre: ${user.nombre || user.name || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━
⚽ EQUIPO

${equipoData ? `
✅ Tiene equipo creado
👥 Jugadores: ${equipoData.jugadores?.length || 0}/18
💰 Presupuesto: $${equipoData.presupuestoDisponible?.toFixed(1) || 0}M disponible
📐 Formación: ${equipoData.formacion || 'N/A'}
📅 Creado: ${equipoData.fecha ? new Date(equipoData.fecha).toLocaleDateString('es-AR') : 'N/A'}
` : '❌ No tiene equipo creado'}

━━━━━━━━━━━━━━━━━━━━━━
🏆 ESTADÍSTICAS

📊 Jornadas jugadas: ${historial.length}
⭐ Puntos totales: ${puntosTotal.toFixed(1)}
📈 Promedio por jornada: ${promedio}
${historial.length > 0 ? `
🎯 Última jornada: ${new Date(historial[historial.length - 1].fecha).toLocaleDateString('es-AR')}
💯 Puntos última jornada: ${historial[historial.length - 1].puntosTotal.toFixed(1)}
` : ''}
  `;

  alert(mensaje);
}

function eliminarUsuario(username) {
  if (!confirm(`¿Eliminar al usuario "${username}" y todos sus datos?`)) return;

  const usuarios = JSON.parse(localStorage.getItem('usuariosFantasy') || '[]');
  const user = usuarios.find(u => u.username === username);
  
  if (!user) {
    alert('Usuario no encontrado');
    return;
  }

  // Eliminar usuario de la lista
  const nuevosUsuarios = usuarios.filter(u => u.username !== username);
  localStorage.setItem('usuariosFantasy', JSON.stringify(nuevosUsuarios));

  // Eliminar todas las variantes de datos del usuario
  localStorage.removeItem(`miEquipoFantasy_${user.username}`);
  localStorage.removeItem(`miEquipoFantasy_${user.email}`);
  localStorage.removeItem(`jornadas_historial_${user.username}`);
  localStorage.removeItem(`jornadas_historial_${user.email}`);

  alert('✅ Usuario eliminado correctamente');
  cargarDatos();
}

function exportarDatos() {
  const datos = {};
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      datos[key] = localStorage[key];
    }
  }

  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fantasy_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  alert('✅ Backup exportado correctamente');
}

function importarDatos() {
  const file = document.getElementById('fileImport').files[0];
  if (!file) {
    alert('⚠️ Selecciona un archivo primero');
    return;
  }

  if (!confirm('¿Importar datos? Esto reemplazará todos los datos actuales.')) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const datos = JSON.parse(e.target.result);
      localStorage.clear();
      for (let key in datos) {
        localStorage.setItem(key, datos[key]);
      }
      alert('✅ Datos importados correctamente');
      location.reload();
    } catch (error) {
      alert('❌ Error al importar: ' + error.message);
    }
  };
  reader.readAsText(file);
}

function limpiarCache() {
  if (!confirm('¿Limpiar caché del sistema?')) return;
  
  // Limpiar solo datos temporales, no usuarios ni equipos
  let keysAEliminar = [];
  for (let key in localStorage) {
    if (key.startsWith('temp_') || key.startsWith('cache_')) {
      keysAEliminar.push(key);
    }
  }
  
  keysAEliminar.forEach(key => localStorage.removeItem(key));
  
  alert(`✅ Caché limpiado (${keysAEliminar.length} items eliminados)`);
  cargarDatos();
}

function resetearSistema() {
  const confirmacion = prompt('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos.\n\nEscribe "CONFIRMAR" para continuar:');
  
  if (confirmacion !== 'CONFIRMAR') {
    alert('❌ Cancelado');
    return;
  }

  localStorage.clear();
  alert('✅ Sistema reseteado completamente');
  location.reload();
}

function mostrarInfoSistema() {
  document.getElementById('infoBrowser').textContent = navigator.userAgent.split(' ').pop();
  document.getElementById('infoStorage').textContent = typeof(Storage) !== 'undefined' ? '✅ Disponible' : '❌ No disponible';
  document.getElementById('infoUpdate').textContent = new Date().toLocaleString('es-AR');
}