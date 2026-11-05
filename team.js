const playerGrid = document.querySelector('[data-player-grid]');
const filterButtons = Array.from(document.querySelectorAll('[data-team-filter]'));
const staffGrid = document.querySelector('[data-staff-grid]');
const teamPagePlayers = window.teamPlayers || [];
const isSquadDirectory = document.body.classList.contains('squad-directory-page');
const featuredPlayerIds = ['djigui-diarra', 'bakari-mwamnyeto', 'maxi-nzengeli', 'peter-shalulile'];

function playerCard(player) {
  return `
    <a class="team-player-card" href="player.html?player=${encodeURIComponent(player.id)}">
      <div class="team-player-image">
        <span class="team-player-number">${player.number}</span>
        <img src="${player.image}" alt="${player.name} in the Young Africans kit" loading="lazy" />
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
  const playerPool = isSquadDirectory ? teamPagePlayers : teamPagePlayers.filter((player) => featuredPlayerIds.includes(player.id));
  const visiblePlayers = role === 'all' ? playerPool : playerPool.filter((player) => player.role === role);
  playerGrid.innerHTML = visiblePlayers.map(playerCard).join('');
}

function renderStaff() {
  if (!staffGrid) return;
  staffGrid.innerHTML = (window.teamStaff || []).map((staff) => `
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
    renderPlayers(button.dataset.teamFilter);
  });
});

if (playerGrid) renderPlayers();
renderStaff();

const trophyGallery = document.querySelector('[data-trophy-gallery]');
if (trophyGallery) {
  const trophyCards = Array.from(trophyGallery.querySelectorAll('.men-trophy-card'));
  const initialTrophy = trophyGallery.querySelector('.men-trophy-card-feature') || trophyCards[0];
  let activeFrame = 0;

  const centerTrophy = (card, behavior = 'auto') => {
    if (!card) return;
    trophyGallery.scrollTo({
      left: card.offsetLeft - (trophyGallery.clientWidth - card.offsetWidth) / 2,
      behavior,
    });
  };

  const updateActiveTrophy = () => {
    const galleryCenter = trophyGallery.scrollLeft + trophyGallery.clientWidth / 2;
    const activeCard = trophyCards.reduce((closest, card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      if (!closest) return card;
      const closestDistance = Math.abs(closest.offsetLeft + closest.offsetWidth / 2 - galleryCenter);
      return Math.abs(cardCenter - galleryCenter) < closestDistance ? card : closest;
    }, null);
    trophyCards.forEach((card) => card.classList.toggle('is-active', card === activeCard));
  };

  trophyGallery.addEventListener('scroll', () => {
    if (activeFrame) return;
    activeFrame = window.requestAnimationFrame(() => {
      updateActiveTrophy();
      activeFrame = 0;
    });
  }, { passive: true });

  window.requestAnimationFrame(() => {
    centerTrophy(initialTrophy);
    updateActiveTrophy();
  });
  window.addEventListener('resize', () => centerTrophy(trophyGallery.querySelector('.is-active') || initialTrophy));
}
