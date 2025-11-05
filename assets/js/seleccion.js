// ============================================
// VARIABLES GLOBALES
// ============================================
let todosLosJugadores = [];
let jugadoresFiltrados = [];
let miEquipo = {
  jugadores: [],
  presupuestoInicial: 100,
  presupuestoDisponible: 100,
  formacion: '4-4-2'
};

// Límites por posición (totales incluyendo suplentes)
const LIMITES = {
  arquero: 2,      // 1 titular + 1 suplente
  defensa: 6,      // 4 titulares + 2 suplentes
  mediocampista: 6, // 4 titulares + 2 suplentes
  delantero: 4     // 2 titulares + 2 suplentes
};

const TOTAL_JUGADORES = 18; // 11 titulares + 7 suplentes

// Formaciones disponibles
const FORMACIONES = {
  '4-4-2': { def: 4, med: 4, del: 2 },
  '4-3-3': { def: 4, med: 3, del: 3 },
  '3-5-2': { def: 3, med: 5, del: 2 },
  '3-4-3': { def: 3, med: 4, del: 3 },
  '5-3-2': { def: 5, med: 3, del: 2 },
  '5-4-1': { def: 5, med: 4, del: 1 }
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  verificarSesion();
  await cargarJugadores();
  inicializarEventos();
  cargarEquipoGuardado();
  actualizarInterfaz();
});

// ============================================
// VERIFICAR SESIÓN
// ============================================
function verificarSesion() {
  const usuarioLogueado = localStorage.getItem('loggedUser');
  
  if (!usuarioLogueado) {
    alert('⚠️ Debes iniciar sesión para acceder');
    window.location.href = 'login.html';
    return;
  }
}

