import { authenticatedRequest } from "../api.js";

export async function renderConfig() {
  const container = document.querySelector("#conteudo");

  try {
    const response = await fetch("./views/config.html");
    const html = await response.text();

    container.innerHTML = html;
    inicializarConfiguracoes();
  } catch (error) {
    console.error("Erro ao carregar a tela de configurações:", error);
  }
}

async function inicializarConfiguracoes() {
  const form = document.getElementById("profile-form");
  const elNome = document.getElementById("config-nome");
  const elEmail = document.getElementById("config-email");
  const elCpf = document.getElementById("config-cpf");
  const elTelefone = document.getElementById("config-telefone");

  const toggleDarkMode = document.getElementById("dark-mode-toggle");
  const inputAlertLimit = document.getElementById("alert-limit-input");

  // 1. Carrega dados do Usuário (Simulado com LocalStorage e JWT Claims)
  const token = localStorage.getItem("kiwi_token") || "";
  let emailToken = "usuario@kiwi.com";
  let nomeToken = "Usuário";

  try {
    const [, payload] = token.split('.');
    if (payload) {
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const claims = JSON.parse(atob(padded));
      emailToken = claims.email || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || emailToken;
      nomeToken = claims.name || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || nomeToken;
    }
  } catch (e) {
    console.error("Erro ao decodificar JWT para configs", e);
  }

  // Lê os dados salvos localmente
  const savedNome = localStorage.getItem("config_user_nome") || nomeToken;
  const savedCpf = localStorage.getItem("config_user_cpf") || "";
  const savedTelefone = localStorage.getItem("config_user_telefone") || "";

  if (elNome) elNome.value = savedNome;
  if (elEmail) elEmail.value = emailToken;
  if (elCpf) elCpf.value = savedCpf;
  if (elTelefone) elTelefone.value = savedTelefone;

  // Aplica máscaras nos campos de CPF e Telefone de Configurações!
  if (elCpf) {
    elCpf.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 11) value = value.slice(0, 11);

      if (value.length > 9) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
      } else if (value.length > 6) {
        value = value.replace(/^(\d{3})(\d{3})(\d{1,3})$/, "$1.$2.$3");
      } else if (value.length > 3) {
        value = value.replace(/^(\d{3})(\d{1,3})$/, "$1.$2");
      }
      e.target.value = value;
    });
  }

  if (elTelefone) {
    elTelefone.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 11) value = value.slice(0, 11);

      if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
      } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{1,4})$/, "($1) $2-$3");
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{1,4})$/, "($1) $2");
      } else if (value.length > 0) {
        value = value.replace(/^(\d{1,2})$/, "($1");
      }
      e.target.value = value;
    });
  }

  // 2. Carrega preferências (Dark Mode & Limite de Alerta)
  const isDarkMode = localStorage.getItem("pref_dark_mode") === "true";
  if (toggleDarkMode) {
    toggleDarkMode.checked = isDarkMode;
    toggleDarkMode.addEventListener("change", (e) => {
      localStorage.setItem("pref_dark_mode", e.target.checked);
      aplicarTemaDarkMode(e.target.checked);
    });
  }

  const savedLimit = localStorage.getItem("pref_alert_limit") || "10000000"; // R$ 100.000,00 padrão em centavos
  if (inputAlertLimit) {
    // Formata o limite inicial como moeda
    inputAlertLimit.value = formatarMoedaSemSimbolo(parseFloat(savedLimit) / 100);

    inputAlertLimit.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value === "") {
        e.target.value = "";
        localStorage.setItem("pref_alert_limit", "0");
        return;
      }
      
      let valorCentavos = parseFloat(value);
      localStorage.setItem("pref_alert_limit", valorCentavos.toString());

      e.target.value = formatarMoedaSemSimbolo(valorCentavos / 100);
    });
  }

  // Form submission
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      localStorage.setItem("config_user_nome", elNome.value.trim());
      localStorage.setItem("config_user_cpf", elCpf.value.trim());
      localStorage.setItem("config_user_telefone", elTelefone.value.trim());

      // Atualiza o nome do usuário na barra lateral de forma instantânea!
      const userHeaderName = document.getElementById("user-name");
      if (userHeaderName) {
        userHeaderName.textContent = elNome.value.trim();
      }

      alert("Perfil salvo com sucesso!");
    });
  }
}

function formatarMoedaSemSimbolo(valor) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

// Lógica do Dark Mode
export function aplicarTemaDarkMode(enable) {
  if (enable) {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
}
