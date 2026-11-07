const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sql } = require('../_lib/db');
const { json, readBody, method } = require('../_lib/http');
const { validateRegistration } = require('../_lib/validation');
const { safeUser, application } = require('../_lib/auth');
const { allowed } = require('../_lib/rate-limit');

const maskIdentification = (value) => {
  const clean = String(value || '').trim().toUpperCase();
  const lastFour = clean.slice(-4);
  return `${clean.slice(0, -4).replace(/[A-Z0-9]/g, '•')}${lastFour}`;
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return method(res, 'POST');
  try {
    if (!allowed(req, 'register', 5, 60 * 60 * 1000)) return json(res, 429, { message: 'Too many registration requests. Please try again later.' });
    const body = await readBody(req);
    const errors = validateRegistration(body);
    if (Object.keys(errors).length) return json(res, 422, { message: 'Please correct the highlighted fields.', errors });

    const email = String(body.email).trim().toLowerCase();
    const existing = await sql`SELECT id FROM membership_users WHERE LOWER(email) = ${email}`;
    if (existing.rows.length) return json(res, 409, { message: 'A registration request already exists for this email address.' });

    const userId = crypto.randomUUID();
    const applicationId = crypto.randomUUID();
    const authReference = `registration-${userId}`;
    // A registration request is not a MY YANGA account. Store an unusable placeholder hash
    // until an authorized membership record is linked and the member completes account setup.
    const placeholderHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
    const appReference = `YSC-REG-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const identificationNumber = String(body.identificationNumber).trim().toUpperCase();
    const identificationHash = crypto.createHash('sha256').update(identificationNumber).digest('hex');

    await sql`INSERT INTO membership_users (id, first_name, middle_name, last_name, email, phone, password_hash, auth_account_reference) VALUES (${userId}, ${String(body.firstName).trim()}, ${String(body.middleName || '').trim() || null}, ${String(body.lastName).trim()}, ${email}, ${String(body.phone).trim()}, ${placeholderHash}, ${authReference})`;
    await sql`INSERT INTO membership_applications (id, application_reference, user_id, membership_category, date_of_birth, nationality, region, district, gender, residential_location, identification_type, identification_number_masked, identification_number_hash, identification_details_confirmed, identification_reason, registration_route, application_status, membership_status) VALUES (${applicationId}, ${appReference}, ${userId}, ${body.category}, ${body.dateOfBirth}, ${String(body.nationality).trim()}, ${String(body.region).trim()}, ${String(body.district).trim()}, ${String(body.gender || '').trim() || null}, ${String(body.residentialLocation || '').trim() || null}, ${body.identificationType}, ${maskIdentification(identificationNumber)}, ${identificationHash}, ${body.identificationDetailsConfirmed === true}, ${String(body.identificationReason).trim()}, ${body.registrationRoute}, 'Pending Review', 'INACTIVE')`;
    await sql`INSERT INTO membership_notifications (id, user_id, title, message, notification_type) VALUES (${crypto.randomUUID()}, ${userId}, 'Registration request received', ${`Your request ${appReference} is saved. An authorized Young Africans SC registration source must complete membership and issue an official membership number before MY YANGA setup.`}, 'APPLICATION')`;

    const userResult = await sql`SELECT id, first_name, middle_name, last_name, email, phone, official_membership_number, role, created_at FROM membership_users WHERE id = ${userId}`;
    const appResult = await sql`SELECT a.*, u.first_name, u.middle_name, u.last_name, u.email, u.phone FROM membership_applications a JOIN membership_users u ON u.id = a.user_id WHERE a.id = ${applicationId}`;
    return json(res, 201, { ok: true, mode: 'server', user: safeUser(userResult.rows[0]), application: application(appResult.rows[0]), next: 'official-registration' });
  } catch (error) {
    console.error('membership registration request failed', error);
    return json(res, 500, { message: 'We could not save your registration request. Please try again.' });
  }
};
