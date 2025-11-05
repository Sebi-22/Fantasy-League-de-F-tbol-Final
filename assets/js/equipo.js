// ============================================
// SISTEMA DE MI EQUIPO CON SIMULACIÓN
// ============================================

let sistemaJornadas;
let miEquipo = null;

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  verificarSesion();
  cargarEquipo();
  inicializarSistema();
  inicializarEventos();
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
// CARGAR EQUIPO GUARDADO
// ============================================
function cargarEquipo() {
  const equipoGuardado = localStorage.getItem('miEquipoFantasy');
  
  if (!equipoGuardado) {
    mostrarMensajeSinEquipo();
    return;
  }

  try {
    miEquipo = JSON.parse(equipoGuardado);
    console.log('✅ Equipo cargado:', miEquipo);
    mostrarEquipo();
  } catch (error) {
    console.error('❌ Error al cargar equipo:', error);
    mostrarMensajeSinEquipo();
  }
}

// ============================================
// INICIALIZAR SISTEMA DE JORNADAS
// ============================================
function inicializarSistema() {
  if (typeof SistemaJornadas !== 'undefined') {
    sistemaJornadas = new SistemaJornadas();
    console.log(`✅ Sistema iniciado - Jornada actual: ${sistemaJornadas.jornadaActual}`);
    actualizarInfoJornada();
    mostrarHistorial();
  } else {
    console.error('❌ SistemaJornadas no está cargado');
  }
}

