// ============================================
// SISTEMA DE RANKING (CORREGIDO)
// ============================================

let rankingData = [];
let rankingFiltrado = [];

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  cargarRanking();
  configurarEventos();
});

// ============================================
// CARGAR RANKING DE TODOS LOS USUARIOS
// ============================================
function cargarRanking() {
  mostrarLoading(true);
  
  try {
    rankingData = [];
    
    // ✅ CORREGIDO: Usar el mismo nombre que login/signup
    const usuariosJSON = localStorage.getItem('fantasyUsers');
    if (!usuariosJSON) {
      console.log('No hay usuarios registrados');
      mostrarLoading(false);
      mostrarSinDatos();
      return;
    }
    
    const usuarios = JSON.parse(usuariosJSON);
    console.log('Usuarios encontrados:', usuarios.length);
    
    // Por cada usuario, buscar su historial de jornadas
    for (let i = 0; i < usuarios.length; i++) {
      const usuario = usuarios[i];
      
      // ✅ CORREGIDO: Usar email como identificador (mismo que usa sistema-jornadas.js)
      const identificador = usuario.email;
      
      // Buscar historial de jornadas con el email del usuario
      const historialKey = `jornadas_historial_${identificador}`;
      const historialJSON = localStorage.getItem(historialKey);
      
      console.log(`Buscando historial para ${identificador}:`, historialKey, historialJSON ? 'ENCONTRADO' : 'NO ENCONTRADO');
      
      if (historialJSON) {
        const historial = JSON.parse(historialJSON);
        
        // Calcular estadísticas
        let puntosTotal = 0;
        let jornadasJugadas = historial.length;
        
        for (let j = 0; j < historial.length; j++) {
          puntosTotal += historial[j].puntosTotal || 0;
        }
        
        const promedio = jornadasJugadas > 0 ? (puntosTotal / jornadasJugadas) : 0;
        
        if (jornadasJugadas > 0) {
          rankingData.push({
            usuario: identificador,
            nombre: usuario.name || identificador,
            puntosTotal: puntosTotal,
            jornadasJugadas: jornadasJugadas,
            promedio: promedio,
            ultimaJornada: historial[historial.length - 1].fecha || 'N/A'
          });
        }
      } else {
        // Agregar usuario sin jornadas para que aparezca en estadísticas
        console.log(`Usuario ${identificador} sin jornadas jugadas`);
      }
    }
    
    console.log('Datos del ranking:', rankingData);
    
    // Ordenar por puntos (mayor a menor)
    rankingData.sort((a, b) => b.puntosTotal - a.puntosTotal);
    
    rankingFiltrado = [...rankingData];
    
    mostrarLoading(false);
    mostrarRanking();
    mostrarEstadisticas();
    mostrarPodio();
    
  } catch (error) {
    console.error('Error al cargar ranking:', error);
    mostrarLoading(false);
    mostrarSinDatos();
  }
}

