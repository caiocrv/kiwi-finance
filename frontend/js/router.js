import { closeMenu } from './components/sidebar.js';
import { renderTransacoes } from './components/transacoes.js';  

export function navigate(page) {

  console.log("Ir para:", page);


  closeMenu(); 

    switch (page) {

        case 'transacoes':
            renderTransacoes();
            break;

        case 'dashboard':
            console.log('Dashboard ainda não implementado');
            break;

        case 'config':
            console.log('Config ainda não implementado');
            break;

        default:
            console.warn('Página não encontrada:', page);
    }
}

window.navigate = navigate;