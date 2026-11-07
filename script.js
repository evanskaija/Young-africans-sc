const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');

if (!document.body.classList.contains('membership-page')) {
  document.querySelectorAll('a[href="#membership"]').forEach((link) => {
    link.setAttribute('href', 'membership.html');
  });
}

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 35);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

menuToggle?.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    header.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('.language-switch button, .reference-language button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.language-switch button, .reference-language button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

const players = [
  { name: 'Juma\\nHassan', role: 'MIDFIELDER · 10', number: '10', image: 'Assets/fiston-mayele.png' },
  { name: 'Amani\\nMusa', role: 'FORWARD · 09', number: '09', image: 'Assets/fiston-mayele.png' },
  { name: 'Kassim\\nJuma', role: 'DEFENDER · 04', number: '04', image: 'Assets/Intense Soccer Agility Drill.png' },
  { name: 'Baraka\\nMollel', role: 'GOALKEEPER · 01', number: '01', image: 'Assets/Mwalimu.png' },
];
let playerIndex = 0;
const playerImage = document.querySelector('#playerImage');
const playerName = document.querySelector('#playerName');
const playerRole = document.querySelector('#playerRole');
const playerNumber = document.querySelector('.player-number');
const playerCount = document.querySelector('.player-arrows span');
function showPlayer(index) {
  playerIndex = (index + players.length) % players.length;
  const player = players[playerIndex];
  if (playerImage) playerImage.src = player.image;
  if (playerName) playerName.innerHTML = player.name.replace('\\n', '<br />');
  if (playerRole) playerRole.textContent = player.role;
  if (playerNumber) playerNumber.textContent = player.number;
  if (playerCount) playerCount.textContent = `0${playerIndex + 1} / 04`;
}
document.querySelector('.player-next')?.addEventListener('click', () => showPlayer(playerIndex + 1));
document.querySelector('.player-prev')?.addEventListener('click', () => showPlayer(playerIndex - 1));

document.querySelectorAll('.team-tabs button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.team-tabs button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const isFirst = button.dataset.team === 'first';
    document.querySelector('.player-position').textContent = isFirst ? 'ATTACKING MIDFIELDER' : `${button.textContent} SQUAD`;
    document.querySelector('.player-description').textContent = isFirst ? 'Made for the moments that move Wananchi.' : 'The next generation of the Wananchi way.';
  });
});

document.querySelectorAll('.category-tabs button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.category-tabs button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

const heroNewsCards = Array.from(document.querySelectorAll('.hero-news-card'));
const heroFeature = document.querySelector('.hero-news-feature');
const heroDots = Array.from(document.querySelectorAll('.hero-news-dots span'));
const hero = document.querySelector('.hero');
const heroMedia = document.querySelector('.hero-media');
const heroTitle = document.querySelector('#hero-title');
const heroLede = document.querySelector('.hero-lede');
const heroStoryKicker = document.querySelector('#hero-story-kicker');
let heroNewsSlides = heroNewsCards.map((card, index) => ({
  id: index,
  image: card.querySelector('img')?.src || '',
  alt: card.querySelector('img')?.alt || '',
  meta: card.querySelector('.hero-news-meta')?.innerHTML || '',
  title: card.querySelector('h3')?.innerHTML || '',
  description: card.querySelector('p')?.textContent || 'Stories, moments and voices from the heart of Yanga.',
  heroTitle: card.dataset.heroTitle || card.querySelector('h3')?.textContent || 'YANGA NEWS',
  heroAccent: card.dataset.heroAccent || '',
  heroDescription: card.dataset.heroDescription || card.querySelector('p')?.textContent || 'Stories, moments and voices from the heart of Yanga.',
  heroKicker: card.dataset.heroKicker || card.querySelector('.hero-news-meta span')?.textContent || 'YANGA NEWS',
}));
let heroNewsIndex = 0;
let heroNewsTimer;
let heroNewsSwapTimer;

function syncHeroStory(story) {
  if (!story) return;
  if (heroMedia) {
    heroMedia.style.setProperty('--hero-story-image', `url("${story.image}")`);
    heroMedia.setAttribute('aria-label', story.alt);
  }
  if (heroStoryKicker) heroStoryKicker.textContent = story.heroKicker;
  if (heroTitle) heroTitle.innerHTML = `${story.heroTitle}${story.heroAccent ? `<br /><em>${story.heroAccent}</em>` : ''}`;
  if (heroLede) heroLede.textContent = story.heroDescription;
}

function renderHeroStory(card, story) {
  const image = card.querySelector('img');
  const link = card.querySelector('.hero-news-media');
  const meta = card.querySelector('.hero-news-meta');
  const title = card.querySelector('h3');
  const description = card.querySelector('p');
  if (image) {
    image.src = story.image;
    image.alt = story.alt;
  }
  if (link) {
    const storyIds = ['next-generation', 'next-chapter', 'energy-every-step'];
    link.href = `news.html?story=${storyIds[story.id] || 'standard-worn'}`;
  }
  if (meta) meta.innerHTML = story.meta;
  if (title) title.innerHTML = story.title;
  if (description) description.textContent = story.description;
}

function setHeroNews(slotIndex) {
  if (!heroFeature || heroNewsSlides.length < 2) return;
  const targetSlot = (slotIndex + heroNewsSlides.length) % heroNewsSlides.length;
  if (targetSlot !== 0) {
    [heroNewsSlides[0], heroNewsSlides[targetSlot]] = [heroNewsSlides[targetSlot], heroNewsSlides[0]];
  }
  heroNewsIndex = heroNewsSlides[0].id;
  window.clearTimeout(heroNewsSwapTimer);
  heroFeature.classList.add('is-changing');
  hero?.classList.add('hero-story-changing');
  heroNewsSwapTimer = window.setTimeout(() => {
    heroNewsCards.forEach((card, cardIndex) => renderHeroStory(card, heroNewsSlides[cardIndex]));
    heroDots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === heroNewsIndex));
    syncHeroStory(heroNewsSlides[0]);
    heroFeature.classList.remove('is-changing');
    hero?.classList.remove('hero-story-changing');
  }, 220);
}

