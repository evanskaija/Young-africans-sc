const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sql } = require('../_lib/db');
const { json, readBody, method, cookie } = require('../_lib/http');
const { validateRegistration } = require('../_lib/validation');
const { safeUser, application, sessionCookie } = require('../_lib/auth');
const { allowed } = require('../_lib/rate-limit');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return method(res, 'POST');
  try {
    if (!allowed(req, 'register', 5, 60 * 60 * 1000)) return json(res, 429, { message: 'Too many registration attempts. Please try again later.' });
    const body = await readBody(req); const errors = validateRegistration(body);
    if (Object.keys(errors).length) return json(res, 422, { message: 'Please correct the highlighted fields.', errors });
    const email = String(body.email).trim().toLowerCase();
    const existing = await sql`SELECT id FROM membership_users WHERE LOWER(email) = ${email}`;
    if (existing.rows.length) return json(res, 409, { message: 'An account already exists for this email address. Try signing in instead.' });
    const userId = crypto.randomUUID(); const applicationId = crypto.randomUUID(); const authReference = `local-${userId}`;
    const passwordHash = await bcrypt.hash(String(body.password), 12);
    const appReference = `YSC-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    await sql`INSERT INTO membership_users (id, first_name, middle_name, last_name, email, phone, password_hash, auth_account_reference) VALUES (${userId}, ${String(body.firstName).trim()}, ${String(body.middleName || '').trim() || null}, ${String(body.lastName).trim()}, ${email}, ${String(body.phone).trim()}, ${passwordHash}, ${authReference})`;
    await sql`INSERT INTO membership_applications (id, application_reference, user_id, membership_category, date_of_birth, nationality, region, district, gender, residential_location, selected_bank) VALUES (${applicationId}, ${appReference}, ${userId}, ${body.category}, ${body.dateOfBirth}, ${String(body.nationality).trim()}, ${String(body.region).trim()}, ${String(body.district).trim()}, ${String(body.gender || '').trim() || null}, ${String(body.residentialLocation || '').trim() || null}, ${body.bank})`;
    const userResult = await sql`SELECT id, first_name, middle_name, last_name, email, phone, role, created_at FROM membership_users WHERE id = ${userId}`;
    const appResult = await sql`SELECT a.*, u.first_name, u.middle_name, u.last_name, u.email, u.phone FROM membership_applications a JOIN membership_users u ON u.id = a.user_id WHERE a.id = ${applicationId}`;
    return json(res, 201, { ok: true, mode: 'server', user: safeUser(userResult.rows[0]), application: application(appResult.rows[0]) }, { 'Set-Cookie': cookie('ysc_member_session', sessionCookie(userId).split('=')[1].split(';')[0], 60 * 60 * 8) });
  } catch (error) {
    console.error('membership register failed', error);
    return json(res, 500, { message: 'We could not save your application. Please try again.' });
  }
};
