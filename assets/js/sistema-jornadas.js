// ============================================
// SISTEMA DE SIMULACIÓN DE JORNADAS
// Sistema completo para generar estadísticas realistas
// ============================================

class SistemaJornadas {
  constructor() {
    this.jornadaActual = this.obtenerJornadaActual();
    this.historialJornadas = this.cargarHistorial();
  }

  // ============================================
  // OBTENER JORNADA ACTUAL
  // ============================================
  obtenerJornadaActual() {
    const historial = this.cargarHistorial();
    if (!historial || historial.length === 0) {
      return 1;
    }
    // Math.max: Encuentra el valor máximo en un array
    return Math.max(...historial.map(j => j.numeroJornada)) + 1;
  }

  // ============================================
  // CARGAR HISTORIAL DESDE LOCALSTORAGE
  // ============================================
  cargarHistorial() {
    const historial = localStorage.getItem('historialJornadas');
    return historial ? JSON.parse(historial) : [];
  }

  // ============================================
  // GUARDAR HISTORIAL EN LOCALSTORAGE
  // ============================================
  guardarHistorial(jornada) {
    const historial = this.cargarHistorial();
    historial.push(jornada);
    localStorage.setItem('historialJornadas', JSON.stringify(historial));
  }

  // ============================================
  // SIMULAR JORNADA COMPLETA
  // ============================================
  simularJornada(jugadores) {
    if (!jugadores || jugadores.length === 0) {
      console.error('No hay jugadores para simular');
      return null;
    }

    const resultadosJornada = {
      numeroJornada: this.jornadaActual,
      fecha: new Date().toISOString(),
      resultados: []
    };

    // Simular estadísticas para cada jugador
    jugadores.forEach(jugador => {
      const stats = this.generarEstadisticas(jugador);
      const puntos = this.calcularPuntos(stats, jugador.posicion);
      
      resultadosJornada.resultados.push({
        jugadorId: jugador.id,
        nombre: jugador.nombre,
        posicion: jugador.posicion,
        equipo: jugador.equipo,
        estadisticas: stats,
        puntos: puntos
      });
    });

    // Calcular puntos totales
    resultadosJornada.puntosTotal = resultadosJornada.resultados.reduce(
      (total, r) => total + r.puntos, 0
    );

    // Guardar en historial
    this.guardarHistorial(resultadosJornada);
    this.jornadaActual++;

    console.log(`✅ Jornada ${resultadosJornada.numeroJornada} simulada:`, resultadosJornada);
    return resultadosJornada;
  }

  // ============================================
  // GENERAR ESTADÍSTICAS SEGÚN POSICIÓN
  // ============================================
  generarEstadisticas(jugador) {
    const base = jugador.puntosPromedio || 7.5;
    const posicion = jugador.posicion;

    switch(posicion) {
      case 'arquero':
        return this.statsArquero(base);
      case 'defensa':
        return this.statsDefensa(base);
      case 'mediocampista':
        return this.statsMediocampista(base);
      case 'delantero':
        return this.statsDelantero(base);
      default:
        return this.statsGenerico(base);
    }
  }

  // ============================================
  // ESTADÍSTICAS POR POSICIÓN
  // ============================================
  
  statsArquero(base) {
    return {
      atajadas: this.randomWeighted(3, 8, base / 10),
      golesRecibidos: this.randomWeighted(0, 3, (10 - base) / 10),
      penalesAtajados: this.randomChance(0.05) ? 1 : 0, // 5% chance
      tarjetasAmarillas: this.randomChance(0.15) ? 1 : 0,
      tarjetasRojas: this.randomChance(0.02) ? 1 : 0
    };
  }

  statsDefensa(base) {
    return {
      interceptaciones: this.randomWeighted(2, 6, base / 8),
      despejes: this.randomWeighted(3, 8, base / 8),
      duelos: this.randomWeighted(4, 10, base / 8),
      goles: this.randomChance(0.08) ? 1 : 0, // 8% chance
      asistencias: this.randomChance(0.10) ? 1 : 0, // 10% chance
      tarjetasAmarillas: this.randomChance(0.25) ? 1 : 0,
      tarjetasRojas: this.randomChance(0.05) ? 1 : 0
    };
  }

  statsMediocampista(base) {
    return {
      pases: this.randomWeighted(30, 80, base / 7),
      pasesCompletos: this.randomWeighted(25, 70, base / 7),
      recuperaciones: this.randomWeighted(3, 8, base / 8),
      goles: this.randomWeighted(0, 2, base / 10),
      asistencias: this.randomWeighted(0, 2, base / 9),
      tiros: this.randomWeighted(1, 4, base / 8),
      tarjetasAmarillas: this.randomChance(0.20) ? 1 : 0,
      tarjetasRojas: this.randomChance(0.03) ? 1 : 0
    };
  }

  statsDelantero(base) {
    return {
      goles: this.randomWeighted(0, 3, base / 5),
      asistencias: this.randomWeighted(0, 2, base / 8),
      tiros: this.randomWeighted(2, 7, base / 7),
      tirosAPuerta: this.randomWeighted(1, 5, base / 8),
      regates: this.randomWeighted(2, 6, base / 8),
      faltasRecibidas: this.randomWeighted(1, 4, base / 9),
      tarjetasAmarillas: this.randomChance(0.18) ? 1 : 0,
      tarjetasRojas: this.randomChance(0.03) ? 1 : 0
    };
  }

