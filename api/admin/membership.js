const { sql } = require('../_lib/db');
const { json, readBody, method } = require('../_lib/http');
const { requireAdmin, application } = require('../_lib/auth');

const statuses = new Set(['Pending Review', 'Under Review', 'More Information Required', 'Reviewed']);

module.exports = async (req, res) => {
  if (!['GET', 'PATCH'].includes(req.method)) return method(res, 'GET, PATCH');
  try {
    const user = await requireAdmin(req, res); if (!user) return;
    if (req.method === 'PATCH') {
      const body = await readBody(req); if (!body.id || !statuses.has(body.status)) return json(res, 422, { message: 'Choose a valid review status.' });
      const updated = await sql`UPDATE membership_applications SET application_status = ${body.status} WHERE id = ${body.id} RETURNING id, application_status`;
      if (!updated.rows.length) return json(res, 404, { message: 'Application not found.' });
      return json(res, 200, { ok: true, application: updated.rows[0] });
    }
    const result = await sql`SELECT a.*, u.first_name, u.middle_name, u.last_name, u.email, u.phone FROM membership_applications a JOIN membership_users u ON u.id = a.user_id ORDER BY a.submitted_at DESC LIMIT 500`;
    const query = String(req.query?.q || '').trim().toLowerCase();
    const applications = result.rows.map(application).filter((item) => !query || `${item.reference} ${item.fullName}`.toLowerCase().includes(query));
    const counts = { total: result.rows.length, pending: result.rows.filter((item) => item.application_status === 'Pending Review').length, underReview: result.rows.filter((item) => item.application_status === 'Under Review').length, reviewed: result.rows.filter((item) => item.application_status === 'Reviewed').length };
    return json(res, 200, { ok: true, mode: 'server', applications, counts });
  } catch (error) { console.error('membership admin failed', error); return json(res, 500, { message: 'The membership administration service is unavailable.' }); }
};
