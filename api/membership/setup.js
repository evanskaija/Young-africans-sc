const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sql } = require('../_lib/db');
const { json, readBody, method } = require('../_lib/http');
const { allowed } = require('../_lib/rate-limit');
const { sendOtpEmail } = require('../_lib/mailer');

const text = (value, max = 200) => String(value || '').trim().slice(0, max);
const membershipNumberPattern = /^[A-Z0-9-]{4,50}$/;
const codePattern = /^\d{6}$/;
const envNumber = (name, fallback, min, max) => { const value = Number.parseInt(process.env[name] || String(fallback), 10); return Number.isInteger(value) ? Math.min(Math.max(value, min), max) : fallback; };
const hashWithSecret = (purpose, value) => {
  const secret = String(process.env.OTP_HASH_SECRET || process.env.MEMBERSHIP_SESSION_SECRET || '');
  if (secret.length < 32) throw new Error('OTP_HASH_SECRET or MEMBERSHIP_SESSION_SECRET must be configured with at least 32 characters.');
  return crypto.createHmac('sha256', secret).update(`${purpose}:${value}`).digest('hex');
};
const sameHash = (left, right) => { const a = Buffer.from(String(left || '')); const b = Buffer.from(String(right || '')); return a.length === b.length && crypto.timingSafeEqual(a, b); };
const maskEmail = (value) => { const [local, domain] = String(value || '').split('@'); if (!local || !domain) return 'the official contact record'; return `${local.slice(0, 1)}${'*'.repeat(Math.max(2, local.length - 1))}@${domain}`; };
const normaliseNumber = (value) => text(value, 50).toUpperCase();
const validEmail = (value) => { const candidate = text(value, 180).toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : ''; };

const findAuthorizedRecord = async (membershipNumber) => {
  try {
    const official = await sql`SELECT membership_number, full_name, email, phone FROM authorized_membership_records WHERE membership_number = ${membershipNumber} AND status = 'ACTIVE' LIMIT 1`;
    if (official.rows[0]) return { membershipNumber: official.rows[0].membership_number, fullName: official.rows[0].full_name, email: validEmail(official.rows[0].email), phone: official.rows[0].phone || '' };
  } catch (error) {
    // The fallback keeps existing installations working until schema.sql is applied.
    console.warn('authorized membership record table is not available yet');
  }
  const legacy = await sql`SELECT official_membership_number, first_name, middle_name, last_name, email, phone FROM membership_users WHERE official_membership_number = ${membershipNumber} LIMIT 1`;
  if (!legacy.rows[0]) return null;
  return { membershipNumber: legacy.rows[0].official_membership_number, fullName: [legacy.rows[0].first_name, legacy.rows[0].middle_name, legacy.rows[0].last_name].filter(Boolean).join(' '), email: validEmail(legacy.rows[0].email), phone: legacy.rows[0].phone || '' };
};

const setupRecord = async (membershipNumber) => {
  if (!membershipNumberPattern.test(membershipNumber)) return null;
  const record = await findAuthorizedRecord(membershipNumber);
  return record && record.email ? record : null;
};