function advanceHeroNews() {
  const nextStoryId = (heroNewsIndex + 1) % heroNewsSlides.length;
  const nextSlot = heroNewsSlides.findIndex((story) => story.id === nextStoryId);
  setHeroNews(nextSlot);
}

function startHeroNews() {
  window.clearInterval(heroNewsTimer);
  heroNewsTimer = window.setInterval(advanceHeroNews, 8000);
}

heroNewsCards.forEach((card, cardIndex) => {
  card.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    event.preventDefault();
    setHeroNews(cardIndex);
    startHeroNews();
  });
});
heroNewsCards.forEach((card) => {
  card.addEventListener('mouseenter', () => window.clearInterval(heroNewsTimer));
  card.addEventListener('mouseleave', startHeroNews);
});
heroDots.forEach((dot, dotIndex) => {
  const selectDot = () => {
    const targetSlot = heroNewsSlides.findIndex((story) => story.id === dotIndex);
    setHeroNews(targetSlot);
    startHeroNews();
  };
  dot.addEventListener('click', selectDot);
  dot.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectDot();
    }
  });
});
if (heroNewsSlides.length) {
  syncHeroStory(heroNewsSlides[0]);
  if (heroNewsCards[0]) renderHeroStory(heroNewsCards[0], heroNewsSlides[0]);
  if (heroNewsCards.length > 1) startHeroNews();
}

