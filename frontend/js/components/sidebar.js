export function toggleMenu() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');

  const overlay = document.querySelector('.overlay');
  if (overlay) {
    overlay.classList.toggle('active');
  }
}

export function closeMenu() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.remove('active');

  const overlay = document.querySelector('.overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}