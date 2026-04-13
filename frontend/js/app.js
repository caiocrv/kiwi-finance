// app.js
function loadUser() {
  const user = {
    nome: "Douglas Borges",
    email: "douglas@email.com"
  };

  document.getElementById("user-name").textContent = user.nome;
  document.getElementById("user-email").textContent = user.email;
}

/* loadUser();

async function loadUser() {
  try {
    const response = await fetch("/api/user");

    if (!response.ok) {
      throw new Error("Erro ao buscar usuário");
    }

    const user = await response.json();

    document.getElementById("user-name").textContent = user.nome;
    document.getElementById("user-email").textContent = user.email;

  } catch (error) {
    console.error(error);
  }
}

loadUser(); */