// ============================================
// CARGAR JUGADORES DESDE JSON
// ============================================
async function cargarJugadores() {
  const loadingElement = document.getElementById('loadingJugadores');
  const tablaContainer = document.getElementById('tablaContainer');
  
  try {
    // Mostrar loading
    loadingElement.classList.remove('d-none');
    tablaContainer.classList.add('d-none');
    
    // Fetch al JSON - RUTA CORREGIDA
    const response = await fetch('../assets/data/base-de-datos-jugadores.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Verificar que venga el array de jugadores
    if (!data.jugadores || !Array.isArray(data.jugadores)) {
      throw new Error('El formato del JSON no es correcto');
    }
    
    todosLosJugadores = data.jugadores;
    jugadoresFiltrados = [...todosLosJugadores];
    
    console.log(`✅ ${todosLosJugadores.length} jugadores cargados`);
    
    // Llenar select de equipos
    llenarSelectEquipos();
    
    // Mostrar jugadores
    mostrarJugadores(jugadoresFiltrados);
    
    // Ocultar loading
    loadingElement.classList.add('d-none');
    tablaContainer.classList.remove('d-none');
    
    mostrarToast('✅ Jugadores cargados correctamente', 'success');
    
  } catch (error) {
    console.error('❌ Error al cargar jugadores:', error);
    loadingElement.innerHTML = `
      <div class="alert alert-danger m-3">
        <strong>Error al cargar jugadores</strong>
        <br><small>${error.message}</small>
        <br><small class="text-muted">Ruta: ../assets/data/base-de-datos-jugadores.json</small>
        <br><button class="btn btn-sm btn-outline-light mt-2" onclick="location.reload()">🔄 Reintentar</button>
      </div>
    `;
    mostrarToast('❌ Error al cargar jugadores', 'danger');
  }
}

// ============================================
// LLENAR SELECT DE EQUIPOS
// ============================================
function llenarSelectEquipos() {
  const selectEquipo = document.getElementById('filtroEquipo');
  const equipos = [...new Set(todosLosJugadores.map(j => j.equipo))].sort();
  
  equipos.forEach(equipo => {
    const option = document.createElement('option');
    option.value = equipo;
    option.textContent = equipo;
    selectEquipo.appendChild(option);
  });
  
  console.log(`✅ ${equipos.length} equipos cargados`);
}

// ============================================
// MOSTRAR JUGADORES EN TABLA
// ============================================
function mostrarJugadores(jugadores) {
  const tbody = document.getElementById('tablaJugadores');
  const totalJugadoresSpan = document.getElementById('totalJugadores');
  const sinResultados = document.getElementById('sinResultados');
  const tablaContainer = document.getElementById('tablaContainer');
  
  tbody.innerHTML = '';
  
  if (jugadores.length === 0) {
    tablaContainer.classList.add('d-none');
    sinResultados.classList.remove('d-none');
    totalJugadoresSpan.textContent = '0 jugadores';
    return;
  }
  
  tablaContainer.classList.remove('d-none');
  sinResultados.classList.add('d-none');
  totalJugadoresSpan.textContent = `${jugadores.length} jugador${jugadores.length !== 1 ? 'es' : ''}`;
  
  jugadores.forEach(jugador => {
    const estaSeleccionado = miEquipo.jugadores.some(j => j.id === jugador.id);
    
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>
        <div class="d-flex align-items-center">
          <div class="me-2" style="font-size: 1.5rem;">${obtenerEmojiPosicion(jugador.posicion)}</div>
          <div>
            <div class="fw-semibold">${jugador.nombre}</div>
            <small class="text-muted">${jugador.nacionalidad || 'N/A'}</small>
          </div>
        </div>
      </td>
      <td>
        <span class="position-badge-small ${jugador.posicion}">
          ${jugador.posicion.substring(0, 3).toUpperCase()}
        </span>
      </td>
      <td>${jugador.equipo}</td>
      <td class="fw-bold text-warning">$${jugador.precio}M</td>
      <td>
        <span class="badge bg-info">${jugador.puntosPromedio || 0}</span>
      </td>
      <td>
        ${estaSeleccionado 
          ? '<span class="badge bg-secondary">Seleccionado ✓</span>'
          : `<button class="btn btn-success btn-sm btn-add-player" onclick="agregarJugador(${jugador.id})">
              ➕ Agregar
            </button>`
        }
      </td>
    `;
    
    tbody.appendChild(fila);
  });
}

// ============================================
// AGREGAR JUGADOR AL EQUIPO
// ============================================
function agregarJugador(idJugador) {
  const jugador = todosLosJugadores.find(j => j.id === idJugador);
  
  if (!jugador) {
    mostrarToast('❌ Jugador no encontrado', 'danger');
    return;
  }
  
  // Verificar si ya está en el equipo
  if (miEquipo.jugadores.some(j => j.id === jugador.id)) {
    mostrarToast('⚠️ El jugador ya está en tu equipo', 'warning');
    return;
  }
  
  // Verificar presupuesto
  if (miEquipo.presupuestoDisponible < jugador.precio) {
    mostrarToast('❌ Presupuesto insuficiente', 'danger');
    return;
  }
  
  // Verificar total de jugadores
  if (miEquipo.jugadores.length >= TOTAL_JUGADORES) {
    mostrarToast(`❌ Ya tenés ${TOTAL_JUGADORES} jugadores (máximo)`, 'danger');
    return;
  }
  
  // Verificar límite por posición
  const cantidadPosicion = miEquipo.jugadores.filter(j => j.posicion === jugador.posicion).length;
  if (cantidadPosicion >= LIMITES[jugador.posicion]) {
    const limite = LIMITES[jugador.posicion];
    mostrarToast(`❌ Límite de ${limite} ${jugador.posicion}s alcanzado`, 'danger');
    return;
  }
  
  // Agregar jugador
  miEquipo.jugadores.push(jugador);
  miEquipo.presupuestoDisponible -= jugador.precio;
  
  actualizarInterfaz();
  mostrarJugadores(jugadoresFiltrados);
  mostrarToast(`✅ ${jugador.nombre} agregado al equipo`, 'success');
  
  console.log('Jugador agregado:', jugador.nombre);
}

// ============================================
// ELIMINAR JUGADOR DEL EQUIPO
// ============================================
function eliminarJugador(idJugador) {
  const jugador = miEquipo.jugadores.find(j => j.id === idJugador);
  
  if (!jugador) return;
  
  miEquipo.jugadores = miEquipo.jugadores.filter(j => j.id !== idJugador);
  miEquipo.presupuestoDisponible += jugador.precio;
  
  actualizarInterfaz();
  mostrarJugadores(jugadoresFiltrados);
  mostrarToast(`🗑️ ${jugador.nombre} eliminado del equipo`, 'warning');
  
  console.log('Jugador eliminado:', jugador.nombre);
}

// ============================================
// ACTUALIZAR INTERFAZ
// ============================================
function actualizarInterfaz() {
  // Actualizar presupuesto
  const presupuestoDisp = document.getElementById('presupuestoDisponible');
  const presupuestoGast = document.getElementById('presupuestoGastado');
  const presupuestoBar = document.getElementById('presupuestoBar');
  
  const gastado = miEquipo.presupuestoInicial - miEquipo.presupuestoDisponible;
  const porcentaje = (miEquipo.presupuestoDisponible / miEquipo.presupuestoInicial) * 100;
  
  presupuestoDisp.textContent = miEquipo.presupuestoDisponible.toFixed(1);
  presupuestoGast.textContent = gastado.toFixed(1);
  presupuestoBar.style.width = `${porcentaje}%`;
  
  // Cambiar color de la barra según presupuesto
  if (porcentaje < 20) {
    presupuestoBar.classList.remove('bg-warning');
    presupuestoBar.classList.add('bg-danger');
  } else {
    presupuestoBar.classList.remove('bg-danger');
    presupuestoBar.classList.add('bg-warning');
  }
  
  // Actualizar contador de jugadores
  const cantidadJugadores = document.getElementById('cantidadJugadores');
  const jugadoresBar = document.getElementById('jugadoresBar');
  
  cantidadJugadores.textContent = miEquipo.jugadores.length;
  const porcentajeJugadores = (miEquipo.jugadores.length / TOTAL_JUGADORES) * 100;
  jugadoresBar.style.width = `${porcentajeJugadores}%`;
  
  // Actualizar contadores por posición
  const contadores = {
    arquero: 0,
    defensa: 0,
    mediocampista: 0,
    delantero: 0
  };
  
  miEquipo.jugadores.forEach(j => {
    contadores[j.posicion]++;
  });
  
  document.getElementById('conteoArqueros').textContent = contadores.arquero;
  document.getElementById('conteoDefensas').textContent = contadores.defensa;
  document.getElementById('conteoMediocampistas').textContent = contadores.mediocampista;
  document.getElementById('conteoDelanteros').textContent = contadores.delantero;
  
  // Cambiar color de badges según cumplimiento
  actualizarColorBadges(contadores);
  
  // Actualizar lista de jugadores seleccionados
  actualizarListaJugadores();
  
  // Habilitar/deshabilitar botón guardar
  const btnGuardar = document.getElementById('btnGuardarEquipo');
  const equipoCompleto = verificarEquipoCompleto();
  
  btnGuardar.disabled = !equipoCompleto;
  
  if (equipoCompleto) {
    btnGuardar.innerHTML = '✅ Guardar Equipo Completo';
    btnGuardar.classList.add('pulse');
  } else {
    btnGuardar.innerHTML = `💾 Guardar Equipo (${miEquipo.jugadores.length}/${TOTAL_JUGADORES})`;
    btnGuardar.classList.remove('pulse');
  }
}

// ============================================
// ACTUALIZAR COLOR DE BADGES
// ============================================
function actualizarColorBadges(contadores) {
  const badges = {
    arquero: document.getElementById('conteoArqueros').parentElement,
    defensa: document.getElementById('conteoDefensas').parentElement,
    mediocampista: document.getElementById('conteoMediocampistas').parentElement,
    delantero: document.getElementById('conteoDelanteros').parentElement
  };
  
  Object.keys(contadores).forEach(posicion => {
    const badge = badges[posicion];
    const cuenta = contadores[posicion];
    const limite = LIMITES[posicion];
    
    if (cuenta === limite) {
      badge.style.borderColor = 'rgba(40, 167, 69, 0.5)';
      badge.style.background = 'rgba(40, 167, 69, 0.1)';
    } else if (cuenta > limite) {
      badge.style.borderColor = 'rgba(220, 53, 69, 0.5)';
      badge.style.background = 'rgba(220, 53, 69, 0.1)';
    } else {
      badge.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      badge.style.background = 'rgba(255, 255, 255, 0.05)';
    }
  });
}

// ============================================
// ACTUALIZAR LISTA DE JUGADORES
// ============================================
function actualizarListaJugadores() {
  const lista = document.getElementById('listaJugadoresSeleccionados');
  
  if (miEquipo.jugadores.length === 0) {
    lista.innerHTML = '<p class="text-white-50 text-center small py-3 mb-0">Sin jugadores aún</p>';
    return;
  }
  
  // Agrupar por posición
  const porPosicion = {
    arquero: [],
    defensa: [],
    mediocampista: [],
    delantero: []
  };
  
  miEquipo.jugadores.forEach(j => {
    porPosicion[j.posicion].push(j);
  });
  
  let html = '';
  
  // Mostrar por posición
  Object.keys(porPosicion).forEach(posicion => {
    if (porPosicion[posicion].length > 0) {
      porPosicion[posicion].forEach(jugador => {
        html += `
          <div class="player-item">
            <div class="player-info">
              <div class="player-name">${obtenerEmojiPosicion(jugador.posicion)} ${jugador.nombre}</div>
              <div class="player-details">
                <span>${jugador.equipo}</span>
                <span>•</span>
                <span>${jugador.posicion}</span>
              </div>
            </div>
            <div class="d-flex align-items-center">
              <span class="player-price">$${jugador.precio}M</span>
              <button class="btn btn-danger btn-sm btn-remove-player" onclick="eliminarJugador(${jugador.id})">
                ✕
              </button>
            </div>
          </div>
        `;
      });
    }
  });
  
  lista.innerHTML = html;
}

// ============================================
// VERIFICAR EQUIPO COMPLETO
// ============================================
function verificarEquipoCompleto() {
  if (miEquipo.jugadores.length !== TOTAL_JUGADORES) {
    return false;
  }
  
  const contadores = {
    arquero: 0,
    defensa: 0,
    mediocampista: 0,
    delantero: 0
  };
  
  miEquipo.jugadores.forEach(j => {
    contadores[j.posicion]++;
  });
  
  return contadores.arquero === LIMITES.arquero &&
         contadores.defensa === LIMITES.defensa &&
         contadores.mediocampista === LIMITES.mediocampista &&
         contadores.delantero === LIMITES.delantero;
}

// ============================================
// FILTROS Y BÚSQUEDA
// ============================================
function aplicarFiltros() {
  const busqueda = document.getElementById('buscarJugador').value.toLowerCase();
  const posicion = document.getElementById('filtroPosicion').value;
  const equipo = document.getElementById('filtroEquipo').value;
  const ordenar = document.getElementById('ordenar').value;
  
  // Filtrar
  jugadoresFiltrados = todosLosJugadores.filter(jugador => {
    const cumpleBusqueda = jugador.nombre.toLowerCase().includes(busqueda);
    const cumplePosicion = !posicion || jugador.posicion === posicion;
    const cumpleEquipo = !equipo || jugador.equipo === equipo;
    
    return cumpleBusqueda && cumplePosicion && cumpleEquipo;
  });
  
  // Ordenar
  switch(ordenar) {
    case 'nombre':
      jugadoresFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
    case 'precio-asc':
      jugadoresFiltrados.sort((a, b) => a.precio - b.precio);
      break;
    case 'precio-desc':
      jugadoresFiltrados.sort((a, b) => b.precio - a.precio);
      break;
    case 'puntos':
      jugadoresFiltrados.sort((a, b) => (b.puntosPromedio || 0) - (a.puntosPromedio || 0));
      break;
  }
  
  mostrarJugadores(jugadoresFiltrados);
  console.log(`Filtros aplicados: ${jugadoresFiltrados.length} resultados`);
}

// ============================================
// GUARDAR EQUIPO
// ============================================
function guardarEquipo() {
  if (!verificarEquipoCompleto()) {
    mostrarToast('⚠️ Debes completar las 18 posiciones', 'warning');
    return;
  }
  
  const equipoGuardar = {
    ...miEquipo,
    fecha: new Date().toISOString(),
    usuario: localStorage.getItem('loggedUser')
  };
  
  localStorage.setItem('miEquipoFantasy', JSON.stringify(equipoGuardar));
  
  console.log('✅ Equipo guardado:', equipoGuardar);
  mostrarToast('✅ Equipo guardado correctamente', 'success');
  
  setTimeout(() => {
    window.location.href = 'equipo.html';
  }, 1500);
}

// ============================================
// LIMPIAR EQUIPO
// ============================================
function limpiarEquipo() {
  if (miEquipo.jugadores.length === 0) {
    mostrarToast('⚠️ No hay jugadores para eliminar', 'warning');
    return;
  }
  
  if (confirm('¿Estás seguro de que querés limpiar todo el equipo?')) {
    miEquipo.jugadores = [];
    miEquipo.presupuestoDisponible = miEquipo.presupuestoInicial;
    
    actualizarInterfaz();
    mostrarJugadores(jugadoresFiltrados);
    mostrarToast('🗑️ Equipo limpiado', 'warning');
    
    console.log('Equipo limpiado');
  }
}

// ============================================
// CARGAR EQUIPO GUARDADO
// ============================================
function cargarEquipoGuardado() {
  const equipoGuardado = localStorage.getItem('miEquipoFantasy');
  
  if (equipoGuardado) {
    try {
      const equipoParseado = JSON.parse(equipoGuardado);
      
      if (confirm('¿Querés continuar con tu equipo guardado?')) {
        miEquipo = equipoParseado;
        actualizarInterfaz();
        mostrarToast('✅ Equipo cargado', 'success');
        console.log('Equipo cargado:', miEquipo);
      }
    } catch (error) {
      console.error('Error al cargar equipo:', error);
      localStorage.removeItem('miEquipoFantasy');
    }
  }
}

// ============================================
// CAMBIAR FORMACIÓN
// ============================================
function cambiarFormacion() {
  const formacionSelect = document.getElementById('formacion');
  const formacionInfo = document.getElementById('formacionInfo');
  
  miEquipo.formacion = formacionSelect.value;
  const formacion = FORMACIONES[miEquipo.formacion];
  
  formacionInfo.textContent = `${formacion.def} DEF - ${formacion.med} MED - ${formacion.del} DEL`;
  
  mostrarToast(`⚽ Formación cambiada a ${miEquipo.formacion}`, 'success');
  console.log('Formación cambiada:', miEquipo.formacion);
}

// ============================================
// EVENTOS
// ============================================
function inicializarEventos() {
  // Búsqueda en tiempo real
  document.getElementById('buscarJugador').addEventListener('input', aplicarFiltros);
  
  // Filtros
  document.getElementById('filtroPosicion').addEventListener('change', aplicarFiltros);
  document.getElementById('filtroEquipo').addEventListener('change', aplicarFiltros);
  document.getElementById('ordenar').addEventListener('change', aplicarFiltros);
  
  // Limpiar filtros
  document.getElementById('limpiarFiltros').addEventListener('click', () => {
    document.getElementById('buscarJugador').value = '';
    document.getElementById('filtroPosicion').value = '';
    document.getElementById('filtroEquipo').value = '';
    document.getElementById('ordenar').value = 'nombre';
    aplicarFiltros();
    mostrarToast('🔄 Filtros limpiados', 'success');
  });
  
  // Limpiar búsqueda desde mensaje sin resultados
  document.getElementById('limpiarBusqueda').addEventListener('click', () => {
    document.getElementById('buscarJugador').value = '';
    aplicarFiltros();
  });
  
  // Guardar equipo
  document.getElementById('btnGuardarEquipo').addEventListener('click', guardarEquipo);
  
  // Limpiar equipo
  document.getElementById('btnLimpiar').addEventListener('click', limpiarEquipo);
  
  // Cambiar formación
  document.getElementById('formacion').addEventListener('change', cambiarFormacion);
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('¿Seguro que querés cerrar sesión?')) {
      localStorage.removeItem('loggedUser');
      window.location.href = 'login.html';
    }
  });
  
  console.log('✅ Eventos inicializados');
}

// ============================================
// UTILIDADES
// ============================================
function obtenerEmojiPosicion(posicion) {
  const emojis = {
    arquero: '🧤',
    defensa: '🛡️',
    mediocampista: '⚙️',
    delantero: '⚡'
  };
  return emojis[posicion] || '⚽';
}

function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  const bsToast = new bootstrap.Toast(toast);
  
  // Colores según tipo
  const colores = {
    success: 'bg-success',
    danger: 'bg-danger',
    warning: 'bg-warning'
  };
  
  // Remover clases anteriores
  toast.classList.remove('bg-success', 'bg-danger', 'bg-warning');
  toast.classList.add(colores[tipo] || 'bg-success');
  
  toastMessage.textContent = mensaje;
  bsToast.show();
}

// ============================================
// LOGS DE DEBUG (puedes comentarlos en producción)
// ============================================
console.log('📝 seleccion.js cargado');
console.log('⚙️ Configuración:', {
  limites: LIMITES,
  totalJugadores: TOTAL_JUGADORES,
  formaciones: Object.keys(FORMACIONES)
});