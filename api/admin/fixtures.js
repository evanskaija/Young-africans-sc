const crypto = require('crypto');
const { sql } = require('../_lib/db');
const { json, readBody, method } = require('../_lib/http');
const { requireAdmin } = require('../_lib/auth');

const statuses = new Set(['SCHEDULED', 'POSTPONED', 'CANCELLED', 'COMPLETED']);
const teamCategories = new Set(['MEN', 'WOMEN', 'UNDER_20']);
const clubSides = new Set(['HOME', 'AWAY']);
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
const text = (value, max = 220) => String(value || '').trim().slice(0, max);
const url = (value) => {
  const valueText = text(value, 500);
  if (!valueText) return null;
  try { const parsed = new URL(valueText); return ['http:', 'https:'].includes(parsed.protocol) ? valueText : null; } catch { return null; }
};
const parseScore = (value) => value === '' || value === null || typeof value === 'undefined' ? null : Number.isInteger(Number(value)) && Number(value) >= 0 ? Number(value) : NaN;
const clean = (body) => {
  const data = {
    teamCategory: text(body.teamCategory, 20).toUpperCase(),
    season: text(body.season, 40),
    clubSide: text(body.clubSide, 10).toUpperCase(),
    isPublished: body.isPublished !== false,
    competition: text(body.competition, 120),
    homeTeam: text(body.homeTeam, 120),
    awayTeam: text(body.awayTeam, 120),
    homeCrestUrl: url(body.homeCrestUrl),
    awayCrestUrl: url(body.awayCrestUrl),
    kickoffAt: new Date(body.kickoffAt),
    venue: text(body.venue, 180),
    status: text(body.status, 20).toUpperCase(),
    homeScore: parseScore(body.homeScore),
    awayScore: parseScore(body.awayScore),
    officialTicketUrl: url(body.officialTicketUrl),
    officialDetailsUrl: url(body.officialDetailsUrl),
    notes: text(body.notes, 500)
  };
  const errors = [];
  if (!data.competition) errors.push('Competition is required.');
  if (!teamCategories.has(data.teamCategory)) errors.push('Choose a valid team category.');
  if (!data.season) errors.push('Season is required.');
  if (!clubSides.has(data.clubSide)) errors.push('Choose whether Young Africans are home or away.');
  if (!data.homeTeam || !data.awayTeam || data.homeTeam.toLowerCase() === data.awayTeam.toLowerCase()) errors.push('Choose two different teams.');
  if (Number.isNaN(data.kickoffAt.getTime())) errors.push('Kickoff must be a valid date and time.');
  if (!data.venue) errors.push('Venue is required.');
  if (!statuses.has(data.status)) errors.push('Choose a valid fixture status.');
  if (Number.isNaN(data.homeScore) || Number.isNaN(data.awayScore)) errors.push('Scores must be whole numbers.');
  if (data.status === 'COMPLETED' && (data.homeScore === null || data.awayScore === null)) errors.push('Completed fixtures need both final scores.');
  if (data.status !== 'COMPLETED' && (data.homeScore !== null || data.awayScore !== null)) errors.push('Only completed fixtures may have scores.');
  if (body.officialTicketUrl && !data.officialTicketUrl) errors.push('Official ticket URL must use http or https.');
  if (body.officialDetailsUrl && !data.officialDetailsUrl) errors.push('Official details URL must use http or https.');
  return { data, errors };
};

module.exports = async (req, res) => {
  if (!['GET', 'POST', 'PATCH'].includes(req.method)) return method(res, 'GET, POST, PATCH');
  try {
    const user = await requireAdmin(req, res); if (!user) return;
    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM fixtures ORDER BY kickoff_at ASC LIMIT 500`;
      return json(res, 200, { ok: true, fixtures: result.rows.map(fixture) });
    }
    const body = await readBody(req);
    if (req.method === 'PATCH' && !body.id) return json(res, 422, { message: 'Fixture id is required.' });
    const { data, errors } = clean(body);
    if (errors.length) return json(res, 422, { message: errors.join(' ') });
    const id = body.id || crypto.randomUUID();
    const result = await sql`
      INSERT INTO fixtures (id, team_category, season, is_published, club_side, competition, home_team, away_team, home_crest_url, away_crest_url, kickoff_at, kickoff_time_confirmed, venue, status, home_score, away_score, official_ticket_url, official_details_url, notes)
      VALUES (${id}, ${data.teamCategory}, ${data.season}, ${data.isPublished}, ${data.clubSide}, ${data.competition}, ${data.homeTeam}, ${data.awayTeam}, ${data.homeCrestUrl}, ${data.awayCrestUrl}, ${data.kickoffAt.toISOString()}, ${body.kickoffTimeConfirmed !== false}, ${data.venue}, ${data.status}, ${data.homeScore}, ${data.awayScore}, ${data.officialTicketUrl}, ${data.officialDetailsUrl}, ${data.notes})
      ON CONFLICT (id) DO UPDATE SET team_category = EXCLUDED.team_category, season = EXCLUDED.season, is_published = EXCLUDED.is_published, club_side = EXCLUDED.club_side, competition = EXCLUDED.competition, home_team = EXCLUDED.home_team, away_team = EXCLUDED.away_team, home_crest_url = EXCLUDED.home_crest_url, away_crest_url = EXCLUDED.away_crest_url, kickoff_at = EXCLUDED.kickoff_at, kickoff_time_confirmed = EXCLUDED.kickoff_time_confirmed, venue = EXCLUDED.venue, status = EXCLUDED.status, home_score = EXCLUDED.home_score, away_score = EXCLUDED.away_score, official_ticket_url = EXCLUDED.official_ticket_url, official_details_url = EXCLUDED.official_details_url, notes = EXCLUDED.notes, updated_at = NOW()
      RETURNING *
    `;
    return json(res, 200, { ok: true, fixture: fixture(result.rows[0]) });
  } catch (error) {
    console.error('fixtures admin failed', error);
    return json(res, 500, { message: 'The fixture administration service is unavailable.' });
  }
};
