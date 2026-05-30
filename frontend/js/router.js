import { closeMenu } from './components/sidebar.js';
import { renderTransacoes } from './components/transacoes.js';  
import { renderDashboard } from './components/dashboard.js';
import { renderConfig } from './components/config.js';

export function navigate(page) {
  console.log("Ir para:", page);
  closeMenu(); 

  switch (page) {
    case 'transacoes':
      renderTransacoes();
      break;

    case 'dashboard':
      renderDashboard();
      break;

    case 'config':
      renderConfig();
      break;

    default:
      console.warn('Página não encontrada:', page);
  }
}

window.navigate = navigate;