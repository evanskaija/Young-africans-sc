const bcrypt = require('bcryptjs');
const { sql } = require('../_lib/db');
const { json, readBody, method, cookie } = require('../_lib/http');
const { safeUser, application, sessionCookie } = require('../_lib/auth');
const { allowed } = require('../_lib/rate-limit');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return method(res, 'POST');
  try {
    if (!allowed(req, 'login', 10, 15 * 60 * 1000)) return json(res, 429, { message: 'Too many sign-in attempts. Please try again later.' });
    const body = await readBody(req); const email = String(body.email || '').trim().toLowerCase(); const password = String(body.password || '');
    if (!email || !password) return json(res, 422, { message: 'Email and password are required.' });
    const result = await sql`SELECT * FROM membership_users WHERE LOWER(email) = ${email}`; const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return json(res, 401, { message: 'Email or password is incorrect.' });
    const applicationResult = await sql`SELECT a.*, u.first_name, u.middle_name, u.last_name, u.email, u.phone FROM membership_applications a JOIN membership_users u ON u.id = a.user_id WHERE a.user_id = ${user.id} ORDER BY a.submitted_at DESC LIMIT 1`;
    return json(res, 200, { ok: true, mode: 'server', user: safeUser(user), application: application(applicationResult.rows[0]) }, { 'Set-Cookie': cookie('ysc_member_session', sessionCookie(user.id).split('=')[1].split(';')[0], 60 * 60 * 8) });
  } catch (error) { console.error('membership login failed', error); return json(res, 500, { message: 'Sign in is temporarily unavailable.' }); }
};