  statsGenerico(base) {
    return {
      participacion: this.randomWeighted(50, 90, base / 10),
      tarjetasAmarillas: this.randomChance(0.15) ? 1 : 0,
      tarjetasRojas: this.randomChance(0.02) ? 1 : 0
    };
  }

  // ============================================
  // CALCULAR PUNTOS SEGÚN ESTADÍSTICAS
  // ============================================
  calcularPuntos(stats, posicion) {
    let puntos = 5; // Base por jugar

    // Puntos comunes
    if (stats.goles) puntos += stats.goles * 5;
    if (stats.asistencias) puntos += stats.asistencias * 3;
    if (stats.tarjetasAmarillas) puntos -= stats.tarjetasAmarillas * 1;
    if (stats.tarjetasRojas) puntos -= stats.tarjetasRojas * 3;

    // Puntos específicos por posición
    switch(posicion) {
      case 'arquero':
        if (stats.atajadas) puntos += Math.floor(stats.atajadas / 3) * 1;
        if (stats.golesRecibidos === 0) puntos += 4; // Valla invicta
        if (stats.golesRecibidos >= 3) puntos -= 2;
        if (stats.penalesAtajados) puntos += 5;
        break;

      case 'defensa':
        if (stats.interceptaciones) puntos += Math.floor(stats.interceptaciones / 2);
        if (stats.despejes) puntos += Math.floor(stats.despejes / 3);
        break;

      case 'mediocampista':
        if (stats.recuperaciones) puntos += Math.floor(stats.recuperaciones / 3);
        const porcentajePases = stats.pasesCompletos / stats.pases;
        if (porcentajePases >= 0.85) puntos += 2;
        break;

      case 'delantero':
        if (stats.tirosAPuerta) puntos += Math.floor(stats.tirosAPuerta / 2);
        if (stats.regates >= 3) puntos += 1;
        break;
    }

    // Math.max: Asegura que los puntos no sean negativos
    return Math.max(0, Math.round(puntos * 10) / 10);
  }

  // ============================================
  // UTILIDADES DE ALEATORIEDAD
  // ============================================
  
  // Número aleatorio ponderado por peso
  randomWeighted(min, max, weight = 1) {
    // Math.random: Genera número decimal entre 0 y 1
    const rand = Math.random() * weight;
    // Math.floor: Redondea hacia abajo
    return Math.floor(rand * (max - min + 1)) + min;
  }

  // Chance de que algo ocurra (probabilidad entre 0 y 1)
  randomChance(probability) {
    return Math.random() < probability;
  }

  // ============================================
  // OBTENER HISTORIAL DE JORNADAS
  // ============================================
  obtenerHistorial(numeroJornada = null) {
    const historial = this.cargarHistorial();
    
    if (numeroJornada) {
      // find: Busca el primer elemento que cumple la condición
      return historial.find(j => j.numeroJornada === numeroJornada);
    }
    
    return historial;
  }

  // ============================================
  // OBTENER ESTADÍSTICAS DE UN JUGADOR
  // ============================================
  obtenerEstadisticasJugador(jugadorId) {
    const historial = this.cargarHistorial();
    const estadisticasJugador = [];

    historial.forEach(jornada => {
      // find: Busca el resultado del jugador en esa jornada
      const resultado = jornada.resultados.find(r => r.jugadorId === jugadorId);
      if (resultado) {
        estadisticasJugador.push({
          jornada: jornada.numeroJornada,
          fecha: jornada.fecha,
          ...resultado
        });
      }
    });

    return estadisticasJugador;
  }

  // ============================================
  // CALCULAR ESTADÍSTICAS TOTALES DE JUGADOR
  // ============================================
  calcularTotalesJugador(jugadorId) {
    const estadisticas = this.obtenerEstadisticasJugador(jugadorId);
    
    if (estadisticas.length === 0) {
      return null;
    }

    const totales = {
      jornadasJugadas: estadisticas.length,
      puntosTotal: 0,
      puntosPromedio: 0,
      golesTotal: 0,
      asistenciasTotal: 0
    };

    estadisticas.forEach(stat => {
      totales.puntosTotal += stat.puntos;
      if (stat.estadisticas.goles) totales.golesTotal += stat.estadisticas.goles;
      if (stat.estadisticas.asistencias) totales.asistenciasTotal += stat.estadisticas.asistencias;
    });

    totales.puntosPromedio = (totales.puntosTotal / totales.jornadasJugadas).toFixed(2);

    return totales;
  }

  // ============================================
  // RESETEAR HISTORIAL (para testing)
  // ============================================
  resetearHistorial() {
    localStorage.removeItem('historialJornadas');
    this.historialJornadas = [];
    this.jornadaActual = 1;
    console.log('✅ Historial reseteado');
  }

  // ============================================
  // OBTENER RANKING DE JUGADORES
  // ============================================
  obtenerRankingJugadores(jugadores) {
    const ranking = [];

    jugadores.forEach(jugador => {
      const totales = this.calcularTotalesJugador(jugador.id);
      if (totales) {
        ranking.push({
          ...jugador,
          ...totales
        });
      }
    });

    // sort: Ordena el array (mayor a menor por puntos totales)
    ranking.sort((a, b) => b.puntosTotal - a.puntosTotal);

    return ranking;
  }
}

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
if (typeof window !== 'undefined') {
  window.SistemaJornadas = SistemaJornadas;
  console.log('✅ SistemaJornadas cargado globalmente');
}

// Para Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SistemaJornadas;
}