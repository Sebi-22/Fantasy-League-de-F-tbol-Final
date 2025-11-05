// ============================================
// CLASE PRINCIPAL: GESTOR DE SELECCIÓN
// ============================================
class GestorSeleccion {
  constructor() {
    this.todosLosJugadores = [];
    this.jugadoresFiltrados = [];
    this.miEquipo = new Equipo();
    this.inicializar();
  }

  async inicializar() {
    this.verificarSesion();
    await this.cargarJugadores();
    this.configurarEventos();
    this.cargarEquipoGuardado();
    this.actualizarInterfaz();
  }

  verificarSesion() {
    const usuarioLogueado = localStorage.getItem('loggedUser');
    
    if (!usuarioLogueado) {
      alert('⚠️ Debes iniciar sesión para acceder');
      window.location.href = 'login.html';
    }
  }

  async cargarJugadores() {
    const loadingElement = document.getElementById('loadingJugadores');
    const tablaContainer = document.getElementById('tablaContainer');
    
    try {
      loadingElement.classList.remove('d-none');
      tablaContainer.classList.add('d-none');
      
      // Fetch con async/await
      const response = await fetch('../assets/data/base-de-datos-jugadores.json');
      
      if (!response.ok) {
        throw new Error('Error al cargar el archivo');
      }
      
      const texto = await response.text();
      const data = this.convertirTextoAObjeto(texto);
      
      if (!data.jugadores || !Array.isArray(data.jugadores)) {
        throw new Error('Formato incorrecto');
      }
      
      this.todosLosJugadores = data.jugadores;
      this.jugadoresFiltrados = this.copiarArray(this.todosLosJugadores);
      
      console.log('Jugadores cargados:', this.todosLosJugadores.length);
      
      this.llenarSelectEquipos();
      this.mostrarJugadores(this.jugadoresFiltrados);
      
      loadingElement.classList.add('d-none');
      tablaContainer.classList.remove('d-none');
      
      this.mostrarToast('✅ Jugadores cargados', 'success');
      
    } catch (error) {
      console.error('Error:', error);
      loadingElement.innerHTML = `
        <div class="alert alert-danger m-3">
          <strong>Error al cargar jugadores</strong>
          <br><button class="btn btn-sm btn-outline-light mt-2" onclick="location.reload()">🔄 Reintentar</button>
        </div>
      `;
    }
  }

  llenarSelectEquipos() {
    const selectEquipo = document.getElementById('filtroEquipo');
    const equipos = this.obtenerEquiposUnicos();
    
    for (let i = 0; i < equipos.length; i++) {
      const option = document.createElement('option');
      option.value = equipos[i];
      option.textContent = equipos[i];
      selectEquipo.appendChild(option);
    }
  }

  obtenerEquiposUnicos() {
    const equipos = [];
    for (let i = 0; i < this.todosLosJugadores.length; i++) {
      const equipo = this.todosLosJugadores[i].equipo;
      if (!this.existeEnArray(equipos, equipo)) {
        equipos.push(equipo);
      }
    }
    return this.ordenarArray(equipos);
  }

