// ============================================
// SISTEMA DE SIMULACIÓN DE JORNADAS
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
    
    // Buscar el número de jornada más alto
    let maxJornada = 0;
    for (let i = 0; i < historial.length; i++) {
      if (historial[i].numeroJornada > maxJornada) {
        maxJornada = historial[i].numeroJornada;
      }
    }
    return maxJornada + 1;
  }

  // ============================================
  // CARGAR HISTORIAL DESDE LOCALSTORAGE
  // ============================================
  cargarHistorial() {
    const historialTexto = localStorage.getItem('historialJornadas');
    if (!historialTexto) {
      return [];
    }
    
    try {
      // Convertir texto a objeto
      const historial = JSON.parse(historialTexto);
      return historial;
    } catch (error) {
      console.error('Error al cargar historial:', error);
      return [];
    }
  }

  // ============================================
  // GUARDAR HISTORIAL EN LOCALSTORAGE
  // ============================================
  guardarHistorial(jornada) {
    const historial = this.cargarHistorial();
    historial.push(jornada);
    
    // Convertir objeto a texto
    const historialTexto = JSON.stringify(historial);
    localStorage.setItem('historialJornadas', historialTexto);
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
      fecha: new Date().toString(),
      resultados: []
    };

    // Simular estadísticas para cada jugador
    for (let i = 0; i < jugadores.length; i++) {
      const jugador = jugadores[i];
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
    }

    // Calcular puntos totales
    let puntosTotal = 0;
    for (let i = 0; i < resultadosJornada.resultados.length; i++) {
      puntosTotal = puntosTotal + resultadosJornada.resultados[i].puntos;
    }
    resultadosJornada.puntosTotal = puntosTotal;

    // Guardar en historial
    this.guardarHistorial(resultadosJornada);
    this.jornadaActual = this.jornadaActual + 1;

    console.log('✅ Jornada simulada:', resultadosJornada.numeroJornada);
    return resultadosJornada;
  }

  // ============================================
  // GENERAR ESTADÍSTICAS SEGÚN POSICIÓN
  // ============================================
  generarEstadisticas(jugador) {
    const base = jugador.puntosPromedio || 7.5;
    const posicion = jugador.posicion;

    if (posicion === 'arquero') {
      return this.statsArquero(base);
    } else if (posicion === 'defensa') {
      return this.statsDefensa(base);
    } else if (posicion === 'mediocampista') {
      return this.statsMediocampista(base);
    } else if (posicion === 'delantero') {
      return this.statsDelantero(base);
    } else {
      return this.statsGenerico(base);
    }
  }

  // ============================================
  // ESTADÍSTICAS POR POSICIÓN
  // ============================================
  
  statsArquero(base) {
    return {
      atajadas: this.randomWeighted(1, 10, base / 10),
      golesRecibidos: this.randomWeighted(0, 3, (10 - base) / 10),
      penalesAtajados: this.randomChance(0.05) ? 1 : 0,
      tarjetasAmarillas: this.randomChance(0.15) ? 1 : 0,
      tarjetasRojas: this.randomChance(0.02) ? 1 : 0
    };
  }

  statsDefensa(base) {
    return {
      interceptaciones: this.randomWeighted(2, 6, base / 8),
      despejes: this.randomWeighted(3, 8, base / 8),
      duelos: this.randomWeighted(4, 10, base / 8),
      goles: this.randomChance(0.08) ? 1 : 0,
      asistencias: this.randomChance(0.10) ? 1 : 0,
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
    if (stats.goles) {
      puntos = puntos + (stats.goles * 5);
    }
    if (stats.asistencias) {
      puntos = puntos + (stats.asistencias * 3);
    }
    if (stats.tarjetasAmarillas) {
      puntos = puntos - (stats.tarjetasAmarillas * 1);
    }
    if (stats.tarjetasRojas) {
      puntos = puntos - (stats.tarjetasRojas * 3);
    }

    // Puntos específicos por posición
    if (posicion === 'arquero') {
      if (stats.atajadas) {
        const puntosAtajadas = Math.floor(stats.atajadas / 3) * 1;
        puntos = puntos + puntosAtajadas;
      }
      if (stats.golesRecibidos === 0) {
        puntos = puntos + 4; // Valla invicta
      }
      if (stats.golesRecibidos >= 3) {
        puntos = puntos - 2;
      }
      if (stats.penalesAtajados) {
        puntos = puntos + 5;
      }
    } else if (posicion === 'defensa') {
      if (stats.interceptaciones) {
        puntos = puntos + Math.floor(stats.interceptaciones / 2);
      }
      if (stats.despejes) {
        puntos = puntos + Math.floor(stats.despejes / 3);
      }
    } else if (posicion === 'mediocampista') {
      if (stats.recuperaciones) {
        puntos = puntos + Math.floor(stats.recuperaciones / 3);
      }
      if (stats.pases > 0) {
        const porcentajePases = stats.pasesCompletos / stats.pases;
        if (porcentajePases >= 0.85) {
          puntos = puntos + 2;
        }
      }
    } else if (posicion === 'delantero') {
      if (stats.tirosAPuerta) {
        puntos = puntos + Math.floor(stats.tirosAPuerta / 2);
      }
      if (stats.regates >= 3) {
        puntos = puntos + 1;
      }
    }

    // Asegurar que los puntos no sean negativos
    if (puntos < 0) {
      puntos = 0;
    }

    return Math.round(puntos * 10) / 10;
  }

  // ============================================
  // UTILIDADES DE ALEATORIEDAD
  // ============================================
  
  // Número aleatorio ponderado por peso
  randomWeighted(min, max, weight) {
    if (!weight) {
      weight = 1;
    }
    const rand = Math.random() * weight;
    return Math.floor(rand * (max - min + 1)) + min;
  }

  // Chance de que algo ocurra
  randomChance(probability) {
    return Math.random() < probability;
  }

  // ============================================
  // OBTENER HISTORIAL DE JORNADAS
  // ============================================
  obtenerHistorial(numeroJornada) {
    const historial = this.cargarHistorial();
    
    if (numeroJornada) {
      // Buscar jornada específica
      for (let i = 0; i < historial.length; i++) {
        if (historial[i].numeroJornada === numeroJornada) {
          return historial[i];
        }
      }
      return null;
    }
    
    return historial;
  }

  // ============================================
  // OBTENER ESTADÍSTICAS DE UN JUGADOR
  // ============================================
  obtenerEstadisticasJugador(jugadorId) {
    const historial = this.cargarHistorial();
    const estadisticasJugador = [];

    for (let i = 0; i < historial.length; i++) {
      const jornada = historial[i];
      
      // Buscar el resultado del jugador en esa jornada
      for (let j = 0; j < jornada.resultados.length; j++) {
        const resultado = jornada.resultados[j];
        
        if (resultado.jugadorId === jugadorId) {
          estadisticasJugador.push({
            jornada: jornada.numeroJornada,
            fecha: jornada.fecha,
            jugadorId: resultado.jugadorId,
            nombre: resultado.nombre,
            posicion: resultado.posicion,
            equipo: resultado.equipo,
            estadisticas: resultado.estadisticas,
            puntos: resultado.puntos
          });
          break;
        }
      }
    }

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

    for (let i = 0; i < estadisticas.length; i++) {
      const stat = estadisticas[i];
      totales.puntosTotal = totales.puntosTotal + stat.puntos;
      
      if (stat.estadisticas.goles) {
        totales.golesTotal = totales.golesTotal + stat.estadisticas.goles;
      }
      if (stat.estadisticas.asistencias) {
        totales.asistenciasTotal = totales.asistenciasTotal + stat.estadisticas.asistencias;
      }
    }

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

    for (let i = 0; i < jugadores.length; i++) {
      const jugador = jugadores[i];
      const totales = this.calcularTotalesJugador(jugador.id);
      
      if (totales) {
        ranking.push({
          id: jugador.id,
          nombre: jugador.nombre,
          posicion: jugador.posicion,
          equipo: jugador.equipo,
          jornadasJugadas: totales.jornadasJugadas,
          puntosTotal: totales.puntosTotal,
          puntosPromedio: totales.puntosPromedio,
          golesTotal: totales.golesTotal,
          asistenciasTotal: totales.asistenciasTotal
        });
      }
    }

    // Ordenar por puntos totales (mayor a menor)
    for (let i = 0; i < ranking.length - 1; i++) {
      for (let j = 0; j < ranking.length - i - 1; j++) {
        if (ranking[j].puntosTotal < ranking[j + 1].puntosTotal) {
          // Intercambiar posiciones
          const temp = ranking[j];
          ranking[j] = ranking[j + 1];
          ranking[j + 1] = temp;
        }
      }
    }

    return ranking;
  }
}

// ============================================
// HACER DISPONIBLE GLOBALMENTE
// ============================================
if (typeof window !== 'undefined') {
  window.SistemaJornadas = SistemaJornadas;
  console.log('✅ SistemaJornadas cargado globalmente');
}