const jerseySection = document.querySelector('.jersey-showcase-section');
if (jerseySection) {
  // Keep the collection visible immediately; the observer only controls autoplay.
  jerseySection.classList.add('is-visible');
  const jerseyStage = jerseySection.querySelector('.jersey-stage');
  const jerseySlidesHost = jerseySection.querySelector('.jersey-slides');
  const jerseyInfo = jerseySection.querySelector('.jersey-product-info');
  const jerseyIndexLabel = jerseySection.querySelector('.jersey-product-index');
  const jerseyName = jerseySection.querySelector('.jersey-product-name');
  const jerseySeason = jerseySection.querySelector('.jersey-product-season');
  const jerseyPrice = jerseySection.querySelector('.jersey-product-price');
  const jerseyCount = jerseySection.querySelector('.jersey-count');
  const jerseyCatalog = [
    { file: 'kit 2027.png', label: 'KIT 2027', name: 'GOLD / WHITE', alt: 'Gold and white Young Africans 2027 kit' },
    { file: 'Purple_Yanga_Soccer_Jersey_Product_Shot-removebg-preview.png', label: 'PURPLE', name: 'PURPLE / GOLD', alt: 'Purple and gold Young Africans jersey' },
    { file: 'kit 2026.png', label: 'KIT 2026', name: 'BLUE / WHITE', alt: 'Blue and white Young Africans 2026 kit' },
    { file: 'Yanga_Blue_and_Gold_Jersey_Render-removebg-preview.png', label: 'BLUE & GOLD', name: 'BLUE / GOLD', alt: 'Blue and gold Young Africans jersey' },
    { file: 'Yellow Young Africans  Jersey.png', label: 'GOLD / BLACK', name: 'GOLD / BLACK', alt: 'Gold and black Young Africans jersey' },
    { file: 'Young Africans Green Football Jersey.png', label: 'NEW HOME', name: 'Young Africans Green Football Jersey', alt: 'Young Africans green football jersey' },
    { file: 'Green SportPesa Soccer Jersey.png', label: 'HOME', name: 'GREEN / GOLD', alt: 'Green and gold Young Africans jersey' },
    { file: 'Black Young Africans Jersey.png', label: 'THIRD', name: 'BLACK / GOLD', alt: 'Black and gold Young Africans jersey' },
    { file: 'Black_and_Gold_SportPesa_Football_Jersey-removebg-preview.png', label: 'BLACK & GOLD', name: 'BLACK / GOLD', alt: 'Black and gold SportPesa Young Africans jersey' },
    { file: 'Bright_Yellow_SportPesa_Football_Jersey-removebg-preview.png', label: 'BRIGHT YELLOW', name: 'BRIGHT YELLOW', alt: 'Bright yellow SportPesa Young Africans jersey' },
    { file: 'Green_Cityscape_Football_Jersey-removebg-preview.png', label: 'GREEN CITY', name: 'GREEN / CITYSCAPE', alt: 'Green cityscape Young Africans jersey' },
    { file: 'Navy Young Africans Football Jersey Mockup.png', label: 'NAVY', name: 'NAVY / GOLD', alt: 'Navy Young Africans football jersey' },
    { file: 'Teal SportPesa Young Africans Jersey.png', label: 'TEAL', name: 'TEAL / GOLD', alt: 'Teal SportPesa Young Africans jersey' },
    { file: 'Yellow GSM Young Africans Soccer Jersey.png', label: 'YELLOW GSM', name: 'YELLOW / BLACK', alt: 'Yellow GSM Young Africans jersey' },
  ];
  const jerseyData = jerseyCatalog.map((jersey, index) => ({
    index: `${String(index + 1).padStart(2, '0')} / ${jersey.label}`,
    name: jersey.name,
    season: 'YANGA SC 2026/27',
    description: 'Official Merchandise',
    price: 'TSH 45,000',
  }));
  jerseySlidesHost.innerHTML = '';
  jerseyCatalog.forEach((jersey, index) => {
    const slide = document.createElement('article');
    slide.className = 'jersey-slide';
    slide.dataset.jerseyIndex = index;
    slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
    const image = document.createElement('img');
    image.className = 'jersey-asset';
    image.src = `Assets/${jersey.file}`;
    image.alt = jersey.alt;
    slide.appendChild(image);
    jerseySlidesHost.appendChild(slide);
  });
  const jerseySlides = Array.from(jerseySection.querySelectorAll('.jersey-slide'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let jerseyIndex = 0;
  let jerseyTimer;
  let jerseyInfoTimer;
  let touchStartX = 0;

  function setJerseyInfo(index, animate = true) {
    const product = jerseyData[index];
    const write = () => {
      jerseyIndexLabel.textContent = product.index;
      jerseyName.textContent = product.name;
      jerseySeason.innerHTML = `<strong>${product.season}</strong><span>${product.description}</span>`;
      jerseyPrice.textContent = product.price;
      jerseyInfo.classList.remove('is-changing');
      jerseyInfo.classList.add('is-entering');
      window.setTimeout(() => jerseyInfo.classList.remove('is-entering'), 620);
    };
    window.clearTimeout(jerseyInfoTimer);
    if (!animate || prefersReducedMotion.matches) {
      write();
      return;
    }
    jerseyInfo.classList.remove('is-entering');
    jerseyInfo.classList.add('is-changing');
    jerseyInfoTimer = window.setTimeout(write, 180);
  }

  function setJerseySlides(index) {
    const next = (index + 1) % jerseySlides.length;
    const previous = (index - 1 + jerseySlides.length) % jerseySlides.length;
    jerseySlides.forEach((slide, slideIndex) => {
      slide.classList.remove('is-active', 'is-next', 'is-prev', 'is-hidden');
      if (slideIndex === index) slide.classList.add('is-active');
      else if (slideIndex === next) slide.classList.add('is-next');
      else if (slideIndex === previous) slide.classList.add('is-prev');
      else slide.classList.add('is-hidden');
      slide.setAttribute('aria-hidden', slideIndex === index ? 'false' : 'true');
    });
    jerseyCount.textContent = `${String(index + 1).padStart(2, '0')} / ${String(jerseySlides.length).padStart(2, '0')}`;
  }

  function startJerseyAutoplay() {
    window.clearInterval(jerseyTimer);
    if (prefersReducedMotion.matches) return;
    jerseyTimer = window.setInterval(() => showJersey(jerseyIndex + 1, false), 6000);
  }

  function pauseJerseyAutoplay() {
    window.clearInterval(jerseyTimer);
    if (prefersReducedMotion.matches) return;
    window.setTimeout(startJerseyAutoplay, 8500);
  }

  function showJersey(index, manual = true) {
    jerseyIndex = (index + jerseySlides.length) % jerseySlides.length;
    setJerseySlides(jerseyIndex);
    setJerseyInfo(jerseyIndex, true);
    if (manual) pauseJerseyAutoplay();
  }

  jerseySection.querySelector('.jersey-next')?.addEventListener('click', () => showJersey(jerseyIndex + 1));
  jerseySection.querySelector('.jersey-prev')?.addEventListener('click', () => showJersey(jerseyIndex - 1));
  document.addEventListener('keydown', (event) => {
    if (event.target instanceof Element && event.target.matches('input, textarea, select')) return;
    if (event.key === 'ArrowRight') showJersey(jerseyIndex + 1);
    if (event.key === 'ArrowLeft') showJersey(jerseyIndex - 1);
  });
  jerseyStage?.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  jerseyStage?.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 42) return;
    showJersey(jerseyIndex + (delta < 0 ? 1 : -1));
  }, { passive: true });
  jerseyStage?.addEventListener('pointermove', (event) => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const bounds = jerseyStage.getBoundingClientRect();
    const x = Math.max(-9, Math.min(9, (event.clientX - bounds.left) / bounds.width * 18 - 9));
    const y = Math.max(-6, Math.min(6, (event.clientY - bounds.top) / bounds.height * 12 - 6));
    jerseyStage.style.setProperty('--pointer-x', `${x}px`);
    jerseyStage.style.setProperty('--pointer-y', `${y}px`);
  });
  jerseyStage?.addEventListener('pointerleave', () => {
    jerseyStage.style.setProperty('--pointer-x', '0px');
    jerseyStage.style.setProperty('--pointer-y', '0px');
  });

  setJerseySlides(jerseyIndex);
  setJerseyInfo(jerseyIndex, false);
  if ('IntersectionObserver' in window) {
    const jerseyObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        jerseySection.classList.add('is-visible');
        startJerseyAutoplay();
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18 });
    jerseyObserver.observe(jerseySection);
  } else {
    jerseySection.classList.add('is-visible');
    startJerseyAutoplay();
  }
}

