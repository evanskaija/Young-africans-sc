const json = (res, status, payload, headers = {}) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(payload));
};

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (error) { return {}; }
};

const method = (res, allowed) => json(res, 405, { message: `Method not allowed. Use ${allowed}.` }, { Allow: allowed });
const cookie = (name, value, maxAge) => `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}`;

module.exports = { json, readBody, method, cookie };
