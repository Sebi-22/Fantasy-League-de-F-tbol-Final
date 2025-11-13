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
  const usuario = localStorage.getItem('loggedUser');
  const equipoKey = 'miEquipoFantasy_' + usuario;
  let equipoGuardado = localStorage.getItem(equipoKey);
  
  // Si no existe con clave de usuario, intentar con clave global
  if (!equipoGuardado) {
    equipoGuardado = localStorage.getItem('miEquipoFantasy');
  }
  
  if (!equipoGuardado) {
    mostrarMensajeSinEquipo();
    return;
  }

  try {
    // Parsear JSON a objeto
    miEquipo = parsearJSON(equipoGuardado);
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
    console.log('✅ Sistema iniciado - Jornada actual: ' + sistemaJornadas.jornadaActual);
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
// MOSTRAR EQUIPO EN LA INTERFAZ (CON FOTOS)
// ============================================
function mostrarEquipo() {
  const container = document.getElementById('equipoContainer');
  
  if (!container || !miEquipo) return;

  // Agrupar jugadores por posición
  const porPosicion = {
    arquero: [],
    defensa: [],
    mediocampista: [],
    delantero: []
  };

  // Clasificar cada jugador según su posición
  for (let i = 0; i < miEquipo.jugadores.length; i++) {
    const jugador = miEquipo.jugadores[i];
    porPosicion[jugador.posicion].push(jugador);
  }

  let html = '<div class="row g-3">';

  // Definir orden de posiciones a mostrar
  const posiciones = ['arquero', 'defensa', 'mediocampista', 'delantero'];

  // Mostrar cada posición con sus jugadores
  for (let p = 0; p < posiciones.length; p++) {
    const posicion = posiciones[p];
    const jugadoresPosicion = porPosicion[posicion];
    
    if (jugadoresPosicion.length > 0) {
      html += '<div class="col-12">';
      html += '<h5 class="text-' + obtenerColorPosicion(posicion) + ' mb-3">';
      html += obtenerEmojiPosicion(posicion) + ' ' + capitalizar(posicion) + 's';
      html += '</h5>';
      html += '<div class="row g-3">';

      // Iterar sobre cada jugador de esta posición
      for (let j = 0; j < jugadoresPosicion.length; j++) {
        const jugador = jugadoresPosicion[j];
        
        // Obtener totales del jugador si existen
        const totales = sistemaJornadas ? sistemaJornadas.calcularTotalesJugador(jugador.id) : null;
        
        html += '<div class="col-md-6 col-lg-4">';
        html += '<div class="card bg-dark border-' + obtenerColorPosicion(posicion) + ' h-100">';
        html += '<div class="card-body">';
        
        // FOTO DEL JUGADOR
        html += '<div class="text-center mb-3">';
        html += '<img src="../' + jugador.foto + '" ';
        html += 'alt="' + jugador.nombre + '" ';
        html += 'class="img-fluid rounded-circle border border-' + obtenerColorPosicion(posicion) + ' border-3" ';
        html += 'style="width: 100px; height: 100px; object-fit: cover;" ';
        html += 'onerror="this.src=\'../assets/imagenes/default-player.png\'">';
        html += '</div>';
        
        // Nombre y posición
        html += '<div class="d-flex justify-content-between align-items-start mb-2">';
        html += '<h6 class="card-title mb-0">' + jugador.nombre + '</h6>';
        html += '<span class="badge bg-' + obtenerColorPosicion(posicion) + '">';
        html += extraerIniciales(jugador.posicion, 3);
        html += '</span>';
        html += '</div>';
        
        // Equipo
        html += '<div class="text-center mb-2">';
        html += '<span class="badge bg-secondary">' + jugador.equipo + '</span>';
        html += '</div>';
        
        // Nombre completo
        html += '<p class="text-center text-white-50 small mb-2 fw-semibold">';
        html += jugador.nombre;
        html += '</p>';
        
        // Precio y estadísticas
        html += '<div class="d-flex justify-content-between align-items-center">';
        html += '<span class="text-warning fw-bold">💰 $' + jugador.precio + 'M</span>';
        
        if (totales) {
          html += '<span class="badge bg-success">';
          html += totales.puntosTotal + ' pts (' + totales.jornadasJugadas + 'J)';
          html += '</span>';
        } else {
          html += '<span class="badge bg-secondary">';
          html += jugador.puntosPromedio + ' pts prom.';
          html += '</span>';
        }
        
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
      }

      html += '</div></div>';
    }
  }

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

  // Confirmar simulación con el usuario
  const confirmar = confirm(
    '¿Simular Jornada ' + sistemaJornadas.jornadaActual + '?\n\n' +
    'Se generarán estadísticas para tus ' + miEquipo.jugadores.length + ' jugadores.'
  );

  if (!confirmar) return;

  // Mostrar indicador de carga
  mostrarLoading(true);

  // Simular con delay para efecto visual
  setTimeout(() => {
    try {
      // Ejecutar simulación
      const resultado = sistemaJornadas.simularJornada(miEquipo.jugadores);
      
      if (resultado) {
        mostrarResultadosJornada(resultado);
        actualizarInfoJornada();
        mostrarHistorial();
        mostrarEquipo(); // Actualizar cards con nuevos totales
        
        // Mostrar notificación de éxito
        mostrarToast(
          '✅ Jornada ' + resultado.numeroJornada + ' simulada - ' + resultado.puntosTotal + ' puntos totales',
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

  modalTitle.textContent = 'Resultados Jornada ' + resultado.numeroJornada;

  // Calcular promedio por jugador
  const promedio = dividirConDecimales(resultado.puntosTotal, resultado.resultados.length, 2);

  let html = '<div class="alert alert-success mb-3">';
  html += '<h5 class="mb-2">🎉 Puntos Totales: ' + resultado.puntosTotal + '</h5>';
  html += '<small>Promedio por jugador: ' + promedio + '</small>';
  html += '</div>';

  // Ordenar resultados por puntos (mayor a menor)
  const ordenados = ordenarPorPuntos(resultado.resultados);

  // Top 3 jugadores
  html += '<h6 class="text-success mb-3">⭐ Top 3 Jugadores</h6>';
  
  const medallas = ['🥇', '🥈', '🥉'];
  const coloresBorde = ['success', 'secondary', 'warning'];
  
  // Mostrar solo los primeros 3
  const top3 = obtenerPrimeros(ordenados, 3);
  
  for (let i = 0; i < top3.length; i++) {
    const r = top3[i];
    const medalla = medallas[i];
    const colorBorde = coloresBorde[i];
    
    // Buscar datos del jugador
    const jugadorData = buscarJugadorPorId(miEquipo.jugadores, r.jugadorId);
    
    html += '<div class="card bg-dark border-' + colorBorde + ' mb-2">';
    html += '<div class="card-body py-2">';
    html += '<div class="d-flex align-items-center justify-content-between">';
    html += '<div class="d-flex align-items-center gap-2">';
    
    // Foto si está disponible
    if (jugadorData && jugadorData.foto) {
      html += '<img src="../' + jugadorData.foto + '" ';
      html += 'alt="' + r.nombre + '" ';
      html += 'class="rounded-circle border border-' + colorBorde + ' border-2" ';
      html += 'style="width: 50px; height: 50px; object-fit: cover;" ';
      html += 'onerror="this.style.display=\'none\'">';
    }
    
    html += '<div>';
    html += '<div class="fw-bold">' + medalla + ' ' + r.nombre + '</div>';
    html += '<small class="text-white-50">' + formatearEstadisticas(r.estadisticas) + '</small>';
    html += '</div>';
    html += '</div>';
    html += '<span class="badge bg-' + colorBorde + ' fs-6">' + r.puntos + ' pts</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
  }

  // Todos los resultados en tabla
  html += '<h6 class="text-info mt-4 mb-3">📊 Todos los Resultados</h6>';
  html += '<div class="table-responsive">';
  html += '<table class="table table-dark table-sm table-striped">';
  html += '<thead>';
  html += '<tr>';
  html += '<th>Jugador</th>';
  html += '<th>Pos</th>';
  html += '<th class="text-end">Puntos</th>';
  html += '</tr>';
  html += '</thead>';
  html += '<tbody>';

  for (let i = 0; i < ordenados.length; i++) {
    const r = ordenados[i];
    html += '<tr>';
    html += '<td>';
    html += obtenerEmojiPosicion(r.posicion) + ' ' + r.nombre;
    html += '<br><small class="text-white-50">' + formatearEstadisticas(r.estadisticas) + '</small>';
    html += '</td>';
    html += '<td><span class="badge bg-secondary">' + extraerIniciales(r.posicion, 3) + '</span></td>';
    html += '<td class="text-end fw-bold">' + r.puntos + '</td>';
    html += '</tr>';
  }

  html += '</tbody></table></div>';

  modalBody.innerHTML = html;
  modal.show();
}

// ============================================
// FORMATEAR ESTADÍSTICAS PARA MOSTRAR
// ============================================
function formatearEstadisticas(stats) {
  const partes = [];
  
  if (stats.goles > 0) partes.push('⚽ ' + stats.goles + 'G');
  if (stats.asistencias > 0) partes.push('🎯 ' + stats.asistencias + 'A');
  if (stats.atajadas > 0) partes.push('🧤 ' + stats.atajadas + ' atajadas');
  if (stats.golesRecibidos !== undefined) partes.push('🥅 ' + stats.golesRecibidos + ' recibidos');
  if (stats.tarjetasAmarillas > 0) partes.push('🟨 ' + stats.tarjetasAmarillas);
  if (stats.tarjetasRojas > 0) partes.push('🟥 ' + stats.tarjetasRojas);
  
  return partes.length > 0 ? unirConSeparador(partes, ' • ') : 'Sin estadísticas destacadas';
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
    // Sumar todos los puntos del historial
    let puntosTotal = 0;
    for (let i = 0; i < historial.length; i++) {
      puntosTotal += historial[i].puntosTotal || 0;
    }
    puntosAcumuladosSpan.textContent = redondearNumero(puntosTotal, 1);
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
  const ultimas10 = obtenerUltimos(historial, 10);
  const invertidas = invertirArray(ultimas10);

  for (let i = 0; i < invertidas.length; i++) {
    const jornada = invertidas[i];
    
    // Formatear fecha
    const fecha = new Date(jornada.fecha);
    const fechaTexto = formatearFechaCorta(fecha);

    html += '<div class="list-group-item bg-dark border-success mb-2">';
    html += '<div class="d-flex justify-content-between align-items-center">';
    html += '<div>';
    html += '<h6 class="mb-1">Jornada ' + jornada.numeroJornada + '</h6>';
    html += '<small class="text-white-50">' + fechaTexto + '</small>';
    html += '</div>';
    html += '<div class="text-end">';
    html += '<span class="badge bg-success fs-6">' + jornada.puntosTotal + ' pts</span>';
    html += '<br>';
    html += '<small class="text-white-50">' + jornada.resultados.length + ' jugadores</small>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
  }

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
  if (!texto || texto.length === 0) return '';
  return texto[0].toUpperCase() + extraerDesde(texto, 1);
}

function mostrarToast(mensaje, tipo = 'success') {
  // Implementar según tu sistema de toasts
  console.log('[' + tipo + '] ' + mensaje);
}

// ============================================
// FUNCIONES HELPER - REEMPLAZO DE MÉTODOS MODERNOS
// ============================================

// Parsear JSON
function parsearJSON(texto) {
  return JSON.parse(texto);
}

// Dividir con decimales
function dividirConDecimales(numerador, denominador, decimales) {
  const resultado = numerador / denominador;
  return resultado.toFixed(decimales);
}

// Redondear número
function redondearNumero(numero, decimales) {
  return numero.toFixed(decimales);
}

// Ordenar array por puntos (mayor a menor)
function ordenarPorPuntos(array) {
  const copia = [];
  for (let i = 0; i < array.length; i++) {
    copia.push(array[i]);
  }
  
  // Bubble sort descendente por puntos
  for (let i = 0; i < copia.length - 1; i++) {
    for (let j = 0; j < copia.length - i - 1; j++) {
      if (copia[j].puntos < copia[j + 1].puntos) {
        const temp = copia[j];
        copia[j] = copia[j + 1];
        copia[j + 1] = temp;
      }
    }
  }
  
  return copia;
}

// Obtener primeros N elementos
function obtenerPrimeros(array, cantidad) {
  const resultado = [];
  const limite = array.length < cantidad ? array.length : cantidad;
  
  for (let i = 0; i < limite; i++) {
    resultado.push(array[i]);
  }
  
  return resultado;
}

// Obtener últimos N elementos
function obtenerUltimos(array, cantidad) {
  const resultado = [];
  const inicio = array.length - cantidad;
  const desde = inicio > 0 ? inicio : 0;
  
  for (let i = desde; i < array.length; i++) {
    resultado.push(array[i]);
  }
  
  return resultado;
}

// Invertir array
function invertirArray(array) {
  const resultado = [];
  for (let i = array.length - 1; i >= 0; i--) {
    resultado.push(array[i]);
  }
  return resultado;
}

// Buscar jugador por ID
function buscarJugadorPorId(jugadores, id) {
  for (let i = 0; i < jugadores.length; i++) {
    if (jugadores[i].id === id) {
      return jugadores[i];
    }
  }
  return null;
}

// Unir array con separador
function unirConSeparador(array, separador) {
  if (array.length === 0) return '';
  
  let resultado = array[0];
  for (let i = 1; i < array.length; i++) {
    resultado += separador + array[i];
  }
  
  return resultado;
}

// Extraer iniciales de texto
function extraerIniciales(texto, cantidad) {
  let resultado = '';
  const limite = texto.length < cantidad ? texto.length : cantidad;
  
  for (let i = 0; i < limite; i++) {
    resultado += texto[i];
  }
  
  return resultado.toUpperCase();
}

// Extraer desde posición
function extraerDesde(texto, desde) {
  let resultado = '';
  for (let i = desde; i < texto.length; i++) {
    resultado += texto[i];
  }
  return resultado;
}

// Formatear fecha corta (DD/MM/YYYY)
function formatearFechaCorta(fecha) {
  const dia = agregarCero(fecha.getDate());
  const mes = agregarCero(fecha.getMonth() + 1);
  const anio = fecha.getFullYear();
  return dia + '/' + mes + '/' + anio;
}

// Agregar cero adelante
function agregarCero(numero) {
  return numero < 10 ? '0' + numero : numero.toString();
}