// ============================================
// MOSTRAR MENSAJE SIN EQUIPO
// ============================================
function mostrarMensajeSinEquipo() {
  const container = document.getElementById('equipoContainer');
  if (container) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning text-center">
          <h4>⚠️ No tenés un equipo armado</h4>
          <p>Primero debes seleccionar tus 18 jugadores</p>
          <a href="seleccion.html" class="btn btn-success mt-3">
            ⚽ Armar mi equipo
          </a>
        </div>
      </div>
    `;
  }
}

// ============================================
// MOSTRAR EQUIPO EN LA INTERFAZ
// ============================================
function mostrarEquipo() {
  const container = document.getElementById('equipoContainer');
  
  if (!container || !miEquipo) return;

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

  let html = '<div class="row g-3">';

  // Mostrar por posición
  Object.keys(porPosicion).forEach(posicion => {
    if (porPosicion[posicion].length > 0) {
      html += `
        <div class="col-12">
          <h5 class="text-${obtenerColorPosicion(posicion)} mb-3">
            ${obtenerEmojiPosicion(posicion)} ${capitalizar(posicion)}s
          </h5>
          <div class="row g-3">
      `;

      porPosicion[posicion].forEach(jugador => {
        const totales = sistemaJornadas ? sistemaJornadas.calcularTotalesJugador(jugador.id) : null;
        
        html += `
          <div class="col-md-6 col-lg-4">
            <div class="card bg-dark border-${obtenerColorPosicion(posicion)} h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="card-title mb-0">${jugador.nombre}</h6>
                  <span class="badge bg-${obtenerColorPosicion(posicion)}">
                    ${jugador.posicion.substring(0, 3).toUpperCase()}
                  </span>
                </div>
                <p class="text-white-50 small mb-2">${jugador.equipo}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-warning fw-bold">$${jugador.precio}M</span>
                  ${totales ? `
                    <span class="badge bg-success">
                      ${totales.puntosTotal} pts (${totales.jornadasJugadas}J)
                    </span>
                  ` : `
                    <span class="badge bg-secondary">
                      ${jugador.puntosPromedio} pts prom.
                    </span>
                  `}
                </div>
              </div>
            </div>
          </div>
        `;
      });

      html += '</div></div>';
    }
  });

  html += '</div>';
  container.innerHTML = html;
}

// ============================================
// SIMULAR JORNADA
// ============================================
function simularJornada() {
  if (!miEquipo || !miEquipo.jugadores || miEquipo.jugadores.length === 0) {
    alert('⚠️ No tenés jugadores en tu equipo');
    return;
  }

  if (!sistemaJornadas) {
    alert('❌ Sistema de jornadas no inicializado');
    return;
  }

  // Confirmar simulación
  const confirmar = confirm(
    `¿Simular Jornada ${sistemaJornadas.jornadaActual}?\n\n` +
    `Se generarán estadísticas para tus ${miEquipo.jugadores.length} jugadores.`
  );

  if (!confirmar) return;

  // Mostrar loading
  mostrarLoading(true);

  // Simular con delay para efecto visual
  setTimeout(() => {
    try {
      const resultado = sistemaJornadas.simularJornada(miEquipo.jugadores);
      
      if (resultado) {
        mostrarResultadosJornada(resultado);
        actualizarInfoJornada();
        mostrarHistorial();
        mostrarEquipo(); // Actualizar cards con nuevos totales
        
        // Toast de éxito
        mostrarToast(
          `✅ Jornada ${resultado.numeroJornada} simulada - ${resultado.puntosTotal} puntos totales`,
          'success'
        );
      }
    } catch (error) {
      console.error('❌ Error al simular jornada:', error);
      alert('Error al simular la jornada');
    } finally {
      mostrarLoading(false);
    }
  }, 800);
}

// ============================================
// MOSTRAR RESULTADOS DE JORNADA
// ============================================
function mostrarResultadosJornada(resultado) {
  const modal = new bootstrap.Modal(document.getElementById('resultadosModal'));
  const modalBody = document.getElementById('resultadosModalBody');
  const modalTitle = document.getElementById('resultadosModalTitle');

  modalTitle.textContent = `Resultados Jornada ${resultado.numeroJornada}`;

  let html = `
    <div class="alert alert-success mb-3">
      <h5 class="mb-2">🎉 Puntos Totales: ${resultado.puntosTotal}</h5>
      <small>Promedio por jugador: ${(resultado.puntosTotal / resultado.resultados.length).toFixed(2)}</small>
    </div>
  `;

  // Ordenar por puntos (mayor a menor)
  const ordenados = [...resultado.resultados].sort((a, b) => b.puntos - a.puntos);

  // Top 3 jugadores
  html += '<h6 class="text-success mb-3">⭐ Top 3 Jugadores</h6>';
  ordenados.slice(0, 3).forEach((r, index) => {
    const medalla = ['🥇', '🥈', '🥉'][index];
    html += `
      <div class="card bg-dark border-success mb-2">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <span>${medalla} ${r.nombre}</span>
            <span class="badge bg-success">${r.puntos} pts</span>
          </div>
          <small class="text-white-50">${formatearEstadisticas(r.estadisticas)}</small>
        </div>
      </div>
    `;
  });

  // Todos los resultados
  html += '<h6 class="text-info mt-4 mb-3">📊 Todos los Resultados</h6>';
  html += '<div class="table-responsive">';
  html += '<table class="table table-dark table-sm table-striped">';
  html += `
    <thead>
      <tr>
        <th>Jugador</th>
        <th>Pos</th>
        <th class="text-end">Puntos</th>
      </tr>
    </thead>
    <tbody>
  `;

  ordenados.forEach(r => {
    html += `
      <tr>
        <td>
          ${obtenerEmojiPosicion(r.posicion)} ${r.nombre}
          <br><small class="text-white-50">${formatearEstadisticas(r.estadisticas)}</small>
        </td>
        <td><span class="badge bg-secondary">${r.posicion.substring(0, 3).toUpperCase()}</span></td>
        <td class="text-end fw-bold">${r.puntos}</td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';

  modalBody.innerHTML = html;
  modal.show();
}

// ============================================
// FORMATEAR ESTADÍSTICAS PARA MOSTRAR
// ============================================
function formatearEstadisticas(stats) {
  const partes = [];
  
  if (stats.goles > 0) partes.push(`⚽ ${stats.goles}G`);
  if (stats.asistencias > 0) partes.push(`🎯 ${stats.asistencias}A`);
  if (stats.atajadas > 0) partes.push(`🧤 ${stats.atajadas} atajadas`);
  if (stats.golesRecibidos !== undefined) partes.push(`🥅 ${stats.golesRecibidos} recibidos`);
  if (stats.tarjetasAmarillas > 0) partes.push(`🟨 ${stats.tarjetasAmarillas}`);
  if (stats.tarjetasRojas > 0) partes.push(`🟥 ${stats.tarjetasRojas}`);
  
  return partes.length > 0 ? partes.join(' • ') : 'Sin estadísticas destacadas';
}

