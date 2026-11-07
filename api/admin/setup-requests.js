const { sql } = require('../_lib/db');
const { json, readBody, method } = require('../_lib/http');
const { requireAdmin } = require('../_lib/auth');

const statuses = new Set(['AWAITING_STAFF_VERIFICATION', 'VERIFIED', 'REJECTED', 'NEEDS_INFORMATION']);

module.exports = async (req, res) => {
  if (!['GET', 'PATCH'].includes(req.method)) return method(res, 'GET, PATCH');
  try {
    const admin = await requireAdmin(req, res); if (!admin) return;
    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM membership_setup_requests ORDER BY created_at DESC LIMIT 500`;
      return json(res, 200, { ok: true, requests: result.rows });
    }
    const body = await readBody(req); if (!body.id || !statuses.has(body.status)) return json(res, 422, { message: 'Choose a valid setup request status.' });
    const updated = await sql`UPDATE membership_setup_requests SET status = ${body.status} WHERE id = ${body.id} RETURNING id, request_reference, status`;
    if (!updated.rows.length) return json(res, 404, { message: 'Setup request not found.' });
    await sql`INSERT INTO membership_audit_logs (id, actor_user_id, action, entity_type, entity_id, details) VALUES (${require('crypto').randomUUID()}, ${admin.id}, 'SETUP_REQUEST_STATUS_UPDATED', 'membership_setup_request', ${body.id}, ${JSON.stringify({ status: body.status })})`;
    return json(res, 200, { ok: true, request: updated.rows[0] });
  } catch (error) { console.error('admin setup requests failed', error); return json(res, 500, { message: 'The setup verification queue is unavailable.' }); }
};