// ============================================
// MOSTRAR RANKING EN TABLA
// ============================================
function mostrarRanking() {
  const tbody = document.getElementById('tablaRanking');
  const tablaContainer = document.getElementById('tablaContainer');
  const sinDatos = document.getElementById('sinDatos');
  const cantidadMostrada = document.getElementById('cantidadMostrada');
  
  if (rankingFiltrado.length === 0) {
    tablaContainer.classList.add('d-none');
    sinDatos.classList.remove('d-none');
    cantidadMostrada.textContent = '0 equipos';
    return;
  }
  
  tablaContainer.classList.remove('d-none');
  sinDatos.classList.add('d-none');
  
  // Aplicar límite de cantidad a mostrar
  const limite = document.getElementById('cantidadMostrar').value;
  const mostrar = limite === 'todos' ? rankingFiltrado : rankingFiltrado.slice(0, parseInt(limite));
  
  cantidadMostrada.textContent = `${mostrar.length} equipos`;
  
  tbody.innerHTML = '';
  
  // ✅ CORREGIDO: Obtener usuario actual por email
  const usuarioActual = localStorage.getItem('loggedUser');
  
  for (let i = 0; i < mostrar.length; i++) {
    const equipo = mostrar[i];
    const posicion = i + 1;
    
    const fila = document.createElement('tr');
    
    // Resaltar si es el usuario actual
    if (equipo.usuario === usuarioActual) {
      fila.classList.add('table-success');
      fila.style.borderLeft = '5px solid #198754';
    }
    
    // Medallas para top 3
    let medalla = '';
    if (posicion === 1) medalla = '🥇';
    else if (posicion === 2) medalla = '🥈';
    else if (posicion === 3) medalla = '🥉';
    
    fila.innerHTML = `
      <td class="fw-bold text-warning">
        ${medalla} ${posicion}°
      </td>
      <td>
        <div class="fw-semibold">${equipo.nombre}</div>
        <small class="text-dark-50">${equipo.usuario}</small>
        ${equipo.usuario === usuarioActual ? '<span class="badge bg-success ms-2">Tú</span>' : ''}
      </td>
      <td class="text-center">
        <span class="badge bg-info">${equipo.jornadasJugadas}</span>
      </td>
      <td class="text-end fw-bold text-success">
        ${equipo.puntosTotal.toFixed(1)}
      </td>
      <td class="text-end text-dark-50">
        ${equipo.promedio.toFixed(2)}
      </td>
    `;
    
    tbody.appendChild(fila);
  }
}

// ============================================
// MOSTRAR PODIO (TOP 3)
// ============================================
function mostrarPodio() {
  const podio = document.getElementById('podio');
  
  if (rankingFiltrado.length === 0) {
    podio.innerHTML = `
      <div class="col-12">
        <p class="text-white-50 mb-0">Aún no hay equipos en el ranking</p>
      </div>
    `;
    return;
  }
  
  const top3 = rankingFiltrado.slice(0, 3);
  const medallas = ['🥇', '🥈', '🥉'];
  const colores = ['warning', 'secondary', 'danger'];
  const ordenes = [2, 1, 3]; // Orden visual: plata, oro, bronce
  
  let html = '';
  
  // Si hay menos de 3, ajustar
  const posiciones = [
    top3[1] || null, // Segundo lugar
    top3[0] || null, // Primer lugar
    top3[2] || null  // Tercer lugar
  ];
  
  for (let i = 0; i < 3; i++) {
    const equipo = posiciones[i];
    const index = i === 0 ? 1 : (i === 1 ? 0 : 2);
    
    if (!equipo) {
      html += `
        <div class="col-md-4 order-${ordenes[i]}">
          <div class="card bg-dark border-secondary opacity-50">
            <div class="card-body py-4">
              <p class="text-dark-50">Sin datos</p>
            </div>
          </div>
        </div>
      `;
      continue;
    }
    
    const alturaPodio = i === 1 ? 'py-5' : 'py-4';
    const tamañoMedalla = i === 1 ? 'fs-1' : 'fs-3';
    
    html += `
      <div class="col-md-4 order-${ordenes[i]}">
        <div class="card bg-dark border-${colores[index]} ${alturaPodio}">
          <div class="card-body text-center">
            <div class="${tamañoMedalla} mb-2">${medallas[index]}</div>
            <h5 class="text-${colores[index]} fw-bold mb-2">${equipo.nombre}</h5>
            <p class="text-white-50 small mb-3">${equipo.usuario}</p>
            <h3 class="text-success fw-bold mb-1">${equipo.puntosTotal.toFixed(1)}</h3>
            <small class="text-dark-50">puntos</small>
            <hr class="border-${colores[index]} my-3">
            <small class="text-dark-50">
              ${equipo.jornadasJugadas} jornadas<br>
              Promedio: ${equipo.promedio.toFixed(2)}
            </small>
          </div>
        </div>
      </div>
    `;
  }
  
  podio.innerHTML = html;
}

