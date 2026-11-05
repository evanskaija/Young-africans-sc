const newsStories = [
  {
    id: 'standard-is-worn',
    category: 'first-team',
    categoryLabel: 'FIRST TEAM',
    date: '05 NOV 2026',
    isoDate: '2026-11-05',
    readTime: '4 MIN READ',
    image: 'Assets/fiston-mayele.png',
    title: 'The standard is worn before it is spoken.',
    dek: 'Focus, pride and purpose from the heart of Wananchi.',
    caption: 'First-team focus before the next ninety.',
    body: [
      { type: 'p', text: 'Every Young Africans story begins with the same promise: arrive ready, work for the badge and leave everything on the pitch.' },
      { type: 'heading', text: 'Built in the details' },
      { type: 'p', text: 'Around the training ground, the details matter. The first touch, the final sprint and the quiet conversations between teammates all build the standard that supporters recognise on matchday.' },
      { type: 'p', text: 'The work is visible in the intensity of every session, but the identity is built in the moments that happen between them: the encouragement, the discipline and the decision to keep raising the level.' },
      { type: 'p', text: 'This is the Yanga way - a collective identity shaped by belief, responsibility and the pride of wearing the colours.' }
    ]
  },
  {
    id: 'next-generation',
    category: 'academy',
    categoryLabel: 'ACADEMY',
    date: '04 NOV 2026',
    isoDate: '2026-11-04',
    readTime: '3 MIN READ',
    image: 'Assets/Academy.png',
    title: 'The next generation starts here.',
    dek: 'A new wave of Wananchi is taking shape through patience, coaching and daily work.',
    caption: 'Young talent learning the Yanga way.',
    body: [
      { type: 'p', text: 'The academy is where ambition becomes habit. Each session gives the next generation a chance to learn the game and the values that come with representing Young Africans.' },
      { type: 'heading', text: 'A pathway with purpose' },
      { type: 'p', text: 'From technical repetition to teamwork under pressure, the pathway is designed to help young players grow with confidence and purpose.' },
      { type: 'p', text: 'The environment asks for curiosity, discipline and patience. Progress is measured in the small improvements that become instinct over time.' },
      { type: 'p', text: 'The future is not promised - it is built, one training day at a time.' }
    ]
  },
  {
    id: 'women-setting-the-tempo',
    category: 'women',
    categoryLabel: 'WOMEN',
    date: '03 NOV 2026',
    isoDate: '2026-11-03',
    readTime: '4 MIN READ',
    image: 'Assets/Young african women.webp',
    title: 'The women setting the tempo.',
    dek: 'Movement, confidence and shared purpose continue to shape the women\'s game at Yanga.',
    caption: 'The women\'s game moving forward together.',
    body: [
      { type: 'p', text: 'The women\'s game at Young Africans is driven by the same values that connect every Yanga team: togetherness, courage and a willingness to do the work.' },
      { type: 'heading', text: 'A collective rhythm' },
      { type: 'p', text: 'On the pitch, every movement has a purpose. Players create space for one another, communicate through pressure and trust the work that has happened before the whistle.' },
      { type: 'p', text: 'That shared rhythm gives the team a clear identity - one built on energy, discipline and the belief that every contribution matters.' },
      { type: 'p', text: 'The journey continues with the badge at the centre and Wananchi behind it.' }
    ]
  },
  {
    id: 'matchday-belief',
    category: 'match-reports',
    categoryLabel: 'MATCH REPORTS',
    date: '02 NOV 2026',
    isoDate: '2026-11-02',
    readTime: '4 MIN READ',
    image: 'Assets/Intense Soccer Agility Drill.png',
    title: 'A result built on collective belief.',
    dek: 'The lessons of matchday live in the work, the response and the next challenge.',
    caption: 'Intensity before matchday.',
    body: [
      { type: 'p', text: 'A match report is more than a scoreline. It is a record of the decisions, the reactions and the togetherness that shape a team across ninety minutes.' },
      { type: 'heading', text: 'The work behind the result' },
      { type: 'p', text: 'The squad continues to push the tempo in training, preparing for the moments where one decision can change the entire story. That preparation creates the confidence to stay composed when the game asks difficult questions.' },
      { type: 'p', text: 'The response matters as much as the moment itself. Every challenge becomes information, every phase becomes a lesson and every lesson feeds the next performance.' },
      { type: 'p', text: 'When the whistle goes, the work becomes expression.' }
    ]
  },
  {
    id: 'next-chapter',
    category: 'club',
    categoryLabel: 'CLUB UPDATES',
    date: '01 NOV 2026',
    isoDate: '2026-11-01',
    readTime: '5 MIN READ',
    image: 'Assets/Hersi said.png',
    title: 'Building the next chapter.',
    dek: 'Leadership, vision and ambition continue to shape the future of Yanga.',
    caption: 'A club moving forward together.',
    body: [
      { type: 'p', text: 'A football club is more than what happens for ninety minutes. It is a community, a history and a long-term commitment to the people who carry the badge.' },
      { type: 'heading', text: 'Progress with a clear purpose' },
      { type: 'p', text: 'The next chapter is being shaped through clearer standards, stronger foundations and a belief that progress should be felt across every part of the club.' },
      { type: 'p', text: 'That means protecting the values that made Yanga, while continuing to create the conditions for players, staff and supporters to move forward together.' },
      { type: 'p', text: 'For Wananchi, the direction remains clear: keep raising the level.' }
    ]
  },
  {
    id: 'energy-every-step',
    category: 'first-team',
    categoryLabel: 'FIRST TEAM',
    date: '31 OCT 2026',
    isoDate: '2026-10-31',
    readTime: '3 MIN READ',
    image: 'Assets/Mwalimu.png',
    title: 'Energy in every step.',
    dek: 'The Yanga way is built through discipline, movement and shared purpose.',
    caption: 'The work behind the performance.',
    body: [
      { type: 'p', text: 'The best performances are prepared long before the stadium lights come on. The work is physical, but it is also mental: stay connected, stay brave and keep moving.' },
      { type: 'heading', text: 'The rhythm of preparation' },
      { type: 'p', text: 'Every player contributes to the rhythm of the group. That shared energy is what turns preparation into confidence when matchday arrives.' },
      { type: 'p', text: 'The badge asks for commitment in every step - and the group keeps answering.' }
    ]
  },
  {
    id: 'wear-the-badge',
    category: 'club',
    categoryLabel: 'CLUB UPDATES',
    date: '30 OCT 2026',
    isoDate: '2026-10-30',
    readTime: '2 MIN READ',
    image: 'Assets/Young Africans Green Football Jersey.png',
    title: 'Wear the badge with pride.',
    dek: 'Three colours. One badge. One identity.',
    caption: 'The colours that connect Wananchi.',
    body: [
      { type: 'p', text: 'The shirt is a meeting point between generations. It carries the history of the club, the voice of the supporters and the promise made by every player who wears it.' },
      { type: 'heading', text: 'A shared language' },
      { type: 'p', text: 'Green, yellow and black are more than colours - they are a shared language across Dar es Salaam and beyond.' },
      { type: 'p', text: 'Wear it with pride. Carry it with purpose.' }
    ]
  },
  {
    id: 'young-wananchi',
    category: 'academy',
    categoryLabel: 'ACADEMY',
    date: '29 OCT 2026',
    isoDate: '2026-10-29',
    readTime: '3 MIN READ',
    image: 'Assets/young soccer school.jpg',
    title: 'A place to learn, dream and belong.',
    dek: 'The next generation is rising through football and community.',
    caption: 'Where the journey begins.',
    body: [
      { type: 'p', text: 'Every young player deserves a place to discover what they can become. The Yanga pathway gives that discovery structure, support and a sense of belonging.' },
      { type: 'heading', text: 'More than the game' },
      { type: 'p', text: 'The lessons go beyond football: listen, work together, respect the game and believe in your ability to improve.' },
      { type: 'p', text: 'That is how the next generation begins to write its own chapter.' }
    ]
  },
  {
    id: 'women-with-purpose',
    category: 'women',
    categoryLabel: 'WOMEN',
    date: '28 OCT 2026',
    isoDate: '2026-10-28',
    readTime: '3 MIN READ',
    image: 'Assets/Yanga women.webp',
    title: 'A team with purpose.',
    dek: 'Confidence grows when the group keeps moving in the same direction.',
    caption: 'Togetherness at the heart of the women\'s team.',
    body: [
      { type: 'p', text: 'Every team has a personality. For the women of Yanga, it is expressed through commitment to one another and a determination to keep improving.' },
      { type: 'heading', text: 'Together is the way forward' },
      { type: 'p', text: 'The group keeps building through honest work, clear communication and the courage to make the next action count.' },
      { type: 'p', text: 'With Wananchi behind them, the journey continues.' }
    ]
  },
  {
    id: 'ready-when-the-whistle-goes',
    category: 'first-team',
    categoryLabel: 'FIRST TEAM',
    date: '29 OCT 2026',
    isoDate: '2026-10-29',
    readTime: '3 MIN READ',
    image: 'Assets/DJIGUI DIARRA.png',
    title: 'Ready when the whistle goes.',
    dek: 'Preparation, focus and calm are built before the match begins.',
    caption: 'Ready for the next ninety.',
    body: [
      { type: 'p', text: 'The whistle is the beginning of the performance, not the beginning of the preparation. Every session builds the focus needed for that first moment.' },
      { type: 'heading', text: 'Calm under pressure' },
      { type: 'p', text: 'From the first save to the final decision, readiness comes from repetition and trust. The group keeps working so every player can meet the next challenge with clarity.' },
      { type: 'p', text: 'When matchday arrives, the work speaks through the team.' }
    ]
  },
  {
    id: 'clement-ready-for-more',
    category: 'first-team',
    categoryLabel: 'FIRST TEAM',
    date: '27 OCT 2026',
    isoDate: '2026-10-27',
    readTime: '3 MIN READ',
    image: 'Assets/Clement mzize.png',
    title: 'Clement Mzize: Ready for more.',
    dek: 'A new face for the next chapter, carrying ambition into every session.',
    caption: 'Clement Mzize ready for the next chapter.',
    body: [
      { type: 'p', text: 'Every new chapter begins with a player willing to learn, compete and take responsibility for the badge. Clement Mzize is ready for that next step.' },
      { type: 'heading', text: 'A new face with a clear focus' },
      { type: 'p', text: 'The work is in the details: sharper movement, stronger decisions and the confidence to ask for the ball when the moment demands it.' },
      { type: 'p', text: 'With the support of his teammates and the belief of Wananchi, the next chapter is already moving.' }
    ]
  },
  {
    id: 'ibrahim-built-for-it',
    category: 'first-team',
    categoryLabel: 'FIRST TEAM',
    date: '26 OCT 2026',
    isoDate: '2026-10-26',
    readTime: '3 MIN READ',
    image: 'Assets/Ibrahim bacca.png',
    title: 'Ibrahim Bacca: Built for it.',
    dek: 'Composure, power and purpose shape every moment in the first team.',
    caption: 'Ibrahim Bacca built for the next challenge.',
    body: [
      { type: 'p', text: 'There are moments in a match that ask for calm under pressure. Ibrahim Bacca meets those moments with composure, power and purpose.' },
      { type: 'heading', text: 'Strength with intention' },
      { type: 'p', text: 'The foundation is built every day through repetition, communication and the discipline to stay ready before the opportunity arrives.' },
      { type: 'p', text: 'For Bacca, the next challenge is another chance to raise the level and help the team move forward together.' }
    ]
  }
];

