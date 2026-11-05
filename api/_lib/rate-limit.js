const buckets = new Map();

const clientKey = (req, scope) => `${scope}:${String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()}`;

const allowed = (req, scope, limit, windowMs) => {
  const key = clientKey(req, scope); const now = Date.now(); const current = buckets.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > current.resetAt) { current.count = 0; current.resetAt = now + windowMs; }
  current.count += 1; buckets.set(key, current);
  return current.count <= limit;
};

module.exports = { allowed };
