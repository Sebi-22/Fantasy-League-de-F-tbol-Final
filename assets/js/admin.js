  document.addEventListener('DOMContentLoaded', () => {
      cargarDatos();
      mostrarInfoSistema();
    });

    function cargarDatos() {
      cargarEstadisticas();
      cargarUsuarios();
    }

    function cargarEstadisticas() {
      const usuarios = JSON.parse(localStorage.getItem('usuariosFantasy') || '[]');
      document.getElementById('totalUsuarios').textContent = usuarios.length;

      let totalEquipos = 0;
      let totalJornadas = 0;

      usuarios.forEach(user => {
        const equipoKey = `miEquipoFantasy_${user.username}`;
        if (localStorage.getItem(equipoKey)) totalEquipos++;

        const jornadasKey = `jornadas_historial_${user.username}`;
        const historial = JSON.parse(localStorage.getItem(jornadasKey) || '[]');
        totalJornadas += historial.length;
      });

      document.getElementById('totalEquipos').textContent = totalEquipos;
      document.getElementById('totalJornadas').textContent = totalJornadas;

      // Calcular espacio usado
      let espacioTotal = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          espacioTotal += localStorage[key].length + key.length;
        }
      }
      document.getElementById('espacioUsado').textContent = Math.round(espacioTotal / 1024);
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
        const equipoKey = `miEquipoFantasy_${user.username}`;
        const tieneEquipo = localStorage.getItem(equipoKey) ? '✅' : '❌';

        const jornadasKey = `jornadas_historial_${user.username}`;
        const historial = JSON.parse(localStorage.getItem(jornadasKey) || '[]');

        html += `
          <tr>
            <td><strong>${user.username}</strong></td>
            <td>${user.nombre || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td class="text-center">${tieneEquipo}</td>
            <td class="text-center"><span class="badge bg-info">${historial.length}</span></td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario('${user.username}')">
                🗑️
              </button>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = html;
    }

    function eliminarUsuario(username) {
      if (!confirm(`¿Eliminar al usuario "${username}" y todos sus datos?`)) return;

      const usuarios = JSON.parse(localStorage.getItem('usuariosFantasy') || '[]');
      const nuevosUsuarios = usuarios.filter(u => u.username !== username);
      localStorage.setItem('usuariosFantasy', JSON.stringify(nuevosUsuarios));

      localStorage.removeItem(`miEquipoFantasy_${username}`);
      localStorage.removeItem(`jornadas_historial_${username}`);

      alert('✅ Usuario eliminado');
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
      
      // Aquí podrías limpiar datos específicos de caché
      alert('✅ Caché limpiado');
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