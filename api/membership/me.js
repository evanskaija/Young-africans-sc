const { json, method } = require('../_lib/http');
const { safeUser, application, currentUser, currentApplication } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return method(res, 'GET');
  try {
    const user = await currentUser(req); if (!user) return json(res, 401, { message: 'Please sign in to continue.' });
    return json(res, 200, { ok: true, mode: 'server', user: safeUser(user), application: await currentApplication(user.id) });
  } catch (error) { console.error('membership session failed', error); return json(res, 500, { message: 'We could not load your member session.' }); }
};
