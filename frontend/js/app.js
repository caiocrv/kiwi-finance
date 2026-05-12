import { toggleMenu } from './components/sidebar.js';
import { navigate } from './router.js';
import './components/transacoes.js';

window.toggleMenu = toggleMenu;
window.navigate = navigate;


function loadUser() {
  const user = {
    nome: "Douglas Borges",
    email: "douglas@email.com"
  };

  document.getElementById("user-name").textContent = user.nome;
  document.getElementById("user-email").textContent = user.email;
}