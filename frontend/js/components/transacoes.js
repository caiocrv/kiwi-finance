export async function renderTransacoes() {
    const container = document.querySelector('#conteudo');

    try {
        const response = await fetch('./views/transacoes.html');
        const html = await response.text();

        container.innerHTML = html;
        inicializarFiltro();

    } catch (error) {
        console.error('Erro ao carregar a tela de transações:', error);
    }
}
window.renderTransacoes = renderTransacoes;

/* Analisar */

import { openModal, closeModal } from "./modal.js";

export async function abrirModalTransacao() {
  const response = await fetch("/frontend/views/modal.html");
  const html = await response.text();

  openModal(html);
}

window.abrirModalTransacao = abrirModalTransacao;
window.fecharModal = closeModal;


function inicializarFiltro(){
    const filtroBtn = document.getElementById("filtro-btn");
    const filtroOpcoes = document.getElementById("filtro-opcoes");
    const filtroTexto = document.getElementById("filtro-texto");
    const opcoes = filtroOpcoes.querySelectorAll("li");


    filtroBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        filtroOpcoes.classList.toggle("active");
    });


    opcoes.forEach((opcao) => {
        opcao.addEventListener("click", () => {
            filtroTexto.textContent = opcao.textContent;
            filtroOpcoes.classList.remove("active");
        });
    });


    document.addEventListener("click", (e) => {
        const clicouFora =
            !filtroOpcoes.contains(e.target) &&
            !filtroBtn.contains(e.target);

        if (clicouFora) {
            filtroOpcoes.classList.remove("active");
        }
    });
}