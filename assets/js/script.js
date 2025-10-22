
/*Preloader*/
document.addEventListener("DOMContentLoaded", async () => {

const preloader = document.getElementById("preloader");
// Simula carga
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Oculta el preloader
  preloader.style.opacity = "0";
  preloader.style.transition = "opacity 0.5s ease";

  setTimeout(() => {
    preloader.style.display = "none";
  }, 500);});