const membershipSection = document.querySelector('.membership-section');
if (membershipSection) {
  const membershipStage = membershipSection.querySelector('.membership-card-stage');
  const membershipSlides = Array.from(membershipSection.querySelectorAll('.membership-card-slide'));
  const membershipDots = Array.from(membershipSection.querySelectorAll('.membership-card-dots button'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let membershipIndex = 0;
  let membershipTimer;
  let membershipResumeTimer;
  let touchStartX = 0;

  function setMembershipCard(index) {
    const next = (index + 1) % membershipSlides.length;
    const previous = (index - 1 + membershipSlides.length) % membershipSlides.length;
    membershipSlides.forEach((slide, slideIndex) => {
      slide.classList.remove('is-active', 'is-next', 'is-prev', 'is-hidden');
      if (slideIndex === index) slide.classList.add('is-active');
      else if (slideIndex === next) slide.classList.add('is-next');
      else if (slideIndex === previous) slide.classList.add('is-prev');
      else slide.classList.add('is-hidden');
      slide.setAttribute('aria-hidden', slideIndex === index ? 'false' : 'true');
    });
    membershipDots.forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  function startMembershipAutoplay() {
    window.clearInterval(membershipTimer);
    window.clearTimeout(membershipResumeTimer);
    if (prefersReducedMotion.matches) return;
    membershipTimer = window.setInterval(() => showMembershipCard(membershipIndex + 1, false), 4600);
  }

  function pauseMembershipAutoplay() {
    window.clearInterval(membershipTimer);
    window.clearTimeout(membershipResumeTimer);
    if (prefersReducedMotion.matches) return;
    membershipResumeTimer = window.setTimeout(startMembershipAutoplay, 8200);
  }

  function showMembershipCard(index, manual = true) {
    membershipIndex = (index + membershipSlides.length) % membershipSlides.length;
    setMembershipCard(membershipIndex);
    if (manual) pauseMembershipAutoplay();
  }

  membershipDots.forEach((dot, index) => dot.addEventListener('click', () => showMembershipCard(index)));
  membershipStage?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') showMembershipCard(membershipIndex + 1);
    if (event.key === 'ArrowLeft') showMembershipCard(membershipIndex - 1);
  });
  membershipStage?.addEventListener('mouseenter', () => window.clearInterval(membershipTimer));
  membershipStage?.addEventListener('mouseleave', startMembershipAutoplay);
  membershipStage?.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  membershipStage?.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 42) return;
    showMembershipCard(membershipIndex + (delta < 0 ? 1 : -1));
  }, { passive: true });

  setMembershipCard(membershipIndex);
  startMembershipAutoplay();
}

document.querySelectorAll('.fixture-item').forEach((fixture, fixtureIndex) => {
  const matchup = fixture.querySelector(':scope > div');
  if (!matchup || matchup.classList.contains('fixture-matchup')) return;
  const teams = Array.from(matchup.querySelectorAll('strong')).map((team) => team.textContent.trim());
  const versus = matchup.querySelector('b');
  const isYanga = (name) => name.toUpperCase() === 'YANGA';
  const makeTeam = (name, side) => {
    const team = document.createElement('div');
    team.className = `fixture-team${isYanga(name) ? '' : ' fixture-team-opponent'}`;
    if (isYanga(name)) {
      const crest = document.createElement('img');
      crest.src = 'young-africansc.png';
      crest.alt = 'Young Africans crest';
      team.appendChild(crest);
    } else {
      const crest = document.createElement('span');
      crest.className = 'fixture-opponent-logo';
      crest.textContent = fixtureIndex === 0 ? 'M' : '?';
      team.appendChild(crest);
    }
    const label = document.createElement('strong');
    label.textContent = name;
    team.appendChild(label);
    if (side === 'right') team.classList.add('is-right');
    return team;
  };
  matchup.className = 'fixture-matchup';
  matchup.replaceChildren(makeTeam(teams[0], 'left'), versus, makeTeam(teams[1], 'right'));
  const ticket = document.createElement('a');
  ticket.className = 'fixture-ticket';
  ticket.href = '#fixtures';
  ticket.setAttribute('aria-label', `Buy tickets for ${teams[0]} versus ${teams[1]}`);
  ticket.innerHTML = 'BUY TICKETS <span>↗</span>';
  fixture.appendChild(ticket);
});

const shortsSection = document.querySelector('.shorts-section');
if (shortsSection) {
  const shortsRail = shortsSection.querySelector('.shorts-rail');
  const scrollShorts = (direction) => {
    shortsRail?.scrollBy({ left: direction * 220, behavior: 'smooth' });
  };
  shortsSection.querySelector('.shorts-prev')?.addEventListener('click', () => scrollShorts(-1));
  shortsSection.querySelector('.shorts-next')?.addEventListener('click', () => scrollShorts(1));
  shortsRail?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') scrollShorts(-1);
    if (event.key === 'ArrowRight') scrollShorts(1);
  });
}

