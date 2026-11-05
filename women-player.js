(() => {
  const params = new URLSearchParams(window.location.search);
  const players = window.womenTeamPlayers || [];
  const profile = players.find((player) => player.id === params.get('player')) || players[0];

  if (!profile) return;

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((element) => { element.textContent = value; });
  };

  document.title = `${profile.name} — Yanga Princess | Young Africans SC`;
  const image = document.querySelector('[data-women-profile-image]');
  if (image) {
    image.src = profile.image;
    image.alt = `${profile.name} — Yanga Princess`;
  }
  setText('[data-women-profile-position]', profile.position.toUpperCase());
  setText('[data-women-profile-position-meta]', profile.position);
  setText('[data-women-profile-nationality]', profile.nationality);
  setText('[data-women-profile-number]', profile.number);
  setText('[data-women-profile-number-meta]', profile.number);
  setText('[data-women-profile-name]', profile.name);
  setText('[data-women-profile-bio]', profile.bio);
  setText('[data-women-detail-name]', profile.name);
  setText('[data-women-detail-nationality]', profile.nationality);
  setText('[data-women-detail-position]', profile.position);
})();
