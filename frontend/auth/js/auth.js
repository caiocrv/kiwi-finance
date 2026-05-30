import {
  login,
  redirectIfAuthenticated,
  redirectToIndex,
  register
} from "../../js/api.js";

redirectIfAuthenticated();

const authPage = document.body.dataset.authPage;
const form = document.querySelector("[data-auth-form]");
const messageElement = document.getElementById("auth-message");
const submitButton =
  form?.querySelector("button[type='submit']") ||
  document.querySelector("[data-auth-submit]");

function showMessage(message, type = "error") {
  if (!messageElement) {
    window.alert(message);
    return;
  }

  messageElement.hidden = false;
  messageElement.textContent = message;
  messageElement.className = `auth-message auth-message--${type}`;
}

function clearMessage() {
  if (!messageElement) {
    return;
  }

  messageElement.hidden = true;
  messageElement.textContent = "";
  messageElement.className = "auth-message";
}

function setSubmitting(isSubmitting) {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = isSubmitting;

  if (authPage === "register") {
    submitButton.textContent = isSubmitting ? "Criando conta..." : "Criar conta";
    return;
  }

  submitButton.textContent = isSubmitting ? "Entrando..." : "Acessar conta";
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  clearMessage();

  const email = form.email.value.trim();
  const senha = form.password.value;

  if (!email || !senha) {
    showMessage("Preencha e-mail e senha para continuar.");
    return;
  }

  setSubmitting(true);

  try {
    await login({ email, senha });
    redirectToIndex();
  } catch (error) {
    showMessage(error.message || "Nao foi possivel fazer login.");
  } finally {
    setSubmitting(false);
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  clearMessage();

  const formData = new FormData(form);
  const nome = `${formData.get("nome") || ""}`.trim();
  const email = `${formData.get("email") || ""}`.trim();
  const telefone = `${formData.get("telefone") || ""}`.trim();
  const cpf = `${formData.get("cpf") || ""}`.trim();
  const senha = `${formData.get("password") || ""}`;
  const confirmarSenha = `${formData.get("confirmPassword") || ""}`;

  if (!nome || !email || !senha) {
    showMessage("Nome, e-mail e senha sao obrigatorios.");
    return;
  }

  if (senha !== confirmarSenha) {
    showMessage("As senhas precisam ser iguais.");
    return;
  }

  setSubmitting(true);

  try {
    await register({ nome, email, senha, telefone, cpf });
    window.location.replace("./login.html");
  } catch (error) {
    showMessage(error.message || "Nao foi possivel criar a conta.");
  } finally {
    setSubmitting(false);
  }
}

// Adiciona as máscaras na página de cadastro
if (authPage === "register") {
  const campoNome = document.getElementById("nome");
  const campoCpf = document.getElementById("cpf");
  const campoTelefone = document.getElementById("telefone");

  if (campoNome) {
    campoNome.addEventListener("input", (e) => {
      // Aceita apenas letras (incluindo acentos) e espaços
      e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    });
  }

  if (campoCpf) {
    campoCpf.addEventListener("input", (e) => {
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

  if (campoTelefone) {
    campoTelefone.addEventListener("input", (e) => {
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
}

if (form) {
  form.addEventListener(
    "submit",
    authPage === "register" ? handleRegisterSubmit : handleLoginSubmit
  );
}
