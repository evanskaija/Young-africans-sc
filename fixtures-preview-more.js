// Additional published preview records taken from the current competition records.
// These remain preview-only; the protected CMS is the production source of truth.
(() => {
  const source = 'https://ligikuu.co.tz/team/young-africans-sc/';
  const yanga = 'young-africansc.png';
  const pendingVenue = 'Official venue record pending';
  const men = (id, kickoffAt, homeTeam, awayTeam, clubSide) => ({ id, teamCategory: 'MEN', season: '2026/27', competition: 'NBC Premier League 2026/2027', homeTeam, awayTeam, homeCrestUrl: homeTeam.toLowerCase().includes('young africans') ? yanga : '', awayCrestUrl: awayTeam.toLowerCase().includes('young africans') ? yanga : '', kickoffAt, kickoffTimeConfirmed: true, clubSide, venue: pendingVenue, status: 'SCHEDULED', homeScore: null, awayScore: null, officialTicketUrl: '', officialDetailsUrl: source, notes: 'Verified league fixture.' });
  const more = [
    men('8d1a3e2f-6b6f-4d77-8b5b-000000000006', '2026-12-12T15:30:00.000Z', 'Singida Black Stars', 'Young Africans', 'AWAY'),
    men('8d1a3e2f-6b6f-4d77-8b5b-000000000007', '2026-12-30T16:00:00.000Z', 'Azam FC', 'Young Africans', 'AWAY'),
    men('8d1a3e2f-6b6f-4d77-8b5b-000000000008', '2027-02-03T18:00:00.000Z', 'Young Africans', 'Polisi Tanzania FC', 'HOME'),
    men('8d1a3e2f-6b6f-4d77-8b5b-000000000009', '2027-02-06T16:00:00.000Z', 'Young Africans', 'Simba SC', 'HOME'),
    men('8d1a3e2f-6b6f-4d77-8b5b-000000000010', '2027-02-11T13:15:00.000Z', 'Mashujaa FC', 'Young Africans', 'AWAY'),
    men('8d1a3e2f-6b6f-4d77-8b5b-000000000011', '2027-02-17T16:00:00.000Z', 'Kagera Sugar FC', 'Young Africans', 'AWAY'),
    men('8d1a3e2f-6b6f-4d77-8b5b-000000000012', '2027-02-24T15:00:00.000Z', 'Young Africans', 'Dodoma Jiji FC', 'HOME'),
    men('8d1a3e2f-6b6f-4d77-8b5b-000000000013', '2027-03-12T16:00:00.000Z', 'Young Africans', 'Mbeya City', 'HOME'),
    men('8d1a3e2f-6b6f-4d77-8b5b-000000000014', '2027-04-06T13:00:00.000Z', 'Pamba Jiji FC', 'Young Africans', 'AWAY'),
    men('8d1a3e2f-6b6f-4d77-8b5b-000000000015', '2027-05-03T13:00:00.000Z', 'JKT Tanzania SC', 'Young Africans', 'AWAY'),
    men('8d1a3e2f-6b6f-4d77-8b5b-000000000016', '2027-05-12T13:00:00.000Z', 'Young Africans', 'Namungo FC', 'HOME'),
    men('8d1a3e2f-6b6f-4d77-8b5b-000000000017', '2027-05-16T13:00:00.000Z', 'Young Africans', 'Singida Black Stars', 'HOME'),
    {
      id: '8d1a3e2f-6b6f-4d77-8b5b-000000000018', teamCategory: 'WOMEN', season: '2026/27', competition: 'TWPL 2026/2027', homeTeam: 'Geita Queens', awayTeam: 'Yanga Princess', homeCrestUrl: '', awayCrestUrl: yanga, kickoffAt: '2026-11-03T21:00:00.000Z', kickoffTimeConfirmed: false, clubSide: 'AWAY', venue: 'Nyankumbu Stadium, Geita', status: 'COMPLETED', homeScore: 0, awayScore: 2, officialTicketUrl: '', officialDetailsUrl: 'https://tff.or.tz/simba-queens-yanga-princess-hawakamatiki-twpl/', notes: 'Verified TFF result; kickoff time was not published in the source.'
    }
  ];
  window.RATIBA_PREVIEW_FIXTURES = (window.RATIBA_PREVIEW_FIXTURES || []).concat(more);
  window.RATIBA_PREVIEW_FIXTURES.forEach((item) => {
    const home = String(item.homeTeam || '').toLowerCase();
    const away = String(item.awayTeam || '').toLowerCase();
    if (!item.season) item.season = '2026/27';
    if (!item.clubSide) item.clubSide = home.includes('young africans') || home.includes('yanga') ? 'HOME' : 'AWAY';
    if (!item.homeCrestUrl && (home.includes('young africans') || home.includes('yanga'))) item.homeCrestUrl = yanga;
    if (!item.awayCrestUrl && (away.includes('young africans') || away.includes('yanga'))) item.awayCrestUrl = yanga;
  });
})();
