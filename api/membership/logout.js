const { json, method, cookie } = require('../_lib/http');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return method(res, 'POST');
  return json(res, 200, { ok: true }, { 'Set-Cookie': cookie('ysc_member_session', '', 0) });
};
