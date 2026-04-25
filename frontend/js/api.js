const AUTH_TOKEN_STORAGE_KEY = "kiwi_token";
const LEGACY_AUTH_TOKEN_STORAGE_KEY = "kiwi_finance_token";
const API_BASE_URL = "http://localhost:5000";
const nativeFetch = window.fetch.bind(window);
let authFetchInstalled = false;

removeLegacySensitiveData();

function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
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

function createHeaders(headersInit = undefined) {
  return new Headers(headersInit || {});
}

function appendAuthorization(headers) {
  const token = getAuthToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

function extractToken(data) {
  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (data && typeof data === "object" && typeof data.token === "string") {
    return data.token.trim();
  }

  return "";
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getAuthToken() {
  const token =
    localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ||
    localStorage.getItem(LEGACY_AUTH_TOKEN_STORAGE_KEY);

  if (token && localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) !== token) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    localStorage.removeItem(LEGACY_AUTH_TOKEN_STORAGE_KEY);
  }

  return token;
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
  localStorage.removeItem(LEGACY_AUTH_TOKEN_STORAGE_KEY);
}

export function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_STORAGE_KEY);
  removeLegacySensitiveData();
}

export function getLoginUrl() {
  const relativePath = isAuthPage() ? "./login.html" : "./auth/login.html";
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
  if (getAuthToken()) {
    redirectToIndex();
  }
}

export function requireAuthentication() {
  const token = getAuthToken();

  if (!token) {
    redirectToLogin();
    return null;
  }

  installAuthenticatedFetch();
  return token;
}

export function installAuthenticatedFetch() {
  if (authFetchInstalled) {
    return;
  }

  window.fetch = (input, init = {}) => {
    const requestHeaders = input instanceof Request ? input.headers : undefined;
    const headers = appendAuthorization(createHeaders(requestHeaders));

    createHeaders(init.headers).forEach((value, key) => {
      headers.set(key, value);
    });

    if (input instanceof Request) {
      return nativeFetch(new Request(input, { ...init, headers }));
    }

    return nativeFetch(input, { ...init, headers });
  };

  authFetchInstalled = true;
}

export async function login({ email, senha }) {
  const response = await nativeFetch(buildApiUrl("/api/Usuario/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, senha })
  });

  const data = await parseResponse(response);
  const token = extractToken(data);

  if (!response.ok || !token) {
    throw new Error(resolveErrorMessage(data, "Nao foi possivel fazer login."));
  }

  saveSession(token);
  return { token };
}

export async function register({ nome, email, senha, telefone = "", cpf = "" }) {
  const registerUrl = new URL(buildApiUrl("/api/Usuario/registrar"));
  registerUrl.searchParams.set("senha", senha);

  const response = await nativeFetch(registerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nome, email, telefone, cpf })
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(resolveErrorMessage(data, "Nao foi possivel criar a conta."));
  }

  return data;
}

export async function logout() {
  try {
    await fetch(buildApiUrl("/api/Usuario/logout"), { method: "POST" });
  } catch {
    // O logout local continua mesmo se a chamada falhar.
  }

  clearSession();
  redirectToLogin();
}

export async function authenticatedRequest(path, options = {}) {
  const headers = appendAuthorization(createHeaders(options.headers));

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers
  });

  const data = await parseResponse(response);

  if (response.status === 401) {
    clearSession();
    redirectToLogin();
    throw new Error("Sessao expirada.");
  }

  if (!response.ok) {
    throw new Error(resolveErrorMessage(data, "Nao foi possivel concluir a requisicao."));
  }

  return data;
}
