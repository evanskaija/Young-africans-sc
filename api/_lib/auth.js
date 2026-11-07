const crypto = require('crypto');
const { sql } = require('./db');

const COOKIE_NAME = 'ysc_member_session';
const SESSION_TTL = 60 * 60 * 8;
const base64url = (value) => Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
const decodeBase64url = (value) => Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
const secret = () => {
  if (!process.env.MEMBERSHIP_SESSION_SECRET || process.env.MEMBERSHIP_SESSION_SECRET.length < 32) throw new Error('MEMBERSHIP_SESSION_SECRET must be configured with at least 32 characters.');
  return process.env.MEMBERSHIP_SESSION_SECRET;
};
const sign = (payload) => base64url(crypto.createHmac('sha256', secret()).update(payload).digest());
const sessionValue = (userId) => { const payload = `${userId}.${Math.floor(Date.now() / 1000) + SESSION_TTL}`; return `${base64url(payload)}.${sign(payload)}`; };
const parseCookies = (req) => Object.fromEntries(String(req.headers.cookie || '').split(';').filter(Boolean).map((item) => { const index = item.indexOf('='); return [item.slice(0, index).trim(), decodeURIComponent(item.slice(index + 1).trim())]; }));
const readSession = (req) => {
  const value = parseCookies(req)[COOKIE_NAME]; if (!value) return null;
  const [encoded, signature] = value.split('.'); if (!encoded || !signature) return null;
  const payload = decodeBase64url(encoded); const expected = sign(payload);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const [userId, expires] = payload.split('.'); if (!userId || Number(expires) < Math.floor(Date.now() / 1000)) return null;
  return userId;
};
const sessionCookie = (userId) => `${COOKIE_NAME}=${sessionValue(userId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL}; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}`;
const clearSessionCookie = () => `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}`;
const safeUser = (row) => ({ id: row.id, firstName: row.first_name, middleName: row.middle_name || '', lastName: row.last_name, email: row.email, phone: row.phone, officialMembershipNumber: row.official_membership_number || null, role: row.role, createdAt: row.created_at });
const categoryNames = { 'category-01': 'Club Membership', 'category-02': 'Supporter Membership', 'category-03': 'Need registration guidance' };
const registrationRouteNames = { 'official-link': 'Official registration instructions', 'staff-guidance': 'Authorized staff guidance' };
const application = (row) => row ? ({
  id: row.id,
  reference: row.application_reference,
  userId: row.user_id,
  fullName: [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(' '),
  email: row.email,
  phone: row.phone,
  category: row.membership_category,
  categoryName: categoryNames[row.membership_category] || row.membership_category,
  dateOfBirth: row.date_of_birth,
  nationality: row.nationality,
  region: row.region,
  district: row.district,
  gender: row.gender || '',
  residentialLocation: row.residential_location || '',
  identificationType: row.identification_type || '',
  identificationTypeName: ({ nida: 'NIDA / NIN (demo)', passport: 'Passport (demo)', 'voter-id': 'Voter ID (demo)', 'drivers-license': 'Driver licence (demo)' })[row.identification_type] || row.identification_type || '',
  identificationNumberMasked: row.identification_number_masked || '',
  identificationDetailsConfirmed: Boolean(row.identification_details_confirmed),
  identificationReason: row.identification_reason || '',
  registrationRoute: row.registration_route || 'staff-guidance',
  registrationRouteName: registrationRouteNames[row.registration_route] || 'Authorized staff guidance',
  membershipStatus: row.membership_status || 'INACTIVE',
  status: row.application_status,
  submittedAt: row.submitted_at
}) : null;
const currentUser = async (req) => { const userId = readSession(req); if (!userId) return null; const result = await sql`SELECT id, first_name, middle_name, last_name, email, phone, official_membership_number, role, created_at FROM membership_users WHERE id = ${userId}`; return result.rows[0] || null; };
const currentApplication = async (userId) => { const result = await sql`SELECT a.*, u.first_name, u.middle_name, u.last_name, u.email, u.phone FROM membership_applications a JOIN membership_users u ON u.id = a.user_id WHERE a.user_id = ${userId} ORDER BY a.submitted_at DESC LIMIT 1`; return application(result.rows[0]); };
const requireUser = async (req, res) => { const user = await currentUser(req); if (!user) { res.statusCode = 401; res.end(JSON.stringify({ message: 'Please sign in to continue.' })); return null; } return user; };
const adminEmails = () => String(process.env.MEMBERSHIP_ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
const requireAdmin = async (req, res) => { const user = await requireUser(req, res); if (!user) return null; if (user.role !== 'admin' && !adminEmails().includes(user.email.toLowerCase())) { res.statusCode = 403; res.end(JSON.stringify({ message: 'Administrator access is required.' })); return null; } return user; };

module.exports = { COOKIE_NAME, sessionCookie, clearSessionCookie, safeUser, application, currentUser, currentApplication, requireUser, requireAdmin };