const legacyShowcase = document.querySelector('.legacy-showcase');
if (legacyShowcase) {
  const trophySlides = Array.from(legacyShowcase.querySelectorAll('.legacy-showcase-trophy'));
  const dotsHost = legacyShowcase.querySelector('.legacy-showcase-dots');
  const detailLabel = legacyShowcase.querySelector('.legacy-showcase-label');
  const detailTitle = legacyShowcase.querySelector('.legacy-showcase-detail h3');
  const detailSubtitle = legacyShowcase.querySelector('.legacy-showcase-detail p');
  const detailCount = legacyShowcase.querySelector('.legacy-showcase-count');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let trophyIndex = 2;
  let trophyTimer;
  let touchStartX = 0;

  trophySlides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show trophy ${index + 1}`);
    dot.addEventListener('click', () => showTrophy(index));
    dotsHost?.appendChild(dot);
  });
  const trophyDots = dotsHost ? Array.from(dotsHost.querySelectorAll('button')) : [];

  function setTrophy(index) {
    trophyIndex = (index + trophySlides.length) % trophySlides.length;
    const total = trophySlides.length;
    trophySlides.forEach((slide, slideIndex) => {
      let relative = slideIndex - trophyIndex;
      if (relative > Math.floor(total / 2)) relative -= total;
      if (relative < -Math.floor(total / 2)) relative += total;
      slide.classList.remove('is-active', 'is-near', 'is-far', 'is-hidden');
      slide.style.setProperty('--position', relative);
      if (relative === 0) slide.classList.add('is-active');
      else if (Math.abs(relative) === 1) slide.classList.add('is-near');
      else if (Math.abs(relative) <= 3) slide.classList.add('is-far');
      else slide.classList.add('is-hidden');
      slide.setAttribute('aria-hidden', relative === 0 ? 'false' : 'true');
    });
    const active = trophySlides[trophyIndex];
    if (active) {
      detailLabel.textContent = active.dataset.label;
      detailTitle.textContent = active.dataset.title;
      detailSubtitle.innerHTML = active.dataset.subtitle;
      detailCount.innerHTML = active.dataset.count;
    }
    trophyDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === trophyIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function showTrophy(index, manual = true) {
    setTrophy(index);
    if (manual) startTrophyAutoplay(true);
  }

  function startTrophyAutoplay(reset = false) {
    if (reset) window.clearInterval(trophyTimer);
    if (prefersReducedMotion.matches) return;
    window.clearInterval(trophyTimer);
    trophyTimer = window.setInterval(() => showTrophy(trophyIndex + 1, false), 6200);
  }

  legacyShowcase.querySelector('.legacy-showcase-prev')?.addEventListener('click', () => showTrophy(trophyIndex - 1));
  legacyShowcase.querySelector('.legacy-showcase-next')?.addEventListener('click', () => showTrophy(trophyIndex + 1));
  legacyShowcase.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showTrophy(trophyIndex - 1);
    if (event.key === 'ArrowRight') showTrophy(trophyIndex + 1);
  });
  legacyShowcase.addEventListener('mouseenter', () => window.clearInterval(trophyTimer));
  legacyShowcase.addEventListener('mouseleave', () => startTrophyAutoplay());
  legacyShowcase.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  legacyShowcase.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 42) return;
    showTrophy(trophyIndex + (delta < 0 ? 1 : -1));
  }, { passive: true });

  setTrophy(trophyIndex);
  startTrophyAutoplay();
}

const playerRoster = [
  { file: 'Peter shalulile.png', name: 'PETER SHALULILE', marker: '7', role: 'forwards', label: 'FORWARD' },
  { file: 'Mudathil yahya.png', name: 'MUDATHIL YAHYA', marker: 'MY', role: 'midfielders', label: 'MIDFIELDER' },
  { file: 'Albert kangwanda.png', name: 'ALBERT KANGWANDA', marker: 'AL', role: 'forwards', label: 'FORWARD' },
  { file: 'Clement mzize.png', name: 'CLEMENT MZIZE', marker: 'CM', role: 'forwards', label: 'FORWARD' },
  { file: 'Bakali mwamnyeto.png', name: 'BAKALI MWAMNYETO', marker: 'BM', role: 'defenders', label: 'DEFENDER' },
  { file: 'Chuga boy.png', name: 'CHUGA BOY', marker: 'CB', role: 'forwards', label: 'FORWARD' },
  { file: 'Dickson job.png', name: 'DICKSON JOB', marker: 'DJ', role: 'defenders', label: 'DEFENDER' },
  { file: 'DJIGUI DIARRA.png', name: 'DGIGUE DIALLA', marker: 'DD', role: 'goalkeepers', label: 'GOALKEEPER' },
  { file: 'Duke abuya.png', name: 'DUKE ABUYA', marker: 'DA', role: 'midfielders', label: 'MIDFIELDER' },
  { file: 'Hussen Masalanga.png', name: 'HUSSEN MASALANGA', marker: 'HM', role: 'defenders', label: 'DEFENDER' },
  { file: 'Ibrahim bacca.png', name: 'IBRAHIM BACCA', marker: 'IB', role: 'defenders', label: 'DEFENDER' },
  { file: 'Ibrahim toure.png', name: 'IBRAHIM TOURE', marker: 'IT', role: 'forwards', label: 'FORWARD' },
  { file: 'Key aziz.png', name: 'KEY AZIZ', marker: 'KA', role: 'midfielders', label: 'MIDFIELDER' },
  { file: 'Koumala.png', name: 'KOUMALA', marker: 'KO', role: 'midfielders', label: 'MIDFIELDER' },
  { file: 'Maxi nzengeli.png', name: 'MAXI MPIA', marker: 'MX', role: 'midfielders', label: 'MIDFIELDER' },
  { file: 'Mohamed hussen.png', name: 'MOHAMED HUSSEN', marker: 'MH', role: 'defenders', label: 'DEFENDER' },
  { file: 'Mohamed koumala.png', name: 'MOHAMED KOUMALA', marker: 'MK', role: 'midfielders', label: 'MIDFIELDER' },
  { file: 'Mohamed mussa.png', name: 'MOHAMED MUSSA', marker: 'MM', role: 'midfielders', label: 'MIDFIELDER' },
  { file: 'Mwijage erick.png', name: 'MWIJAGE ERICK', marker: 'ME', role: 'midfielders', label: 'MIDFIELDER' },
  { file: 'Mwinyi kazi moto.png', name: 'MWINYI KAZI MOTO', marker: 'MK', role: 'forwards', label: 'FORWARD', lines: ['MWINYI', 'KAZI MOTO'] },
  { file: 'Shedrack boka.png', name: 'SHEDRACK BOKA', marker: 'SB', role: 'defenders', label: 'DEFENDER' },
  { file: 'Stephane key.png', name: 'STEPHANE KEY', marker: 'SK', role: 'midfielders', label: 'MIDFIELDER' },
  { file: 'Suleiman mwalimu.png', name: 'SULEIMAN MWALIMU', marker: 'SM', role: 'goalkeepers', label: 'GOALKEEPER' },
  { file: 'Yao kouasi.png', name: 'YAO KOUASI', marker: 'YK', role: 'forwards', label: 'FORWARD' },
  { file: 'Zakouani.png', name: 'ZAKOUANI', marker: 'Z', role: 'defenders', label: 'DEFENDER' },
];

/* Use a visible numeric squad number for every card; the existing numeric marker is preserved. */
playerRoster.forEach((player, index) => {
  player.number = /^\d+$/.test(player.marker) ? player.marker.padStart(2, '0') : String(index + 1).padStart(2, '0');
  player.stats = player.stats || { matches: 0, titles: 0, goals: 0, assists: 0 };
});

const rosterTrack = document.querySelector('.players-track');
if (rosterTrack) {
  const fragment = document.createDocumentFragment();
  playerRoster.forEach((player) => {
    const card = document.createElement('article');
    card.className = 'player-card';
    card.tabIndex = 0;
    card.dataset.role = player.role;
    card.dataset.playerName = player.name;
    const squadNumber = player.number;

    const marker = document.createElement('span');
    marker.className = 'player-card-number';
    marker.textContent = squadNumber;

    const image = document.createElement('img');
    image.className = 'player-card-photo';
    image.src = `Assets/${player.file}`;
    image.alt = `${player.name.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())} in the Young Africans kit`;

    const info = document.createElement('div');
    info.className = 'player-card-info';
    const nameBlock = document.createElement('div');
    const number = document.createElement('strong');
    number.textContent = squadNumber;
    const divider = document.createElement('span');
    const name = document.createElement('b');
    const lines = player.lines || (() => {
      const parts = player.name.split(' ');
      return parts.length > 1 ? [parts.slice(0, -1).join(' '), parts.at(-1)] : [player.name];
    })();
    name.innerHTML = lines.join('<br />');
    nameBlock.append(number, divider, name);
    const role = document.createElement('small');
    role.textContent = player.label;
    const crest = document.createElement('img');
    crest.src = 'young-africansc.png';
    crest.alt = 'Young Africans crest';
    info.append(nameBlock, role, crest);

    const details = document.createElement('div');
    details.className = 'player-card-details';
    const detailsTitle = document.createElement('strong');
    detailsTitle.className = 'player-card-details-title';
    detailsTitle.textContent = player.name;
    const detailsPosition = document.createElement('span');
    detailsPosition.className = 'player-card-details-position';
    detailsPosition.textContent = player.label;
    const stats = document.createElement('div');
    stats.className = 'player-card-stats';
    [
      ['MATCHES', player.stats.matches],
      ['TITLES', player.stats.titles],
      ['GOALS', player.stats.goals],
      ['ASSISTS', player.stats.assists],
    ].forEach(([label, value]) => {
      const stat = document.createElement('div');
      stat.className = 'player-card-stat';
      const statValue = document.createElement('strong');
      statValue.textContent = value;
      const statLabel = document.createElement('span');
      statLabel.textContent = label;
      stat.append(statValue, statLabel);
      stats.appendChild(stat);
    });
    const detailsNumber = document.createElement('small');
    detailsNumber.textContent = `SQUAD NO. ${squadNumber}`;
    details.append(detailsTitle, detailsPosition, stats, detailsNumber);

    card.append(marker, image, info, details);
    fragment.appendChild(card);
  });
  rosterTrack.replaceChildren(fragment);
}

function visiblePixelBounds(image) {
  if (!image.naturalWidth || !image.naturalHeight) return 0;
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return 0;
  try {
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let top = canvas.height;
    let bottom = -1;
    let left = canvas.width;
    let right = -1;
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        if (pixels[(y * canvas.width + x) * 4 + 3] > 18) {
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
          left = Math.min(left, x);
          right = Math.max(right, x);
        }
      }
    }
    return right >= left && bottom >= top
      ? { width: right - left + 1, height: bottom - top + 1 }
      : 0;
  } catch {
    return 0;
  }
}

function normalizePlayerImageSizes() {
  const images = Array.from(document.querySelectorAll('.players-track .player-card-photo'));
  if (images.some((image) => !image.complete)) return;
  const measurements = images.map((image) => {
    const bounds = visiblePixelBounds(image);
    if (!bounds || !image.clientWidth || !image.clientHeight) return null;
    const fitScale = Math.min(image.clientWidth / image.naturalWidth, image.clientHeight / image.naturalHeight);
    return { image, visibleHeight: bounds.height * fitScale };
  }).filter(Boolean);
  if (!measurements.length) return;
  measurements.forEach(({ image, visibleHeight }) => {
    const targetHeight = image.clientHeight * .92;
    const scale = Math.max(.9, Math.min(2.1, targetHeight / visibleHeight));
    image.style.setProperty('--player-image-scale', scale.toFixed(3));
  });
}

document.querySelectorAll('.players-track .player-card-photo').forEach((image) => image.addEventListener('load', normalizePlayerImageSizes, { once: true }));
window.addEventListener('resize', normalizePlayerImageSizes);
normalizePlayerImageSizes();

const playerShowcase = document.querySelector('.players-section');
if (playerShowcase) {
  const playerTrack = playerShowcase.querySelector('.players-track');
  const playerCards = Array.from(playerTrack?.querySelectorAll('.player-card') || []);
  const playerFilters = Array.from(playerShowcase.querySelectorAll('[data-player-filter]'));
  const playerDots = Array.from(playerShowcase.querySelectorAll('.players-dots button'));
  let playerFilter = 'all';
  let playerPage = 0;

  const getVisiblePlayers = () => playerCards.filter((card) => !card.hidden);
  const getScrollStep = () => {
    const firstVisibleCard = getVisiblePlayers()[0];
    if (!firstVisibleCard) return playerTrack.clientWidth || 1;
    const gap = Number.parseFloat(getComputedStyle(playerTrack).gap) || 0;
    return firstVisibleCard.getBoundingClientRect().width + gap;
  };

  const setPlayerDot = (index) => {
    playerDots.forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  };

  const applyPlayerFilter = (filter) => {
    playerFilter = filter;
    playerTrack?.classList.toggle('has-filter', filter !== 'all');
    playerFilters.forEach((button) => {
      const active = button.dataset.playerFilter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    playerCards.forEach((card) => {
      const visible = filter === 'all' || card.dataset.role === filter;
      card.hidden = !visible;
      card.setAttribute('aria-hidden', visible ? 'false' : 'true');
    });
    playerPage = 0;
    playerTrack?.scrollTo({ left: 0, behavior: 'smooth' });
    setPlayerDot(playerPage);
  };

  const scrollPlayers = (direction) => {
    if (!playerTrack || getVisiblePlayers().length < 2) return;
    const maxScroll = Math.max(0, playerTrack.scrollWidth - playerTrack.clientWidth);
    if (!maxScroll) return;
    const nextScroll = playerTrack.scrollLeft + direction * getScrollStep();
    const targetScroll = nextScroll > maxScroll ? 0 : nextScroll < 0 ? maxScroll : nextScroll;
    playerTrack.scrollTo({ left: targetScroll, behavior: 'smooth' });
    playerPage = (playerPage + direction + playerDots.length) % playerDots.length;
    setPlayerDot(playerPage);
  };

  const scrollToPlayerPage = (index) => {
    if (!playerTrack) return;
    const maxScroll = Math.max(0, playerTrack.scrollWidth - playerTrack.clientWidth);
    const targetScroll = maxScroll * (index / Math.max(1, playerDots.length - 1));
    playerTrack.scrollTo({ left: targetScroll, behavior: 'smooth' });
    playerPage = index;
    setPlayerDot(playerPage);
  };

  const updatePlayerPageFromScroll = () => {
    const maxScroll = Math.max(0, playerTrack.scrollWidth - playerTrack.clientWidth);
    if (!maxScroll) return;
    playerPage = Math.round((playerTrack.scrollLeft / maxScroll) * (playerDots.length - 1));
    setPlayerDot(playerPage);
  };

  /* Keep the cards in place while the track itself glides horizontally. */
  playerTrack?.addEventListener('scroll', updatePlayerPageFromScroll, { passive: true });

  const handlePlayerKey = (event) => {
    if (event.key === 'ArrowLeft') scrollPlayers(-1);
    if (event.key === 'ArrowRight') scrollPlayers(1);
  };

  playerFilters.forEach((button) => button.addEventListener('click', () => applyPlayerFilter(button.dataset.playerFilter || 'all')));
  playerShowcase.querySelector('.players-arrow-prev')?.addEventListener('click', () => scrollPlayers(-1));
  playerShowcase.querySelector('.players-arrow-next')?.addEventListener('click', () => scrollPlayers(1));
  playerDots.forEach((dot, index) => dot.addEventListener('click', () => scrollToPlayerPage(index)));
  playerShowcase.addEventListener('keydown', handlePlayerKey);

  applyPlayerFilter(playerFilter);
}

const revealTargets = document.querySelectorAll('.news-section .story-card, .team-section .player-stage, .numbers-section .number-item, .membership-section .membership-card-stage, .players-section .player-card, .tv-section .video-card, .partners-section .partner-logo');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealTargets.forEach((item) => item.classList.add('reveal-ready'));
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });
  revealTargets.forEach((item) => revealObserver.observe(item));
}

document.querySelector('.footer-newsletter form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = event.currentTarget.querySelector('input');
  const button = event.currentTarget.querySelector('button');
  if (input.value.trim()) {
    input.value = '';
    input.placeholder = 'You are with Yanga ✓';
    button.textContent = '✓';
  }
});

const calendarCountdown = document.querySelector('[data-calendar-countdown]');
if (calendarCountdown) {
  const nextMatchTime = new Date('2026-11-07T19:00:00+03:00').getTime();
  const updateCalendarCountdown = () => {
    const remaining = Math.max(0, nextMatchTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const values = { days, hours, minutes, seconds };
    Object.entries(values).forEach(([part, value]) => {
      const target = calendarCountdown.querySelector(`[data-calendar-part="${part}"]`);
      if (target) target.textContent = String(value).padStart(2, '0');
    });
  };
  updateCalendarCountdown();
  window.setInterval(updateCalendarCountdown, 1000);
}

document.querySelector('.calendar-sync')?.addEventListener('click', (event) => {
  event.currentTarget.innerHTML = 'CALENDAR SYNCED <span aria-hidden="true">&#10003;</span>';
});

const clubCategoryAssets = [
  { file: 'Kangwanda.jpg', alt: 'Young Africans men first team player Kangwanda' },
  { file: 'Young africans women1.jpg', alt: 'Young Africans women team player' },
  { file: 'Young soccer school.jpg', alt: 'Young Africans Soccer School player' },
  { file: 'Young under twenty.jpg', alt: 'Young Africans Under Twenty player' },
];
document.querySelectorAll('.club-category-card img').forEach((image, index) => {
  const asset = clubCategoryAssets[index];
  if (!asset) return;
  image.src = `Assets/${asset.file}`;
  image.alt = asset.alt;
});

const shortStoryAssets = [
  {
    file: 'Hamsa.png',
    video: 'Video-95306.mp4',
    alt: 'Young Africans players celebrating a five-goal victory',
    label: 'FIRST TEAM',
    title: 'Five-star football.',
    description: 'Full-time joy from the Wananchi.',
  },
  {
    file: 'Clement mzize.png',
    video: 'Video-64366.mp4',
    alt: 'Clement Mzize in a Young Africans green jersey',
    label: 'FIRST TEAM',
    title: 'Clement Mzize: Ready for more.',
    description: 'A new face for the next chapter.',
  },
  {
    file: 'Young africans women1.jpg',
    video: 'Video-42397.mp4',
    type: 'photo',
    alt: 'Young Africans women team player celebrating',
    label: "WOMEN'S TEAM",
    title: 'Women of Yanga: Strong together.',
    description: 'Pride in every move.',
  },
  {
    file: 'Ibrahim bacca.png',
    video: 'Video-19426.mp4',
    alt: 'Ibrahim Bacca in a Young Africans green jersey',
    label: 'FIRST TEAM',
    title: 'Ibrahim Bacca: Built for it.',
    description: 'Composure, power and purpose.',
  },
  {
    file: 'Academy.png',
    video: 'Video-32118.mp4',
    type: 'photo',
    alt: 'Young Africans Academy player in training',
    label: 'ACADEMY',
    title: 'The academy: Future in motion.',
    description: 'The next generation starts here.',
  },
  {
    file: 'Yao kouasi.png',
    video: 'Video-69668.mp4',
    alt: 'Yao Kouasi in a Young Africans yellow jersey',
    label: 'THE YANGA WAY',
    title: 'Yao Kouasi: In motion.',
    description: 'The future moves together.',
  },
  {
    file: 'Young soccer school.jpg',
    video: 'Video-85725.mp4',
    type: 'photo',
    alt: 'Young Africans Soccer School child training with a football',
    label: 'SOCCER SCHOOL',
    title: 'Young stars: Start here.',
    description: 'The game belongs to everyone.',
  },
];

document.querySelectorAll('.shorts-rail .short-card').forEach((card, index) => {
  const asset = shortStoryAssets[index];
  if (!asset) return;
  const image = card.querySelector('.short-card-media img');
  const label = card.querySelector('.short-card-copy > span');
  const title = card.querySelector('.short-card-copy h3');
  const description = card.querySelector('.short-card-copy p');
  if (image) {
    image.src = `Assets/${asset.file}`;
    image.alt = asset.alt;
  }
  if (label) label.textContent = asset.label;
  if (title) title.textContent = asset.title;
  if (description) description.textContent = asset.description;
  card.href = `Assets/${asset.video}`;
  card.setAttribute('aria-label', `Play ${asset.title}`);
  card.classList.toggle('short-card-player', asset.type !== 'photo');
  card.classList.toggle('short-card-photo', asset.type === 'photo');
});

const shortVideoModal = document.createElement('div');
shortVideoModal.className = 'short-video-modal';
shortVideoModal.hidden = true;
shortVideoModal.innerHTML = `
  <button class="short-video-modal-backdrop" type="button" aria-label="Close video"></button>
  <div class="short-video-dialog" role="dialog" aria-modal="true" aria-labelledby="short-video-title">
    <div class="short-video-dialog-head">
      <div>
        <span class="short-video-kicker"></span>
        <h2 id="short-video-title"></h2>
      </div>
      <button class="short-video-close" type="button" aria-label="Close video">&#215;</button>
    </div>
    <video class="short-video-player" controls playsinline preload="metadata"></video>
  </div>
