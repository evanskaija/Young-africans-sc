const crypto = require('crypto');
const { sql } = require('../_lib/db');
const { json, readBody, method } = require('../_lib/http');
const { requireAdmin } = require('../_lib/auth');

const categories = new Set(['MEN', 'WOMEN', 'UNDER_20']);
const cleanText = (value, max) => String(value || '').trim().slice(0, max);
const validUrl = (value) => {
  const text = cleanText(value, 500);
  if (!text) return null;
  try { const parsed = new URL(text); return ['http:', 'https:'].includes(parsed.protocol) ? text : null; } catch { return null; }
};
const mapTeam = (row) => ({ id: row.id, teamCategory: row.team_category, teamName: row.team_name, crestUrl: row.crest_url || '', isYanga: row.is_yanga === true });

module.exports = async (req, res) => {
  if (!['GET', 'POST', 'PATCH'].includes(req.method)) return method(res, 'GET, POST, PATCH');
  try {
    const user = await requireAdmin(req, res); if (!user) return;
    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM fixture_teams ORDER BY team_category ASC, team_name ASC LIMIT 500`;
      return json(res, 200, { ok: true, teams: result.rows.map(mapTeam) });
    }
    const body = await readBody(req);
    if (req.method === 'PATCH' && !body.id) return json(res, 422, { message: 'Team id is required.' });
    const teamCategory = cleanText(body.teamCategory, 20).toUpperCase();
    const teamName = cleanText(body.teamName, 120);
    const crestUrl = validUrl(body.crestUrl);
    const errors = [];
    if (!categories.has(teamCategory)) errors.push('Choose a valid team category.');
    if (!teamName) errors.push('Team name is required.');
    if (body.crestUrl && !crestUrl) errors.push('Crest URL must use http or https.');
    if (errors.length) return json(res, 422, { message: errors.join(' ') });
    const id = body.id || crypto.randomUUID();
    const result = await sql`
      INSERT INTO fixture_teams (id, team_category, team_name, crest_url, is_yanga)
      VALUES (${id}, ${teamCategory}, ${teamName}, ${crestUrl}, ${body.isYanga === true})
      ON CONFLICT (team_category, team_name) DO UPDATE SET crest_url = EXCLUDED.crest_url, is_yanga = EXCLUDED.is_yanga, updated_at = NOW()
      RETURNING *
    `;
    return json(res, 200, { ok: true, team: mapTeam(result.rows[0]) });
  } catch (error) {
    console.error('fixture teams admin failed', error);
    return json(res, 500, { message: 'The team registry service is unavailable.' });
  }
};