const staffRequest = async (membershipNumber, contact) => {
  const duplicate = await sql`SELECT request_reference FROM membership_setup_requests WHERE official_membership_number = ${membershipNumber} AND status = 'AWAITING_STAFF_VERIFICATION' ORDER BY created_at DESC LIMIT 1`;
  if (duplicate.rows.length) return { ok: true, status: 'AWAITING_STAFF_VERIFICATION', reference: duplicate.rows[0].request_reference, message: 'A staff-assisted verification request is already pending.' };
  const requestReference = `SETUP-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  await sql`INSERT INTO membership_setup_requests (id, official_membership_number, contact_value, request_reference) VALUES (${crypto.randomUUID()}, ${membershipNumber}, ${contact || null}, ${requestReference})`;
  return { ok: true, status: 'AWAITING_STAFF_VERIFICATION', reference: requestReference, message: 'Your request is pending authorized staff verification. No account or password was created.' };
};

const sendOtp = async (req, res, membershipNumber) => {
  const rateWindowMinutes = envNumber('OTP_RATE_WINDOW_MINUTES', 15, 1, 60);
  if (!allowed(req, 'setup-otp-send', envNumber('OTP_RATE_LIMIT', 5, 1, 20), rateWindowMinutes * 60 * 1000)) return json(res, 429, { message: 'Too many verification requests. Please try again later.' });
  const record = await setupRecord(membershipNumber);
  if (!record) return json(res, 404, { message: 'No active authorized membership record was found for that number.' });
  const maxSends = envNumber('OTP_RATE_LIMIT', 5, 1, 20);
  const recent = await sql`SELECT COUNT(*)::int AS count FROM membership_otp_challenges WHERE official_membership_number = ${membershipNumber} AND created_at > NOW() - (${rateWindowMinutes} * INTERVAL '1 minute')`;
  if (Number(recent.rows[0]?.count || 0) >= maxSends) return json(res, 429, { message: 'Too many verification codes have been requested. Please try again later.' });
  const last = await sql`SELECT created_at FROM membership_otp_challenges WHERE official_membership_number = ${membershipNumber} ORDER BY created_at DESC LIMIT 1`;
  const resendSeconds = envNumber('OTP_RESEND_SECONDS', 60, 15, 3600);
  if (last.rows[0]) {
    const elapsed = Math.floor((Date.now() - new Date(last.rows[0].created_at).getTime()) / 1000);
    if (elapsed < resendSeconds) return json(res, 429, { message: `Please wait ${resendSeconds - elapsed} seconds before requesting another code.` });
  }
  const challengeId = crypto.randomUUID();
  const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
  const ttlMinutes = envNumber('OTP_TTL_MINUTES', 10, 2, 30);
  const maxAttempts = envNumber('OTP_MAX_ATTEMPTS', 5, 3, 10);
  await sql`UPDATE membership_otp_challenges SET consumed_at = NOW() WHERE official_membership_number = ${membershipNumber} AND consumed_at IS NULL`;
  await sql`INSERT INTO membership_otp_challenges (id, official_membership_number, target_email, code_hash, max_attempts, expires_at) VALUES (${challengeId}, ${membershipNumber}, ${record.email}, ${hashWithSecret('otp', `${challengeId}:${code}`)}, ${maxAttempts}, NOW() + (${ttlMinutes} * INTERVAL '1 minute'))`;
  try {
    await sendOtpEmail({ to: record.email, code, expiresMinutes: ttlMinutes });
  } catch (error) {
    await sql`DELETE FROM membership_otp_challenges WHERE id = ${challengeId}`;
    console.error('membership OTP email failed', error);
    return json(res, 503, { message: 'The verification email could not be sent. Check the local SMTP/Mailpit configuration and try again.' });
  }
  return json(res, 200, { ok: true, status: 'OTP_SENT', challengeId, maskedContact: maskEmail(record.email), expiresInSeconds: ttlMinutes * 60, message: `A verification code was sent to ${maskEmail(record.email)}.` });
};

const verifyOtp = async (req, res, membershipNumber, body) => {
  if (!allowed(req, 'setup-otp-verify', 15, 15 * 60 * 1000)) return json(res, 429, { message: 'Too many code attempts. Please request a new code later.' });
  const challengeId = text(body.challengeId, 80); const code = String(body.code || '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(challengeId) || !codePattern.test(code)) return json(res, 422, { message: 'Enter the six-digit verification code.' });
  const challenge = await sql`UPDATE membership_otp_challenges SET attempts = attempts + 1 WHERE id = ${challengeId} AND official_membership_number = ${membershipNumber} AND consumed_at IS NULL AND verified_at IS NULL AND expires_at > NOW() AND attempts < max_attempts RETURNING *`;
  if (!challenge.rows[0]) return json(res, 400, { message: 'This code is expired, already used or no longer available. Request a new code.' });
  const row = challenge.rows[0];
  if (!sameHash(row.code_hash, hashWithSecret('otp', `${challengeId}:${code}`))) {
    const remaining = Math.max(0, Number(row.max_attempts) - Number(row.attempts));
    return json(res, 401, { message: remaining ? `That code is not correct. ${remaining} attempt(s) remaining.` : 'That code is not correct. Request a new code.' });
  }
  const marked = await sql`UPDATE membership_otp_challenges SET verified_at = NOW(), consumed_at = NOW() WHERE id = ${challengeId} AND verified_at IS NULL AND consumed_at IS NULL RETURNING id`;
  if (!marked.rows[0]) return json(res, 400, { message: 'This code has already been used. Request a new code.' });
  const setupToken = crypto.randomBytes(32).toString('hex');
  const tokenMinutes = envNumber('OTP_TTL_MINUTES', 10, 2, 30);
  await sql`INSERT INTO membership_setup_tokens (id, official_membership_number, token_hash, expires_at) VALUES (${crypto.randomUUID()}, ${membershipNumber}, ${hashWithSecret('setup-token', setupToken)}, NOW() + (${tokenMinutes} * INTERVAL '1 minute'))`;
  return json(res, 200, { ok: true, status: 'VERIFIED', setupToken, message: 'Ownership verified. Create your MY YANGA password.' });
};

const createPassword = async (res, membershipNumber, body) => {
  const setupToken = text(body.setupToken, 160); const password = String(body.password || '');
  if (setupToken.length < 32 || password.length < 8 || password.length > 200) return json(res, 422, { message: 'Use the verified setup session and a password of at least 8 characters.' });
  const tokenResult = await sql`SELECT id FROM membership_setup_tokens WHERE official_membership_number = ${membershipNumber} AND token_hash = ${hashWithSecret('setup-token', setupToken)} AND consumed_at IS NULL AND expires_at > NOW() LIMIT 1`;
  if (!tokenResult.rows[0]) return json(res, 400, { message: 'Your verification session has expired. Start account setup again.' });
  const record = await setupRecord(membershipNumber);
  if (!record) return json(res, 403, { message: 'The authorized membership record could not be confirmed.' });
  const passwordHash = await bcrypt.hash(password, 12);
  const parts = text(record.fullName || 'Yanga Member', 180).split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || 'Yanga'; const lastName = parts.pop() || 'Member'; const middleName = parts.join(' ') || null;
  const existing = await sql`SELECT id FROM membership_users WHERE official_membership_number = ${membershipNumber} OR (LOWER(email) = ${record.email} AND official_membership_number IS NULL) ORDER BY CASE WHEN official_membership_number = ${membershipNumber} THEN 0 ELSE 1 END LIMIT 1`;
  const userId = existing.rows[0]?.id || crypto.randomUUID();
  if (existing.rows[0]) {
    await sql`UPDATE membership_users SET first_name = ${firstName}, middle_name = ${middleName}, last_name = ${lastName}, email = ${record.email}, phone = ${record.phone || ''}, password_hash = ${passwordHash}, official_membership_number = ${membershipNumber} WHERE id = ${userId}`;
  } else {
    await sql`INSERT INTO membership_users (id, first_name, middle_name, last_name, email, phone, password_hash, auth_account_reference, official_membership_number) VALUES (${userId}, ${firstName}, ${middleName}, ${lastName}, ${record.email}, ${record.phone || ''}, ${passwordHash}, ${`member-${crypto.randomUUID()}`}, ${membershipNumber})`;
  }
  await sql`UPDATE membership_applications SET membership_status = 'ACTIVE', application_status = 'APPROVED' WHERE user_id = ${userId}`;
  await sql`UPDATE membership_setup_tokens SET consumed_at = NOW() WHERE id = ${tokenResult.rows[0].id} AND consumed_at IS NULL`;
  return json(res, 200, { ok: true, status: 'ACCOUNT_READY', membershipNumber, message: 'Your MY YANGA account is ready. You can now sign in with your official membership number and password.' });
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return method(res, 'POST');
  try {
    const body = await readBody(req); const membershipNumber = normaliseNumber(body.membershipNumber);
    if (!membershipNumberPattern.test(membershipNumber)) return json(res, 422, { message: 'Enter your official membership number in the format shown on your membership record.' });
    if (body.action === 'lookup') {
      if (!allowed(req, 'setup-lookup', 20, 15 * 60 * 1000)) return json(res, 429, { message: 'Too many lookup attempts. Please try again later.' });
      const record = await setupRecord(membershipNumber);
      return json(res, record ? 200 : 404, record ? { ok: true, verified: false, verificationAvailable: true, maskedContact: maskEmail(record.email), message: 'The authorized record is ready for ownership verification.' } : { message: 'No active authorized membership record was found for that number.' });
    }
    if (body.action === 'send-otp') return sendOtp(req, res, membershipNumber);
    if (body.action === 'verify-otp') return verifyOtp(req, res, membershipNumber, body);
    if (body.action === 'create-password') return createPassword(res, membershipNumber, body);
    if (body.action === 'staff-request') return json(res, 202, await staffRequest(membershipNumber, text(body.contact, 180) || null));
    return json(res, 422, { message: 'Choose a valid account setup action.' });
  } catch (error) {
    console.error('membership setup failed', error);
    return json(res, 500, { message: 'The account setup service is temporarily unavailable.' });
  }
};