const newsGrid = document.querySelector('[data-news-grid]');
const newsEmpty = document.querySelector('[data-news-empty]');
const newsIndex = document.querySelector('[data-news-index]');
const newsDetail = document.querySelector('[data-news-detail]');
const relatedGrid = document.querySelector('[data-related-grid]');
const storyById = new Map(newsStories.map((story) => [story.id, story]));

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function storyUrl(story) {
  return 'news.html?story=' + encodeURIComponent(story.id);
}

function storyCard(story, related) {
  const readLabel = related ? 'READ STORY' : 'READ FULL STORY';
  return '<article class=\"news-card' + (related ? ' news-card--related' : '') + '\" data-news-category=\"' + story.category + '\" data-story-id=\"' + story.id + '\" tabindex=\"0\" aria-label=\"Read ' + escapeHtml(story.title) + '\">' +
    '<a class=\"news-card-media\" href=\"' + storyUrl(story) + '\" aria-label=\"Read ' + escapeHtml(story.title) + '\">' +
      '<img src=\"' + story.image + '\" alt=\"' + escapeHtml(story.caption) + '\" loading=\"lazy\" />' +
      '<span class=\"news-card-open\">-&gt;</span>' +
    '</a>' +
    '<div class=\"news-card-info\">' +
      '<div class=\"news-card-meta\"><span>' + escapeHtml(story.categoryLabel) + '</span><time datetime=\"' + story.isoDate + '\">' + escapeHtml(story.date) + '</time></div>' +
      '<h3><a href=\"' + storyUrl(story) + '\">' + escapeHtml(story.title) + '</a></h3>' +
      '<div class=\"news-card-reveal\"><p>' + escapeHtml(story.dek) + '</p><a class=\"news-card-read\" href=\"' + storyUrl(story) + '\">' + readLabel + ' <b>-&gt;</b></a></div>' +
    '</div>' +
  '</article>';
}

