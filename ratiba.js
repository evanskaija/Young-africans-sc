(() => {
  const PAGE_SIZE = 8;
  const teamNames = { MEN: "Young Africans SC First Team", WOMEN: "Young Africans Women's Team", UNDER_20: 'Young Africans U20' };
  const state = { teamCategory: 'MEN', season: 'all', competition: 'all', timeZone: 'Africa/Dar_es_Salaam', fixtures: [], results: [], standings: [], seasons: [], competitions: [], fixturePage: 0, resultPage: 0, fixtureHasMore: false, resultHasMore: false, fixtureLoading: false, resultLoading: false, error: false, preview: false };
  const tabs = Array.from(document.querySelectorAll('[data-ratiba-tab]'));
  const teamFilters = Array.from(document.querySelectorAll('[data-team-filter]'));
  const views = Array.from(document.querySelectorAll('[data-ratiba-view]'));
  const nextMatchContent = document.querySelector('[data-next-match-content]');
  const fixtureList = document.querySelector('[data-fixture-list]');
  const resultList = document.querySelector('[data-result-list]');
  const standingsList = document.querySelector('[data-standings-list]');
  const competitionFilter = document.querySelector('[data-competition-filter]');
  const seasonFilter = document.querySelector('[data-season-filter]');
  const loadMoreButtons = Array.from(document.querySelectorAll('[data-load-more]'));
  const escapeHtml = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
  const parsedDate = (value) => value ? new Date(value) : null;
  const validDate = (value) => parsedDate(value) && !Number.isNaN(parsedDate(value).getTime());
  const formatter = (options) => new Intl.DateTimeFormat('sw-TZ', Object.assign({}, options, { timeZone: state.timeZone }));
  const formatDate = (value) => validDate(value) ? formatter({ weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(parsedDate(value)) : 'Muda haujathibitishwa';
  const formatShortDate = (value) => validDate(value) ? formatter({ day: '2-digit', month: 'short', year: 'numeric' }).format(parsedDate(value)) : 'Muda haujathibitishwa';
  const formatTime = (value, confirmed = true) => !confirmed ? 'Muda haujathibitishwa' : (validDate(value) ? formatter({ hour: '2-digit', minute: '2-digit', hour12: false }).format(parsedDate(value)) + ' EAT' : 'Muda TBC');
  const categoryLabel = (value) => ({ MEN: 'MEN', WOMEN: 'WOMEN', UNDER_20: 'UNDER-20' }[value] || value || 'TEAM');
  const statusLabel = (value) => ({ SCHEDULED: 'Scheduled', POSTPONED: 'Postponed', CANCELLED: 'Cancelled', COMPLETED: 'Completed' }[value] || value || 'Unconfirmed');
  const crest = (url, name) => {
    const initials = escapeHtml(String(name || '?').slice(0, 2).toUpperCase());
    if (!url) return '<span class="ratiba-crest-placeholder" aria-label="Crest unavailable">' + initials + '</span>';
    return '<span class="ratiba-crest"><img src="' + escapeHtml(url) + '" alt="' + escapeHtml(name) + ' crest" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false" /><span class="ratiba-crest-placeholder" hidden aria-label="Crest unavailable">' + initials + '</span></span>';
  };
  const unavailable = (title, message) => '<div class="ratiba-empty"><span class="ratiba-empty-mark">—</span><strong>' + escapeHtml(title) + '</strong><p>' + escapeHtml(message) + '</p></div>';
  const officialLink = (url, label, disabled) => url ? '<a class="ratiba-action-link" href="' + escapeHtml(url) + '" target="_blank" rel="noopener">' + escapeHtml(label) + ' <span>↗</span></a>' : '<span class="ratiba-action-link is-disabled" aria-disabled="true">' + escapeHtml(disabled || 'Taarifa haipatikani') + '</span>';
  const visiblePreview = () => (window.RATIBA_PREVIEW_FIXTURES || []).filter((item) => item.teamCategory === state.teamCategory && (state.season === 'all' || item.season === state.season) && (state.competition === 'all' || item.competition === state.competition));
  const previewPage = (view, page) => {
    const source = visiblePreview().filter((item) => view === 'results' ? item.status === 'COMPLETED' : item.status !== 'COMPLETED');
    source.sort((a, b) => view === 'results' ? parsedDate(b.kickoffAt) - parsedDate(a.kickoffAt) : parsedDate(a.kickoffAt) - parsedDate(b.kickoffAt));
    const start = (page - 1) * PAGE_SIZE;
    return { fixtures: source.slice(start, start + PAGE_SIZE), hasMore: start + PAGE_SIZE < source.length };
  };
  const fixtureRow = (item, result) => {
    const score = result ? '<strong class="ratiba-score">' + escapeHtml(item.homeScore) + ' <b>—</b> ' + escapeHtml(item.awayScore) + '</strong>' : '<strong class="ratiba-time">' + escapeHtml(formatTime(item.kickoffAt, item.kickoffTimeConfirmed)) + '</strong>';
    const side = item.clubSide === 'AWAY' ? 'AWAY' : 'HOME';
    return '<article class="ratiba-fixture-row ' + (result ? 'is-result' : '') + '"><div class="ratiba-fixture-date"><strong>' + escapeHtml(formatShortDate(item.kickoffAt)) + '</strong><span>' + escapeHtml(item.competition) + '</span><small>' + escapeHtml(item.season || '') + '</small></div><div class="ratiba-fixture-teams"><div>' + crest(item.homeCrestUrl, item.homeTeam) + '<strong>' + escapeHtml(item.homeTeam) + '</strong></div><span class="ratiba-vs">' + score + '</span><div>' + crest(item.awayCrestUrl, item.awayTeam) + '<strong>' + escapeHtml(item.awayTeam) + '</strong></div></div><div class="ratiba-fixture-meta"><span>' + escapeHtml(item.venue) + '</span><small>' + escapeHtml(side + ' · ' + statusLabel(item.status)) + '</small></div><div class="ratiba-fixture-link">' + officialLink(item.officialDetailsUrl, 'Maelezo') + '</div></article>';
  };
  const renderFeature = () => {
    const next = state.fixtures.filter((item) => item.status === 'SCHEDULED' && validDate(item.kickoffAt) && parsedDate(item.kickoffAt) >= new Date()).sort((a, b) => parsedDate(a.kickoffAt) - parsedDate(b.kickoffAt))[0];
    if (!next) { nextMatchContent.innerHTML = unavailable('Hakuna mechi iliyothibitishwa bado.', 'Ratiba ya ' + teamNames[state.teamCategory] + ' itaonekana hapa baada ya kuthibitishwa na chanzo rasmi.'); return; }
    nextMatchContent.innerHTML = '<div class="ratiba-feature-date"><span>' + escapeHtml(categoryLabel(next.teamCategory) + ' · ' + next.competition) + '</span><strong>' + escapeHtml(formatDate(next.kickoffAt)) + '</strong><small>' + escapeHtml(formatTime(next.kickoffAt, next.kickoffTimeConfirmed)) + ' · ' + escapeHtml(next.venue) + '</small></div><div class="ratiba-feature-match">' + crest(next.homeCrestUrl, next.homeTeam) + '<strong>' + escapeHtml(next.homeTeam) + '</strong><b>VS</b><strong>' + escapeHtml(next.awayTeam) + '</strong>' + crest(next.awayCrestUrl, next.awayTeam) + '</div><div class="ratiba-feature-actions">' + officialLink(next.officialDetailsUrl, 'MATCH DETAILS', 'MATCH DETAILS UNAVAILABLE') + (next.officialTicketUrl ? officialLink(next.officialTicketUrl, 'KUPIA TIKETI') : '') + '</div>';
  };
  const renderList = (view) => {
    const list = view === 'results' ? resultList : fixtureList;
    const items = view === 'results' ? state.results : state.fixtures;
    const loading = view === 'results' ? state.resultLoading : state.fixtureLoading;
    if (loading && !items.length) { list.innerHTML = '<div class="ratiba-loading" role="status">Inapakia taarifa rasmi za mechi...</div>'; return; }
    if (!items.length) list.innerHTML = unavailable(view === 'results' ? 'Hakuna matokeo yaliyothibitishwa.' : 'Hakuna ratiba iliyochapishwa.', state.error ? 'Huduma ya ratiba haipatikani kwa sasa. Jaribu tena baadaye.' : 'Taarifa zitaonekana hapa baada ya kuthibitishwa na uongozi wa klabu.');
    else list.innerHTML = items.map((item) => fixtureRow(item, view === 'results')).join('');
    const button = document.querySelector('[data-load-more="' + view + '"]');
    if (button) { button.hidden = !(view === 'results' ? state.resultHasMore : state.fixtureHasMore); button.disabled = loading; button.textContent = loading ? 'LOADING...' : (view === 'results' ? 'LOAD MORE RESULTS' : 'LOAD MORE MATCHES'); }
  };
  const renderStandings = () => {
    if (!state.standings.length) { standingsList.innerHTML = unavailable('Msimamo haupatikani bado.', 'Chanzo cha kuaminika cha msimamo hakijaunganishwa. Hatuonyeshi viwango vya kubuni.'); return; }
    const competitions = Array.from(new Set(state.standings.map((item) => item.competition)));
    standingsList.innerHTML = competitions.map((competition) => {
      const rows = state.standings.filter((item) => item.competition === competition).sort((a, b) => a.position - b.position).map((item) => '<tr><td>' + escapeHtml(item.position) + '</td><th scope="row">' + crest(item.crestUrl, item.teamName) + ' ' + escapeHtml(item.teamName) + '</th><td>' + escapeHtml(item.played) + '</td><td>' + escapeHtml(item.won) + '</td><td>' + escapeHtml(item.drawn) + '</td><td>' + escapeHtml(item.lost) + '</td><td>' + escapeHtml(item.goalsFor - item.goalsAgainst) + '</td><td><strong>' + escapeHtml(item.points) + '</strong></td></tr>').join('');
      return '<section class="ratiba-table-section"><h3>' + escapeHtml(competition) + '</h3><div class="ratiba-table-scroll"><table><caption class="sr-only">' + escapeHtml(competition) + ' standings</caption><thead><tr><th>#</th><th>Team</th><th>MP</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
    }).join('');
  };
  const optionMarkup = (items, value, emptyLabel) => '<option value="all">' + emptyLabel + '</option>' + items.map((item) => '<option value="' + escapeHtml(item) + '"' + (item === value ? ' selected' : '') + '>' + escapeHtml(item) + '</option>').join('');
  const renderFilters = () => {
    const source = state.preview ? visiblePreview() : [];
    const seasons = state.preview ? Array.from(new Set(source.map((item) => item.season).filter(Boolean))).sort().reverse() : state.seasons;
    const competitions = state.preview ? Array.from(new Set(source.map((item) => item.competition).filter(Boolean))).sort() : state.competitions;
    seasonFilter.innerHTML = optionMarkup(seasons, state.season, 'Misimu yote');
    competitionFilter.innerHTML = optionMarkup(competitions, state.competition, 'Mashindano yote');
    if (!seasons.includes(state.season)) state.season = 'all';
    if (!competitions.includes(state.competition)) state.competition = 'all';
    seasonFilter.value = state.season;
    competitionFilter.value = state.competition;
  };
  const render = () => { renderFilters(); renderFeature(); renderList('fixtures'); renderList('results'); renderStandings(); };
  const loadPage = async (view, reset) => {
    const isResults = view === 'results';
    if (isResults ? state.resultLoading : state.fixtureLoading) return;
    if (reset) {
      if (isResults) { state.results = []; state.resultPage = 0; state.resultHasMore = false; } else { state.fixtures = []; state.fixturePage = 0; state.fixtureHasMore = false; }
      render();
    }
    if (isResults ? !state.resultHasMore && !reset && state.resultPage > 0 : !state.fixtureHasMore && !reset && state.fixturePage > 0) return;
    if (isResults) state.resultLoading = true; else state.fixtureLoading = true;
    renderList(view);
    const page = (isResults ? state.resultPage : state.fixturePage) + 1;
    try {
      if (window.location.protocol === 'file:' && Array.isArray(window.RATIBA_PREVIEW_FIXTURES)) {
        const data = previewPage(view, page);
        if (isResults) { state.results = reset ? data.fixtures : state.results.concat(data.fixtures); state.resultPage = page; state.resultHasMore = data.hasMore; } else { state.fixtures = reset ? data.fixtures : state.fixtures.concat(data.fixtures); state.fixturePage = page; state.fixtureHasMore = data.hasMore; }
        state.preview = true;
        state.error = false;
      } else {
        const params = new URLSearchParams({ view, teamCategory: state.teamCategory, page: String(page), pageSize: String(PAGE_SIZE) });
        if (state.season !== 'all') params.set('season', state.season);
        if (state.competition !== 'all') params.set('competition', state.competition);
        const response = await fetch('api/fixtures?' + params.toString(), { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Fixture feed unavailable');
        const data = await response.json();
        if (isResults) { state.results = reset ? data.fixtures || [] : state.results.concat(data.fixtures || []); state.resultPage = data.page || page; state.resultHasMore = Boolean(data.hasMore); } else { state.fixtures = reset ? data.fixtures || [] : state.fixtures.concat(data.fixtures || []); state.fixturePage = data.page || page; state.fixtureHasMore = Boolean(data.hasMore); }
        state.seasons = Array.isArray(data.seasons) ? data.seasons : state.seasons;
        state.competitions = Array.isArray(data.competitions) ? data.competitions : state.competitions;
        state.standings = Array.isArray(data.standings) ? data.standings : state.standings;
        state.timeZone = data.timeZone || state.timeZone;
        state.error = false;
      }
    } catch (error) {
      state.error = true;
      if (!isResults) state.fixtures = []; else state.results = [];
    } finally {
      if (isResults) state.resultLoading = false; else state.fixtureLoading = false;
      render();
    }
  };
  const reload = () => { state.error = false; state.preview = window.location.protocol === 'file:'; loadPage('fixtures', true); loadPage('results', true); };
  tabs.forEach((tab) => tab.addEventListener('click', () => { tabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab))); views.forEach((view) => { view.hidden = view.dataset.ratibaView !== tab.dataset.ratibaTab; }); if (tab.dataset.ratibaTab === 'standings') renderStandings(); }));
  teamFilters.forEach((filter) => filter.addEventListener('click', () => { state.teamCategory = filter.dataset.teamFilter; teamFilters.forEach((item) => item.setAttribute('aria-selected', String(item === filter))); reload(); }));
  competitionFilter.addEventListener('change', () => { state.competition = competitionFilter.value; reload(); });
  seasonFilter.addEventListener('change', () => { state.season = seasonFilter.value; reload(); });
  loadMoreButtons.forEach((button) => button.addEventListener('click', () => loadPage(button.dataset.loadMore, false)));
  render();
  reload();
})();
