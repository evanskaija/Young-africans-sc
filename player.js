const params = new URLSearchParams(window.location.search);
const profilePlayer = (window.teamPlayers || []).find((item) => item.id === params.get('player')) || window.teamPlayers?.[0];

if (profilePlayer) {
  document.title = `${profilePlayer.name} — Young Africans SC`;
  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };
  const image = document.querySelector('[data-profile-image]');
  if (image) {
    image.src = profilePlayer.image;
    image.alt = `${profilePlayer.name} in the Young Africans kit`;
  }
  setText('[data-profile-position]', profilePlayer.position.toUpperCase());
  document.querySelectorAll('[data-profile-number]').forEach((node) => { node.textContent = profilePlayer.number; });
  setText('[data-profile-name]', profilePlayer.name);
  document.querySelectorAll('[data-profile-nationality]').forEach((node) => { node.textContent = profilePlayer.nationality; });
  setText('[data-profile-bio]', profilePlayer.bio);
  setText('[data-profile-full-name]', profilePlayer.name);
  document.querySelectorAll('[data-profile-role]').forEach((node) => { node.textContent = profilePlayer.position; });
  const backLink = document.querySelector('[data-back-to-squad]');
  if (backLink) backLink.href = 'squad.html#squad';
}
