const AUTH_TOKEN_STORAGE_KEY = "kiwi_finance_token";
const DEFAULT_API_BASE_URL =
  window.location.protocol === "file:" ? "http://localhost:5000" : window.location.origin;

removeLegacySensitiveData();

function getConfiguredApiBaseUrl() {
  const configuredUrl =
    window.KIWI_API_URL || localStorage.getItem("kiwi_finance_api_url");

  return (configuredUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getConfiguredApiBaseUrl()}${normalizedPath}`;
}

function decodeBase64Url(segment) {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function resolveErrorMessage(data, fallbackMessage) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    if ("mensagem" in data && data.mensagem) {
      return data.mensagem;
    }

    if ("message" in data && data.message) {
      return data.message;
    }
  }

  return fallbackMessage;
}

function isAuthPage() {
  return window.location.pathname.includes("/auth/");
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers
  });

  const data = await parseResponse(response);

  if (response.status === 401) {
    clearSession();
  }

  return { response, data };
}

export function getApiBaseUrl() {
  return getConfiguredApiBaseUrl();
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function removeLegacySensitiveData() {
  localStorage.removeItem("kiwi_finance_user");
}

export function saveSession(token) {
  if (!token) {
    clearSession();
    return;
  }

  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  removeLegacySensitiveData();
}

export function parseJwt(token) {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token = getAuthToken()) {
  const payload = parseJwt(token);

  if (!payload || typeof payload.exp !== "number") {
    return true;
  }

  return Date.now() >= payload.exp * 1000;
}

export function isAuthenticated() {
  const token = getAuthToken();
  return Boolean(token) && !isTokenExpired(token);
}

export function getLoginUrl() {
  const relativePath = isAuthPage() ? "./login.html" : "./auth/login.html";
  return new URL(relativePath, window.location.href).href;
}

export function getRegisterUrl() {
  const relativePath = isAuthPage() ? "./register.html" : "./auth/register.html";
  return new URL(relativePath, window.location.href).href;
}

export function getIndexUrl() {
  const relativePath = isAuthPage() ? "../index.html" : "./index.html";
  return new URL(relativePath, window.location.href).href;
}

export function redirectToLogin() {
  window.location.replace(getLoginUrl());
}

export function redirectToIndex() {
  window.location.replace(getIndexUrl());
}

export function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    redirectToIndex();
  }
}

export async function login({ email, senha }) {
  const { response, data } = await request("/api/usuario/login", {
    method: "POST",
    body: JSON.stringify({ email, senha })
  });

  if (!response.ok || !data?.token) {
    throw new Error(resolveErrorMessage(data, "Nao foi possivel fazer login."));
  }

  saveSession(data.token);
  return { token: data.token };
}

export async function register({ nome, email, senha, telefone = "", cpf = "" }) {
  const { response, data } = await request("/api/usuario/registrar", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha, telefone, cpf })
  });

  if (!response.ok) {
    throw new Error(resolveErrorMessage(data, "Nao foi possivel criar a conta."));
  }

  return data;
}

export async function validateSession() {
  const token = getAuthToken();

  if (!token || isTokenExpired(token)) {
    clearSession();
    return false;
  }

  try {
    const { response } = await request("/api/usuario/sessao");
    return response.ok;
  } catch {
    return false;
  }
}

export async function ensureAuthenticated() {
  const sessionIsValid = await validateSession();

  if (!sessionIsValid) {
    clearSession();
    redirectToLogin();
    return false;
  }

  return true;
}

export async function logout() {
  try {
    await request("/api/usuario/logout", { method: "POST" });
  } catch {
    // O logout local continua mesmo se a chamada falhar.
  }

  clearSession();
  redirectToLogin();
}

export async function authenticatedRequest(path, options = {}) {
  const { response, data } = await request(path, options);

  if (response.status === 401) {
    redirectToLogin();
    throw new Error("Sessao expirada.");
  }

  if (!response.ok) {
    throw new Error(resolveErrorMessage(data, "Nao foi possivel concluir a requisicao."));
  }

  return data;
}
