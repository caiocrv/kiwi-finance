import { toggleMenu } from './components/sidebar.js';
import { navigate } from './router.js';
import {
  authenticatedRequest,
  getAuthToken,
  logout,
  requireAuthentication
} from './api.js';
import './components/transacoes.js';

window.toggleMenu = toggleMenu;
window.navigate = navigate;

import { aplicarTemaDarkMode } from './components/config.js';

const token = requireAuthentication();

if (token) {
  setupLogout();
  loadUser();

  // Aplica tema Dark Mode se ativo nas preferências
  const isDarkMode = localStorage.getItem("pref_dark_mode") === "true";
  aplicarTemaDarkMode(isDarkMode);

  // Abre a dashboard por padrão ao iniciar
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page') || 'dashboard';
  navigate(page);
}

function getTokenEmail() {
  const [, payload] = (getAuthToken() || '').split('.');

  if (!payload) {
    return 'Sessao autenticada';
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const claims = JSON.parse(atob(padded));

    return (
      claims.email ||
      claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      'Sessao autenticada'
    );
  } catch {
    return 'Sessao autenticada';
  }
}

async function loadUser() {
  try {
    const user = await authenticatedRequest('/api/Usuario/me');

    const savedNome = localStorage.getItem("config_user_nome");
    document.getElementById('user-name').textContent = savedNome || user.nome || 'Usuario';
    document.getElementById('user-email').textContent = getTokenEmail();
  } catch {
    // O redirecionamento ja foi tratado pelo helper de autenticacao.
  }
}

function setupLogout() {
  const logoutButton = document.getElementById('logout-button');

  if (!logoutButton) {
    return;
  }

  logoutButton.addEventListener('click', () => {
    logout();
  });
}