  mostrarJugadores(jugadores) {
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
    totalJugadoresSpan.textContent = jugadores.length + ' jugadores';
    
    for (let i = 0; i < jugadores.length; i++) {
      const jugador = jugadores[i];
      const estaSeleccionado = this.miEquipo.tieneJugador(jugador.id);
      
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>
          <div class="d-flex align-items-center">
            <div class="me-2" style="font-size: 1.5rem;">${this.obtenerEmojiPosicion(jugador.posicion)}</div>
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
            : `<button class="btn btn-success btn-sm" onclick="gestor.agregarJugador(${jugador.id})">
                ➕ Agregar
              </button>`
          }
        </td>
      `;
      
      tbody.appendChild(fila);
    }
  }

  agregarJugador(idJugador) {
    const jugador = this.buscarJugadorPorId(idJugador);
    
    if (!jugador) {
      this.mostrarToast('❌ Jugador no encontrado', 'danger');
      return;
    }
    
    const resultado = this.miEquipo.agregarJugador(jugador);
    
    if (resultado.exito) {
      this.actualizarInterfaz();
      this.mostrarJugadores(this.jugadoresFiltrados);
      this.mostrarToast('✅ ' + jugador.nombre + ' agregado', 'success');
    } else {
      this.mostrarToast('❌ ' + resultado.mensaje, 'danger');
    }
  }

  eliminarJugador(idJugador) {
    const jugador = this.miEquipo.eliminarJugador(idJugador);
    
    if (jugador) {
      this.actualizarInterfaz();
      this.mostrarJugadores(this.jugadoresFiltrados);
      this.mostrarToast('🗑️ ' + jugador.nombre + ' eliminado', 'warning');
    }
  }

  aplicarFiltros() {
    const busqueda = document.getElementById('buscarJugador').value.toLowerCase();
    const posicion = document.getElementById('filtroPosicion').value;
    const equipo = document.getElementById('filtroEquipo').value;
    const ordenar = document.getElementById('ordenar').value;
    
    // Filtrar
    this.jugadoresFiltrados = [];
    for (let i = 0; i < this.todosLosJugadores.length; i++) {
      const jugador = this.todosLosJugadores[i];
      
      const cumpleBusqueda = jugador.nombre.toLowerCase().indexOf(busqueda) !== -1;
      const cumplePosicion = posicion === '' || jugador.posicion === posicion;
      const cumpleEquipo = equipo === '' || jugador.equipo === equipo;
      
      if (cumpleBusqueda && cumplePosicion && cumpleEquipo) {
        this.jugadoresFiltrados.push(jugador);
      }
    }
    
    // Ordenar
    this.ordenarJugadores(this.jugadoresFiltrados, ordenar);
    this.mostrarJugadores(this.jugadoresFiltrados);
  }

  ordenarJugadores(jugadores, criterio) {
    if (criterio === 'nombre') {
      for (let i = 0; i < jugadores.length - 1; i++) {
        for (let j = i + 1; j < jugadores.length; j++) {
          if (jugadores[i].nombre > jugadores[j].nombre) {
            const temp = jugadores[i];
            jugadores[i] = jugadores[j];
            jugadores[j] = temp;
          }
        }
      }
    } else if (criterio === 'precio-asc') {
      for (let i = 0; i < jugadores.length - 1; i++) {
        for (let j = i + 1; j < jugadores.length; j++) {
          if (jugadores[i].precio > jugadores[j].precio) {
            const temp = jugadores[i];
            jugadores[i] = jugadores[j];
            jugadores[j] = temp;
          }
        }
      }
    } else if (criterio === 'precio-desc') {
      for (let i = 0; i < jugadores.length - 1; i++) {
        for (let j = i + 1; j < jugadores.length; j++) {
          if (jugadores[i].precio < jugadores[j].precio) {
            const temp = jugadores[i];
            jugadores[i] = jugadores[j];
            jugadores[j] = temp;
          }
        }
      }
    }
  }

  actualizarInterfaz() {
    this.actualizarPresupuesto();
    this.actualizarContadores();
    this.actualizarListaJugadores();
    this.actualizarBotonGuardar();
  }

  actualizarPresupuesto() {
    const presupuestoDisp = document.getElementById('presupuestoDisponible');
    const presupuestoGast = document.getElementById('presupuestoGastado');
    const presupuestoBar = document.getElementById('presupuestoBar');
    
    const disponible = this.miEquipo.presupuestoDisponible;
    const gastado = this.miEquipo.presupuestoInicial - disponible;
    const porcentaje = (disponible / this.miEquipo.presupuestoInicial) * 100;
    
    presupuestoDisp.textContent = disponible.toFixed(1);
    presupuestoGast.textContent = gastado.toFixed(1);
    presupuestoBar.style.width = porcentaje + '%';
    
    if (porcentaje < 20) {
      presupuestoBar.classList.remove('bg-warning');
      presupuestoBar.classList.add('bg-danger');
    } else {
      presupuestoBar.classList.remove('bg-danger');
      presupuestoBar.classList.add('bg-warning');
    }
  }

  actualizarContadores() {
    const cantidadJugadores = document.getElementById('cantidadJugadores');
    const jugadoresBar = document.getElementById('jugadoresBar');
    
    cantidadJugadores.textContent = this.miEquipo.jugadores.length;
    const porcentaje = (this.miEquipo.jugadores.length / this.miEquipo.TOTAL_JUGADORES) * 100;
    jugadoresBar.style.width = porcentaje + '%';
    
    const contadores = this.miEquipo.contarPorPosicion();
    
    document.getElementById('conteoArqueros').textContent = contadores.arquero;
    document.getElementById('conteoDefensas').textContent = contadores.defensa;
    document.getElementById('conteoMediocampistas').textContent = contadores.mediocampista;
    document.getElementById('conteoDelanteros').textContent = contadores.delantero;
    
    this.actualizarColorBadges(contadores);
  }

  actualizarColorBadges(contadores) {
    const limites = this.miEquipo.LIMITES;
    const badges = {
      arquero: document.getElementById('conteoArqueros').parentElement,
      defensa: document.getElementById('conteoDefensas').parentElement,
      mediocampista: document.getElementById('conteoMediocampistas').parentElement,
      delantero: document.getElementById('conteoDelanteros').parentElement
    };
    
    const posiciones = ['arquero', 'defensa', 'mediocampista', 'delantero'];
    
    for (let i = 0; i < posiciones.length; i++) {
      const posicion = posiciones[i];
      const badge = badges[posicion];
      const cuenta = contadores[posicion];
      const limite = limites[posicion];
      
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
    }
  }

  actualizarListaJugadores() {
    const lista = document.getElementById('listaJugadoresSeleccionados');
    
    if (this.miEquipo.jugadores.length === 0) {
      lista.innerHTML = '<p class="text-white-50 text-center small py-3 mb-0">Sin jugadores aún</p>';
      return;
    }
    
    const porPosicion = this.agruparPorPosicion();
    let html = '';
    
    const posiciones = ['arquero', 'defensa', 'mediocampista', 'delantero'];
    
    for (let i = 0; i < posiciones.length; i++) {
      const posicion = posiciones[i];
      const jugadores = porPosicion[posicion];
      
      for (let j = 0; j < jugadores.length; j++) {
        const jugador = jugadores[j];
        html += `
          <div class="player-item">
            <div class="player-info">
              <div class="player-name">${this.obtenerEmojiPosicion(jugador.posicion)} ${jugador.nombre}</div>
              <div class="player-details">
                <span>${jugador.equipo}</span>
                <span>•</span>
                <span>${jugador.posicion}</span>
              </div>
            </div>
            <div class="d-flex align-items-center">
              <span class="player-price">$${jugador.precio}M</span>
              <button class="btn btn-danger btn-sm btn-remove-player" onclick="gestor.eliminarJugador(${jugador.id})">
                ✕
              </button>
            </div>
          </div>
        `;
      }
    }
    
    lista.innerHTML = html;
  }

  agruparPorPosicion() {
    const grupos = {
      arquero: [],
      defensa: [],
      mediocampista: [],
      delantero: []
    };
    
    for (let i = 0; i < this.miEquipo.jugadores.length; i++) {
      const jugador = this.miEquipo.jugadores[i];
      grupos[jugador.posicion].push(jugador);
    }
    
    return grupos;
  }

  actualizarBotonGuardar() {
    const btnGuardar = document.getElementById('btnGuardarEquipo');
    const equipoCompleto = this.miEquipo.estaCompleto();
    
    btnGuardar.disabled = !equipoCompleto;
    
    if (equipoCompleto) {
      btnGuardar.innerHTML = '✅ Guardar Equipo Completo';
      btnGuardar.classList.add('pulse');
    } else {
      btnGuardar.innerHTML = '💾 Guardar Equipo (' + this.miEquipo.jugadores.length + '/' + this.miEquipo.TOTAL_JUGADORES + ')';
      btnGuardar.classList.remove('pulse');
    }
  }

  guardarEquipo() {
    if (!this.miEquipo.estaCompleto()) {
      this.mostrarToast('⚠️ Debes completar las 18 posiciones', 'warning');
      return;
    }
    
    const fecha = new Date();
    const equipoGuardar = {
      jugadores: this.miEquipo.jugadores,
      presupuestoInicial: this.miEquipo.presupuestoInicial,
      presupuestoDisponible: this.miEquipo.presupuestoDisponible,
      formacion: this.miEquipo.formacion,
      fecha: fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate(),
      usuario: localStorage.getItem('loggedUser')
    };
    
    const textoJSON = this.convertirObjetoATexto(equipoGuardar);
    localStorage.setItem('miEquipoFantasy', textoJSON);
    
    this.mostrarToast('✅ Equipo guardado correctamente', 'success');
    
    setTimeout(() => {
      window.location.href = 'equipo.html';
    }, 1500);
  }

  limpiarEquipo() {
    if (this.miEquipo.jugadores.length === 0) {
      this.mostrarToast('⚠️ No hay jugadores para eliminar', 'warning');
      return;
    }
    
    if (confirm('¿Estás seguro de que querés limpiar todo el equipo?')) {
      this.miEquipo.limpiar();
      this.actualizarInterfaz();
      this.mostrarJugadores(this.jugadoresFiltrados);
      this.mostrarToast('🗑️ Equipo limpiado', 'warning');
    }
  }

  cargarEquipoGuardado() {
    const equipoGuardado = localStorage.getItem('miEquipoFantasy');
    
    if (equipoGuardado) {
      try {
        const equipoParseado = this.convertirTextoAObjeto(equipoGuardado);
        
        if (confirm('¿Querés continuar con tu equipo guardado?')) {
          this.miEquipo.jugadores = equipoParseado.jugadores;
          this.miEquipo.presupuestoDisponible = equipoParseado.presupuestoDisponible;
          this.miEquipo.formacion = equipoParseado.formacion;
          
          this.actualizarInterfaz();
          this.mostrarToast('✅ Equipo cargado', 'success');
        }
      } catch (error) {
        console.error('Error al cargar equipo:', error);
        localStorage.removeItem('miEquipoFantasy');
      }
    }
  }

  configurarEventos() {
    document.getElementById('buscarJugador').addEventListener('input', () => this.aplicarFiltros());
    document.getElementById('filtroPosicion').addEventListener('change', () => this.aplicarFiltros());
    document.getElementById('filtroEquipo').addEventListener('change', () => this.aplicarFiltros());
    document.getElementById('ordenar').addEventListener('change', () => this.aplicarFiltros());
    
    document.getElementById('limpiarFiltros').addEventListener('click', () => {
      document.getElementById('buscarJugador').value = '';
      document.getElementById('filtroPosicion').value = '';
      document.getElementById('filtroEquipo').value = '';
      document.getElementById('ordenar').value = 'nombre';
      this.aplicarFiltros();
    });
    
    document.getElementById('btnGuardarEquipo').addEventListener('click', () => this.guardarEquipo());
    document.getElementById('btnLimpiar').addEventListener('click', () => this.limpiarEquipo());
    
    document.getElementById('formacion').addEventListener('change', () => {
      const select = document.getElementById('formacion');
      this.miEquipo.formacion = select.value;
      this.mostrarToast('⚽ Formación cambiada a ' + select.value, 'success');
    });
  }

  // Utilidades
  buscarJugadorPorId(id) {
    for (let i = 0; i < this.todosLosJugadores.length; i++) {
      if (this.todosLosJugadores[i].id === id) {
        return this.todosLosJugadores[i];
      }
    }
    return null;
  }

  copiarArray(array) {
    const copia = [];
    for (let i = 0; i < array.length; i++) {
      copia.push(array[i]);
    }
    return copia;
  }

  existeEnArray(array, elemento) {
    for (let i = 0; i < array.length; i++) {
      if (array[i] === elemento) {
        return true;
      }
    }
    return false;
  }

  ordenarArray(array) {
    for (let i = 0; i < array.length - 1; i++) {
      for (let j = i + 1; j < array.length; j++) {
        if (array[i] > array[j]) {
          const temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
      }
    }
    return array;
  }

  convertirTextoAObjeto(texto) {
    // Reemplaza JSON.parse - convierte texto JSON a objeto
    return JSON.parse(texto);
  }

  convertirObjetoATexto(objeto) {
    // Reemplaza JSON.stringify - convierte objeto a texto JSON
    return JSON.stringify(objeto);
  }

  obtenerEmojiPosicion(posicion) {
    if (posicion === 'arquero') return '🧤';
    if (posicion === 'defensa') return '🛡️';
    if (posicion === 'mediocampista') return '⚙️';
    if (posicion === 'delantero') return '⚡';
    return '⚽';
  }

  mostrarToast(mensaje, tipo) {
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    const bsToast = new bootstrap.Toast(toast);
    
    toast.classList.remove('bg-success', 'bg-danger', 'bg-warning');
    
    if (tipo === 'success') toast.classList.add('bg-success');
    else if (tipo === 'danger') toast.classList.add('bg-danger');
    else if (tipo === 'warning') toast.classList.add('bg-warning');
    
    toastMessage.textContent = mensaje;
    bsToast.show();
  }
}

// ============================================
// CLASE EQUIPO
// ============================================
class Equipo {
  constructor() {
    this.jugadores = [];
    this.presupuestoInicial = 100;
    this.presupuestoDisponible = 100;
    this.formacion = '4-4-2';
    
    this.LIMITES = {
      arquero: 2,
      defensa: 6,
      mediocampista: 6,
      delantero: 4
    };
    
    this.TOTAL_JUGADORES = 18;
  }

  agregarJugador(jugador) {
    // Verificar si ya está
    if (this.tieneJugador(jugador.id)) {
      return { exito: false, mensaje: 'El jugador ya está en tu equipo' };
    }
    
    // Verificar presupuesto
    if (this.presupuestoDisponible < jugador.precio) {
      return { exito: false, mensaje: 'Presupuesto insuficiente' };
    }
    
    // Verificar total
    if (this.jugadores.length >= this.TOTAL_JUGADORES) {
      return { exito: false, mensaje: 'Ya tenés ' + this.TOTAL_JUGADORES + ' jugadores' };
    }
    
    // Verificar límite por posición
    const cantidad = this.contarPosicion(jugador.posicion);
    if (cantidad >= this.LIMITES[jugador.posicion]) {
      return { exito: false, mensaje: 'Límite de ' + this.LIMITES[jugador.posicion] + ' ' + jugador.posicion + 's alcanzado' };
    }
    
    // Agregar
    this.jugadores.push(jugador);
    this.presupuestoDisponible -= jugador.precio;
    
    return { exito: true };
  }

  eliminarJugador(idJugador) {
    for (let i = 0; i < this.jugadores.length; i++) {
      if (this.jugadores[i].id === idJugador) {
        const jugador = this.jugadores[i];
        this.presupuestoDisponible += jugador.precio;
        
        // Eliminar del array
        const nuevoArray = [];
        for (let j = 0; j < this.jugadores.length; j++) {
          if (j !== i) {
            nuevoArray.push(this.jugadores[j]);
          }
        }
        this.jugadores = nuevoArray;
        
        return jugador;
      }
    }
    return null;
  }

  tieneJugador(idJugador) {
    for (let i = 0; i < this.jugadores.length; i++) {
      if (this.jugadores[i].id === idJugador) {
        return true;
      }
    }
    return false;
  }

  contarPosicion(posicion) {
    let contador = 0;
    for (let i = 0; i < this.jugadores.length; i++) {
      if (this.jugadores[i].posicion === posicion) {
        contador++;
      }
    }
    return contador;
  }

  contarPorPosicion() {
    return {
      arquero: this.contarPosicion('arquero'),
      defensa: this.contarPosicion('defensa'),
      mediocampista: this.contarPosicion('mediocampista'),
      delantero: this.contarPosicion('delantero')
    };
  }

  estaCompleto() {
    if (this.jugadores.length !== this.TOTAL_JUGADORES) {
      return false;
    }
    
    const contadores = this.contarPorPosicion();
    
    return contadores.arquero === this.LIMITES.arquero &&
           contadores.defensa === this.LIMITES.defensa &&
           contadores.mediocampista === this.LIMITES.mediocampista &&
           contadores.delantero === this.LIMITES.delantero;
  }

  limpiar() {
    this.jugadores = [];
    this.presupuestoDisponible = this.presupuestoInicial;
  }
}

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================
let gestor;

document.addEventListener('DOMContentLoaded', () => {
  gestor = new GestorSeleccion();
});

console.log('📝 Sistema de selección cargado ');