// ============================================
// ACTUALIZAR INFO DE JORNADA
// ============================================
function actualizarInfoJornada() {
  const jornadaActualSpan = document.getElementById('jornadaActual');
  const jornadasJugadasSpan = document.getElementById('jornadasJugadas');
  const puntosAcumuladosSpan = document.getElementById('puntosAcumulados');

  if (jornadaActualSpan) {
    jornadaActualSpan.textContent = sistemaJornadas.jornadaActual;
  }

  const historial = sistemaJornadas.obtenerHistorial();
  
  if (jornadasJugadasSpan) {
    jornadasJugadasSpan.textContent = historial.length;
  }

  if (puntosAcumuladosSpan && miEquipo) {
    const puntosTotal = historial.reduce((total, j) => total + (j.puntosTotal || 0), 0);
    puntosAcumuladosSpan.textContent = puntosTotal.toFixed(1);
  }
}

// ============================================
// MOSTRAR HISTORIAL DE JORNADAS
// ============================================
function mostrarHistorial() {
  const container = document.getElementById('historialContainer');
  
  if (!container) return;

  const historial = sistemaJornadas.obtenerHistorial();

  if (historial.length === 0) {
    container.innerHTML = `
      <p class="text-white-50 text-center py-3">
        Aún no hay jornadas jugadas. ¡Simula tu primera jornada!
      </p>
    `;
    return;
  }

  let html = '<div class="list-group">';

  // Mostrar últimas 10 jornadas (más recientes primero)
  historial.slice(-10).reverse().forEach(jornada => {
    const fecha = new Date(jornada.fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    html += `
      <div class="list-group-item bg-dark border-success mb-2">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-1">Jornada ${jornada.numeroJornada}</h6>
            <small class="text-white-50">${fecha}</small>
          </div>
          <div class="text-end">
            <span class="badge bg-success fs-6">${jornada.puntosTotal} pts</span>
            <br>
            <small class="text-white-50">${jornada.resultados.length} jugadores</small>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

// ============================================
// MOSTRAR/OCULTAR LOADING
// ============================================
function mostrarLoading(mostrar) {
  const btn = document.getElementById('btnSimularJornada');
  const btnText = document.getElementById('btnSimularText');
  const btnSpinner = document.getElementById('btnSimularSpinner');

  if (btn) btn.disabled = mostrar;
  if (btnText) btnText.classList.toggle('d-none', mostrar);
  if (btnSpinner) btnSpinner.classList.toggle('d-none', !mostrar);
}

// ============================================
// RESETEAR HISTORIAL (SOLO PARA TESTING)
// ============================================
function resetearHistorial() {
  if (!confirm('⚠️ ¿Estás seguro de resetear todo el historial?\n\nEsta acción no se puede deshacer.')) {
    return;
  }

  if (sistemaJornadas) {
    sistemaJornadas.resetearHistorial();
    actualizarInfoJornada();
    mostrarHistorial();
    mostrarEquipo();
    alert('✅ Historial reseteado');
  }
}

// ============================================
// EVENTOS
// ============================================
function inicializarEventos() {
  const btnSimular = document.getElementById('btnSimularJornada');
  if (btnSimular) {
    btnSimular.addEventListener('click', simularJornada);
  }

  const btnResetear = document.getElementById('btnResetearHistorial');
  if (btnResetear) {
    btnResetear.addEventListener('click', resetearHistorial);
  }
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

function obtenerColorPosicion(posicion) {
  const colores = {
    arquero: 'warning',
    defensa: 'primary',
    mediocampista: 'info',
    delantero: 'danger'
  };
  return colores[posicion] || 'secondary';
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function mostrarToast(mensaje, tipo = 'success') {
  // Implementar según tu sistema de toasts
  console.log(`[${tipo}] ${mensaje}`);
}