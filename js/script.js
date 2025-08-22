// evento para deixar o navbar transparente ao rolar
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) { 
    navbar.classList.add('transparent'); // fica transparente
  } else {
    navbar.classList.remove('transparent'); // volta ao sólido no topo
  }
});


// Menu hamburguer para mobile
const hamburgerBtn = document.querySelector('.hamburger');
const nav = document.querySelector('.navbar');
const menuLinks = document.querySelectorAll('.navbar a');

function closeNavbar() {
  nav.classList.remove('open');
}

if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
  // Fecha o menu ao clicar em um link
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeNavbar();
    });
  });
}