function renderNews(filter) {
  if (!newsGrid) return;
  const activeFilter = filter || 'all';
  const visibleStories = activeFilter === 'all' ? newsStories : newsStories.filter((story) => story.category === activeFilter);
  newsGrid.innerHTML = visibleStories.map((story) => storyCard(story, false)).join('');
  if (newsEmpty) newsEmpty.hidden = visibleStories.length > 0;
}

function renderBody(story) {
  let firstParagraph = true;
  return story.body.map((block) => {
    if (block.type === 'heading') return '<h2>' + escapeHtml(block.text) + '</h2>';
    const className = firstParagraph ? ' class=\"news-detail-lede\"' : '';
    firstParagraph = false;
    return '<p' + className + '>' + escapeHtml(block.text) + '</p>';
  }).join('');
}

function updateMeta(story) {
  document.title = story.title + ' | Young Africans SC';
  const description = document.querySelector('meta[name=\"description\"]');
  const ogTitle = document.querySelector('meta[property=\"og:title\"]');
  const ogDescription = document.querySelector('meta[property=\"og:description\"]');
  const ogImage = document.querySelector('meta[property=\"og:image\"]');
  const canonical = document.querySelector('link[rel=\"canonical\"]');
  if (description) description.content = story.dek;
  if (ogTitle) ogTitle.content = story.title + ' | Young Africans SC';
  if (ogDescription) ogDescription.content = story.dek;
  if (ogImage) ogImage.content = story.image;
  if (canonical) canonical.href = storyUrl(story);

  let structuredData = document.querySelector('#news-article-schema');
  if (!structuredData) {
    structuredData = document.createElement('script');
    structuredData.id = 'news-article-schema';
    structuredData.type = 'application/ld+json';
    document.head.appendChild(structuredData);
  }
  structuredData.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: story.title,
    description: story.dek,
    image: [story.image],
    datePublished: story.isoDate,
    dateModified: story.isoDate,
    author: { '@type': 'Organization', name: 'Young Africans SC' },
    publisher: { '@type': 'Organization', name: 'Young Africans SC' },
    mainEntityOfPage: storyUrl(story)
  });
}

