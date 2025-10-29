// ========================================
// FANTASY LEAGUE - SISTEMA DE SELECCIÓN
// Wizard de 3 pasos con validaciones
// ========================================

class EquipoSeleccion {
    constructor() {
        this.jugadoresDisponibles = [];
        this.presupuestoMaximo = 100;
        this.presupuestoDisponible = 100;
        this.pasoActual = 1;
        
        // Límites por paso
        this.limitesPorPaso = {
            1: {
                total: 11,
                ARQ: 1,
                DEF: 4,
                MED: 4,
                DEL: 2
            },
            2: {
                total: 7,
                ARQ: 1,
                DEF: 2,
                MED: 2,
                DEL: 2
            },
            3: {
                total: 4,
                ARQ: 10,
                DEF: 10,
                MED: 10,
                DEL: 10
            }
        };

        this.equiposPorPaso = {
            1: [],
            2: [],
            3: []
        };
    }

    async cargarJugadores() {
        try {
            const response = await fetch('../assets/data/base-de-datos-jugadores.json');
            if (!response.ok) throw new Error('Error al cargar jugadores');
            const data = await response.json();
            
            // Transformar los jugadores al formato esperado
            this.jugadoresDisponibles = data.jugadores.map(j => ({
                id: j.id,
                nombre: j.nombre,
                equipo: j.equipo,
                posicion: j.posicion.substring(0, 3).toUpperCase(), // Convertir "Delantero" a "DEL", etc.
                puntos: j.puntos,
                promedio: j.promedioPuntos,
                precio: j.valor / 1000000 // Convertir valor a millones
            }));

            // Cargar configuración del juego
            if (data.configuracion) {
                this.presupuestoMaximo = data.configuracion.presupuestoInicial / 1000000;
                this.presupuestoDisponible = this.presupuestoMaximo;
            }

            renderizarJugadores();
            cargarEquipos();
            return true;
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al cargar los jugadores. Por favor recarga la página.', 'danger');
            return false;
        }
    }

    obtenerEquipoActual() {
        return this.equiposPorPaso[this.pasoActual];
    }

    contarPorPosicion(paso = this.pasoActual) {
        const equipo = this.equiposPorPaso[paso];
        return {
            ARQ: equipo.filter(j => j.posicion === 'ARQ').length,
            DEF: equipo.filter(j => j.posicion === 'DEF').length,
            MED: equipo.filter(j => j.posicion === 'MED').length,
            DEL: equipo.filter(j => j.posicion === 'DEL').length
        };
    }

    puedeAgregarJugador(jugador) {
        const equipoActual = this.obtenerEquipoActual();
        const limites = this.limitesPorPaso[this.pasoActual];
        const conteo = this.contarPorPosicion();

        // Verificar si ya está seleccionado en cualquier paso
        const yaSeleccionado = Object.values(this.equiposPorPaso)
            .flat()
            .some(j => j.id === jugador.id);
        
        if (yaSeleccionado) {
            return { puede: false, mensaje: 'Este jugador ya está en tu equipo' };
        }

        // Verificar total
        if (equipoActual.length >= limites.total) {
            return { puede: false, mensaje: 'Ya has alcanzado el límite de jugadores para este paso' };
        }

        // Verificar posición (excepto en paso 3 que son comodines)
        if (this.pasoActual !== 3 && conteo[jugador.posicion] >= limites[jugador.posicion]) {
            const posicionesMap = {
                ARQ: 'arqueros',
                DEF: 'defensores',
                MED: 'mediocampistas',
                DEL: 'delanteros'
            };
            return { 
                puede: false, 
                mensaje: `Ya has alcanzado el límite de ${posicionesMap[jugador.posicion]} para este paso` 
            };
        }

        // Verificar presupuesto
        if (jugador.precio > this.presupuestoDisponible) {
            return { puede: false, mensaje: 'No tenés suficiente presupuesto para este jugador' };
        }

        return { puede: true };
    }

