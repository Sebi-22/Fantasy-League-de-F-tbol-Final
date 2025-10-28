document.addEventListener('DOMContentLoaded', () => {
	// Si no está logueado, redirigir al login
	if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
		// Redirigir al login y pasar la página de origen para posible retorno
		window.location.href = 'login.html';
		return;
	}

	// Mostrar mensaje de bienvenida con el nombre del usuario
	const welcomeMsg = document.getElementById('welcomeMsg');
	const sessionTitle = document.getElementById('pageTitle');
	const s = (typeof getSession === 'function') ? getSession() : null;

	const name = s && (s.name || s.email) ? (s.name || s.email) : 'Jugador';
	if (welcomeMsg) {
		welcomeMsg.textContent = `¡Bienvenido, ${name}! Aquí podés gestionar tu equipo y participar en la liga.`;
	}
	if (sessionTitle) {
		sessionTitle.textContent = 'Panel del juego';
	}
});