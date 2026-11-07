const { sql } = require('./_lib/db');
const { json, method } = require('./_lib/http');

const fixture = (row) => ({
  id: row.id,
  teamCategory: row.team_category || 'MEN',
  season: row.season || '',
  isPublished: row.is_published !== false,
  clubSide: row.club_side || 'HOME',
  competition: row.competition,
  homeTeam: row.home_team,
  awayTeam: row.away_team,
  homeCrestUrl: row.home_crest_url || '',
  awayCrestUrl: row.away_crest_url || '',
  kickoffAt: row.kickoff_at,
  kickoffTimeConfirmed: row.kickoff_time_confirmed !== false,
  venue: row.venue,
  status: row.status,
  homeScore: row.home_score,
  awayScore: row.away_score,
  officialTicketUrl: row.official_ticket_url || '',
  officialDetailsUrl: row.official_details_url || '',
  notes: row.notes || ''
});

const standing = (row) => ({
  id: row.id,
  teamCategory: row.team_category || 'MEN',
  season: row.season || '',
  competition: row.competition,
  teamName: row.team_name,
  crestUrl: row.crest_url || '',
  position: row.position,
  played: row.played,
  won: row.won,
  drawn: row.drawn,
  lost: row.lost,
  goalsFor: row.goals_for,
  goalsAgainst: row.goals_against,
  points: row.points,
  verifiedAt: row.verified_at
});

module.exports = async (req, res) => {
  if (req.method !== 'GET') return method(res, 'GET');
  try {
    const query = new URL(req.url || '/', 'http://localhost');
    const allowedCategories = new Set(['MEN', 'WOMEN', 'UNDER_20']);
    const view = query.searchParams.get('view') === 'results' ? 'results' : 'fixtures';
    const teamCategory = allowedCategories.has(query.searchParams.get('teamCategory')) ? query.searchParams.get('teamCategory') : null;
    const season = String(query.searchParams.get('season') || '').trim().slice(0, 40) || null;
    const competition = String(query.searchParams.get('competition') || '').trim().slice(0, 120) || null;
    const requestedPageSize = Number.parseInt(query.searchParams.get('pageSize') || '8', 10);
    const pageSize = Number.isInteger(requestedPageSize) ? Math.min(Math.max(requestedPageSize, 1), 20) : 8;
    const requestedPage = Number.parseInt(query.searchParams.get('page') || '1', 10);
    const page = Number.isInteger(requestedPage) ? Math.max(requestedPage, 1) : 1;
    const offset = (page - 1) * pageSize;
    const fixtures = view === 'results'
      ? await sql`SELECT * FROM fixtures WHERE is_published = TRUE AND status = 'COMPLETED' AND (COALESCE(${teamCategory}, '') = '' OR team_category = ${teamCategory}) AND (COALESCE(${season}, '') = '' OR season = ${season}) AND (COALESCE(${competition}, '') = '' OR competition = ${competition}) ORDER BY kickoff_at DESC LIMIT ${pageSize} OFFSET ${offset}`
      : await sql`SELECT * FROM fixtures WHERE is_published = TRUE AND status <> 'COMPLETED' AND (COALESCE(${teamCategory}, '') = '' OR team_category = ${teamCategory}) AND (COALESCE(${season}, '') = '' OR season = ${season}) AND (COALESCE(${competition}, '') = '' OR competition = ${competition}) ORDER BY kickoff_at ASC LIMIT ${pageSize} OFFSET ${offset}`;
    const [total, standings, seasons, competitions] = await Promise.all([
      view === 'results'
        ? sql`SELECT COUNT(*)::int AS count FROM fixtures WHERE is_published = TRUE AND status = 'COMPLETED' AND (COALESCE(${teamCategory}, '') = '' OR team_category = ${teamCategory}) AND (COALESCE(${season}, '') = '' OR season = ${season}) AND (COALESCE(${competition}, '') = '' OR competition = ${competition})`
        : sql`SELECT COUNT(*)::int AS count FROM fixtures WHERE is_published = TRUE AND status <> 'COMPLETED' AND (COALESCE(${teamCategory}, '') = '' OR team_category = ${teamCategory}) AND (COALESCE(${season}, '') = '' OR season = ${season}) AND (COALESCE(${competition}, '') = '' OR competition = ${competition})`,
      sql`SELECT * FROM fixture_standings WHERE is_published = TRUE AND (COALESCE(${teamCategory}, '') = '' OR team_category = ${teamCategory}) AND (COALESCE(${season}, '') = '' OR season = ${season}) ORDER BY competition ASC, position ASC LIMIT 500`,
      sql`SELECT DISTINCT season FROM fixtures WHERE is_published = TRUE AND (COALESCE(${teamCategory}, '') = '' OR team_category = ${teamCategory}) ORDER BY season DESC`,
      sql`SELECT DISTINCT competition FROM fixtures WHERE is_published = TRUE AND (COALESCE(${teamCategory}, '') = '' OR team_category = ${teamCategory}) AND (COALESCE(${season}, '') = '' OR season = ${season}) ORDER BY competition ASC`
    ]);
    return json(res, 200, {
      ok: true,
      timeZone: 'Africa/Dar_es_Salaam',
      view,
      page,
      pageSize,
      total: total.rows[0]?.count || 0,
      hasMore: offset + fixtures.rows.length < Number(total.rows[0]?.count || 0),
      filters: { teamCategory, season, competition },
      seasons: seasons.rows.map((row) => row.season),
      competitions: competitions.rows.map((row) => row.competition),
      fixtures: fixtures.rows.map(fixture),
      standings: standings.rows.map(standing)
    });
  } catch (error) {
    console.error('fixtures public feed failed', error);
    return json(res, 503, { ok: false, message: 'Fixture data is not available yet.', fixtures: [], standings: [] });
  }
};
