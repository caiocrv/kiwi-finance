export async function renderTransacoes() {
    const container = document.querySelector('#conteudo');

    try {
        const response = await fetch('./views/transacoes.html');
        const html = await response.text();

        container.innerHTML = html;

    } catch (error) {
        console.error('Erro ao carregar a tela de transações:', error);
    }
}
window.renderTransacoes = renderTransacoes;