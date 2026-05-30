import { authenticatedRequest } from "../api.js";

export async function renderDashboard() {
  const container = document.querySelector("#conteudo");

  try {
    const response = await fetch("./views/dashboard.html");
    const html = await response.text();

    container.innerHTML = html;
    await carregarDadosDashboard();
  } catch (error) {
    console.error("Erro ao carregar a tela de dashboard:", error);
  }
}

async function carregarDadosDashboard() {
  try {
    const [transacoes, resumo, categorias] = await Promise.all([
      authenticatedRequest("/api/Transacao"),
      authenticatedRequest("/api/Transacao/resumo"),
      authenticatedRequest("/api/Categoria"),
    ]);

    // 1. Atualiza os cards superiores
    const elSaldo = document.getElementById("dash-saldo");
    const elEntradas = document.getElementById("dash-entradas");
    const elSaidas = document.getElementById("dash-saidas");

    if (elSaldo) elSaldo.textContent = formatarMoeda(resumo.saldoTotal);
    if (elEntradas) elEntradas.textContent = formatarMoeda(resumo.totalReceitas);
    if (elSaidas) elSaidas.textContent = formatarMoeda(resumo.totalDespesas);

    // 2. Renderiza os últimos 4 lançamentos
    renderizarRecentes(transacoes, categorias);

    // 3. Renderiza a distribuição de gastos por categoria
    renderizarProgressoCategorias(transacoes, categorias);
  } catch (error) {
    console.error("Erro ao carregar dados da dashboard:", error);
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

function renderizarRecentes(transacoes, categorias) {
  const tbody = document.getElementById("dash-lista-transacoes");
  if (!tbody) return;

  if (transacoes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 32px; opacity: 0.6;">
          Nenhum lançamento recente.
        </td>
      </tr>
    `;
    return;
  }

  // Ordena por data (mais recente primeiro) e pega as 4 primeiras
  const recentes = [...transacoes]
    .sort((a, b) => new Date(b.dataTransacao) - new Date(a.dataTransacao))
    .slice(0, 4);

  tbody.innerHTML = recentes
    .map((t) => {
      const cat = categorias.find((c) => c.id === t.categoriaId);
      const categoriaNome = cat ? cat.nome : "—";
      return `
        <tr>
          <td style="font-weight: 600;">${categoriaNome}</td>
          <td style="opacity: 0.85;">${t.descricao || "-"}</td>
          <td style="opacity: 0.75;">${formatarData(t.dataTransacao)}</td>
          <td class="${t.tipo === "Despesa" ? "valor-despesa" : "valor-receita"}" style="text-align: right;">
            ${t.tipo === "Despesa" ? "- " : "+ "}${formatarMoeda(t.valor)}
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderizarProgressoCategorias(transacoes, categorias) {
  const container = document.getElementById("categorias-progresso");
  const alertContainer = document.getElementById("maior-gasto-container");
  const alertTexto = document.getElementById("maior-gasto-texto");
  if (!container) return;

  // Filtrar apenas despesas
  const despesas = transacoes.filter((t) => t.tipo === "Despesa");

  if (despesas.length === 0) {
    container.innerHTML = `
      <p style="text-align: center; padding: 32px; opacity: 0.6; font-size: 13px;">
        Nenhuma despesa registrada para análise.
      </p>
    `;
    if (alertContainer) alertContainer.style.display = "none";
    return;
  }

  // Somar despesas por categoria
  const totalDespesas = despesas.reduce((sum, t) => sum + t.valor, 0);
  const despesasPorCategoria = {};

  despesas.forEach((t) => {
    despesasPorCategoria[t.categoriaId] = (despesasPorCategoria[t.categoriaId] || 0) + t.valor;
  });

  // Converter para array e ordenar pelo maior valor gasto
  const listaOrdenada = Object.keys(despesasPorCategoria).map((catId) => {
    const id = parseInt(catId);
    const catObj = categorias.find((c) => c.id === id);
    const valor = despesasPorCategoria[catId];
    const pct = totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0;
    return {
      nome: catObj ? catObj.nome : "Outros",
      valor,
      pct,
    };
  }).sort((a, b) => b.valor - a.valor);

  // 1. Exibe a categoria com maior gasto no alerta
  if (listaOrdenada.length > 0 && alertContainer && alertTexto) {
    const maior = listaOrdenada[0];
    alertTexto.textContent = `${maior.nome} (${formatarMoeda(maior.valor)})`;
    alertContainer.style.display = "flex";
  }

  // 2. Renderiza as barras de progresso (limita a 4 principais categorias)
  const topCategorias = listaOrdenada.slice(0, 4);

  // Array de cores Kiwi para progress bar
  const cores = ["#679800", "#79b300", "#8ccf00", "#a0eb00"];

  container.innerHTML = topCategorias
    .map((c, index) => {
      const cor = cores[index % cores.length];
      return `
        <div class="category-progress-item">
          <div class="progress-header">
            <span>${c.nome}</span>
            <span>${formatarMoeda(c.valor)} <span class="pct">(${c.pct.toFixed(0)}%)</span></span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${c.pct}%; background-color: ${cor};"></div>
          </div>
        </div>
      `;
    })
    .join("");
}
