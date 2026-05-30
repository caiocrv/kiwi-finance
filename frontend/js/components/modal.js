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