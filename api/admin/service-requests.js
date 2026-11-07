const { sql } = require('../_lib/db');
const { json, readBody, method } = require('../_lib/http');
const { requireAdmin } = require('../_lib/auth');

const statuses = new Set(['OPEN', 'IN_PROGRESS', 'NEEDS_INFORMATION', 'RESOLVED', 'CLOSED']);

module.exports = async (req, res) => {
  if (!['GET', 'PATCH'].includes(req.method)) return method(res, 'GET, PATCH');
  try {
    const admin = await requireAdmin(req, res); if (!admin) return;
    if (req.method === 'GET') {
      const result = await sql`SELECT r.*, u.first_name, u.last_name, u.email, u.phone FROM member_service_requests r JOIN membership_users u ON u.id = r.user_id ORDER BY r.created_at DESC LIMIT 500`;
      return json(res, 200, { ok: true, requests: result.rows });
    }
    const body = await readBody(req);
    if (!body.id || !statuses.has(body.status)) return json(res, 422, { message: 'Choose a valid support request status.' });
    const updated = await sql`UPDATE member_service_requests SET status = ${body.status}, staff_response = ${String(body.staffResponse || '').trim() || null}, updated_at = NOW() WHERE id = ${body.id} RETURNING id, request_reference, status, staff_response, updated_at`;
    if (!updated.rows.length) return json(res, 404, { message: 'Support request not found.' });
    await sql`INSERT INTO membership_audit_logs (id, actor_user_id, action, entity_type, entity_id, details) VALUES (${require('crypto').randomUUID()}, ${admin.id}, 'MEMBER_SUPPORT_STATUS_UPDATED', 'member_service_request', ${body.id}, ${JSON.stringify({ status: body.status })})`;
    return json(res, 200, { ok: true, request: updated.rows[0] });
  } catch (error) {
    console.error('admin member support failed', error);
    return json(res, 500, { message: 'The member support queue is unavailable.' });
  }
};
