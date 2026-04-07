// app.js
function loadUser() {
  const user = {
    nome: "Douglas Borges",
    email: "douglas@email.com"
  };

  document.getElementById("user-name").textContent = user.nome;
  document.getElementById("user-email").textContent = user.email;
}

loadUser();