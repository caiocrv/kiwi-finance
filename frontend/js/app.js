import { ensureAuthenticated, logout } from "./api.js";

const views = {
  dashboard: {
    title: "Dashboard",
    description:
      "Sua sessao foi validada com sucesso. A partir daqui, as proximas chamadas do frontend podem usar o token JWT salvo no login."
  },
  transacoes: {
    title: "Transacoes",
    description:
      "Esta area ja pode consumir endpoints protegidos do backend usando a camada autenticada criada em js/api.js."
  },
  config: {
    title: "Configuracoes",
    description:
      "Use esta secao para evoluir preferencias da conta, logout e demais ajustes do usuario autenticado."
  }
};

function renderAuthenticatedState() {
  document.getElementById("user-name").textContent = "Sessao autenticada";
  document.getElementById("user-email").textContent = "Somente JWT no frontend";
}

function renderView(routeName = "dashboard") {
  const view = views[routeName] || views.dashboard;
  const wrapper = document.querySelector(".content-wrapper");

  if (!wrapper) {
    return;
  }

  wrapper.innerHTML = `
    <section class="app-view">
      <h1>${view.title}</h1>
      <p>${view.description}</p>
    </section>
  `;
}

window.navigate = renderView;

function bindLogout() {
  const logoutButton = document.getElementById("logout-button");

  if (!logoutButton) {
    return;
  }

  logoutButton.addEventListener("click", logout);
}

async function init() {
  const isAuthenticated = await ensureAuthenticated();

  if (!isAuthenticated) {
    return;
  }

  renderAuthenticatedState();
  bindLogout();
  renderView("dashboard");
}

init().catch(() => {
  logout();
});