`;
document.body.appendChild(shortVideoModal);

const shortVideoPlayer = shortVideoModal.querySelector('.short-video-player');
const shortVideoTitle = shortVideoModal.querySelector('#short-video-title');
const shortVideoKicker = shortVideoModal.querySelector('.short-video-kicker');
const shortVideoClose = shortVideoModal.querySelector('.short-video-close');
let shortVideoTrigger = null;
let shortVideoHideTimer;

function closeShortVideo() {
  window.clearTimeout(shortVideoHideTimer);
  shortVideoModal.classList.remove('is-open');
  document.body.classList.remove('short-video-open');
  shortVideoPlayer.pause();
  shortVideoPlayer.removeAttribute('src');
  shortVideoPlayer.load();
  shortVideoHideTimer = window.setTimeout(() => { shortVideoModal.hidden = true; }, 180);
  shortVideoTrigger?.focus();
}

document.querySelectorAll('.shorts-rail .short-card').forEach((card, index) => {
  const asset = shortStoryAssets[index];
  if (!asset?.video) return;
  card.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    shortVideoTrigger = card;
    shortVideoKicker.textContent = asset.label;
    shortVideoTitle.textContent = asset.title;
    shortVideoPlayer.src = `Assets/${asset.video}`;
    window.clearTimeout(shortVideoHideTimer);
    shortVideoModal.hidden = false;
    document.body.classList.add('short-video-open');
    requestAnimationFrame(() => shortVideoModal.classList.add('is-open'));
    shortVideoClose.focus();
    shortVideoPlayer.play().catch(() => {});
  });
});

shortVideoClose.addEventListener('click', closeShortVideo);
shortVideoModal.querySelector('.short-video-modal-backdrop').addEventListener('click', closeShortVideo);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !shortVideoModal.hidden) closeShortVideo();
});

const standalonePartners = document.querySelector('.partners-section');
standalonePartners?.remove();

const siteFooter = document.querySelector('.site-footer');
if (siteFooter && !siteFooter.querySelector('.footer-partners')) {
  siteFooter.insertAdjacentHTML('afterbegin', `
    <section class="footer-partners" id="partners" aria-labelledby="footer-partners-title">
      <div class="footer-partners-inner">
        <div class="footer-partners-head">
          <div>
            <span class="footer-partners-kicker">TOGETHER WE MOVE</span>
            <h2 id="footer-partners-title">MAIN PARTNERS</h2>
          </div>
          <span class="footer-partners-note">Official partners of Young Africans SC</span>
        </div>
        <div class="footer-partner-logos">
          <div class="footer-partner-logo">
            <small>MAIN PARTNER</small>
            <img src="Assets/SportPesa_Royal_Blue_Logo-removebg-preview.png" alt="SportPesa" />
          </div>
          <div class="footer-partner-logo">
            <small>MEDIA PARTNER</small>
            <img src="Assets/azam-tv-01.png" alt="Azam TV" />
          </div>
          <div class="footer-partner-logo">
            <small>OFFICIAL PARTNER</small>
            <img src="Assets/GSMAbdas-removebg-preview.png" alt="GSM" />
          </div>
        </div>
      </div>
    </section>
  `);
}