    agregarJugador(jugador) {
        const validacion = this.puedeAgregarJugador(jugador);
        if (!validacion.puede) {
            mostrarAlerta(validacion.mensaje);
            return false;
        }

        this.equiposPorPaso[this.pasoActual].push(jugador);
        this.presupuestoDisponible -= jugador.precio;
        this.actualizarUI();
        
        // Mostrar alerta con el progreso actualizado
        const conteo = this.contarPorPosicion();
        const limites = this.limitesPorPaso[this.pasoActual];
        const faltantes = {
            ARQ: limites.ARQ - conteo.ARQ,
            DEF: limites.DEF - conteo.DEF,
            MED: limites.MED - conteo.MED,
            DEL: limites.DEL - conteo.DEL
        };

        const mensajes = [];
        if (this.pasoActual !== 3) { // No mostrar para comodines
            if (faltantes.ARQ > 0) mensajes.push(`${faltantes.ARQ} arquero${faltantes.ARQ > 1 ? 's' : ''}`);
            if (faltantes.DEF > 0) mensajes.push(`${faltantes.DEF} defensor${faltantes.DEF > 1 ? 'es' : ''}`);
            if (faltantes.MED > 0) mensajes.push(`${faltantes.MED} mediocampista${faltantes.MED > 1 ? 's' : ''}`);
            if (faltantes.DEL > 0) mensajes.push(`${faltantes.DEL} delantero${faltantes.DEL > 1 ? 's' : ''}`);
            
            if (mensajes.length > 0) {
                mostrarAlerta(`Te faltan: ${mensajes.join(', ')}`, 'info');
            } else {
                mostrarAlerta('¡Completaste la selección de esta etapa!', 'success');
            }
        }
        
        return true;
    }

    eliminarJugador(jugadorId) {
        const equipoActual = this.obtenerEquipoActual();
        const index = equipoActual.findIndex(j => j.id === jugadorId);
        
        if (index !== -1) {
            const jugador = equipoActual[index];
            equipoActual.splice(index, 1);
            this.presupuestoDisponible += jugador.precio;
            this.actualizarUI();
        }
    }

    estaCompletoElPaso() {
        const equipoActual = this.obtenerEquipoActual();
        const limites = this.limitesPorPaso[this.pasoActual];
        const conteo = this.contarPorPosicion();

        // En paso 3 (comodines), solo verificar total
        if (this.pasoActual === 3) {
            return equipoActual.length === limites.total;
        }

        // En pasos 1 y 2, verificar cada posición
        return equipoActual.length === limites.total &&
               conteo.ARQ === limites.ARQ &&
               conteo.DEF === limites.DEF &&
               conteo.MED === limites.MED &&
               conteo.DEL === limites.DEL;
    }

    siguientePaso() {
        if (!this.estaCompletoElPaso()) {
            mostrarAlerta('Completá la selección actual antes de continuar');
            return;
        }

        if (this.pasoActual < 3) {
            this.pasoActual++;
            this.actualizarPaso();
            this.actualizarUI();
            renderizarJugadores();
        } else {
            // Finalizar selección
            this.guardarEquipo();
        }
    }

    pasoAnterior() {
        if (this.pasoActual > 1) {
            this.pasoActual--;
            this.actualizarPaso();
            this.actualizarUI();
            renderizarJugadores();
        }
    }

