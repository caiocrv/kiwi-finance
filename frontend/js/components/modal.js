import { authenticatedRequest } from "../api.js";

export function openModal(content) {
  const modalRoot = document.getElementById("modal-root");

  modalRoot.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        ${content}
      </div>
    </div>
  `;
}

export function closeModal() {
  const modalRoot = document.getElementById("modal-root");
  modalRoot.innerHTML = "";
}


document.addEventListener("click", (e) => {
  if (e.target.classList.contains("fechar-modal")) {
    closeModal();
  }
});

export function inicializarTipoTransacao() {
  const botoes = document.querySelectorAll(".tipo-btn");
  const campoTipo = document.getElementById("tipo-transacao");

  if (!botoes.length || !campoTipo) return;

  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {

      botoes.forEach((btn) => {
        btn.classList.remove("ativo");
      });

      botao.classList.add("ativo");

      campoTipo.value = botao.dataset.tipo;
    });
  });
}

export function inicializarMascaraValor() {
  const campoValor = document.getElementById("valor-transacao");
  const campoData = document.getElementById("data-transacao");

  if (campoValor) {
    campoValor.addEventListener("input", (e) => {
      let value = e.target.value;

      // Remove tudo o que não for dígito
      value = value.replace(/\D/g, "");

      if (value === "") {
        e.target.value = "";
        return;
      }

      // Formata como moeda brasileira e limita a 1 milhão (1.000.000,00)
      let valorCentavos = parseFloat(value) / 100;
      if (valorCentavos > 1000000) {
        valorCentavos = 1000000;
      }

      const valorFormatado = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valorCentavos);

      e.target.value = valorFormatado;
    });
  }

  if (campoData) {
    const hojeISO = new Date().toLocaleDateString('sv-SE');
    campoData.max = hojeISO;

    campoData.addEventListener("input", (e) => {
      const parts = e.target.value.split("-"); // yyyy-mm-dd
      if (parts[0] && parts[0].length > 4) {
        parts[0] = parts[0].slice(0, 4);
        e.target.value = parts.join("-");
      }
    });
  }
}

let categoriasCache = [];

export async function inicializarCategorias() {
  const selectCategoria = document.getElementById("categoria");
  if (!selectCategoria) return;

  try {
    if (categoriasCache.length === 0) {
      categoriasCache = await authenticatedRequest("/api/Categoria");
    }

    atualizarDropdownCategorias();

    const botoes = document.querySelectorAll(".tipo-btn");
    botoes.forEach((botao) => {
      botao.addEventListener("click", () => {
        setTimeout(atualizarDropdownCategorias, 50);
      });
    });
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
}

function atualizarDropdownCategorias() {
  const selectCategoria = document.getElementById("categoria");
  const campoTipo = document.getElementById("tipo-transacao");
  if (!selectCategoria || !campoTipo) return;

  const tipoSelecionado = campoTipo.value;

  selectCategoria.innerHTML = "";

  const categoriasFiltradas = categoriasCache.filter(
    (c) => c.tipo.toLowerCase() === tipoSelecionado.toLowerCase()
  );

  categoriasFiltradas.forEach((categoria) => {
    const option = document.createElement("option");
    option.value = categoria.id;
    option.textContent = categoria.nome;
    selectCategoria.appendChild(option);
  });
}

export function inicializarRegistroTransacao(onSucesso) {
  const btnRegistrar = document.getElementById("btn-registrar-transacao");
  if (!btnRegistrar) return;

  btnRegistrar.addEventListener("click", async () => {
    const tipo = document.getElementById("tipo-transacao")?.value || "";
    const categoriaId = document.getElementById("categoria")?.value || "";
    const descricao = document.getElementById("descricao-transacao")?.value.trim() || "-";
    const valorTexto = document.getElementById("valor-transacao")?.value || "";
    const data = document.getElementById("data-transacao")?.value || "";

    // Converte "R$ 1.300,00" → 1300.00
    const valorNumerico = parseFloat(
      valorTexto
        .replace("R$", "")
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    );

    if (!valorNumerico || !data || !categoriaId) {
      alert("Preencha os campos obrigatórios (valor, data e categoria) antes de registrar.");
      return;
    }

    // Evita lançamentos futuros
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [ano, mes, dia] = data.split("-").map(Number);
    const dataSelecionada = new Date(ano, mes - 1, dia);

    if (dataSelecionada > hoje) {
      alert("Não é permitido realizar lançamentos futuros.");
      return;
    }

    const transacao = {
      descricao,
      valor: valorNumerico,
      dataTransacao: new Date(data).toISOString(),
      tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase(), // "receita" → "Receita"
      categoriaId: parseInt(categoriaId),
    };

    try {
      btnRegistrar.disabled = true;
      btnRegistrar.textContent = "Registrando...";

      await authenticatedRequest("/api/Transacao", {
        method: "POST",
        body: JSON.stringify(transacao),
      });

      closeModal();

      if (onSucesso) {
        onSucesso();
      }
    } catch (error) {
      console.error("Erro ao registrar transação:", error);
      alert("Erro ao registrar transação: " + error.message);
      btnRegistrar.disabled = false;
      btnRegistrar.textContent = "Registrar Transação";
    }
  });
}