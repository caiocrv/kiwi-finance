import { authenticatedRequest } from "../api.js";
import {
  openModal,
  closeModal,
  inicializarTipoTransacao,
  inicializarMascaraValor,
  inicializarCategorias,
  inicializarRegistroTransacao,
} from "./modal.js";

// ── Renderização da página de transações ──

export async function renderTransacoes() {
  const container = document.querySelector("#conteudo");

  try {
    const response = await fetch("./views/transacoes.html");
    const html = await response.text();

    container.innerHTML = html;
    inicializarFiltro();
    await carregarTransacoes();
  } catch (error) {
    console.error("Erro ao carregar a tela de transações:", error);
  }
}
window.renderTransacoes = renderTransacoes;

// ── Carregar transações e resumo do backend ──

let localTransacoes = [];
let localCategorias = [];

export async function carregarTransacoes() {
  try {
    const [transacoes, resumo, categorias] = await Promise.all([
      authenticatedRequest("/api/Transacao"),
      authenticatedRequest("/api/Transacao/resumo"),
      authenticatedRequest("/api/Categoria"),
    ]);

    localTransacoes = transacoes;
    localCategorias = categorias;

    renderizarTabela(localTransacoes, localCategorias);
    atualizarResumo(localTransacoes.length, resumo);
    inicializarBusca();
  } catch (error) {
    console.error("Erro ao carregar transações:", error);
  }
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarData(dataISO) {
  const data = new Date(dataISO);
  return data.toLocaleDateString("pt-BR");
}

function renderizarTabela(transacoes, categorias = []) {
  const tbody = document.getElementById("lista-transacoes");
  if (!tbody) return;

  if (transacoes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 32px; opacity: 0.6;">
          Nenhuma transação encontrada.
        </td>
      </tr>
    `;
    return;
  }

  // Ordena por data (mais recente primeiro)
  const transacoesOrdenadas = [...transacoes].sort(
    (a, b) => new Date(b.dataTransacao) - new Date(a.dataTransacao)
  );

  tbody.innerHTML = transacoesOrdenadas
    .map(
      (t, index) => {
        const cat = categorias.find((c) => c.id === t.categoriaId);
        const categoriaNome = cat ? cat.nome : "—";
        return `
        <tr class="linha-transacao">
          <td>${index + 1}</td>
          <td>${categoriaNome}</td>
          <td>${t.descricao || "-"}</td>
          <td>${formatarData(t.dataTransacao)}</td>
          <td class="${t.tipo === "Despesa" ? "valor-despesa" : "valor-receita"}">
            ${t.tipo === "Despesa" ? "- " : "+ "}${formatarMoeda(t.valor)}
          </td>
        </tr>
      `;
      }
    )
    .join("");
}

function atualizarResumo(totalCount, resumo) {
  const elTotal = document.getElementById("total-transacoes");
  const elEntradas = document.getElementById("total-entradas");
  const elSaidas = document.getElementById("total-saidas");
  const elSaldo = document.getElementById("saldo-total");

  if (elTotal) elTotal.textContent = totalCount;
  if (elEntradas) elEntradas.textContent = formatarMoeda(resumo.totalReceitas);
  if (elSaidas) elSaidas.textContent = formatarMoeda(resumo.totalDespesas);
  if (elSaldo) elSaldo.textContent = formatarMoeda(resumo.saldoTotal);
}

// ── Modal de nova transação ──

export async function abrirModalTransacao() {
  const response = await fetch("/frontend/views/modal.html");
  const html = await response.text();

  openModal(html);
  inicializarTipoTransacao();
  inicializarMascaraValor();
  inicializarCategorias();
  inicializarRegistroTransacao(carregarTransacoes);
}

window.abrirModalTransacao = abrirModalTransacao;
window.fecharModal = closeModal;

// ── Filtros e Busca ──

function inicializarBusca() {
  const inputBusca = document.querySelector(".input-busca");
  if (!inputBusca) return;

  // Remove event listeners anteriores clonando o elemento
  const novoInputBusca = inputBusca.cloneNode(true);
  inputBusca.parentNode.replaceChild(novoInputBusca, inputBusca);

  novoInputBusca.addEventListener("input", (e) => {
    aplicarFiltrosEBusca();
  });
}

function inicializarFiltro() {
  const filtroBtn = document.getElementById("filtro-btn");
  const filtroOpcoes = document.getElementById("filtro-opcoes");
  const filtroTexto = document.getElementById("filtro-texto");
  const opcoes = filtroOpcoes.querySelectorAll("li");

  filtroBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    filtroOpcoes.classList.toggle("active");
    filtroBtn.classList.toggle("active");
  });

  opcoes.forEach((opcao) => {
    opcao.addEventListener("click", () => {
      filtroTexto.textContent = opcao.textContent;
      filtroBtn.dataset.dias = opcao.dataset.value;
      filtroOpcoes.classList.remove("active");
      filtroBtn.classList.remove("active");
      aplicarFiltrosEBusca();
    });
  });

  document.addEventListener("click", (e) => {
    const clicouFora =
      !filtroOpcoes.contains(e.target) && !filtroBtn.contains(e.target);

    if (clicouFora) {
      filtroOpcoes.classList.remove("active");
      filtroBtn.classList.remove("active");
    }
  });
}

function aplicarFiltrosEBusca() {
  const inputBusca = document.querySelector(".input-busca");
  const filtroBtn = document.getElementById("filtro-btn");
  
  const termo = inputBusca ? inputBusca.value.toLowerCase().trim() : "";
  const diasRaw = filtroBtn ? filtroBtn.dataset.dias : null;
  const dias = diasRaw && !isNaN(diasRaw) && diasRaw !== "all" ? parseInt(diasRaw) : null;

  let transacoesFiltradas = [...localTransacoes];

  // 1. Filtrar por Dias
  if (dias) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limite = new Date();
    limite.setDate(hoje.getDate() - dias);
    limite.setHours(0, 0, 0, 0);

    transacoesFiltradas = transacoesFiltradas.filter((t) => {
      const dt = new Date(t.dataTransacao);
      const dataLocal = new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
      return dataLocal >= limite;
    });
  }

  // 2. Filtrar por Categoria (Busca)
  if (termo) {
    transacoesFiltradas = transacoesFiltradas.filter((t) => {
      const cat = localCategorias.find((c) => c.id === t.categoriaId);
      const catNome = cat ? cat.nome.toLowerCase() : "";
      return catNome.includes(termo);
    });
  }

  renderizarTabela(transacoesFiltradas, localCategorias);
}