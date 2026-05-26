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

if (form) {
  form.addEventListener(
    "submit",
    authPage === "register" ? handleRegisterSubmit : handleLoginSubmit
  );
}
