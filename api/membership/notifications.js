const { sql } = require('../_lib/db');
const { json, method, readBody } = require('../_lib/http');
const { requireUser } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (!['GET', 'PATCH'].includes(req.method)) return method(res, 'GET, PATCH');
  try {
    const user = await requireUser(req, res); if (!user) return;
    if (req.method === 'PATCH') { const body = await readBody(req); if (!body.id) return json(res, 422, { message: 'Notification id is required.' }); await sql`UPDATE membership_notifications SET read_at = NOW() WHERE id = ${body.id} AND user_id = ${user.id}`; return json(res, 200, { ok: true }); }
    const result = await sql`SELECT id, title, message, notification_type, created_at, read_at FROM membership_notifications WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 100`;
    return json(res, 200, { ok: true, notifications: result.rows });
  } catch (error) { console.error('membership notifications failed', error); return json(res, 500, { message: 'Notifications are temporarily unavailable.' }); }
};
