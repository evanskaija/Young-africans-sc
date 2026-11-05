(() => {
  const playerGrid = document.querySelector('[data-women-player-grid]');
  const filterButtons = Array.from(document.querySelectorAll('[data-women-team-filter]'));
  const staffGrid = document.querySelector('[data-women-staff-grid]');
  const womenPlayers = window.womenTeamPlayers || [];

  if (!playerGrid) return;

  function playerCard(player) {
    return `
      <a class="team-player-card women-player-card" href="women-player.html?player=${encodeURIComponent(player.id)}">
        <div class="team-player-image">
          <span class="team-player-number">${player.number}</span>
          <img src="${player.image}" alt="${player.name} — Yanga Princess" loading="lazy" />
        </div>
        <div class="team-player-copy">
          <div>
            <span class="team-player-position">${player.position}</span>
            <h3>${player.name}</h3>
          </div>
          <span class="team-player-link">VIEW PROFILE <b aria-hidden="true">↗</b></span>
        </div>
      </a>`;
  }

  function renderPlayers(role = 'all') {
    const visiblePlayers = role === 'all' ? womenPlayers : womenPlayers.filter((player) => player.role === role);
    playerGrid.innerHTML = visiblePlayers.map(playerCard).join('');
  }

  function renderStaff() {
    if (!staffGrid) return;
    staffGrid.innerHTML = (window.womenTeamStaff || []).map((staff) => `
      <article class="team-staff-card">
        <div class="team-staff-photo" aria-hidden="true"><span>${staff.initials}</span></div>
        <div class="team-staff-copy"><h3>${staff.name}</h3><p>${staff.role}</p></div>
      </article>`).join('');
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      renderPlayers(button.dataset.womenTeamFilter);
    });
  });

  renderPlayers();
  renderStaff();
})();