function renderRelated(story) {
  if (!relatedGrid) return;
  const related = newsStories
    .filter((item) => item.id !== story.id)
    .sort((a, b) => Number(b.category === story.category) - Number(a.category === story.category))
    .slice(0, 3);
  relatedGrid.innerHTML = related.map((item) => storyCard(item, true)).join('');
}

function renderDetail(story) {
  if (!story || !newsDetail || !newsIndex) return;
  document.body.classList.add('news-page--detail');
  newsIndex.hidden = true;
  newsDetail.hidden = false;
  const image = newsDetail.querySelector('[data-detail-image]');
  image.src = story.image;
  image.alt = story.caption;
  newsDetail.querySelector('[data-detail-caption]').textContent = story.caption;
  newsDetail.querySelector('[data-detail-category]').textContent = story.categoryLabel;
  newsDetail.querySelector('[data-detail-date]').textContent = story.date;
  newsDetail.querySelector('[data-detail-date]').dateTime = story.isoDate;
  newsDetail.querySelector('[data-detail-read-time]').textContent = story.readTime;
  newsDetail.querySelector('[data-detail-title]').textContent = story.title;
  newsDetail.querySelector('[data-detail-dek]').textContent = story.dek;
  newsDetail.querySelector('[data-detail-body]').innerHTML = renderBody(story);
  renderRelated(story);
  updateMeta(story);
}

function getSelectedStory() {
  const queryStory = new URLSearchParams(window.location.search).get('story');
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const pathStory = pathParts[pathParts.length - 2] === 'news' ? pathParts[pathParts.length - 1] : '';
  return storyById.get(queryStory || pathStory);
}

document.querySelectorAll('[data-news-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-news-filter]').forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });
    renderNews(button.dataset.newsFilter);
  });
});

document.addEventListener('click', async (event) => {
  const share = event.target.closest('[data-share]');
  if (share) {
    event.preventDefault();
    const currentUrl = window.location.href;
    if (share.dataset.share === 'copy' && navigator.clipboard) {
      await navigator.clipboard.writeText(currentUrl);
      share.textContent = 'OK';
      window.setTimeout(() => { share.textContent = '->'; }, 1200);
      return;
    }
    if (share.dataset.share === 'x') window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(currentUrl), '_blank', 'noopener,noreferrer');
    if (share.dataset.share === 'facebook') window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(currentUrl), '_blank', 'noopener,noreferrer');
    return;
  }

  const card = event.target.closest('.news-card');
  if (card && !event.target.closest('a, button')) {
    const story = storyById.get(card.dataset.storyId);
    if (story) window.location.href = storyUrl(story);
  }
});

document.addEventListener('keydown', (event) => {
  const card = event.target.closest('.news-card');
  if (card && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    const story = storyById.get(card.dataset.storyId);
    if (story) window.location.href = storyUrl(story);
  }
});

renderNews('all');
const selectedStory = getSelectedStory();
if (selectedStory) renderDetail(selectedStory);