    actualizarPaso() {
        // Actualizar barra de progreso
        const progreso = ((this.pasoActual - 1) / 2) * 80;
        document.getElementById('progressFill').style.width = progreso + '%';

        // Actualizar clases de los steps
        const steps = document.querySelectorAll('.step-item');
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            if (stepNum < this.pasoActual) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNum === this.pasoActual) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('completed', 'active');
            }
        });

        // Actualizar título y descripción
        const titleMap = {
            1: 'Seleccioná tus Titulares',
            2: 'Seleccioná tus Suplentes',
            3: 'Seleccioná tus Comodines'
        };

        const descMap = {
            1: 'Elegí 11 jugadores: 1 arquero, 4 defensores, 4 mediocampistas y 2 delanteros',
            2: 'Elegí 7 suplentes: 1 arquero, 2 defensores, 2 mediocampistas y 2 delanteros',
            3: 'Elegí 4 comodines adicionales para tu equipo'
        };

        document.getElementById('stepTitle').textContent = titleMap[this.pasoActual];
        document.getElementById('stepDescription').textContent = descMap[this.pasoActual];

        // Actualizar navegación
        const btnPrev = document.getElementById('btnPrev');
        const btnNext = document.getElementById('btnNext');

        btnPrev.style.display = this.pasoActual > 1 ? 'block' : 'none';
        btnNext.textContent = this.pasoActual < 3 ? 'Siguiente →' : 'Finalizar';
    }

    actualizarUI() {
        // Actualizar presupuesto
        const budgetDisplay = document.getElementById('budgetDisplay');
        const budgetSpent = document.getElementById('budgetSpent');
        const gastado = this.presupuestoMaximo - this.presupuestoDisponible;

        budgetDisplay.textContent = `$${this.presupuestoDisponible.toFixed(1)}M`;
        budgetSpent.textContent = `Gastado: $${gastado.toFixed(1)}M`;

        // Actualizar contadores del paso actual
        const equipo = this.obtenerEquipoActual();
        const conteo = this.contarPorPosicion();
        const limites = this.limitesPorPaso[this.pasoActual];

        // Calcular totales sumando todos los pasos
        const totalEquipo = {
            ARQ: 0,
            DEF: 0,
            MED: 0,
            DEL: 0,
            total: 0
        };

        // Sumar jugadores de todos los pasos
        Object.values(this.equiposPorPaso).forEach(paso => {
            paso.forEach(jugador => {
                totalEquipo[jugador.posicion]++;
                totalEquipo.total++;
            });
        });

        // Actualizar contadores del paso actual
        this.actualizarContador('playersCount', 'playersRequired', equipo.length, limites.total);
        this.actualizarContador('arqSummary', 'arqRequired', conteo.ARQ, limites.ARQ, totalEquipo.ARQ);
        this.actualizarContador('defSummary', 'defRequired', conteo.DEF, limites.DEF, totalEquipo.DEF);
        this.actualizarContador('medSummary', 'medRequired', conteo.MED, limites.MED, totalEquipo.MED);
        this.actualizarContador('delSummary', 'delRequired', conteo.DEL, limites.DEL, totalEquipo.DEL);

        // Habilitar/deshabilitar botón de siguiente
        document.getElementById('btnNext').disabled = !this.estaCompletoElPaso();

        // Actualizar lista de jugadores seleccionados
        this.renderizarEquipoSeleccionado();
    }

    actualizarContador(summaryId, requiredId, actual, requerido, total = null) {
        const summary = document.getElementById(summaryId);
        if (summary) {
            const valueSpan = summary.querySelector('.summary-value');
            const requiredSpan = document.getElementById(requiredId);
            if (valueSpan && requiredSpan) {
                // Obtener los jugadores del paso actual para esta posición
                const posicionMap = {
                    'arqSummary': 'ARQ',
                    'defSummary': 'DEF',
                    'medSummary': 'MED',
                    'delSummary': 'DEL'
                };

                const posicion = posicionMap[summaryId];
                let jugadoresInfo = '';
                
                if (posicion) {
                    const jugadoresPosicion = this.equiposPorPaso[this.pasoActual]
                        .filter(j => j.posicion === posicion)
                        .map(j => j.nombre)
                        .join(', ');
                    
                    if (jugadoresPosicion) {
                        jugadoresInfo = `: ${jugadoresPosicion}`;
                    }
                }

                // Mostrar el conteo y los nombres
                if (total !== null) {
                    valueSpan.textContent = `${actual}/${requerido}${jugadoresInfo} (Total: ${total})`;
                } else {
                    valueSpan.textContent = `${actual}/${requerido}${jugadoresInfo}`;
                }

                // Actualizar estilo según si está completo o no
                if (actual === requerido) {
                    valueSpan.classList.add('text-success');
                    valueSpan.classList.remove('text-warning');
                } else if (actual > requerido) {
                    valueSpan.classList.add('text-warning');
                    valueSpan.classList.remove('text-success');
                } else {
                    valueSpan.classList.remove('text-success', 'text-warning');
                }

                // Añadir tooltip con la información completa
                if (jugadoresInfo) {
                    valueSpan.title = `Jugadores seleccionados${jugadoresInfo}`;
                }
            }
        }
    }

    renderizarEquipoSeleccionado() {
        const container = document.getElementById('selectedPlayersContainer');
        const equipo = this.obtenerEquipoActual();

        if (equipo.length === 0) {
            container.innerHTML = '<p class="empty-state">Aún no seleccionaste ningún jugador</p>';
            return;
        }

        container.innerHTML = equipo
            .sort((a, b) => {
                const posOrder = { ARQ: 1, DEF: 2, MED: 3, DEL: 4 };
                return posOrder[a.posicion] - posOrder[b.posicion];
            })
            .map(jugador => `
                <div class="selected-player">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="selected-player-info">
                            <span class="selected-player-pos">${jugador.posicion}</span>
                            <span class="selected-player-name">${jugador.nombre}</span>
                        </div>
                        <div class="selected-player-actions">
                            <span class="selected-player-price">$${jugador.precio}M</span>
                            <button class="btn btn-outline-danger btn-sm ms-2" onclick="sistemaSeleccion.eliminarJugador(${jugador.id})">
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
    }

    guardarEquipo() {
        try {
            // Obtener usuario actual usando session.js
            const session = getSession();
            if (!session) {
                mostrarAlerta('Error: No hay una sesión activa', 'danger');
                return;
            }

            const equipo = {
                titulares: this.equiposPorPaso[1],
                suplentes: this.equiposPorPaso[2],
                comodines: this.equiposPorPaso[3],
                presupuestoGastado: this.presupuestoMaximo - this.presupuestoDisponible,
                fechaCreacion: new Date().toISOString()
            };

            // Guardar equipo en localStorage usando el email como identificador
            localStorage.setItem(`equipo_${session.email}`, JSON.stringify(equipo));

            // Mostrar mensaje de éxito y redirigir
            mostrarAlerta('¡Equipo guardado con éxito! Redirigiendo...', 'success');
            setTimeout(() => {
                window.location.href = 'equipo.html';
            }, 1500);

        } catch (error) {
            console.error('Error al guardar equipo:', error);
            mostrarAlerta('Error al guardar el equipo. Por favor intenta de nuevo.', 'danger');
        }
    }
}

// ========================================
// RENDERIZADO DE JUGADORES
// ========================================

function renderizarJugadores() {
    const tbody = document.getElementById('playersTableBody');
    const filtros = obtenerFiltros();
    
    let jugadoresFiltrados = sistemaSeleccion.jugadoresDisponibles.filter(jugador => {
        const matchPosicion = !filtros.posicion || jugador.posicion === filtros.posicion;
        const matchEquipo = !filtros.equipo || jugador.equipo === filtros.equipo;
        const matchBusqueda = !filtros.busqueda || 
                            jugador.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase());
        return matchPosicion && matchEquipo && matchBusqueda;
    });

    if (jugadoresFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <p class="text-white-50 mb-0">No se encontraron jugadores</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = jugadoresFiltrados.map(jugador => {
        const ligaClass = jugador.liga ? `badge bg-secondary me-2` : '';
        const ligaBadge = jugador.liga ? `<span class="${ligaClass}">${jugador.liga}</span>` : '';
        
        return `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="player-info">
                        <div class="player-name">${jugador.nombre}</div>
                        <div class="player-stats text-white-50 small">
                            <span class="me-2">Puntos: ${jugador.puntos || 0}</span>
                            <span>Promedio: ${jugador.promedio.toFixed(1) || 0}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td><span class="badge bg-success">${jugador.posicion}</span></td>
            <td>
                <div class="d-flex align-items-center">
                    <span class="me-2">${jugador.equipo}</span>
                    ${ligaBadge}
                </div>
            </td>
            <td>$${jugador.precio.toFixed(1)}M</td>
            <td>
                <button 
                    class="btn btn-success btn-sm" 
                    onclick="agregarJugador(${jugador.id})"
                    title="Agregar a tu equipo"
                >+</button>
            </td>
        </tr>
    `}).join('');
}

function agregarJugador(jugadorId) {
    const jugador = sistemaSeleccion.jugadoresDisponibles.find(j => j.id === jugadorId);
    if (jugador) {
        sistemaSeleccion.agregarJugador(jugador);
    }
}

function obtenerFiltros() {
    return {
        posicion: document.getElementById('filterPosition').value,
        equipo: document.getElementById('filterTeam').value,
        busqueda: document.getElementById('searchPlayer').value.trim()
    };
}

// ========================================
// UTILIDADES
// ========================================

function mostrarAlerta(mensaje, tipo = 'warning') {
    const container = document.getElementById('alertContainer');
    const alertId = 'alert_' + Date.now();
    
    const tipoClase = {
        'success': 'alert-success-custom',
        'warning': 'alert-warning-custom',
        'danger': 'alert-danger-custom'
    };

    const alert = document.createElement('div');
    alert.id = alertId;
    alert.className = `alert-custom ${tipoClase[tipo] || tipoClase.warning}`;
    alert.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span>${mensaje}</span>
            <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    container.appendChild(alert);
    
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) alertElement.remove();
    }, 5000);
}

function cargarEquipos() {
    const equipos = [...new Set(sistemaSeleccion.jugadoresDisponibles.map(j => j.equipo))].sort();
    const select = document.getElementById('filterTeam');
    
    equipos.forEach(equipo => {
        const option = document.createElement('option');
        option.value = equipo;
        option.textContent = equipo;
        select.appendChild(option);
    });
}

function cerrarSesion() {
    if (confirm('¿Estás seguro que querés cerrar sesión?')) {
        logout(true);
    }
}

// ========================================
// INICIALIZACIÓN
// ========================================

const sistemaSeleccion = new EquipoSeleccion();

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar login usando session.js
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Actualizar UI con datos de la sesión
    const session = getSession();
    document.getElementById('userDisplay').textContent = `👤 ${session.name || session.email}`;

    // Cargar jugadores
    const cargado = await sistemaSeleccion.cargarJugadores();
    if (cargado) {
        renderizarJugadores();
        sistemaSeleccion.actualizarUI();
        sistemaSeleccion.actualizarPaso();
    }

    // Event Listeners - Filtros
    document.getElementById('filterPosition').addEventListener('change', renderizarJugadores);
    document.getElementById('filterTeam').addEventListener('change', renderizarJugadores);
    document.getElementById('searchPlayer').addEventListener('input', renderizarJugadores);

    // Event Listeners - Botones de navegación
    document.getElementById('btnNext').addEventListener('click', () => {
        sistemaSeleccion.siguientePaso();
    });

    document.getElementById('btnPrev').addEventListener('click', () => {
        sistemaSeleccion.pasoAnterior();
    });
});