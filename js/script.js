const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) { 
    navbar.classList.add('transparent'); // fica transparente
  } else {
    navbar.classList.remove('transparent'); // volta ao sólido no topo
  }
});
