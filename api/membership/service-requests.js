const crypto = require('crypto');
const { sql } = require('../_lib/db');
const { json, readBody, method } = require('../_lib/http');
const { requireUser } = require('../_lib/auth');

const categories = new Set(['lost-card', 'incorrect-details', 'membership-verification', 'account-access', 'general-support']);

module.exports = async (req, res) => {
  if (!['GET', 'POST'].includes(req.method)) return method(res, 'GET, POST');
  try {
    const user = await requireUser(req, res); if (!user) return;
    if (req.method === 'GET') {
      const result = await sql`SELECT request_reference, category, description, status, staff_response, created_at, updated_at FROM member_service_requests WHERE user_id = ${user.id} ORDER BY created_at DESC`;
      return json(res, 200, { ok: true, requests: result.rows });
    }
    const body = await readBody(req); const category = String(body.category || '').trim(); const description = String(body.description || '').trim();
    if (!categories.has(category) || description.length < 10 || description.length > 2000) return json(res, 422, { message: 'Choose a service category and provide a description of at least 10 characters.' });
    const requestReference = `CASE-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    await sql`INSERT INTO member_service_requests (id, user_id, category, description, request_reference) VALUES (${crypto.randomUUID()}, ${user.id}, ${category}, ${description}, ${requestReference})`;
    return json(res, 201, { ok: true, request: { reference: requestReference, category, description, status: 'OPEN' } });
  } catch (error) { console.error('member service requests failed', error); return json(res, 500, { message: 'Member support is temporarily unavailable.' }); }
};