// ============================================
// MOSTRAR ESTADÍSTICAS GENERALES
// ============================================
function mostrarEstadisticas() {
  const totalEquipos = document.getElementById('totalEquipos');
  const totalJornadas = document.getElementById('totalJornadas');
  const puntosTotales = document.getElementById('puntosTotales');
  
  // ✅ CORREGIDO: Mostrar total de usuarios registrados (aunque no hayan jugado)
  const usuariosJSON = localStorage.getItem('fantasyUsers');
  const totalUsuariosRegistrados = usuariosJSON ? JSON.parse(usuariosJSON).length : 0;
  
  totalEquipos.textContent = totalUsuariosRegistrados;
  
  let sumaJornadas = 0;
  let sumaPuntos = 0;
  
  for (let i = 0; i < rankingData.length; i++) {
    sumaJornadas += rankingData[i].jornadasJugadas;
    sumaPuntos += rankingData[i].puntosTotal;
  }
  
  totalJornadas.textContent = sumaJornadas;
  puntosTotales.textContent = sumaPuntos.toFixed(0);
}

// ============================================
// APLICAR FILTROS
// ============================================
function aplicarFiltros() {
  const filtroUsuario = document.getElementById('filtroUsuario').value.toLowerCase();
  const ordenarPor = document.getElementById('ordenarPor').value;
  
  // Filtrar por usuario
  rankingFiltrado = rankingData.filter(equipo => {
    if (filtroUsuario === '') return true;
    return equipo.usuario.toLowerCase().includes(filtroUsuario) || 
           equipo.nombre.toLowerCase().includes(filtroUsuario);
  });
  
  // Ordenar
  switch(ordenarPor) {
    case 'puntos-desc':
      rankingFiltrado.sort((a, b) => b.puntosTotal - a.puntosTotal);
      break;
    case 'puntos-asc':
      rankingFiltrado.sort((a, b) => a.puntosTotal - b.puntosTotal);
      break;
    case 'jornadas-desc':
      rankingFiltrado.sort((a, b) => b.jornadasJugadas - a.jornadasJugadas);
      break;
    case 'nombre':
      rankingFiltrado.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
  }
  
  mostrarRanking();
}

// ============================================
// MOSTRAR/OCULTAR ELEMENTOS
// ============================================
function mostrarLoading(mostrar) {
  const loading = document.getElementById('loadingRanking');
  const tabla = document.getElementById('tablaContainer');
  
  if (mostrar) {
    loading.classList.remove('d-none');
    tabla.classList.add('d-none');
  } else {
    loading.classList.add('d-none');
  }
}

function mostrarSinDatos() {
  const loading = document.getElementById('loadingRanking');
  const tabla = document.getElementById('tablaContainer');
  const sinDatos = document.getElementById('sinDatos');
  const podio = document.getElementById('podio');
  
  loading.classList.add('d-none');
  tabla.classList.add('d-none');
  sinDatos.classList.remove('d-none');
  
  podio.innerHTML = `
    <div class="col-12">
      <p class="text-white-50 mb-0 py-3">Aún no hay equipos en el ranking</p>
    </div>
  `;
}

// ============================================
// CONFIGURAR EVENTOS
// ============================================
function configurarEventos() {
  document.getElementById('filtroUsuario').addEventListener('input', aplicarFiltros);
  document.getElementById('ordenarPor').addEventListener('change', aplicarFiltros);
  document.getElementById('cantidadMostrar').addEventListener('change', mostrarRanking);
  document.getElementById('btnActualizar').addEventListener('click', () => {
    cargarRanking();
    mostrarToast('✅ Ranking actualizado');
  });
}

// ============================================
// TOAST DE NOTIFICACIÓN
// ============================================
function mostrarToast(mensaje) {
  const toastHTML = `
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div class="toast align-items-center text-white bg-success border-0 show" role="alert">
        <div class="d-flex">
          <div class="toast-body">${mensaje}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>
    </div>
  `;
  
  const temp = document.createElement('div');
  temp.innerHTML = toastHTML;
  document.body.appendChild(temp.firstElementChild);
  
  setTimeout(() => {
    const toastContainer = document.querySelector('.toast-container');
    if (toastContainer) toastContainer.remove();
  }, 3000);
}

console.log('📊 Sistema de ranking cargado');