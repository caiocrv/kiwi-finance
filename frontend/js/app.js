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

const token = requireAuthentication();

if (token) {
  setupLogout();
  loadUser();
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

    document.getElementById('user-name').textContent = user.nome || 'Usuario';
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
